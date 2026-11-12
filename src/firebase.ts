import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline',
});

// In-memory token management conforming strictly to Workspace skill guidelines
let cachedAccessToken: string | null = null;
let cachedGoogleAccount: { email?: string | null; displayName?: string | null; photoURL?: string | null } | null = null;

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null, account?: { email?: string | null; displayName?: string | null; photoURL?: string | null } | null) => {
  cachedAccessToken = token;
  if (account !== undefined) cachedGoogleAccount = account;
};

export const getGoogleAccount = () => cachedGoogleAccount;

export const connectGoogleAccount = async (): Promise<{ accessToken: string; email: string; name: string } | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google');
    }
    cachedAccessToken = credential.accessToken;
    cachedGoogleAccount = {
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    };
    return {
      accessToken: cachedAccessToken,
      email: result.user.email || '',
      name: result.user.displayName || 'Google User',
    };
  } catch (err) {
    console.error('Google authorization error:', err);
    throw err;
  }
};

// Error handling types conforming to skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let authInfo = {
    userId: undefined as string | null | undefined,
    email: undefined as string | null | undefined,
    emailVerified: undefined as boolean | null | undefined,
    isAnonymous: undefined as boolean | null | undefined,
    tenantId: undefined as string | null | undefined,
    providerInfo: [] as { providerId?: string | null; email?: string | null }[],
  };

  try {
    if (auth.currentUser) {
      authInfo = {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified,
        isAnonymous: auth.currentUser.isAnonymous,
        tenantId: auth.currentUser.tenantId,
        providerInfo: auth.currentUser.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
      };
    }
  } catch {
    // If accessing auth.currentUser throws due to token issues
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo,
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Safely clear Firebase Auth session
export async function signOutAuth() {
  try {
    await fbSignOut(auth);
    cachedAccessToken = null;
    cachedGoogleAccount = null;
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
}

// Auto-recovery: If Firebase Auth token service is disabled on the GCP project,
// clear stale Firebase Auth sessions so Firestore can connect seamlessly unauthenticated.
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged(async (currentUser) => {
    if (currentUser) {
      try {
        await currentUser.getIdToken();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (
          errorMsg.includes('token-service-api') ||
          errorMsg.includes('securetoken.googleapis.com')
        ) {
          console.warn(
            'SecureToken API disabled in project. Clearing Firebase Auth user session so Firestore connects cleanly.'
          );
          await signOutAuth();
        }
      }
    }
  });
}

// Test connection on boot according to skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    } else if (
      errorMsg.includes('token-service-api') ||
      errorMsg.includes('securetoken.googleapis.com')
    ) {
      console.warn('Token Service API disabled on GCP project. Operating in direct unauthenticated mode.');
      await signOutAuth();
    }
  }
}

testConnection();

