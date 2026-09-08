'use client';

import { useCallback, useEffect, useState } from 'react';
import { Brand, createBrand, deleteBrand, getBrands } from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { TrashIcon } from '@/components/icons';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBrands(await getBrands());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setForbidden(false);
    setSubmitting(true);
    try {
      await createBrand({ name });
      setName('');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la création de la marque');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette marque ?')) return;
    setForbidden(false);
    try {
      await deleteBrand(id);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la suppression (des produits y font peut-être encore référence)');
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold text-white mb-6">Marques</h1>

      <form onSubmit={handleCreate} className="glass-card rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm text-white/60 mb-1.5">Nom de la marque</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder="GhostTech"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? 'Création...' : 'Ajouter'}
        </button>
      </form>

      {forbidden && (
        <div className="mb-6">
          <AdminForbiddenNotice />
        </div>
      )}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-white/40">Chargement...</p>
      ) : brands.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Aucune marque pour l&apos;instant.
        </div>
      ) : (
        <div className="glass-card rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3.5">
              <div className="flex-1">
                <div className="text-white">{b.name}</div>
                <div className="text-xs text-white/30">/{b.slug}</div>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="text-white/30 hover:text-red-400 transition-colors"
                aria-label="Supprimer"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
