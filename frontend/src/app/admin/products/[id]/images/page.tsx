'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ProductImage,
  attachProductImage,
  deleteProductImage,
  getProductImages,
  imageUrl,
  setMainProductImage,
  uploadImage,
} from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { TrashIcon } from '@/components/icons';

export default function ProductImagesAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);

  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setImages(await getProductImages(productId));
      setError(null);
    } catch {
      setError('Impossible de charger les photos');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    setForbidden(false);
    try {
      const { url } = await uploadImage(file);
      await attachProductImage({ productId, url });
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de l&apos;envoi du fichier. Vérifiez que le backend et le dossier uploads sont accessibles.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSetMain(id: string) {
    await setMainProductImage(id);
    await load();
  }

  async function handleDelete(id: string) {
    await deleteProductImage(id);
    await load();
  }

  return (
    <main>
      <Link
        href="/admin/products"
        className="text-sm text-white/40 hover:text-white transition-colors"
      >
        ← Tous les produits
      </Link>
      <h1 className="text-2xl font-semibold text-white mt-2 mb-6">Photos du produit</h1>

      {forbidden && (
        <div className="mb-6 max-w-xl">
          <AdminForbiddenNotice />
        </div>
      )}

      <div className="mb-6">
        <label className="inline-block btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium cursor-pointer">
          {uploading ? 'Chargement...' : '+ Ajouter une photo'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {loading ? (
        <p className="text-white/40">Chargement...</p>
      ) : images.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Ce produit n&apos;a pas encore de photo.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="glass-card rounded-xl p-2">
              <div className="aspect-square rounded-lg overflow-hidden bg-white/[0.03]">
                <img
                  src={imageUrl(img.url)}
                  alt=""
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex items-center justify-between mt-2 px-1 text-xs">
                {img.isMain ? (
                  <span className="text-green-400 font-medium">Principale</span>
                ) : (
                  <button
                    onClick={() => handleSetMain(img.id)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    Définir comme principale
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="text-white/30 hover:text-red-400 transition-colors"
                  aria-label="Supprimer"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
