'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useFavorites } from '@/components/FavoritesProvider';
import { ProductCard } from '@/components/ProductCard';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function FavoritesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, loading } = useFavorites();

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Favoris</h1>
        <p className="text-white/50">
          Pour enregistrer des produits en favoris, connectez-vous{' '}
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
        <h1 className="text-2xl font-semibold text-white mb-4">Favoris</h1>
        <p className="text-white/40">Chargement...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-white mb-4">Favoris</h1>
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Vide pour l&apos;instant. Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter ici.{' '}
          <Link href="/catalog" className="text-gradient font-medium">
            Aller au catalogue
          </Link>
          .
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-white mb-6">Favoris</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.map((f, i) => (
          <ScrollReveal key={f.id} delay={(i % 4) * 80} scale>
            <ProductCard product={f.product} />
          </ScrollReveal>
        ))}
      </div>
    </main>
  );
}
