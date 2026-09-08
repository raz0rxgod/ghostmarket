'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { createOrder } from '@/lib/cart';
import { imageUrl } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, email, loading: authLoading } = useAuth();
  const { items, total, loading: cartLoading, refresh } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState('courier');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (email) setOrderEmail(email);
  }, [email]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Passer la commande</h1>
        <p className="text-white/50">
          Pour passer commande, connectez-vous{' '}
          <Link href="/login" className="text-gradient font-medium">
            ici
          </Link>
          .
        </p>
      </main>
    );
  }

  if (!cartLoading && items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Passer la commande</h1>
        <p className="text-white/50">
          Panier vide.{' '}
          <Link href="/catalog" className="text-gradient font-medium">
            Aller au catalogue
          </Link>
          .
        </p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        fullName,
        phone,
        email: orderEmail || undefined,
        comment: comment || undefined,
        deliveryType,
      });
      await refresh();
      router.push(`/account?orderSuccess=1&orderNumber=${encodeURIComponent(order.number)}`);
    } catch {
      setError('Échec de la commande. Vérifiez vos informations et réessayez.');
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-[1fr_320px] gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-6">Passer la commande</h1>

        <form onSubmit={handleSubmit} className="space-y-4 glass-card rounded-2xl p-6">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Nom et prénom</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-dark"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Téléphone</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-dark"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Email</label>
            <input
              type="email"
              value={orderEmail}
              onChange={(e) => setOrderEmail(e.target.value)}
              className="input-dark"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Mode de livraison</label>
            <select
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
              className="input-dark cursor-pointer"
            >
              <option value="courier" className="bg-bg-surface">
                Livraison à domicile
              </option>
              <option value="pickup" className="bg-bg-surface">
                Retrait en magasin
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Commentaire sur la commande</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-dark"
              rows={3}
              placeholder="Facultatif"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-gradient rounded-xl py-3.5 font-medium disabled:opacity-50"
          >
            {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
          </button>
        </form>
      </div>

      {/* Сводка заказа */}
      <div className="glass-card rounded-2xl p-6 h-fit md:sticky md:top-24">
        <h2 className="font-semibold text-white mb-4">Votre commande</h2>
        <div className="space-y-3 mb-4">
          {items.map((item) => {
            const main = item.product.images?.find((img) => img.isMain) ?? item.product.images?.[0];
            return (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="w-12 h-12 rounded-lg bg-white/[0.03] overflow-hidden shrink-0">
                  {main && (
                    <img
                      src={imageUrl(main.url)}
                      alt=""
                      className="w-full h-full object-contain p-1"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{item.product.title}</div>
                  <div className="text-white/40">× {item.quantity}</div>
                </div>
                <div className="text-white/80 shrink-0">
                  {(Number(item.product.price) * item.quantity).toFixed(2)} €
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
          <span className="text-white/60">Total</span>
          <span className="text-xl font-semibold text-white">{total.toFixed(2)} €</span>
        </div>
      </div>
    </main>
  );
}
