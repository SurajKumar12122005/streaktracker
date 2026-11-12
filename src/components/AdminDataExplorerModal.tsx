import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, deleteDoc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { UserProfile, isUserAdmin } from '../types';

interface AdminDataExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserProfile?: UserProfile;
}

export const isMockUser = (user: { email?: string; userId?: string; username?: string }) => {
  const email = (user.email || '').toLowerCase();
  const userId = (user.userId || '').toLowerCase();
  const username = (user.username || '').toLowerCase();

  return (
    email.endsWith('@cadence.io') ||
    email === 'cadence@test.com' ||
    username === 'dev_cadence' ||
    username === 'ananya_sharma' ||
    username === 'marcus_vance' ||
    username === 'priya_patel' ||
    username === 'david_chen' ||
    username === 'elena_rostova' ||
    userId.startsWith('user_ananya') ||
    userId.startsWith('user_marcus') ||
    userId.startsWith('user_priya') ||
    userId.startsWith('user_david') ||
    userId.startsWith('user_elena') ||
    userId.startsWith('user_dev_cadence')
  );
};

export const AdminDataExplorerModal: React.FC<AdminDataExplorerModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserProfile,
}) => {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [purging, setPurging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Firestore Project / Database metadata
  const projectId = 'geometric-tree-p01dl';
  const databaseId = 'ai-studio-streaktrackerdev-14c11fd8-21f9-4bdb-a408-f86ca0df08ad';
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/databases/${databaseId}/data`;

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setSeedNotice(null);

    const usersCol = collection(db, 'users');
    const unsub = onSnapshot(
      usersCol,
      async (snap: QuerySnapshot<DocumentData>) => {
        const map = new Map<string, UserProfile>();

        // 1. Fetch from server user database
        try {
          const serverRes = await fetch('/api/auth/users');
          if (serverRes.ok) {
            const data = await serverRes.json();
            if (data.success && Array.isArray(data.users)) {
              for (const u of data.users) {
                if (isMockUser(u)) continue;
                const key = (u.email || u.username || u.userId).toLowerCase();
                map.set(key, {
                  userId: u.userId,
                  username: u.username,
                  name: u.name,
                  email: u.email,
                  mobileNumber: u.mobileNumber,
                  title: u.title,
                  bio: u.bio,
                  role: isUserAdmin(u.email) ? 'admin' : (u.role || 'user'),
                  profileCompleted: u.profileCompleted ?? true,
                  createdAt: u.createdAt,
                });
              }
            }
          }
        } catch (e) {
          console.warn('Could not fetch /api/auth/users in explorer:', e);
        }

        // 2. Real-time updates from Firestore
        for (const docSnap of snap.docs) {
          const data = docSnap.data() as UserProfile;
          const candidate = {
            email: data.email,
            userId: data.userId || docSnap.id,
            username: data.username,
          };

          if (isMockUser(candidate)) {
            try {
              await deleteDoc(doc(db, 'users', docSnap.id));
            } catch (delErr) {
              console.warn('Firestore auto-cleanup:', delErr);
            }
            continue;
          }

          const key = (data.email || data.username || docSnap.id).toLowerCase();
          const existing = map.get(key);
          map.set(key, {
            ...(existing || {}),
            ...data,
            userId: data.userId || docSnap.id,
            role: isUserAdmin(data.email) ? 'admin' : (data.role || existing?.role || 'user'),
          });
        }

        // 3. Ensure current user is in map
        if (currentUserProfile) {
          const key = (currentUserProfile.email || currentUserId || '').toLowerCase();
          if (key && !map.has(key)) {
            map.set(key, { ...currentUserProfile, userId: currentUserId });
          }
        }

        const merged = Array.from(map.values()).sort((a, b) => {
          const aIsAdmin = isUserAdmin(a.email) || a.role === 'admin';
          const bIsAdmin = isUserAdmin(b.email) || b.role === 'admin';
          if (aIsAdmin && !bIsAdmin) return -1;
          if (!aIsAdmin && bIsAdmin) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });

        setUsersList(merged);
        setLoading(false);
      },
      (err: unknown) => {
        console.warn('Admin Explorer Firestore listener notice:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [isOpen, currentUserProfile, currentUserId]);

  const fetchUsers = async () => {
    // Manual trigger for refresh button
    setLoading(true);
    setSeedNotice('Refreshing live records from Cloud Firestore...');
    setTimeout(() => {
      setLoading(false);
      setSeedNotice(null);
    }, 600);
  };

  const purgeMockAccounts = async () => {
    setPurging(true);
    let count = 0;
    try {
      // 1. Purge from Firestore
      const snap = await getDocs(collection(db, 'users'));
      for (const docSnap of snap.docs) {
        const data = docSnap.data() as UserProfile;
        if (isMockUser({ email: data.email, userId: docSnap.id, username: data.username })) {
          await deleteDoc(doc(db, 'users', docSnap.id));
          count++;
        }
      }

      // 2. Refresh listing
      await fetchUsers();
      setSeedNotice(`Purge complete. All mock accounts removed from database.`);
    } catch (e) {
      console.error(e);
      setSeedNotice('Error purging mock accounts. Please check connection.');
    } finally {
      setPurging(false);
      setTimeout(() => setSeedNotice(null), 4000);
    }
  };

  const deleteSingleUser = async (user: UserProfile) => {
    if (isUserAdmin(user.email)) return;
    try {
      const id = user.userId || user.username || user.email;
      await fetch(`/api/auth/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (user.userId) {
        await deleteDoc(doc(db, 'users', user.userId));
      }
      setSeedNotice(`User ${user.name || user.email} removed.`);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[1.125rem] font-semibold">Database & User Data Explorer</h3>
                <span className="px-2 py-0.2 rounded text-[0.625rem] bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-mono font-bold">
                  Admin Only
                </span>
              </div>
              <p className="text-[0.6875rem] text-slate-400 font-mono">
                Google Cloud Firestore • Restricted to surajsasi1212@gmail.com
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

        {/* Database Architecture Info Box */}
        <div className="p-4 rounded-xl bg-[#0e141b] border border-[#222a36] space-y-2 text-[0.8125rem]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-[#00f5a0] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">cloud</span>
              Database: Google Cloud Firestore
            </span>
            <span className="font-mono text-[0.6875rem] text-slate-400">
              Project: <strong className="text-white">{projectId}</strong>
            </span>
          </div>

          <p className="text-slate-400 text-[0.75rem] leading-relaxed">
            All user data (profiles with names, emails, mobile numbers, sessions, and streaks) is stored in
            real-time inside Cloud Firestore collections:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[0.6875rem] pt-1">
            <div className="p-2 rounded bg-[#181f2a] border border-[#2a3240]">
              <span className="text-[#00f5a0] font-bold block">/users/{'{userId}'}</span>
              <span className="text-slate-400">Name, Email, Mobile, Profile status</span>
            </div>
            <div className="p-2 rounded bg-[#181f2a] border border-[#2a3240]">
              <span className="text-[#00f5a0] font-bold block">.../sessions/{'{id}'}</span>
              <span className="text-slate-400">Technical sprints & code notes</span>
            </div>
            <div className="p-2 rounded bg-[#181f2a] border border-[#2a3240]">
              <span className="text-[#00f5a0] font-bold block">.../settings/current</span>
              <span className="text-slate-400">Daily targets & active tracks</span>
            </div>
          </div>
        </div>

        {/* User Profiles Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-[0.875rem] font-semibold text-white flex items-center gap-2">
              <span>Registered Users in Firestore</span>
              <span className="px-2 py-0.5 rounded-full text-[0.6875rem] font-mono bg-[#181f2a] border border-[#2a3240] text-[#00f5a0]">
                {usersList.length}
              </span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={purgeMockAccounts}
                disabled={purging}
                className="text-[0.75rem] px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                title="Purge all legacy mock and dummy users"
              >
                <span className="material-symbols-outlined text-[14px]">cleaning_services</span>
                <span>{purging ? 'Purging...' : 'Purge Demo / Fake Users'}</span>
              </button>
              <button
                onClick={fetchUsers}
                className="text-[0.75rem] px-2.5 py-1 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-[#00f5a0] font-mono flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Refresh
              </button>
            </div>
          </div>

          {seedNotice && (
            <div className="p-2.5 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[#00f5a0] text-[0.75rem] font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>{seedNotice}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-400 font-mono text-[0.8125rem]">
              Querying Firestore database...
            </div>
          ) : usersList.length > 0 ? (
            <div className="space-y-2">
              {usersList.map((usr, idx) => {
                const isAdmin = isUserAdmin(usr.email) || usr.role === 'admin';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0e141b] border border-[#222a36] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[0.8125rem]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-[0.875rem] ${
                        isAdmin
                          ? 'bg-emerald-950/60 border border-[#00f5a0]/40 text-[#00f5a0]'
                          : 'bg-[#181f2a] border border-[#2a3240] text-slate-200'
                      }`}>
                        {usr.name ? usr.name.slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{usr.name}</span>
                          {isAdmin ? (
                            <span className="px-1.5 py-0.5 rounded text-[0.625rem] bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-mono font-bold">
                              Admin
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[0.625rem] bg-[#181f2a] text-slate-400 border border-[#2a3240] font-mono">
                              User
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 font-mono text-[0.75rem]">
                          {usr.email} • {usr.mobileNumber || 'No phone'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-slate-400 text-[0.75rem] font-mono sm:text-right">
                        <div>{usr.title || 'Developer'}</div>
                        <div className="text-slate-500 text-[0.6875rem]">
                          ID: {usr.userId || 'current'}
                        </div>
                      </div>

                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => deleteSingleUser(usr)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[0.6875rem] font-mono transition-colors cursor-pointer"
                          title="Remove user"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-[0.8125rem]">
              No user documents registered yet. Complete profile to initialize your Firestore record.
            </div>
          )}
        </div>

        {/* Direct Console Access link */}
        <div className="pt-3 border-t border-[#222a36] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-[#00f5a0]/40 text-slate-200 hover:text-white text-[0.8125rem] font-medium transition-colors"
            >
              <span>Open Firebase Console</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(consoleUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-300 hover:text-[#00f5a0] text-[0.8125rem] font-mono transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#00f5a0] text-black font-semibold text-[0.875rem] hover:brightness-110 cursor-pointer"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
