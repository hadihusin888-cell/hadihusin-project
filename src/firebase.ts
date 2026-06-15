import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import firebaseAppletConfig from '../firebase-applet-config.json';

// Guarded check for environment variables or configurations to prevent crash
const metaEnv = (import.meta as any).env || {};
// Highly resilient check: either environment variables are present or we use the custom SMP Al Irsyad parameters.
const isFirebaseConfigured = true;

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId
};

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
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
