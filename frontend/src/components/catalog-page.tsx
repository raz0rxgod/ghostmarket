import Link from 'next/link';
import { Suspense } from 'react';
import { SortSelect } from '@/components/SortSelect';
import { AttributeFilters } from '@/components/AttributeFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import { getProducts, getCategoryTree, getAttributes } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ScrollReveal } from '@/components/ScrollReveal';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; sort?: string; page?: string; attrs?: string }>;
}) {
  const params = await searchParams;

  let products: Awaited<ReturnType<typeof getProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof getCategoryTree>> = [];
  let attributes: Awaited<ReturnType<typeof getAttributes>> = [];

  try {
    [products, categories, attributes] = await Promise.all([
      getProducts({
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        ...(params.sort ? { sort: params.sort } : {}),
        ...(params.attrs ? { attributeValueIds: params.attrs } : {}),
        page: params.page ?? '1',
        limit: '20',
      }),
      getCategoryTree(),
      getAttributes(),
    ]);
  } catch {
    products = null;
  }

  // Общее содержимое фильтров — рендерится и в sticky-сайдбаре на десктопе,
  // и внутри выезжающей панели на мобильном (см. MobileFilterDrawer).
  const filterContent = (
    <>
      <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
        Catégories
      </h2>
      <ul className="space-y-1 text-sm">
        <li>
          <Link
            href="/catalog"
            className={`block px-3 py-2.5 rounded-lg transition-colors ${
              !params.categoryId
                ? 'bg-white/[0.06] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Tous les produits
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/catalog?categoryId=${c.id}`}
              className={`block px-3 py-2.5 rounded-lg transition-colors ${
                params.categoryId === c.id
                  ? 'bg-white/[0.06] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      <Suspense fallback={null}>
        <AttributeFilters attributes={attributes} />
      </Suspense>
    </>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
      {/* Фильтры: sticky-сайдбар на md+, кнопка + bottom sheet на мобильном */}
      <aside className="md:col-span-1">
        <MobileFilterDrawer>{filterContent}</MobileFilterDrawer>
      </aside>

      {/* Список товаров */}
      <section className="md:col-span-3">
        <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-white">Catalogue</h1>
          <div className="flex items-center gap-2">
            <Suspense fallback={<div className="w-40 h-9" />}>
              <SortSelect />
            </Suspense>
          </div>
        </div>

        {/* Кнопка фильтров под заголовком на мобильном — MobileFilterDrawer
            уже рендерит саму кнопку "Filtres" внутри aside выше, но на узких
            экранах aside и section идут друг под другом в одну колонку, так
            что кнопка естественным образом оказывается прямо над товарами */}

        {products && products.items.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {products.items.map((p, i) => (
              <ScrollReveal key={p.id} delay={(i % 6) * 60} scale>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-10 text-center text-white/40">
            Aucun produit trouvé. Essayez de réinitialiser certains filtres ou remplissez le catalogue via l&apos;
            <Link href="/admin" className="text-gradient font-medium">
              administration
            </Link>
            .
          </div>
        )}
      </section>
    </main>
  );
}
