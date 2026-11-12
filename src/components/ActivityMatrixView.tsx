import React, { useState } from 'react';
import { LearningSession } from '../types';

interface ActivityMatrixViewProps {
  sessions: LearningSession[];
  onBackToDashboard: () => void;
  onOpenRecordModal: () => void;
}

export const ActivityMatrixView: React.FC<ActivityMatrixViewProps> = ({
  sessions,
  onBackToDashboard,
  onOpenRecordModal,
}) => {
  const [selectedCellDate, setSelectedCellDate] = useState<string | null>(null);

  // Group minutes by date
  const dateMinutesMap = new Map<string, number>();
  const dateSessionsMap = new Map<string, LearningSession[]>();

  sessions.forEach(s => {
    dateMinutesMap.set(s.date, (dateMinutesMap.get(s.date) || 0) + s.durationMinutes);
    const list = dateSessionsMap.get(s.date) || [];
    list.push(s);
    dateSessionsMap.set(s.date, list);
  });

  // Generate 52 weeks of dates leading up to today
  const generateWeeks = () => {
    const weeks: { dateStr: string; minutes: number; dayOfWeek: number }[][] = [];
    const endDate = new Date();
    
    // Find the following Sunday or end of week to align grid
    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    // Adjust start to previous Monday
    const startDay = (startDate.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - startDay);

    const curr = new Date(startDate);
    let currentWeek: { dateStr: string; minutes: number; dayOfWeek: number }[] = [];

    while (curr <= endDate || currentWeek.length > 0) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = (curr.getDay() + 6) % 7; // Mon=0 .. Sun=6

      const minutes = dateMinutesMap.get(dateStr) || 0;
      currentWeek.push({ dateStr, minutes, dayOfWeek });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
      if (curr > endDate && currentWeek.length === 0) break;
    }

    return weeks;
  };

  const weeks = generateWeeks();

  // Heatmap intensity color
  const getCellColor = (minutes: number) => {
    if (minutes === 0) return 'bg-[#181f2a] border border-[#222a36]';
    if (minutes < 30) return 'bg-[#00f5a0]/30 border border-[#00f5a0]/40';
    if (minutes < 60) return 'bg-[#00f5a0]/60 border border-[#00f5a0]/70';
    if (minutes < 90) return 'bg-[#00f5a0] border border-[#50ffaf] shadow-[0_0_6px_rgba(0,245,160,0.5)]';
    return 'bg-[#50ffaf] border border-white shadow-[0_0_10px_rgba(80,255,175,0.8)]';
  };

  const selectedSessions = selectedCellDate ? dateSessionsMap.get(selectedCellDate) || [] : [];
  const selectedMinutes = selectedCellDate ? dateMinutesMap.get(selectedCellDate) || 0 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#131821] border border-[#222a36]">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer mr-1"
              title="Return to Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="text-[1.25rem] font-bold text-white">Engineering Activity Matrix</span>
            <span className="px-2 py-0.5 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/20 text-[#00f5a0] text-[0.6875rem] font-mono">
              Annual Heatmap
            </span>
          </div>
          <p className="text-[0.875rem] text-slate-400 mt-1">
            Complete high-resolution timeline of study velocity, consistency spikes, and practice density.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-1.5 rounded-lg bg-[#0e141b] hover:bg-[#181f2a] border border-[#222a36] text-slate-300 hover:text-white text-[0.875rem] transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
          <button
            onClick={onOpenRecordModal}
            className="px-3.5 py-1.5 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.875rem] hover:brightness-110 shadow-md cursor-pointer"
          >
            + Record Session
          </button>
        </div>
      </div>

      {/* Heatmap Matrix Card */}
      <div className="p-6 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">grid_view</span>
            <h4 className="text-[1rem] text-white font-semibold">52-Week Cadence Matrix</h4>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-slate-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-[#181f2a] border border-[#222a36]" />
            <div className="w-3 h-3 rounded-sm bg-[#00f5a0]/30 border border-[#00f5a0]/40" />
            <div className="w-3 h-3 rounded-sm bg-[#00f5a0]/60 border border-[#00f5a0]/70" />
            <div className="w-3 h-3 rounded-sm bg-[#00f5a0] border border-[#50ffaf]" />
            <div className="w-3 h-3 rounded-sm bg-[#50ffaf] border border-white" />
            <span>More</span>
          </div>
        </div>

        {/* Matrix Grid Container */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex flex-col gap-1 min-w-[760px]">
            {/* Days of week rows */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayLabel, dayIndex) => (
              <div key={dayLabel} className="flex items-center gap-1.5">
                <span className="w-7 text-[0.625rem] text-slate-500 font-mono text-right mr-1">
                  {dayIndex % 2 === 0 ? dayLabel : ''}
                </span>
                <div className="flex items-center gap-1">
                  {weeks.map((week, wIndex) => {
                    const dayItem = week[dayIndex];
                    if (!dayItem) return <div key={wIndex} className="w-3 h-3 opacity-0" />;

                    const isSelected = selectedCellDate === dayItem.dateStr;

                    return (
                      <button
                        key={dayItem.dateStr}
                        onClick={() => setSelectedCellDate(dayItem.dateStr)}
                        className={`w-3 h-3 rounded-xs cursor-pointer transition-transform hover:scale-125 ${getCellColor(
                          dayItem.minutes
                        )} ${isSelected ? 'ring-2 ring-white scale-125 z-10' : ''}`}
                        title={`${dayItem.dateStr}: ${dayItem.minutes} mins`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Inspector */}
        {selectedCellDate && (
          <div className="p-4 rounded-xl bg-[#0e141b] border border-[#222a36] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] flex items-center justify-center font-mono font-bold">
                {selectedMinutes}m
              </div>
              <div>
                <div className="text-[0.9375rem] font-semibold text-white">
                  {selectedCellDate} Cadence Breakdown
                </div>
                <div className="text-[0.75rem] text-slate-400">
                  {selectedSessions.length > 0
                    ? `${selectedSessions.length} session(s) logged: ${selectedSessions.map(s => s.title).join(', ')}`
                    : 'Rest day / No sessions recorded'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCellDate(null)}
              className="text-[0.75rem] text-slate-400 hover:text-white font-mono self-start sm:self-center"
            >
              Clear Inspector
            </button>
          </div>
        )}
      </div>

      {/* Cadence Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] text-slate-400 uppercase font-mono">
              Weekday Consistency
            </span>
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">insights</span>
          </div>
          <div className="my-3">
            <span className="text-[2rem] font-bold text-white font-mono">92.4%</span>
          </div>
          <span className="text-[0.75rem] text-slate-400">
            Consistently active across Monday through Friday sprints
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] text-slate-400 uppercase font-mono">
              Weekend Practice Ratio
            </span>
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">weekend</span>
          </div>
          <div className="my-3">
            <span className="text-[2rem] font-bold text-white font-mono">78.1%</span>
          </div>
          <span className="text-[0.75rem] text-slate-400">
            High retention rate during Saturday and Sunday deep sessions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] text-slate-400 uppercase font-mono">
              Average Sprint Duration
            </span>
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">timer</span>
          </div>
          <div className="my-3">
            <span className="text-[2rem] font-bold text-[#00f5a0] font-mono">65.2 min</span>
          </div>
          <span className="text-[0.75rem] text-slate-400">
            Exceeds standard 60-minute target baseline by +8.6%
          </span>
        </div>
      </div>
    </div>
  );
};
