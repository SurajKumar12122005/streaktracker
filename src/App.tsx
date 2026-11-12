import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MomentumAlert } from './components/MomentumAlert';
import { StatsGrid } from './components/StatsGrid';
import { ProgressCard } from './components/ProgressCard';
import { CalendarCard } from './components/CalendarCard';
import { CategoryDistributionCard } from './components/CategoryDistributionCard';
import { SessionHistory } from './components/SessionHistory';
import { RecordSessionModal } from './components/RecordSessionModal';
import { SprintTimerModal } from './components/SprintTimerModal';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { DayDetailsModal } from './components/DayDetailsModal';
import { MasteryConceptsModal } from './components/MasteryConceptsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthScreen } from './components/AuthScreen';
import { ProfileCompletionScreen } from './components/ProfileCompletionScreen';
import { AdminDataExplorerModal } from './components/AdminDataExplorerModal';
import { ActivityMatrixView } from './components/ActivityMatrixView';
import { GoalSettingsView } from './components/GoalSettingsView';
import { UsersDirectoryView } from './components/UsersDirectoryView';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AchievementsModal } from './components/AchievementsModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { Footer } from './components/Footer';
import {
  INITIAL_SESSIONS,
  DEMO_SESSIONS,
  INITIAL_GOAL_SETTINGS,
  INITIAL_USER_PROFILE,
  calculateStats,
} from './mockData';
import { getTodayStr } from './utils/dateUtils';
import { LearningSession, GoalSettings, UserProfile, isUserAdmin, isMockUser } from './types';
import {
  db,
  auth,
  signOutAuth,
  getAccessToken,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  getOrCreateUserDetailsSpreadsheet,
  saveUserToGoogleSheet,
} from './utils/googleSheetsService';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

interface AuthSessionState {
  isAuthenticated: boolean;
  userId: string;
  email: string;
}

export default function App() {
  // Auth state persisted in localStorage
  const [authState, setAuthState] = useState<AuthSessionState>(() => {
    try {
      const saved = localStorage.getItem('streaktracker_auth');
      return saved
        ? JSON.parse(saved)
        : {
            isAuthenticated: false,
            userId: '',
            email: '',
          };
    } catch {
      return {
        isAuthenticated: false,
        userId: '',
        email: '',
      };
    }
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('streaktracker_profile');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Settings
  const [settings, setSettings] = useState<GoalSettings>(() => {
    try {
      const saved = localStorage.getItem('streaktracker_settings');
      return saved ? JSON.parse(saved) : INITIAL_GOAL_SETTINGS;
    } catch {
      return INITIAL_GOAL_SETTINGS;
    }
  });

  // Sessions - Isolated per user. New users start with a fresh, clean slate of 0 sessions!
  const [sessions, setSessions] = useState<LearningSession[]>(() => {
    try {
      const savedAuth = localStorage.getItem('streaktracker_auth');
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        if (parsedAuth.isAuthenticated && parsedAuth.userId) {
          const userSaved = localStorage.getItem(`streaktracker_sessions_${parsedAuth.userId}`);
          if (userSaved) return JSON.parse(userSaved);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'monthly-calendar' | 'goal-settings' | 'all-users'>('dashboard');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LearningSession | null>(null);
  const [recordModalDefaultDate, setRecordModalDefaultDate] = useState(getTodayStr());

  const [isSprintTimerOpen, setIsSprintTimerOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isMasteryModalOpen, setIsMasteryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminExplorerOpen, setIsAdminExplorerOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isSheetsConnected, setIsSheetsConnected] = useState(false);
  const [sheetsToast, setSheetsToast] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [dayDetailsDate, setDayDetailsDate] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<LearningSession | null>(null);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [streakFreezeToast, setStreakFreezeToast] = useState<string | null>(null);

  // Calculate dynamic stats across all recorded sessions
  const stats = calculateStats(sessions, settings.dailyGoalMinutes, settings.activeTracks);

  // Quick add track handler
  const handleQuickAddTrack = (newTrack: string) => {
    const trimmed = newTrack.trim();
    if (!trimmed || settings.activeTracks.includes(trimmed)) return;
    const updated = [...settings.activeTracks, trimmed];
    setSettings(prev => ({ ...prev, activeTracks: updated }));
    if (authState.isAuthenticated && authState.userId) {
      setDoc(
        doc(db, 'users', authState.userId, 'settings', 'current'),
        { activeTracks: updated },
        { merge: true }
      ).catch(e => console.warn('Track sync warning:', e));
    }
  };

  // Sync sessions to user-scoped localStorage
  useEffect(() => {
    if (authState.isAuthenticated && authState.userId) {
      try {
        localStorage.setItem(`streaktracker_sessions_${authState.userId}`, JSON.stringify(sessions));
      } catch (e) {
        console.warn('LocalStorage sessions sync error:', e);
      }
    }
  }, [sessions, authState.userId, authState.isAuthenticated]);

  // Sync settings and profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('streaktracker_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage settings sync error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('streaktracker_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage profile sync error:', e);
    }
  }, [profile]);

  // Real-time Firestore synchronization for sessions and settings
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.userId) return;

    const sessionsCol = collection(db, 'users', authState.userId, 'sessions');
    const unsubSessions = onSnapshot(sessionsCol, (snap) => {
      const loaded: LearningSession[] = [];
      snap.forEach(docSnap => {
        loaded.push(docSnap.data() as LearningSession);
      });
      loaded.sort((a, b) => b.createdAt - a.createdAt);
      if (snap.size > 0 || loaded.length > 0) {
        setSessions(loaded);
      }
    }, (err) => {
      console.warn('Firestore sessions stream warning:', err);
    });

    const settingsDoc = doc(db, 'users', authState.userId, 'settings', 'current');
    const unsubSettings = onSnapshot(settingsDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GoalSettings;
        setSettings(prev => ({
          ...prev,
          ...data,
        }));
      }
    }, (err) => {
      console.warn('Firestore settings stream warning:', err);
    });

    return () => {
      unsubSessions();
      unsubSettings();
    };
  }, [authState.isAuthenticated, authState.userId]);

  // Check Google Sheets connection state
  useEffect(() => {
    const checkSheets = async () => {
      const token = await getAccessToken();
      setIsSheetsConnected(!!token);
    };
    checkSheets();
  }, [isGoogleSheetsModalOpen, authState.isAuthenticated]);

  // Live real-time Firestore synchronization for all users across instances and devices (Admin only)
  useEffect(() => {
    const userIsAdmin = isUserAdmin(profile.email || authState.email);
    if (!authState.isAuthenticated || !userIsAdmin) return;

    const usersCol = collection(db, 'users');
    const unsub = onSnapshot(
      usersCol,
      async (snap) => {
        const userMap = new Map<string, UserProfile>();

        // 1. Fetch from server API to guarantee local auth sync
        try {
          const res = await fetch('/api/auth/users');
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.users)) {
              for (const u of data.users) {
                if (isMockUser(u)) continue;
                const key = (u.email || u.username || u.userId).toLowerCase();
                userMap.set(key, u);
              }
            }
          }
        } catch (e) {
          console.warn('API users sync warning:', e);
        }

        // 2. Real-time updates from Cloud Firestore
        snap.forEach((d) => {
          const data = d.data() as UserProfile;
          if (isMockUser(data)) return;
          const key = (data.email || data.username || d.id).toLowerCase();
          const existing = userMap.get(key);
          userMap.set(key, {
            ...(existing || {}),
            ...data,
            userId: data.userId || d.id,
            role: isUserAdmin(data.email) ? 'admin' : (data.role || existing?.role || 'user'),
          });
        });

        // 3. Ensure current authenticated profile is present
        if (profile.email || authState.email) {
          const myKey = (profile.email || authState.email).toLowerCase();
          if (!userMap.has(myKey)) {
            userMap.set(myKey, {
              ...profile,
              userId: authState.userId,
              role: isUserAdmin(profile.email || authState.email) ? 'admin' : 'user',
            });
          }
        }

        const sorted = Array.from(userMap.values()).sort((a, b) => {
          const aIsAdmin = isUserAdmin(a.email) || a.role === 'admin';
          const bIsAdmin = isUserAdmin(b.email) || b.role === 'admin';
          if (aIsAdmin && !bIsAdmin) return -1;
          if (!aIsAdmin && bIsAdmin) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });

        setAllUsers(sorted);
      },
      (error) => {
        console.warn('Users directory Firestore listener notice:', error);
      }
    );

    return () => unsub();
  }, [authState.isAuthenticated, authState.userId, authState.email, profile]);

  // Determine admin privileges (surajsasi1212@gmail.com)
  const isAdmin = isUserAdmin(profile.email || authState.email);

  // Inactivity alert dismiss
  const [momentumAlertDismissed, setMomentumAlertDismissed] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Check if yesterday was missed to offer Streak Freeze defense
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  const practicedDateSet = new Set(sessions.map(s => s.date));
  const missedYesterday = !practicedDateSet.has(yesterdayStr);
  const canActivateFreeze =
    sessions.length > 0 &&
    missedYesterday &&
    settings.streakFreezeRemaining > 0 &&
    !(settings.usedStreakFreezeDates || []).includes(yesterdayStr);

  const handleActivateStreakFreeze = async () => {
    if (!canActivateFreeze) return;
    const freezeSession: LearningSession = {
      id: `freeze-${yesterdayStr}-${Date.now()}`,
      title: '❄️ Streak Freeze Activated',
      category: 'Streak Defense',
      durationMinutes: 1,
      date: yesterdayStr,
      notes: 'Streak freeze activated to defend consistency cadence.',
      createdAt: Date.now(),
    };

    const updatedSessions = [freezeSession, ...sessions];
    const updatedFreezes = Math.max(0, settings.streakFreezeRemaining - 1);
    const updatedDates = [...(settings.usedStreakFreezeDates || []), yesterdayStr];
    const updatedSettings: GoalSettings = {
      ...settings,
      streakFreezeRemaining: updatedFreezes,
      usedStreakFreezeDates: updatedDates,
    };

    setSessions(updatedSessions);
    setSettings(updatedSettings);
    triggerGoalCelebration();
    setStreakFreezeToast('❄️ Streak Freeze Activated! Your streak has been successfully defended.');
    setTimeout(() => setStreakFreezeToast(null), 4000);

    if (authState.isAuthenticated && authState.userId) {
      try {
        await setDoc(doc(db, 'users', authState.userId, 'sessions', freezeSession.id), freezeSession);
        await setDoc(doc(db, 'users', authState.userId, 'settings', 'current'), updatedSettings, { merge: true });
      } catch (e) {
        console.warn('Freeze sync warning:', e);
      }
    }
  };

  // Keyboard Shortcuts: [N] New Session, [T] Sprint Timer, [B] Badges, [Esc] Close Modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingSession(null);
        setRecordModalDefaultDate(getTodayStr());
        setIsRecordModalOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsSprintTimerOpen(true);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setIsAchievementsModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsRecordModalOpen(false);
        setIsSprintTimerOpen(false);
        setIsGoalModalOpen(false);
        setIsAchievementsModalOpen(false);
        setIsProfileModalOpen(false);
        setDayDetailsDate(null);
        setSessionToDelete(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger celebration when reaching 100%
  const triggerGoalCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5a0', '#10b981', '#50ffaf', '#ffffff'],
    });
  };

  // Auth Handlers
  const handleAuthenticated = async (
    email: string,
    userId: string,
    initialProfile?: Partial<UserProfile>
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    setAuthState({
      isAuthenticated: true,
      userId,
      email: cleanEmail,
    });

    try {
      localStorage.setItem(
        'streaktracker_auth',
        JSON.stringify({ isAuthenticated: true, userId, email: cleanEmail })
      );
      localStorage.setItem(
        'streaktracker_saved_user',
        JSON.stringify({
          email: cleanEmail,
          userId,
          username: initialProfile?.username,
          name: initialProfile?.name,
          timestamp: Date.now(),
        })
      );
      if (initialProfile?.username) {
        localStorage.setItem('streaktracker_last_username', initialProfile.username);
      }
      localStorage.setItem('streaktracker_last_email', cleanEmail);
      localStorage.setItem('streaktracker_remember_device', 'true');
    } catch (e) {
      console.warn('LocalStorage session save warning:', e);
    }

    // Load user's scoped sessions or fresh empty []
    try {
      const userSaved = localStorage.getItem(`streaktracker_sessions_${userId}`);
      if (userSaved) {
        setSessions(JSON.parse(userSaved));
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }

    // Check if user has an existing completed profile in Firestore or from login/registration
    try {
      const userDocRef = doc(db, 'users', userId);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
      } else if (initialProfile && (initialProfile.username || initialProfile.name)) {
        const newProf: UserProfile = {
          userId,
          username: initialProfile.username || cleanEmail.split('@')[0],
          name: initialProfile.name || initialProfile.username || 'Developer',
          email: cleanEmail,
          mobileNumber: initialProfile.mobileNumber || '',
          title: initialProfile.title || 'Full Stack Engineer',
          bio: initialProfile.bio || 'Daily cadence learner.',
          role: isUserAdmin(cleanEmail) ? 'admin' : (initialProfile.role || 'user'),
          profileCompleted: true,
        };
        setProfile(newProf);
        setDoc(userDocRef, newProf, { merge: true }).catch(() => {});
      } else {
        setProfile({
          userId,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          mobileNumber: '',
          title: 'Developer',
          profileCompleted: true,
        });
      }
    } catch {
      // In offline / fallback
      setProfile(prev => ({
        ...prev,
        userId,
        email: cleanEmail,
        name: initialProfile?.name || prev.name || cleanEmail.split('@')[0],
        username: initialProfile?.username || prev.username,
        profileCompleted: true,
      }));
    }
  };

  const handleExploreDemo = () => {
    setAuthState({
      isAuthenticated: true,
      userId: 'demo_developer_cadence',
      email: 'developer.cadence@demo.internal',
    });
    setProfile(INITIAL_USER_PROFILE);
    setSessions(DEMO_SESSIONS);
  };

  const handleSignOut = () => {
    signOutAuth().catch(() => {});
    setAuthState({
      isAuthenticated: false,
      userId: '',
      email: '',
    });
    setProfile(INITIAL_USER_PROFILE);
    setSessions([]);
    try {
      localStorage.removeItem('streaktracker_auth');
      localStorage.removeItem('streaktracker_profile');
      localStorage.removeItem('streaktracker_sessions');
      // Keep streaktracker_last_email and streaktracker_saved_user so 1-click quick sign-in remains available
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  };

  // Complete profile gate handler with personalized tracks
  const handleProfileCompleted = async (
    newProfile: UserProfile,
    dailyGoal: number,
    selectedTracks?: string[]
  ) => {
    setProfile(newProfile);
    const updatedTracks =
      selectedTracks && selectedTracks.length > 0 ? selectedTracks : settings.activeTracks;
    
    setSettings(prev => ({
      ...prev,
      dailyGoalMinutes: dailyGoal,
      activeTracks: updatedTracks,
    }));

    // Persist to Firestore
    const targetUserId = newProfile.userId || authState.userId;
    try {
      await setDoc(doc(db, 'users', targetUserId), newProfile);

      // Save initial settings
      await setDoc(
        doc(db, 'users', targetUserId, 'settings', 'current'),
        {
          userId: targetUserId,
          dailyGoalMinutes: dailyGoal,
          weeklyGoalDays: settings.weeklyGoalDays,
          streakFreezeRemaining: settings.streakFreezeRemaining,
          momentumGuardDays: settings.momentumGuardDays,
          activeTracks: updatedTracks,
        }
      );
    } catch (err) {
      console.warn('Firestore profile sync warning:', err);
    }

    // Also sync to server auth database
    fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: targetUserId,
        email: newProfile.email,
        name: newProfile.name,
        mobileNumber: newProfile.mobileNumber,
        title: newProfile.title,
        bio: newProfile.bio,
      }),
    }).catch(e => console.warn('Server auth profile sync notice:', e));

    // Auto-sync to Google Sheets if authorized
    try {
      const token = await getAccessToken();
      if (token) {
        const sheet = await getOrCreateUserDetailsSpreadsheet(token);
        await saveUserToGoogleSheet(token, sheet.id, newProfile, {
          activeTracks: updatedTracks,
          dailyGoalMinutes: dailyGoal,
        });
        setSheetsToast('User details recorded in Google Sheets!');
        setTimeout(() => setSheetsToast(null), 4000);
      }
    } catch (sheetErr) {
      console.warn('Google Sheets auto-save notice:', sheetErr);
    }

    triggerGoalCelebration();
  };

  // Quick +15 min shortcut
  const handleQuickAdd15 = async (tagTitle?: string) => {
    const newSession: LearningSession = {
      id: `s-${Date.now()}`,
      title: tagTitle || 'Self Study Extension',
      category: settings.activeTracks[0] || 'General',
      durationMinutes: 15,
      date: getTodayStr(),
      notes: 'Rapid +15m sprint recorded via momentum shortcut.',
      createdAt: Date.now(),
    };

    setSessions(prev => [newSession, ...prev]);

    // Persist to Firestore
    if (authState.isAuthenticated && authState.userId) {
      try {
        await setDoc(
          doc(db, 'users', authState.userId, 'sessions', newSession.id),
          newSession
        );
      } catch (err) {
        console.warn('Firestore save error:', err);
      }
    }

    // Check if goal met
    const newTodayMinutes = stats.todayMinutes + 15;
    if (newTodayMinutes >= settings.dailyGoalMinutes && stats.todayMinutes < settings.dailyGoalMinutes) {
      triggerGoalCelebration();
    }
  };

  // Save / Update session
  const handleSaveSession = async (
    sessionData: Omit<LearningSession, 'id' | 'createdAt'> & { id?: string }
  ) => {
    let savedSession: LearningSession;
    if (sessionData.id) {
      savedSession = {
        ...(sessions.find(s => s.id === sessionData.id) || {}),
        ...sessionData,
        id: sessionData.id,
        createdAt: Date.now(),
      } as LearningSession;

      setSessions(prev =>
        prev.map(s => (s.id === sessionData.id ? savedSession : s))
      );
    } else {
      savedSession = {
        ...sessionData,
        id: `s-${Date.now()}`,
        createdAt: Date.now(),
      };
      setSessions(prev => [savedSession, ...prev]);

      if (sessionData.date === getTodayStr()) {
        const newTodayMinutes = stats.todayMinutes + sessionData.durationMinutes;
        if (newTodayMinutes >= settings.dailyGoalMinutes && stats.todayMinutes < settings.dailyGoalMinutes) {
          triggerGoalCelebration();
        }
      }
    }

    // Persist to Firestore
    if (authState.isAuthenticated && authState.userId) {
      try {
        await setDoc(
          doc(db, 'users', authState.userId, 'sessions', savedSession.id),
          savedSession
        );
      } catch (err) {
        console.warn('Firestore session write error:', err);
      }
    }

    setEditingSession(null);
  };

  // Request delete session (opens in-app modal to prevent iframe window.confirm block)
  const handleRequestDeleteSession = (sessionId: string) => {
    const found = sessions.find(s => s.id === sessionId);
    if (found) {
      setSessionToDelete(found);
    }
  };

  // Confirmed delete execution
  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    const idToDelete = sessionToDelete.id;

    // Immediate optimistic local update
    setSessions(prev => prev.filter(s => s.id !== idToDelete));
    setSessionToDelete(null);

    // Sync with Firestore
    if (authState.isAuthenticated && authState.userId) {
      try {
        await deleteDoc(doc(db, 'users', authState.userId, 'sessions', idToDelete));
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }
  };

  // Edit session trigger
  const handleEditSession = (session: LearningSession) => {
    setEditingSession(session);
    setRecordModalDefaultDate(session.date);
    setIsRecordModalOpen(true);
  };

  // Sprint timer completion
  const handleSprintCompleted = async (conceptTitle: string, minutes: number, category: string) => {
    const newSession: LearningSession = {
      id: `s-${Date.now()}`,
      title: conceptTitle,
      category,
      durationMinutes: minutes,
      date: getTodayStr(),
      notes: `Completed targeted ${minutes}-minute focus sprint. All algorithmic invariants reviewed.`,
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);

    if (authState.isAuthenticated && authState.userId) {
      try {
        await setDoc(
          doc(db, 'users', authState.userId, 'sessions', newSession.id),
          newSession
        );
      } catch (err) {
        console.warn('Firestore timer save error:', err);
      }
    }
  };

  // Open record modal with custom default date
  const handleOpenRecordForDate = (dateStr: string) => {
    setEditingSession(null);
    setRecordModalDefaultDate(dateStr);
    setIsRecordModalOpen(true);
  };

  // Update profile from modal/settings
  const handleUpdateProfile = async (updated: UserProfile) => {
    setProfile(updated);
    if (authState.isAuthenticated && authState.userId) {
      try {
        await setDoc(doc(db, 'users', authState.userId), updated);
      } catch (err) {
        console.warn('Firestore profile update warning:', err);
      }

      // Also sync to backend auth store
      fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authState.userId,
          email: updated.email,
          name: updated.name,
          mobileNumber: updated.mobileNumber,
          title: updated.title,
          bio: updated.bio,
        }),
      }).catch(e => console.warn('Server auth profile sync notice:', e));
    }

    try {
      const token = await getAccessToken();
      if (token) {
        const sheet = await getOrCreateUserDetailsSpreadsheet(token);
        await saveUserToGoogleSheet(token, sheet.id, updated, {
          activeTracks: settings.activeTracks,
          dailyGoalMinutes: settings.dailyGoalMinutes,
        });
        setSheetsToast('Profile updated in Google Sheets!');
        setTimeout(() => setSheetsToast(null), 3500);
      }
    } catch (sheetErr) {
      console.warn('Google Sheets update warning:', sheetErr);
    }
  };

  // GATE 1: User Not Authenticated -> Show Email + OTP Login Screen
  if (!authState.isAuthenticated) {
    return (
      <AuthScreen
        onAuthenticated={handleAuthenticated}
        onExploreDemo={handleExploreDemo}
      />
    );
  }

  // GATE 2: User Authenticated BUT Profile Not Completed -> Show Profile Gate Screen
  // "Make sure that the user can access the application only after completing the profile."
  if (!profile.profileCompleted) {
    return (
      <ProfileCompletionScreen
        email={authState.email}
        userId={authState.userId}
        onComplete={handleProfileCompleted}
        onSignOut={handleSignOut}
      />
    );
  }

  // GATE 3: Authenticated & Profile Completed -> Full Application Access
  return (
    <div className="bg-[#0b0d11] text-slate-100 min-h-screen font-sans selection:bg-[#00f5a0] selection:text-black">
      {/* Top Fixed Header */}
      <Header
        currentTab={currentTab}
        onTabChange={tab => {
          if (tab === 'all-users' && !isAdmin) return;
          setCurrentTab(tab as typeof currentTab);
        }}
        streakDays={stats.currentStreak}
        onOpenRecordModal={() => {
          setEditingSession(null);
          setRecordModalDefaultDate(getTodayStr());
          setIsRecordModalOpen(true);
        }}
        profile={profile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDatabaseExplorer={() => {
          if (isAdmin) setIsAdminExplorerOpen(true);
        }}
        onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
        isSheetsConnected={isSheetsConnected}
        onSignOut={handleSignOut}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="w-full pt-16 sm:pt-20 px-3 sm:px-6 md:px-8 pb-24 lg:pb-12 max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
        {currentTab === 'dashboard' && (
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Top Hero & Greeting Banner */}
            <HeroBanner
              progressPercent={stats.progressPercent}
              tracksCount={stats.categoryStats.length}
              userName={profile.name}
              isNewUser={sessions.length === 0}
              onOpenRecordModal={() => {
                setEditingSession(null);
                setRecordModalDefaultDate(getTodayStr());
                setIsRecordModalOpen(true);
              }}
            />

            {/* Inactivity / Streak Recovery Alert Box - Personalized per user */}
            {!momentumAlertDismissed && (
              <MomentumAlert
                userName={profile.name}
                activeTracks={settings.activeTracks}
                sessions={sessions}
                currentStreak={stats.currentStreak}
                todayMinutes={stats.todayMinutes}
                dailyGoalMinutes={settings.dailyGoalMinutes}
                remainingMinutes={stats.remainingMinutes}
                isNewUser={sessions.length === 0}
                onStartSprint={() => setIsSprintTimerOpen(true)}
                onDismiss={() => setMomentumAlertDismissed(true)}
              />
            )}

            {/* Key Statistics Grid (7 Cards) */}
            <StatsGrid
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              totalDays={stats.totalDays}
              totalHours={stats.totalHours}
              totalMinutes={stats.totalMinutes}
              todayMinutes={stats.todayMinutes}
              dailyGoalMinutes={settings.dailyGoalMinutes}
              remainingMinutes={stats.remainingMinutes}
              todaySessionsCount={stats.todaySessionsCount}
              onEditGoal={() => setIsGoalModalOpen(true)}
            />

            {/* Daily Goal Management Box & Weekly Cadence & Streak Freeze */}
            <ProgressCard
              todayMinutes={stats.todayMinutes}
              dailyGoalMinutes={settings.dailyGoalMinutes}
              remainingMinutes={stats.remainingMinutes}
              progressPercent={stats.progressPercent}
              onQuickAdd15={() => handleQuickAdd15('Self Study Extension')}
              onChangeDailyGoal={() => setIsGoalModalOpen(true)}
              weeklyGoalDays={settings.weeklyGoalDays}
              streakFreezeRemaining={settings.streakFreezeRemaining}
              sessions={sessions}
              canActivateFreeze={canActivateFreeze}
              onActivateStreakFreeze={handleActivateStreakFreeze}
            />

            {/* Two-Column Midsection: Calendar & Topics Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Column A: Monthly Learning Calendar (7 cols) */}
              <div className="lg:col-span-7">
                <CalendarCard
                  sessions={sessions}
                  onSelectDate={dateStr => setDayDetailsDate(dateStr)}
                  onOpenRecordForDate={handleOpenRecordForDate}
                />
              </div>

              {/* Column B: Category Distribution & Mastery Pulse (5 cols) */}
              <div className="lg:col-span-5">
                <CategoryDistributionCard
                  totalSprints={stats.totalSprints}
                  categoryStats={stats.categoryStats}
                  masteredCount={sessions.filter(s => s.mastered).length}
                  onOpenMasteryModal={() => setIsMasteryModalOpen(true)}
                  onSelectCategoryFilter={cat => setSelectedCategory(cat)}
                  onManageTracks={() => setCurrentTab('goal-settings')}
                  activeTracks={settings.activeTracks}
                  onUpdateActiveTracks={tracks => {
                    setSettings(prev => ({ ...prev, activeTracks: tracks }));
                    if (authState.isAuthenticated && authState.userId) {
                      setDoc(
                        doc(db, 'users', authState.userId, 'settings', 'current'),
                        { activeTracks: tracks },
                        { merge: true }
                      ).catch(e => console.warn('Track sync warning:', e));
                    }
                  }}
                />
              </div>
            </div>

            {/* Search, Filtering & Session History Section */}
            <SessionHistory
              sessions={sessions}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onClearFilters={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              onEditSession={handleEditSession}
              onDeleteSession={handleRequestDeleteSession}
              onOpenRecordModal={() => {
                setEditingSession(null);
                setRecordModalDefaultDate(getTodayStr());
                setIsRecordModalOpen(true);
              }}
              activeTracks={settings.activeTracks}
            />
          </div>
        )}

        {currentTab === 'monthly-calendar' && (
          <ActivityMatrixView
            sessions={sessions}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onOpenRecordModal={() => {
              setEditingSession(null);
              setRecordModalDefaultDate(getTodayStr());
              setIsRecordModalOpen(true);
            }}
          />
        )}

        {currentTab === 'goal-settings' && (
          <GoalSettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            sessions={sessions}
            onImportSessions={setSessions}
            onResetData={() => {
              setSessions([]);
              setSettings(INITIAL_GOAL_SETTINGS);
              setProfile(INITIAL_USER_PROFILE);
              localStorage.removeItem('streaktracker_sessions');
              localStorage.removeItem('streaktracker_settings');
              localStorage.removeItem('streaktracker_profile');
            }}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'all-users' && isAdmin && (
          <UsersDirectoryView
            currentUserProfile={profile}
            currentUserId={authState.userId}
            onOpenRecordModal={() => {
              setEditingSession(null);
              setRecordModalDefaultDate(getTodayStr());
              setIsRecordModalOpen(true);
            }}
            onOpenDatabaseExplorer={() => {
              if (isAdmin) setIsAdminExplorerOpen(true);
            }}
            onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}
      </main>
 
      {/* Mobile Bottom Navigation Bar (compact, touch-friendly tab bar) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenRecordModal={() => {
          setEditingSession(null);
          setRecordModalDefaultDate(getTodayStr());
          setIsRecordModalOpen(true);
        }}
        isAdmin={isAdmin}
      />

      {/* Subtle Developer Hotkeys Bar */}
      <div className="hidden md:flex items-center justify-center gap-6 py-2.5 bg-[#0a0d12] border-t border-[#18202c] text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[#161e2b] border border-[#263345] text-slate-300 font-mono text-[10px]">N</kbd>
          Record Sprint
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[#161e2b] border border-[#263345] text-slate-300 font-mono text-[10px]">T</kbd>
          Focus Timer
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[#161e2b] border border-[#263345] text-slate-300 font-mono text-[10px]">B</kbd>
          Milestones
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[#161e2b] border border-[#263345] text-slate-300 font-mono text-[10px]">Esc</kbd>
          Dismiss
        </span>
      </div>

      {/* Footer */}
      <Footer
        onNavigateTab={tab => {
          if (tab === 'all-users' && !isAdmin) return;
          setCurrentTab(tab as typeof currentTab);
        }}
        isAdmin={isAdmin}
      />

      {/* Developer Badges & Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        sessions={sessions}
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
        totalHours={stats.totalHours}
        activeTracks={settings.activeTracks}
      />

      {/* Toast Notification */}
      {streakFreezeToast && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#131b26] border border-[#00f5a0]/40 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <span className="material-symbols-outlined text-[#00f5a0] text-xl">ac_unit</span>
          <span className="text-sm font-medium">{streakFreezeToast}</span>
        </div>
      )}

      {/* Record Session Modal */}
      <RecordSessionModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingSession(null);
        }}
        onSaveSession={handleSaveSession}
        initialSession={editingSession}
        defaultDate={recordModalDefaultDate}
        activeTracks={settings.activeTracks}
        onAddTrack={handleQuickAddTrack}
        onDeleteSession={handleRequestDeleteSession}
      />

      {/* Sprint Focus Timer Modal */}
      <SprintTimerModal
        isOpen={isSprintTimerOpen}
        onClose={() => setIsSprintTimerOpen(false)}
        onSprintCompleted={handleSprintCompleted}
        activeTracks={settings.activeTracks}
      />

      {/* Goal Settings Quick Modal */}
      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={settings.dailyGoalMinutes}
        onUpdateGoal={newGoal =>
          setSettings(prev => ({ ...prev, dailyGoalMinutes: newGoal }))
        }
      />

      {/* Day Details Modal */}
      {dayDetailsDate && (
        <DayDetailsModal
          isOpen={!!dayDetailsDate}
          onClose={() => setDayDetailsDate(null)}
          dateStr={dayDetailsDate}
          sessions={sessions}
          onAddSessionForDay={handleOpenRecordForDate}
          onDeleteSession={handleRequestDeleteSession}
          onEditSession={handleEditSession}
        />
      )}

      {/* Mastery Concepts Modal */}
      <MasteryConceptsModal
        isOpen={isMasteryModalOpen}
        onClose={() => setIsMasteryModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        currentStreak={stats.currentStreak}
        totalHours={stats.totalHours}
        totalDays={stats.totalDays}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
      />

      {/* Admin Database & Records Explorer Modal - Admin Only */}
      {isAdmin && (
        <AdminDataExplorerModal
          isOpen={isAdminExplorerOpen}
          onClose={() => setIsAdminExplorerOpen(false)}
          currentUserId={authState.userId}
          currentUserProfile={profile}
        />
      )}

      {/* Google Sheets Synchronization Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        currentUserProfile={profile}
        allUsers={allUsers}
        onNotify={msg => {
          setSheetsToast(msg);
          setTimeout(() => setSheetsToast(null), 4000);
        }}
      />

      {/* Sheets Sync Toast Notification */}
      {sheetsToast && (
        <div className="fixed bottom-20 sm:bottom-8 left-4 sm:left-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#131b26] border border-[#00f5a0]/40 text-white shadow-2xl backdrop-blur-md animate-in fade-in">
          <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">table_chart</span>
          <span className="text-[0.8125rem] font-medium font-mono">{sheetsToast}</span>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Iframe-safe, replaces blocked window.confirm) */}
      <DeleteConfirmModal
        isOpen={!!sessionToDelete}
        itemName={sessionToDelete?.title}
        details={
          sessionToDelete
            ? `${sessionToDelete.durationMinutes} mins • ${sessionToDelete.category} • ${sessionToDelete.date}`
            : undefined
        }
        onConfirm={handleConfirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
}
