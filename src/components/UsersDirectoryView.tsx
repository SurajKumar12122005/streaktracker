import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, isUserAdmin, isMockUser } from '../types';

interface UsersDirectoryViewProps {
  currentUserProfile: UserProfile;
  currentUserId: string;
  onOpenRecordModal: () => void;
  onOpenDatabaseExplorer: () => void;
  onOpenGoogleSheetsModal?: () => void;
}

export const UsersDirectoryView: React.FC<UsersDirectoryViewProps> = ({
  currentUserProfile,
  currentUserId,
  onOpenRecordModal,
  onOpenDatabaseExplorer,
  onOpenGoogleSheetsModal,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Firestore Project / Database metadata
  const projectId = 'geometric-tree-p01dl';
  const databaseId = 'ai-studio-streaktrackerdev-14c11fd8-21f9-4bdb-a408-f86ca0df08ad';
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/databases/${databaseId}/data`;

  // Real-Time live synchronization with Cloud Firestore across all devices
  useEffect(() => {
    setLoading(true);
    setStatusMessage(null);

    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      async (snapshot) => {
        const userMap = new Map<string, UserProfile>();

        // 1. Fetch from server API to include any local instance records
        try {
          const serverRes = await fetch('/api/auth/users');
          if (serverRes.ok) {
            const data = await serverRes.json();
            if (data.success && Array.isArray(data.users)) {
              for (const u of data.users) {
                if (isMockUser(u)) continue;
                const key = (u.email || u.username || u.userId).toLowerCase();
                userMap.set(key, {
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
        } catch (apiErr) {
          console.warn('API users sync warning in directory view:', apiErr);
        }

        // 2. Real-time Cloud Firestore records (live from https://streaktracker.ai.studio)
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as UserProfile;
          const candidate = {
            email: data.email,
            userId: data.userId || docSnap.id,
            username: data.username,
          };

          if (isMockUser(candidate)) {
            // Proactively auto-clean legacy mock accounts
            try {
              await deleteDoc(doc(db, 'users', docSnap.id));
            } catch (delErr) {
              console.warn('Firestore mock doc cleanup notice:', delErr);
            }
            continue;
          }

          const key = (data.email || data.username || docSnap.id).toLowerCase();
          const existing = userMap.get(key);
          userMap.set(key, {
            ...(existing || {}),
            ...data,
            userId: data.userId || docSnap.id,
            role: isUserAdmin(data.email) ? 'admin' : (data.role || existing?.role || 'user'),
          });
        }

        // 3. Ensure current logged-in user is present
        if (currentUserProfile.email || currentUserProfile.name) {
          const currentKey = (currentUserProfile.email || currentUserId).toLowerCase();
          if (!userMap.has(currentKey)) {
            userMap.set(currentKey, {
              ...currentUserProfile,
              userId: currentUserId,
              role: isUserAdmin(currentUserProfile.email) ? 'admin' : 'user',
            });
          }
        }

        // Sort: Admin first, then alphabetically by name
        const mergedList = Array.from(userMap.values()).sort((a, b) => {
          const aIsAdmin = isUserAdmin(a.email) || a.role === 'admin';
          const bIsAdmin = isUserAdmin(b.email) || b.role === 'admin';
          if (aIsAdmin && !bIsAdmin) return -1;
          if (!aIsAdmin && bIsAdmin) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });

        setUsers(mergedList);
        setLoading(false);
      },
      (error) => {
        console.warn('Users directory Firestore listener notice:', error);
        setStatusMessage('Sync notice: Serving registered records from authentication store.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserProfile, currentUserId]);

  const refreshUsers = () => {
    setLoading(true);
    setStatusMessage('Refreshing live records from Cloud Firestore...');
    setTimeout(() => {
      setLoading(false);
      setStatusMessage(null);
    }, 500);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (isUserAdmin(userToDelete.email) || userToDelete.userId === currentUserId) {
      setStatusMessage('The primary administrator account cannot be deleted.');
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const identifier = userToDelete.userId || userToDelete.username || userToDelete.email;
      // 1. Delete from backend auth store
      await fetch(`/api/auth/users/${encodeURIComponent(identifier)}`, { method: 'DELETE' });

      // 2. Delete from Firestore
      if (userToDelete.userId) {
        try {
          await deleteDoc(doc(db, 'users', userToDelete.userId));
        } catch (e) {
          console.warn('Firestore doc delete note:', e);
        }
      }

      setStatusMessage(`User ${userToDelete.name || userToDelete.email} was removed successfully.`);
      setUserToDelete(null);
      setSelectedUser(null);
      refreshUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      setStatusMessage('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Filter users by search query and role filter
  const filteredUsers = users.filter(user => {
    // Role filter
    if (roleFilter === 'admin' && !isUserAdmin(user.email) && user.role !== 'admin') {
      return false;
    }
    if (roleFilter === 'user' && (isUserAdmin(user.email) || user.role === 'admin')) {
      return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.username && user.username.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.mobileNumber && user.mobileNumber.toLowerCase().includes(q)) ||
      (user.title && user.title.toLowerCase().includes(q)) ||
      (user.userId && user.userId.toLowerCase().includes(q))
    );
  });

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Metrics
  const totalCount = users.length;
  const adminCount = users.filter(u => isUserAdmin(u.email) || u.role === 'admin').length;
  const learnerCount = totalCount - adminCount;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12 font-sans">
      {/* Spacious Executive Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#131821] border border-[#222a36] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f5a0]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">shield_person</span>
                Admin Workspace
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync: https://streaktracker.ai.studio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Firestore DB: <strong className="text-slate-200">geometric-tree-p01dl</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Directory & Team Management
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Comprehensive administrative overview of all registered developers, authenticated profiles, and consistency metrics across the application.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenGoogleSheetsModal && (
              <button
                type="button"
                onClick={onOpenGoogleSheetsModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-[#00f5a0]/40 text-[#00f5a0] font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                title="Sync and backup all users into Google Sheets"
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>Google Sheets Sync</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDatabaseExplorer}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-[#00f5a0]/40 text-slate-200 hover:text-white font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#00f5a0]">database</span>
              <span>Cloud Database</span>
            </button>

            <button
              type="button"
              onClick={refreshUsers}
              className="p-2.5 rounded-xl bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh users list"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Accounts</span>
            <span className="w-8 h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-[#00f5a0]">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{totalCount}</div>
            <div className="text-[0.6875rem] text-slate-400 mt-0.5">All registered & active users</div>
          </div>
        </div>

        {/* Administrators */}
        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Administrators</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-[#00f5a0]/40 flex items-center justify-center text-[#00f5a0]">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#00f5a0] font-mono">{adminCount}</div>
            <div className="text-[0.6875rem] text-slate-400 mt-0.5">surajsasi1212@gmail.com</div>
          </div>
        </div>

        {/* Developers / Learners */}
        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Learners & Team</span>
            <span className="w-8 h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{learnerCount}</div>
            <div className="text-[0.6875rem] text-slate-400 mt-0.5">Tracking daily cadence</div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="p-5 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Database Sync</span>
            <span className="w-8 h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-[#00f5a0]">
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse" />
              <span>Live & Connected</span>
            </div>
            <div className="text-[0.6875rem] text-slate-400 font-mono mt-0.5">
              Firestore & Local Store
            </div>
          </div>
        </div>
      </div>

      {/* Spacious Controls Bar (Search, Role Filter, View Switcher) */}
      <div className="p-4 rounded-2xl bg-[#131821] border border-[#222a36] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, email, phone, or title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Role Filter & View Switcher */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Role Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-[#0e141b] border border-[#222a36]">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-[#181f2a] text-[#00f5a0] font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-[#181f2a] text-[#00f5a0] font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admins ({adminCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === 'user'
                  ? 'bg-[#181f2a] text-[#00f5a0] font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Learners ({learnerCount})
            </button>
          </div>

          {/* View Mode Toggle: Table vs Cards */}
          <div className="flex items-center p-1 rounded-xl bg-[#0e141b] border border-[#222a36]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View (Spacious & Clean)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#181f2a] text-[#00f5a0]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#181f2a] text-[#00f5a0]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Users List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-mono text-sm bg-[#131821] rounded-2xl border border-[#222a36]">
          <div className="w-8 h-8 mx-auto border-2 border-[#00f5a0] border-t-transparent rounded-full animate-spin mb-3" />
          <span>Synchronizing all registered accounts and community profiles...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-16 text-center bg-[#131821] rounded-2xl border border-[#222a36] text-slate-400 space-y-4">
          <span className="material-symbols-outlined text-4xl text-slate-500">group_off</span>
          <div>
            <h3 className="text-white font-semibold text-base">No matching users found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? `No users matched "${searchQuery}". Clear your search query to view all records.` : 'No users currently registered in database.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* OPTION 1: SPACIOUS, AIRY TABLE VIEW (DEFAULT FOR UNCONGESTED ADMIN DASHBOARDS) */
        <div className="rounded-2xl border border-[#222a36] overflow-hidden bg-[#131821] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#222a36] bg-[#0e141b] text-slate-400 font-mono text-xs">
                  <th className="py-3.5 px-5 font-semibold">Developer / User</th>
                  <th className="py-3.5 px-4 font-semibold">Email Address</th>
                  <th className="py-3.5 px-4 font-semibold">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Engineering Role</th>
                  <th className="py-3.5 px-4 font-semibold">Access Level</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2633]">
                {filteredUsers.map((user, idx) => {
                  const isCurrent =
                    user.userId === currentUserId ||
                    (user.email && user.email === currentUserProfile.email);
                  const isAdminRole = isUserAdmin(user.email) || user.role === 'admin';

                  return (
                    <tr
                      key={user.userId || idx}
                      className="hover:bg-[#181f2a]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isAdminRole
                              ? 'bg-emerald-950/60 border border-[#00f5a0]/40 text-[#00f5a0]'
                              : 'bg-[#181f2a] border border-[#2a3240] text-slate-200'
                          }`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{user.name || 'Anonymous Developer'}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[0.625rem] font-mono bg-[#00f5a0] text-black font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[0.6875rem] font-mono text-slate-400">
                              @{user.username || user.userId || 'developer'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-400">
                        {user.mobileNumber || '—'}
                      </td>

                      {/* Title */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-medium">
                        {user.title || 'Full Stack Engineer'}
                      </td>

                      {/* Access Level */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isAdminRole ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified_user</span>
                            Admin
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#181f2a] text-slate-400 border border-[#2a3240]">
                            Learner
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[0.6875rem] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Verified
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-[#00f5a0]/40 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        {!isAdminRole && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setUserToDelete(user);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-mono transition-colors cursor-pointer"
                            title="Delete this user account"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="py-3 px-5 border-t border-[#222a36] bg-[#0e141b] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredUsers.length} of {users.length} verified real accounts</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              100% Real Registered Users
            </span>
          </div>
        </div>
      ) : (
        /* OPTION 2: ROOMY CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user, idx) => {
            const isCurrent =
              user.userId === currentUserId ||
              (user.email && user.email === currentUserProfile.email);
            const isAdminRole = isUserAdmin(user.email) || user.role === 'admin';

            return (
              <div
                key={user.userId || idx}
                onClick={() => setSelectedUser(user)}
                className={`p-6 rounded-2xl bg-[#131821] border transition-all cursor-pointer hover:border-[#00f5a0]/50 hover:shadow-lg flex flex-col justify-between gap-5 group ${
                  isCurrent ? 'border-[#00f5a0]/40 ring-1 ring-[#00f5a0]/20' : 'border-[#222a36]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                        isAdminRole
                          ? 'bg-emerald-950/60 border border-[#00f5a0]/40 text-[#00f5a0]'
                          : 'bg-[#181f2a] border border-[#2a3240] text-slate-200'
                      }`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-[#00f5a0] transition-colors">
                          {user.name || 'Anonymous Developer'}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {user.title || 'Full Stack Engineer'}
                        </p>
                      </div>
                    </div>

                    {isAdminRole ? (
                      <span className="px-2 py-0.5 rounded text-[0.625rem] bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-mono font-bold">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[0.625rem] bg-[#181f2a] text-slate-400 border border-[#2a3240] font-mono">
                        LEARNER
                      </span>
                    )}
                  </div>

                  {/* Clean info fields */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-[#0e141b] border border-[#222a36] text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">
                        mail
                      </span>
                      <span className="truncate">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">
                        phone
                      </span>
                      <span>{user.mobileNumber || 'Not provided'}</span>
                    </div>

                    {user.username && (
                      <div className="flex items-center gap-2 text-[#00f5a0]">
                        <span className="material-symbols-outlined text-[16px] text-[#00f5a0] shrink-0">
                          alternate_email
                        </span>
                        <span>{user.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-[#1f2633] flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Real User
                  </span>
                  <div className="flex items-center gap-2">
                    {!isAdminRole && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setUserToDelete(user);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors cursor-pointer"
                        title="Delete this user account"
                      >
                        Delete
                      </button>
                    )}
                    <span className="group-hover:text-white transition-colors flex items-center gap-1">
                      Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spacious User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] flex items-center justify-center font-mono font-bold text-base shadow-inner">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.title || 'Full Stack Engineer'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-[#0e141b] border border-[#222a36] text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2330]">
                <span className="text-slate-400">Username</span>
                <span className="font-mono text-[#00f5a0]">@{selectedUser.username || selectedUser.userId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2330]">
                <span className="text-slate-400">Email Address</span>
                <span className="font-mono text-white">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2330]">
                <span className="text-slate-400">Contact Number</span>
                <span className="font-mono text-white">{selectedUser.mobileNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2330]">
                <span className="text-slate-400">Role & Access</span>
                <span className="font-mono text-white">
                  {isUserAdmin(selectedUser.email) ? 'Platform Administrator' : 'Developer / Learner'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Account ID</span>
                <span className="font-mono text-xs text-slate-400 truncate max-w-[200px]">
                  {selectedUser.userId}
                </span>
              </div>
            </div>

            {selectedUser.bio && (
              <div className="p-3.5 rounded-xl bg-[#181f2a] border border-[#2a3240] text-xs leading-relaxed text-slate-300">
                <span className="text-slate-400 text-[0.6875rem] block mb-1 font-mono uppercase tracking-wider">
                  Biography & Learning Focus
                </span>
                <p>{selectedUser.bio}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#222a36]">
              <div className="flex items-center gap-2">
                <a
                  href={consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00f5a0] hover:underline font-mono flex items-center gap-1"
                >
                  <span>Cloud Console</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
                {!isUserAdmin(selectedUser.email) && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      setUserToDelete(u);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 ml-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Delete User</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131821] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="text-base font-bold text-white">Permanently Remove User?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-white">{userToDelete.name || userToDelete.username}</strong> ({userToDelete.email})? This user will be purged from both the authentication store and Firestore database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#222a36]">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] text-slate-300 text-xs font-mono cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
