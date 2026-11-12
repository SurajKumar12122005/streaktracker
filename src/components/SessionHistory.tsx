import React, { useState } from 'react';
import { LearningSession } from '../types';

interface SessionHistoryProps {
  sessions: LearningSession[];
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  onEditSession: (session: LearningSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenRecordModal?: () => void;
  activeTracks?: string[];
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
  onEditSession,
  onDeleteSession,
  onOpenRecordModal,
  activeTracks = [],
}) => {
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  // Derive unique categories from user's active tracks and logged sessions
  const dynamicCategories = Array.from(
    new Set([
      ...activeTracks,
      ...sessions.map(s => s.category).filter(Boolean),
    ])
  );

  // Helper for category badge styling and short abbreviation
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'DSA':
        return {
          abbr: 'DSA',
          textColor: 'text-[#00f5a0]',
          badgeClass: 'bg-[#00f5a0]/10 border-[#00f5a0]/20 text-[#00f5a0]',
        };
      case 'Django':
        return {
          abbr: 'DJ',
          textColor: 'text-slate-300',
          badgeClass: 'bg-slate-800 border-slate-700 text-slate-300',
        };
      case 'AI/ML':
        return {
          abbr: 'ML',
          textColor: 'text-emerald-400',
          badgeClass: 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400',
        };
      case 'SQL':
        return {
          abbr: 'SQL',
          textColor: 'text-slate-300',
          badgeClass: 'bg-slate-800 border-slate-700 text-slate-300',
        };
      case 'Python':
        return {
          abbr: 'PY',
          textColor: 'text-slate-200',
          badgeClass: 'bg-slate-800 border-slate-700 text-slate-200',
        };
      default:
        return {
          abbr: cat.slice(0, 3).toUpperCase(),
          textColor: 'text-teal-400',
          badgeClass: 'bg-teal-950/40 border-teal-800/40 text-teal-300',
        };
    }
  };

  // Format date helper: "2025-10-24" -> "Oct 24, 2025"
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return 'Oct 24, 2025';
    try {
      const [year, month, day] = dateStr.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      session.category.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      session.title.toLowerCase().includes(q) ||
      session.notes.toLowerCase().includes(q) ||
      session.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="rounded-2xl bg-[#131821] border border-[#222a36] p-4 sm:p-6 shadow-sm flex flex-col gap-4">
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h3 className="text-[1.25rem] text-white font-semibold">
            Recorded Learning Cadence
          </h3>
          <p className="text-[0.8125rem] text-slate-400">
            Review, filter, and inspect your latest technical sessions.
          </p>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search bar input */}
          <div className="relative w-full sm:w-auto sm:min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search concepts (e.g. Binary Search, Joins)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] placeholder:text-slate-500 focus:bg-[#181f2a] focus:border-[#00f5a0]/60 focus:outline-none transition-all"
            />
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] focus:border-[#00f5a0]/60 focus:outline-none transition-all cursor-pointer font-mono"
          >
            <option value="ALL">All Categories</option>
            {dynamicCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Filter action badge / button */}
          <button
            onClick={() => {}}
            className="px-3.5 py-1.5 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.8125rem] hover:brightness-110 transition-colors shadow-sm cursor-pointer"
          >
            Filter
          </button>

          {/* Clear Filters */}
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-[0.8125rem] font-medium transition-colors hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Sessions Feed */}
      <div className="flex flex-col gap-2.5">
        {filteredSessions.length > 0 ? (
          filteredSessions.map(session => {
            const catInfo = getCategoryDetails(session.category);
            const isCodeExpanded = expandedCodeId === session.id;

            return (
              <div
                key={session.id}
                className="session-card rounded-xl bg-[#0e141b] border border-[#222a36] hover:border-slate-700 p-4 transition-all duration-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start md:items-center gap-3.5">
                    {/* Category Monogram */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-[#181f2a] border border-[#2a3240] ${catInfo.textColor} flex items-center justify-center text-[0.75rem] font-bold font-mono shrink-0 shadow-inner`}
                    >
                      {catInfo.abbr}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[1.0625rem] text-white font-semibold">
                          {session.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[0.6875rem] font-mono ${catInfo.badgeClass}`}
                        >
                          {session.category}
                        </span>
                        <span className="text-[0.75rem] text-slate-400 font-mono">
                          {session.durationMinutes} mins
                        </span>
                        {session.mastered && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[0.625rem] font-mono">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            Mastered
                          </span>
                        )}
                      </div>

                      <p className="text-[0.8125rem] text-slate-400 mt-1 leading-relaxed">
                        {session.notes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0">
                    <span className="text-[0.75rem] text-slate-400 font-mono">
                      {formatDateLabel(session.date)}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {session.codeSnippet && (
                        <button
                          onClick={() =>
                            setExpandedCodeId(isCodeExpanded ? null : session.id)
                          }
                          className="p-1.5 rounded-md hover:bg-[#181f2a] text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="View code snippet"
                        >
                          <span className="material-symbols-outlined text-[18px]">code</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditSession(session)}
                        className="p-1.5 rounded-md hover:bg-[#181f2a] text-slate-400 hover:text-[#00f5a0] transition-colors cursor-pointer"
                        title="Edit session"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 rounded-md hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Code Snippet Box */}
                {session.codeSnippet && isCodeExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#1b222d] font-mono text-[0.75rem]">
                    <div className="flex items-center justify-between text-slate-400 text-[0.6875rem] mb-1">
                      <span>Code Solution / Snippet:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(session.codeSnippet || '');
                        }}
                        className="hover:text-white flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        Copy
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#0b0d11] border border-[#222a36] text-[#00f5a0] overflow-x-auto leading-relaxed">
                      <code>{session.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        ) : sessions.length === 0 ? (
          /* Clean Initial Division for New User */
          <div className="text-center py-12 px-4 bg-[#0e141b] border border-[#222a36] rounded-xl flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-[#00f5a0] mb-3 shadow-inner">
              <span
                className="material-symbols-outlined text-[30px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <h4 className="text-[1.125rem] text-white font-semibold">
              No recorded learning sessions yet
            </h4>
            <p className="text-[0.8125rem] text-slate-400 mt-1 max-w-md">
              Your learning cadence feed is ready. Record your first sprint to start tracking technical progress and maintain your streak!
            </p>
            {onOpenRecordModal && (
              <button
                onClick={onOpenRecordModal}
                className="mt-4 px-4 py-2 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.875rem] hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                <span>+ Record Your First Sprint</span>
              </button>
            )}
          </div>
        ) : (
          /* Empty Search / Filter Notice */
          <div className="text-center py-10 bg-[#0e141b] border border-[#222a36] rounded-xl">
            <span className="material-symbols-outlined text-slate-500 text-[40px]">
              search_off
            </span>
            <p className="text-[1.125rem] text-white mt-2 font-semibold">
              No matching sessions found
            </p>
            <p className="text-[0.8125rem] text-slate-400 mt-0.5">
              Try refining your search keyword or clearing the category filter.
            </p>
            <button
              onClick={onClearFilters}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#00f5a0] text-black text-[0.8125rem] font-semibold cursor-pointer hover:brightness-110 transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
