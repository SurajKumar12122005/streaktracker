import React from 'react';

interface SheetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  affectedCount?: number;
  sheetTitle?: string;
  actionButtonLabel?: string;
  isProcessing?: boolean;
}

export const SheetConfirmModal: React.FC<SheetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  affectedCount,
  sheetTitle = 'StreakTracker - User Details',
  actionButtonLabel = 'Confirm Sync',
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
            <span className="material-symbols-outlined text-[24px]">table_chart</span>
          </div>
          <div>
            <h3 className="text-[1.125rem] font-bold text-white tracking-tight">{title}</h3>
            <span className="text-[0.6875rem] font-mono text-[#00f5a0] uppercase tracking-wider">
              Google Sheets Synchronization
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e141b] border border-[#222a36] space-y-2">
          <p className="text-[0.875rem] text-slate-300 leading-relaxed">{description}</p>
          <div className="pt-2 border-t border-[#1f2633] flex items-center justify-between text-[0.75rem] font-mono text-slate-400">
            <span>Target Spreadsheet:</span>
            <span className="text-[#00f5a0] truncate max-w-[200px]">{sheetTitle}</span>
          </div>
          {typeof affectedCount === 'number' && (
            <div className="flex items-center justify-between text-[0.75rem] font-mono text-slate-400">
              <span>Records Affected:</span>
              <span className="text-white font-bold">{affectedCount} user(s)</span>
            </div>
          )}
        </div>

        <p className="text-[0.75rem] text-slate-400 italic">
          This operation will update the Google Sheets document linked to your authorized Google account with permission.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] text-slate-300 hover:text-white text-[0.875rem] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-[#00f5a0] hover:brightness-110 active:scale-[0.98] text-black text-[0.875rem] font-bold shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                <span>{actionButtonLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
