import Link from 'next/link';

const CARDS = [
  {
    href: '/admin/products',
    title: 'Produits',
    desc: 'Fiches produits : création, modification, photos, prix, stocks.',
  },
  {
    href: '/admin/categories',
    title: 'Catégories',
    desc: 'Arborescence des catégories du catalogue.',
  },
  {
    href: '/admin/brands',
    title: 'Marques',
    desc: 'Liste des marques pour les fiches produits.',
  },
  {
    href: '/admin/attributes',
    title: 'Attributs',
    desc: 'Caractéristiques des produits (couleur, mémoire, etc.) — source des filtres du catalogue.',
  },
  {
    href: '/admin/pages',
    title: 'Pages',
    desc: 'Pages statiques du site — « À propos », « Livraison » et autres.',
  },
  {
    href: '/admin/settings',
    title: 'Textes du site',
    desc: 'Titre et sous-titre sur la page d\u2019accueil, texte du pied de page, contacts.',
  },
];

export default function AdminDashboardPage() {
  return (
    <main>
      <h1 className="text-2xl font-semibold text-white mb-2">Administration GhostMarket</h1>
      <p className="text-white/40 mb-8 text-sm max-w-xl">
        Prototype de test : produits, catégories, marques, attributs, textes du site et pages
        statiques. Commandes, bannières et avis — en développement.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="glass-card rounded-2xl p-5 hover:border-white/20 hover:-translate-y-0.5 transition-all"
          >
            <div className="text-white font-medium mb-1.5">{c.title}</div>
            <div className="text-sm text-white/40">{c.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
