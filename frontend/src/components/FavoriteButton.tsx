'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useFavorites } from './FavoritesProvider';
import { HeartIcon } from './icons';

export function FavoriteButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const active = isFavorite(productId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={
        className ??
        'w-9 h-9 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-fuchsia-400 transition-colors disabled:opacity-50'
      }
    >
      <HeartIcon className={`w-4 h-4 ${active ? 'text-fuchsia-400' : ''}`} filled={active} />
    </button>
  );
}
