'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useSiteEditMode } from './SiteEditModeProvider';
import { CheckIcon, EditIcon } from './icons';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

// Текст, который персонал (ADMIN/MANAGER) может кликнуть прямо на сайте и
// отредактировать на месте — без похода в отдельную форму в /admin.
// Активируется только когда одновременно: пользователь isStaff и включён
// глобальный "режим редактирования" (кнопка внизу справа, EditModeToggle).
// Для всех остальных — обычный статичный текст, без какой-либо разметки
// сверху и без лишних сетевых запросов.
export function EditableText({
  value,
  onSave,
  as = 'span',
  className = '',
  style,
  multiline = false,
  rows = 3,
  placeholder = 'Cliquez pour ajouter du texte',
}: EditableTextProps) {
  const { isStaff } = useAuth();
  const { enabled } = useSiteEditMode();

  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const cancelledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Если снаружи пришло новое значение (например, после навигации) и мы
  // сейчас не редактируем — подхватываем его.
  useEffect(() => {
    if (!isEditing) setLocalValue(value);
  }, [value, isEditing]);

  const canEdit = isStaff && enabled;

  function startEditing() {
    if (!canEdit) return;
    setDraft(localValue);
    setError(false);
    cancelledRef.current = false;
    setIsEditing(true);
  }

  function cancelEditing() {
    cancelledRef.current = true;
    setIsEditing(false);
  }

  async function commit() {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    if (draft === localValue) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setError(false);
    try {
      await onSave(draft);
      setLocalValue(draft);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    const InputTag = multiline ? 'textarea' : 'input';
    return (
      <span className="relative inline-block w-full align-top">
        <InputTag
          ref={inputRef as never}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              cancelEditing();
            } else if (e.key === 'Enter' && !multiline) {
              e.preventDefault();
              (e.target as HTMLElement).blur();
            } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              (e.target as HTMLElement).blur();
            }
          }}
          disabled={saving}
          rows={multiline ? rows : undefined}
          className={`${className} w-full bg-white/[0.08] border border-dashed border-ghost-violet/70 rounded-lg px-2 py-1 outline-none focus:border-ghost-violet resize-none`}
        />
        {saving && (
          <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-ghost-violet animate-pulse" />
        )}
        {error && (
          <span className="block text-xs text-red-400 mt-1 font-sans">
            Échec de l'enregistrement, réessayez
          </span>
        )}
      </span>
    );
  }

  const Tag = as;
  const isEmpty = !localValue;
  // inline-block нужен только для <span> внутри строки текста (напр. имя
  // магазина в копирайте) — для блочных тегов (p/div/h1) он ломает
  // вертикальное разнесение соседних элементов (напр. телефон и email друг
  // под другом в футере превратились бы в одну строку).
  const displayClass = canEdit && as === 'span' ? 'inline-block' : '';

  return (
    <Tag
      onClick={startEditing}
      style={style}
      className={`${className} ${displayClass} ${
        canEdit
          ? 'cursor-text rounded-lg outline-dashed outline-1 outline-transparent hover:outline-white/25 hover:bg-white/[0.03] transition-all relative group/editable'
          : ''
      }`}
    >
      {isEmpty ? (
        canEdit ? (
          <span className="text-white/25 italic">{placeholder}</span>
        ) : null
      ) : (
        localValue
      )}
      {canEdit && !isEmpty && (
        <EditIcon className="hidden group-hover/editable:inline-block w-3.5 h-3.5 ml-1.5 mb-0.5 text-white/40" />
      )}
      {saved && (
        <CheckIcon className="inline-block w-3.5 h-3.5 ml-1.5 mb-0.5 text-green-400" />
      )}
    </Tag>
  );
}
