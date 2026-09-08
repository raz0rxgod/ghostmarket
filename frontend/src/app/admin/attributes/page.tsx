'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Attribute,
  addAttributeValue,
  createAttribute,
  deleteAttribute,
  deleteAttributeValue,
  getAttributes,
} from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { TrashIcon } from '@/components/icons';

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  // Черновики новых значений для каждого атрибута (id атрибута -> текст поля)
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});
  const [addingValueFor, setAddingValueFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAttributes(await getAttributes());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreateAttribute(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setForbidden(false);
    setSubmitting(true);
    try {
      await createAttribute(name);
      setName('');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la création de l&apos;attribut (ce nom existe peut-être déjà)');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAttribute(id: string) {
    if (!confirm('Supprimer cet attribut ainsi que toutes ses valeurs ?')) return;
    setForbidden(false);
    try {
      await deleteAttribute(id);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la suppression de l&apos;attribut');
    }
  }

  async function handleAddValue(attributeId: string) {
    const value = (valueDrafts[attributeId] ?? '').trim();
    if (!value) return;
    setForbidden(false);
    setAddingValueFor(attributeId);
    try {
      await addAttributeValue(attributeId, value);
      setValueDrafts((prev) => ({ ...prev, [attributeId]: '' }));
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de l&apos;ajout de la valeur (elle existe peut-être déjà)');
    } finally {
      setAddingValueFor(null);
    }
  }

  async function handleDeleteValue(valueId: string) {
    setForbidden(false);
    try {
      await deleteAttributeValue(valueId);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de la suppression de la valeur');
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold text-white mb-2">Attributs</h1>
      <p className="text-white/40 text-sm mb-6 max-w-xl">
        Caractéristiques des produits (par exemple « Couleur » avec les valeurs « Rouge »,
        « Bleu ») — elles deviennent aussi des filtres dans le catalogue.
      </p>

      <form
        onSubmit={handleCreateAttribute}
        className="glass-card rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm text-white/60 mb-1.5">Nom de l&apos;attribut</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder="Couleur"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? 'Création...' : 'Ajouter un attribut'}
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
      ) : attributes.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-white/40">
          Aucun attribut pour l&apos;instant — créez le premier ci-dessus.
        </div>
      ) : (
        <div className="space-y-4">
          {attributes.map((attr) => (
            <div key={attr.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-medium">{attr.name}</h2>
                <button
                  onClick={() => handleDeleteAttribute(attr.id)}
                  className="text-white/30 hover:text-red-400 transition-colors"
                  aria-label="Supprimer l'attribut"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {attr.values.length === 0 ? (
                  <span className="text-sm text-white/30">Aucune valeur pour l&apos;instant</span>
                ) : (
                  attr.values.map((v) => (
                    <span
                      key={v.id}
                      className="flex items-center gap-1.5 bg-white/[0.06] rounded-full pl-3 pr-1.5 py-1 text-sm text-white/80"
                    >
                      {v.value}
                      <button
                        onClick={() => handleDeleteValue(v.id)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                        aria-label="Supprimer la valeur"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddValue(attr.id);
                }}
                className="flex gap-2"
              >
                <input
                  value={valueDrafts[attr.id] ?? ''}
                  onChange={(e) =>
                    setValueDrafts((prev) => ({ ...prev, [attr.id]: e.target.value }))
                  }
                  className="input-dark flex-1 max-w-xs"
                  placeholder="Nouvelle valeur, ex. Rouge"
                />
                <button
                  type="submit"
                  disabled={addingValueFor === attr.id}
                  className="btn-ghost-outline rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                >
                  + Valeur
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
