export function stackOffset(index: number): number {
  return Math.min(Math.max(0, index), 5);
}

export function canStackCards(heights: number[], viewport: number, top: number, step: number, reducedMotion: boolean): boolean {
  if (reducedMotion || heights.length < 2 || !Number.isFinite(viewport)) return false;
  const available = viewport - top - stackOffset(heights.length - 1) * step - 28;
  return heights.every(height => Number.isFinite(height) && height > 0 && height <= available);
}

export function overlapProgress(nextTop: number, stickyTop: number, height: number, step: number): number {
  if (!Number.isFinite(nextTop) || height <= step || height <= 0) return 0;
  return Math.max(0, Math.min(1, (stickyTop + height - nextTop) / (height - step)));
}
