export type CategoryType = 
  | 'DSA'
  | 'Python'
  | 'AI/ML'
  | 'Django'
  | 'SQL'
  | 'Web Development'
  | 'System Design'
  | 'DevOps';

export interface LearningSession {
  id: string;
  title: string;
  category: CategoryType | string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  notes: string;
  codeSnippet?: string;
  mastered?: boolean;
  createdAt: number;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessionsCount: number;
  isPracticed: boolean;
  isToday: boolean;
  isFuture: boolean;
  categories: string[];
}

export interface GoalSettings {
  dailyGoalMinutes: number;
  weeklyGoalDays: number;
  streakFreezeRemaining: number;
  usedStreakFreezeDates?: string[];
  momentumGuardDays: number;
  activeTracks: string[];
}

export interface UserProfile {
  userId?: string;
  username?: string;
  name: string;
  email: string;
  mobileNumber: string;
  title?: string;
  bio?: string;
  role?: 'admin' | 'user';
  profileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const ADMIN_EMAILS = ['surajsasi1212@gmail.com'];

export const isUserAdmin = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export const isMockUser = (user: { email?: string; userId?: string; username?: string }): boolean => {
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



