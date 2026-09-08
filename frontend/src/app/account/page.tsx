'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CheckIcon, UserIcon } from '@/components/icons';

function OrderSuccessBanner() {
  const searchParams = useSearchParams();
  const orderSuccess = searchParams.get('orderSuccess') === '1';
  const orderNumber = searchParams.get('orderNumber');

  if (!orderSuccess) return null;

  return (
    <div className="mb-6 glass-card border-green-400/20 rounded-2xl px-5 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
        <CheckIcon className="w-4 h-4" />
      </div>
      <div className="text-sm text-white/80">
        Commande passée{orderNumber ? ` — numéro ${orderNumber}` : ''}. Nous vous contacterons
        pour confirmer.
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { email, isAuthenticated, loading, role, isStaff } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Mon compte</h1>
        <p className="text-white/50">
          Vous devez vous{' '}
          <Link href="/login" className="text-gradient font-medium">
            connecter
          </Link>{' '}
          ou{' '}
          <Link href="/register" className="text-gradient font-medium">
            créer un compte
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-white/60">
          <UserIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Mon compte</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/40">{email}</p>
            {role && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isStaff ? 'bg-ghost-gradient text-white' : 'bg-white/[0.06] text-white/50'
                }`}
              >
                {role}
              </span>
            )}
          </div>
        </div>
      </div>

      {isStaff && (
        <Link
          href="/admin"
          className="inline-block mb-6 text-sm text-gradient font-medium"
        >
          Aller à l&apos;administration →
        </Link>
      )}

      <Suspense fallback={null}>
        <OrderSuccessBanner />
      </Suspense>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/cart"
          className="glass-card rounded-2xl p-5 hover:border-white/20 transition-colors"
        >
          <div className="text-white font-medium mb-1">Panier</div>
          <div className="text-sm text-white/40">Produits actuellement dans le panier</div>
        </Link>
        <Link
          href="/favorites"
          className="glass-card rounded-2xl p-5 hover:border-white/20 transition-colors"
        >
          <div className="text-white font-medium mb-1">Favoris</div>
          <div className="text-sm text-white/40">Produits enregistrés</div>
        </Link>
      </div>

      <p className="text-white/30 text-sm mt-8">
        Historique des commandes, adresses et préférences du profil — à venir.
      </p>
    </main>
  );
}
