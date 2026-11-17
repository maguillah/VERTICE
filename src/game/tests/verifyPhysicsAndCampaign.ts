import assert from 'node:assert/strict';

// Minimal headless browser shims for Node execution
const storageMap = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  get length() {
    return storageMap.size;
  },
  clear: () => storageMap.clear(),
  getItem: (k: string) => (storageMap.has(k) ? storageMap.get(k)! : null),
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
  removeItem: (k: string) => storageMap.delete(k),
  setItem: (k: string, v: string) => storageMap.set(k, String(v)),
};

const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
(globalThis as unknown as { window: Record<string, unknown> }).window = {
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  addEventListener: (ev: string, fn: EventListenerOrEventListenerObject) => {
    if (!listeners.has(ev)) listeners.set(ev, new Set());
    listeners.get(ev)!.add(fn);
  },
  removeEventListener: (ev: string, fn: EventListenerOrEventListenerObject) => {
    listeners.get(ev)?.delete(fn);
  },
};

(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
  observe() {}
  disconnect() {}
};

(globalThis as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number }).requestAnimationFrame = () => 1;
(globalThis as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame = () => {};

function createStubCanvas(): HTMLCanvasElement {
  const ctxProxy = new Proxy(
    {
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      measureText: (t: string) => ({ width: t.length * 7 }),
      canvas: { width: 1280, height: 720 },
    },
    {
      get(target, prop) {
        if (prop in target) return (target as Record<string | symbol, unknown>)[prop];
        return () => {};
      },
      set() {
        return true;
      },
    }
  );
  return {
    width: 1280,
    height: 720,
    clientWidth: 1280,
    clientHeight: 720,
    getContext: () => ctxProxy,
  } as unknown as HTMLCanvasElement;
}

(globalThis as unknown as { document: { createElement: () => HTMLCanvasElement } }).document = {
  createElement: () => createStubCanvas(),
};

async function runTests() {
  const { VerticeGameEngine } = await import('../engine');
  const { CHAPTER_CATALOG, createChapterGeometry, getChapterAreas } = await import('../worldData');

  const events: string[] = [];
  const engine = new VerticeGameEngine(
    createStubCanvas(),
    { volume: 0, muted: true, quality: 'medium', touchSensitivity: 1, touchMode: 'auto' },
    {
      onHudUpdate: () => {},
      onChapterComplete: () => events.push('chapter_complete'),
    }
  );

  // Test 1: Campaign catalog & 6 chapters structure
  assert.equal(Object.keys(CHAPTER_CATALOG).length, 6, 'Deve existir catálogo com exatamente 6 capítulos');
  for (let ch = 1 as const; ch <= 6; ch = (ch + 1) as typeof ch) {
    const areas = getChapterAreas(ch);
    assert.equal(areas.length, 5, `Capítulo ${ch} deve possuir 5 áreas`);
    const geom = createChapterGeometry(ch);
    assert.ok(geom.platforms.length >= 6, `Capítulo ${ch} deve ter plataformas jogáveis`);
    assert.ok(geom.checkpoints.length >= 3, `Capítulo ${ch} deve ter ao menos 3 checkpoints`);
    assert.ok(geom.memories.length >= 4, `Capítulo ${ch} deve ter ao menos 4 memórias Eco`);
    const threshold = geom.nodes.find((n) => n.type === 'CHAPTER_THRESHOLD');
    assert.ok(threshold, `Capítulo ${ch} deve possuir portal CHAPTER_THRESHOLD`);
    assert.ok(geom.creatures.length >= 1, `Capítulo ${ch} deve possuir ao menos 1 criatura`);
  }

  // Test 2: Anti-slide landing stabilization on narrow 65px platform from sprint speed
  engine.startNewGame();
  const eng = engine as unknown as {
    paused: boolean;
    titlePanMode: boolean;
    sceneAnimation: { kind: string; timer: number };
    platforms: Array<{ id: string; x: number; y: number; curX: number; curY: number; w: number; h: number; mode: string; moveDx?: number; moveDy?: number; movePeriod?: number; movePhase?: number }>;
    player: { x: number; y: number; w: number; h: number; vx: number; vy: number; onFloor: boolean; standingPlatformId: string | null; dyingTimer: number; resonanceRejectTimer: number };
    checkpoints: Array<{ id: string; x: number; y: number; areaId: number; ignited: boolean }>;
    activeCheckpoint: { id: string; x: number; y: number };
    resonance: string;
    unlockedEcho: boolean;
    unlockedRuptura: boolean;
    rupturaEnergy: number;
    update: (dt: number) => void;
  };
  eng.sceneAnimation.kind = 'NONE';
  eng.platforms = [
    { id: 'narrow_ledge', x: 300, y: 400, curX: 300, curY: 400, w: 65, h: 32, mode: 'ALWAYS_SOLID' },
  ];
  // Position player midair descending onto center of 65px ledge with high horizontal sprint velocity (345 px/s) and no held keys
  eng.player.x = 322;
  eng.player.y = 340;
  eng.player.vx = 345;
  eng.player.vy = 240;
  eng.player.onFloor = false;

  for (let i = 0; i < 40; i++) {
    eng.update(1 / 60);
  }
  assert.equal(eng.player.onFloor, true, 'Protagonista deve permanecer em solo firme sobre plataforma de 65px');
  assert.equal(eng.player.vx, 0, 'Velocidade horizontal residual deve zerar rapidamente após o pouso');
  assert.ok(
    eng.player.x + eng.player.w > 300 && eng.player.x < 365,
    `Protagonista não deve deslizar para fora da plataforma estreita (x=${eng.player.x.toFixed(1)})`
  );

  // Test 3: Moving platform horizontal & vertical carry without dropping player
  eng.platforms = [
    {
      id: 'moving_elev',
      x: 500,
      y: 360,
      curX: 500,
      curY: 360,
      w: 140,
      h: 24,
      mode: 'ALWAYS_SOLID',
      moveDx: 80,
      moveDy: -90,
      movePeriod: 3.0,
      movePhase: 0,
    },
  ];
  eng.player.x = 560;
  eng.player.y = 360 - eng.player.h;
  eng.player.vx = 0;
  eng.player.vy = 0;
  eng.player.onFloor = true;
  eng.player.standingPlatformId = 'moving_elev';

  let droppedFrames = 0;
  for (let i = 0; i < 240; i++) {
    eng.update(1 / 60);
    if (!eng.player.onFloor) droppedFrames++;
  }
  assert.equal(droppedFrames, 0, 'Elevador móvel não deve perder contato com o jogador durante ciclo de subida/descida');

  // Test 4: Grounded-only checkpoint activation
  eng.platforms = [
    { id: 'cp_floor', x: 700, y: 420, curX: 700, curY: 420, w: 300, h: 40, mode: 'ALWAYS_SOLID' },
  ];
  eng.checkpoints = [{ id: 'cp_test', x: 800, y: 420, areaId: 2, ignited: false }];
  eng.activeCheckpoint = { id: 'cp_initial', x: 160, y: 420 };
  // Midair pass above checkpoint
  eng.player.x = 790;
  eng.player.y = 350;
  eng.player.vx = 0;
  eng.player.vy = 50;
  eng.player.onFloor = false;
  eng.update(1 / 60);
  assert.equal(eng.checkpoints[0].ignited, false, 'Checkpoint NÃO deve ativar enquanto jogador está no ar');

  // Land onto floor and settle
  for (let i = 0; i < 30; i++) eng.update(1 / 60);
  assert.equal(eng.player.onFloor, true);
  assert.equal(eng.checkpoints[0].ignited, true, 'Checkpoint deve ativar após pouso firme no solo');
  assert.equal(eng.activeCheckpoint.id, 'cp_test');

  // Test 5: Resonance safety guard prevents switching into solid wall overlap
  eng.unlockedEcho = true;
  eng.unlockedRuptura = true;
  eng.rupturaEnergy = 1;
  eng.platforms = [
    { id: 'floor', x: 0, y: 420, curX: 0, curY: 420, w: 400, h: 40, mode: 'ALWAYS_SOLID' },
    { id: 'echo_wall', x: 180, y: 350, curX: 180, curY: 350, w: 40, h: 70, mode: 'ECHO_ONLY' },
  ];
  eng.player.x = 190;
  eng.player.y = 420 - eng.player.h;
  eng.player.onFloor = true;
  engine.setResonanceState('PRESENTE');
  assert.equal(eng.resonance, 'PRESENTE');
  engine.setResonanceState('ECO');
  assert.equal(eng.resonance, 'PRESENTE', 'Troca para ECO deve ser bloqueada quando causaria sobreposição em parede sólida');
  assert.ok(eng.player.resonanceRejectTimer > 0, 'Deve sinalizar rejeição visual de Ressonância');

  // Test 6: Chapter 1..6 engine initialization
  for (let ch = 1 as const; ch <= 6; ch = (ch + 1) as typeof ch) {
    engine.startChapter(ch);
    assert.equal(eng.paused, false);
    assert.equal(eng.player.dyingTimer, 0);
  }

  engine.destroy();
  console.log('VERTICE WEB TEST PASS: Física anti-deslizamento, plataformas móveis, checkpoints, trava de Ressonância e 6 capítulos verificados.');
}

runTests().catch((err) => {
  console.error('VERTICE WEB TEST FAIL:', err);
  process.exit(1);
});
