import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  indexedDBLocalPersistence 
} from "firebase/auth";
import { getFirestore, initializeFirestore, memoryLocalCache } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPuuPtoi5iE9s1U-AQkpTsmQI6Ulv7GMU",
  authDomain: "quran-circle-f2fc9.firebaseapp.com",
  projectId: "quran-circle-f2fc9",
  storageBucket: "quran-circle-f2fc9.firebasestorage.app",
  messagingSenderId: "670829895379",
  appId: "1:670829895379:web:dde3565744a909ebeb7e26",
  measurementId: "G-RFDZF1KR5B"
};

// Initialize Firebase (avoid re-initializing during hot-reloads in Next.js development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
let auth: any;
if (typeof window !== 'undefined') {
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    auth = getAuth(app);
  }
} else {
  auth = {} as any;
}

const db = typeof window !== 'undefined' ? initializeFirestore(app, {
  localCache: memoryLocalCache()
}) : ({} as any);

// Initialize Analytics (only supported in client-side environment)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics, browserPopupRedirectResolver };
