'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { UserIcon } from './icons';

export function AuthNav() {
  const { email, isAuthenticated, isStaff, loading, logout } = useAuth();

  if (loading) return <div className="w-16 h-8" />;

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="hidden md:inline-flex text-sm btn-gradient px-4 py-2 rounded-lg whitespace-nowrap"
      >
        Se connecter
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3 text-sm">
      {isStaff && (
        // Раньше было "hidden sm:inline-block" — на мобильном админы вообще
        // не могли попасть в /admin из шапки (только вручную набрав URL).
        // Теперь видно всегда, компактным бейджем.
        <Link
          href="/admin"
          className="text-white/50 hover:text-white active:text-white transition-colors border border-white/10 rounded-lg px-2 py-1 md:px-2.5 text-xs whitespace-nowrap"
        >
          Admin
        </Link>
      )}
      <Link
        href="/account"
        className="hidden md:flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
      >
        <UserIcon className="w-4 h-4" />
        <span className="max-w-[140px] truncate">{email}</span>
      </Link>
      {/* На мобильном профиль/выход доступны через нижнюю панель вкладок
          (MobileNav) и страницу /account — там кнопка выхода крупнее и
          удобнее для тапа, чем мелкий текст в шапке */}
      <button
        onClick={() => logout()}
        className="hidden md:inline text-white/50 hover:text-white transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  );
}
