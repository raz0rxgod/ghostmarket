'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';

// Теперь реальная защита по роли: GET /users/me (см. lib/users.ts) отдаёт
// роль пользователя, AuthProvider хранит её в контексте (role/isStaff).
// Раньше здесь проверялся только факт логина — любой CUSTOMER мог зайти
// в /admin и просто получал 403 на действия. Теперь CUSTOMER не увидит
// саму админку вообще.
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, roleLoading, isStaff } = useAuth();

  if (loading || roleLoading) return null;

  if (!isAuthenticated) {
    return (
      <main className="max-w-sm mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-4">
          <Image src="/ghost-icon.png" alt="GhostMarket" width={56} height={56} />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Connexion à l’administration</h1>
        <p className="text-white/50 mb-6 text-sm">
          Connectez-vous avec un compte administrateur ou gestionnaire.
        </p>
        <Link href="/login" className="btn-gradient rounded-xl px-6 py-3 font-medium inline-block">
          Se connecter
        </Link>
      </main>
    );
  }

  if (!isStaff) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-4">
          <Image src="/ghost-icon.png" alt="GhostMarket" width={56} height={56} />
        </div>
        <h1 className="text-xl font-semibold text-white mb-3">Accès insuffisant</h1>
        <div className="glass-card rounded-2xl p-5 text-left">
          <RoleUpgradeInstructions />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

// Общий текст с SQL-инструкцией — переиспользуется и в AdminGuard (гейт
// на весь /admin), и в AdminForbiddenNotice (единичное действие вернуло 403,
// например роль поменялась в БД, а на фронте ещё старое значение до refresh).
export function RoleUpgradeInstructions() {
  return (
    <div className="text-sm text-white/70 space-y-2">
      <p>
        Cette section est réservée aux rôles <code className="text-white/90">ADMIN</code> /{' '}
        <code className="text-white/90">MANAGER</code>. Votre compte est enregistré avec le rôle{' '}
        <code className="text-white/90">CUSTOMER</code> par défaut.
      </p>
      <p>Vous pouvez attribuer ce rôle directement en base de données (pour ce prototype de test) :</p>
      <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto text-xs text-white/60">
{`UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
WHERE email = 'votre@email';`}
      </pre>
      <p className="text-white/40">
        Le rôle est vérifié en base de données à chaque requête (il n’est pas stocké dans le jeton), mais le front le met en cache après connexion — actualisez la page (F5) après avoir changé le rôle.
      </p>
    </div>
  );
}

// Баннер для единичного действия, которое вернуло 403 от backend, несмотря
// на пройденный AdminGuard (например, роль понизили прямо во время сессии).
export function AdminForbiddenNotice() {
  return (
    <div className="border border-amber-400/20 rounded-2xl overflow-hidden">
      <div className="bg-amber-400/10 px-5 py-2.5 text-amber-300 font-medium text-sm">
        Accès insuffisant (403)
      </div>
      <div className="p-5 pt-4">
        <RoleUpgradeInstructions />
      </div>
    </div>
  );
}
