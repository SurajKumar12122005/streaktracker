import React, { useState } from 'react';
import { LearningSession } from '../types';
import { getTodayStr } from '../utils/dateUtils';

interface CalendarCardProps {
  sessions: LearningSession[];
  onSelectDate: (dateStr: string) => void;
  onOpenRecordForDate: (dateStr: string) => void;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  sessions,
  onSelectDate,
  onOpenRecordForDate,
}) => {
  const now = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = getTodayStr();

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonthIndex(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonthIndex(m => m + 1);
    }
  };

  const handleResetToToday = () => {
    const today = new Date();
    setCurrentMonthIndex(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Determine days in month and starting day of week
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  // In JS, getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // We want Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const firstDayRaw = new Date(currentYear, currentMonthIndex, 1).getDay();
  const startDayOffset = (firstDayRaw + 6) % 7; // Monday offset

  // Build dates lookup for practiced days
  const practicedDatesMap = new Map<string, LearningSession[]>();
  sessions.forEach(s => {
    const list = practicedDatesMap.get(s.date) || [];
    list.push(s);
    practicedDatesMap.set(s.date, list);
  });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl bg-[#131821] border border-[#222a36] p-4 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f5a0] text-[24px]">
              calendar_month
            </span>
            <h3 className="text-[1.25rem] text-white font-semibold">
              {monthNames[currentMonthIndex]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#181f2a] text-slate-400 hover:text-white transition-colors border border-transparent hover:border-[#2a3240] cursor-pointer"
              title="Previous Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={handleResetToToday}
              className="text-[0.6875rem] font-semibold uppercase px-2 text-slate-300 hover:text-[#00f5a0] font-mono cursor-pointer transition-colors"
              title="Click to jump to Today"
            >
              {monthNames[currentMonthIndex].slice(0, 3)} '{String(currentYear).slice(2)}
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#181f2a] text-slate-400 hover:text-white transition-colors border border-transparent hover:border-[#2a3240] cursor-pointer"
              title="Next Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 sm:mb-2 text-center text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-semibold font-mono">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[0.75rem] sm:text-[0.8125rem] font-mono">
          {/* Leading spacers */}
          {Array.from({ length: startDayOffset }).map((_, idx) => (
            <div key={`spacer-${idx}`} className="h-8 sm:h-10 rounded-lg opacity-10" />
          ))}

          {/* Days */}
          {daysArray.map(dayNum => {
            const monthStr = String(currentMonthIndex + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            const daySessions = practicedDatesMap.get(dateStr) || [];
            const isPracticed = daySessions.length > 0;

            if (isToday) {
              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className="h-8 sm:h-10 rounded-lg bg-[#00f5a0] text-black flex flex-col items-center justify-center font-bold shadow-[0_0_16px_rgba(0,245,160,0.4)] relative ring-2 ring-[#00f5a0]/40 cursor-pointer active:scale-95 transition-transform"
                  title={`Today: ${dateStr} (${daySessions.length} sessions)`}
                >
                  <span className="leading-tight text-[0.75rem] sm:text-[0.8125rem]">{dayNum}</span>
                  <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-black mt-0.5"></span>
                </button>
              );
            }

            if (isFuture) {
              return (
                <button
                  key={dateStr}
                  onClick={() => onOpenRecordForDate(dateStr)}
                  className="h-8 sm:h-10 rounded-lg text-slate-500 flex flex-col items-center justify-center hover:bg-[#181f2a]/60 hover:text-slate-300 transition-colors cursor-pointer text-[0.75rem] sm:text-[0.8125rem]"
                  title={`Future date: ${dateStr} (click to plan ahead)`}
                >
                  <span>{dayNum}</span>
                </button>
              );
            }

            if (isPracticed) {
              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className="h-8 sm:h-10 rounded-lg bg-[#181f2a] border border-[#2a3240] text-slate-200 flex flex-col items-center justify-center font-semibold relative group cursor-pointer hover:border-[#00f5a0]/50 transition-colors text-[0.75rem] sm:text-[0.8125rem]"
                  title={`${dateStr}: Practiced (${daySessions.length} session${daySessions.length === 1 ? '' : 's'})`}
                >
                  <span className="leading-tight">{dayNum}</span>
                  <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#00f5a0] mt-0.5"></span>
                </button>
              );
            }

            // Missed day in the past
            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className="h-8 sm:h-10 rounded-lg bg-[#0e141b]/60 border border-[#1b222d] text-slate-500 flex flex-col items-center justify-center relative group cursor-pointer hover:bg-[#181f2a] transition-colors text-[0.75rem] sm:text-[0.8125rem]"
                title={`${dateStr}: Missed (click to backfill)`}
              >
                <span className="leading-tight">{dayNum}</span>
                <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-700 mt-0.5"></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Status Legend */}
      <div className="pt-3 mt-4 bg-[#0e141b] border border-[#222a36] p-2.5 rounded-xl flex items-center justify-around flex-wrap gap-2 text-slate-400 text-[0.6875rem] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f5a0]"></span>
          <span className="text-slate-300">Practiced</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#00f5a0] text-black inline-flex items-center justify-center text-[8px] font-bold">
            24
          </span>
          <span className="text-slate-300">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#181f2a] border border-slate-700"></span>
          <span>Future</span>
        </div>
      </div>
    </div>
  );
};
