'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Page, createPage, deletePage, getPages, updatePage } from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { TrashIcon } from '@/components/icons';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPages(await getPages());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startCreate() {
    setEditingId('new');
    setTitle('');
    setContent('');
  }

  function startEdit(page: Page) {
    setEditingId(page.id);
    setTitle(page.title);
    setContent(page.content);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setForbidden(false);
    setSubmitting(true);
    try {
      if (editingId === 'new') {
        await createPage({ title, content });
      } else if (editingId) {
        await updatePage(editingId, { title, content });
      }
      setEditingId(null);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de l&apos;enregistrement de la page');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette page ?')) return;
    setForbidden(false);
    try {
      await deletePage(id);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la suppression de la page');
    }
  }

  const isEditing = editingId !== null;

  return (
    <main>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-white">Pages</h1>
        {!isEditing && (
          <button
            onClick={startCreate}
            className="btn-gradient rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            + Nouvelle page
          </button>
        )}
      </div>
      <p className="text-white/40 text-sm mb-6 max-w-xl">
        Pages statiques du site — « À propos », « Livraison et paiement », etc. Accessibles à
        l&apos;adresse <code className="text-white/60">/pages/&lt;slug&gt;</code>.
      </p>

      {forbidden && (
        <div className="mb-6">
          <AdminForbiddenNotice />
        </div>
      )}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="text-white font-medium">
            {editingId === 'new' ? 'Nouvelle page' : 'Modifier la page'}
          </h2>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Titre</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-dark"
              placeholder="À propos"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Contenu de la page</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-dark"
              rows={10}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient rounded-xl px-6 py-3 font-medium disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="btn-ghost-outline rounded-xl px-6 py-3 font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : loading ? (
        <p className="text-white/40">Chargement...</p>
      ) : pages.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Aucune page pour l&apos;instant — créez la première ci-dessus.
        </div>
      ) : (
        <div className="glass-card rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
          {pages.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3.5">
              <div className="flex-1 min-w-0">
                <div className="text-white truncate">{p.title}</div>
                <Link
                  href={`/pages/${p.slug}`}
                  target="_blank"
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  /pages/{p.slug} ↗
                </Link>
              </div>
              <button
                onClick={() => startEdit(p)}
                className="text-sm bg-white/[0.08] hover:bg-white/[0.14] text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(p.id)}
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
