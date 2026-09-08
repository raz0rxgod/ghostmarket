import { authFetch } from './api';

export interface FavoriteItem {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: string;
    oldPrice?: string;
    images: { url: string; isMain: boolean }[];
  };
}

export function getFavorites() {
  return authFetch<FavoriteItem[]>('/favorites');
}

export function addFavorite(productId: string) {
  return authFetch<FavoriteItem[]>(`/favorites/${productId}`, { method: 'POST' });
}

export function removeFavorite(productId: string) {
  return authFetch<FavoriteItem[]>(`/favorites/${productId}`, { method: 'DELETE' });
}
