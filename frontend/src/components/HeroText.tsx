'use client';

import { EditableText } from './EditableText';
import { updateSettings } from '@/lib/api';

// Вынесено в клиентский компонент, т.к. EditableText требует интерактивности.
// Раньше заголовок частично красился градиентом по слову "GhostMarket" —
// от этого трюка пришлось отказаться: с произвольным редактируемым текстом
// его корректно не сохранить (админ может убрать это слово или изменить
// регистр). Взамен — декоративная точка-бейдж над заголовком, она и так есть.
export function HeroText({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <EditableText
        value={title}
        onSave={(v) => updateSettings({ hero_title: v }).then(() => {})}
        as="h1"
        className="text-4xl sm:text-6xl font-semibold tracking-tight text-white mb-5 animate-fade-up"
        style={{ animationDelay: '80ms' }}
      />
      <EditableText
        value={subtitle}
        onSave={(v) => updateSettings({ hero_subtitle: v }).then(() => {})}
        as="p"
        multiline
        className="text-white/50 max-w-xl mx-auto mb-8 animate-fade-up"
        style={{ animationDelay: '160ms' }}
      />
    </>
  );
}
