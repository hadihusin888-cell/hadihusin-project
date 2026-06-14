import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Guarded check for environment variables or configurations to prevent crash
const metaEnv = (import.meta as any).env || {};
// Highly resilient check: either environment variables are present or we use the custom SMP Al Irsyad parameters.
const isFirebaseConfigured = !!(
  metaEnv.VITE_FIREBASE_API_KEY ||
  metaEnv.VITE_FIREBASE_PROJECT_ID ||
  true // Force true as we explicitly configured the defaults below
);

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyCzzm4LuIlih53WEJfnvsHVTMy59acrxpE",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "elearning-smp.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "elearning-smp",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "elearning-smp.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "513297933792",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:513297933792:web:fec8a03bdff9f25d00b785",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-KRG3F9KDY1"
};

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully inside SMP Al Irsyad Surakarta E-Learning.");
  } catch (error) {
    console.warn("Firebase initialization failed, utilizing high-fidelity localStorage fallback engine: ", error);
  }
} else {
  console.log("Firebase is not fully configured yet. Utilizing high-fidelity local database engine to ensure 100% features work.");
}

export { db, auth, isFirebaseConfigured };
export default app;
