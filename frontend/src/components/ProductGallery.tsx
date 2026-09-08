'use client';

import { useState } from 'react';
import { imageUrl } from '@/lib/api';

export function ProductGallery({
  images,
  title,
}: {
  images: { url: string; isMain: boolean }[];
  title: string;
}) {
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain));
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  return (
    <div className="animate-fade-up">
      <div className="relative glass-card rounded-2xl aspect-square overflow-hidden group">
        {active ? (
          // key меняет DOM-узел при смене фото => срабатывает CSS-анимация проявления
          <img
            key={active.url}
            src={imageUrl(active.url)}
            alt={title}
            className="w-full h-full object-contain p-6 animate-fade-up transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
            Pas de photo
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3">
          {sorted.slice(0, 8).map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden glass-card shrink-0 transition-all ${
                i === activeIndex
                  ? 'ring-2 ring-ghost-violet/70 opacity-100'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={imageUrl(img.url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
