import { createSurfacePatterns, getPatternForMaterial, SurfacePatterns } from './textures2D';
import {
  BgMonolith,
  ChapterNumber,
  CheckpointData,
  ClimbableZone,
  Creature,
  DistantSilhouette,
  DripSpot,
  EchoMemory,
  FallingLeaf,
  FloatingDebris,
  HazardZone,
  InteractableNode,
  Particle,
  Platform,
  PlayerState,
  PushBlock,
  QualityLevel,
  ResonanceState,
  SceneAnimationState,
  SpatialGate,
  VegetationTuft,
  WaterPool,
  WaterSplashRipple,
} from './types';

export interface RenderFrameState {
  time: number;
  chapterNumber: ChapterNumber;
  cameraX: number;
  cameraY: number;
  cameraZoom: number;
  shakeX: number;
  shakeY: number;
  resonance: ResonanceState;
  resonanceFlare: number;
  shockwave: { active: boolean; x: number; y: number; radius: number; alpha: number };
  quality: QualityLevel;
  platforms: Platform[];
  gates: SpatialGate[];
  nodes: InteractableNode[];
  checkpoints: CheckpointData[];
  monoliths: BgMonolith[];
  memories: EchoMemory[];
  waterPools: WaterPool[];
  drips: DripSpot[];
  debris: FloatingDebris[];
  climbables: ClimbableZone[];
  pushBlocks: PushBlock[];
  hazards: HazardZone[];
  vegetation: VegetationTuft[];
  leaves: FallingLeaf[];
  creatures: Creature[];
  silhouettes: DistantSilhouette[];
  splashRipples: WaterSplashRipple[];
  particles: Particle[];
  player: PlayerState;
  isRunning: boolean;
  interactPulse: number;
  nearbyNodeId: string | null;
  inChapter2?: boolean;
  sceneAnimation?: SceneAnimationState;
}

export class VerticeRenderer2D {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private patterns: SurfacePatterns;
  private width = 1280;
  private height = 720;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, quality: QualityLevel) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('2D Canvas context unavailable');
    }
    this.ctx = context;
    this.patterns = createSurfacePatterns(this.ctx);
    this.resize(canvas.clientWidth || 1280, canvas.clientHeight || 720, quality);
  }

  public resize(clientWidth: number, clientHeight: number, quality: QualityLevel): void {
    const w = Math.max(320, clientWidth);
    const h = Math.max(240, clientHeight);
    const maxDpr = quality === 'low' ? 1.0 : quality === 'medium' ? 1.35 : 1.75;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
  }

  public render(state: RenderFrameState): void {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    this.drawSkyAndResonanceWash(state, width, height);
    this.drawParallaxArchitecture(state, width, height);
    this.drawDistantSilhouettes(state, width, height);
    this.drawMistBand(state, width, height, 0.25, 0.72, 0.22);

    ctx.save();
    ctx.translate(width * 0.5 + state.shakeX, height * 0.54 + state.shakeY);
    ctx.scale(state.cameraZoom, state.cameraZoom);
    ctx.translate(-state.cameraX, -state.cameraY);

    this.drawThresholdAperture(state);
    this.drawFloatingDebris(state);
    this.drawWaterReflections(state);
    this.drawHazards(state);
    this.drawClimbables(state);
    this.drawPlatforms(state);
    this.drawPushBlocks(state);
    this.drawVegetation(state);
    this.drawGates(state);
    this.drawDrips(state);
    this.drawSplashRipples(state);
    this.drawCheckpoints(state);
    this.drawInteractableNodes(state);
    this.drawEcoMemories(state);
    this.drawCreatures(state);
    this.drawProtagonistGroundShadowAndLight(state);
    this.drawProtagonist(state);
    this.drawFallingLeaves(state);
    this.drawParticlesAndShockwave(state);
    this.drawSceneAnimationWorldFx(state);

    ctx.restore();

    if (state.quality !== 'low') {
      this.drawMistBand(state, width, height, 0.78, 0.88, 0.16);
    }
    this.drawCinematicVignette(state, width, height);
    this.drawSceneLetterbox(state, width, height);

    ctx.restore();
  }

  private drawSkyAndResonanceWash(state: RenderFrameState, w: number, h: number): void {
    const sky = ctx_createSky(this.ctx, h, state.resonance, state.chapterNumber);
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, w, h);

    const horizon = this.ctx.createRadialGradient(
      w * 0.5,
      h * 0.52,
      20,
      w * 0.5,
      h * 0.52,
      w * 0.72
    );
    if (state.chapterNumber === 6) {
      horizon.addColorStop(0, 'rgba(245, 178, 84, 0.22)');
      horizon.addColorStop(1, 'rgba(12, 10, 8, 0)');
    } else if (state.resonance === 'ECO') {
      horizon.addColorStop(0, 'rgba(229, 152, 56, 0.16)');
      horizon.addColorStop(1, 'rgba(12, 10, 8, 0)');
    } else if (state.resonance === 'RUPTURA') {
      horizon.addColorStop(0, 'rgba(255, 128, 46, 0.18)');
      horizon.addColorStop(1, 'rgba(10, 6, 6, 0)');
    } else {
      horizon.addColorStop(0, 'rgba(90, 114, 148, 0.13)');
      horizon.addColorStop(1, 'rgba(6, 7, 10, 0)');
    }
    this.ctx.fillStyle = horizon;
    this.ctx.fillRect(0, 0, w, h);
  }

  private drawParallaxArchitecture(state: RenderFrameState, w: number, h: number): void {
    const { ctx } = this;
    const viewMinX = -280;
    const viewMaxX = w + 280;
    const rimTone =
      state.resonance === 'ECO' || state.chapterNumber === 6
        ? 'rgba(235, 168, 80, 0.14)'
        : state.resonance === 'RUPTURA'
        ? 'rgba(255, 132, 60, 0.14)'
        : 'rgba(136, 162, 198, 0.1)';

    if (state.quality !== 'low') {
      ctx.strokeStyle = 'rgba(20, 25, 34, 0.55)';
      ctx.lineWidth = 1.2;
      const span = 520;
      const offset = ((state.cameraX * 0.28) % span + span) % span;
      for (let x = -span; x < w + span; x += span) {
        const sx = x - offset;
        ctx.beginPath();
        ctx.moveTo(sx, 24);
        ctx.quadraticCurveTo(
          sx + span * 0.5,
          92 + Math.sin(state.time * 0.7 + sx * 0.01) * 4,
          sx + span,
          24
        );
        ctx.stroke();
      }
    }

    for (const m of state.monoliths) {
      const screenX = w * 0.5 + (m.x - state.cameraX) * m.depth;
      if (screenX + m.w < viewMinX || screenX > viewMaxX) continue;
      const screenY = h * 0.5 + (m.y - state.cameraY) * (m.depth * 0.45);

      if (m.kind === 'gear') {
        const radius = m.w * 0.5;
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(state.time * (state.resonance === 'RUPTURA' ? -0.35 : 0.16) + m.x * 0.01);
        ctx.strokeStyle = 'rgba(28, 35, 48, 0.78)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(16, 20, 28, 0.75)';
        for (let t = 0; t < 8; t++) {
          ctx.rotate(Math.PI * 0.25);
          ctx.fillRect(-5, -radius - 8, 10, 14);
        }
        ctx.restore();
        continue;
      }

      if (m.kind === 'beam') {
        const shimmer = 0.86 + 0.14 * Math.sin(state.time * 1.4 + m.x * 0.01);
        const beamAlpha =
          (state.chapterNumber === 6
            ? 0.115
            : state.resonance === 'ECO'
            ? 0.095
            : state.resonance === 'RUPTURA'
            ? 0.105
            : 0.068) * shimmer;
        const grad = ctx.createLinearGradient(screenX, screenY, screenX + m.w * 0.6, screenY + m.h);
        grad.addColorStop(
          0,
          state.resonance === 'PRESENTE' && state.chapterNumber !== 6
            ? `rgba(170, 195, 230, ${beamAlpha})`
            : `rgba(235, 165, 78, ${beamAlpha})`
        );
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + m.w * 0.5, screenY);
        ctx.lineTo(screenX + m.w * 1.45, screenY + m.h);
        ctx.lineTo(screenX + m.w * 0.55, screenY + m.h);
        ctx.closePath();
        ctx.fill();
        continue;
      }

      if (m.kind === 'chain') {
        const sway = Math.sin(state.time * 1.15 + m.x * 0.02) * 9;
        ctx.strokeStyle = 'rgba(28, 34, 46, 0.8)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.quadraticCurveTo(screenX + sway * 0.4, screenY + m.h * 0.5, screenX + sway, screenY + m.h);
        ctx.stroke();
        ctx.fillStyle = '#121720';
        ctx.fillRect(screenX + sway - 5, screenY + m.h - 12, 10, 15);
        ctx.fillStyle = rimTone;
        ctx.fillRect(screenX + sway - 5, screenY + m.h - 12, 10, 2);
        continue;
      }

      const shade = Math.floor(10 + m.depth * 14);
      const bodyCol = `rgb(${shade}, ${shade + 3}, ${shade + 7})`;
      const sideCol = `rgb(${Math.max(5, shade - 4)}, ${Math.max(6, shade - 2)}, ${shade + 1})`;
      ctx.fillStyle = bodyCol;

      if (m.kind === 'inverted') {
        const ih = m.h * 0.62;
        const topY = screenY - 120;
        ctx.fillRect(screenX, topY, m.w, ih);
        ctx.fillStyle = sideCol;
        ctx.fillRect(screenX + m.w * 0.72, topY, m.w * 0.28, ih);
        ctx.fillStyle = bodyCol;
        ctx.beginPath();
        ctx.moveTo(screenX, topY + ih);
        ctx.lineTo(screenX + m.w, topY + ih);
        ctx.lineTo(screenX + m.w * 0.5, topY + ih + 26);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(229, 152, 56, 0.14)';
        ctx.fillRect(screenX, topY + ih - 3, m.w, 3);
      } else if (m.kind === 'arch') {
        ctx.fillRect(screenX, screenY, 22, m.h);
        ctx.fillRect(screenX + m.w - 22, screenY, 22, m.h);
        ctx.fillRect(screenX, screenY, m.w, 34);
        ctx.fillStyle = sideCol;
        ctx.fillRect(screenX + 16, screenY + 34, 6, m.h - 34);
        ctx.fillRect(screenX + m.w - 6, screenY + 34, 6, m.h - 34);
        ctx.fillStyle = rimTone;
        ctx.fillRect(screenX, screenY, m.w, 2.5);
        ctx.fillRect(screenX + 22, screenY + 34, m.w - 44, 2);
      } else {
        ctx.fillRect(screenX, screenY, m.w, m.h);
        ctx.fillStyle = sideCol;
        ctx.fillRect(screenX + m.w * 0.72, screenY, m.w * 0.28, m.h);
        ctx.fillStyle = rimTone;
        ctx.fillRect(screenX, screenY, 2, m.h);
        ctx.fillStyle = 'rgba(3, 5, 8, 0.45)';
        for (let gy = screenY + 75; gy < screenY + m.h - 40; gy += 85) {
          ctx.fillRect(screenX + 3, gy, m.w - 6, 2);
        }
      }
    }
  }

  private drawDistantSilhouettes(state: RenderFrameState, w: number, h: number): void {
    const { ctx } = this;
    for (const s of state.silhouettes) {
      const sx = w * 0.5 + (s.x - state.cameraX) * s.depth;
      if (sx < -80 || sx > w + 80) continue;
      const sy = h * 0.54 + (s.y - state.cameraY) * (s.depth * 0.48);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = 'rgba(8, 11, 16, 0.72)';
      if (s.pose === 'fallen') {
        ctx.beginPath();
        ctx.arc(4, -14, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-6, -11, 14, 11);
      } else {
        ctx.beginPath();
        ctx.arc(0, -30, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3.5, -26, 7, 26);
        if (s.pose === 'sentinel') {
          ctx.fillStyle = 'rgba(229, 152, 56, 0.35)';
          ctx.beginPath();
          ctx.arc(0, -18, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  private drawMistBand(
    state: RenderFrameState,
    w: number,
    h: number,
    parallax: number,
    yFrac: number,
    alpha: number
  ): void {
    const { ctx } = this;
    const baseY = h * yFrac;
    const drift = (state.time * 18 * parallax + state.cameraX * parallax * 0.35) % 420;
    const tint =
      state.chapterNumber === 6
        ? `rgba(215, 162, 92, ${alpha * 0.58})`
        : state.resonance === 'ECO'
        ? `rgba(180, 130, 72, ${alpha * 0.55})`
        : state.resonance === 'RUPTURA'
        ? `rgba(190, 98, 52, ${alpha * 0.5})`
        : `rgba(74, 88, 110, ${alpha})`;

    for (let x = -420; x < w + 420; x += 260) {
      const cx = x - drift;
      const g = ctx.createRadialGradient(cx + 130, baseY, 15, cx + 130, baseY, 220);
      g.addColorStop(0, tint);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - 90, baseY - 130, 440, 260);
    }
  }

  private drawThresholdAperture(state: RenderFrameState): void {
    const { ctx } = this;
    const thresholdNode = state.nodes.find((n) => n.type === 'CHAPTER_THRESHOLD');
    if (!thresholdNode) return;
    const tx = thresholdNode.x;
    const ty = thresholdNode.y - 130;
    if (Math.abs(tx - state.cameraX) > 1200) return;

    const pulse = 1 + 0.05 * Math.sin(state.time * 2.1);
    const rad = state.chapterNumber === 6 ? 310 : 240;
    const halo = ctx.createRadialGradient(tx, ty, 12, tx, ty, rad * pulse);
    halo.addColorStop(0, state.chapterNumber === 6 ? 'rgba(255, 234, 180, 0.58)' : 'rgba(255, 200, 120, 0.42)');
    halo.addColorStop(0.45, 'rgba(229, 152, 56, 0.18)');
    halo.addColorStop(1, 'rgba(10, 12, 16, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(tx, ty, rad * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(229, 152, 56, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tx, ty, 118 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(200, 212, 232, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 146, state.time * 0.2, state.time * 0.2 + Math.PI * 1.45);
    ctx.stroke();
  }

  private drawFloatingDebris(state: RenderFrameState): void {
    const { ctx } = this;
    const isRup = state.resonance === 'RUPTURA';
    for (const d of state.debris) {
      if (Math.abs(d.x - state.cameraX) > 950) continue;
      const lift = isRup
        ? Math.sin(state.time * 3.1 + d.phase) * 16 - 14
        : Math.sin(state.time * 1.2 + d.phase) * 5;
      ctx.save();
      ctx.translate(d.x, d.y + lift);
      ctx.rotate(Math.sin(state.time * (isRup ? 1.8 : 0.6) + d.phase) * (isRup ? 0.28 : 0.1));
      ctx.fillStyle = isRup ? '#231914' : '#12161d';
      ctx.fillRect(-d.w * 0.5, -d.h * 0.5, d.w, d.h);
      if (isRup) {
        ctx.strokeStyle = 'rgba(255, 148, 64, 0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-d.w * 0.5, -d.h * 0.5, d.w, d.h);
      }
      ctx.restore();
    }
  }

  private drawWaterReflections(state: RenderFrameState): void {
    const { ctx } = this;
    const px = state.player.x + state.player.w * 0.5;
    const py = state.player.y + state.player.h;

    for (const pool of state.waterPools) {
      if (pool.x + pool.w < state.cameraX - 850 || pool.x > state.cameraX + 850) continue;

      const grad = ctx.createLinearGradient(0, pool.y, 0, pool.y + pool.h);
      grad.addColorStop(0, 'rgba(13, 18, 25, 0.94)');
      grad.addColorStop(0.35, 'rgba(7, 10, 15, 0.98)');
      grad.addColorStop(1, 'rgba(4, 5, 8, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(pool.x, pool.y, pool.w, pool.h);

      ctx.save();
      ctx.beginPath();
      ctx.rect(pool.x, pool.y, pool.w, pool.h);
      ctx.clip();

      if (px >= pool.x - 160 && px <= pool.x + pool.w + 160) {
        const distAbove = Math.max(0, pool.y - py);
        if (distAbove < 210) {
          const refY = pool.y + distAbove * 0.65;
          const refAlpha = Math.max(0, 0.34 - distAbove * 0.0014);
          const wobble = Math.sin(state.time * 4.2 + py * 0.08) * 2.5;

          const coreRef = ctx.createRadialGradient(
            px + wobble,
            refY + 26,
            2,
            px + wobble,
            refY + 26,
            60
          );
          coreRef.addColorStop(0, `rgba(235, 155, 62, ${refAlpha * 0.92})`);
          coreRef.addColorStop(1, 'rgba(235, 155, 62, 0)');
          ctx.fillStyle = coreRef;
          ctx.fillRect(px - 65, refY - 20, 130, 102);

          ctx.fillStyle = `rgba(9, 12, 17, ${refAlpha})`;
          ctx.beginPath();
          ctx.moveTo(px - 6 + wobble, refY + 2);
          ctx.lineTo(px + 6 + wobble, refY + 2);
          ctx.lineTo(px + 5 + wobble * 1.4, refY + 36);
          ctx.arc(px + wobble * 1.4, refY + 42, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const cp of state.checkpoints) {
        if (cp.x >= pool.x && cp.x <= pool.x + pool.w) {
          const dist = Math.max(0, pool.y - cp.y);
          if (dist < 180) {
            const refY = pool.y + dist * 0.6 + 22;
            const g = ctx.createRadialGradient(cp.x, refY, 2, cp.x, refY, cp.ignited ? 64 : 32);
            g.addColorStop(0, cp.ignited ? 'rgba(245, 165, 66, 0.32)' : 'rgba(130, 150, 180, 0.16)');
            g.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = g;
            ctx.fillRect(cp.x - 65, refY - 40, 130, 84);
          }
        }
      }

      const step = state.quality === 'low' ? 18 : 9;
      for (let ry = pool.y + 4; ry < pool.y + 98; ry += step) {
        const wave = Math.sin(state.time * 2.2 + ry * 0.22) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(135, 160, 196, ${0.03 + wave * 0.05})`;
        ctx.fillRect(pool.x, ry, pool.w, 1.2);
      }

      ctx.fillStyle =
        state.resonance === 'ECO' ? 'rgba(229, 152, 56, 0.42)' : 'rgba(148, 174, 208, 0.3)';
      ctx.fillRect(pool.x, pool.y, pool.w, 2.2);

      ctx.restore();
    }
  }

  private drawHazards(state: RenderFrameState): void {
    const { ctx } = this;
    for (const h of state.hazards) {
      if (h.x + h.w < state.cameraX - 900 || h.x > state.cameraX + 900) continue;
      if (h.kind === 'ruptura_surge' && state.resonance === 'RUPTURA') continue;
      const grad = ctx.createLinearGradient(0, h.y + h.h, 0, h.y);
      if (h.kind === 'ruptura_surge') {
        grad.addColorStop(0, 'rgba(220, 75, 28, 0.55)');
        grad.addColorStop(1, 'rgba(220, 75, 28, 0)');
      } else {
        grad.addColorStop(0, 'rgba(110, 130, 155, 0.42)');
        grad.addColorStop(1, 'rgba(80, 95, 115, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(h.x, h.y, h.w, h.h);
    }
  }

  private drawClimbables(state: RenderFrameState): void {
    const { ctx } = this;
    for (const c of state.climbables) {
      if (Math.abs(c.x - state.cameraX) > 900) continue;
      const cx = c.x + c.w * 0.5;
      ctx.save();
      if (c.kind === 'vine') {
        ctx.strokeStyle = '#3a4a38';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        for (let y = c.y; y <= c.y + c.h; y += 12) {
          const sway = Math.sin(state.time * 1.8 + y * 0.05) * 2.4;
          if (y === c.y) ctx.moveTo(cx + sway, y);
          else ctx.lineTo(cx + sway, y);
        }
        ctx.stroke();
      } else if (c.kind === 'chain') {
        ctx.strokeStyle = '#384354';
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, c.y);
        ctx.lineTo(cx, c.y + c.h);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Industrial conduit rungs
        ctx.fillStyle = '#1b212b';
        ctx.fillRect(cx - 2.5, c.y, 5, c.h);
        ctx.fillStyle = 'rgba(229, 152, 56, 0.35)';
        for (let ry = c.y + 10; ry < c.y + c.h; ry += 18) {
          ctx.fillRect(cx - 8, ry, 16, 2.5);
        }
      }
      ctx.restore();
    }
  }

  private drawPushBlocks(state: RenderFrameState): void {
    const { ctx } = this;
    for (const b of state.pushBlocks) {
      if (Math.abs(b.curX - state.cameraX) > 900) continue;
      ctx.fillStyle = getPatternForMaterial(this.patterns, b.material) || '#1c222b';
      ctx.fillRect(b.curX, b.curY, b.w, b.h);
      ctx.strokeStyle = 'rgba(229, 152, 56, 0.48)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(b.curX + 0.5, b.curY + 0.5, b.w - 1, b.h - 1);
      // Center glyph
      ctx.fillStyle = 'rgba(229, 152, 56, 0.42)';
      ctx.fillRect(b.curX + b.w * 0.5 - 3, b.curY + b.h * 0.5 - 3, 6, 6);
    }
  }

  private drawVegetation(state: RenderFrameState): void {
    const { ctx } = this;
    for (const v of state.vegetation) {
      if (Math.abs(v.x - state.cameraX) > 850) continue;
      const tipX = v.x + v.bend * v.height * 0.9;
      const tipY = v.y - v.height;
      ctx.strokeStyle =
        v.kind === 'moss'
          ? 'rgba(72, 92, 78, 0.72)'
          : v.kind === 'fern'
          ? 'rgba(84, 102, 76, 0.78)'
          : state.chapterNumber === 6
          ? 'rgba(176, 134, 68, 0.74)'
          : 'rgba(62, 74, 86, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
      ctx.quadraticCurveTo(v.x + v.bend * 2, v.y - v.height * 0.5, tipX, tipY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(v.x + 3, v.y);
      ctx.quadraticCurveTo(v.x + 3 + v.bend * 2, v.y - v.height * 0.4, tipX + 4, tipY + 2);
      ctx.stroke();
    }
  }

  private drawPlatforms(state: RenderFrameState): void {
    const { ctx } = this;

    for (const p of state.platforms) {
      if (p.curX + p.w < state.cameraX - 900 || p.curX > state.cameraX + 900) continue;

      if (p.mode === 'ECHO_ONLY') {
        const isEcho = state.resonance === 'ECO';
        if (isEcho) {
          ctx.save();
          ctx.fillStyle = this.patterns.stone || '#2a2219';
          ctx.globalAlpha = 0.9;
          ctx.fillRect(p.curX, p.curY, p.w, p.h);
          ctx.fillStyle = 'rgba(229, 152, 56, 0.4)';
          ctx.fillRect(p.curX, p.curY, p.w, 3);
          ctx.strokeStyle = 'rgba(255, 190, 102, 0.84)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.curX + 0.5, p.curY + 0.5, p.w - 1, p.h - 1);
          ctx.restore();
        } else {
          ctx.save();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = 'rgba(229, 152, 56, 0.24)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(p.curX, p.curY, p.w, p.h);
          ctx.restore();
        }
        continue;
      }

      if (p.mode === 'PRESENT_ONLY') {
        const isPres = state.resonance === 'PRESENTE';
        if (isPres) {
          ctx.fillStyle = this.patterns.concrete || '#181c24';
          ctx.fillRect(p.curX, p.curY, p.w, p.h);
          ctx.fillStyle = 'rgba(165, 185, 214, 0.24)';
          ctx.fillRect(p.curX, p.curY, p.w, 2.5);
          ctx.strokeStyle = 'rgba(180, 195, 218, 0.42)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(p.curX + 0.5, p.curY + 0.5, p.w - 1, p.h - 1);
        } else {
          ctx.save();
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = 'rgba(155, 175, 205, 0.24)';
          ctx.strokeRect(p.curX, p.curY, p.w, p.h);
          ctx.restore();
        }
        continue;
      }

      // Guide rails for cyclic moving elevators
      if (p.moveDx || p.moveDy) {
        ctx.strokeStyle = 'rgba(110, 128, 156, 0.26)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w * 0.5, p.y + p.h * 0.5);
        ctx.lineTo(p.x + (p.moveDx || 0) + p.w * 0.5, p.y + (p.moveDy || 0) + p.h * 0.5);
        ctx.stroke();
      }

      if (p.mode === 'ALWAYS_SOLID' && p.w >= 140 && p.h >= 24 && p.h < 180 && !p.moveDx && !p.moveDy) {
        ctx.fillStyle = '#090c11';
        const spacing = 180;
        for (let sx = p.curX + 26; sx < p.curX + p.w - 20; sx += spacing) {
          ctx.fillRect(sx, p.curY + p.h, 12, 240);
          ctx.fillStyle = 'rgba(95, 112, 138, 0.08)';
          ctx.fillRect(sx, p.curY + p.h, 2, 240);
          ctx.fillStyle = '#090c11';
        }
      }

      const pat = getPatternForMaterial(this.patterns, p.material);
      if (p.mode === 'RUPTURA_SHIFT' && state.resonance === 'RUPTURA') {
        const slices = 4;
        const sh = p.h / slices;
        for (let i = 0; i < slices; i++) {
          const jitter = Math.sin(state.time * 12 + i * 2.1) * 3.5;
          ctx.fillStyle = pat || '#1e1917';
          ctx.fillRect(p.curX + jitter, p.curY + i * sh, p.w, sh + 0.5);
        }
        ctx.strokeStyle = 'rgba(255, 150, 56, 0.88)';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(p.curX, p.curY, p.w, p.h);
      } else {
        ctx.fillStyle = pat || '#12151b';
        ctx.fillRect(p.curX, p.curY, p.w, p.h);
        ctx.fillStyle = 'rgba(3, 4, 7, 0.55)';
        ctx.fillRect(p.curX, p.curY + p.h - 4, p.w, 4);
        ctx.fillStyle =
          p.material === 'wet'
            ? 'rgba(155, 185, 224, 0.36)'
            : p.material === 'metal'
            ? 'rgba(186, 152, 120, 0.28)'
            : 'rgba(128, 142, 166, 0.22)';
        ctx.fillRect(p.curX, p.curY, p.w, 3);
        if (p.moveDx || p.moveDy) {
          ctx.fillStyle = 'rgba(229, 152, 56, 0.52)';
          ctx.fillRect(p.curX + p.w * 0.5 - 12, p.curY + p.h * 0.5 - 2, 24, 4);
        }
      }
    }
  }

  private drawGates(state: RenderFrameState): void {
    const { ctx } = this;
    for (const g of state.gates) {
      if (Math.abs(g.x - state.cameraX) > 900) continue;

      ctx.fillStyle = '#0c0f14';
      ctx.fillRect(g.x - 4, g.y + g.openDy, 4, g.h - g.openDy);
      ctx.fillRect(g.x + g.w, g.y + g.openDy, 4, g.h - g.openDy);

      ctx.fillStyle = this.patterns.metal || '#151920';
      ctx.fillRect(g.x, g.curY, g.w, g.h);
      ctx.strokeStyle = g.isOpen ? 'rgba(120, 215, 165, 0.5)' : 'rgba(229, 152, 56, 0.62)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(g.x, g.curY, g.w, g.h);

      ctx.fillStyle = 'rgba(4, 6, 9, 0.65)';
      for (let ry = g.curY + 26; ry < g.curY + g.h - 14; ry += 32) {
        ctx.fillRect(g.x + 2, ry, g.w - 4, 3);
      }

      const gearAngle = (g.curY - g.y) * 0.04;
      const gx = g.x + g.w * 0.5;
      const gy = g.curY + g.h * 0.5;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(gearAngle);
      ctx.strokeStyle = g.isOpen ? 'rgba(125, 220, 170, 0.55)' : 'rgba(229, 152, 56, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.stroke();
      for (let t = 0; t < 4; t++) {
        ctx.rotate(Math.PI * 0.5);
        ctx.fillStyle = '#1f2632';
        ctx.fillRect(-2, -12, 4, 24);
      }
      ctx.restore();

      const seamCol = g.isOpen
        ? 'rgba(125, 220, 170, 0.72)'
        : g.requiresFrequencySwitch
        ? 'rgba(255, 118, 52, 0.88)'
        : 'rgba(229, 152, 56, 0.88)';
      ctx.fillStyle = seamCol;
      ctx.fillRect(g.x + g.w * 0.5 - 2, g.curY + 12, 4, g.h - 24);
    }
  }

  private drawDrips(state: RenderFrameState): void {
    if (state.quality === 'low') return;
    const { ctx } = this;
    ctx.strokeStyle = 'rgba(155, 182, 216, 0.38)';
    ctx.lineWidth = 1.2;
    for (const d of state.drips) {
      if (Math.abs(d.x - state.cameraX) > 850) continue;
      const cycle = ((state.time * 0.72 + d.phase) % 1 + 1) % 1;
      const dy = d.y + (d.groundY - d.y) * (cycle * cycle);
      ctx.beginPath();
      ctx.moveTo(d.x, dy);
      ctx.lineTo(d.x, Math.min(d.groundY, dy + 10));
      ctx.stroke();

      if (cycle > 0.92) {
        const ring = (cycle - 0.92) * 180;
        ctx.strokeStyle = `rgba(165, 190, 225, ${(1 - cycle) * 4})`;
        ctx.beginPath();
        ctx.ellipse(d.x, d.groundY, ring, ring * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(155, 182, 216, 0.38)';
      }
    }
  }

  private drawSplashRipples(state: RenderFrameState): void {
    const { ctx } = this;
    for (const r of state.splashRipples) {
      ctx.strokeStyle = `rgba(175, 206, 238, ${Math.max(0, r.alpha)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y + 1, r.radius, r.radius * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawCheckpoints(state: RenderFrameState): void {
    const { ctx } = this;
    for (const cp of state.checkpoints) {
      if (Math.abs(cp.x - state.cameraX) > 900) continue;

      ctx.fillStyle = '#0f131a';
      ctx.fillRect(cp.x - 10, cp.y - 6, 20, 6);
      ctx.fillStyle = '#161b23';
      ctx.fillRect(cp.x - 5.5, cp.y - 58, 11, 52);
      ctx.fillStyle = 'rgba(130, 148, 178, 0.14)';
      ctx.fillRect(cp.x - 5.5, cp.y - 58, 2, 52);

      const glowR = cp.ignited ? 78 : 36;
      const glow = ctx.createRadialGradient(cp.x, cp.y - 64, 2, cp.x, cp.y - 64, glowR);
      glow.addColorStop(
        0,
        cp.ignited ? 'rgba(255, 196, 108, 0.88)' : 'rgba(145, 165, 192, 0.35)'
      );
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y - 64, glowR, 0, Math.PI * 2);
      ctx.fill();

      if (cp.ignited) {
        ctx.strokeStyle = 'rgba(255, 184, 92, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y - 64, 14 + Math.sin(state.time * 3.2) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = cp.ignited ? '#FFB85C' : '#6A778B';
      ctx.beginPath();
      ctx.moveTo(cp.x, cp.y - 72);
      ctx.lineTo(cp.x + 6.5, cp.y - 64);
      ctx.lineTo(cp.x, cp.y - 56);
      ctx.lineTo(cp.x - 6.5, cp.y - 64);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawInteractableNodes(state: RenderFrameState): void {
    const { ctx } = this;
    for (const n of state.nodes) {
      if (Math.abs(n.x - state.cameraX) > 900) continue;

      ctx.fillStyle = '#0e1218';
      ctx.fillRect(n.x - 20, n.y - 6, 40, 6);
      ctx.fillStyle = '#151a22';
      ctx.beginPath();
      ctx.moveTo(n.x - 16, n.y - 6);
      ctx.lineTo(n.x + 16, n.y - 6);
      ctx.lineTo(n.x + 11, n.y - 26);
      ctx.lineTo(n.x - 11, n.y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = n.activated ? 'rgba(124, 224, 168, 0.35)' : 'rgba(245, 166, 66, 0.32)';
      ctx.fillRect(n.x - 9, n.y - 26, 18, 2);

      const hover = Math.sin(state.time * 2.8 + n.x * 0.01) * 4;
      const isNearby = state.nearbyNodeId === n.id;
      const cy = n.y - 46 + hover;
      const activeCol = n.activated
        ? '#7CE0A8'
        : n.type === 'FREQUENCY_SWITCH'
        ? '#FF9642'
        : '#F5A642';

      const halo = ctx.createRadialGradient(n.x, cy, 2, n.x, cy, isNearby ? 84 : 56);
      halo.addColorStop(
        0,
        n.activated ? 'rgba(124, 224, 168, 0.58)' : 'rgba(245, 166, 66, 0.6)'
      );
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(n.x, cy, isNearby ? 84 : 56, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(n.x, cy);
      ctx.rotate(state.time * (n.activated ? 0.6 : 1.1));
      ctx.strokeStyle = n.activated ? 'rgba(124, 224, 168, 0.45)' : 'rgba(245, 166, 66, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 17, Math.PI * 1.45, Math.PI * 1.9);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = activeCol;
      ctx.beginPath();
      ctx.moveTo(n.x, cy - 14);
      ctx.lineTo(n.x + 9, cy);
      ctx.lineTo(n.x, cy + 14);
      ctx.lineTo(n.x - 9, cy);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawEcoMemories(state: RenderFrameState): void {
    const { ctx } = this;
    const isEcho = state.resonance === 'ECO';
    for (const mem of state.memories) {
      if (Math.abs(mem.x - state.cameraX) > 900) continue;
      if (!isEcho && !mem.discovered) {
        ctx.fillStyle = 'rgba(229, 152, 56, 0.08)';
        ctx.fillRect(mem.x - 3, mem.y - 46, 6, 46);
        continue;
      }

      const alpha = isEcho ? (mem.discovered ? 0.44 : 0.78) : 0.15;
      const bob = Math.sin(state.time * 2.1 + mem.x * 0.02) * 2.2;
      ctx.save();
      ctx.translate(mem.x, mem.y + bob);

      const g = ctx.createRadialGradient(0, -28, 4, 0, -28, 48);
      g.addColorStop(0, `rgba(245, 178, 86, ${alpha * 0.5})`);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-48, -76, 96, 80);

      ctx.fillStyle = `rgba(255, 206, 130, ${alpha})`;
      if (mem.pose === 'kneeling') {
        ctx.beginPath();
        ctx.arc(2, -31, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(8, 0);
        ctx.lineTo(6, -17);
        ctx.lineTo(1, -26);
        ctx.lineTo(-5, -24);
        ctx.lineTo(-8, -12);
        ctx.closePath();
        ctx.fill();
      } else if (mem.pose === 'converged') {
        for (const offset of [-8, 8]) {
          ctx.beginPath();
          ctx.arc(offset, -46, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(offset - 4.5, -40, 9, 38);
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, -47, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(4.5, -41);
        ctx.lineTo(-4.5, -41);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawCreatures(state: RenderFrameState): void {
    const { ctx } = this;
    for (const cr of state.creatures) {
      if (Math.abs(cr.x - state.cameraX) > 950) continue;
      ctx.save();
      ctx.translate(cr.x, cr.y);

      const calmed = cr.state === 'calmed';
      const alert = cr.state === 'alert';
      const phased = cr.state === 'phased';

      if (cr.kind === 'veil_wisp') {
        // Hovering obsidian-amber sentinel with 3 trailing tendrils + scan cone
        const aura = ctx.createRadialGradient(0, -18, 2, 0, -18, calmed ? 36 : 48);
        aura.addColorStop(
          0,
          calmed
            ? 'rgba(245, 185, 88, 0.55)'
            : phased
            ? 'rgba(130, 145, 175, 0.25)'
            : alert
            ? 'rgba(255, 110, 48, 0.72)'
            : 'rgba(229, 152, 56, 0.45)'
        );
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, -18, 48, 0, Math.PI * 2);
        ctx.fill();

        if (!calmed && !phased) {
          ctx.fillStyle = alert ? 'rgba(255, 118, 48, 0.14)' : 'rgba(229, 152, 56, 0.08)';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(cr.facing * 52, 24);
          ctx.lineTo(cr.facing * 12, 28);
          ctx.closePath();
          ctx.fill();
        }

        // Core obsidian shard
        ctx.fillStyle = phased ? 'rgba(20, 24, 34, 0.45)' : '#0f131a';
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(9, -18);
        ctx.lineTo(0, -4);
        ctx.lineTo(-9, -18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = calmed ? '#FFD28C' : alert ? '#FF7838' : '#E59838';
        ctx.beginPath();
        ctx.arc(0, -18, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Tendrils
        ctx.strokeStyle = 'rgba(20, 26, 36, 0.85)';
        ctx.lineWidth = 1.8;
        for (let t = -1; t <= 1; t++) {
          const sway = Math.sin(state.time * 4.2 + t + cr.phase) * 5;
          ctx.beginPath();
          ctx.moveTo(t * 4, -8);
          ctx.quadraticCurveTo(t * 6 + sway, 4, t * 5 - sway, 16);
          ctx.stroke();
        }
      } else if (cr.kind === 'hollow_warden') {
        // Tall articulated armored figure with hollow unlit chest cavity
        ctx.scale(cr.facing, 1);
        const step = calmed ? 0 : Math.sin(state.time * 3.4 + cr.phase) * 5;
        ctx.strokeStyle = '#0e1218';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-4, -26);
        ctx.lineTo(-4 - step, 0);
        ctx.moveTo(4, -26);
        ctx.lineTo(4 + step, 0);
        ctx.stroke();

        // Torso with hollow center ring
        ctx.fillStyle = '#141922';
        ctx.fillRect(-10, -64, 20, 38);
        ctx.fillStyle = calmed ? 'rgba(255, 198, 108, 0.55)' : alert ? 'rgba(255, 110, 42, 0.65)' : 'rgba(8, 10, 14, 0.9)';
        ctx.beginPath();
        ctx.arc(0, -46, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = calmed ? 'rgba(255, 198, 108, 0.6)' : 'rgba(130, 145, 175, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Bowed head
        ctx.fillStyle = '#181e2a';
        ctx.beginPath();
        ctx.ellipse(2, -72 + (calmed ? 3 : 0), 6, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Archive Stalker: low quadrupedal mineral construct
        ctx.scale(cr.facing, 1);
        const stride = Math.sin(state.time * (alert ? 12 : 5) + cr.phase) * 6;
        ctx.strokeStyle = '#12161e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(-12 - stride, 0);
        ctx.moveTo(10, -14);
        ctx.lineTo(12 + stride, 0);
        ctx.stroke();
        ctx.fillStyle = '#161b24';
        ctx.beginPath();
        ctx.ellipse(0, -17, 16, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = alert ? '#FF7034' : calmed ? '#FFD28A' : '#E59838';
        ctx.beginPath();
        ctx.arc(11, -18, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawProtagonistGroundShadowAndLight(state: RenderFrameState): void {
    const { ctx } = this;
    const px = state.player.x + state.player.w * 0.5;
    const feetY = state.player.y + state.player.h;

    let groundY: number | null = null;
    for (const p of state.platforms) {
      if (px < p.curX - 8 || px > p.curX + p.w + 8) continue;
      if (p.mode === 'ECHO_ONLY' && state.resonance !== 'ECO') continue;
      if (p.mode === 'PRESENT_ONLY' && state.resonance !== 'PRESENTE') continue;
      if (p.curY >= feetY - 6 && (groundY === null || p.curY < groundY)) {
        groundY = p.curY;
      }
    }

    if (groundY !== null) {
      const dist = Math.max(0, groundY - feetY);
      if (dist < 220) {
        const fade = Math.max(0, 1 - dist / 220);
        const rx = 14 + dist * 0.06;
        ctx.fillStyle = `rgba(2, 3, 5, ${0.6 * fade})`;
        ctx.beginPath();
        ctx.ellipse(px, groundY + 1.5, rx, 3.6, 0, 0, Math.PI * 2);
        ctx.fill();

        const lightRad = 92 + state.resonanceFlare * 48;
        const pool = ctx.createRadialGradient(px, groundY, 2, px, groundY, lightRad);
        pool.addColorStop(
          0,
          state.resonance === 'RUPTURA'
            ? `rgba(255, 130, 55, ${0.26 * fade})`
            : `rgba(240, 165, 68, ${0.22 * fade})`
        );
        pool.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pool;
        ctx.fillRect(px - lightRad, groundY - 22, lightRad * 2, 44);
      }
    }
  }

  private drawProtagonist(state: RenderFrameState): void {
    const { ctx } = this;
    const pl = state.player;
    const cx = pl.x + pl.w * 0.5;
    const feetY = pl.y + pl.h;
    const speed = Math.abs(pl.vx);
    const speedRatio = Math.min(1, speed / 345);
    const dir = pl.facing;
    const dyingFade = pl.dyingTimer > 0 ? Math.max(0.1, pl.dyingTimer / 0.8) : 1;
    const crouchDrop =
      (pl.crouching ? 11.5 : 0) + pl.landCrouch * 6.5 + (1 - pl.awakenProgress) * 14.5;

    ctx.save();
    ctx.globalAlpha = dyingFade;

    if (pl.cloak.length >= 2) {
      ctx.save();
      const topY = pl.cloak[0].y;
      const tail = pl.cloak[pl.cloak.length - 1];
      const cloakGrad = ctx.createLinearGradient(pl.cloak[0].x, topY, tail.x, tail.y + 18);
      cloakGrad.addColorStop(0, '#10141c');
      cloakGrad.addColorStop(1, '#080a0f');
      ctx.fillStyle = cloakGrad;
      ctx.beginPath();
      ctx.moveTo(pl.cloak[0].x, pl.cloak[0].y);
      for (let i = 1; i < pl.cloak.length; i++) {
        ctx.lineTo(pl.cloak[i].x, pl.cloak[i].y);
      }
      for (let i = pl.cloak.length - 1; i >= 0; i--) {
        ctx.lineTo(pl.cloak[i].x - dir * (3.5 + i * 1.85), pl.cloak[i].y + 8.5 + i * 1.9);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(cx, feetY);
    const baseLean = pl.climbing
      ? 0
      : pl.onFloor
      ? (state.isRunning ? 0.1 : pl.pushing ? 0.16 : 0.05) * speedRatio * dir
      : Math.max(-0.15, Math.min(0.15, pl.vy * 0.00024)) * dir;
    const awakenLean = (1 - pl.awakenProgress) * 0.28 * dir;
    ctx.rotate(baseLean + awakenLean);
    ctx.scale(dir * pl.squashX, pl.squashY);

    const breathe =
      pl.onFloor && speed < 15
        ? Math.sin(state.time * 2.3) * 1.1
        : Math.abs(Math.sin(pl.walkCycle * 2)) * 1.6;
    const hipY = -21.5 + crouchDrop + breathe * 0.35;
    const shY = -39 + crouchDrop * 0.92 + breathe * 0.55;

    const strideX = Math.sin(pl.walkCycle) * (state.isRunning ? 10.5 : 7.2) * speedRatio;
    const liftL = Math.max(0, Math.cos(pl.walkCycle)) * (state.isRunning ? 6.2 : 4.2) * speedRatio;
    const liftR = Math.max(0, -Math.cos(pl.walkCycle)) * (state.isRunning ? 6.2 : 4.2) * speedRatio;

    const solveIK = (
      x0: number,
      y0: number,
      xt: number,
      yt: number,
      l1: number,
      l2: number,
      bendSign: number
    ): [number, number, number, number] => {
      const dx = xt - x0;
      const dy = yt - y0;
      const maxReach = l1 + l2 - 0.4;
      const minReach = Math.abs(l1 - l2) + 0.4;
      const rawDist = Math.hypot(dx, dy) || 0.001;
      const dist = Math.max(minReach, Math.min(maxReach, rawDist));
      const scale = dist / rawDist;
      const ex = x0 + dx * scale;
      const ey = y0 + dy * scale;
      const cosA = Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)));
      const baseAngle = Math.atan2(ey - y0, ex - x0);
      const kneeAngle = baseAngle + bendSign * Math.acos(cosA);
      return [x0 + Math.cos(kneeAngle) * l1, y0 + Math.sin(kneeAngle) * l1, ex, ey];
    };

    const drawLimb = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      width: number,
      color: string,
      withBoot?: boolean
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (withBoot) {
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + 3.8, y2 + 0.2);
        ctx.stroke();
      }
    };

    if (pl.awakenProgress < 0.96) {
      const [kx1, ky1, fx1, fy1] = solveIK(-2, hipY, -9, -1, 11.5, 11.5, 1);
      drawLimb(-2, hipY, kx1, ky1, fx1, fy1, 4.1, '#090b10', true);
      const [kx2, ky2, fx2, fy2] = solveIK(2, hipY, 7, 0, 11.5, 11.5, -1);
      drawLimb(2, hipY, kx2, ky2, fx2, fy2, 4.3, '#10141d', true);
    } else if (pl.climbing) {
      const climbAlt = Math.sin(pl.walkCycle) * 5;
      const [kxL, kyL, fxL, fyL] = solveIK(-1.5, hipY, 2, -2 + climbAlt, 11.8, 11.8, -1);
      drawLimb(-1.5, hipY, kxL, kyL, fxL, fyL, 4.1, '#090b10', true);
    } else if (pl.onFloor) {
      const [kxL, kyL, fxL, fyL] = solveIK(-1.5, hipY, -strideX, -liftL, 11.8, 11.8, -1);
      drawLimb(-1.5, hipY, kxL, kyL, fxL, fyL, 4.1, '#090b10', true);
    } else {
      const tuck = Math.max(-3.5, Math.min(5.5, -pl.vy * 0.01));
      const [kxL, kyL, fxL, fyL] = solveIK(-2, hipY, -6.5, -3.5 - tuck, 11.8, 11.8, -1);
      drawLimb(-2, hipY, kxL, kyL, fxL, fyL, 4.1, '#090b10', true);
    }

    const armSwing = pl.climbing
      ? Math.sin(pl.walkCycle) * 7
      : Math.sin(pl.walkCycle) * (state.isRunning ? 9 : 6.2) * speedRatio;
    const backHandX = pl.pushing ? 9 : pl.climbing ? 4 : -3 - armSwing;
    const backHandY = pl.pushing ? shY + 6 : pl.climbing ? shY - 6 + armSwing : shY + 17.5;
    const [exL, eyL, hxL, hyL] = solveIK(-2, shY + 2, backHandX, backHandY, 9.5, 9.5, 1);
    drawLimb(-2, shY + 2, exL, eyL, hxL, hyL, 3.1, '#0b0e14');

    ctx.fillStyle = '#131720';
    ctx.beginPath();
    ctx.moveTo(-6, shY);
    ctx.lineTo(5.8, shY);
    ctx.lineTo(4.4, hipY + 1.5);
    ctx.lineTo(-4.4, hipY + 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#181d28';
    ctx.fillRect(-5.5, shY - 2, 9.5, 3);
    ctx.fillStyle = '#131720';
    ctx.fillRect(-2, shY - 4.5, 4, 4.5);

    const headX = speedRatio * 1.4;
    const headY = shY - 8.5;
    ctx.fillStyle = '#181d28';
    ctx.beginPath();
    ctx.ellipse(headX, headY, 4.8, 5.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 178, 86, 0.28)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(headX, headY, 4.6, -Math.PI * 0.35, Math.PI * 0.42);
    ctx.stroke();

    if (pl.awakenProgress >= 0.96) {
      if (pl.climbing) {
        const climbAlt = Math.sin(pl.walkCycle) * 5;
        const [kxR, kyR, fxR, fyR] = solveIK(1.5, hipY, 4, -2 - climbAlt, 11.8, 11.8, -1);
        drawLimb(1.5, hipY, kxR, kyR, fxR, fyR, 4.3, '#10141d', true);
      } else if (pl.onFloor) {
        const [kxR, kyR, fxR, fyR] = solveIK(1.5, hipY, strideX, -liftR, 11.8, 11.8, -1);
        drawLimb(1.5, hipY, kxR, kyR, fxR, fyR, 4.3, '#10141d', true);
      } else {
        const tuck = Math.max(-3.5, Math.min(5.5, -pl.vy * 0.01));
        const [kxR, kyR, fxR, fyR] = solveIK(2, hipY, 4.2, -4.5 - tuck, 11.8, 11.8, -1);
        drawLimb(2, hipY, kxR, kyR, fxR, fyR, 4.3, '#10141d', true);
      }
    }

    const reach = state.interactPulse * 10.5;
    const awakenBrace = (1 - pl.awakenProgress) * 9;
    const frontHandX = pl.pushing
      ? 11
      : pl.climbing
      ? 4
      : 3 + armSwing + reach + awakenBrace * 0.6;
    const frontHandY = pl.pushing
      ? shY + 5
      : pl.climbing
      ? shY - 6 - armSwing
      : shY + 17.5 - reach * 0.65 + awakenBrace * 0.35;
    const [exR, eyR, hxR, hyR] = solveIK(2, shY + 2, frontHandX, frontHandY, 9.5, 9.5, 1);
    drawLimb(2, shY + 2, exR, eyR, hxR, hyR, 3.3, '#171c27');

    ctx.fillStyle = 'rgba(255, 188, 92, 0.25)';
    ctx.fillRect(3.6, shY + 1, 1.5, 12);

    const coreX = 2.6;
    const coreY = shY + 6.5;
    const awakenGlow = 0.45 + 0.55 * pl.awakenProgress;
    const statePulse =
      state.resonance === 'RUPTURA'
        ? 1 + 0.25 * Math.sin(state.time * 8.2)
        : state.resonance === 'ECO'
        ? 1 + 0.18 * Math.sin(state.time * 4.5)
        : 1 + 0.12 * Math.sin(state.time * 2.6);
    const flare = 1 + state.resonanceFlare * 1.4;
    const coreRad = 18 * statePulse * flare * awakenGlow;

    const coreGrad = ctx.createRadialGradient(coreX, coreY, 0.5, coreX, coreY, coreRad);
    coreGrad.addColorStop(0, 'rgba(255, 240, 200, 0.98)');
    coreGrad.addColorStop(
      0.35,
      state.resonance === 'RUPTURA' ? 'rgba(255, 128, 48, 0.85)' : 'rgba(240, 165, 68, 0.78)'
    );
    coreGrad.addColorStop(1, 'rgba(240, 165, 68, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(coreX, coreY, coreRad, 0, Math.PI * 2);
    ctx.fill();

    // Resonance Rejection Pulse Ring
    if (pl.resonanceRejectTimer > 0) {
      ctx.strokeStyle = `rgba(255, 108, 62, ${pl.resonanceRejectTimer * 2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, shY + 8, 22 + (0.45 - pl.resonanceRejectTimer) * 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  private drawFallingLeaves(state: RenderFrameState): void {
    if (state.quality === 'low') return;
    const { ctx } = this;
    ctx.fillStyle =
      state.chapterNumber === 6 ? 'rgba(245, 188, 92, 0.68)' : 'rgba(130, 142, 134, 0.45)';
    for (const leaf of state.leaves) {
      if (Math.abs(leaf.x - state.cameraX) > 950) continue;
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(Math.sin(state.time * 2 + leaf.phase) * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawParticlesAndShockwave(state: RenderFrameState): void {
    const { ctx } = this;
    for (const pt of state.particles) {
      const ratio = pt.life / pt.maxLife;
      const alpha = Math.sin(ratio * Math.PI);
      if (pt.color === 'spark') {
        ctx.strokeStyle = `rgba(255, 194, 96, ${alpha * 0.9})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - pt.vx * 0.032, pt.y - pt.vy * 0.032);
        ctx.stroke();
      } else if (pt.color === 'splash') {
        ctx.fillStyle = `rgba(175, 208, 242, ${alpha * 0.78})`;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, pt.size * 0.75, pt.size * 1.35, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.color === 'dust') {
        ctx.fillStyle = `rgba(148, 162, 184, ${alpha * 0.38})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * (1 + ratio * 0.65), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle =
          pt.color === 'amber'
            ? `rgba(245, 170, 72, ${alpha * 0.68})`
            : `rgba(175, 195, 224, ${alpha * 0.44})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (state.shockwave.active) {
      ctx.strokeStyle =
        state.resonance === 'RUPTURA'
          ? `rgba(255, 134, 54, ${state.shockwave.alpha})`
          : `rgba(242, 174, 80, ${state.shockwave.alpha})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(state.shockwave.x, state.shockwave.y, state.shockwave.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawSceneAnimationWorldFx(state: RenderFrameState): void {
    const anim = state.sceneAnimation;
    if (!anim || anim.kind === 'NONE' || anim.duration <= 0) return;
    const { ctx } = this;
    const p = Math.min(1, anim.timer / anim.duration);

    if (anim.kind === 'THRESHOLD_ASCEND' || anim.kind === 'CAMPAIGN_FINALE') {
      const colW = (anim.kind === 'CAMPAIGN_FINALE' ? 180 : 110) + p * 85;
      const g = ctx.createLinearGradient(anim.focusX - colW, 0, anim.focusX + colW, 0);
      g.addColorStop(0, 'rgba(255, 185, 92, 0)');
      g.addColorStop(
        0.5,
        `rgba(255, 214, 148, ${(anim.kind === 'CAMPAIGN_FINALE' ? 0.42 : 0.26) * Math.sin(p * Math.PI)})`
      );
      g.addColorStop(1, 'rgba(255, 185, 92, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(anim.focusX - colW, anim.focusY - 360, colW * 2, 720);
    } else if (anim.kind === 'UNLOCK_STATE' || anim.kind === 'MEMORY_VISION') {
      const px = state.player.x + state.player.w * 0.5;
      const py = state.player.y + 22;
      const rad = 52 * (1 - p) + 8;
      ctx.strokeStyle = `rgba(255, 188, 92, ${0.7 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawSceneLetterbox(state: RenderFrameState, w: number, h: number): void {
    const anim = state.sceneAnimation;
    if (!anim || anim.kind === 'NONE' || anim.kind === 'UNLOCK_STATE' || anim.duration <= 0) return;
    const p = Math.min(1, anim.timer / anim.duration);
    const barFrac = p < 0.18 ? p / 0.18 : p > 0.82 ? (1 - p) / 0.18 : 1;
    const barH = Math.round(34 * Math.max(0, Math.min(1, barFrac)));
    if (barH <= 0) return;
    this.ctx.fillStyle = 'rgba(3, 4, 7, 0.92)';
    this.ctx.fillRect(0, 0, w, barH);
    this.ctx.fillRect(0, h - barH, w, barH);
  }

  private drawCinematicVignette(state: RenderFrameState, w: number, h: number): void {
    const { ctx } = this;
    const vig = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      Math.min(w, h) * 0.34,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.74
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(
      1,
      state.resonance === 'RUPTURA' ? 'rgba(18, 6, 3, 0.62)' : 'rgba(3, 4, 7, 0.62)'
    );
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }
}

function ctx_createSky(
  ctx: CanvasRenderingContext2D,
  h: number,
  resonance: ResonanceState,
  chapterNumber: ChapterNumber
): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  if (chapterNumber === 6) {
    g.addColorStop(0, '#0d0c11');
    g.addColorStop(0.55, '#191519');
    g.addColorStop(1, '#0c090a');
  } else if (resonance === 'ECO') {
    g.addColorStop(0, '#09090d');
    g.addColorStop(0.55, '#121218');
    g.addColorStop(1, '#080708');
  } else if (resonance === 'RUPTURA') {
    g.addColorStop(0, '#0a0709');
    g.addColorStop(0.55, '#151014');
    g.addColorStop(1, '#090608');
  } else {
    g.addColorStop(0, '#06070a');
    g.addColorStop(0.55, '#0c1017');
    g.addColorStop(1, '#050608');
  }
  return g;
}
