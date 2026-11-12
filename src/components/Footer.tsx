import React from 'react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, isAdmin = false }) => {
  return (
    <footer className="w-full bg-[#0e141b] border-t border-[#222a36] py-8 mt-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Copyright */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-[#00f5a0]">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <span className="text-[0.8125rem] text-slate-400 font-medium">
            StreakTracker © 2025. Engineering momentum everyday.
          </span>
        </div>

        {/* Links & Version */}
        <div className="flex items-center gap-6">
          <span className="text-[0.6875rem] text-slate-500 uppercase tracking-wider font-mono">
            v2.4.0-stable
          </span>
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('all-users')}
              className="text-[0.75rem] text-[#00f5a0] hover:underline transition-colors cursor-pointer"
            >
              All Users (Admin)
            </button>
          )}
          <button
            onClick={() => onNavigateTab('goal-settings')}
            className="text-[0.75rem] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Preferences
          </button>
          <button
            onClick={() => onNavigateTab('monthly-calendar')}
            className="text-[0.75rem] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Activity Matrix
          </button>
        </div>
      </div>
    </footer>
  );
};
