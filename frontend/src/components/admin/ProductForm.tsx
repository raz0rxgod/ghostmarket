'use client';

import { useEffect, useState } from 'react';
import {
  AdminProduct,
  Attribute,
  Brand,
  CategoryFlat,
  CreateProductInput,
  getAttributes,
  getBrands,
  getCategoriesFlat,
} from '@/lib/api';
import { AdminForbiddenNotice } from './AdminGuard';

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: AdminProduct | null;
  submitLabel: string;
  onSubmit: (dto: CreateProductInput) => Promise<void>;
}) {
  const [categories, setCategories] = useState<CategoryFlat[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice ?? '');
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [brandId, setBrandId] = useState(initial?.brandId ?? '');
  const [selectedValueIds, setSelectedValueIds] = useState<Set<string>>(
    () => new Set(initial?.attributeValues?.map((av) => av.attributeValue.id) ?? []),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    Promise.all([getCategoriesFlat(), getBrands(), getAttributes()])
      .then(([cats, brs, attrs]) => {
        setCategories(cats);
        setBrands(brs);
        setAttributes(attrs);
        if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
      })
      .catch(() => setError('Impossible de charger les catégories et les marques'))
      .finally(() => setLoadingLists(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleValue(valueId: string) {
    setSelectedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(valueId)) next.delete(valueId);
      else next.add(valueId);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setForbidden(false);

    if (!categoryId) {
      setError('Créez d&apos;abord au moins une catégorie');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        sku,
        description: description || undefined,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        stock: Number(stock) || 0,
        categoryId,
        brandId: brandId || undefined,
        attributeValueIds: Array.from(selectedValueIds),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de l&apos;enregistrement du produit. Vérifiez les champs (la réf. SKU doit être unique).');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingLists) {
    return <p className="text-white/40">Chargement du formulaire...</p>;
  }

  if (categories.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-white/60 text-sm">
        Vous devez d&apos;abord créer au moins une catégorie —{' '}
        <a href="/admin/categories" className="text-gradient font-medium">
          aller aux catégories
        </a>
        .
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4 max-w-xl">
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Nom</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-dark"
          placeholder="Écouteurs GhostBuds Pro"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Référence (SKU)</label>
          <input
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="input-dark"
            placeholder="GB-001"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Stock disponible</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="input-dark"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Prix, €</label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-dark"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Ancien prix, € <span className="text-white/30">(pour affichage promo)</span>
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="input-dark"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Catégorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-dark cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-bg-surface">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Marque <span className="text-white/30">(facultatif)</span>
          </label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="input-dark cursor-pointer"
          >
            <option value="" className="bg-bg-surface">
              — sans marque —
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-bg-surface">
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {attributes.length > 0 && (
        <div>
          <label className="block text-sm text-white/60 mb-2">
            Caractéristiques <span className="text-white/30">(facultatif)</span>
          </label>
          <div className="space-y-3">
            {attributes.map((attr) => (
              <div key={attr.id}>
                <div className="text-xs text-white/40 mb-1.5">{attr.name}</div>
                <div className="flex flex-wrap gap-2">
                  {attr.values.length === 0 ? (
                    <span className="text-xs text-white/25">
                      Aucune valeur — ajoutez-en dans la section « Attributs »
                    </span>
                  ) : (
                    attr.values.map((v) => {
                      const active = selectedValueIds.has(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleValue(v.id)}
                          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                            active
                              ? 'bg-ghost-gradient text-white border-transparent'
                              : 'border-white/10 text-white/60 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {v.value}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-white/60 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-dark"
          rows={4}
        />
      </div>

      {forbidden && <AdminForbiddenNotice />}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-gradient rounded-xl px-6 py-3 font-medium disabled:opacity-50"
      >
        {submitting ? 'Enregistrement...' : submitLabel}
      </button>
    </form>
  );
}
