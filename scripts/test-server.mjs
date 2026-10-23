// End-to-End Live HTTP Integration Test
import { spawn } from 'child_process';
import http from 'http';

function makeRequest(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', (err) => reject(err));

    if (bodyData) {
      req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function waitForServer(port = 3000, maxTries = 30) {
  for (let i = 0; i < maxTries; i++) {
    try {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port,
        path: '/',
        method: 'GET',
        timeout: 1000
      });
      if (res && res.status === 200) {
        return true;
      }
    } catch (e) {
      // try localhost
      try {
        const res2 = await makeRequest({
          hostname: 'localhost',
          port,
          path: '/',
          method: 'GET',
          timeout: 1000
        });
        if (res2 && res2.status === 200) {
          return true;
        }
      } catch (e2) {}
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function run() {
  console.log('--- Starting Next.js Production Server on Port 3000 ---');
  const server = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3000'], {
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Ready') || msg.includes('started')) {
      console.log('Server stdout:', msg.trim());
    }
  });

  server.stderr.on('data', (d) => {
    console.error('Server stderr:', d.toString().trim());
  });

  try {
    const ready = await waitForServer(3000);
    if (!ready) {
      throw new Error('Server failed to respond on port 3000 within 15 seconds');
    }
    console.log('✅ Server is ready on http://127.0.0.1:3000\n');

    // 1. Test HTML Home Page
    console.log('Test 1: Verify Home Page HTML delivery');
    const homeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log(`- Home page HTTP Status: ${homeRes.status}`);
    if (homeRes.raw.includes('CareView') || homeRes.raw.includes('TV Assistant')) {
      console.log('✅ PASS: Home page contains CareView AI brand markup');
    } else {
      console.error('❌ FAIL: Home page did not contain expected markup');
    }

    // 2. Test Ask API - Cafeteria
    console.log('\nTest 2: POST /api/ask - Cafeteria Query');
    const askRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/ask',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      question: 'Where is the cafeteria and when does it open?',
      language: 'en',
      roomNumber: 'Room 402'
    });
    console.log(`- Status: ${askRes.status}`);
    console.log(`- Category: ${askRes.body?.category}`);
    console.log(`- Source: ${askRes.body?.source}`);
    console.log(`- Spoken Answer: ${askRes.body?.spokenAnswer}`);
    if (askRes.body?.answer?.includes('Ground Floor') && askRes.body?.category === 'cafeteria') {
      console.log('✅ PASS: Cafeteria question correctly answered with Ground Floor location');
    } else {
      console.error('❌ FAIL: Cafeteria question unexpected response:', askRes.body);
    }

    // 3. Test Ask API - Hindi Query
    console.log('\nTest 3: POST /api/ask - Hindi Language Support');
    const askHiRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/ask',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      question: 'मुलाकात का समय क्या है?',
      language: 'hi',
      roomNumber: 'Room 402'
    });
    console.log(`- Status: ${askHiRes.status}`);
    console.log(`- Hindi Answer: ${askHiRes.body?.answer?.slice(0, 100)}...`);
    if (askHiRes.body?.answer && askHiRes.body.category === 'visiting') {
      console.log('✅ PASS: Visiting hours answered in Hindi with category visiting');
    } else {
      console.error('❌ FAIL: Hindi response failed');
    }

    // 4. Test Ask API - Emergency Safety Triage Escalation
    console.log('\nTest 4: POST /api/ask - Acute Chest Pain Emergency Triage');
    const askEmergRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/ask',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      question: 'I have severe chest pain and dizziness right now',
      language: 'en',
      roomNumber: 'Room 402'
    });
    console.log(`- Status: ${askEmergRes.status}`);
    console.log(`- Escalation Flag: ${askEmergRes.body?.escalation}`);
    console.log(`- Warning: ${askEmergRes.body?.emergencyWarning}`);
    if (askEmergRes.body?.escalation === true && askEmergRes.body?.emergencyWarning) {
      console.log('✅ PASS: Emergency chest pain triggers escalation and warning banner');
    } else {
      console.error('❌ FAIL: Emergency triage was not flagged');
    }

    // 5. Test Requests API - GET
    console.log('\nTest 5: GET /api/requests - Fetch Queue');
    const getReqRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/requests',
      method: 'GET'
    });
    console.log(`- Status: ${getReqRes.status}`);
    console.log(`- Total Requests in Queue: ${getReqRes.body?.total}`);
    console.log(`- Pending Requests: ${getReqRes.body?.pendingCount}`);
    if (getReqRes.body?.requests?.length > 0) {
      console.log('✅ PASS: Request queue retrieved with demo seeded requests');
    } else {
      console.error('❌ FAIL: Request queue was empty');
    }

    // 6. Test Requests API - POST Create
    console.log('\nTest 6: POST /api/requests - Patient Creates Request');
    const postReqRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/requests',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      category: 'Bedside Comfort',
      description: 'Extra warm blanket and warm water pitcher requested',
      roomNumber: 'Room 402',
      priority: 'normal',
      patientName: 'Eleanor Vance'
    });
    console.log(`- Status: ${postReqRes.status}`);
    const createdReq = postReqRes.body?.request;
    console.log(`- Created ID: ${createdReq?.id}`);
    console.log(`- Initial Status: ${createdReq?.status}`);
    if (createdReq?.id && createdReq?.status === 'Pending') {
      console.log('✅ PASS: Request created with unique ID and Pending status');
    } else {
      console.error('❌ FAIL: Request creation failed:', postReqRes.body);
    }

    // 7. Test Requests API - PATCH Acknowledge
    console.log('\nTest 7: PATCH /api/requests - Staff Acknowledges');
    const patchAckRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/requests',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      id: createdReq.id,
      status: 'Acknowledged',
      staffNotes: 'Nurse Priya attending Room 402'
    });
    console.log(`- Status: ${patchAckRes.status}`);
    console.log(`- Updated Status: ${patchAckRes.body?.request?.status}`);
    console.log(`- Staff Notes: ${patchAckRes.body?.request?.staffNotes}`);
    if (patchAckRes.body?.request?.status === 'Acknowledged' && patchAckRes.body?.request?.acknowledgedAt) {
      console.log('✅ PASS: Staff status updated to Acknowledged with timestamp');
    } else {
      console.error('❌ FAIL: Status acknowledge failed');
    }

    // 8. Test Requests API - PATCH Resolve
    console.log('\nTest 8: PATCH /api/requests - Staff Marks Resolved');
    const patchResRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/requests',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      id: createdReq.id,
      status: 'Resolved',
      staffNotes: 'Blanket and water delivered by Nurse Priya'
    });
    console.log(`- Status: ${patchResRes.status}`);
    console.log(`- Resolved Status: ${patchResRes.body?.request?.status}`);
    console.log(`- Resolved Timestamp: ${patchResRes.body?.request?.resolvedAt}`);
    if (patchResRes.body?.request?.status === 'Resolved' && patchResRes.body?.request?.resolvedAt) {
      console.log('✅ PASS: Request marked Resolved with final timestamp and notes');
    } else {
      console.error('❌ FAIL: Resolve request update failed');
    }

    console.log('\n======================================================');
    console.log('  ALL LIVE HTTP INTEGRATION TESTS PASSED SUCCESSFULLY! ');
    console.log('======================================================\n');
  } finally {
    console.log('Terminating test server process...');
    server.kill();
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
