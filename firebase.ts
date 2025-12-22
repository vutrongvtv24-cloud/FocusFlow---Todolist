import { initializeApp } from 'firebase/app';
// @ts-ignore - Ignore type check ensuring generic compat during build
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------

// Safe access to environment variables. Cast fallback to any to avoid type errors.
const env = import.meta.env || ({} as any);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

let app;
let auth: any = null;
let googleProvider: any = null;
let db: any = null;

// Only initialize if configuration is present to prevent crashes
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize Auth if available
    if (getAuth) {
        auth = getAuth(app);
    }
    
    // Initialize Provider
    if (GoogleAuthProvider) {
        googleProvider = new GoogleAuthProvider();
        googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
    }
    
    // Initialize Firestore
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  console.warn("Firebase Configuration Missing! Application running in limited mode. Check your .env file.");
}

export { app, auth, googleProvider, db };