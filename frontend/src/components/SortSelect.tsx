'use client';

import { useRouter, useSearchParams } from 'next/navigation';

// Меняет только ?sort=..., сохраняя все остальные текущие query-параметры
// (categoryId, attributeValueIds и т.д.) — раньше принимал categoryId
// отдельным пропом и терял прочие фильтры при смене сортировки.
export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const qs = new URLSearchParams(searchParams.toString());
    if (e.target.value) qs.set('sort', e.target.value);
    else qs.delete('sort');
    router.push(`/catalog${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  return (
    <select
      defaultValue={searchParams.get('sort') ?? ''}
      onChange={handleChange}
      className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 md:py-2 text-sm text-white outline-none cursor-pointer max-w-[150px] md:max-w-none"
    >
      <option value="" className="bg-bg-surface">
        Nouveautés
      </option>
      <option value="price_asc" className="bg-bg-surface">
        Prix croissant
      </option>
      <option value="price_desc" className="bg-bg-surface">
        Prix décroissant
      </option>
    </select>
  );
}
