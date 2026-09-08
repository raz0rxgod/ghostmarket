'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FilterIcon, CloseIcon } from './icons';

// Обёртка вокруг существующего сайдбара фильтров каталога.
//
// Раньше <aside> с категориями и атрибутами рендерился как обычный блок
// в grid-раскладке — на мобильном это означало, что весь список категорий
// и чекбоксов атрибутов всегда занимал экран целиком ДО того, как
// пользователь вообще видел товары. Приходилось долго скроллить вниз
// каждый раз при заходе в каталог.
//
// Теперь на мобильном (< md) фильтры спрятаны за кнопкой "Filtres" и
// открываются выезжающей снизу панелью (bottom sheet). На md+ ничего не
// меняется — тот же самый sticky-сайдбар, что и раньше.
export function MobileFilterDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Закрываем панель при любом изменении фильтров/страницы (переход по
  // ссылке категории, смена страницы пагинации и т.д.) — иначе она бы
  // оставалась открытой поверх уже других товаров.
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  // Блокируем скролл фона, пока открыта панель
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const activeCount =
    (searchParams.get('categoryId') ? 1 : 0) +
    (searchParams.get('attrs')?.split(',').filter(Boolean).length ?? 0);

  return (
    <>
      {/* Кнопка-переключатель — видна только на мобильном, встраивается в
          строку с заголовком "Catalogue" на странице */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white active:bg-white/[0.08] transition-colors"
      >
        <FilterIcon className="w-4 h-4" />
        Filtres
        {activeCount > 0 && (
          <span className="w-[18px] h-[18px] min-w-[18px] px-1 rounded-full bg-ghost-gradient text-[10px] font-semibold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Обычный sticky-сайдбар на md+, полностью скрыт на мобильном —
          вместо него содержимое переиспользуется внутри bottom sheet ниже.
          Стилизация карточки (было в catalog/page.tsx) перенесена сюда,
          чтобы то же children не дублировало обёртку внутри bottom sheet. */}
      <div className="hidden md:block glass-card rounded-2xl p-5 md:sticky md:top-24">{children}</div>

      {/* Bottom sheet для мобильного */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-bg-surface border-t border-white/10 rounded-t-2xl animate-fade-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
              <span className="font-semibold text-white">Filtres</span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 active:bg-white/[0.06]"
                aria-label="Fermer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
            <div className="px-5 py-4 border-t border-white/[0.08] shrink-0">
              <button onClick={() => setOpen(false)} className="w-full btn-gradient rounded-xl py-3 text-sm">
                Voir les résultats
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
