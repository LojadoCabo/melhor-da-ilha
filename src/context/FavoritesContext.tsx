import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, collection, setDoc, getDocs, deleteDoc } from '../lib/firebase';
import { BUSINESSES } from '../data/businesses';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  closeToast: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('melhor-da-ilha-favorites');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const syncFirestoreFavorites = async () => {
      try {
        const favsRef = collection(db, 'users', user.uid, 'favorites');
        const snap = await getDocs(favsRef);
        const remoteIds: string[] = [];
        snap.forEach((docSnap) => {
          remoteIds.push(docSnap.id);
        });

        // Merge local favorites to remote if any exist locally that aren't on remote
        const merged = Array.from(new Set([...favorites, ...remoteIds]));
        if (isMounted) {
          setFavorites(merged);
        }

        // Upload any local favorites not yet stored in Firestore
        for (const localId of favorites) {
          if (!remoteIds.includes(localId)) {
            const biz = BUSINESSES.find(b => b.id === localId);
            const favDocRef = doc(db, 'users', user.uid, 'favorites', localId);
            await setDoc(favDocRef, {
              businessId: localId,
              businessName: biz?.name || localId,
              businessCity: biz?.cityName || 'Ilha de Itaparica e RMS',
              categoryId: biz?.categoryId || 'geral',
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('Could not sync favorites with Firestore:', err);
      }
    };

    syncFirestoreFavorites();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('melhor-da-ilha-favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const toggleFavorite = async (id: string) => {
    const exists = favorites.includes(id);
    const biz = BUSINESSES.find(b => b.id === id);

    if (exists) {
      setFavorites(prev => prev.filter(item => item !== id));
      showToast('Removido dos favoritos');

      if (user) {
        try {
          const favDocRef = doc(db, 'users', user.uid, 'favorites', id);
          await deleteDoc(favDocRef);
        } catch (err) {
          console.warn('Error deleting favorite from Firestore:', err);
        }
      }
    } else {
      setFavorites(prev => [...prev, id]);
      showToast('Salvo nos seus favoritos! ⭐ (Sincronizado na nuvem)');

      if (user) {
        try {
          const favDocRef = doc(db, 'users', user.uid, 'favorites', id);
          await setDoc(favDocRef, {
            businessId: id,
            businessName: biz?.name || id,
            businessCity: biz?.cityName || 'Ilha de Itaparica e RMS',
            categoryId: biz?.categoryId || 'geral',
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn('Error saving favorite to Firestore:', err);
        }
      }
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        toastMessage,
        showToast,
        closeToast
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
