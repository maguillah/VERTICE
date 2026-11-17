import { audioEngine } from './audioEngine';
import { VerticeRenderer2D } from './renderer2D';
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
  GameSettings,
  HazardZone,
  HudSnapshot,
  InteractableNode,
  Particle,
  Platform,
  PlayerState,
  PushBlock,
  ResonanceState,
  SaveData,
  SceneAnimationKind,
  SceneAnimationState,
  SpatialGate,
  SurfaceMaterial,
  TouchInputState,
  VegetationTuft,
  WaterPool,
  WaterSplashRipple,
} from './types';
import {
  CHAPTER_CATALOG,
  createChapterGeometry,
  getChapterAreas,
} from './worldData';

const SAVE_STORAGE_KEY = 'vertice_chapter1_save_v2';

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const ch = Math.max(1, Math.min(6, Number(parsed.chapterNumber || 1))) as ChapterNumber;
      const completedSet = new Set<ChapterNumber>(
        Array.isArray(parsed.completedChapters) ? parsed.completedChapters : []
      );
      if (parsed.chapter1Completed) completedSet.add(1);
      if (parsed.chapter2Completed) completedSet.add(2);

      let unlocked = Number(parsed.unlockedChapter || 1);
      if (completedSet.has(1)) unlocked = Math.max(unlocked, 2);
      if (completedSet.has(2)) unlocked = Math.max(unlocked, 3);
      if (completedSet.has(3)) unlocked = Math.max(unlocked, 4);
      if (completedSet.has(4)) unlocked = Math.max(unlocked, 5);
      if (completedSet.has(5)) unlocked = Math.max(unlocked, 6);
      unlocked = Math.max(unlocked, ch);
      const clampedUnlocked = Math.max(1, Math.min(6, unlocked)) as ChapterNumber;

      return {
        hasSave: Boolean(parsed.hasSave),
        chapterNumber: ch,
        unlockedChapter: clampedUnlocked,
        completedChapters: Array.from(completedSet),
        areaId: Number(parsed.areaId || 1),
        checkpointId: parsed.checkpointId || 'cp_c1_start',
        checkpointX: Number(parsed.checkpointX ?? 160),
        checkpointY: Number(parsed.checkpointY ?? 480),
        unlockedEcho: Boolean(parsed.unlockedEcho),
        unlockedRuptura: Boolean(parsed.unlockedRuptura),
        resonanceState: parsed.resonanceState || 'PRESENTE',
        rupturaEnergy: typeof parsed.rupturaEnergy === 'number' ? parsed.rupturaEnergy : 1,
        frequencySwitchActive: Boolean(parsed.frequencySwitchActive),
        puzzleAnchors: Array.isArray(parsed.puzzleAnchors) ? parsed.puzzleAnchors : [],
        discoveredMemories: Array.isArray(parsed.discoveredMemories) ? parsed.discoveredMemories : [],
        chapter1Completed: Boolean(parsed.chapter1Completed || completedSet.has(1)),
        chapter2Completed: Boolean(parsed.chapter2Completed || completedSet.has(2)),
      };
    }
  } catch {
    // ignore storage parse failure
  }
  return {
    hasSave: false,
    chapterNumber: 1,
    unlockedChapter: 1,
    completedChapters: [],
    areaId: 1,
    checkpointId: 'cp_c1_start',
    checkpointX: 160,
    checkpointY: 480,
    unlockedEcho: false,
    unlockedRuptura: false,
    resonanceState: 'PRESENTE',
    rupturaEnergy: 1,
    frequencySwitchActive: false,
    puzzleAnchors: [],
    discoveredMemories: [],
    chapter1Completed: false,
    chapter2Completed: false,
  };
}

function persistSaveData(save: SaveData): void {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
  } catch {
    // ignore quota errors
  }
}

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onChapterComplete: () => void;
  onReturnToTitle?: () => void;
  onAutoQualityStepDown?: (newQuality: 'low' | 'medium') => void;
}

export class VerticeGameEngine {
  private canvas: HTMLCanvasElement;
  private renderer2D: VerticeRenderer2D;
  private callbacks: EngineCallbacks;
  private settings: GameSettings;

  private rafId: number | null = null;
  private destroyed = false;
  private lastTimestamp = 0;
  private elapsedTime = 0;
  private paused = true;
  private titlePanMode = true;

  private chapterNumber: ChapterNumber = 1;
  private unlockedChapter: ChapterNumber = 1;
  private completedChapters = new Set<ChapterNumber>();
  private chapterCompleted = false;
  private preservedMemories = new Set<string>();
  private maxWorldX = 7010;

  private resonance: ResonanceState = 'PRESENTE';
  private unlockedEcho = false;
  private unlockedRuptura = false;
  private frequencySwitchActive = false;
  private rupturaEnergy = 1;
  private puzzleSolved = false;
  private currentAreaId = 1;
  private activeCheckpoint = { id: 'cp_c1_start', x: 160, y: 480 };
  private bannerNotice: string | null = null;
  private bannerTimer = 0;
  private resonanceNotice: string | null = null;
  private resonanceNoticeTimer = 0;

  private platforms: Platform[] = [];
  private gates: SpatialGate[] = [];
  private nodes: InteractableNode[] = [];
  private checkpoints: CheckpointData[] = [];
  private monoliths: BgMonolith[] = [];
  private memories: EchoMemory[] = [];
  private waterPools: WaterPool[] = [];
  private drips: DripSpot[] = [];
  private debris: FloatingDebris[] = [];
  private climbables: ClimbableZone[] = [];
  private pushBlocks: PushBlock[] = [];
  private hazards: HazardZone[] = [];
  private vegetation: VegetationTuft[] = [];
  private leaves: FallingLeaf[] = [];
  private creatures: Creature[] = [];
  private silhouettes: DistantSilhouette[] = [];
  private splashRipples: WaterSplashRipple[] = [];
  private particles: Particle[] = [];

  private player: PlayerState;
  private cameraX = 160;
  private cameraY = 340;
  private cameraZoom = 1.05;
  private shakeStrength = 0;
  private hitstopTimer = 0;
  private stepTimer = 0;
  private interactPulse = 0;
  private resonanceFlare = 0;
  private lastEnergyHud = 1;
  private isRunningNow = false;
  private particleSpawnTimer = 0;
  private pendingChapterComplete = false;
  private sceneAnimation: SceneAnimationState = {
    kind: 'NONE',
    timer: 0,
    duration: 0,
    focusX: 0,
    focusY: 0,
    targetZoom: 1.04,
  };

  private fpsAccumTime = 0;
  private fpsFrames = 0;
  private autoScaledOnce = false;

  private shockwave = {
    active: false,
    x: 0,
    y: 0,
    radius: 0,
    alpha: 0,
  };

  private heldKeys = new Set<string>();
  private jumpJustPressed = false;
  private jumpJustReleased = false;
  private interactJustPressed = false;
  private touchInput: TouchInputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    run: false,
    jumpHeld: false,
    jumpJustPressed: false,
    interactJustPressed: false,
  };

  private nearbyNodeId: string | null = null;
  private resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, settings: GameSettings, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.settings = settings;
    this.callbacks = callbacks;

    this.player = this.createPlayer(160, 420);
    this.loadChapterScene(1, false);

    this.renderer2D = new VerticeRenderer2D(canvas, settings.quality);

    this.resizeObserver = new ResizeObserver(() => {
      this.renderer2D.resize(
        this.canvas.clientWidth || window.innerWidth,
        this.canvas.clientHeight || window.innerHeight,
        this.settings.quality
      );
    });
    this.resizeObserver.observe(canvas);

    this.bindInput();
    this.startLoop();
  }

  private createPlayer(x: number, y: number, awakenProgress = 1): PlayerState {
    const cloak = Array.from({ length: 7 }, (_, i) => ({
      x: x + 10 - i * 3.4,
      y: y + 18 + i * 3.8,
    }));
    return {
      x,
      y,
      w: 20,
      h: 54,
      vx: 0,
      vy: 0,
      facing: 1,
      onFloor: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      squashX: 1,
      squashY: 1,
      walkCycle: 0,
      landCrouch: 0,
      awakenProgress,
      crouching: false,
      climbing: false,
      pushing: false,
      standingPlatformId: null,
      dyingTimer: 0,
      recoverTimer: 0,
      resonanceRejectTimer: 0,
      cloak,
    };
  }

  private startSceneAnimation(
    kind: SceneAnimationKind,
    duration: number,
    focusX: number,
    focusY: number,
    targetZoom: number
  ): void {
    this.sceneAnimation = {
      kind,
      timer: 0,
      duration,
      focusX,
      focusY,
      targetZoom,
    };
  }

  public startNewGame(): void {
    audioEngine.init();
    audioEngine.setSettings(this.settings.volume, this.settings.muted);
    this.completedChapters.clear();
    this.unlockedChapter = 1;
    this.preservedMemories.clear();
    persistSaveData({
      hasSave: false,
      chapterNumber: 1,
      unlockedChapter: 1,
      completedChapters: [],
      areaId: 1,
      checkpointId: 'cp_c1_start',
      checkpointX: 160,
      checkpointY: 480,
      unlockedEcho: false,
      unlockedRuptura: false,
      resonanceState: 'PRESENTE',
      rupturaEnergy: 1,
      frequencySwitchActive: false,
      puzzleAnchors: [],
      discoveredMemories: [],
      chapter1Completed: false,
      chapter2Completed: false,
    });
    this.startChapter(1, false);
  }

  public continueGame(): void {
    audioEngine.init();
    audioEngine.setSettings(this.settings.volume, this.settings.muted);
    const save = loadSaveData();
    this.unlockedChapter = save.unlockedChapter;
    this.completedChapters = new Set(save.completedChapters || []);
    this.preservedMemories = new Set(save.discoveredMemories || []);
    const targetChapter = save.hasSave ? save.chapterNumber : 1;
    this.loadChapterScene(targetChapter, save.hasSave, save);
    this.titlePanMode = false;
    this.paused = false;
    const areas = getChapterAreas(targetChapter);
    const areaInfo = areas.find((a) => a.id === this.currentAreaId) || areas[0];
    this.showBanner(`RETOMANDO CAP. ${CHAPTER_CATALOG[targetChapter].roman} · ${areaInfo.title.toUpperCase()}`);
    this.emitHud();
  }

  public startChapter(chapter: ChapterNumber, fromSave = false, save?: SaveData): void {
    audioEngine.init();
    audioEngine.setSettings(this.settings.volume, this.settings.muted);
    const existing = save || loadSaveData();
    this.unlockedChapter = Math.max(this.unlockedChapter, existing.unlockedChapter, chapter) as ChapterNumber;
    this.completedChapters = new Set(existing.completedChapters || []);
    for (const m of existing.discoveredMemories || []) {
      this.preservedMemories.add(m);
    }

    this.loadChapterScene(chapter, fromSave, existing);
    this.titlePanMode = false;
    this.paused = false;

    if (!fromSave) {
      this.player.awakenProgress = 0;
      this.cameraZoom = 1.24;
      this.cameraX = this.player.x + 10;
      this.cameraY = this.player.y - 10;
      this.startSceneAnimation('AWAKEN', 1.55, this.player.x + 28, this.player.y - 24, 1.04);
      const info = CHAPTER_CATALOG[chapter];
      this.showBanner(`CAPÍTULO ${info.roman} · ${info.title.toUpperCase()}`);
      this.saveCurrentProgress();
    }
    this.emitHud();
  }

  public enterChapter2Threshold(fromSave = false, save?: SaveData): void {
    this.startChapter(2, fromSave, save);
  }

  public advanceToNextChapter(): void {
    if (this.chapterNumber < 6) {
      const next = (this.chapterNumber + 1) as ChapterNumber;
      this.startChapter(next, false);
    } else {
      this.startChapter(1, false);
    }
  }

  private loadChapterScene(chapter: ChapterNumber, fromSave: boolean, save?: SaveData): void {
    const info = CHAPTER_CATALOG[chapter];
    const geom = createChapterGeometry(chapter);
    const areas = getChapterAreas(chapter);

    this.chapterNumber = chapter;
    this.platforms = geom.platforms;
    this.gates = geom.gates;
    this.nodes = geom.nodes;
    this.checkpoints = geom.checkpoints;
    this.monoliths = geom.monoliths;
    this.memories = geom.memories;
    this.waterPools = geom.waterPools;
    this.drips = geom.drips;
    this.debris = geom.debris;
    this.climbables = geom.climbables;
    this.pushBlocks = geom.pushBlocks;
    this.hazards = geom.hazards;
    this.vegetation = geom.vegetation;
    this.leaves = geom.leaves;
    this.creatures = geom.creatures;
    this.silhouettes = geom.silhouettes;
    this.maxWorldX = geom.maxWorldX;
    this.splashRipples = [];
    this.particles = [];

    this.chapterCompleted = false;
    this.pendingChapterComplete = false;
    this.bannerNotice = null;
    this.bannerTimer = 0;
    this.resonanceNotice = null;
    this.resonanceNoticeTimer = 0;
    this.nearbyNodeId = null;
    this.interactPulse = 0;
    this.resonanceFlare = 0;
    this.shockwave.active = false;
    this.sceneAnimation.kind = 'NONE';

    this.unlockedEcho = info.unlockedEcho;
    this.unlockedRuptura = info.unlockedRuptura;
    this.resonance = 'PRESENTE';
    this.rupturaEnergy = 1;
    this.puzzleSolved = false;
    this.frequencySwitchActive = false;

    for (const mem of this.memories) {
      if (this.preservedMemories.has(mem.id)) {
        mem.discovered = true;
      }
    }

    if (fromSave && save && save.chapterNumber === chapter) {
      const minArea = areas[0].id;
      const maxArea = areas[areas.length - 1].id;
      this.currentAreaId = Math.max(minArea, Math.min(maxArea, save.areaId || minArea));
      this.unlockedEcho = info.unlockedEcho || Boolean(save.unlockedEcho);
      this.unlockedRuptura = info.unlockedRuptura || Boolean(save.unlockedRuptura);
      this.frequencySwitchActive = Boolean(save.frequencySwitchActive);
      this.rupturaEnergy =
        typeof save.rupturaEnergy === 'number' ? Math.max(0, Math.min(1, save.rupturaEnergy)) : 1;

      this.activeCheckpoint = {
        id: save.checkpointId || info.defaultCheckpointId,
        x: save.checkpointX ?? info.defaultSpawnX,
        y: save.checkpointY ?? info.defaultSpawnY,
      };

      for (const n of this.nodes) {
        if (n.type === 'UNLOCK_ECO' && this.unlockedEcho) n.activated = true;
        if (n.type === 'UNLOCK_RUPTURA' && this.unlockedRuptura) n.activated = true;
        if (n.type === 'FREQUENCY_SWITCH' && this.frequencySwitchActive) n.activated = true;
        if (save.puzzleAnchors.includes(n.id)) n.activated = true;
      }
      const anchorCount = this.nodes.filter((n) => n.type === 'PUZZLE_ANCHOR' && n.activated).length;
      this.puzzleSolved = anchorCount >= info.requiredAnchors;

      for (const cp of this.checkpoints) {
        if (cp.id === this.activeCheckpoint.id || cp.areaId < this.currentAreaId) {
          cp.ignited = true;
        }
      }

      let restoredRes: ResonanceState = save.resonanceState || 'PRESENTE';
      if (restoredRes === 'ECO' && !this.unlockedEcho) restoredRes = 'PRESENTE';
      if (restoredRes === 'RUPTURA' && (!this.unlockedRuptura || this.rupturaEnergy < 0.14)) {
        restoredRes = 'PRESENTE';
      }
      this.resonance = restoredRes;

      for (const g of this.gates) {
        if (g.permanentOnPuzzle && this.puzzleSolved) {
          g.isOpen = true;
          g.curY = g.y + g.openDy;
        } else if (g.requiresFrequencySwitch) {
          g.isOpen = this.frequencySwitchActive && this.resonance === 'RUPTURA';
          g.curY = g.y + (g.isOpen ? g.openDy : 0);
        }
      }

      this.player = this.createPlayer(this.activeCheckpoint.x, this.activeCheckpoint.y - 56, 1);
    } else {
      this.currentAreaId = areas[0].id;
      this.activeCheckpoint = {
        id: info.defaultCheckpointId,
        x: info.defaultSpawnX,
        y: info.defaultSpawnY,
      };
      this.player = this.createPlayer(info.defaultSpawnX, info.defaultSpawnY - 56, 1);
    }

    audioEngine.setChapterMood(chapter);
    audioEngine.setResonanceMood(this.resonance);
    this.cameraX = this.player.x + 80;
    this.cameraY = this.player.y - 36;
  }

  public returnToTitle(): void {
    this.titlePanMode = true;
    this.paused = true;
  }

  public setPaused(p: boolean): void {
    this.paused = p;
    this.heldKeys.clear();
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    audioEngine.setSettings(settings.volume, settings.muted);
    this.renderer2D.resize(
      this.canvas.clientWidth || window.innerWidth,
      this.canvas.clientHeight || window.innerHeight,
      settings.quality
    );
  }

  public setTouchInput(partial: Partial<TouchInputState>): void {
    if (partial.jumpJustPressed) this.touchInput.jumpJustPressed = true;
    if (partial.interactJustPressed) this.touchInput.interactJustPressed = true;
    if (partial.left !== undefined) this.touchInput.left = partial.left;
    if (partial.right !== undefined) this.touchInput.right = partial.right;
    if (partial.up !== undefined) this.touchInput.up = partial.up;
    if (partial.down !== undefined) this.touchInput.down = partial.down;
    if (partial.run !== undefined) this.touchInput.run = partial.run;
    if (partial.jumpHeld !== undefined) {
      if (this.touchInput.jumpHeld && !partial.jumpHeld) {
        this.jumpJustReleased = true;
      }
      this.touchInput.jumpHeld = partial.jumpHeld;
    }
  }

  public setResonanceState(target: ResonanceState, bypassGuard = false): void {
    if (this.titlePanMode || this.paused) return;
    if (this.player.dyingTimer > 0) return;
    if (target === this.resonance) return;
    if (target === 'ECO' && !this.unlockedEcho) return;
    if (target === 'RUPTURA' && (!this.unlockedRuptura || this.rupturaEnergy < 0.14)) return;

    // Safety guard: never allow switching into a state where a wall/barrier would crush/overlap player
    if (!bypassGuard && this.wouldOverlapInState(target)) {
      this.player.resonanceRejectTimer = 0.45;
      this.resonanceNotice = 'Ressonância bloqueada · estrutura ocuparia este espaço';
      this.resonanceNoticeTimer = 2.1;
      audioEngine.playResonanceReject();
      this.emitHud();
      return;
    }

    this.resonance = target;
    this.resonanceFlare = 1.0;
    this.resonanceNotice = null;
    this.resonanceNoticeTimer = 0;
    audioEngine.playStateShift(target);
    audioEngine.setResonanceMood(target);

    this.shockwave = {
      active: true,
      x: this.player.x + this.player.w * 0.5,
      y: this.player.y + 20,
      radius: 10,
      alpha: 0.9,
    };

    if (target === 'RUPTURA') {
      this.shakeStrength = Math.max(this.shakeStrength, 7.5);
      this.hitstopTimer = 0.04;
    } else if (target === 'ECO') {
      this.shakeStrength = Math.max(this.shakeStrength, 3);
    }

    if (loadSaveData().hasSave) {
      this.saveCurrentProgress();
    }

    this.emitHud();
  }

  private wouldOverlapInState(target: ResonanceState): boolean {
    const colliders = this.getCollidersForState(target);
    for (const c of colliders) {
      if (
        this.aabbOverlap(
          this.player.x + 2,
          this.player.y + 2,
          this.player.w - 4,
          this.player.h - 4,
          c.x,
          c.y,
          c.w,
          c.h
        )
      ) {
        return true;
      }
    }
    return false;
  }

  private showBanner(msg: string): void {
    this.bannerNotice = msg;
    this.bannerTimer = 3.4;
    this.emitHud();
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.jumpJustPressed = true;
      }
      if (e.code === 'KeyE') {
        this.interactJustPressed = true;
      }
      if (e.code === 'Digit1') this.setResonanceState('PRESENTE');
      if (e.code === 'Digit2') this.setResonanceState('ECO');
      if (e.code === 'Digit3') this.setResonanceState('RUPTURA');
    }
    this.heldKeys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.heldKeys.delete(e.code);
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      this.jumpJustReleased = true;
    }
  };

  private handleBlur = (): void => {
    this.heldKeys.clear();
    this.touchInput.left = false;
    this.touchInput.right = false;
    this.touchInput.up = false;
    this.touchInput.down = false;
    this.touchInput.run = false;
    this.touchInput.jumpHeld = false;
  };

  private bindInput(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public destroy(): void {
    this.destroyed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private startLoop(): void {
    this.lastTimestamp = performance.now();
    const tick = () => {
      if (this.destroyed) return;
      const now = performance.now();
      const rawDt = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      this.monitorFps(rawDt);
      this.update(dt);
      this.draw();

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private monitorFps(rawDt: number): void {
    if (this.paused || this.titlePanMode || this.autoScaledOnce || this.settings.quality === 'low') {
      return;
    }
    this.fpsAccumTime += rawDt;
    this.fpsFrames += 1;
    if (this.fpsAccumTime >= 2.5) {
      const avgFps = this.fpsFrames / this.fpsAccumTime;
      this.fpsAccumTime = 0;
      this.fpsFrames = 0;
      if (avgFps < 24) {
        this.autoScaledOnce = true;
        const nextQ = this.settings.quality === 'high' ? 'medium' : 'low';
        this.settings = { ...this.settings, quality: nextQ };
        this.renderer2D.resize(
          this.canvas.clientWidth || window.innerWidth,
          this.canvas.clientHeight || window.innerHeight,
          nextQ
        );
        this.callbacks.onAutoQualityStepDown?.(nextQ);
      }
    }
  }

  private update(dt: number): void {
    this.elapsedTime += dt;
    this.interactPulse = Math.max(0, this.interactPulse - dt * 2.6);
    this.resonanceFlare = Math.max(0, this.resonanceFlare - dt * 2.2);
    this.player.resonanceRejectTimer = Math.max(0, this.player.resonanceRejectTimer - dt);
    this.player.recoverTimer = Math.max(0, this.player.recoverTimer - dt);

    this.updateParticles(dt);
    this.updateLeavesAndRipples(dt);

    if (this.titlePanMode) {
      this.cameraX = 480 + Math.sin(this.elapsedTime * 0.14) * 220;
      this.cameraY = 350 + Math.cos(this.elapsedTime * 0.1) * 14;
      this.cameraZoom = 1.04;
      return;
    }

    if (this.paused) return;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.bannerNotice = null;
        this.emitHud();
      }
    }

    if (this.resonanceNoticeTimer > 0) {
      this.resonanceNoticeTimer -= dt;
      if (this.resonanceNoticeTimer <= 0) {
        this.resonanceNotice = null;
        this.emitHud();
      }
    }

    // Death/Dissolve recovery flow
    if (this.player.dyingTimer > 0) {
      this.player.dyingTimer = Math.max(0, this.player.dyingTimer - dt);
      if (Math.random() < 0.7) {
        this.spawnParticle(
          this.player.x + this.player.w * 0.5 + (Math.random() - 0.5) * 18,
          this.player.y + 12 + Math.random() * 34,
          (Math.random() - 0.5) * 45,
          -35 - Math.random() * 55,
          0.55,
          2.1,
          Math.random() < 0.5 ? 'amber' : 'mist'
        );
      }
      if (this.player.dyingTimer <= 0) {
        this.finishDeathRespawn();
      }
      this.updateCamera(dt);
      return;
    }

    // Ruptura energy management
    if (this.resonance === 'RUPTURA') {
      this.rupturaEnergy = Math.max(0, this.rupturaEnergy - 0.11 * dt);
      if (Math.abs(this.rupturaEnergy - this.lastEnergyHud) > 0.04) {
        this.lastEnergyHud = this.rupturaEnergy;
        this.emitHud();
      }
      if (this.rupturaEnergy <= 0) {
        this.setResonanceState('PRESENTE', true);
      }
    } else if (this.rupturaEnergy < 1) {
      this.rupturaEnergy = Math.min(1, this.rupturaEnergy + 0.25 * dt);
      if (Math.abs(this.rupturaEnergy - this.lastEnergyHud) > 0.04 || this.rupturaEnergy === 1) {
        this.lastEnergyHud = this.rupturaEnergy;
        this.emitHud();
      }
    }

    // 1. Update Moving & RUPTURA_SHIFT Platforms BEFORE player collision
    const prevPlatPositions = new Map<string, { x: number; y: number }>();
    for (const p of this.platforms) {
      prevPlatPositions.set(p.id, { x: p.curX, y: p.curY });
      if (p.mode === 'RUPTURA_SHIFT') {
        const isRup = this.resonance === 'RUPTURA';
        const targetX = p.x + (isRup ? p.rupturaDx || 0 : 0);
        const targetY = p.y + (isRup ? p.rupturaDy || 0 : 0);
        p.curX += (targetX - p.curX) * Math.min(1, 5.2 * dt);
        p.curY += (targetY - p.curY) * Math.min(1, 5.2 * dt);
      } else if ((p.moveDx || p.moveDy) && p.movePeriod) {
        const omega = (Math.PI * 2) / p.movePeriod;
        const frac = 0.5 - 0.5 * Math.cos(this.elapsedTime * omega + (p.movePhase || 0));
        p.curX = p.x + (p.moveDx || 0) * frac;
        p.curY = p.y + (p.moveDy || 0) * frac;
      }
    }

    // 2. Carry player with standing platform BEFORE player input/collision
    if (this.player.onFloor && this.player.standingPlatformId) {
      const prev = prevPlatPositions.get(this.player.standingPlatformId);
      const curPlat = this.platforms.find((pl) => pl.id === this.player.standingPlatformId);
      if (prev && curPlat) {
        this.player.x += curPlat.curX - prev.x;
        this.player.y += curPlat.curY - prev.y;
      }
    }

    // 3. Advance Scene Animation
    if (this.sceneAnimation.kind !== 'NONE') {
      this.sceneAnimation.timer += dt;
      if (this.sceneAnimation.kind === 'AWAKEN') {
        const p = Math.min(
          1,
          this.sceneAnimation.timer / Math.max(0.1, this.sceneAnimation.duration)
        );
        this.player.awakenProgress = 1 - Math.pow(1 - p, 2.4);
      } else if (
        this.sceneAnimation.kind === 'UNLOCK_STATE' ||
        this.sceneAnimation.kind === 'MEMORY_VISION'
      ) {
        if (Math.random() < 0.6) {
          const ang = Math.random() * Math.PI * 2;
          const dist = 24 + Math.random() * 24;
          const px = this.player.x + this.player.w * 0.5;
          const py = this.player.y + 22;
          this.spawnParticle(
            px + Math.cos(ang) * dist,
            py + Math.sin(ang) * dist,
            -Math.cos(ang) * 40,
            -Math.sin(ang) * 40 - 12,
            0.55,
            2.1,
            'spark'
          );
        }
      } else if (this.sceneAnimation.kind === 'SEAL_BREAK') {
        if (Math.random() < 0.55) {
          this.spawnParticle(
            this.sceneAnimation.focusX + (Math.random() - 0.5) * 32,
            this.sceneAnimation.focusY + (Math.random() - 0.5) * 70,
            (Math.random() - 0.5) * 90,
            -25 - Math.random() * 65,
            0.65,
            2.2,
            Math.random() < 0.55 ? 'spark' : 'dust'
          );
        }
      } else if (
        this.sceneAnimation.kind === 'THRESHOLD_ASCEND' ||
        this.sceneAnimation.kind === 'CAMPAIGN_FINALE'
      ) {
        if (Math.random() < 0.8) {
          this.spawnParticle(
            this.sceneAnimation.focusX + (Math.random() - 0.5) * 140,
            this.player.y + 48 - Math.random() * 75,
            (Math.random() - 0.5) * 28,
            -75 - Math.random() * 95,
            1.15,
            2.4,
            Math.random() < 0.5 ? 'amber' : 'spark'
          );
        }
      }

      if (this.sceneAnimation.timer >= this.sceneAnimation.duration) {
        const finishedKind = this.sceneAnimation.kind;
        this.sceneAnimation.kind = 'NONE';
        if (finishedKind === 'AWAKEN') {
          this.player.awakenProgress = 1;
        } else if (
          (finishedKind === 'THRESHOLD_ASCEND' || finishedKind === 'CAMPAIGN_FINALE') &&
          this.pendingChapterComplete
        ) {
          this.pendingChapterComplete = false;
          this.paused = true;
          this.callbacks.onChapterComplete();
          return;
        }
      }
    } else if (this.player.awakenProgress < 1) {
      this.player.awakenProgress = Math.min(1, this.player.awakenProgress + dt * 2.2);
    }

    // 4. Spatial Gates
    for (const g of this.gates) {
      const prevY = g.curY;
      if (g.permanentOnPuzzle && this.puzzleSolved) {
        g.isOpen = true;
      } else if (g.requiresFrequencySwitch) {
        g.isOpen = this.frequencySwitchActive && this.resonance === 'RUPTURA';
      } else if (!g.permanentOnPuzzle) {
        g.isOpen = this.resonance === 'RUPTURA';
      }
      const targetY = g.y + (g.isOpen ? g.openDy : 0);
      g.curY += (targetY - g.curY) * Math.min(1, 5.5 * dt);
      if (Math.abs(g.curY - prevY) > 0.7 && Math.random() < 0.35 && Math.abs(g.x - this.cameraX) < 900) {
        this.spawnParticle(
          g.x + g.w * 0.5 + (Math.random() - 0.5) * 14,
          g.curY + g.h - 8,
          (Math.random() - 0.5) * 55,
          15 + Math.random() * 30,
          0.45,
          1.8,
          'spark'
        );
      }
    }

    // 5. Read Input
    const sens = this.settings.touchSensitivity;
    const moveLeft =
      this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft') || this.touchInput.left;
    const moveRight =
      this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight') || this.touchInput.right;
    const moveUp =
      this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp') || this.touchInput.up;
    const moveDown =
      this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown') || this.touchInput.down;
    const isRunning =
      this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight') || this.touchInput.run;

    const sceneLocked =
      this.sceneAnimation.kind === 'THRESHOLD_ASCEND' ||
      this.sceneAnimation.kind === 'CAMPAIGN_FINALE' ||
      (this.sceneAnimation.kind === 'AWAKEN' && this.sceneAnimation.timer < 0.55);

    const axis = sceneLocked ? 0 : (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
    const vAxis = sceneLocked ? 0 : (moveDown ? 1 : 0) - (moveUp ? 1 : 0);
    if ((axis !== 0 || vAxis !== 0) && this.sceneAnimation.kind === 'AWAKEN' && this.sceneAnimation.timer >= 0.55) {
      this.sceneAnimation.kind = 'NONE';
    }

    // 6. Climbable Detection & Motion
    const overlappingClimb = this.findOverlappingClimbable();
    if (!sceneLocked && overlappingClimb && Math.abs(vAxis) > 0 && !this.player.climbing) {
      this.player.climbing = true;
      this.player.crouching = false;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.standingPlatformId = null;
    }
    if (this.player.climbing && !overlappingClimb) {
      this.player.climbing = false;
    }

    this.player.pushing = false;

    if (this.player.climbing && overlappingClimb) {
      this.player.onFloor = false;
      this.player.coyoteTimer = 0.08;
      this.player.vx = axis * 120;
      this.player.vy = vAxis * 155;
      const climbCenterX = overlappingClimb.x + overlappingClimb.w * 0.5 - this.player.w * 0.5;
      this.player.x += (climbCenterX - this.player.x) * Math.min(1, 8 * dt);
      this.player.y += this.player.vy * dt;

      if (axis !== 0) this.player.facing = axis > 0 ? 1 : -1;
      if (Math.abs(this.player.vy) > 10) {
        this.player.walkCycle += dt * 7.2;
      }

      if (this.jumpJustPressed || this.touchInput.jumpJustPressed) {
        this.player.climbing = false;
        this.player.vy = -520;
        this.jumpJustPressed = false;
        this.touchInput.jumpJustPressed = false;
        audioEngine.playJump();
      } else if (this.player.y + this.player.h <= overlappingClimb.y + 8 && vAxis < 0) {
        // Mantle cleanly onto upper ledge
        this.player.climbing = false;
        this.player.vy = -210;
      }
      this.jumpJustPressed = false;
      this.touchInput.jumpJustPressed = false;
      this.jumpJustReleased = false;
    } else {
      // Standard 2D Platformer Physics (with anti-slide landing stabilization)
      const wantsCrouch = Boolean(!sceneLocked && moveDown && this.player.onFloor);
      this.player.crouching = wantsCrouch;
      this.isRunningNow = isRunning && !wantsCrouch;

      const maxSpeed = wantsCrouch ? 115 : isRunning ? 345 : 225;
      const accel = (this.player.onFloor ? 2100 : 1400) * Math.min(1.4, Math.max(0.75, sens));
      const friction = this.player.onFloor ? 4200 : 850;

      if (axis !== 0) {
        if (this.player.onFloor && Math.abs(this.player.vx) > 155 && Math.sign(this.player.vx) !== axis) {
          this.player.squashX = 1.09;
          this.player.squashY = 0.93;
          this.spawnSurfaceBurst(this.player.x + this.player.w * 0.5, this.player.y + this.player.h, 4, -axis);
        }
        this.player.facing = axis > 0 ? 1 : -1;
        const targetVx = axis * maxSpeed;
        if (this.player.vx < targetVx) {
          this.player.vx = Math.min(targetVx, this.player.vx + accel * dt);
        } else if (this.player.vx > targetVx) {
          this.player.vx = Math.max(targetVx, this.player.vx - accel * dt);
        }
      } else {
        if (this.player.vx > 0) {
          this.player.vx = Math.max(0, this.player.vx - friction * dt);
        } else if (this.player.vx < 0) {
          this.player.vx = Math.min(0, this.player.vx + friction * dt);
        }
        if (this.player.onFloor && Math.abs(this.player.vx) < 20) {
          this.player.vx = 0;
        }
      }

      if (this.player.onFloor) {
        this.player.coyoteTimer = 0.11;
      } else {
        this.player.coyoteTimer = Math.max(0, this.player.coyoteTimer - dt);
      }

      if (!sceneLocked && (this.jumpJustPressed || this.touchInput.jumpJustPressed)) {
        this.player.jumpBufferTimer = 0.12;
        if (this.sceneAnimation.kind === 'AWAKEN' && this.sceneAnimation.timer >= 0.55) {
          this.sceneAnimation.kind = 'NONE';
        }
      } else {
        this.player.jumpBufferTimer = Math.max(0, this.player.jumpBufferTimer - dt);
      }
      this.jumpJustPressed = false;
      this.touchInput.jumpJustPressed = false;

      if (this.player.jumpBufferTimer > 0 && this.player.coyoteTimer > 0) {
        this.player.vy = -560;
        this.player.onFloor = false;
        this.player.crouching = false;
        this.player.standingPlatformId = null;
        this.player.coyoteTimer = 0;
        this.player.jumpBufferTimer = 0;
        this.player.squashX = 0.84;
        this.player.squashY = 1.18;
        this.player.landCrouch = 0;
        this.spawnSurfaceBurst(this.player.x + this.player.w * 0.5, this.player.y + this.player.h, 5, 0);
        audioEngine.playJump();
      }

      if (this.jumpJustReleased && this.player.vy < -180) {
        this.player.vy *= 0.56;
      }
      this.jumpJustReleased = false;

      this.player.vy = Math.min(920, this.player.vy + 1350 * dt);

      const staticColliders = this.getCollidersForState(this.resonance);

      // Horizontal Move + PushBlock Interaction
      this.player.x += this.player.vx * dt;
      this.player.x = Math.max(-80, Math.min(this.maxWorldX, this.player.x));

      for (const b of this.pushBlocks) {
        if (
          this.aabbOverlap(
            this.player.x,
            this.player.y,
            this.player.w,
            this.player.h,
            b.curX,
            b.curY,
            b.w,
            b.h
          )
        ) {
          // Only push horizontally if player's feet are lower than block top + 8px
          if (this.player.y + this.player.h > b.curY + 8 && Math.abs(axis) > 0) {
            const pushDelta = axis * 105 * dt;
            const candidateX = b.curX + pushDelta;
            const blocked = staticColliders.some((c) =>
              this.aabbOverlap(candidateX, b.curY, b.w, b.h - 2, c.x, c.y, c.w, c.h)
            );
            if (!blocked) {
              b.curX = candidateX;
              this.player.pushing = true;
            }
          }
          if (this.player.vx > 0 && this.player.x < b.curX) {
            this.player.x = b.curX - this.player.w;
            if (!this.player.pushing) this.player.vx = 0;
          } else if (this.player.vx < 0 && this.player.x > b.curX) {
            this.player.x = b.curX + b.w;
            if (!this.player.pushing) this.player.vx = 0;
          }
        }
      }

      for (const c of staticColliders) {
        if (
          this.aabbOverlap(
            this.player.x,
            this.player.y,
            this.player.w,
            this.player.h,
            c.x,
            c.y,
            c.w,
            c.h
          )
        ) {
          if (this.player.vx > 0) {
            this.player.x = c.x - this.player.w;
            this.player.vx = 0;
          } else if (this.player.vx < 0) {
            this.player.x = c.x + c.w;
            this.player.vx = 0;
          }
        }
      }

      // Vertical Move + Anti-Slide Landing + Descending Moving Platform Snap
      const wasOnFloor = this.player.onFloor;
      const prevVy = this.player.vy;
      this.player.y += this.player.vy * dt;
      this.player.onFloor = false;
      this.player.standingPlatformId = null;

      const allVerticalColliders = [
        ...staticColliders,
        ...this.pushBlocks.map((b) => ({ id: b.id, x: b.curX, y: b.curY, w: b.w, h: b.h })),
      ];

      for (const c of allVerticalColliders) {
        if (
          this.aabbOverlap(
            this.player.x,
            this.player.y,
            this.player.w,
            this.player.h,
            c.x,
            c.y,
            c.w,
            c.h
          )
        ) {
          if (this.player.vy >= 0) {
            this.player.y = c.y - this.player.h;
            this.player.vy = 0;
            this.player.onFloor = true;
            this.player.standingPlatformId = c.id;
          } else if (this.player.vy < 0) {
            this.player.y = c.y + c.h;
            this.player.vy = 0;
          }
        }
      }

      // Snap onto descending moving platforms within <= 6px if previously grounded
      if (!this.player.onFloor && wasOnFloor && this.player.vy >= 0) {
        const feetY = this.player.y + this.player.h;
        for (const c of allVerticalColliders) {
          const horizOverlap =
            this.player.x + this.player.w > c.x + 1 && this.player.x < c.x + c.w - 1;
          const distY = c.y - feetY;
          if (horizOverlap && distY >= 0 && distY <= 6) {
            this.player.y = c.y - this.player.h;
            this.player.vy = 0;
            this.player.onFloor = true;
            this.player.standingPlatformId = c.id;
            break;
          }
        }
      }

      // Anti-slide Landing Stabilization: cut coasting inertia on touchdown when no movement key is held
      if (!wasOnFloor && this.player.onFloor) {
        if (axis === 0) {
          this.player.vx *= 0.2;
          if (Math.abs(this.player.vx) < 20) {
            this.player.vx = 0;
          }
        }
        if (prevVy > 220) {
          const heavy = prevVy > 620;
          const mat = this.findMaterialUnderFeet();
          this.player.squashX = heavy ? 1.22 : 1.14;
          this.player.squashY = heavy ? 0.78 : 0.86;
          this.player.landCrouch = heavy ? 1.0 : 0.55;
          this.spawnSurfaceBurst(
            this.player.x + this.player.w * 0.5,
            this.player.y + this.player.h,
            heavy ? 9 : 5,
            0
          );
          if (mat === 'wet') {
            this.splashRipples.push({
              x: this.player.x + this.player.w * 0.5,
              y: this.player.y + this.player.h,
              radius: 4,
              alpha: 0.75,
            });
          }
          if (heavy) this.shakeStrength = Math.max(this.shakeStrength, 4.5);
          audioEngine.playLand(heavy, mat);
        }
      }

      // Update PushBlock gravity & landing
      for (const b of this.pushBlocks) {
        b.vy = Math.min(820, b.vy + 1350 * dt);
        b.curY += b.vy * dt;
        for (const c of staticColliders) {
          if (this.aabbOverlap(b.curX, b.curY, b.w, b.h, c.x, c.y, c.w, c.h)) {
            if (b.vy >= 0) {
              b.curY = c.y - b.h;
              b.vy = 0;
            }
          }
        }
      }
    }

    this.player.squashX += (1 - this.player.squashX) * Math.min(1, 14 * dt);
    this.player.squashY += (1 - this.player.squashY) * Math.min(1, 14 * dt);
    this.player.landCrouch = Math.max(0, this.player.landCrouch - dt * 5.2);

    if (this.player.onFloor && Math.abs(this.player.vx) > 25) {
      const spdRatio = Math.min(1, Math.abs(this.player.vx) / 345);
      this.player.walkCycle += dt * (this.isRunningNow ? 9.5 : 6.4) * (0.4 + spdRatio * 0.8);
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = this.isRunningNow ? 0.25 : this.player.crouching ? 0.5 : 0.38;
        const mat = this.findMaterialUnderFeet();
        audioEngine.playStep(mat, this.player.crouching);
        if (mat === 'wet') {
          this.splashRipples.push({
            x: this.player.x + this.player.w * 0.5,
            y: this.player.y + this.player.h,
            radius: 3,
            alpha: 0.55,
          });
        }
        this.spawnSurfaceBurst(
          this.player.x + this.player.w * 0.5 - this.player.facing * 4,
          this.player.y + this.player.h,
          this.isRunningNow ? 3 : 2,
          -this.player.facing
        );
      }
    } else if (!this.player.climbing) {
      this.stepTimer = 0.08;
    }

    this.updateCloak(dt);
    this.updateVegetation(dt);
    this.updateCreatures(dt);
    this.checkHazardsAndAbyss();

    if (this.player.dyingTimer <= 0) {
      this.checkCheckpoints();
      this.checkAreaZone();
      this.checkEcoMemories();
      this.checkInteractables();
    }

    if (this.shockwave.active) {
      this.shockwave.radius += 620 * dt;
      this.shockwave.alpha -= 1.8 * dt;
      if (this.shockwave.alpha <= 0) {
        this.shockwave.active = false;
      }
    }

    this.updateCamera(dt);
  }

  private findOverlappingClimbable(): ClimbableZone | null {
    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h * 0.5;
    for (const c of this.climbables) {
      if (px >= c.x - 10 && px <= c.x + c.w + 10 && py >= c.y - 12 && py <= c.y + c.h + 18) {
        return c;
      }
    }
    return null;
  }

  private updateCamera(dt: number): void {
    const lookAhead = Math.max(-95, Math.min(95, this.player.vx * 0.26));
    let targetCamX = this.player.x + this.player.w * 0.5 + lookAhead;
    let targetCamY = this.player.y - 36;
    const isFinalAreaOfChapter = this.currentAreaId % 5 === 0;
    let targetZoom = isFinalAreaOfChapter ? 0.86 : 1.04;

    if (
      this.sceneAnimation.kind === 'SEAL_BREAK' ||
      this.sceneAnimation.kind === 'THRESHOLD_ASCEND' ||
      this.sceneAnimation.kind === 'CAMPAIGN_FINALE' ||
      this.sceneAnimation.kind === 'CREATURE_REVEAL'
    ) {
      targetCamX = this.sceneAnimation.focusX;
      targetCamY = this.sceneAnimation.focusY;
      targetZoom = this.sceneAnimation.targetZoom;
    } else if (
      this.sceneAnimation.kind === 'UNLOCK_STATE' ||
      this.sceneAnimation.kind === 'MEMORY_VISION' ||
      this.sceneAnimation.kind === 'DEATH_RECOVER'
    ) {
      targetCamX = this.player.x + this.player.w * 0.5;
      targetCamY = this.player.y - 26;
      targetZoom = this.sceneAnimation.targetZoom;
    } else if (this.sceneAnimation.kind === 'AWAKEN') {
      const t = Math.min(
        1,
        this.sceneAnimation.timer / Math.max(0.1, this.sceneAnimation.duration)
      );
      targetCamX = this.player.x + 14 + t * 44;
      targetCamY = this.player.y - 16 - t * 20;
      targetZoom = 1.24 - t * 0.2;
    }

    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, 5.2 * dt);
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, 4.5 * dt);
    this.cameraZoom += (targetZoom - this.cameraZoom) * Math.min(1, 2.8 * dt);
    this.shakeStrength = Math.max(0, this.shakeStrength - 18 * dt);
  }

  private updateCloak(dt: number): void {
    const crouchDrop =
      (this.player.crouching ? 11 : 0) +
      this.player.landCrouch * 6 +
      (1 - this.player.awakenProgress) * 14;
    const anchorX = this.player.x + this.player.w * 0.5 - this.player.facing * 4.5;
    const anchorY = this.player.y + 16 + crouchDrop * 0.45;
    if (this.player.cloak.length === 0) return;
    this.player.cloak[0].x = anchorX;
    this.player.cloak[0].y = anchorY;
    const wind = -this.player.vx * 0.095 - this.player.facing * 6;
    const airLift = this.player.onFloor ? 0 : Math.max(-4, Math.min(6, -this.player.vy * 0.012));

    for (let i = 1; i < this.player.cloak.length; i++) {
      const prev = this.player.cloak[i - 1];
      const cur = this.player.cloak[i];
      const segWave = Math.sin(this.elapsedTime * 5.8 + i * 0.85) * (1.1 + i * 0.22);
      const targetX = prev.x + wind * 0.34 + segWave;
      const targetY = prev.y + 4.3 + airLift * 0.35;
      cur.x += (targetX - cur.x) * Math.min(1, (18 - i) * dt);
      cur.y += (targetY - cur.y) * Math.min(1, (18 - i) * dt);
    }
  }

  private updateVegetation(dt: number): void {
    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h;
    const pvx = this.player.vx;

    for (const v of this.vegetation) {
      if (Math.abs(v.x - this.cameraX) > 950) continue;
      if (Math.abs(px - v.x) < 18 && Math.abs(py - v.y) < 16 && Math.abs(pvx) > 15) {
        v.bendVel += Math.sign(pvx) * 3.8 * Math.min(1, Math.abs(pvx) / 220);
      }
      const windTarget = Math.sin(this.elapsedTime * 2.1 + v.x * 0.03) * 0.14;
      const springForce = (windTarget - v.bend) * 28 - v.bendVel * 5.5;
      v.bendVel += springForce * dt;
      v.bend = Math.max(-1.0, Math.min(1.0, v.bend + v.bendVel * dt));
    }
  }

  private updateLeavesAndRipples(dt: number): void {
    for (const leaf of this.leaves) {
      leaf.x += (leaf.vx + Math.sin(this.elapsedTime * 1.4 + leaf.phase) * 14) * dt;
      leaf.y += leaf.vy * dt;
      if (leaf.y > 540) {
        leaf.y = -20;
        leaf.x = this.cameraX + (Math.random() - 0.5) * 1200;
      }
    }
    for (let i = this.splashRipples.length - 1; i >= 0; i--) {
      const r = this.splashRipples[i];
      r.radius += 34 * dt;
      r.alpha -= 1.3 * dt;
      if (r.alpha <= 0) this.splashRipples.splice(i, 1);
    }
  }

  private updateCreatures(dt: number): void {
    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h * 0.5;
    const isEcho = this.resonance === 'ECO';
    const isRup = this.resonance === 'RUPTURA';

    for (const cr of this.creatures) {
      if (Math.abs(cr.x - this.cameraX) > 1100) continue;
      const dist = Math.hypot(px - cr.x, py - (cr.y - 24));
      const pan = Math.max(-0.85, Math.min(0.85, (cr.x - px) / 420));

      // First-time close encounter reveal
      if (!cr.revealed && dist < 340) {
        cr.revealed = true;
        audioEngine.playCreatureCue('pulse', pan);
      }

      if (cr.kind === 'veil_wisp') {
        if (isEcho) {
          cr.state = 'calmed';
          cr.y = cr.baseY + Math.sin(this.elapsedTime * 1.9 + cr.phase) * 8;
        } else if (isRup) {
          cr.state = 'phased';
          cr.y = cr.baseY + Math.sin(this.elapsedTime * 6.0 + cr.phase) * 14;
        } else {
          cr.state = dist < 175 ? 'alert' : 'patrol';
          cr.x += cr.vx * dt;
          if (cr.x < cr.patrolMinX) {
            cr.x = cr.patrolMinX;
            cr.vx = Math.abs(cr.vx);
            cr.facing = 1;
          } else if (cr.x > cr.patrolMaxX) {
            cr.x = cr.patrolMaxX;
            cr.vx = -Math.abs(cr.vx);
            cr.facing = -1;
          }
          cr.y = cr.baseY + Math.sin(this.elapsedTime * 2.8 + cr.phase) * 10;
          if (dist < 30 && this.player.recoverTimer <= 0) {
            audioEngine.playCreatureCue('alert', pan);
            this.triggerDeathRecover('Tocado pela Sonda do Véu · Use ECO [2] para acalmar');
            return;
          }
        }
      } else if (cr.kind === 'hollow_warden') {
        if (isEcho) {
          if (cr.state !== 'calmed') {
            cr.state = 'calmed';
            audioEngine.playCreatureCue('calm', pan);
          }
        } else {
          const attracted = dist < 210 && (this.isRunningNow || Math.abs(this.player.vx) > 180);
          cr.state = attracted ? 'alert' : 'patrol';
          const spd = attracted ? 72 : 38;
          if (attracted) {
            cr.facing = px >= cr.x ? 1 : -1;
            cr.x += cr.facing * spd * dt;
            cr.x = Math.max(cr.patrolMinX, Math.min(cr.patrolMaxX, cr.x));
          } else {
            cr.x += cr.facing * spd * dt;
            if (cr.x <= cr.patrolMinX) {
              cr.x = cr.patrolMinX;
              cr.facing = 1;
            } else if (cr.x >= cr.patrolMaxX) {
              cr.x = cr.patrolMaxX;
              cr.facing = -1;
            }
          }
          if (dist < 32 && this.player.recoverTimer <= 0 && !this.player.crouching) {
            audioEngine.playCreatureCue('alert', pan);
            this.triggerDeathRecover('Detido pelo Guardião · Use ECO [2] ou agache-se');
            return;
          }
        }
      } else if (cr.kind === 'archive_stalker') {
        // Sound-sensitive construct: crouching or walking slowly keeps it on passive patrol
        const noisy =
          Math.abs(this.player.vx) > 250 && !this.player.crouching && dist < 260 && !isEcho;
        if (noisy) {
          if (cr.state !== 'alert') {
            audioEngine.playCreatureCue('alert', pan);
          }
          cr.state = 'alert';
          cr.facing = px >= cr.x ? 1 : -1;
          cr.x += cr.facing * 125 * dt;
          cr.x = Math.max(cr.patrolMinX, Math.min(cr.patrolMaxX, cr.x));
        } else {
          cr.state = isEcho ? 'calmed' : 'patrol';
          cr.x += cr.facing * 52 * dt;
          if (cr.x <= cr.patrolMinX) {
            cr.x = cr.patrolMinX;
            cr.facing = 1;
          } else if (cr.x >= cr.patrolMaxX) {
            cr.x = cr.patrolMaxX;
            cr.facing = -1;
          }
        }
        if (dist < 28 && cr.state === 'alert' && this.player.recoverTimer <= 0) {
          this.triggerDeathRecover('Interceptado pelo Rastreador · Caminhe devagar ou agache [S]');
          return;
        }
      }
    }
  }

  private checkHazardsAndAbyss(): void {
    if (this.player.y > 920) {
      this.triggerDeathRecover();
      return;
    }
    if (this.player.recoverTimer > 0) return;

    for (const h of this.hazards) {
      if (h.kind === 'ruptura_surge' && this.resonance === 'RUPTURA') continue;
      if (
        this.aabbOverlap(
          this.player.x + 2,
          this.player.y + 4,
          this.player.w - 4,
          this.player.h - 4,
          h.x,
          h.y,
          h.w,
          h.h
        )
      ) {
        this.triggerDeathRecover();
        return;
      }
    }
  }

  private triggerDeathRecover(customMsg?: string): void {
    if (this.player.dyingTimer > 0) return;
    this.player.dyingTimer = 0.8;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.climbing = false;
    this.shakeStrength = 5;
    audioEngine.playDeathRecover();
    this.startSceneAnimation(
      'DEATH_RECOVER',
      0.8,
      this.player.x + this.player.w * 0.5,
      this.player.y,
      1.12
    );
    if (customMsg) {
      this.showBanner(customMsg);
    }
  }

  private finishDeathRespawn(): void {
    this.player.x = this.activeCheckpoint.x;
    this.player.y = this.activeCheckpoint.y - 56;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onFloor = false;
    this.player.crouching = false;
    this.player.climbing = false;
    this.player.recoverTimer = 0.65;
    this.resonance = 'PRESENTE';
    audioEngine.setResonanceMood('PRESENTE');
    this.emitHud();
  }

  private spawnParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    maxLife: number,
    size: number,
    color: Particle['color']
  ): void {
    const cap = this.settings.quality === 'low' ? 28 : this.settings.quality === 'medium' ? 52 : 76;
    if (this.particles.length >= cap) {
      this.particles.shift();
    }
    this.particles.push({ x, y, vx, vy, life: 0, maxLife, size, color });
  }

  private findMaterialUnderFeet(): SurfaceMaterial | undefined {
    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h;
    for (const p of this.platforms) {
      if (px >= p.curX - 4 && px <= p.curX + p.w + 4 && Math.abs(py - p.curY) <= 10) {
        return p.material;
      }
    }
    return undefined;
  }

  private spawnSurfaceBurst(x: number, y: number, count: number, biasDir: number): void {
    const mat = this.findMaterialUnderFeet();
    const kind: Particle['color'] = mat === 'wet' ? 'splash' : 'dust';
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 70 + biasDir * (28 + Math.random() * 25);
      const lift = kind === 'splash' ? -45 - Math.random() * 55 : -16 - Math.random() * 34;
      this.spawnParticle(
        x + (Math.random() - 0.5) * 10,
        y - 2,
        spread,
        lift,
        kind === 'splash' ? 0.36 + Math.random() * 0.16 : 0.42 + Math.random() * 0.25,
        kind === 'splash' ? 1.7 + Math.random() * 1.1 : 1.9 + Math.random() * 1.4,
        kind
      );
    }
  }

  private updateParticles(dt: number): void {
    const maxCount =
      this.settings.quality === 'low' ? 22 : this.settings.quality === 'medium' ? 40 : 62;
    this.particleSpawnTimer += dt;
    if (this.particles.length < maxCount && this.particleSpawnTimer >= 0.08) {
      this.particleSpawnTimer = 0;
      const isAmbientAmber =
        this.chapterNumber === 6 || this.resonance !== 'PRESENTE' || Math.random() < 0.25;
      this.particles.push({
        x: this.cameraX + (Math.random() - 0.5) * 1100,
        y: this.cameraY + (Math.random() - 0.5) * 560,
        vx: (Math.random() - 0.5) * 18,
        vy: this.resonance === 'RUPTURA' ? -28 - Math.random() * 24 : -8 - Math.random() * 14,
        life: 0,
        maxLife: 3 + Math.random() * 3,
        size: 1.2 + Math.random() * 1.8,
        color: isAmbientAmber ? 'amber' : 'mist',
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.color === 'splash') {
        p.vy += 260 * dt;
      } else if (p.color === 'dust') {
        p.vx *= Math.max(0, 1 - 2.6 * dt);
        p.vy -= 12 * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private getCollidersForState(
    targetState: ResonanceState
  ): Array<{ id: string; x: number; y: number; w: number; h: number }> {
    const list: Array<{ id: string; x: number; y: number; w: number; h: number }> = [];
    for (const p of this.platforms) {
      if (p.mode === 'ALWAYS_SOLID' || p.mode === 'RUPTURA_SHIFT') {
        list.push({ id: p.id, x: p.curX, y: p.curY, w: p.w, h: p.h });
      } else if (p.mode === 'ECHO_ONLY' && targetState === 'ECO') {
        list.push({ id: p.id, x: p.curX, y: p.curY, w: p.w, h: p.h });
      } else if (p.mode === 'PRESENT_ONLY' && targetState === 'PRESENTE') {
        list.push({ id: p.id, x: p.curX, y: p.curY, w: p.w, h: p.h });
      }
    }
    for (const g of this.gates) {
      let open = g.isOpen;
      if (g.permanentOnPuzzle && this.puzzleSolved) {
        open = true;
      } else if (g.requiresFrequencySwitch) {
        open = this.frequencySwitchActive && targetState === 'RUPTURA';
      } else if (!g.permanentOnPuzzle) {
        open = targetState === 'RUPTURA';
      }
      if (!open) {
        list.push({ id: g.id, x: g.x, y: g.curY, w: g.w, h: g.h });
      }
    }
    return list;
  }

  private aabbOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private checkCheckpoints(): void {
    // CRITICAL FIX: only activate checkpoint when grounded with stable footing (never mid-fall)
    if (!this.player.onFloor || this.player.vy > 80) return;

    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h;
    for (const cp of this.checkpoints) {
      if (!cp.ignited && Math.abs(px - cp.x) < 38 && Math.abs(py - cp.y) < 32) {
        cp.ignited = true;
        this.activeCheckpoint = { id: cp.id, x: cp.x, y: cp.y };
        audioEngine.playInteract('checkpoint');
        this.saveCurrentProgress();
        this.showBanner('MARCO DE RESSONÂNCIA ATIVADO');
      }
    }
  }

  private checkAreaZone(): void {
    const px = this.player.x + this.player.w * 0.5;
    const list = getChapterAreas(this.chapterNumber);
    for (const area of list) {
      if (px >= area.startX && px < area.endX && area.id !== this.currentAreaId) {
        this.currentAreaId = area.id;
        this.showBanner(`${area.subtitle.toUpperCase()} · ${area.title.toUpperCase()}`);
        this.saveCurrentProgress();
        break;
      }
    }
  }

  private checkEcoMemories(): void {
    if (this.resonance !== 'ECO') return;
    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h;
    for (const mem of this.memories) {
      if (!mem.discovered && Math.hypot(px - mem.x, py - mem.y) < 62) {
        mem.discovered = true;
        this.preservedMemories.add(mem.id);
        audioEngine.playInteract('memory');
        this.startSceneAnimation('MEMORY_VISION', 1.15, mem.x, mem.y - 32, 1.14);
        this.saveCurrentProgress();
        this.showBanner(`MEMÓRIA ECO · ${mem.whisper.toUpperCase()}`);
        this.emitHud();
      }
    }
  }

  private checkInteractables(): void {
    const px = this.player.x + this.player.w * 0.5;
    const py = this.player.y + this.player.h;
    let found: InteractableNode | null = null;

    for (const node of this.nodes) {
      const dist = Math.hypot(px - node.x, py - node.y);
      if (dist < 62 && (!node.activated || node.type === 'CHAPTER_THRESHOLD')) {
        found = node;
        break;
      }
    }

    const nextId = found ? found.id : null;
    if (nextId !== this.nearbyNodeId) {
      this.nearbyNodeId = nextId;
      this.emitHud();
    }

    const wantsInteract = this.interactJustPressed || this.touchInput.interactJustPressed;
    this.interactJustPressed = false;
    this.touchInput.interactJustPressed = false;

    if (
      found &&
      found.type === 'CHAPTER_THRESHOLD' &&
      Math.abs(px - found.x) < 28 &&
      !this.chapterCompleted
    ) {
      this.triggerInteract(found);
      return;
    }

    if (wantsInteract && found) {
      this.triggerInteract(found);
    }
  }

  private triggerInteract(node: InteractableNode): void {
    node.activated = true;
    this.interactPulse = 1.0;

    if (node.type === 'UNLOCK_ECO') {
      this.unlockedEcho = true;
      audioEngine.playInteract('unlock');
      this.setResonanceState('ECO', true);
      this.startSceneAnimation('UNLOCK_STATE', 1.15, node.x, node.y - 38, 1.18);
      this.saveCurrentProgress();
      this.showBanner('ECO DESPERTADO · TECLA [2] PARA REVELAR VESTÍGIOS');
    } else if (node.type === 'UNLOCK_RUPTURA') {
      this.unlockedRuptura = true;
      audioEngine.playInteract('unlock');
      this.setResonanceState('RUPTURA', true);
      this.startSceneAnimation('UNLOCK_STATE', 1.15, node.x, node.y - 38, 1.18);
      this.saveCurrentProgress();
      this.showBanner('RUPTURA DESPERTADA · TECLA [3] PARA ALTERAR ESTRUTURAS');
    } else if (node.type === 'FREQUENCY_SWITCH') {
      this.frequencySwitchActive = true;
      audioEngine.playInteract('anchor');
      this.shakeStrength = 5;
      this.saveCurrentProgress();
      this.showBanner('RESSOADOR SINCRONIZADO · USE [3] RUPTURA PARA ABRIR O PORTÃO');
    } else if (node.type === 'PUZZLE_ANCHOR') {
      audioEngine.playInteract('anchor');
      const required = CHAPTER_CATALOG[this.chapterNumber].requiredAnchors;
      const count = this.nodes.filter((n) => n.type === 'PUZZLE_ANCHOR' && n.activated).length;
      if (count >= required) {
        this.puzzleSolved = true;
        this.shakeStrength = 8;
        this.hitstopTimer = 0.05;
        const sealGate = this.gates.find((g) => g.permanentOnPuzzle);
        if (sealGate) {
          this.startSceneAnimation(
            'SEAL_BREAK',
            1.45,
            sealGate.x + sealGate.w * 0.5,
            sealGate.y + 90,
            1.02
          );
        }
        this.showBanner(`SELO DO CAPÍTULO ${CHAPTER_CATALOG[this.chapterNumber].roman} ROMPIDO · PASSAGEM LIBERADA`);
      } else {
        this.showBanner(`ÂNCORA HARMÔNICA ALINHADA (${count}/${required})`);
      }
      this.saveCurrentProgress();
    } else if (node.type === 'CHAPTER_THRESHOLD') {
      if (this.chapterCompleted || this.pendingChapterComplete) return;
      this.chapterCompleted = true;
      this.pendingChapterComplete = true;
      this.completedChapters.add(this.chapterNumber);
      if (this.chapterNumber < 6) {
        this.unlockedChapter = Math.max(
          this.unlockedChapter,
          (this.chapterNumber + 1) as ChapterNumber
        ) as ChapterNumber;
      }
      this.player.vx = 0;
      this.saveCurrentProgress();
      audioEngine.playInteract('threshold');
      const isFinale = this.chapterNumber === 6;
      this.startSceneAnimation(
        isFinale ? 'CAMPAIGN_FINALE' : 'THRESHOLD_ASCEND',
        isFinale ? 2.4 : 1.65,
        node.x + 100,
        node.y - 105,
        isFinale ? 0.86 : 0.92
      );
    }

    this.nearbyNodeId = null;
    this.emitHud();
  }

  private saveCurrentProgress(): void {
    const anchors = this.nodes
      .filter((n) => n.type === 'PUZZLE_ANCHOR' && n.activated)
      .map((n) => n.id);
    for (const m of this.memories) {
      if (m.discovered) this.preservedMemories.add(m.id);
    }
    const discoveredMemories = Array.from(this.preservedMemories);
    const completedArr = Array.from(this.completedChapters);
    persistSaveData({
      hasSave: true,
      chapterNumber: this.chapterNumber,
      unlockedChapter: this.unlockedChapter,
      completedChapters: completedArr,
      areaId: this.currentAreaId,
      checkpointId: this.activeCheckpoint.id,
      checkpointX: this.activeCheckpoint.x,
      checkpointY: this.activeCheckpoint.y,
      unlockedEcho: this.unlockedEcho,
      unlockedRuptura: this.unlockedRuptura,
      resonanceState: this.resonance,
      rupturaEnergy: this.rupturaEnergy,
      frequencySwitchActive: this.frequencySwitchActive,
      puzzleAnchors: anchors,
      discoveredMemories,
      chapter1Completed: this.completedChapters.has(1),
      chapter2Completed: this.completedChapters.has(2),
    });
  }

  private emitHud(): void {
    const areaList = getChapterAreas(this.chapterNumber);
    const area = areaList.find((a) => a.id === this.currentAreaId) || areaList[0];
    const nearby = this.nodes.find((n) => n.id === this.nearbyNodeId);
    const puzzleCount = this.nodes.filter((n) => n.type === 'PUZZLE_ANCHOR' && n.activated).length;
    const puzzleTotal = CHAPTER_CATALOG[this.chapterNumber].requiredAnchors;
    const memoriesFound = this.memories.filter((m) => m.discovered).length;
    const info = CHAPTER_CATALOG[this.chapterNumber];

    this.callbacks.onHudUpdate({
      chapterNumber: this.chapterNumber,
      chapterTitle: `Cap. ${info.roman} · ${info.title}`,
      unlockedChapter: this.unlockedChapter,
      campaignCompleted: this.completedChapters.has(6),
      areaId: area.id,
      areaTitle: area.title,
      areaSubtitle: area.subtitle,
      areaWhisper: area.whisper,
      resonanceState: this.resonance,
      unlockedEcho: this.unlockedEcho,
      unlockedRuptura: this.unlockedRuptura,
      rupturaEnergy: this.rupturaEnergy,
      puzzleCount,
      puzzleTotal,
      memoriesFound,
      memoriesTotal: this.memories.length,
      nearbyPrompt: nearby ? `${nearby.title} · [E] ${nearby.hint}` : null,
      bannerNotice: this.bannerNotice,
      resonanceNotice: this.resonanceNotice,
      isCrouching: this.player.crouching,
      isClimbing: this.player.climbing,
      inChapter2: this.chapterNumber === 2,
    });
  }

  private draw(): void {
    const shakeX =
      this.shakeStrength > 0.1 ? (Math.random() - 0.5) * 2 * this.shakeStrength : 0;
    const shakeY =
      this.shakeStrength > 0.1 ? (Math.random() - 0.5) * 2 * this.shakeStrength : 0;

    this.renderer2D.render({
      time: this.elapsedTime,
      chapterNumber: this.chapterNumber,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      cameraZoom: this.cameraZoom,
      shakeX,
      shakeY,
      resonance: this.resonance,
      resonanceFlare: this.resonanceFlare,
      shockwave: this.shockwave,
      quality: this.settings.quality,
      platforms: this.platforms,
      gates: this.gates,
      nodes: this.nodes,
      checkpoints: this.checkpoints,
      monoliths: this.monoliths,
      memories: this.memories,
      waterPools: this.waterPools,
      drips: this.drips,
      debris: this.debris,
      climbables: this.climbables,
      pushBlocks: this.pushBlocks,
      hazards: this.hazards,
      vegetation: this.vegetation,
      leaves: this.leaves,
      creatures: this.creatures,
      silhouettes: this.silhouettes,
      splashRipples: this.splashRipples,
      particles: this.particles,
      player: this.player,
      isRunning: this.isRunningNow,
      interactPulse: this.interactPulse,
      nearbyNodeId: this.nearbyNodeId,
      inChapter2: this.chapterNumber === 2,
      sceneAnimation: this.sceneAnimation,
    });
  }
}
