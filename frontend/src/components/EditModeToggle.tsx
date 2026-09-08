'use client';

import { useAuth } from './AuthProvider';
import { useSiteEditMode } from './SiteEditModeProvider';
import { EditIcon, CloseIcon } from './icons';

// Плавающая кнопка внизу справа — виден только ADMIN/MANAGER. Переключает
// глобальный режим, в котором редактируемые тексты (см. <EditableText>)
// показывают пунктирную рамку при наведении и открываются на клик.
export function EditModeToggle() {
  const { isStaff, loading } = useAuth();
  const { enabled, toggle } = useSiteEditMode();

  if (loading || !isStaff) return null;

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg transition-all ${
        enabled
          ? 'bg-ghost-gradient text-white shadow-glow'
          : 'glass-panel text-white/70 hover:text-white'
      }`}
    >
      {enabled ? <CloseIcon className="w-4 h-4" /> : <EditIcon className="w-4 h-4" />}
      {enabled ? "Terminer l'édition" : 'Modifier les textes'}
    </button>
  );
}
