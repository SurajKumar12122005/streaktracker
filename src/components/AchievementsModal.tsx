import React from 'react';
import { LearningSession } from '../types';

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'volume' | 'diversity' | 'mastery';
  isUnlocked: boolean;
  progressText: string;
  unlockedAtText?: string;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: LearningSession[];
  currentStreak: number;
  longestStreak: number;
  totalHours: string;
  activeTracks: string[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  currentStreak,
  longestStreak,
  totalHours,
  activeTracks,
}) => {
  if (!isOpen) return null;

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const masteredCount = sessions.filter(s => s.mastered).length;
  const dsaCount = sessions.filter(s => s.category.toUpperCase().includes('DSA') || s.category.toUpperCase().includes('ALGO')).length;
  const distinctTrackCount = new Set(sessions.map(s => s.category)).size;

  const badges: MilestoneBadge[] = [
    {
      id: 'ignite',
      title: 'Ignite Day 1',
      description: 'Record your very first learning sprint and start your developer streak.',
      icon: 'local_fire_department',
      category: 'streak',
      isUnlocked: sessions.length >= 1,
      progressText: sessions.length >= 1 ? 'Unlocked' : '0/1 session logged',
    },
    {
      id: 'streak_3',
      title: 'Momentum Builder',
      description: 'Maintain an active learning streak for 3 consecutive days.',
      icon: 'bolt',
      category: 'streak',
      isUnlocked: longestStreak >= 3 || currentStreak >= 3,
      progressText: `${Math.max(currentStreak, longestStreak)}/3 days streak`,
    },
    {
      id: 'streak_7',
      title: 'Iron Consistency',
      description: 'Lock in a full 7-day technical learning streak without interruption.',
      icon: 'shield',
      category: 'streak',
      isUnlocked: longestStreak >= 7 || currentStreak >= 7,
      progressText: `${Math.max(currentStreak, longestStreak)}/7 days streak`,
    },
    {
      id: 'streak_30',
      title: 'Flow State Master',
      description: 'Achieve legendary 30-day streak status across technical topics.',
      icon: 'crown',
      category: 'streak',
      isUnlocked: longestStreak >= 30 || currentStreak >= 30,
      progressText: `${Math.max(currentStreak, longestStreak)}/30 days streak`,
    },
    {
      id: 'volume_10h',
      title: 'Double Digits',
      description: 'Log over 10 cumulative hours of focused technical sprints.',
      icon: 'timer',
      category: 'volume',
      isUnlocked: totalMinutes >= 600,
      progressText: `${(totalMinutes / 60).toFixed(1)}/10.0 hours`,
    },
    {
      id: 'century_club',
      title: 'Century Club',
      description: 'Pass 100 total hours of deliberate practice and code sessions.',
      icon: 'workspace_premium',
      category: 'volume',
      isUnlocked: totalMinutes >= 6000,
      progressText: `${totalHours}/100.0 hours`,
    },
    {
      id: 'algo_architect',
      title: 'Algorithm Architect',
      description: 'Log at least 10 sessions dedicated to DSA & algorithmic patterns.',
      icon: 'terminal',
      category: 'mastery',
      isUnlocked: dsaCount >= 10,
      progressText: `${dsaCount}/10 DSA sessions`,
    },
    {
      id: 'polyglot',
      title: 'Full-Stack Polyglot',
      description: 'Actively practice across 3 or more distinct technical tracks.',
      icon: 'layers',
      category: 'diversity',
      isUnlocked: distinctTrackCount >= 3,
      progressText: `${distinctTrackCount}/3 active tracks logged`,
    },
    {
      id: 'mastery_5',
      title: 'Breakthrough Architect',
      description: 'Mark 5 or more technical concepts as fully mastered in your log.',
      icon: 'verified',
      category: 'mastery',
      isUnlocked: masteredCount >= 5,
      progressText: `${masteredCount}/5 concepts mastered`,
    },
  ];

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#131821] border border-[#222a36] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#222a36] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0] shadow-inner">
              <span className="material-symbols-outlined text-[24px]">emoji_events</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[1.25rem] font-bold text-white tracking-tight">
                  Developer Milestones & Badges
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#00f5a0]/15 text-[#00f5a0] text-[0.6875rem] font-mono border border-[#00f5a0]/30 font-bold">
                  {unlockedCount} / {badges.length} Unlocked
                </span>
              </div>
              <p className="text-[0.8125rem] text-slate-400 mt-0.5">
                Earn badges as you hit consistency streaks, deliberate hours, and track breakthroughs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Progress Summary Meter */}
        <div className="px-6 py-3 bg-[#0e141b] border-b border-[#222a36] flex items-center justify-between">
          <span className="text-[0.75rem] font-mono text-slate-400">
            Total Milestone Progress: <strong className="text-white">{Math.round((unlockedCount / badges.length) * 100)}%</strong>
          </span>
          <div className="w-48 h-2 rounded-full bg-[#181f2a] overflow-hidden border border-[#222a36]">
            <div
              className="h-full bg-[#00f5a0] rounded-full shadow-[0_0_8px_rgba(0,245,160,0.5)] transition-all duration-500"
              style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                badge.isUnlocked
                  ? 'bg-[#181f2a] border-[#00f5a0]/40 shadow-[0_0_15px_rgba(0,245,160,0.1)]'
                  : 'bg-[#0e141b]/80 border-[#222a36] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      badge.isUnlocked
                        ? 'bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30'
                        : 'bg-[#181f2a] text-slate-500 border border-[#2a3240]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {badge.icon}
                    </span>
                  </div>
                  {badge.isUnlocked ? (
                    <span className="text-[0.625rem] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00f5a0]/10 text-[#00f5a0] border border-[#00f5a0]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      <span>EARNED</span>
                    </span>
                  ) : (
                    <span className="text-[0.625rem] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-[#181f2a] border border-[#222a36]">
                      LOCKED
                    </span>
                  )}
                </div>

                <h4 className="text-[0.9375rem] font-bold text-white tracking-tight">
                  {badge.title}
                </h4>
                <p className="text-[0.75rem] text-slate-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#222a36]/60 flex items-center justify-between text-[0.6875rem] font-mono">
                <span className="text-slate-500">Status</span>
                <span className={badge.isUnlocked ? 'text-[#00f5a0] font-bold' : 'text-slate-400'}>
                  {badge.progressText}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222a36] bg-[#0e141b] flex items-center justify-between">
          <span className="text-[0.75rem] font-mono text-slate-400">
            Keep logging sessions daily to unlock higher-tier status.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-white text-[0.8125rem] font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
