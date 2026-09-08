'use client';

import { EditableText } from './EditableText';
import { updatePage } from '@/lib/api';

export function EditablePageContent({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string;
}) {
  return (
    <>
      <EditableText
        value={title}
        onSave={(v) => updatePage(id, { title: v }).then(() => {})}
        as="h1"
        className="text-3xl font-semibold text-white mb-6 animate-fade-up"
      />
      <EditableText
        value={content}
        onSave={(v) => updatePage(id, { content: v }).then(() => {})}
        as="div"
        multiline
        rows={12}
        className="glass-card rounded-2xl p-6 sm:p-8 text-white/70 leading-relaxed whitespace-pre-line animate-fade-up min-h-[8rem]"
        style={{ animationDelay: '80ms' }}
      />
    </>
  );
}
