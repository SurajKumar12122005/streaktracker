import React from 'react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: 'dashboard' | 'monthly-calendar' | 'goal-settings' | 'all-users') => void;
  onOpenRecordModal: () => void;
  isAdmin?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenRecordModal,
  isAdmin = false,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e141b]/95 backdrop-blur-xl border-t border-[#222a36] lg:hidden px-2 py-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-[#00f5a0]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: currentTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            space_dashboard
          </span>
          <span className="text-[0.625rem] font-medium tracking-tight mt-0.5">
            Dashboard
          </span>
        </button>

        {/* Tab 2: Monthly Calendar */}
        <button
          onClick={() => onTabChange('monthly-calendar')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentTab === 'monthly-calendar'
              ? 'text-[#00f5a0]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: currentTab === 'monthly-calendar' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            calendar_month
          </span>
          <span className="text-[0.625rem] font-medium tracking-tight mt-0.5">
            Calendar
          </span>
        </button>

        {/* Center: Record Session Action CTA */}
        <button
          onClick={onOpenRecordModal}
          title="Record Learning Session"
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#00f5a0] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,245,160,0.5)] group-hover:scale-105 group-active:scale-95 transition-transform border-4 border-[#0e141b]">
            <span className="material-symbols-outlined text-[24px] font-bold">
              add
            </span>
          </div>
          <span className="text-[0.625rem] font-bold text-[#00f5a0] tracking-tight mt-0.5">
            + Record
          </span>
        </button>

        {/* Tab 3: Goals */}
        <button
          onClick={() => onTabChange('goal-settings')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentTab === 'goal-settings'
              ? 'text-[#00f5a0]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: currentTab === 'goal-settings' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            tune
          </span>
          <span className="text-[0.625rem] font-medium tracking-tight mt-0.5">
            Goals
          </span>
        </button>

        {/* Tab 4: All Users (Admin) or Directory */}
        {isAdmin && (
          <button
            onClick={() => onTabChange('all-users')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'all-users'
                ? 'text-[#00f5a0]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                fontVariationSettings: currentTab === 'all-users' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              group
            </span>
            <span className="text-[0.625rem] font-medium tracking-tight mt-0.5">
              Users
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
