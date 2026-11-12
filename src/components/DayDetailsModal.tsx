import React from 'react';
import { LearningSession } from '../types';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  sessions: LearningSession[];
  onAddSessionForDay: (dateStr: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  onEditSession?: (session: LearningSession) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  sessions,
  onAddSessionForDay,
  onDeleteSession,
  onEditSession,
}) => {
  if (!isOpen) return null;

  const daySessions = sessions.filter(s => s.date === dateStr);
  const totalDayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Format date display
  const formatDateTitle = (d: string) => {
    try {
      const parts = d.split('-');
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">
              event_available
            </span>
            <div>
              <h3 className="text-[1.125rem] font-semibold">{formatDateTitle(dateStr)}</h3>
              <span className="text-[0.75rem] text-slate-400 font-mono">
                {totalDayMinutes} minutes logged across {daySessions.length} session{daySessions.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {daySessions.length > 0 ? (
            daySessions.map(s => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-[#0e141b] border border-[#222a36] flex flex-col gap-1.5 group hover:border-[#2a3240] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-[0.875rem]">{s.title}</span>
                    <span className="text-[0.6875rem] font-mono text-[#00f5a0] px-2 py-0.5 rounded bg-[#00f5a0]/10 border border-[#00f5a0]/20">
                      {s.durationMinutes}m
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {onEditSession && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditSession(s);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-[#00f5a0] hover:bg-[#181f2a] transition-colors cursor-pointer"
                        title="Edit session"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    )}
                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => onDeleteSession(s.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[0.75rem] text-slate-400">
                  <span className="text-slate-300 font-mono font-medium">{s.category}</span>
                  {s.notes && <span className="truncate">• {s.notes}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-[0.875rem]">
              No sessions recorded on this day.
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222a36]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] text-[0.875rem]"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onAddSessionForDay(dateStr);
            }}
            className="px-4 py-2 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.875rem] flex items-center gap-1.5 cursor-pointer hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Record on this date</span>
          </button>
        </div>
      </div>
    </div>
  );
};
