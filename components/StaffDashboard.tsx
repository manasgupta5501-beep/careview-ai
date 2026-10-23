'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  MessageSquare, 
  CheckCheck, 
  ArrowLeft,
  Filter,
  ShieldAlert,
  Sparkles,
  BedDouble
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { AssistanceRequest, RequestStatus, PatientPreferences } from '@/types';
import { playTVSound } from '@/lib/preferences';

interface StaffDashboardProps {
  preferences: PatientPreferences;
  onNavigateHome: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  preferences,
  onNavigateHome,
}) => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const isHi = preferences.language === 'hi';
  const isHighContrast = preferences.highContrast;

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Failed to load requests:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 8000); // Polling every 8s for live dashboard
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: RequestStatus) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        playTVSound('success');
        fetchRequests();
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleSaveNote = async (id: string) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, staffNotes: noteText })
      });
      if (res.ok) {
        setEditingNoteId(null);
        setNoteText('');
        fetchRequests();
      }
    } catch (e) {
      console.error('Error saving staff note:', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      });
      if (res.ok) {
        playTVSound('select');
        fetchRequests();
      }
    } catch (e) {
      console.error('Error resetting demo requests:', e);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const acknowledgedCount = requests.filter(r => r.status === 'Acknowledged').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Demonstration Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/80 text-amber-200 text-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            {isHi
              ? 'प्रदर्शन डैशबोर्ड: यह पोर्टल अस्पताल कर्मचारियों के लिए रोगी अनुरोधों की समीक्षा प्रदर्शित करता है।'
              : 'Staff Demonstration Portal: Review patient TV assistance calls. No external pager/hospital EHR connected without integration.'}
          </span>
        </div>
        <AccessibleButton
          variant="secondary"
          size="md"
          highContrast={isHighContrast}
          onClick={handleResetDemo}
          className="text-xs whitespace-nowrap px-3 py-1.5"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          <span>{isHi ? 'डेमो रीसेट करें' : 'Reset Demo Queue'}</span>
        </AccessibleButton>
      </div>

      {/* Header and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span className={isHighContrast ? 'text-yellow-300' : 'text-cyan-400'}>
              {isHi ? 'नर्सिंग और स्टाफ डैशबोर्ड' : 'Nursing & Staff Request Board'}
            </span>
          </h2>
          <p className="text-lg text-slate-300 mt-1">
            {isHi
              ? 'मेपल पवेलियन - फ्लोर 4 के लाइव रोगी अनुरोध'
              : 'Live patient requests for Floor 4 (Maple Pavilion)'}
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-2 text-slate-300">
            <span className="text-xs uppercase font-bold text-slate-400">Total:</span>
            <span className="text-xl font-black text-white">{requests.length}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/60 flex items-center gap-2 text-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs uppercase font-bold text-amber-300">Pending:</span>
            <span className="text-xl font-black text-amber-300">{pendingCount}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/60 flex items-center gap-2 text-cyan-200">
            <span className="text-xs uppercase font-bold text-cyan-300">Acknowledged:</span>
            <span className="text-xl font-black text-cyan-300">{acknowledgedCount}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex items-center gap-2 text-emerald-200">
            <span className="text-xs uppercase font-bold text-emerald-300">Resolved:</span>
            <span className="text-xl font-black text-emerald-300">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'pending', 'acknowledged', 'resolved'].map((status) => (
          <AccessibleButton
            key={status}
            variant={filterStatus === status ? 'primary' : 'secondary'}
            size="md"
            highContrast={isHighContrast}
            onClick={() => setFilterStatus(status)}
            className="capitalize px-5 py-2.5 font-bold"
          >
            {status}
          </AccessibleButton>
        ))}

        <AccessibleButton
          variant="outline"
          size="md"
          highContrast={isHighContrast}
          onClick={fetchRequests}
          className="ml-auto gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isHi ? 'रिफ्रेश' : 'Refresh'}</span>
        </AccessibleButton>
      </div>

      {/* Request Cards List */}
      <div className="flex flex-col gap-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-800/40 border border-slate-700/80">
            <CheckCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-white">
              {isHi ? 'कोई लंबित अनुरोध नहीं है' : 'No requests in this queue'}
            </h4>
            <p className="text-slate-400 text-sm mt-1">
              {isHi
                ? 'सभी अनुरोध पूरे हो चुके हैं।'
                : 'All patient assistance requests have been addressed.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'Pending';
            const isAck = req.status === 'Acknowledged';
            const isRes = req.status === 'Resolved';
            const isUrgent = req.priority === 'urgent';

            return (
              <div
                key={req.id}
                className={`p-6 rounded-3xl border-2 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isUrgent
                    ? 'bg-rose-950/40 border-rose-500/80'
                    : isPending
                    ? 'bg-amber-950/30 border-amber-500/60'
                    : isHighContrast
                    ? 'bg-black border-yellow-300 text-white'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                {/* Left: Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
                      {req.id}
                    </span>

                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base">
                      <BedDouble className="w-4 h-4 text-cyan-400" />
                      <span>{req.roomNumber}</span>
                    </span>

                    <span className="text-slate-300 font-medium text-base">
                      {req.patientName || 'Inpatient'}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : isAck
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {req.status}
                    </span>

                    {isUrgent && (
                      <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-full bg-rose-600 text-white animate-bounce">
                        Urgent
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {req.category}
                  </h3>

                  <p className="text-base sm:text-lg text-slate-200 font-medium">
                    {req.description}
                  </p>

                  {/* Staff Notes */}
                  {req.staffNotes && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-cyan-200 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        <strong>Staff Note:</strong> {req.staffNotes}
                      </span>
                    </div>
                  )}

                  {/* Inline Note Editor */}
                  {editingNoteId === req.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add staff update note (e.g. Nurse Maria attending)..."
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-cyan-400"
                      />
                      <AccessibleButton
                        variant="primary"
                        size="md"
                        highContrast={isHighContrast}
                        onClick={() => handleSaveNote(req.id)}
                      >
                        Save
                      </AccessibleButton>
                      <AccessibleButton
                        variant="secondary"
                        size="md"
                        highContrast={isHighContrast}
                        onClick={() => setEditingNoteId(null)}
                      >
                        Cancel
                      </AccessibleButton>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 shrink-0">
                  {isPending && (
                    <AccessibleButton
                      variant="primary"
                      size="md"
                      highContrast={isHighContrast}
                      onClick={() => handleUpdateStatus(req.id, 'Acknowledged')}
                      className="gap-2 text-base font-bold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Acknowledge</span>
                    </AccessibleButton>
                  )}

                  {!isRes && (
                    <AccessibleButton
                      variant="secondary"
                      size="md"
                      highContrast={isHighContrast}
                      onClick={() => handleUpdateStatus(req.id, 'Resolved')}
                      className="gap-2 text-base font-bold bg-emerald-800/80 hover:bg-emerald-700 text-white border-emerald-600"
                    >
                      <CheckCheck className="w-5 h-5 text-emerald-300" />
                      <span>Mark Resolved</span>
                    </AccessibleButton>
                  )}

                  {editingNoteId !== req.id && (
                    <AccessibleButton
                      variant="outline"
                      size="md"
                      highContrast={isHighContrast}
                      onClick={() => {
                        setEditingNoteId(req.id);
                        setNoteText(req.staffNotes || '');
                      }}
                      className="text-xs py-2"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span>{req.staffNotes ? 'Edit Note' : 'Add Note'}</span>
                    </AccessibleButton>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
