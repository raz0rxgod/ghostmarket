'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminProduct, deleteProduct, getAdminProducts, imageUrl } from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { TrashIcon, ImageIcon } from '@/components/icons';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({ limit: '100' });
      setProducts(res.items);
      setError(null);
    } catch {
      setError('Impossible de charger la liste des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer définitivement ce produit ?')) return;
    setDeletingId(id);
    setForbidden(false);
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la suppression du produit');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Produits</h1>
        <Link href="/admin/products/new" className="btn-gradient rounded-xl px-4 py-2.5 text-sm font-medium">
          + Ajouter un produit
        </Link>
      </div>

      {forbidden && (
        <div className="mb-6">
          <AdminForbiddenNotice />
        </div>
      )}

      {loading ? (
        <p className="text-white/40">Chargement...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : !products || products.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Aucun produit pour l&apos;instant.{' '}
          <Link href="/admin/products/new" className="text-gradient font-medium">
            Ajouter le premier produit
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
          {products.map((p) => {
            const main = p.images?.find((img) => img.isMain) ?? p.images?.[0];
            return (
              <div key={p.id} className="flex items-center gap-4 p-3">
                <div className="w-14 h-14 rounded-lg bg-white/[0.03] overflow-hidden shrink-0">
                  {main ? (
                    <img
                      src={imageUrl(main.url)}
                      alt={p.title}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{p.title}</div>
                  <div className="text-sm text-white/40">
                    {p.price} € · réf. {p.sku} · stock {p.stock}
                    {!p.isActive && <span className="text-amber-400"> · masqué</span>}
                  </div>
                </div>
                <Link
                  href={`/admin/products/${p.id}/images`}
                  className="text-sm btn-ghost-outline px-3 py-1.5 rounded-lg"
                >
                  Photos
                </Link>
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="text-sm bg-white/[0.08] hover:bg-white/[0.14] text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                  aria-label="Supprimer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
