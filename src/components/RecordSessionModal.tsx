import React, { useState, useEffect } from 'react';
import { LearningSession } from '../types';
import { getTodayStr } from '../utils/dateUtils';

interface RecordSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (sessionData: Omit<LearningSession, 'id' | 'createdAt'> & { id?: string }) => void;
  initialSession?: LearningSession | null;
  defaultDate?: string;
  activeTracks?: string[];
  onAddTrack?: (track: string) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const RecordSessionModal: React.FC<RecordSessionModalProps> = ({
  isOpen,
  onClose,
  onSaveSession,
  initialSession,
  defaultDate = getTodayStr(),
  activeTracks = ['DSA', 'Python', 'AI/ML', 'Django', 'SQL'],
  onAddTrack,
  onDeleteSession,
}) => {
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState(activeTracks[0] || 'DSA');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [date, setDate] = useState(defaultDate);
  const [notes, setNotes] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [mastered, setMastered] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    if (initialSession) {
      setConcept(initialSession.title);
      setCategory(initialSession.category);
      setDurationMinutes(initialSession.durationMinutes);
      setDate(initialSession.date);
      setNotes(initialSession.notes);
      setCodeSnippet(initialSession.codeSnippet || '');
      setMastered(!!initialSession.mastered);
      setShowCodeInput(!!initialSession.codeSnippet);
    } else {
      setConcept('');
      setCategory('DSA');
      setDurationMinutes(30);
      setDate(defaultDate);
      setNotes('');
      setCodeSnippet('');
      setMastered(false);
      setShowCodeInput(false);
    }
  }, [initialSession, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCategory && customCategoryName.trim()
      ? customCategoryName.trim()
      : category;

    if (isCustomCategory && customCategoryName.trim() && onAddTrack) {
      onAddTrack(customCategoryName.trim());
    }

    onSaveSession({
      id: initialSession?.id,
      title: concept.trim(),
      category: finalCategory,
      durationMinutes: Number(durationMinutes) || 15,
      date,
      notes: notes.trim() || 'Cadence session logged successfully.',
      codeSnippet: showCodeInput && codeSnippet.trim() ? codeSnippet.trim() : undefined,
      mastered,
    });

    onClose();
  };

  const presetDurations = [15, 30, 45, 60, 90];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#222a36]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <div>
              <h3 className="text-[1.25rem] text-white font-semibold leading-none">
                {initialSession ? 'Edit Learning Session' : 'Record Learning Session'}
              </h3>
              <p className="text-[0.75rem] text-slate-400 mt-1 font-mono">
                Log technical progress & synchronize learning velocity
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-[0.875rem]">
          {/* Concept / Title */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
              Concept / Title <span className="text-[#00f5a0]">*</span>
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="e.g., Dynamic Programming Knapsack, Red-Black Trees, Kafka Partitions..."
              className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white placeholder:text-slate-500 focus:border-[#00f5a0]/60 focus:outline-none transition-all"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[0.8125rem] text-slate-300 font-medium">
                  Category Track
                </label>
                {isCustomCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="text-[0.6875rem] text-[#00f5a0] hover:underline font-mono"
                  >
                    Select existing
                  </button>
                )}
              </div>

              {!isCustomCategory ? (
                <select
                  value={category}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCategory(true);
                      setCustomCategoryName('');
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none transition-all cursor-pointer font-mono text-[0.8125rem]"
                >
                  {activeTracks.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="__custom__">+ Add New Custom Track...</option>
                </select>
              ) : (
                <input
                  type="text"
                  required
                  autoFocus
                  value={customCategoryName}
                  onChange={e => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Rust, PyTorch, Golang..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#00f5a0]/50 text-white font-mono text-[0.8125rem] focus:outline-none focus:ring-1 focus:ring-[#00f5a0]"
                />
              )}
            </div>

            <div>
              <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none font-mono transition-all"
              />
            </div>
          </div>

          {/* Duration with presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[0.8125rem] text-slate-300 font-medium">
                Duration (Minutes)
              </label>
              <span className="text-[0.75rem] font-mono text-[#00f5a0]">{durationMinutes} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="360"
                step="5"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 5)}
                className="w-28 px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none font-mono"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {presetDurations.map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setDurationMinutes(m)}
                    className={`px-2.5 py-1 rounded text-[0.75rem] font-mono transition-colors cursor-pointer ${
                      durationMinutes === m
                        ? 'bg-[#00f5a0] text-black font-bold'
                        : 'bg-[#181f2a] text-slate-300 hover:bg-[#222a36] border border-[#2a3240]'
                    }`}
                  >
                    +{m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
              Key Takeaways & Code Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Document algorithmic invariants, edge cases, space/time complexity notes, or practical discoveries..."
              className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white placeholder:text-slate-500 focus:border-[#00f5a0]/60 focus:outline-none transition-all leading-relaxed"
            />
          </div>

          {/* Code Snippet Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className="text-[0.75rem] text-slate-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showCodeInput ? 'expand_less' : 'code'}
                </span>
                <span>{showCodeInput ? 'Hide Code Snippet' : '+ Attach Code Snippet'}</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mastered}
                  onChange={e => setMastered(e.target.checked)}
                  className="rounded border-[#222a36] text-[#00f5a0] focus:ring-[#00f5a0] bg-[#0e141b]"
                />
                <span className="text-[0.75rem] text-slate-300 font-mono">
                  Concept Mastered
                </span>
              </label>
            </div>

            {showCodeInput && (
              <textarea
                rows={3}
                value={codeSnippet}
                onChange={e => setCodeSnippet(e.target.value)}
                placeholder="def solve(nums): ..."
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-[#00f5a0] font-mono text-[0.75rem] placeholder:text-slate-600 focus:border-[#00f5a0]/60 focus:outline-none transition-all"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#222a36]">
            {initialSession && onDeleteSession ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteSession(initialSession.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 font-medium text-[0.8125rem] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Session</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] font-medium text-[0.875rem] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.875rem] shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                {initialSession ? 'Save Changes' : 'Save Session'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
