'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { CheckIcon } from './icons';

export function AddToCartButton({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem(productId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={adding}
      className="btn-gradient rounded-xl px-6 py-3.5 font-medium mb-8 disabled:opacity-50 flex items-center gap-2"
    >
      {added ? (
        <>
          <CheckIcon className="w-4 h-4" />
          Ajouté
        </>
      ) : adding ? (
        'Ajout en cours...'
      ) : (
        'Ajouter au panier'
      )}
    </button>
  );
}
