import Link from 'next/link';
import { getProducts, getCategoryTree, getSettings, SiteSettings } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ScrollReveal } from '@/components/ScrollReveal';
import { HeroText } from '@/components/HeroText';
import { ArrowRightIcon } from '@/components/icons';

const FALLBACK_SETTINGS: Pick<SiteSettings, 'hero_title' | 'hero_subtitle'> = {
  hero_title: 'Bienvenue chez GhostMarket',
  hero_subtitle:
    'High-tech et électronique, sans complications. Choisissez, ajoutez au panier et passez commande en quelques clics.',
};

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof getCategoryTree>> = [];
  let settings: SiteSettings | Pick<SiteSettings, 'hero_title' | 'hero_subtitle'> =
    FALLBACK_SETTINGS;

  try {
    [products, categories, settings] = await Promise.all([
      getProducts({ limit: '8' }),
      getCategoryTree(),
      getSettings(),
    ]);
  } catch {
    products = null;
  }

  return (
    <main>
      {/* Hero — уже во вьюпорте при загрузке, поэтому анимация "на монтировании", не по скроллу */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium text-white/60 glass-card rounded-full px-3 py-1.5 mb-6 animate-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-ghost-gradient animate-pulse" />
            Prototype de boutique
          </div>

          <HeroText
            title={settings.hero_title || FALLBACK_SETTINGS.hero_title}
            subtitle={settings.hero_subtitle || FALLBACK_SETTINGS.hero_subtitle}
          />

          <div
            className="flex items-center justify-center gap-3 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href="/catalog"
              className="btn-gradient rounded-xl px-6 py-3 text-sm font-medium flex items-center gap-2"
            >
              Voir le catalogue
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/favorites"
              className="btn-ghost-outline rounded-xl px-6 py-3 text-sm font-medium"
            >
              Favoris
            </Link>
          </div>
        </div>
      </section>

      {/* Категории — проявляются при прокрутке до этого блока */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <ScrollReveal>
            <div className="flex flex-wrap gap-3">
              {categories.map((c, i) => (
                <ScrollReveal key={c.id} delay={i * 40} direction="up" className="inline-block">
                  <Link
                    href={`/catalog?categoryId=${c.id}`}
                    className="glass-card rounded-full px-4 py-2 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors inline-block"
                  >
                    {c.name}
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Популярные товары — карточки проявляются каскадом при прокрутке */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Produits populaires</h2>
            <Link
              href="/catalog"
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              Tout le catalogue
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </ScrollReveal>

        {products && products.items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.items.map((p, i) => (
              <ScrollReveal key={p.id} delay={(i % 4) * 80} scale>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-10 text-center text-white/40">
              Les produits apparaîtront ici une fois le catalogue rempli via l&apos;
              <Link href="/admin" className="text-gradient font-medium">
                administration
              </Link>
              .
            </div>
          </ScrollReveal>
        )}
      </section>
    </main>
  );
}
