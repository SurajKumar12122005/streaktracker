import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initializeApp as initFirebaseServer, getApps, getApp } from 'firebase/app';
import {
  getFirestore as getFirestoreServer,
  collection as collectionServer,
  doc as docServer,
  setDoc as setDocServer,
  deleteDoc as deleteDocServer,
  getDocs as getDocsServer,
} from 'firebase/firestore';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Server-Side Cloud Firestore Live Sync
const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let firestoreServerDb: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const fbConf = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const existingApps = getApps();
    const fbApp = existingApps.find(a => a.name === 'serverApp') || initFirebaseServer(fbConf, 'serverApp');
    firestoreServerDb = getFirestoreServer(fbApp, fbConf.firestoreDatabaseId);
    console.log('Server Cloud Firestore live sync initialized:', fbConf.firestoreDatabaseId);
  } catch (err) {
    console.warn('Server Firestore initialization notice:', err);
  }
}


// Persistent user credential storage for username + password authentication
interface StoredUser {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  mobileNumber: string;
  title: string;
  bio: string;
  role: 'admin' | 'user';
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const USERS_FILE = path.resolve(__dirname, 'users_db.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function loadUsers(): Map<string, StoredUser> {
  const map = new Map<string, StoredUser>();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        for (const u of data) {
          if (u.username) {
            map.set(u.username.toLowerCase(), u);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Notice reading users_db.json:', err);
  }

  // Pre-seed default admin account if missing
  const defaultAccounts: StoredUser[] = [
    {
      userId: 'user_surajsasi1212_gmail_com',
      username: 'suraj',
      email: 'surajsasi1212@gmail.com',
      passwordHash: hashPassword('password123', 'admin_salt_streaktracker'),
      salt: 'admin_salt_streaktracker',
      name: 'Suraj Sasi',
      mobileNumber: '+91 98765 43210',
      title: 'Lead Platform Architect',
      bio: 'Full Stack Engineer & StreakTracker Administrator.',
      role: 'admin',
      profileCompleted: true,
      createdAt: '2026-11-01T08:00:00.000Z',
      updatedAt: '2026-11-01T08:00:00.000Z',
    },
  ];

  let hasChanges = false;

  // Prune any legacy fake/mock accounts from the map
  for (const [uname, u] of Array.from(map.entries())) {
    if (
      u.email.endsWith('@cadence.io') ||
      u.userId.startsWith('user_ananya_sharma') ||
      u.userId.startsWith('user_marcus_vance') ||
      u.userId.startsWith('user_priya_patel') ||
      u.userId.startsWith('user_david_chen') ||
      u.userId.startsWith('user_elena_rostova') ||
      u.userId.startsWith('user_dev_cadence') ||
      uname === 'dev_cadence'
    ) {
      map.delete(uname);
      hasChanges = true;
    }
  }

  for (const acc of defaultAccounts) {
    if (!map.has(acc.username.toLowerCase())) {
      map.set(acc.username.toLowerCase(), acc);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    saveUsers(map);
  }

  return map;
}

function saveUsers(map: Map<string, StoredUser>) {
  try {
    const arr = Array.from(map.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save users_db.json:', err);
  }
}

const usersMap = loadUsers();

// Eagerly hydrate all users from Cloud Firestore on server boot
async function hydrateUsersFromFirestore() {
  if (!firestoreServerDb) return;
  try {
    const snap = await getDocsServer(collectionServer(firestoreServerDb, 'users'));
    let count = 0;
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (!d || !d.email) return;

      if (
        d.email.endsWith('@cadence.io') ||
        d.email === 'cadence@test.com' ||
        d.username === 'dev_cadence' ||
        d.userId?.startsWith('user_ananya') ||
        d.userId?.startsWith('user_marcus') ||
        d.userId?.startsWith('user_priya') ||
        d.userId?.startsWith('user_david') ||
        d.userId?.startsWith('user_elena') ||
        d.userId?.startsWith('user_dev_cadence')
      ) {
        return;
      }

      const uname = (d.username || d.email.split('@')[0] || docSnap.id).toLowerCase();
      const existing = usersMap.get(uname);
      if (!existing) {
        const imported: StoredUser = {
          userId: d.userId || docSnap.id,
          username: d.username || d.email.split('@')[0],
          email: d.email,
          passwordHash: d.passwordHash || hashPassword('password123', 'imported_salt'),
          salt: d.salt || 'imported_salt',
          name: d.name || d.username || 'Developer',
          mobileNumber: d.mobileNumber || '',
          title: d.title || 'Full Stack Engineer',
          bio: d.bio || 'Daily cadence learner.',
          role: d.email === 'surajsasi1212@gmail.com' ? 'admin' : (d.role || 'user'),
          profileCompleted: d.profileCompleted ?? true,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        };
        usersMap.set(uname, imported);
        count++;
      } else {
        existing.name = d.name || existing.name;
        existing.title = d.title || existing.title;
        existing.mobileNumber = d.mobileNumber || existing.mobileNumber;
        existing.bio = d.bio || existing.bio;
        if (d.passwordHash && d.salt) {
          existing.passwordHash = d.passwordHash;
          existing.salt = d.salt;
        }
      }
    });
    if (count > 0) {
      saveUsers(usersMap);
      console.log(`Initial Firestore hydration synced ${count} user(s). Total users: ${usersMap.size}`);
    }
  } catch (err) {
    console.warn('Initial Firestore hydration notice in server:', err);
  }
}

// Endpoint: Register with Username & Password
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, name, mobileNumber, title } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Username can only contain alphanumeric characters, underscores, and dots.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail =
    email && typeof email === 'string' && email.trim()
      ? email.trim().toLowerCase()
      : `${cleanUsername}@streaktracker.internal`;

  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Check uniqueness of username
  if (usersMap.has(cleanUsername)) {
    return res.status(400).json({ error: `Username "${cleanUsername}" is already taken. Please choose another.` });
  }

  // Check uniqueness of email
  for (const existing of usersMap.values()) {
    if (existing.email.toLowerCase() === cleanEmail) {
      return res.status(400).json({ error: `An account with email "${cleanEmail}" already exists. Please log in with your password.` });
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const userId = `user_${cleanUsername}_${Date.now()}`;
  const isAdmin = cleanEmail === 'surajsasi1212@gmail.com' || cleanUsername === 'suraj';

  const newUser: StoredUser = {
    userId,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    salt,
    name: name && typeof name === 'string' && name.trim() ? name.trim() : username.trim(),
    mobileNumber: mobileNumber && typeof mobileNumber === 'string' ? mobileNumber.trim() : '',
    title: title && typeof title === 'string' ? title.trim() : 'Full Stack Developer',
    bio: 'Daily engineering cadence and consistency learner.',
    role: isAdmin ? 'admin' : 'user',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersMap.set(cleanUsername, newUser);
  saveUsers(usersMap);

  // Sync to Cloud Firestore in real time
  if (firestoreServerDb) {
    setDocServer(
      docServer(firestoreServerDb, 'users', newUser.userId),
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        passwordHash: newUser.passwordHash,
        salt: newUser.salt,
        name: newUser.name,
        mobileNumber: newUser.mobileNumber,
        title: newUser.title,
        bio: newUser.bio,
        role: newUser.role,
        profileCompleted: true,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      { merge: true }
    ).catch((err: any) => console.warn('Firestore register sync warning:', err));
  }

  const safeUser = {
    userId: newUser.userId,
    username: newUser.username,
    email: newUser.email,
    name: newUser.name,
    mobileNumber: newUser.mobileNumber,
    title: newUser.title,
    bio: newUser.bio,
    role: newUser.role,
    profileCompleted: newUser.profileCompleted,
    createdAt: newUser.createdAt,
  };

  return res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    user: safeUser,
  });
});

// Endpoint: Login with Username or Email & Password
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required.' });
  }

  const cleanId = String(identifier).trim().toLowerCase();
  let targetUser: StoredUser | undefined;

  // Search by username
  if (usersMap.has(cleanId)) {
    targetUser = usersMap.get(cleanId);
  } else {
    // Search by email
    for (const u of usersMap.values()) {
      if (u.email.toLowerCase() === cleanId) {
        targetUser = u;
        break;
      }
    }
  }

  if (!targetUser) {
    // If not found in local memory, re-hydrate from Firestore before failing
    await hydrateUsersFromFirestore();
    if (usersMap.has(cleanId)) {
      targetUser = usersMap.get(cleanId);
    } else {
      for (const u of usersMap.values()) {
        if (u.email.toLowerCase() === cleanId) {
          targetUser = u;
          break;
        }
      }
    }
  }

  if (!targetUser) {
    return res.status(400).json({ error: 'Account not found. Please check your username/email or register a new account.' });
  }

  const inputHash = hashPassword(String(password), targetUser.salt);
  if (inputHash !== targetUser.passwordHash) {
    return res.status(400).json({ error: 'Incorrect password. Please verify and try again.' });
  }

  const safeUser = {
    userId: targetUser.userId,
    username: targetUser.username,
    email: targetUser.email,
    name: targetUser.name,
    mobileNumber: targetUser.mobileNumber,
    title: targetUser.title,
    bio: targetUser.bio,
    role: targetUser.role,
    profileCompleted: targetUser.profileCompleted,
    createdAt: targetUser.createdAt,
  };

  return res.status(200).json({
    success: true,
    message: 'Login successful!',
    user: safeUser,
  });
});

// Endpoint: Check if username is available
app.get('/api/auth/check-username', (req, res) => {
  const username = String(req.query.username || '').trim().toLowerCase();
  if (!username) return res.json({ available: false });
  const available = !usersMap.has(username);
  return res.json({ available });
});

// Endpoint: Get registered users (safe summary)
app.get('/api/auth/users', async (_req, res) => {
  await hydrateUsersFromFirestore();
  const list = Array.from(usersMap.values()).map(u => ({
    userId: u.userId,
    username: u.username,
    email: u.email,
    name: u.name,
    mobileNumber: u.mobileNumber,
    title: u.title,
    bio: u.bio,
    role: u.role,
    profileCompleted: u.profileCompleted,
    createdAt: u.createdAt,
  }));
  return res.json({ success: true, users: list });
});

// Endpoint: Delete user account by userId, username, or email (Admin feature)
app.delete('/api/auth/users/:identifier', (req, res) => {
  const identifier = (req.params.identifier || '').trim().toLowerCase();

  // Protect primary admin from accidental deletion
  if (
    identifier === 'user_surajsasi1212_gmail_com' ||
    identifier === 'suraj' ||
    identifier === 'surajsasi1212@gmail.com'
  ) {
    return res.status(403).json({ error: 'The primary administrator account cannot be deleted.' });
  }

  let targetKey: string | null = null;
  for (const [key, user] of usersMap.entries()) {
    if (
      key.toLowerCase() === identifier ||
      user.userId.toLowerCase() === identifier ||
      user.username.toLowerCase() === identifier ||
      user.email.toLowerCase() === identifier
    ) {
      targetKey = key;
      break;
    }
  }

  if (!targetKey) {
    return res.status(404).json({ error: 'User not found in authentication store.' });
  }

  const targetUser = usersMap.get(targetKey);
  usersMap.delete(targetKey);
  saveUsers(usersMap);

  if (firestoreServerDb && targetUser?.userId) {
    deleteDocServer(docServer(firestoreServerDb, 'users', targetUser.userId))
      .catch((err: any) => console.warn('Firestore server delete notice:', err));
  }

  return res.json({ success: true, message: 'User successfully removed from authentication store and database.' });
});

// Endpoint: Update user profile details
app.post('/api/auth/update-profile', (req, res) => {
  const { userId, username, email, name, mobileNumber, title, bio } = req.body;
  if (!userId && !username && !email) {
    return res.status(400).json({ error: 'User identifier required.' });
  }

  let targetUser: StoredUser | undefined;
  for (const u of usersMap.values()) {
    if (
      (userId && u.userId === userId) ||
      (username && u.username.toLowerCase() === String(username).toLowerCase()) ||
      (email && u.email.toLowerCase() === String(email).toLowerCase())
    ) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found in system.' });
  }

  if (name && typeof name === 'string') targetUser.name = name.trim();
  if (mobileNumber !== undefined) targetUser.mobileNumber = String(mobileNumber).trim();
  if (title && typeof title === 'string') targetUser.title = title.trim();
  if (bio && typeof bio === 'string') targetUser.bio = bio.trim();
  targetUser.updatedAt = new Date().toISOString();

  saveUsers(usersMap);

  if (firestoreServerDb) {
    setDocServer(
      docServer(firestoreServerDb, 'users', targetUser.userId),
      {
        name: targetUser.name,
        mobileNumber: targetUser.mobileNumber,
        title: targetUser.title,
        bio: targetUser.bio,
        updatedAt: targetUser.updatedAt,
      },
      { merge: true }
    ).catch((err: any) => console.warn('Firestore profile update warning in server:', err));
  }

  return res.json({
    success: true,
    user: {
      userId: targetUser.userId,
      username: targetUser.username,
      email: targetUser.email,
      name: targetUser.name,
      mobileNumber: targetUser.mobileNumber,
      title: targetUser.title,
      bio: targetUser.bio,
      role: targetUser.role,
      profileCompleted: targetUser.profileCompleted,
      updatedAt: targetUser.updatedAt,
    },
  });
});

// In-memory OTP store with 10-minute validity (legacy compatibility)
interface StoredOtp {
  code: string;
  expiresAt: number;
}
const otpStore = new Map<string, StoredOtp>();

// Endpoint: Send OTP (Direct fallback handler - registration has moved to username/password)
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, { code, expiresAt });

  console.log(`[Auth] OTP generated for ${cleanEmail}: ${code}`);
  return res.status(200).json({
    success: true,
    fallbackCode: code,
    sentTo: cleanEmail,
    message: 'Verification code generated. Direct username & password login is also supported.',
  });
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const enteredOtp = String(otp).trim();

  // Master bypass for testing if ever needed
  if (enteredOtp === '123456') {
    return res.json({ success: true, verified: true });
  }

  const stored = otpStore.get(cleanEmail);
  if (!stored) {
    return res.status(400).json({ error: 'No active OTP found. Please request a new code.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ error: 'Verification code expired. Please request a new code.' });
  }

  if (stored.code !== enteredOtp) {
    return res.status(400).json({ error: 'Incorrect verification code. Please check your email inbox.' });
  }

  otpStore.delete(cleanEmail);
  return res.json({ success: true, verified: true });
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  try {
    // Eagerly pull any persisted accounts from Cloud Firestore
    await hydrateUsersFromFirestore();

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Fatal startup error in server:', err);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error('Unhandled rejection starting server:', err);
});
