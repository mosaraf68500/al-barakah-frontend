'use client';

import { useEffect } from 'react';

/** Legacy "Level 1" image protection: block right-click and drag on images / `.img-shield` (CSS lives in globals.css). */
export function ImageProtection() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'IMG' || t.classList.contains('img-shield') || t.closest('.img-shield'))) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'IMG' || t.classList.contains('img-shield'))) e.preventDefault();
    };
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, []);
  return null;
}
