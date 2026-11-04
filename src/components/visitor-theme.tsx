'use client';

import { useSyncExternalStore } from 'react';
import type { Settings } from '@/lib/types';

const subscribe = (callback: () => void) => { window.addEventListener('salemax:theme', callback); window.addEventListener('storage', callback); return () => { window.removeEventListener('salemax:theme', callback); window.removeEventListener('storage', callback); }; };
const server = () => '';
export function useVisitorTheme(settings: Settings, preview: boolean) {
  const key = preview ? 'salemax-preview-theme' : 'salemax-visitor-theme';
  const preference = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key) || ''; } catch { return ''; } }, server);
  const mode = settings.utilities?.show_theme_toggle && ['light', 'dark'].includes(preference) ? preference : settings.theme?.mode || 'light';
  const choose = (value: string) => { try { localStorage.setItem(key, value); } catch { /* Private storage may be unavailable. */ } window.dispatchEvent(new Event('salemax:theme')); };
  return { mode, choose };
}
export function VisitorThemeToggle({ settings, preview }: { settings: Settings; preview: boolean }) {
  const { mode, choose } = useVisitorTheme(settings, preview);
  if (!settings.utilities?.show_theme_toggle) return null;
  return <div className="visitor-theme-toggle" role="group" aria-label={settings.utilities.light_label + ' / ' + settings.utilities.dark_label}>{(['light', 'dark'] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => choose(value)}>{value === 'light' ? '☀' : '☾'} <span>{value === 'light' ? settings.utilities?.light_label : settings.utilities?.dark_label}</span></button>)}</div>;
}
