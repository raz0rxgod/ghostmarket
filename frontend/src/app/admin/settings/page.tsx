'use client';

import { useEffect, useState } from 'react';
import { SiteSettings, getSettings, updateSettings } from '@/lib/api';
import { AdminForbiddenNotice } from '@/components/admin/AdminGuard';
import { CheckIcon } from '@/components/icons';

const FIELDS: { key: keyof SiteSettings; label: string; textarea?: boolean }[] = [
  { key: 'shop_name', label: 'Nom de la boutique' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Adresse' },
  { key: 'hero_title', label: 'Titre de la page d\u2019accueil' },
  { key: 'hero_subtitle', label: 'Sous-titre de la page d\u2019accueil', textarea: true },
  { key: 'footer_description', label: 'Texte du pied de page', textarea: true },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setValues)
      .catch(() => setError('Impossible de charger les paramètres'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    setError(null);
    setForbidden(false);
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await updateSettings(values);
      setValues(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('403')) setForbidden(true);
      else setError('Échec de l&apos;enregistrement des paramètres');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold text-white mb-2">Textes du site</h1>
      <p className="text-white/40 text-sm mb-6 max-w-xl">
        Le titre et le sous-titre de l&apos;accueil, le texte du pied de page, les contacts — ces textes
        seront immédiatement mis à jour sur le site après l&apos;enregistrement.
      </p>

      {loading ? (
        <p className="text-white/40">Chargement...</p>
      ) : !values ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4 max-w-xl">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm text-white/60 mb-1.5">{f.label}</label>
              {f.textarea ? (
                <textarea
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="input-dark"
                  rows={3}
                />
              ) : (
                <input
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="input-dark"
                />
              )}
            </div>
          ))}

          {forbidden && <AdminForbiddenNotice />}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-gradient rounded-xl px-6 py-3 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Enregistré
              </>
            ) : submitting ? (
              'Enregistrement...'
            ) : (
              'Enregistrer'
            )}
          </button>
        </form>
      )}
    </main>
  );
}
