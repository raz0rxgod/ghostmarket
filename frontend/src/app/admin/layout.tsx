'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';

const NAV = [
  { href: '/admin', label: 'Tableau de bord', exact: true },
  { href: '/admin/products', label: 'Produits' },
  { href: '/admin/categories', label: 'Catégories' },
  { href: '/admin/brands', label: 'Marques' },
  { href: '/admin/attributes', label: 'Attributs' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/settings', label: 'Textes du site' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-[180px_1fr] gap-8">
        <aside className="md:sticky md:top-24 h-fit">
          <div className="text-xs uppercase tracking-wider text-white/30 mb-3 px-1">
            Administration
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white/[0.07] text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </AdminGuard>
  );
}
