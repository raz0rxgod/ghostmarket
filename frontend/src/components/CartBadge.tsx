'use client';

import { useCart } from './CartProvider';

// compact — уменьшенный вариант для наложения поверх иконки корзины в
// мобильной шапке (см. Header.tsx), обычный — рядом с текстом "Panier"
// в десктопной навигации.
export function CartBadge({ compact }: { compact?: boolean } = {}) {
  const { count } = useCart();
  if (count === 0) return null;

  if (compact) {
    return (
      <span className="bg-ghost-gradient text-white text-[9px] font-semibold rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center shadow-glow-sm">
        {count > 9 ? '9+' : count}
      </span>
    );
  }

  return (
    <span className="bg-ghost-gradient text-white text-[11px] font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-glow-sm">
      {count}
    </span>
  );
}
