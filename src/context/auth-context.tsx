'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, getRedirectResult, browserPopupRedirectResolver } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  niyyah?: string;
  goal?: string;
  streak: number;
  completedToday: boolean;
  avatar: string;
  lastActiveDate?: string;
  circleMembers: string[];
  receivedNudges: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let isMounted = true;

    // Helper to ensure profile document exists in Firestore and update localStorage
    const syncUserProfile = async (currentUser: User) => {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userSnap = await getDoc(userDocRef);
        const userName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
        
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            id: currentUser.uid,
            name: userName,
            email: currentUser.email?.toLowerCase(),
            username: currentUser.email?.split('@')[0].toLowerCase(),
            streak: 0,
            completedToday: false,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.email?.split('@')[0].toLowerCase()}`,
            circleMembers: [],
            receivedNudges: [],
            createdAt: new Date().toISOString(),
          });
        }
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('userEmail', currentUser.email || '');
          localStorage.setItem('userName', userSnap.exists() && userSnap.data()?.name ? userSnap.data().name : userName);
        }
      } catch (e) {
        console.warn("Profile document check/create fallback:", e);
      }
    };

    const setupProfileListener = (currentUser: User) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      const userDocRef = doc(db, 'users', currentUser.uid);
      unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to user profile:", error);
        if (isMounted) setLoading(false);
      });
    };

    // 1. Process redirect result first (crucial for Google login via redirect in WebView2 / desktop)
    const checkRedirect = async () => {
      try {
        const redirectResult = await getRedirectResult(auth, browserPopupRedirectResolver);
        if (redirectResult && redirectResult.user && isMounted) {
          const redirectUser = redirectResult.user;
          setUser(redirectUser);
          await syncUserProfile(redirectUser);
          setupProfileListener(redirectUser);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('md_auth_redirect_in_progress');
            if (window.location.pathname.includes('/login') || window.location.pathname.includes('/signup')) {
              window.location.href = '/dashboard';
            }
          }
        }
      } catch (err) {
        console.warn("Auth redirect result check:", err);
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('md_auth_redirect_in_progress');
        }
      }
    };

    checkRedirect();

    // 2. Listen to standard Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);

      if (currentUser) {
        setupProfileListener(currentUser);
        await syncUserProfile(currentUser);
        if (typeof window !== 'undefined') {
          const redirectPending = localStorage.getItem('md_auth_redirect_in_progress') === 'true';
          if (redirectPending && (window.location.pathname.includes('/login') || window.location.pathname.includes('/signup'))) {
            localStorage.removeItem('md_auth_redirect_in_progress');
            window.location.href = '/dashboard';
          }
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
