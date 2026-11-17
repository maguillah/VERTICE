import { SurfaceMaterial } from './types';

export interface SurfacePatterns {
  concrete: CanvasPattern | null;
  wet: CanvasPattern | null;
  metal: CanvasPattern | null;
  stone: CanvasPattern | null;
}

function hash2(x: number, y: number, seed: number): number {
  let n = (x * 374761393 + y * 668265263 + seed * 1442695041) & 0x7fffffff;
  n = ((n ^ (n >> 13)) * 1274126177) | 0;
  return ((n ^ (n >> 16)) & 0xffff) / 65535;
}

function makePatternCanvas(
  size: number,
  paint: (ctx: CanvasRenderingContext2D, size: number) => void
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) {
    paint(ctx, size);
  }
  return c;
}

export function createSurfacePatterns(targetCtx: CanvasRenderingContext2D): SurfacePatterns {
  const concreteCanvas = makePatternCanvas(128, (ctx, size) => {
    ctx.fillStyle = '#12151b';
    ctx.fillRect(0, 0, size, size);

    // Micro-aggregate concrete grain and weathered tonal blotches
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const g = hash2(x, y, 19);
        const blotch = hash2(x >> 3, y >> 3, 53);
        const macro = hash2(x >> 4, y >> 4, 97);
        const v = Math.floor(13 + g * 12 + blotch * 9 + macro * 6);
        ctx.fillStyle = `rgb(${v - 1}, ${v}, ${v + 4})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Dark moisture seepage & weathered formwork joints with rim bevels
    for (let i = 0; i < 6; i++) {
      const mx = Math.floor(hash2(i, 9, 41) * size);
      const mh = 28 + Math.floor(hash2(i, 15, 41) * 58);
      const mg = ctx.createLinearGradient(0, 0, 0, mh);
      mg.addColorStop(0, 'rgba(4, 6, 9, 0.44)');
      mg.addColorStop(1, 'rgba(4, 6, 9, 0)');
      ctx.fillStyle = mg;
      ctx.fillRect(mx, 0, 6 + (i % 4) * 3, mh);
    }

    ctx.strokeStyle = 'rgba(4, 6, 9, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 48.5);
    ctx.lineTo(size, 48.5);
    ctx.moveTo(0, 96.5);
    ctx.lineTo(size, 96.5);
    ctx.moveTo(64.5, 0);
    ctx.lineTo(64.5, 48);
    ctx.moveTo(32.5, 48);
    ctx.lineTo(32.5, 96);
    ctx.moveTo(96.5, 96);
    ctx.lineTo(96.5, 128);
    // Hairline structural cracks
    ctx.moveTo(22, 58);
    ctx.lineTo(41, 80);
    ctx.lineTo(37, 106);
    ctx.moveTo(82, 16);
    ctx.lineTo(94, 34);
    ctx.lineTo(90, 46);
    ctx.stroke();

    // Subtle upper highlight edge along concrete seams
    ctx.strokeStyle = 'rgba(130, 146, 172, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 49.5);
    ctx.lineTo(size, 49.5);
    ctx.moveTo(0, 97.5);
    ctx.lineTo(size, 97.5);
    ctx.stroke();
  });

  const wetCanvas = makePatternCanvas(128, (ctx, size) => {
    ctx.drawImage(concreteCanvas, 0, 0);

    // Damp mineral moss & algae tint near deep crevices
    for (let i = 0; i < 8; i++) {
      const ax = hash2(i, 4, 71) * size;
      const ay = hash2(i, 12, 71) * size;
      const rad = 10 + hash2(i, 19, 71) * 16;
      const ag = ctx.createRadialGradient(ax, ay, 1, ax, ay, rad);
      ag.addColorStop(0, 'rgba(18, 34, 32, 0.24)');
      ag.addColorStop(1, 'rgba(18, 34, 32, 0)');
      ctx.fillStyle = ag;
      ctx.fillRect(ax - rad, ay - rad, rad * 2, rad * 2);
    }

    // Specular vertical moisture streaks & surface sheen
    for (let i = 0; i < 20; i++) {
      const sx = Math.floor(hash2(i, 3, 81) * size);
      const sw = 1.5 + (i % 3);
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, 'rgba(148, 178, 214, 0.14)');
      grad.addColorStop(0.45, 'rgba(8, 11, 16, 0.28)');
      grad.addColorStop(1, 'rgba(10, 14, 20, 0.08)');
      ctx.fillStyle = grad;
      ctx.fillRect(sx, 0, sw, size);
    }
  });

  const metalCanvas = makePatternCanvas(128, (ctx, size) => {
    ctx.fillStyle = '#13171e';
    ctx.fillRect(0, 0, size, size);

    // Directional brushed steel grain + wear scratches
    for (let y = 0; y < size; y += 2) {
      const brush = hash2(0, y, 91);
      const base = Math.floor(17 + brush * 11);
      ctx.fillStyle = `rgb(${base + 2}, ${base + 4}, ${base + 8})`;
      ctx.fillRect(0, y, size, 2);
    }

    // Diagonal metallic wear scratches
    ctx.strokeStyle = 'rgba(170, 184, 204, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const sx = hash2(i, 2, 113) * size;
      const sy = hash2(i, 5, 113) * size;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 18, sy + 6);
      ctx.stroke();
    }

    // Organic oxidation / rust patches
    for (let i = 0; i < 18; i++) {
      const rx = hash2(i, 7, 131) * (size - 16);
      const ry = hash2(i, 11, 131) * (size - 16);
      const rad = 8 + hash2(i, 17, 131) * 16;
      const rg = ctx.createRadialGradient(rx, ry, 1, rx, ry, rad);
      rg.addColorStop(0, 'rgba(122, 62, 28, 0.28)');
      rg.addColorStop(1, 'rgba(108, 58, 30, 0)');
      ctx.fillStyle = rg;
      ctx.fillRect(rx - rad, ry - rad, rad * 2, rad * 2);
    }

    // Heavy industrial plates with bevel highlight & rivets
    for (const [px, py, pw, ph] of [
      [0, 0, 64, 64],
      [64, 0, 64, 64],
      [0, 64, 64, 64],
      [64, 64, 64, 64],
    ]) {
      ctx.strokeStyle = 'rgba(4, 6, 9, 0.78)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 0.75, py + 0.75, pw - 1.5, ph - 1.5);
      ctx.strokeStyle = 'rgba(175, 190, 212, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 2, py + 2);
      ctx.lineTo(px + pw - 2, py + 2);
      ctx.stroke();

      for (const [rx, ry] of [
        [px + 6, py + 6],
        [px + pw - 8, py + 6],
        [px + 6, py + ph - 8],
        [px + pw - 8, py + ph - 8],
      ]) {
        ctx.fillStyle = 'rgba(5, 7, 10, 0.7)';
        ctx.fillRect(rx - 0.5, ry - 0.5, 3, 3);
        ctx.fillStyle = 'rgba(165, 176, 194, 0.28)';
        ctx.fillRect(rx, ry, 2, 2);
      }
    }
  });

  const stoneCanvas = makePatternCanvas(128, (ctx, size) => {
    ctx.fillStyle = '#0f1319';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = hash2(x >> 1, y >> 1, 211);
        const strata = 0.5 + 0.5 * Math.sin(y * 0.16 + n * 2.1);
        const v = Math.floor(13 + n * 10 + strata * 8);
        ctx.fillStyle = `rgb(${v - 1}, ${v + 1}, ${v + 5})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Carved ashlar stone block joints
    ctx.strokeStyle = 'rgba(4, 6, 9, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 32.5);
    ctx.lineTo(size, 32.5);
    ctx.moveTo(0, 64.5);
    ctx.lineTo(size, 64.5);
    ctx.moveTo(0, 96.5);
    ctx.lineTo(size, 96.5);
    ctx.moveTo(42.5, 0);
    ctx.lineTo(42.5, 32);
    ctx.moveTo(86.5, 32);
    ctx.lineTo(86.5, 64);
    ctx.moveTo(28.5, 64);
    ctx.lineTo(28.5, 96);
    ctx.moveTo(74.5, 96);
    ctx.lineTo(74.5, 128);
    ctx.stroke();
  });

  return {
    concrete: targetCtx.createPattern(concreteCanvas, 'repeat'),
    wet: targetCtx.createPattern(wetCanvas, 'repeat'),
    metal: targetCtx.createPattern(metalCanvas, 'repeat'),
    stone: targetCtx.createPattern(stoneCanvas, 'repeat'),
  };
}

export function getPatternForMaterial(
  patterns: SurfacePatterns,
  mat?: SurfaceMaterial
): CanvasPattern | null {
  switch (mat) {
    case 'wet':
      return patterns.wet;
    case 'metal':
      return patterns.metal;
    case 'stone':
      return patterns.stone;
    default:
      return patterns.concrete;
  }
}
