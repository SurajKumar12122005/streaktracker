import React from 'react';
import { LearningSession } from '../types';

interface MomentumAlertProps {
  onStartSprint: () => void;
  onDismiss: () => void;
  userName?: string;
  activeTracks?: string[];
  sessions?: LearningSession[];
  currentStreak?: number;
  todayMinutes?: number;
  dailyGoalMinutes?: number;
  remainingMinutes?: number;
  isNewUser?: boolean;
}

export const MomentumAlert: React.FC<MomentumAlertProps> = ({
  onStartSprint,
  onDismiss,
  userName = 'Developer',
  activeTracks = ['DSA', 'Python', 'Django', 'SQL'],
  sessions = [],
  currentStreak = 0,
  todayMinutes = 0,
  dailyGoalMinutes = 60,
  remainingMinutes = 60,
  isNewUser = false,
}) => {
  const displayName = userName.trim() ? userName.split(' ')[0] : 'Developer';
  const effectiveTracks = activeTracks.length > 0 ? activeTracks : ['DSA', 'Python'];

  // Determine which active track has gone the longest without practice
  const getDormantTrack = (): { track: string; daysAgo: number | null } => {
    if (sessions.length === 0) {
      return { track: effectiveTracks[0], daysAgo: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let maxDaysAgo = -1;
    let mostDormantTrack = effectiveTracks[0];

    for (const track of effectiveTracks) {
      const trackSessions = sessions.filter(
        s => s.category.toLowerCase() === track.toLowerCase()
      );

      if (trackSessions.length === 0) {
        // Never practiced
        return { track, daysAgo: null };
      }

      // Find newest session for this track
      const sorted = [...trackSessions].sort((a, b) => b.date.localeCompare(a.date));
      const latestDateStr = sorted[0].date;
      const [y, m, d] = latestDateStr.split('-').map(Number);
      const sessionDate = new Date(y, m - 1, d);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > maxDaysAgo) {
        maxDaysAgo = diffDays;
        mostDormantTrack = track;
      }
    }

    return { track: mostDormantTrack, daysAgo: maxDaysAgo > 0 ? maxDaysAgo : 1 };
  };

  const dormantInfo = getDormantTrack();

  // Dynamic user narrative generation
  let badgeLabel = 'Momentum Guard';
  let badgeClass = 'bg-[#00f5a0]/10 border-[#00f5a0]/20 text-[#00f5a0]';
  let title = 'Momentum Guard';
  let statement = '';
  let buttonText = 'Start 15-min Session';

  if (isNewUser || sessions.length === 0) {
    badgeLabel = 'Day 1 Ignition';
    badgeClass = 'bg-[#00f5a0]/10 border-[#00f5a0]/20 text-[#00f5a0]';
    title = `Start Your First Streak, ${displayName}`;
    statement = `Welcome to your personal cadence! Your workspace is ready across ${effectiveTracks.length} tracks (${effectiveTracks.slice(0, 3).join(', ')}). Complete your first 15-minute sprint to ignite Day 1!`;
    buttonText = 'Ignite Day 1 Streak';
  } else if (todayMinutes >= dailyGoalMinutes && dailyGoalMinutes > 0) {
    badgeLabel = 'Goal Smashed 🎯';
    badgeClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
    title = `Momentum Secured (${currentStreak}d Streak)`;
    statement = `Outstanding dedication, ${displayName}! You've reached your ${dailyGoalMinutes}m daily target (${todayMinutes}m logged). Keep your flow going with an elective sprint or rest up for tomorrow!`;
    buttonText = 'Bonus 15-min Sprint';
  } else if (todayMinutes > 0 && remainingMinutes > 0) {
    badgeLabel = 'In The Flow ⚡';
    badgeClass = 'bg-sky-500/15 border-sky-500/30 text-sky-400';
    title = `${remainingMinutes}m Left to Hit Goal (${currentStreak}d Streak)`;
    statement = `${displayName}, you've banked ${todayMinutes}m today! Just ${remainingMinutes} more minutes in ${dormantInfo.track || 'your core tracks'} to lock in your daily goal and extend your ${currentStreak}-day streak.`;
    buttonText = `Finish Daily Target`;
  } else if (currentStreak > 0) {
    badgeLabel = `${dormantInfo.track} At Risk ⏳`;
    badgeClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    title = `Protect Your ${currentStreak}-Day Streak, ${displayName}`;
    statement = dormantInfo.daysAgo !== null
      ? `${displayName}, you haven't practiced ${dormantInfo.track} in ${dormantInfo.daysAgo} day${dormantInfo.daysAgo === 1 ? '' : 's'}. A quick 15-minute sprint now defends your streak and prevents skill fade!`
      : `${displayName}, your active track ${dormantInfo.track} has no recorded sprints yet. Dedicate 15 minutes today to balance your curriculum and defend your ${currentStreak}-day streak!`;
    buttonText = `Practice ${dormantInfo.track}`;
  } else {
    badgeLabel = 'Cadence Recovery ⚡';
    badgeClass = 'bg-teal-500/15 border-teal-500/30 text-teal-400';
    title = `Reignite Your Flow, ${displayName}`;
    statement = `${displayName}, let's build back your cadence! Knock out a rapid 15-minute session in ${dormantInfo.track} to jumpstart a fresh streak today.`;
    buttonText = `Start ${dormantInfo.track} Sprint`;
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#131821] border border-[#222a36] p-4 shadow-sm transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f5a0]" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-1">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#181f2a] border border-[#2a3240] flex items-center justify-center shrink-0 shadow-inner text-[#00f5a0]">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[1.0625rem] sm:text-[1.125rem] text-white font-semibold">
                {title}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[0.6875rem] font-mono font-medium ${badgeClass}`}>
                {badgeLabel}
              </span>
            </div>
            <p className="text-[0.75rem] sm:text-[0.8125rem] text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              {statement}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={onStartSprint}
            className="px-3.5 py-1.5 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[#00f5a0] text-[0.8125rem] font-medium hover:bg-[#00f5a0]/20 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>{buttonText}</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1f2633] transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
