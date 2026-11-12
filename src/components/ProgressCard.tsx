import React from 'react';
import { LearningSession } from '../types';
import { getTodayStr } from '../utils/dateUtils';

interface ProgressCardProps {
  todayMinutes: number;
  dailyGoalMinutes: number;
  remainingMinutes: number;
  progressPercent: number;
  onQuickAdd15: () => void;
  onChangeDailyGoal: () => void;
  weeklyGoalDays?: number;
  streakFreezeRemaining?: number;
  sessions?: LearningSession[];
  onActivateStreakFreeze?: () => void;
  canActivateFreeze?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  todayMinutes,
  dailyGoalMinutes,
  remainingMinutes,
  progressPercent,
  onQuickAdd15,
  onChangeDailyGoal,
  weeklyGoalDays = 6,
  streakFreezeRemaining = 2,
  sessions = [],
  onActivateStreakFreeze,
  canActivateFreeze = false,
}) => {
  const todayStr = getTodayStr();
  const practicedDateSet = new Set(sessions.map(s => s.date));

  // Calculate current week dates (Monday to Sunday)
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const isPracticed = practicedDateSet.has(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;

    return {
      label: dayLabels[i],
      dateStr,
      dayNum: d.getDate(),
      isPracticed,
      isToday,
      isFuture,
    };
  });

  const weekPracticedCount = weekDays.filter(d => d.isPracticed).length;
  const isWeeklyGoalMet = weekPracticedCount >= weeklyGoalDays;

  return (
    <div className="rounded-2xl bg-[#131821] border border-[#222a36] p-4 sm:p-6 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0] shrink-0">
            <span className="material-symbols-outlined text-[20px]">target</span>
          </div>
          <div>
            <h2 className="text-[1.125rem] text-white font-semibold leading-tight flex items-center gap-2">
              <span>Today's Learning Progress</span>
              {canActivateFreeze && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[0.6875rem] font-mono flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[13px]">ac_unit</span>
                  <span>Freeze Ready</span>
                </span>
              )}
            </h2>
            <p className="text-[0.8125rem] text-slate-400 mt-0.5">
              {remainingMinutes === 0
                ? "🎯 Daily target smashed! You've achieved full goal velocity for today."
                : `Almost there! ${remainingMinutes} minutes remaining to hit your ${dailyGoalMinutes}-minute target.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canActivateFreeze && onActivateStreakFreeze && (
            <button
              onClick={onActivateStreakFreeze}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[0.8125rem] font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
              title="Use 1 Streak Freeze to protect your streak from missed days"
            >
              <span className="material-symbols-outlined text-[16px] text-cyan-300">ac_unit</span>
              <span>Use Streak Freeze</span>
            </button>
          )}

          <button
            onClick={onQuickAdd15}
            className="px-3 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] text-white border border-[#2a3240] text-[0.8125rem] font-medium transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="Instantly add 15 minutes of study to today"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00f5a0]">
              add_circle
            </span>
            <span>Quick +15 min</span>
          </button>

          <button
            onClick={onChangeDailyGoal}
            className="px-3 py-1.5 rounded-lg bg-[#0e141b] hover:bg-[#181f2a] text-slate-300 hover:text-white border border-[#222a36] text-[0.8125rem] font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Change Goals</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[0.8125rem] font-mono">
          <span className="text-slate-400">
            Daily goal completion:{' '}
            <strong className="text-white font-bold">
              {todayMinutes} / {dailyGoalMinutes} min
            </strong>
          </span>
          <span className="text-[#00f5a0] font-bold">{progressPercent}%</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-[#181f2a] border border-[#222a36] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#00f5a0] shadow-[0_0_12px_rgba(0,245,160,0.6)] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Weekly Cadence Meter & Streak Freeze Protection Row */}
      <div className="pt-2 border-t border-[#1b222d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Weekly 7-Day Consistency Meter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono text-[0.75rem] text-slate-400 mr-1">
            <span className="material-symbols-outlined text-[16px] text-[#00f5a0]">
              event_repeat
            </span>
            <span>Week Cadence:</span>
            <span className={`font-bold ${isWeeklyGoalMet ? 'text-[#00f5a0]' : 'text-white'}`}>
              {weekPracticedCount}/{weeklyGoalDays} days
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {weekDays.map(d => (
              <div
                key={d.dateStr}
                className={`flex flex-col items-center justify-center w-7 h-8 rounded-lg border text-[0.625rem] font-mono transition-all ${
                  d.isPracticed
                    ? 'bg-[#00f5a0]/15 border-[#00f5a0]/40 text-[#00f5a0] shadow-[0_0_8px_rgba(0,245,160,0.2)] font-bold'
                    : d.isToday
                    ? 'bg-[#181f2a] border-[#00f5a0] text-white ring-1 ring-[#00f5a0]/50'
                    : d.isFuture
                    ? 'bg-[#0e141b] border-[#222a36] text-slate-600'
                    : 'bg-[#0e141b] border-[#222a36] text-slate-500'
                }`}
                title={`${d.label} ${d.dateStr}: ${d.isPracticed ? 'Practiced' : d.isToday ? 'Today' : 'Not practiced'}`}
              >
                <span className="leading-none text-[0.5625rem] uppercase">{d.label[0]}</span>
                {d.isPracticed ? (
                  <span className="material-symbols-outlined text-[10px] mt-0.5">check</span>
                ) : (
                  <span className="mt-0.5 leading-none">{d.dayNum}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Streak Freeze Status */}
        <div className="flex items-center gap-2 text-[0.75rem] font-mono text-slate-400 bg-[#0e141b] px-3 py-1.5 rounded-lg border border-[#222a36] w-fit">
          <span className="material-symbols-outlined text-[16px] text-cyan-400">
            ac_unit
          </span>
          <span>
            Streak Freezes: <strong className="text-cyan-300 font-bold">{streakFreezeRemaining} left</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
