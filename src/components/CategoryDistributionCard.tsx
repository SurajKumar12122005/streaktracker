import React, { useState } from 'react';

interface CategoryStat {
  name: string;
  count: number;
  percentage: number;
}

interface CategoryDistributionCardProps {
  totalSprints: number;
  categoryStats: CategoryStat[];
  masteredCount?: number;
  onOpenMasteryModal: () => void;
  onSelectCategoryFilter: (category: string) => void;
  onManageTracks?: () => void;
  activeTracks?: string[];
  onUpdateActiveTracks?: (newTracks: string[]) => void;
}

// Curated vibrant terminal colors for dynamic user tracks
const COLOR_PALETTE = [
  { dot: 'bg-[#00f5a0]', bar: 'bg-[#00f5a0]', text: 'text-[#00f5a0]' },
  { dot: 'bg-sky-400', bar: 'bg-sky-400', text: 'text-sky-400' },
  { dot: 'bg-amber-400', bar: 'bg-amber-400', text: 'text-amber-400' },
  { dot: 'bg-violet-400', bar: 'bg-violet-400', text: 'text-violet-400' },
  { dot: 'bg-rose-400', bar: 'bg-rose-400', text: 'text-rose-400' },
  { dot: 'bg-emerald-400', bar: 'bg-emerald-400', text: 'text-emerald-400' },
  { dot: 'bg-teal-400', bar: 'bg-teal-400', text: 'text-teal-400' },
  { dot: 'bg-fuchsia-400', bar: 'bg-fuchsia-400', text: 'text-fuchsia-400' },
  { dot: 'bg-cyan-300', bar: 'bg-cyan-300', text: 'text-cyan-300' },
  { dot: 'bg-indigo-400', bar: 'bg-indigo-400', text: 'text-indigo-400' },
];

const SUGGESTIONS = [
  'DSA',
  'Python',
  'AI/ML',
  'Django',
  'SQL',
  'Web Development',
  'System Design',
  'DevOps',
  'React & Next.js',
  'TypeScript',
  'Golang',
  'Rust',
  'Cloud Architecture',
];

export const CategoryDistributionCard: React.FC<CategoryDistributionCardProps> = ({
  totalSprints,
  categoryStats,
  masteredCount = 0,
  onOpenMasteryModal,
  onSelectCategoryFilter,
  onManageTracks,
  activeTracks = ['DSA', 'Python', 'AI/ML', 'Django', 'SQL'],
  onUpdateActiveTracks,
}) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [modalTracks, setModalTracks] = useState<string[]>(activeTracks);
  const [newTrackInput, setNewTrackInput] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  // Deterministic color assignment based on track name
  const getTrackColor = (name: string, index: number) => {
    switch (name.toUpperCase()) {
      case 'DSA':
        return COLOR_PALETTE[0];
      case 'PYTHON':
        return { dot: 'bg-slate-300', bar: 'bg-slate-200', text: 'text-slate-200' };
      case 'DJANGO':
        return { dot: 'bg-emerald-600', bar: 'bg-emerald-600', text: 'text-emerald-400' };
      case 'AI/ML':
      case 'MACHINE LEARNING':
        return COLOR_PALETTE[5];
      case 'SQL':
      case 'DATABASE':
        return COLOR_PALETTE[6];
      case 'REACT':
      case 'FRONTEND':
        return COLOR_PALETTE[1];
      case 'SYSTEM DESIGN':
        return COLOR_PALETTE[3];
      case 'DEVOPS':
      case 'CLOUD':
        return COLOR_PALETTE[2];
      default: {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIdx = Math.abs(hash + index) % COLOR_PALETTE.length;
        return COLOR_PALETTE[colorIdx];
      }
    }
  };

  // Sort: tracks with recorded sprints first, then alphabetical
  const sortedStats = [...categoryStats].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });

  const handleOpenCustomize = () => {
    setModalTracks(activeTracks);
    setIsCustomizeModalOpen(true);
  };

  const handleToggleModalTrack = (track: string) => {
    if (modalTracks.includes(track)) {
      if (modalTracks.length > 1) {
        setModalTracks(modalTracks.filter(t => t !== track));
      }
    } else {
      setModalTracks([...modalTracks, track]);
    }
  };

  const handleAddCustomModalTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTrackInput.trim();
    if (!clean) return;
    if (!modalTracks.map(t => t.toLowerCase()).includes(clean.toLowerCase())) {
      setModalTracks([...modalTracks, clean]);
    }
    setNewTrackInput('');
  };

  const handleSavePreferences = () => {
    if (onUpdateActiveTracks) {
      onUpdateActiveTracks(modalTracks);
    }
    setIsCustomizeModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="rounded-2xl bg-[#131821] border border-[#222a36] p-4 sm:p-6 shadow-sm flex flex-col justify-between relative">
      {/* Toast Notice */}
      {saveToast && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.75rem] font-mono shadow-[0_0_15px_rgba(0,245,160,0.4)] flex items-center gap-1.5 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Preferences saved to Dashboard!</span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">
              category
            </span>
            <h3 className="text-[1.25rem] text-white font-semibold">Category Distribution</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.6875rem] text-[#00f5a0] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/20">
              {categoryStats.length} Tracks
            </span>
            <button
              onClick={handleOpenCustomize}
              className="text-[0.6875rem] text-slate-400 hover:text-[#00f5a0] font-mono flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded bg-[#181f2a] border border-[#2a3240] hover:border-[#00f5a0]/40"
              title="Customize active curriculum tracks"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Customize</span>
            </button>
          </div>
        </div>

        <p className="text-[0.8125rem] text-slate-400 mb-4">
          Session velocity across your personalized learning tracks. Tailored specifically to your curriculum.
        </p>

        {/* Dynamic Topic Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedStats.length > 0 ? (
            sortedStats.map((cat, idx) => {
              const color = getTrackColor(cat.name, idx);
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategoryFilter(cat.name)}
                  className="px-3 py-1.5 rounded-full bg-[#181f2a] border border-[#2a3240] text-slate-200 text-[0.8125rem] flex items-center gap-1.5 shadow-sm hover:border-[#00f5a0]/40 transition-colors cursor-pointer group"
                  title={`Filter by ${cat.name}`}
                >
                  <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                  <span className="font-semibold text-white group-hover:text-[#00f5a0] transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-slate-400 font-mono text-[0.6875rem]">({cat.count})</span>
                </button>
              );
            })
          ) : (
            <div className="text-[0.8125rem] text-slate-500 font-mono italic">
              No tracks configured. Add tracks in settings.
            </div>
          )}
          <button
            onClick={handleOpenCustomize}
            className="px-2.5 py-1.5 rounded-full bg-[#0e141b] border border-dashed border-[#2a3240] hover:border-[#00f5a0]/50 text-slate-400 hover:text-white text-[0.75rem] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>Add Track</span>
          </button>
        </div>

        {/* Inline Stacked Distribution Bar Chart */}
        <div className="rounded-xl bg-[#0e141b] border border-[#222a36] p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6875rem] uppercase text-slate-400 tracking-wider font-mono">
              Curriculum Focus Ratio
            </span>
            <span className="text-[0.6875rem] text-white font-mono">
              {totalSprints} Total Sprint{totalSprints === 1 ? '' : 's'}
            </span>
          </div>

          {/* Stacked Bar Visual */}
          <div className="w-full h-2.5 rounded-full flex overflow-hidden gap-0.5 bg-[#181f2a]">
            {totalSprints > 0 ? (
              sortedStats
                .filter(cat => cat.percentage > 0)
                .map((cat, idx) => {
                  const color = getTrackColor(cat.name, idx);
                  return (
                    <div
                      key={cat.name}
                      className={`h-full ${color.bar} transition-all duration-300`}
                      style={{ width: `${cat.percentage}%` }}
                      title={`${cat.name} (${cat.percentage}%)`}
                    />
                  );
                })
            ) : (
              <div className="w-full h-full bg-[#222a36]" title="No sprints recorded yet" />
            )}
          </div>

          {/* Breakdown labels */}
          <div className="flex items-center justify-between mt-2.5 text-[0.6875rem] font-mono text-slate-400 flex-wrap gap-2">
            {totalSprints > 0 ? (
              sortedStats
                .filter(cat => cat.count > 0)
                .map((cat, idx) => {
                  const color = getTrackColor(cat.name, idx);
                  return (
                    <span key={cat.name} className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                      <span className={color.text}>{cat.name}</span>
                      <span className="text-slate-400">{cat.percentage}%</span>
                    </span>
                  );
                })
            ) : (
              <span className="text-slate-500 font-mono">
                Log sprints in your tracks to generate your curriculum focus ratio
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Mastery Summary Card */}
      <div
        onClick={onOpenMasteryModal}
        className="rounded-xl bg-[#181f2a] border border-[#2a3240] p-4 flex items-center justify-between hover:border-[#00f5a0]/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0e141b] border border-[#222a36] flex items-center justify-center text-[#00f5a0] shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <div>
            <div className="text-[1.125rem] text-white font-semibold group-hover:text-[#00f5a0] transition-colors">
              {masteredCount} Concept{masteredCount === 1 ? '' : 's'} Mastered
            </div>
            <div className="text-[0.75rem] text-slate-400">
              {masteredCount > 0
                ? 'Ahead of your cadence pace'
                : 'Tag sessions with mastery to track breakthroughs'}
            </div>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#00f5a0] text-[24px] group-hover:translate-x-0.5 transition-transform">
          trending_up
        </span>
      </div>

      {/* Customize Tracks Modal (Direct in Category Distribution) */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#131821] border border-[#222a36] p-6 shadow-2xl flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#222a36]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">
                  tune
                </span>
                <h3 className="text-[1.25rem] font-bold text-white">
                  Customize Category Tracks
                </h3>
              </div>
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-[0.8125rem] text-slate-400">
              Configure which learning topics and technologies appear in your Category Distribution.
            </p>

            {/* Active Tracks Section */}
            <div>
              <span className="text-[0.75rem] text-slate-300 font-semibold uppercase font-mono block mb-2">
                Active Tracks ({modalTracks.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {modalTracks.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[#00f5a0] text-[0.8125rem] font-mono font-medium"
                  >
                    <span>{t}</span>
                    {modalTracks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleToggleModalTrack(t)}
                        className="hover:text-red-400 cursor-pointer text-[14px] leading-none"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Add Custom Track Input */}
            <form onSubmit={handleAddCustomModalTrack} className="flex gap-2">
              <input
                type="text"
                value={newTrackInput}
                onChange={e => setNewTrackInput(e.target.value)}
                placeholder="Add custom track (e.g. Rust, GraphQL)..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] placeholder:text-slate-500 focus:border-[#00f5a0]/60 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-white font-medium text-[0.8125rem] transition-colors cursor-pointer"
              >
                + Add
              </button>
            </form>

            {/* Popular Suggestions */}
            <div>
              <span className="text-[0.6875rem] text-slate-500 font-mono block mb-1.5">
                Suggested tracks:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {SUGGESTIONS.filter(s => !modalTracks.includes(s)).map(sug => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => handleToggleModalTrack(sug)}
                    className="px-2 py-0.5 rounded-md bg-[#0e141b] border border-[#222a36] text-slate-400 hover:text-white hover:border-[#00f5a0]/40 text-[0.6875rem] font-mono transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="text-[#00f5a0]">+</span>
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#222a36]">
              {onManageTracks ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomizeModalOpen(false);
                    onManageTracks();
                  }}
                  className="text-[0.75rem] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Full Goal & Settings page &rarr;
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white text-[0.8125rem] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.875rem] shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
