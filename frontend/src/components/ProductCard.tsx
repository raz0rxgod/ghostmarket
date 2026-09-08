import Link from 'next/link';
import { imageUrl } from '@/lib/api';
import { FavoriteButton } from './FavoriteButton';

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  price: string;
  oldPrice?: string;
  images?: { url: string; isMain: boolean }[];
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const main = product.images?.find((img) => img.isMain) ?? product.images?.[0];
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative glass-card rounded-2xl p-3 flex flex-col transition-all hover:border-white/20 hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="absolute top-5 right-5 z-10">
        <FavoriteButton productId={product.id} />
      </div>

      <div className="relative rounded-xl overflow-hidden bg-white/[0.03] aspect-square mb-3">
        {main ? (
          <img
            src={imageUrl(main.url)}
            alt={product.title}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
            Pas de photo
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 text-[11px] font-medium px-2 py-1 rounded-full bg-ghost-gradient text-white">
            Promo
          </span>
        )}
      </div>

      <div className="px-1 pb-1">
        <div className="text-sm text-white/90 font-medium line-clamp-2 min-h-[2.5em]">
          {product.title}
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-semibold text-white">{product.price} €</span>
          {hasDiscount && (
            <span className="text-xs text-white/35 line-through">{product.oldPrice} €</span>
          )}
        </div>
      </div>
    </Link>
  );
}
