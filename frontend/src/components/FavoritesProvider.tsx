'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthProvider';
import {
  FavoriteItem,
  getFavorites,
  addFavorite as addFavoriteRequest,
  removeFavorite as removeFavoriteRequest,
} from '@/lib/favorites';

interface FavoritesState {
  items: FavoriteItem[];
  ids: Set<string>;
  loading: boolean;
  toggle: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await getFavorites());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = new Set(items.map((f) => f.productId));

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;
      const isFav = items.some((f) => f.productId === productId);
      const updated = isFav
        ? await removeFavoriteRequest(productId)
        : await addFavoriteRequest(productId);
      setItems(updated);
    },
    [isAuthenticated, items],
  );

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids]);

  return (
    <FavoritesContext.Provider value={{ items, ids, loading, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites doit être utilisé à l’intérieur de <FavoritesProvider>');
  return ctx;
}
