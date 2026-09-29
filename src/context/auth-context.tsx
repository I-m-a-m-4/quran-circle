'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, getRedirectResult } from 'firebase/auth';
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
    // 1. Listen for redirect login result (handles fallback when popup was blocked)
    getRedirectResult(auth).catch((err) => {
      console.warn("Auth redirect result check:", err);
    });

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Ensure user document exists in Firestore (especially after redirect login)
        try {
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const userName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
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
        } catch (e) {
          console.warn("Profile document check/create fallback:", e);
        }

        // Set up real-time listener for user profile document
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
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
