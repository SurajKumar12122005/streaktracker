import React, { useState } from 'react';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
  onUpdateGoal: (newGoal: number) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onUpdateGoal,
}) => {
  const [goal, setGoal] = useState(currentGoal);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoal(Math.max(15, goal));
    onClose();
  };

  const presets = [30, 45, 60, 90, 120];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">tune</span>
            <h3 className="text-[1.125rem] font-semibold">Update Daily Learning Goal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1.5">
              Daily Goal Target (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="15"
                max="360"
                step="5"
                value={goal}
                onChange={e => setGoal(parseInt(e.target.value, 10) || 15)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[1.125rem] font-mono focus:border-[#00f5a0]/60 focus:outline-none"
              />
              <span className="text-slate-400 font-mono text-[0.875rem]">minutes/day</span>
            </div>
          </div>

          <div>
            <span className="block text-[0.75rem] text-slate-400 font-mono mb-2">
              Quick Selection Presets:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {presets.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setGoal(p)}
                  className={`px-3 py-1.5 rounded-lg text-[0.8125rem] font-mono transition-colors cursor-pointer ${
                    goal === p
                      ? 'bg-[#00f5a0] text-black font-bold'
                      : 'bg-[#181f2a] text-slate-300 hover:bg-[#222a36] border border-[#2a3240]'
                  }`}
                >
                  {p}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222a36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] text-[0.875rem] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.875rem] shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              Update Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
