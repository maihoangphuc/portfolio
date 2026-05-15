import { readRootCssVar } from "@/utils/rootCssColor";
import { Dom } from "@/lib/experience/runtime/types";

// Cache the accent color's RGB once at module load. `getComputedStyle` is a
// DOM-reflow trigger, so reading it once-per-particle-per-frame (as the old
// code did via rootCssVarToRgba) was the biggest hot spot in the loop.
let accentR = 0, accentG = 0, accentB = 0;
function refreshAccentRgb() {
  const raw = readRootCssVar("--color-web-accent");
  const m =
    raw.match(/^#([0-9a-fA-F]{6})/) ??
    raw.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (!m) return;
  if (m[0].startsWith("#")) {
    const n = parseInt(m[1], 16);
    accentR = (n >> 16) & 255;
    accentG = (n >> 8) & 255;
    accentB = n & 255;
  } else {
    accentR = Number(m[1]); accentG = Number(m[2]); accentB = Number(m[3]);
  }
}
if (typeof document !== "undefined") refreshAccentRgb();

export type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  op: number;
  seed: number;
};

export function createParticlesState() {
  return {
    particles: [] as Particle[],
  };
}

export function resizeParticles(dom: Dom) {
  dom.particles.width = innerWidth;
  dom.particles.height = innerHeight;
}

export function initParticles(dom: Dom, state: { particles: Particle[] }) {
  resizeParticles(dom);
  state.particles = [];
  const count = Math.floor((innerWidth * innerHeight) / 15000);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (innerWidth * 0.05) + 10;
    const isLeft = Math.random() > 0.5;
    state.particles.push({
      x: innerWidth / 2 + Math.cos(angle) * radius,
      y: innerHeight * 0.55 + (Math.random() - 0.5) * (innerHeight * 0.15),
      r: Math.random() * 0.5 + 0.2,
      vx: (isLeft ? -1 : 1) * (Math.random() * 0.3 + 0.05),
      vy: -Math.random() * 0.4 - 0.15,
      op: Math.random() * 0.5 + 0.1,
      seed: Math.random() * 100,
    });
  }
}

export function drawParticles(dom: Dom, ctx: CanvasRenderingContext2D, state: { particles: Particle[] }) {
  const pCanvas = dom.particles;
  ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, pCanvas.width, pCanvas.height - 60);
  ctx.clip();
  // Build the prefix once per frame; per-particle the only varying piece is `op`.
  const rgbaPrefix = `rgba(${accentR},${accentG},${accentB},`;
  for (const p of state.particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = rgbaPrefix + p.op + ")";
    ctx.fill();
    p.x += p.vx + Math.sin(p.y * 0.02 + p.seed) * 0.6;
    p.y += p.vy + Math.cos(p.x * 0.02 + p.seed) * 0.3;
    p.op -= 0.00015;
    if (p.y < pCanvas.height * 0.05) p.op -= 0.02;
    if (p.op <= 0 || p.y < -10 || p.x < -50 || p.x > pCanvas.width + 50) {
      p.y =
        pCanvas.height * 0.55 +
        (Math.random() - 0.5) * (pCanvas.height * 0.15);
      p.x =
        pCanvas.width / 2 + (Math.random() - 0.5) * (pCanvas.width * 0.15);
      p.op = Math.random() * 0.4 + 0.1;
      p.seed = Math.random() * 100;
    }
  }
  ctx.restore();
}
