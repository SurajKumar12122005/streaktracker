import React from 'react';
import { formatReadableDate } from '../utils/dateUtils';

interface HeroBannerProps {
  progressPercent: number;
  tracksCount: number;
  onOpenRecordModal: () => void;
  userName?: string;
  isNewUser?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  progressPercent,
  tracksCount,
  onOpenRecordModal,
  userName = 'Developer',
  isNewUser = false,
}) => {
  const todayFormatted = formatReadableDate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#131821] border border-[#222a36] p-3.5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Background radial glows */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#00f5a0]/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute right-48 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/[0.03] blur-2xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/20 text-[#00f5a0] text-[0.625rem] sm:text-[0.6875rem] font-semibold font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse"></span>
              {isNewUser ? 'FRESH CADENCE' : 'ACTIVE CADENCE'}
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-slate-400">today</span>
              <span>Today: {todayFormatted}</span>
            </span>
          </div>

          <h1 className="text-[1.25rem] sm:text-[1.75rem] font-semibold text-white tracking-tight leading-tight mt-0.5 sm:mt-1">
            {isNewUser
              ? `Welcome, ${userName || 'Developer'}! Ready to start your streak?`
              : `Welcome back, ${userName || 'Developer'}! Keep your momentum going.`}
          </h1>

          <p className="text-[0.8125rem] sm:text-[0.875rem] text-slate-400 leading-normal">
            {isNewUser
              ? `Your technical workspace is initialized across ${tracksCount} tracks. Log your first sprint or start the focus timer to ignite your streak!`
              : `Your current flow state is synchronized across ${tracksCount} technical tracks. You have completed ${progressPercent}% of your target for today.`}
          </p>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
          <button
            onClick={onOpenRecordModal}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-white text-black font-semibold text-[0.875rem] sm:text-[0.9375rem] hover:bg-slate-200 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add_task</span>
            <span>+ Record Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
