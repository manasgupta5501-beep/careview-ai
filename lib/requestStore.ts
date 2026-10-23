import { AssistanceRequest } from '@/types';

// In-memory demo requests store (persists during server lifetime)
let requestsStore: AssistanceRequest[] = [
  {
    id: "REQ-4021",
    roomNumber: "Room 402",
    patientName: "Eleanor Vance",
    category: "Bedside Comfort",
    description: "Extra warm blanket and pillow requested for evening rest.",
    priority: "normal",
    status: "Pending",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
  },
  {
    id: "REQ-4019",
    roomNumber: "Room 408",
    patientName: "Harold Jenkins",
    category: "Mobility Assistance",
    description: "Assistance requested for bathroom transfer.",
    priority: "urgent",
    status: "Acknowledged",
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    staffNotes: "Nurse Priya en route with walking aid."
  },
  {
    id: "REQ-4015",
    roomNumber: "Room 312",
    patientName: "Rajesh Sharma",
    category: "Hydration",
    description: "Fresh warm drinking water pitcher requested.",
    priority: "normal",
    status: "Resolved",
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    staffNotes: "Water pitcher delivered and refilled by nursing aide."
  }
];

export function getRequests(): AssistanceRequest[] {
  return [...requestsStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function createRequest(data: {
  roomNumber?: string;
  category: string;
  description: string;
  priority?: 'normal' | 'urgent';
  patientName?: string;
}): AssistanceRequest {
  const newReq: AssistanceRequest = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    roomNumber: data.roomNumber || "Room 402",
    patientName: data.patientName || "Eleanor Vance",
    category: data.category,
    description: data.description,
    priority: data.priority || "normal",
    status: "Pending",
    timestamp: new Date().toISOString()
  };

  requestsStore.unshift(newReq);
  return newReq;
}

export function updateRequest(id: string, updates: {
  status?: 'Pending' | 'Acknowledged' | 'Resolved';
  staffNotes?: string;
}): AssistanceRequest | null {
  const req = requestsStore.find(r => r.id === id);
  if (!req) return null;

  if (updates.status) {
    req.status = updates.status;
    if (updates.status === 'Acknowledged' && !req.acknowledgedAt) {
      req.acknowledgedAt = new Date().toISOString();
    } else if (updates.status === 'Resolved' && !req.resolvedAt) {
      req.resolvedAt = new Date().toISOString();
    }
  }

  if (updates.staffNotes !== undefined) {
    req.staffNotes = updates.staffNotes;
  }

  return req;
}

export function resetDemoRequests(): void {
  requestsStore = [
    {
      id: "REQ-4021",
      roomNumber: "Room 402",
      patientName: "Eleanor Vance",
      category: "Bedside Comfort",
      description: "Extra warm blanket and pillow requested for evening rest.",
      priority: "normal",
      status: "Pending",
      timestamp: new Date().toISOString(),
    },
    {
      id: "REQ-4019",
      roomNumber: "Room 408",
      patientName: "Harold Jenkins",
      category: "Mobility Assistance",
      description: "Assistance requested for bathroom transfer.",
      priority: "urgent",
      status: "Acknowledged",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      staffNotes: "Nurse Priya en route with walking aid."
    }
  ];
}
