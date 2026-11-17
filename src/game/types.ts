export type ResonanceState = 'PRESENTE' | 'ECO' | 'RUPTURA';

export type ChapterNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'CHAPTER_END';

export type QualityLevel = 'low' | 'medium' | 'high';

export type TouchMode = 'auto' | 'always' | 'hidden';

export type PlatformMode = 'ALWAYS_SOLID' | 'ECHO_ONLY' | 'PRESENT_ONLY' | 'RUPTURA_SHIFT';

export type SurfaceMaterial = 'concrete' | 'wet' | 'metal' | 'stone';

export interface ChapterInfo {
  id: ChapterNumber;
  roman: string;
  title: string;
  subtitle: string;
  closingQuote: string;
  unlockedEcho: boolean;
  unlockedRuptura: boolean;
  requiredAnchors: number;
  defaultCheckpointId: string;
  defaultSpawnX: number;
  defaultSpawnY: number;
}

export interface GameSettings {
  volume: number;
  muted: boolean;
  touchSensitivity: number;
  quality: QualityLevel;
  touchMode: TouchMode;
}

export interface SaveData {
  hasSave: boolean;
  chapterNumber: ChapterNumber;
  unlockedChapter: ChapterNumber;
  completedChapters: ChapterNumber[];
  areaId: number;
  checkpointId: string;
  checkpointX: number;
  checkpointY: number;
  unlockedEcho: boolean;
  unlockedRuptura: boolean;
  resonanceState?: ResonanceState;
  rupturaEnergy?: number;
  frequencySwitchActive: boolean;
  puzzleAnchors: string[];
  discoveredMemories: string[];
  chapter1Completed: boolean;
  chapter2Completed?: boolean;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mode: PlatformMode;
  material?: SurfaceMaterial;
  // Current runtime position (used for RUPTURA_SHIFT and cyclic elevators)
  curX: number;
  curY: number;
  rupturaDx?: number;
  rupturaDy?: number;
  moveDx?: number;
  moveDy?: number;
  movePeriod?: number;
  movePhase?: number;
  requiresPuzzleLock?: boolean;
  label?: string;
}

export interface ClimbableZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'vine' | 'conduit' | 'chain';
}

export interface PushBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  curX: number;
  curY: number;
  vx: number;
  vy: number;
  material: SurfaceMaterial;
}

export interface HazardZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'abyss_steam' | 'ruptura_surge' | 'deep_water';
}

export interface VegetationTuft {
  x: number;
  y: number;
  height: number;
  kind: 'grass' | 'moss' | 'fern';
  bend: number;
  bendVel: number;
}

export interface FallingLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
}

export interface Creature {
  id: string;
  kind: 'veil_wisp' | 'hollow_warden' | 'archive_stalker';
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  patrolMinX: number;
  patrolMaxX: number;
  vx: number;
  facing: 1 | -1;
  state: 'patrol' | 'alert' | 'calmed' | 'phased';
  alertTimer: number;
  phase: number;
  revealed?: boolean;
}

export interface DistantSilhouette {
  x: number;
  y: number;
  depth: number;
  pose: 'watching' | 'sentinel' | 'fallen';
}

export interface WaterSplashRipple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export interface SpatialGate {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  curY: number;
  openDy: number;
  isOpen: boolean;
  requiresFrequencySwitch?: boolean;
  permanentOnPuzzle?: boolean;
}

export interface InteractableNode {
  id: string;
  x: number;
  y: number;
  type:
    | 'UNLOCK_ECO'
    | 'UNLOCK_RUPTURA'
    | 'PUZZLE_ANCHOR'
    | 'FREQUENCY_SWITCH'
    | 'CHAPTER_THRESHOLD';
  title: string;
  hint: string;
  activated: boolean;
  requiresState?: ResonanceState;
}

export interface EchoMemory {
  id: string;
  x: number;
  y: number;
  pose: 'watcher' | 'kneeling' | 'converged';
  whisper: string;
  discovered: boolean;
}

export interface WaterPool {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DripSpot {
  x: number;
  y: number;
  groundY: number;
  phase: number;
}

export interface FloatingDebris {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
}

export interface CheckpointData {
  id: string;
  areaId: number;
  x: number;
  y: number;
  ignited: boolean;
}

export interface AreaZone {
  id: number;
  startX: number;
  endX: number;
  title: string;
  subtitle: string;
  whisper: string;
}

export interface BgMonolith {
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number; // 0.15..0.75
  kind: 'pillar' | 'arch' | 'inverted' | 'chain' | 'beam' | 'gear';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: 'amber' | 'mist' | 'dust' | 'splash' | 'spark';
}

export type SceneAnimationKind =
  | 'NONE'
  | 'AWAKEN'
  | 'UNLOCK_STATE'
  | 'SEAL_BREAK'
  | 'CREATURE_REVEAL'
  | 'MEMORY_VISION'
  | 'DEATH_RECOVER'
  | 'THRESHOLD_ASCEND'
  | 'CAMPAIGN_FINALE';

export interface SceneAnimationState {
  kind: SceneAnimationKind;
  timer: number;
  duration: number;
  focusX: number;
  focusY: number;
  targetZoom: number;
}

export interface CloakNode {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onFloor: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  squashX: number;
  squashY: number;
  walkCycle: number;
  landCrouch: number;
  awakenProgress: number;
  crouching: boolean;
  climbing: boolean;
  pushing: boolean;
  standingPlatformId: string | null;
  dyingTimer: number;
  recoverTimer: number;
  resonanceRejectTimer: number;
  cloak: CloakNode[];
}

export interface HudSnapshot {
  chapterNumber: ChapterNumber;
  chapterTitle: string;
  unlockedChapter: ChapterNumber;
  campaignCompleted: boolean;
  areaId: number;
  areaTitle: string;
  areaSubtitle: string;
  areaWhisper: string;
  resonanceState: ResonanceState;
  unlockedEcho: boolean;
  unlockedRuptura: boolean;
  rupturaEnergy: number;
  puzzleCount: number;
  puzzleTotal: number;
  memoriesFound: number;
  memoriesTotal: number;
  nearbyPrompt: string | null;
  bannerNotice: string | null;
  resonanceNotice: string | null;
  isCrouching: boolean;
  isClimbing: boolean;
  inChapter2?: boolean;
}

export interface TouchInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  run: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  interactJustPressed: boolean;
}
