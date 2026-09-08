'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductForm } from '@/components/admin/ProductForm';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import {
  AdminProduct,
  CreateProductInput,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from '@/lib/api';
import { TrashIcon } from '@/components/icons';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    getAdminProducts({ limit: '200' })
      .then((res) => setProduct(res.items.find((p) => p.id === id) ?? null))
      .catch(() => setProduct(null));
  }, [id]);

  async function handleSubmit(dto: CreateProductInput) {
    await updateProduct(id, dto);
    router.push('/admin/products');
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement ce produit ?')) return;
    setDeleting(true);
    setForbidden(false);
    try {
      await deleteProduct(id);
      router.push('/admin/products');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      setDeleting(false);
    }
  }

  return (
    <main>
      <Link href="/admin/products" className="text-sm text-white/40 hover:text-white transition-colors">
        ← Tous les produits
      </Link>

      <div className="flex items-center justify-between mt-2 mb-6">
        <h1 className="text-2xl font-semibold text-white">Modifier le produit</h1>
        {product && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <TrashIcon className="w-4 h-4" />
            Supprimer le produit
          </button>
        )}
      </div>

      {forbidden && (
        <div className="mb-6 max-w-xl">
          <AdminForbiddenNotice />
        </div>
      )}

      {product === undefined ? (
        <p className="text-white/40">Chargement...</p>
      ) : product === null ? (
        <p className="text-white/40">Produit introuvable.</p>
      ) : (
        <ProductForm initial={product} submitLabel="Enregistrer les modifications" onSubmit={handleSubmit} />
      )}

      {product && (
        <Link
          href={`/admin/products/${id}/images`}
          className="inline-block mt-4 text-sm text-gradient font-medium"
        >
          Gérer les photos du produit →
        </Link>
      )}
    </main>
  );
}
