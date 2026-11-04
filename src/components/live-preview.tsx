'use client';

import { useEffect, useState } from 'react';
import type { SiteData, PageData } from '@/lib/types';
import { Website } from './website';

// The signed server response supplies forms/settings. Messages can only replace
// page content in this isolated preview; they never persist or publish anything.
export function LivePreview({ initial, editorOrigin }: { initial: SiteData; editorOrigin: string }) {
  const [page, setPage] = useState(initial.page);
  const [selected, setSelected] = useState(-1);
  useEffect(() => {
    document.querySelectorAll('[data-section-index]').forEach(node => node.classList.toggle('preview-selected', node.getAttribute('data-section-index') === String(selected)));
  }, [page, selected]);
  useEffect(() => {
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== editorOrigin || event.source !== window.parent) return;
      const message = event.data;
      if (message?.type !== 'salemax:preview' || !Array.isArray(message.page?.sections) || message.page.sections.length > 100) return;
      if (message.page.locale !== initial.page.locale) return;
      setPage(message.page as PageData);
      setSelected(message.selected);
      if (message.reveal && Number.isInteger(message.selected)) requestAnimationFrame(() => {
        document.querySelector(`[data-section-index="${message.selected}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    };
    const click = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const section = target.closest<HTMLElement>('[data-section-index]');
      // Keep preview navigation inside the current editor document.
      if (target.closest('a,button[type="submit"]')) event.preventDefault();
      if (section) window.parent.postMessage({ type: 'salemax:select', index: Number(section.dataset.sectionIndex) }, editorOrigin);
    };
    window.addEventListener('message', receive);
    document.addEventListener('click', click, true);
    window.parent.postMessage({ type: 'salemax:ready' }, editorOrigin);
    return () => { window.removeEventListener('message', receive); document.removeEventListener('click', click, true); };
  }, [editorOrigin, initial.page.locale, initial.page.slug]);
  return <Website site={{ ...initial, page }} />;
}
