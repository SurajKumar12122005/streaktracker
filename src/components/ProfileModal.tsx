import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  currentStreak: number;
  totalHours: string;
  totalDays: number;
  onOpenGoogleSheetsModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  currentStreak,
  totalHours,
  totalDays,
  onOpenGoogleSheetsModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [mobileNumber, setMobileNumber] = useState(profile.mobileNumber);
  const [title, setTitle] = useState(profile.title || 'Full Stack Engineer');
  const [bio, setBio] = useState(profile.bio || '');

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setMobileNumber(profile.mobileNumber);
    setTitle(profile.title || 'Full Stack Engineer');
    setBio(profile.bio || '');
    setIsEditing(false);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Developer',
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      title: title.trim(),
      bio: bio.trim(),
      profileCompleted: true,
    });
    setIsEditing(false);
  };

  // Get user initials for avatar
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0] ? parts[0].slice(0, 2) : 'SS').toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">
              account_circle
            </span>
            <h3 className="text-[1.125rem] font-semibold">Developer Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Profile Card Header with Initials */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0e141b] border border-[#222a36]">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-[#181f2a] border border-[#00f5a0]/40 flex items-center justify-center text-[#00f5a0] font-mono font-bold text-[1.25rem] shadow-[0_0_15px_rgba(0,245,160,0.15)]">
              {getInitials(profile.name)}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00f5a0] text-black flex items-center justify-center ring-2 ring-[#0e141b]"
              title="Verified Active Streak"
            >
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[1.125rem] font-bold text-white truncate">
                {profile.name}
              </h4>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 rounded bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-300 hover:text-white text-[0.75rem] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Edit
                </button>
              )}
            </div>
            <p className="text-[0.8125rem] text-[#00f5a0] font-mono truncate">
              {profile.title || 'Full Stack Engineer'}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[0.6875rem] font-mono text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" />
                Online
              </span>
              <span>•</span>
              <span>{currentStreak} Day Streak</span>
            </div>
          </div>
        </div>

        {/* View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="space-y-3">
            {/* User Details */}
            <div className="space-y-2 text-[0.875rem]">
              {/* Full Name */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e141b]/60 border border-[#222a36]">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    badge
                  </span>
                  <span className="text-[0.8125rem]">Full Name</span>
                </div>
                <span className="font-medium text-white">{profile.name}</span>
              </div>

              {/* Email ID */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e141b]/60 border border-[#222a36]">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    mail
                  </span>
                  <span className="text-[0.8125rem]">Email ID</span>
                </div>
                <span className="font-mono text-white text-[0.8125rem]">
                  {profile.email}
                </span>
              </div>

              {/* Mobile Number */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e141b]/60 border border-[#222a36]">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    call
                  </span>
                  <span className="text-[0.8125rem]">Mobile Number</span>
                </div>
                <span className="font-mono text-white text-[0.8125rem]">
                  {profile.mobileNumber}
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-lg bg-[#0e141b] border border-[#222a36] text-center">
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-mono">
                  Streak
                </span>
                <span className="text-[1.25rem] font-bold text-[#00f5a0] font-mono">
                  {currentStreak}d
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e141b] border border-[#222a36] text-center">
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-mono">
                  Study Hours
                </span>
                <span className="text-[1.25rem] font-bold text-white font-mono">
                  {totalHours}h
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e141b] border border-[#222a36] text-center">
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-mono">
                  Days Logged
                </span>
                <span className="text-[1.25rem] font-bold text-white font-mono">
                  {totalDays}d
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#222a36]">
              {onOpenGoogleSheetsModal ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGoogleSheetsModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 border border-[#00f5a0]/40 text-[#00f5a0] text-[0.8125rem] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">table_chart</span>
                  <span>Google Sheets Sync</span>
                </button>
              ) : <div />}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] text-slate-200 text-[0.875rem] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-3.5 text-[0.875rem]">
            <div>
              <label className="block text-[0.75rem] text-slate-300 font-mono mb-1">
                User Name <span className="text-[#00f5a0]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] text-slate-300 font-mono mb-1">
                Email ID <span className="text-[#00f5a0]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] text-slate-300 font-mono mb-1">
                Mobile Number <span className="text-[#00f5a0]">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] text-slate-300 font-mono mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Engineer, Systems Architect"
                className="w-full px-3 py-2 rounded-lg bg-[#0e141b] border border-[#222a36] text-white focus:border-[#00f5a0]/60 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222a36]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] text-[0.875rem] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#00f5a0] text-black font-bold text-[0.875rem] shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
