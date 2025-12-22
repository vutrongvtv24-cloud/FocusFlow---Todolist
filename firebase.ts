import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
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
    // Use compat initialization for App and Auth
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    // Use modular Firestore (passing compat app instance works in v9)
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  console.warn("Firebase Configuration Missing! Application running in limited mode. Check your .env file.");
}

export { app, auth, googleProvider, db };