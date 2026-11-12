import React, { useState } from 'react';
import { GoalSettings, LearningSession, UserProfile } from '../types';
import { exportToMarkdown, exportToCSV } from '../utils/exportUtils';

interface GoalSettingsViewProps {
  settings: GoalSettings;
  onUpdateSettings: (newSettings: GoalSettings) => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  sessions: LearningSession[];
  onImportSessions: (sessions: LearningSession[]) => void;
  onResetData: () => void;
  onBackToDashboard: () => void;
}

export const GoalSettingsView: React.FC<GoalSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  profile,
  onUpdateProfile,
  sessions,
  onImportSessions,
  onResetData,
  onBackToDashboard,
}) => {
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoalMinutes);
  const [weeklyDays, setWeeklyDays] = useState(settings.weeklyGoalDays);
  const [momentumDays, setMomentumDays] = useState(settings.momentumGuardDays);
  const [streakFreezes, setStreakFreezes] = useState(settings.streakFreezeRemaining);
  const [activeTracks, setActiveTracks] = useState<string[]>(settings.activeTracks);
  const [newTrackInput, setNewTrackInput] = useState('');

  // Profile fields
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [mobileNumber, setMobileNumber] = useState(profile.mobileNumber);
  const [title, setTitle] = useState(profile.title || 'Full Stack Engineer');

  const [savedNotice, setSavedNotice] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const SUGGESTED_TRACKS = [
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
    'Kubernetes',
    'Mobile (Flutter/Swift)',
    'Cybersecurity',
    'Cloud Architecture',
  ];

  const handleToggleTrack = (track: string) => {
    if (activeTracks.includes(track)) {
      if (activeTracks.length > 1) {
        setActiveTracks(activeTracks.filter(t => t !== track));
      }
    } else {
      setActiveTracks([...activeTracks, track]);
    }
  };

  const handleAddCustomTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTrackInput.trim();
    if (!clean) return;
    if (!activeTracks.map(t => t.toLowerCase()).includes(clean.toLowerCase())) {
      setActiveTracks([...activeTracks, clean]);
    }
    setNewTrackInput('');
  };

  const handleRemoveTrack = (track: string) => {
    if (activeTracks.length > 1) {
      setActiveTracks(activeTracks.filter(t => t !== track));
    }
  };

  const handleApplyPreset = (presetTracks: string[]) => {
    setActiveTracks(presetTracks);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      dailyGoalMinutes: dailyGoal,
      weeklyGoalDays: weeklyDays,
      momentumGuardDays: momentumDays,
      streakFreezeRemaining: streakFreezes,
      activeTracks,
    });
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Developer',
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      title: title.trim(),
      profileCompleted: true,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onBackToDashboard();
    }, 600);
  };

  const handleExportJSON = () => {
    const dataToExport = {
      settings: {
        dailyGoalMinutes: dailyGoal,
        weeklyGoalDays: weeklyDays,
        momentumGuardDays: momentumDays,
        streakFreezeRemaining: streakFreezes,
        activeTracks,
      },
      sessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `streaktracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(sessions, profile, {
      dailyGoalMinutes: dailyGoal,
      weeklyGoalDays: weeklyDays,
      momentumGuardDays: momentumDays,
      streakFreezeRemaining: streakFreezes,
      activeTracks,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(sessions);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.sessions && Array.isArray(parsed.sessions)) {
          onImportSessions(parsed.sessions);
          if (parsed.settings) {
            onUpdateSettings(parsed.settings);
            setDailyGoal(parsed.settings.dailyGoalMinutes);
            setWeeklyDays(parsed.settings.weeklyGoalDays);
            setMomentumDays(parsed.settings.momentumGuardDays);
            setStreakFreezes(parsed.settings.streakFreezeRemaining);
            setActiveTracks(parsed.settings.activeTracks || activeTracks);
          }
          setImportMessage(`Successfully restored ${parsed.sessions.length} sessions from backup!`);
          setTimeout(() => setImportMessage(null), 4000);
        }
      } catch {
        setImportMessage('Error: Invalid backup JSON file format.');
        setTimeout(() => setImportMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#131821] border border-[#222a36]">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer mr-1"
              title="Return to Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h2 className="text-[1.25rem] font-bold text-white">Cadence & Goal Preferences</h2>
          </div>
          <p className="text-[0.875rem] text-slate-400 mt-1">
            Fine-tune daily minutes thresholds, streak buffer protections, and tracking priorities.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-lg bg-[#0e141b] hover:bg-[#181f2a] border border-[#222a36] text-slate-300 hover:text-white text-[0.875rem] transition-colors self-start sm:self-center cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[#00f5a0] text-[0.875rem] font-mono flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Preferences updated and synchronized across all metrics!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Card 0: Developer Profile Information */}
        <div className="p-6 rounded-2xl bg-[#131821] border border-[#222a36] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#222a36]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">
                person
              </span>
              <h3 className="text-[1.0625rem] font-semibold text-white">Developer Profile Information</h3>
            </div>
            <span className="text-[0.6875rem] text-[#00f5a0] font-mono">Personal Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
                User's Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Developer Name"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] focus:border-[#00f5a0]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
                Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] font-mono focus:border-[#00f5a0]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] font-mono focus:border-[#00f5a0]/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 1: Core Daily & Weekly Metrics */}
        <div className="p-6 rounded-2xl bg-[#131821] border border-[#222a36] space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222a36]">
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">
              flag
            </span>
            <h3 className="text-[1.0625rem] font-semibold text-white">Daily Target Velocity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[0.875rem] text-slate-300 font-medium">
                  Daily Study Goal (Minutes)
                </label>
                <span className="text-[1.125rem] font-bold font-mono text-[#00f5a0]">
                  {dailyGoal} min
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={dailyGoal}
                onChange={e => setDailyGoal(Number(e.target.value))}
                className="w-full accent-[#00f5a0] cursor-pointer"
              />
              <div className="flex justify-between text-[0.6875rem] text-slate-500 font-mono mt-1">
                <span>15 min</span>
                <span>60 min (Standard)</span>
                <span>180 min</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[0.875rem] text-slate-300 font-medium">
                  Weekly Target Active Days
                </label>
                <span className="text-[1.125rem] font-bold font-mono text-white">
                  {weeklyDays} / 7 days
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="7"
                step="1"
                value={weeklyDays}
                onChange={e => setWeeklyDays(Number(e.target.value))}
                className="w-full accent-[#00f5a0] cursor-pointer"
              />
              <div className="flex justify-between text-[0.6875rem] text-slate-500 font-mono mt-1">
                <span>3 days (Light)</span>
                <span>5 days</span>
                <span>7 days (No rest days)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Momentum Guard & Streak Freeze */}
        <div className="p-6 rounded-2xl bg-[#131821] border border-[#222a36] space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222a36]">
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">
              shield
            </span>
            <h3 className="text-[1.0625rem] font-semibold text-white">Streak Shields & Momentum Guard</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.875rem] text-slate-300 font-medium mb-1">
                Inactivity Warning Threshold
              </label>
              <p className="text-[0.75rem] text-slate-400 mb-2">
                Alert trigger when a critical track is untouched.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={momentumDays}
                  onChange={e => setMomentumDays(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white font-mono focus:border-[#00f5a0]/60 focus:outline-none"
                />
                <span className="text-[0.8125rem] text-slate-400 font-mono">days of inactivity</span>
              </div>
            </div>

            <div>
              <label className="block text-[0.875rem] text-slate-300 font-medium mb-1">
                Streak Freeze Reserve
              </label>
              <p className="text-[0.75rem] text-slate-400 mb-2">
                Automatic protection tokens preventing streak resets on emergency days.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={streakFreezes}
                  onChange={e => setStreakFreezes(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white font-mono focus:border-[#00f5a0]/60 focus:outline-none"
                />
                <span className="text-[0.8125rem] text-slate-400 font-mono">freezes remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Active Curriculum Tracks */}
        <div className="p-6 rounded-2xl bg-[#131821] border border-[#222a36] space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#222a36]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">
                category
              </span>
              <h3 className="text-[1.0625rem] font-semibold text-white">Your Personalized Learning Tracks</h3>
            </div>
            <span className="text-[0.6875rem] text-[#00f5a0] font-mono px-2 py-0.5 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/20">
              {activeTracks.length} Active Tracks
            </span>
          </div>

          <p className="text-[0.8125rem] text-slate-400">
            Customize which engineering disciplines and technologies you are actively tracking. The Category Distribution chart and session logger adapt automatically to your choices.
          </p>

          {/* Quick Curriculum Presets */}
          <div>
            <span className="block text-[0.75rem] text-slate-400 font-mono mb-2">
              Quick Career Track Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Full Stack', tracks: ['React & Next.js', 'TypeScript', 'Node.js', 'SQL', 'DSA'] },
                { name: 'AI / ML Engineer', tracks: ['Python', 'AI/ML', 'PyTorch & LLMs', 'SQL', 'Math & Stats'] },
                { name: 'Backend & Cloud', tracks: ['Golang', 'Kubernetes', 'System Design', 'PostgreSQL', 'DevOps'] },
                { name: 'DSA / LeetCode Sprint', tracks: ['DSA', 'Algorithms', 'Dynamic Programming', 'Graph Theory', 'System Design'] },
                { name: 'Mobile Developer', tracks: ['Mobile (Flutter/Swift)', 'TypeScript', 'Firebase', 'System Design'] },
              ].map(preset => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset.tracks)}
                  className="px-2.5 py-1 rounded-lg text-[0.75rem] font-mono bg-[#0e141b] border border-[#222a36] text-slate-300 hover:text-white hover:border-[#00f5a0]/40 transition-colors cursor-pointer"
                >
                  ⚡ {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tracks Grid */}
          <div>
            <span className="block text-[0.75rem] text-slate-400 font-mono mb-2">
              Current Active Tracks:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {activeTracks.map(track => (
                <div
                  key={track}
                  className="p-3 rounded-xl border bg-[#181f2a] border-[#00f5a0]/40 text-white flex items-center justify-between shadow-sm group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#00f5a0] shrink-0" />
                    <span className="font-semibold text-[0.8125rem] truncate" title={track}>
                      {track}
                    </span>
                  </div>
                  {activeTracks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(track)}
                      className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      title={`Remove ${track}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Track Input */}
          <div className="pt-2 border-t border-[#222a36]">
            <span className="block text-[0.75rem] text-slate-400 font-mono mb-2">
              Add Any Custom Technology or Subject:
            </span>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newTrackInput}
                onChange={e => setNewTrackInput(e.target.value)}
                placeholder="e.g., Rust, GraphQL, Docker, Solidity..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] focus:border-[#00f5a0]/60 focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTrack(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTrack}
                className="px-4 py-1.5 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.8125rem] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Track</span>
              </button>
            </div>
          </div>

          {/* Suggested Track Quick Add Pills */}
          <div>
            <span className="block text-[0.6875rem] text-slate-500 font-mono mb-1.5">
              Suggestions you can click to add:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TRACKS.filter(t => !activeTracks.includes(t)).slice(0, 10).map(sug => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => handleToggleTrack(sug)}
                  className="px-2 py-0.5 rounded-md bg-[#0e141b] border border-[#222a36] text-slate-400 hover:text-white hover:border-[#00f5a0]/40 text-[0.6875rem] font-mono transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#00f5a0]">+</span>
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Backup & Data Management */}
        <div className="p-6 rounded-2xl bg-[#131821] border border-[#222a36] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222a36]">
            <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">
              database
            </span>
            <h3 className="text-[1.0625rem] font-semibold text-white">Data Portability & State</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-white text-[0.8125rem] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download raw JSON backup"
            >
              <span className="material-symbols-outlined text-[17px]">data_object</span>
              <span>JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3.5 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-[#00f5a0] text-[0.8125rem] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download formatted learning notes for Notion / GitHub"
            >
              <span className="material-symbols-outlined text-[17px]">description</span>
              <span>Markdown Log (.md)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-300 hover:text-white text-[0.8125rem] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download spreadsheet CSV file"
            >
              <span className="material-symbols-outlined text-[17px]">table_chart</span>
              <span>Spreadsheet (.csv)</span>
            </button>

            <label className="px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-white text-[0.8125rem] font-medium flex items-center gap-2 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">upload</span>
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-400 text-[0.8125rem] font-medium flex items-center gap-2 transition-colors cursor-pointer ml-auto"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reset to Defaults</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 ml-auto p-1.5 rounded-lg bg-red-950/70 border border-red-800">
                <span className="text-[0.75rem] text-red-200 font-mono pl-1">Reset all data?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[0.75rem] font-bold cursor-pointer transition-colors"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 rounded text-slate-300 hover:text-white text-[0.75rem] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.9375rem] shadow-[0_0_20px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Save Preferences & Return to Dashboard</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>
        </div>
      </form>
    </div>
  );
};
