'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** задержка появления в мс — удобно для каскада внутри сетки (index * 60) */
  delay?: number;
  direction?: Direction;
  /** плавное увеличение при появлении (полезно для картинок) */
  scale?: boolean;
  as?: 'div' | 'li';
}

const OFFSET: Record<Direction, string> = {
  up: 'translate-y-6',
  left: '-translate-x-6',
  right: 'translate-x-6',
  none: '',
};

// Лёгкая обёртка на IntersectionObserver: элемент плавно проявляется и
// сдвигается на место при первом пересечении с viewport при прокрутке.
// Без сторонних библиотек (framer-motion и т.п.) — чистый CSS-transition
// + один общий observer на компонент.
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  scale = false,
  as = 'div',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Уважаем prefers-reduced-motion — сразу показываем без анимации
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? 'opacity-100 translate-x-0 translate-y-0 scale-100'
          : `opacity-0 ${OFFSET[direction]} ${scale ? 'scale-95' : ''}`
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
