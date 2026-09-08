'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CategoryFlat,
  createCategory,
  deleteCategory,
  getCategoriesFlat,
} from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { TrashIcon } from '@/components/icons';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await getCategoriesFlat());
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
      await createCategory({ name, parentId: parentId || undefined });
      setName('');
      setParentId('');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la création de la catégorie');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette catégorie ? Les produits qu&apos;elle contient ne seront pas supprimés mais n&apos;auront plus de catégorie.'))
      return;
    setForbidden(false);
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la suppression (il reste peut-être des produits dans cette catégorie)');
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold text-white mb-6">Catégories</h1>

      <form onSubmit={handleCreate} className="glass-card rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm text-white/60 mb-1.5">Nom</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder="Écouteurs"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm text-white/60 mb-1.5">
            Catégorie parente <span className="text-white/30">(facultatif)</span>
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="input-dark cursor-pointer"
          >
            <option value="" className="bg-bg-surface">
              — niveau supérieur —
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-bg-surface">
                {c.name}
              </option>
            ))}
          </select>
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
      ) : categories.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Aucune catégorie pour l&apos;instant — créez la première ci-dessus.
        </div>
      ) : (
        <div className="glass-card rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3.5">
              <div className="flex-1">
                <div className="text-white">
                  {c.parentId && <span className="text-white/30 mr-1.5">↳</span>}
                  {c.name}
                </div>
                <div className="text-xs text-white/30">/{c.slug}</div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
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
