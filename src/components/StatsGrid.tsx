import React from 'react';

interface StatsGridProps {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalHours: string;
  totalMinutes: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  remainingMinutes: number;
  todaySessionsCount: number;
  onEditGoal: () => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  currentStreak,
  longestStreak,
  totalDays,
  totalHours,
  totalMinutes,
  todayMinutes,
  dailyGoalMinutes,
  remainingMinutes,
  todaySessionsCount,
  onEditGoal,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-4">
      {/* Stat 1: Current Streak */}
      <div className="rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between group hover:border-[#00f5a0]/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Current Streak
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[#00f5a0] text-[16px] sm:text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-white tracking-tight font-mono leading-none">
              {currentStreak}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">Days</span>
          </div>
        </div>
        {todayMinutes > 0 ? (
          <div className="flex items-center gap-1 text-[#00f5a0] text-[0.625rem] sm:text-[0.6875rem] font-mono bg-[#00f5a0]/10 border border-[#00f5a0]/20 px-1.5 py-0.5 rounded w-fit truncate">
            <span className="material-symbols-outlined text-[13px] shrink-0">check_circle</span>
            <span className="truncate">Practiced today!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-400 text-[0.625rem] sm:text-[0.6875rem] font-mono bg-[#181f2a] border border-[#2a3240] px-1.5 py-0.5 rounded w-fit truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></span>
            <span className="truncate">Ready for Day 1</span>
          </div>
        )}
      </div>

      {/* Stat 2: Longest Streak */}
      <div className="rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Longest Streak
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[16px] sm:text-[18px]">emoji_events</span>
          </div>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-white tracking-tight font-mono leading-none">
              {longestStreak}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">Days</span>
          </div>
        </div>
        <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-mono truncate">
          {longestStreak > 0 ? 'Personal best' : 'Start streak'}
        </span>
      </div>

      {/* Stat 3: Total Days */}
      <div className="rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Total Days
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-300 text-[16px] sm:text-[18px]">calendar_month</span>
          </div>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-white tracking-tight font-mono leading-none">
              {totalDays}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">Days</span>
          </div>
        </div>
        <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-mono truncate">
          {totalDays > 0 ? 'Across topics' : 'Ready to start'}
        </span>
      </div>

      {/* Stat 4: Total Time */}
      <div className="rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Total Time
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-300 text-[16px] sm:text-[18px]">schedule</span>
          </div>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-white tracking-tight font-mono leading-none">
              {totalHours}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">Hrs</span>
          </div>
        </div>
        <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-mono truncate">
          {totalMinutes > 0 ? `${totalMinutes.toLocaleString()}m total` : '0m recorded'}
        </span>
      </div>

      {/* Stat 5: Today's Learning Time */}
      <div className="rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between hover:border-[#00f5a0]/40 transition-all relative">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Today's Time
          </span>
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f5a0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#00f5a0]"></span>
          </span>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-[#00f5a0] tracking-tight font-mono leading-none">
              {todayMinutes}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">min</span>
          </div>
        </div>
        <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-mono truncate">
          {todaySessionsCount} active session{todaySessionsCount === 1 ? '' : 's'}
        </span>
      </div>

      {/* Stat 6: Daily Goal */}
      <div className="rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Daily Goal
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-300 text-[16px] sm:text-[18px]">flag</span>
          </div>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-white tracking-tight font-mono leading-none">
              {dailyGoalMinutes}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">min</span>
          </div>
        </div>
        <button
          onClick={onEditGoal}
          className="text-[0.625rem] sm:text-[0.6875rem] text-[#00f5a0] hover:underline text-left inline-flex items-center gap-1 font-mono cursor-pointer"
        >
          <span>Edit Goal</span>
          <span className="material-symbols-outlined text-[12px]">edit</span>
        </button>
      </div>

      {/* Stat 7: Remaining Minutes (Spans 2 cols on mobile for balanced grid) */}
      <div className="col-span-2 sm:col-span-1 xl:col-span-1 rounded-xl bg-[#131821] border border-[#222a36] p-3 sm:p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 uppercase font-mono tracking-wider truncate">
            Remaining Target
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#00f5a0] text-[16px] sm:text-[18px]">
              hourglass_bottom
            </span>
          </div>
        </div>
        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-white tracking-tight font-mono leading-none">
              {remainingMinutes}
            </span>
            <span className="text-[0.8125rem] sm:text-[1rem] text-slate-400 font-mono">min</span>
          </div>
        </div>
        <span className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-mono truncate">
          {remainingMinutes === 0 ? 'Goal smashed! 🎯' : 'Countdown active'}
        </span>
      </div>
    </div>
  );
};
