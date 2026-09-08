'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SiteEditModeState {
  enabled: boolean;
  toggle: () => void;
}

const SiteEditModeContext = createContext<SiteEditModeState | null>(null);

const STORAGE_KEY = 'ghostmarket_site_edit_mode';

// Глобальный переключатель "режима редактирования текстов" — виден только
// персоналу (isStaff), но сам контекст доступен всем, чтобы <EditableText>
// мог им пользоваться без опаски (он сам проверяет isStaff перед рендером
// интерактива). Состояние живёт в sessionStorage, чтобы не сбрасывалось
// при переходах между страницами в рамках одной вкладки.
export function SiteEditModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(sessionStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      sessionStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }

  return (
    <SiteEditModeContext.Provider value={{ enabled, toggle }}>
      {children}
    </SiteEditModeContext.Provider>
  );
}

export function useSiteEditMode(): SiteEditModeState {
  const ctx = useContext(SiteEditModeContext);
  if (!ctx) throw new Error('useSiteEditMode doit être utilisé à l’intérieur de <SiteEditModeProvider>');
  return ctx;
}
