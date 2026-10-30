import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  db,
  doc,
  setDoc,
  setCachedAccessToken,
  getCachedAccessToken
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  loginWithGoogle: () => Promise<string | null>;
  ensureGoogleWorkspaceToken: () => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  loginWithGoogle: async () => null,
  ensureGoogleWorkspaceToken: async () => '',
  logout: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        setCachedAccessToken(null);
        setAccessToken(null);
      }

      if (currentUser && currentUser.email) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Usuário Local',
              photoURL: currentUser.photoURL || '',
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Could not sync user profile to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<string | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;
      if (token) {
        setCachedAccessToken(token);
        setAccessToken(token);
      }
      return token;
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const ensureGoogleWorkspaceToken = async (): Promise<string> => {
    const current = getCachedAccessToken();
    if (current) {
      return current;
    }
    const token = await loginWithGoogle();
    if (!token) {
      throw new Error('Não foi possível obter a autorização do Google Workspace.');
    }
    return token;
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCachedAccessToken(null);
      setAccessToken(null);
    } catch (error: any) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, loginWithGoogle, ensureGoogleWorkspaceToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
