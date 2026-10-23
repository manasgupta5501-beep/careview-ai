import { NextRequest, NextResponse } from 'next/server';
import { getRequests, createRequest, updateRequest, resetDemoRequests } from '@/lib/requestStore';
import { RequestStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = getRequests();
    return NextResponse.json({
      requests: list,
      total: list.length,
      pendingCount: list.filter(r => r.status === 'Pending').length,
      isDemoMode: true
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching requests';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, description, roomNumber, priority, patientName } = body;

    if (!category || !description) {
      return NextResponse.json(
        { error: 'Category and description are required for assistance request.' },
        { status: 400 }
      );
    }

    const newReq = createRequest({
      category: String(category).trim(),
      description: String(description).trim(),
      roomNumber: roomNumber ? String(roomNumber).trim() : 'Room 402',
      priority: priority === 'urgent' ? 'urgent' : 'normal',
      patientName: patientName ? String(patientName).trim() : 'Eleanor Vance'
    });

    return NextResponse.json({
      success: true,
      request: newReq,
      message: 'Request logged in hospital assistance queue (Demo).'
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, staffNotes, reset } = body;

    if (reset) {
      resetDemoRequests();
      return NextResponse.json({ success: true, message: 'Demo requests reset to defaults.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const updated = updateRequest(id, {
      status: status as RequestStatus | undefined,
      staffNotes: typeof staffNotes === 'string' ? staffNotes.trim() : undefined
    });

    if (!updated) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      request: updated
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
