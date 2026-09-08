'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import { useFavorites } from './FavoritesProvider';
import { useAuth } from './AuthProvider';
import { HomeIcon, GridIcon, HeartIcon, CartIcon, UserIcon } from './icons';

// Нижняя панель вкладок — стандартный паттерн мобильных интернет-магазинов
// (Wildberries, Ozon и т.д.). До этого на мобильном вся навигация
// (каталог/избранное/корзина) была просто скрыта классом "hidden md:flex"
// в Header без какой-либо замены — добраться до каталога или корзины с
// телефона можно было только вручную набрав URL. Показывается только на
// экранах уже md (md:hidden), на десктопе — обычный Header.
export function MobileNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { ids } = useFavorites();
  const { isAuthenticated } = useAuth();

  const items = [
    { href: '/', label: 'Accueil', icon: HomeIcon },
    { href: '/catalog', label: 'Catalogue', icon: GridIcon },
    { href: '/favorites', label: 'Favoris', icon: HeartIcon, badge: ids.size },
    { href: '/cart', label: 'Panier', icon: CartIcon, badge: count },
    {
      href: isAuthenticated ? '/account' : '/login',
      label: isAuthenticated ? 'Profil' : 'Connexion',
      icon: UserIcon,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/[0.08] bg-bg/85 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 min-w-0 active:bg-white/[0.04] transition-colors"
            >
              <span className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-white/45'}`}
                  {...(item.icon === HeartIcon ? { filled: active } : {})}
                />
                {!!item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-ghost-gradient text-[10px] font-semibold text-white flex items-center justify-center shadow-glow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] leading-none truncate max-w-full px-1 ${active ? 'text-white' : 'text-white/45'}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-ghost-gradient" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
