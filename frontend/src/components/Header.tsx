import Link from 'next/link';
import Image from 'next/image';
import { AuthNav } from './AuthNav';
import { CartBadge } from './CartBadge';
import { CartIcon, HeartIcon } from './icons';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            src="/ghost-icon.png"
            alt="GhostMarket"
            width={30}
            height={30}
            className="transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.35)] md:w-[34px] md:h-[34px]"
            priority
          />
          <span className="text-base md:text-lg font-semibold tracking-tight text-white">
            Ghost<span className="text-gradient">Market</span>
          </span>
        </Link>

        {/* Полная навигация — только на десктопе, на мобильном её роль
            выполняет нижняя панель MobileNav (см. layout.tsx) */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link href="/catalog" className="hover:text-white transition-colors">
            Catalogue
          </Link>
          <Link href="/favorites" className="hover:text-white transition-colors flex items-center gap-1.5">
            <HeartIcon className="w-4 h-4" />
            Favoris
          </Link>
          <Link href="/cart" className="hover:text-white transition-colors flex items-center gap-1.5">
            <CartIcon className="w-4 h-4" />
            Panier
            <CartBadge />
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Корзина в шапке видна и на мобильном — быстрый доступ без
              необходимости листать вниз до панели вкладок */}
          <Link
            href="/cart"
            className="md:hidden relative flex items-center justify-center w-9 h-9 -mr-1 text-white/70 active:text-white transition-colors"
            aria-label="Panier"
          >
            <CartIcon className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5">
              <CartBadge compact />
            </span>
          </Link>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
