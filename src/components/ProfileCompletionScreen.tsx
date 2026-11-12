import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileCompletionScreenProps {
  email: string;
  userId: string;
  onComplete: (profile: UserProfile, dailyGoalMinutes: number, activeTracks?: string[]) => void;
  onSignOut: () => void;
}

const CAREER_TRACK_PRESETS: { label: string; role: string; tracks: string[] }[] = [
  {
    label: 'Full Stack Web',
    role: 'Full Stack Engineer',
    tracks: ['React & Next.js', 'TypeScript', 'Node.js', 'SQL', 'DSA'],
  },
  {
    label: 'AI / Machine Learning',
    role: 'AI / ML Engineer',
    tracks: ['Python', 'AI/ML', 'PyTorch & LLMs', 'SQL', 'Math & Stats'],
  },
  {
    label: 'Backend & Cloud',
    role: 'Backend Architect',
    tracks: ['Golang', 'Kubernetes', 'System Design', 'PostgreSQL', 'DevOps'],
  },
  {
    label: 'DSA & Algorithms',
    role: 'Competitive Programmer',
    tracks: ['DSA', 'Algorithms', 'Dynamic Programming', 'Graph Theory', 'System Design'],
  },
  {
    label: 'Mobile Development',
    role: 'Mobile Engineer',
    tracks: ['Mobile (Flutter/Swift)', 'TypeScript', 'Firebase', 'System Design'],
  },
];

export const ProfileCompletionScreen: React.FC<ProfileCompletionScreenProps> = ({
  email,
  userId,
  onComplete,
  onSignOut,
}) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [title, setTitle] = useState('Full Stack Engineer');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([
    'React & Next.js',
    'TypeScript',
    'Node.js',
    'SQL',
    'DSA',
  ]);
  const [customTrackInput, setCustomTrackInput] = useState('');
  const [dailyGoal, setDailyGoal] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleTrack = (track: string) => {
    if (selectedTracks.includes(track)) {
      if (selectedTracks.length > 1) {
        setSelectedTracks(selectedTracks.filter(t => t !== track));
      }
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleAddCustomTrack = () => {
    const clean = customTrackInput.trim();
    if (clean && !selectedTracks.map(t => t.toLowerCase()).includes(clean.toLowerCase())) {
      setSelectedTracks([...selectedTracks, clean]);
      setCustomTrackInput('');
    }
  };

  const handleSelectPreset = (preset: typeof CAREER_TRACK_PRESETS[0]) => {
    setTitle(preset.role);
    setSelectedTracks(preset.tracks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!mobileNumber.trim() || mobileNumber.trim().length < 7) {
      setErrorMsg('Please enter a valid mobile contact number.');
      return;
    }

    if (selectedTracks.length === 0) {
      setErrorMsg('Please select or add at least one learning track.');
      return;
    }

    setIsSubmitting(true);

    const newProfile: UserProfile = {
      userId,
      name: name.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      title: title.trim(),
      bio: `Focused on ${selectedTracks.slice(0, 3).join(', ')} and daily engineering cadence.`,
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onComplete(newProfile, dailyGoal, selectedTracks);
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background glow meshes */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00f5a0]/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full rounded-2xl bg-[#131821] border border-[#222a36] p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col gap-6 relative z-10 animate-in fade-in zoom-in-95">
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f5a0] animate-pulse" />
            <span className="text-[0.6875rem] uppercase font-mono text-[#00f5a0] tracking-wider">
              Setup • Personalize Your Curriculum
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="text-[0.75rem] text-slate-400 hover:text-white font-mono cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        <div>
          <h2 className="text-[1.375rem] font-bold text-white tracking-tight">
            Complete Your Profile & Select Tracks
          </h2>
          <p className="text-[0.8125rem] text-slate-400 mt-1">
            Choose the engineering domains you want to track. Your dashboard, streak cadence, and category distribution will be personalized to your goals.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-[0.8125rem] flex items-center gap-2 font-mono">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-[0.875rem]">
          {/* User's Name */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
              Your Full Name <span className="text-[#00f5a0]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Suraj Sasi"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none transition-all"
            />
          </div>

          {/* Email ID (Verified) */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
              Verified Email ID
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e141b]/60 border border-[#222a36] text-slate-400 font-mono text-[0.8125rem] cursor-not-allowed"
              />
              <span className="absolute right-3 top-2.5 text-[#00f5a0] text-[0.75rem] font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Verified
              </span>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
              Mobile Contact Number <span className="text-[#00f5a0]">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-[18px]">
                call
              </span>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="+1 (555) 234-5678 or +91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white font-mono focus:border-[#00f5a0]/60 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Developer Title */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1">
              Developer Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Full Stack Engineer, AI Researcher, etc."
              className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.8125rem] focus:border-[#00f5a0]/60 focus:outline-none"
            />
          </div>

          {/* Career Presets */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1.5">
              Choose Quick Track Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAREER_TRACK_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg text-left bg-[#0e141b] hover:bg-[#181f2a] border border-[#222a36] hover:border-[#00f5a0]/50 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="font-semibold text-[0.75rem] text-[#00f5a0]">{preset.label}</div>
                  <div className="text-[0.625rem] text-slate-400 truncate font-mono">
                    {preset.tracks.slice(0, 3).join(', ')}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Personalized Active Tracks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[0.8125rem] text-slate-300 font-medium">
                Your Active Learning Tracks ({selectedTracks.length})
              </label>
              <span className="text-[0.6875rem] text-[#00f5a0] font-mono">Click to remove</span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-[#0e141b] border border-[#222a36] min-h-[44px]">
              {selectedTracks.map(t => (
                <span
                  key={t}
                  onClick={() => handleToggleTrack(t)}
                  className="px-2.5 py-1 rounded-md bg-[#181f2a] border border-[#00f5a0]/40 text-[#00f5a0] text-[0.75rem] font-mono flex items-center gap-1.5 cursor-pointer hover:bg-red-950/40 hover:border-red-500/50 hover:text-red-300 transition-colors"
                  title="Click to remove track"
                >
                  <span>{t}</span>
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </span>
              ))}
            </div>

            {/* Add Custom Track Input */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={customTrackInput}
                onChange={e => setCustomTrackInput(e.target.value)}
                placeholder="Type custom track (e.g. Rust, PyTorch, GraphQL)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.8125rem] focus:border-[#00f5a0]/60 focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTrack();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTrack}
                className="px-3 py-1.5 rounded-lg bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] hover:border-[#00f5a0]/50 text-[0.75rem] font-mono transition-colors cursor-pointer shrink-0"
              >
                + Add Track
              </button>
            </div>
          </div>

          {/* Daily Goal Presets */}
          <div>
            <label className="block text-[0.8125rem] text-slate-300 font-medium mb-1.5">
              Initial Daily Learning Goal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDailyGoal(m)}
                  className={`py-1.5 rounded-lg text-[0.75rem] font-mono transition-colors cursor-pointer ${
                    dailyGoal === m
                      ? 'bg-[#00f5a0] text-black font-bold'
                      : 'bg-[#181f2a] text-slate-300 hover:bg-[#222a36] border border-[#2a3240]'
                  }`}
                >
                  {m} mins
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[#222a36]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.9375rem] shadow-[0_0_20px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Unlock StreakTracker With My Tracks</span>
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
