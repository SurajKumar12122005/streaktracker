import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider, signOutAuth, setAccessToken } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onAuthenticated: (email: string, userId: string, initialProfile?: Partial<UserProfile>) => void;
  onExploreDemo: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  onExploreDemo,
}) => {
  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regMobileNumber, setRegMobileNumber] = useState('');
  const [regTitle, setRegTitle] = useState('Full Stack Engineer');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [savedUser, setSavedUser] = useState<{ username?: string; email: string; userId: string; name?: string } | null>(null);

  // Read saved user preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('streaktracker_saved_user');
      const lastUsername = localStorage.getItem('streaktracker_last_username');
      const lastEmail = localStorage.getItem('streaktracker_last_email');

      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedUser(parsed);
        if (parsed.username) {
          setLoginIdentifier(parsed.username);
        } else if (parsed.email) {
          setLoginIdentifier(parsed.email);
        }
      } else if (lastUsername) {
        setLoginIdentifier(lastUsername);
      } else if (lastEmail) {
        setLoginIdentifier(lastEmail);
      }
    } catch (e) {
      console.warn('Could not read saved user:', e);
    }
  }, []);

  const handleQuickResume = () => {
    if (!savedUser) return;
    if (rememberDevice) {
      localStorage.setItem('streaktracker_remember_device', 'true');
    }
    onAuthenticated(savedUser.email, savedUser.userId, {
      username: savedUser.username,
      name: savedUser.name || 'Developer',
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your username or registered email.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      const user = data.user;

      if (rememberDevice) {
        try {
          localStorage.setItem(
            'streaktracker_saved_user',
            JSON.stringify({
              userId: user.userId,
              username: user.username,
              email: user.email,
              name: user.name,
              timestamp: Date.now(),
            })
          );
          localStorage.setItem('streaktracker_last_username', user.username);
          localStorage.setItem('streaktracker_last_email', user.email);
          localStorage.setItem('streaktracker_remember_device', 'true');
        } catch (storageErr) {
          console.warn('LocalStorage save notice:', storageErr);
        }
      }

      onAuthenticated(user.email, user.userId, {
        userId: user.userId,
        username: user.username,
        email: user.email,
        name: user.name,
        mobileNumber: user.mobileNumber,
        title: user.title,
        bio: user.bio,
        role: user.role,
        profileCompleted: user.profileCompleted ?? true,
      });
    } catch (err: any) {
      console.error('Login network error:', err);
      // Offline fallback for known admin or direct session
      if (cleanId.toLowerCase() === 'suraj' && loginPassword === 'password123') {
        onAuthenticated('surajsasi1212@gmail.com', 'user_surajsasi1212_gmail_com', {
          username: 'suraj',
          name: 'Suraj Sasi',
          email: 'surajsasi1212@gmail.com',
          role: 'admin',
          profileCompleted: true,
        });
      } else {
        setErrorMsg(err.message || 'Network connection error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanUsername)) {
      setErrorMsg('Username can only contain alphanumeric characters, underscores, and hyphens.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: regPassword,
          name: regFullName.trim() || cleanUsername,
          mobileNumber: regMobileNumber.trim(),
          title: regTitle.trim() || 'Full Stack Engineer',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Registration failed. Please check inputs.');
        setIsLoading(false);
        return;
      }

      const user = data.user;
      setSuccessMsg('Account registered successfully! Redirecting...');

      // Live sync new profile to Cloud Firestore
      try {
        await setDoc(
          doc(db, 'users', user.userId),
          {
            userId: user.userId,
            username: user.username,
            email: user.email,
            name: user.name,
            mobileNumber: user.mobileNumber,
            title: user.title,
            bio: user.bio,
            role: user.role,
            profileCompleted: true,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn('Firestore live registration sync notice:', fsErr);
      }

      if (rememberDevice) {
        try {
          localStorage.setItem(
            'streaktracker_saved_user',
            JSON.stringify({
              userId: user.userId,
              username: user.username,
              email: user.email,
              name: user.name,
              timestamp: Date.now(),
            })
          );
          localStorage.setItem('streaktracker_last_username', user.username);
          localStorage.setItem('streaktracker_last_email', user.email);
        } catch (storageErr) {
          console.warn('LocalStorage save notice:', storageErr);
        }
      }

      setTimeout(() => {
        onAuthenticated(user.email, user.userId, {
          userId: user.userId,
          username: user.username,
          email: user.email,
          name: user.name,
          mobileNumber: user.mobileNumber,
          title: user.title,
          bio: user.bio,
          role: user.role,
          profileCompleted: true,
        });
      }, 500);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Could not connect to registration server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('');
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user && res.user.email) {
        const credential = GoogleAuthProvider.credentialFromResult(res);
        if (credential?.accessToken) {
          setAccessToken(credential.accessToken, {
            email: res.user.email,
            displayName: res.user.displayName,
            photoURL: res.user.photoURL,
          });
        }

        const safeUsername = res.user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

        if (rememberDevice) {
          localStorage.setItem(
            'streaktracker_saved_user',
            JSON.stringify({
              email: res.user.email,
              userId: res.user.uid,
              username: safeUsername,
              name: res.user.displayName || 'Developer',
              timestamp: Date.now(),
            })
          );
          localStorage.setItem('streaktracker_last_email', res.user.email);
          localStorage.setItem('streaktracker_last_username', safeUsername);
        }

        onAuthenticated(res.user.email, res.user.uid, {
          username: safeUsername,
          name: res.user.displayName || 'Developer',
          email: res.user.email,
        });
      }
    } catch (err: unknown) {
      console.warn('Google sign-in notice:', err);
      setErrorMsg('Google Sign-In was cancelled or popup closed. You can register/sign in with username & password below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background glow meshes */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#00f5a0]/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full rounded-2xl bg-[#131821] border border-[#222a36] p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.65)] flex flex-col gap-6 relative z-10 animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#181f2a] border border-[#2a3240] text-[#00f5a0] mb-3 shadow-[0_0_20px_rgba(0,245,160,0.15)]">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-white">
            Streak<span className="text-[#00f5a0]">Tracker</span>
          </h1>
          <p className="text-[0.8125rem] text-slate-400 mt-1">
            Engineering consistency & developer cadence tracker
          </p>
        </div>

        {/* Quick Resume Card for Returning Users */}
        {savedUser && authMode === 'login' && (
          <div className="p-3.5 rounded-xl bg-[#0e141b] border border-[#00f5a0]/30 shadow-[0_0_15px_rgba(0,245,160,0.06)] flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#181f2a] border border-[#2a3240] flex items-center justify-center text-[#00f5a0] text-xs font-mono font-bold shrink-0">
                {(savedUser.username || savedUser.name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[0.8125rem] font-bold text-white truncate flex items-center gap-1.5">
                  <span>{savedUser.username || savedUser.name || 'Saved User'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" />
                </div>
                <div className="text-[0.6875rem] text-slate-400 font-mono truncate">
                  {savedUser.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickResume}
              className="px-3 py-1.5 rounded-lg bg-[#00f5a0] hover:brightness-110 active:scale-95 text-black font-bold text-[0.75rem] font-mono shrink-0 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,245,160,0.3)]"
            >
              1-Click Resume
            </button>
          </div>
        )}

        {/* Auth Mode Toggle Tabs (Sign In vs Register) */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0e141b] border border-[#222a36]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-lg text-[0.8125rem] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-[#181f2a] text-[#00f5a0] shadow-sm border border-[#2a3240]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-lg text-[0.8125rem] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-[#181f2a] text-[#00f5a0] shadow-sm border border-[#2a3240]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Register</span>
          </button>
        </div>

        {/* Error / Success Alert Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-[0.8125rem] flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0 mt-0.5">
              error
            </span>
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-[0.8125rem] flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-[#00f5a0] shrink-0 mt-0.5">
              check_circle
            </span>
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.75rem] font-mono text-slate-300 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. your_username or you@example.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.875rem] text-white placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.75rem] font-mono text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[0.6875rem] font-mono text-slate-400 hover:text-[#00f5a0] transition-colors cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.875rem] text-white placeholder-slate-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[0.75rem] select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={e => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-[#2a3240] bg-[#0e141b] text-[#00f5a0] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00f5a0]"
              />
              <span>Remember me on this browser</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#00f5a0] hover:brightness-110 active:scale-[0.98] text-black font-bold text-[0.875rem] shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Sign In</span>
                </>
              )}
            </button>

          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[0.75rem] font-mono text-slate-300 mb-1">
                Username <span className="text-[#00f5a0]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  badge
                </span>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="e.g. alex_coder, dev_sarah"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.8125rem] text-white font-mono placeholder-slate-500 transition-colors"
                />
              </div>
              <span className="text-[0.6875rem] text-slate-500 font-mono mt-0.5 block">
                Lowercase letters, numbers, underscores, min 3 chars
              </span>
            </div>

            <div>
              <label className="block text-[0.75rem] font-mono text-slate-300 mb-1">
                Email Address <span className="text-[#00f5a0]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.8125rem] text-white placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.75rem] font-mono text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.8125rem] text-white placeholder-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-mono text-slate-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={regMobileNumber}
                  onChange={e => setRegMobileNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.8125rem] text-white font-mono placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.75rem] font-mono text-slate-300 mb-1">
                  Password <span className="text-[#00f5a0]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.8125rem] text-white placeholder-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-mono text-slate-300 mb-1">
                  Confirm Password <span className="text-[#00f5a0]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141b] border border-[#2a3240] focus:border-[#00f5a0] focus:outline-none text-[0.8125rem] text-white placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Registration */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#00f5a0] hover:brightness-110 active:scale-[0.98] text-black font-bold text-[0.875rem] shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Create Account & Start Tracking</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#222a36] w-full" />
          <span className="bg-[#131821] px-3 text-[0.6875rem] uppercase font-mono text-slate-500 shrink-0">
            Or continue with
          </span>
          <div className="border-t border-[#222a36] w-full" />
        </div>

        {/* Alternative Actions: Google & Demo */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-[0.8125rem] shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
