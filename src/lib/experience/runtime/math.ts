export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Gentle in/out (zero 1st & 2nd derivative at 0 and 1) for explore entry. */
export function smootherstep01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Snappy start, gentle deceleration — natural for rotating-into-rest motion. */
export function easeOutCubic01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

/** Slow start, accelerates to peak velocity at the end — pairs with easeOut for no-pause swing. */
export function easeInCubic01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x;
}

/** Cinematic startup: approach quickly, then settle softly. */
export function startupApproachSettle01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  const settleStart = 0.72;
  if (x <= settleStart) {
    return { approach: smootherstep01(x / settleStart), settle: 0 };
  }
  return {
    approach: 1,
    settle: Math.pow(
      smootherstep01((x - settleStart) / (1 - settleStart)),
      0.85,
    ),
  };
}

/**
 * Góc tương đương 0 (k·2π) sao cho đích luôn lớn hơn start ít nhất một vòng
 * (xoay trái → phải).
 */
export function exitRotationTargetAtLeastOneTurn(start: number): number {
  const TAU = Math.PI * 2;
  if (!Number.isFinite(start)) return TAU;
  const k = Math.ceil((start + TAU) / TAU + 1e-9);
  return k * TAU;
}
