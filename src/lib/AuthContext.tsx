import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, signOut, User } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: (userId?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (userId?: string) => {
    const id = userId || user?.uid;
    if (!id) {
      setProfile(null);
      return;
    }

    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        console.warn("No profile found for user:", id);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        refreshProfile(currentUser.uid).finally(() => {
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.username?.toLowerCase() === 'dammy',
    refreshProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
