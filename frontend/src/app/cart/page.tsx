'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { imageUrl } from '@/lib/api';
import { TrashIcon, ArrowRightIcon } from '@/components/icons';

export default function CartPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, total, loading, updateItem, removeItem, clear } = useCart();

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Panier</h1>
        <p className="text-white/50">
          Pour voir votre panier, connectez-vous{' '}
          <Link href="/login" className="text-gradient font-medium">
            ici
          </Link>
          .
        </p>
      </main>
    );
  }

  if (loading && items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Panier</h1>
        <p className="text-white/40">Chargement...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Panier</h1>
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Vide.{' '}
          <Link href="/catalog" className="text-gradient font-medium">
            Aller au catalogue
          </Link>
          .
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Panier</h1>
        <button onClick={() => clear()} className="text-sm text-white/40 hover:text-white transition-colors">
          Vider le panier
        </button>
      </div>

      <div className="glass-card rounded-2xl divide-y divide-white/[0.06] mb-6 overflow-hidden">
        {items.map((item) => {
          const main = item.product.images?.find((img) => img.isMain) ?? item.product.images?.[0];
          return (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/[0.03] shrink-0">
                {main ? (
                  <img
                    src={imageUrl(main.url)}
                    alt={item.product.title}
                    className="w-full h-full object-contain p-1"
                  />
                ) : null}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-medium text-white hover:text-gradient truncate block"
                >
                  {item.product.title}
                </Link>
                <div className="text-sm text-white/40">{item.product.price} € / pièce</div>
              </div>

              <div className="flex items-center border border-white/10 rounded-lg">
                <button
                  onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] rounded-l-lg transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                <button
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>

              <div className="w-24 text-right font-medium text-white">
                {(Number(item.product.price) * item.quantity).toFixed(2)} €
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-white/30 hover:text-red-400 transition-colors"
                aria-label="Supprimer"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-white">Total : {total.toFixed(2)} €</div>
        <Link
          href="/checkout"
          className="btn-gradient rounded-xl px-6 py-3 font-medium flex items-center gap-2"
        >
          Passer la commande
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
