import type { MotionSettings } from './types.ts';

export function motionOptions(value?: MotionSettings | null) {
  const source = value || {};
  const enabled = source.enabled !== false;
  const toggle = (key: keyof MotionSettings) => enabled && source[key] !== false;
  return {
    enabled,
    reveal: (['rise', 'fade', 'slide', 'zoom', 'none'].includes(source.reveal || '') ? source.reveal : 'rise') as NonNullable<MotionSettings['reveal']>,
    duration: ['450', '700', '1000', '1400'].includes(String(source.duration)) ? Number(source.duration) : 700,
    intensity: ['subtle', 'normal', 'expressive'].includes(source.intensity || '') ? source.intensity! : 'normal',
    stagger: toggle('stagger'), hover: toggle('hover'), magnetic: toggle('magnetic'), sheen: toggle('sheen'), glow: toggle('glow'), parallax: toggle('parallax'), floating: toggle('floating'), micro: toggle('micro'), counters: toggle('counters'), marquee: toggle('marquee'), progress: toggle('progress'), mobile: toggle('mobile'),
  };
}

export function revealAnimation(value?: string) {
  return value && ['rise', 'fade', 'slide', 'zoom'].includes(value) ? `salemax-${value}` : value === 'none' ? 'none' : undefined;
}

export function numericLabel(value: string) {
  const normalized = value.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660)).replace(/٬/g, ',').replace(/٫/g, '.');
  const match = normalized.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)([^\d]*)$/);
  if (!match) return null;
  const number = Number(match[2].replace(/,/g, ''));
  return Number.isFinite(number) && number >= 0 ? { value: number, prefix: match[1], suffix: match[3], decimals: match[2].split('.')[1]?.length || 0 } : null;
}
