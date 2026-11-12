import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  details?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Delete Learning Session',
  itemName,
  details,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#131821] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-white animate-in zoom-in-95 duration-150">
        {/* Header with warning icon */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>
          <div>
            <h3 className="text-[1.125rem] font-bold text-white leading-tight">
              {title}
            </h3>
            <p className="text-[0.8125rem] text-slate-400 mt-1">
              This action cannot be undone and will remove this session from your streak and focus metrics.
            </p>
          </div>
        </div>

        {/* Item preview card */}
        {(itemName || details) && (
          <div className="p-3.5 rounded-xl bg-[#0e141b] border border-[#222a36] flex flex-col gap-1 font-mono text-[0.8125rem]">
            {itemName && (
              <div className="font-semibold text-white truncate">
                {itemName}
              </div>
            )}
            {details && (
              <div className="text-[0.75rem] text-slate-400">
                {details}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#222a36]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#181f2a] text-[0.875rem] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[0.875rem] shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
