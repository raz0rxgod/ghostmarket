import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/api';
import { AddToCartButton } from '@/components/AddToCartButton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ProductGallery } from '@/components/ProductGallery';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const images = product.images ?? [];
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-sm text-white/40 mb-6 flex items-center gap-2">
        <Link href="/catalog" className="hover:text-white transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-white/60">{product.category?.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery images={images} title={product.title} />

        {/* Инфо — проявляется чуть позже галереи для лёгкого каскада */}
        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-semibold text-white">{product.title}</h1>
            <FavoriteButton productId={product.id} />
          </div>
          {product.brand && (
            <div className="text-sm text-white/40 mb-4">{product.brand.name}</div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-white">{product.price} €</span>
            {hasDiscount && (
              <span className="text-white/35 line-through">{product.oldPrice} €</span>
            )}
          </div>

          <AddToCartButton productId={product.id} />

          {product.description && (
            <div className="mt-8 pt-8 border-t border-white/[0.08]">
              <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
              <p className="text-white/60 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
