'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthProvider';
import { EditableText } from './EditableText';
import { Page, SiteSettings, updateSettings } from '@/lib/api';

export function Footer({ settings, pages }: { settings: SiteSettings; pages: Page[] }) {
  const { isStaff } = useAuth();

  return (
    <footer className="border-t border-white/[0.06] mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/ghost-icon.png" alt="GhostMarket" width={26} height={26} />
            <span className="font-semibold text-white">
              Ghost<span className="text-gradient">Market</span>
            </span>
          </div>

          <EditableText
            value={settings.footer_description}
            onSave={(v) => updateSettings({ footer_description: v }).then(() => {})}
            as="p"
            multiline
            className="text-sm text-white/40 mt-2 max-w-xs"
          />

          <div className="text-sm text-white/30 mt-3 space-y-0.5">
            <EditableText
              value={settings.phone}
              onSave={(v) => updateSettings({ phone: v }).then(() => {})}
              as="div"
              placeholder="Cliquez pour ajouter un téléphone"
            />
            <EditableText
              value={settings.email}
              onSave={(v) => updateSettings({ email: v }).then(() => {})}
              as="div"
              placeholder="Cliquez pour ajouter un e-mail"
            />
          </div>
        </div>

        <div className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-white/40 uppercase text-xs tracking-wider mb-1">Boutique</span>
            <Link href="/catalog" className="text-white/70 hover:text-white transition-colors">
              Catalogue
            </Link>
            <Link href="/favorites" className="text-white/70 hover:text-white transition-colors">
              Favoris
            </Link>
            <Link href="/cart" className="text-white/70 hover:text-white transition-colors">
              Panier
            </Link>
            {pages.map((p) => (
              <Link
                key={p.id}
                href={`/pages/${p.slug}`}
                className="text-white/70 hover:text-white transition-colors"
              >
                {p.title}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white/40 uppercase text-xs tracking-wider mb-1">Compte</span>
            <Link href="/account" className="text-white/70 hover:text-white transition-colors">
              Mon compte
            </Link>
            <Link href="/login" className="text-white/70 hover:text-white transition-colors">
              Connexion
            </Link>
            {isStaff && (
              <Link href="/admin" className="text-white/70 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-white/25 pb-6 flex items-center justify-center gap-1">
        © {new Date().getFullYear()}{' '}
        <EditableText
          value={settings.shop_name}
          onSave={(v) => updateSettings({ shop_name: v }).then(() => {})}
          as="span"
        />
      </div>
    </footer>
  );
}
