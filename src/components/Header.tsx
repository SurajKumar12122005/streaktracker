import React, { useState } from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  streakDays: number;
  onOpenRecordModal: () => void;
  profile: UserProfile;
  onOpenProfileModal: () => void;
  onOpenDatabaseExplorer: () => void;
  onOpenAchievementsModal?: () => void;
  onOpenGoogleSheetsModal?: () => void;
  isSheetsConnected?: boolean;
  onSignOut: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  streakDays,
  onOpenRecordModal,
  profile,
  onOpenProfileModal,
  onOpenDatabaseExplorer,
  onOpenAchievementsModal,
  onOpenGoogleSheetsModal,
  isSheetsConnected = false,
  onSignOut,
  isAdmin = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get user initials for avatar
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0] ? parts[0].slice(0, 2) : 'SS').toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e141b]/90 backdrop-blur-xl border-b border-[#222a36] shadow-[0_1px_16px_rgba(0,0,0,0.6)]">
      <div className="h-14 sm:h-16 max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2 group focus:outline-none text-left cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-[#00f5a0] group-hover:border-[#00f5a0]/50 transition-colors shadow-inner">
              <span
                className="material-symbols-outlined text-[18px] sm:text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <span className="text-[1rem] sm:text-[1.125rem] leading-[1.625rem] text-white font-bold tracking-tight">
              StreakTracker
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`transition-colors py-1 text-[0.875rem] font-medium flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'text-[#00f5a0] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentTab === 'dashboard' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]"></span>
              )}
              Dashboard
            </button>

            <button
              onClick={onOpenRecordModal}
              className={`transition-colors py-1 text-[0.875rem] font-medium flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'add-session'
                  ? 'text-[#00f5a0] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Add Session
            </button>

            <button
              onClick={() => onTabChange('monthly-calendar')}
              className={`transition-colors py-1 text-[0.875rem] font-medium flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'monthly-calendar'
                  ? 'text-[#00f5a0] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentTab === 'monthly-calendar' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]"></span>
              )}
              Monthly Calendar
            </button>

            <button
              onClick={() => onTabChange('goal-settings')}
              className={`transition-colors py-1 text-[0.875rem] font-medium flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'goal-settings'
                  ? 'text-[#00f5a0] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentTab === 'goal-settings' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]"></span>
              )}
              Goal Settings
            </button>

            {isAdmin && (
              <button
                onClick={() => onTabChange('all-users')}
                className={`transition-colors py-1 text-[0.875rem] font-medium flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'all-users'
                    ? 'text-[#00f5a0] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentTab === 'all-users' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]"></span>
                )}
                <span>All Users</span>
                <span className="px-1.5 py-0.2 rounded text-[0.625rem] bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] font-mono">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Database Access Button - Admin Only */}
          {isAdmin && (
            <button
              onClick={onOpenDatabaseExplorer}
              title="Inspect Firestore User Records & Cloud Database (Admin Only)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-[#00f5a0]/40 text-slate-300 hover:text-[#00f5a0] text-xs font-mono transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-[#00f5a0]">database</span>
              <span>Cloud DB</span>
              <span className="text-[0.625rem] px-1 rounded bg-[#00f5a0]/15 text-[#00f5a0] font-mono border border-[#00f5a0]/30">Admin</span>
            </button>
          )}

          {/* Badges CTA */}
          <button
            onClick={onOpenAchievementsModal}
            title="View Developer Milestones & Badges (Hotkey: B)"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-amber-400/40 text-slate-300 hover:text-amber-400 text-xs font-mono transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">emoji_events</span>
            <span>Badges</span>
          </button>

          {/* Google Sheets User Storage CTA */}
          <button
            onClick={onOpenGoogleSheetsModal}
            title="Google Sheets User Details Sync & Cloud Backup"
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isSheetsConnected
                ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-[#00f5a0]/40 text-[#00f5a0]'
                : 'bg-[#181f2a] hover:bg-[#222a36] border-[#2a3240] text-slate-300 hover:text-[#00f5a0]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#00f5a0]">table_chart</span>
            <span>{isSheetsConnected ? 'Sheets Synced' : 'Sheets Sync'}</span>
          </button>

          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#181f2a] border border-[#00f5a0]/30 shadow-[0_0_15px_rgba(0,245,160,0.12)]">
            <span
              className="material-symbols-outlined text-[16px] text-[#00f5a0]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-[0.8125rem] font-semibold text-[#00f5a0] font-mono">
              {streakDays} Day Streak
            </span>
          </div>

          {/* Record Learning CTA */}
          <button
            onClick={onOpenRecordModal}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.8125rem] sm:text-[0.875rem] shadow-[0_0_20px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span className="hidden sm:inline">Record Learning</span>
            <span className="sm:hidden">+ Record</span>
          </button>

          {/* Profile Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={`Profile: ${profile.name} (${profile.email})`}
              className="w-8 h-8 rounded-full bg-[#181f2a] border border-[#2a3240] hover:border-[#00f5a0]/60 flex items-center justify-center ring-1 ring-slate-700/60 hover:ring-[#00f5a0]/40 transition-all text-slate-200 hover:text-[#00f5a0] text-[0.75rem] font-mono font-bold cursor-pointer"
            >
              <span>{getInitials(profile.name)}</span>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-64 rounded-xl bg-[#131821] border border-[#2a3240] p-2 shadow-2xl flex flex-col gap-1 text-[0.8125rem] animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[#222a36]">
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-semibold text-white truncate">{profile.name}</div>
                      {isAdmin ? (
                        <span className="px-1.5 py-0.2 rounded text-[0.625rem] bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-mono font-bold">
                          Admin
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[0.625rem] bg-[#181f2a] text-slate-400 border border-[#2a3240] font-mono">
                          Learner
                        </span>
                      )}
                    </div>
                    <div className="text-[0.6875rem] text-slate-400 font-mono truncate">
                      {profile.email}
                    </div>
                    <div className="text-[0.6875rem] text-[#00f5a0] font-mono mt-0.5 truncate">
                      {profile.mobileNumber}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-[#181f2a] hover:text-[#00f5a0] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAchievementsModal?.();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-[#181f2a] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-amber-400">emoji_events</span>
                    <span>Milestones & Badges</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenGoogleSheetsModal?.();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-[#181f2a] hover:text-[#00f5a0] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#00f5a0]">table_chart</span>
                      <span>Google Sheets Sync</span>
                    </div>
                    {isSheetsConnected && (
                      <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
                    )}
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onTabChange('all-users');
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-[#181f2a] hover:text-[#00f5a0] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">group</span>
                          <span>All Users Directory</span>
                        </div>
                        <span className="text-[0.625rem] text-[#00f5a0] px-1.5 py-0.2 rounded bg-[#00f5a0]/10 border border-[#00f5a0]/20 font-mono">
                          Admin
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenDatabaseExplorer();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-[#181f2a] hover:text-[#00f5a0] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">database</span>
                          <span>Database & Records</span>
                        </div>
                        <span className="text-[0.625rem] text-[#00f5a0] px-1.5 py-0.2 rounded bg-[#00f5a0]/10 border border-[#00f5a0]/20 font-mono">
                          Admin
                        </span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer border-t border-[#222a36] mt-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
