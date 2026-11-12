import React from 'react';

interface MasteryConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasteryConceptsModal: React.FC<MasteryConceptsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const concepts = [
    {
      title: 'Binary Search & Lower Bound Invariants',
      category: 'DSA',
      date: 'Oct 24, 2025',
      masteryLevel: '100% Invariant Mastered',
      description: 'Mastered standard binary search, bisect_left / bisect_right, and monotonic predicate functions.',
    },
    {
      title: 'Django ORM Prefetch Related & N+1 Prevention',
      category: 'Django',
      date: 'Oct 23, 2025',
      masteryLevel: '100% Performance Hardened',
      description: 'Prefetch objects, filtered relation caching, and SQL query count unit testing.',
    },
    {
      title: 'Backpropagation & Gradient Descent Derivatives',
      category: 'AI/ML',
      date: 'Oct 22, 2025',
      masteryLevel: '100% Mathematical Proof',
      description: 'Matrix Jacobian chain rules, loss minimization curves, and vanishing gradient mitigation.',
    },
    {
      title: 'SQL Window Functions (ROW_NUMBER & RANK)',
      category: 'SQL',
      date: 'Oct 21, 2025',
      masteryLevel: '100% Analytical SQL',
      description: 'PARTITION BY, ORDER BY frame specifications, running sums, and dense ranking.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0e141b] border border-[#222a36] text-[#00f5a0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div>
              <h3 className="text-[1.125rem] font-semibold">Weekly Mastery Target</h3>
              <p className="text-[0.75rem] text-[#00f5a0] font-mono">
                4 / 3 Target Achieved (+1 Ahead of Pace)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {concepts.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#0e141b] border border-[#222a36] flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[0.875rem]">{item.title}</span>
                <span className="text-[0.6875rem] font-mono text-[#00f5a0] bg-[#00f5a0]/10 border border-[#00f5a0]/20 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>
              <p className="text-[0.75rem] text-slate-400">{item.description}</p>
              <div className="flex items-center justify-between text-[0.6875rem] text-slate-500 font-mono mt-0.5">
                <span className="text-emerald-400">✓ {item.masteryLevel}</span>
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#222a36] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.875rem] hover:brightness-110 cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
