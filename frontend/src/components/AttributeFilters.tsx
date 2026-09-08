'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Attribute } from '@/lib/api';

// Чекбоксы по значениям атрибутов в сайдбаре каталога. Выбранные id
// значений живут в query-параметре ?attrs=id1,id2 — сохраняются при смене
// категории/сортировки, ими можно поделиться ссылкой.
// Важно: как и на backend, это AND между ЛЮБЫМИ выбранными значениями
// (в т.ч. внутри одного атрибута) — см. комментарий в query-products.dto.ts.
export function AttributeFilters({ attributes }: { attributes: Attribute[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selected = new Set(searchParams.get('attrs')?.split(',').filter(Boolean) ?? []);

  function toggle(valueId: string) {
    const next = new Set(selected);
    if (next.has(valueId)) next.delete(valueId);
    else next.add(valueId);

    const qs = new URLSearchParams(searchParams.toString());
    if (next.size > 0) qs.set('attrs', Array.from(next).join(','));
    else qs.delete('attrs');
    router.push(`/catalog${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  const withValues = attributes.filter((a) => a.values.length > 0);
  if (withValues.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-5">
      {withValues.map((attr) => (
        <div key={attr.id}>
          <div className="text-xs uppercase tracking-wide text-white/40 mb-2">{attr.name}</div>
          <div className="space-y-1.5">
            {attr.values.map((v) => (
              <label
                key={v.id}
                className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white cursor-pointer transition-colors py-1.5 -mx-1 px-1 rounded-lg active:bg-white/[0.04]"
              >
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggle(v.id)}
                  className="w-5 h-5 shrink-0 rounded border-white/20 bg-white/5 accent-ghost-violet cursor-pointer"
                />
                {v.value}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
