import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAFAD1X9RvxNqun2m6w5fl4uFQNBUj2UVo",
  authDomain: "todolist-pomo.firebaseapp.com",
  projectId: "todolist-pomo",
  storageBucket: "todolist-pomo.firebasestorage.app",
  messagingSenderId: "365854985032",
  appId: "1:365854985032:web:1e34a66e711bbf2918817d",
};

// Initialize App (Modular)
const app = initializeApp(firebaseConfig);

// Auth (Modular)
// Using namespace import to avoid "no exported member" errors in some environments
export const auth = firebaseAuth.getAuth(app);
export const googleProvider = new firebaseAuth.GoogleAuthProvider();

// Add scope for Google Calendar Events (Write access)
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Firestore (Modular)
export const db = getFirestore(app);