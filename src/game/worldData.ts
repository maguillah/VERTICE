import {
  AreaZone,
  BgMonolith,
  ChapterInfo,
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
  Platform,
  PushBlock,
  SpatialGate,
  VegetationTuft,
  WaterPool,
} from './types';

export interface ChapterGeometry {
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
  maxWorldX: number;
}

export const CHAPTER_CATALOG: Record<ChapterNumber, ChapterInfo> = {
  1: {
    id: 1,
    roman: 'I',
    title: 'O Despertar',
    subtitle: 'Capítulo I · O Primeiro Silêncio',
    closingQuote:
      'Ao atravessar a fenda do Chamado, o Núcleo no seu peito responde a uma frequência mais antiga que a própria arquitetura suspensa.',
    unlockedEcho: false,
    unlockedRuptura: false,
    requiredAnchors: 2,
    defaultCheckpointId: 'cp_c1_start',
    defaultSpawnX: 160,
    defaultSpawnY: 480,
  },
  2: {
    id: 2,
    roman: 'II',
    title: 'O Chamado',
    subtitle: 'Capítulo II · A Convergência das Margens',
    closingQuote:
      'Entre águas submersas e pêndulos de fase, o chamado que guiava seus passos revelou-se um eco da própria memória do mundo.',
    unlockedEcho: true,
    unlockedRuptura: true,
    requiredAnchors: 3,
    defaultCheckpointId: 'cp_c2_entry',
    defaultSpawnX: 160,
    defaultSpawnY: 430,
  },
  3: {
    id: 3,
    roman: 'III',
    title: 'A Cidade Esquecida',
    subtitle: 'Capítulo III · Aquedutos e Sentinelas',
    closingQuote:
      'As torres de concreto ainda sustentam o peso de quem partiu. Onde havia ruído, restou apenas vigília.',
    unlockedEcho: true,
    unlockedRuptura: true,
    requiredAnchors: 3,
    defaultCheckpointId: 'cp_c3_entry',
    defaultSpawnX: 160,
    defaultSpawnY: 430,
  },
  4: {
    id: 4,
    roman: 'IV',
    title: 'O Abismo das Memórias',
    subtitle: 'Capítulo IV · Raízes Subterrâneas',
    closingQuote:
      'Nem toda queda conduz ao fim; nas profundezas onde a luz hesita, cada lembrança preservada torna-se ponte.',
    unlockedEcho: true,
    unlockedRuptura: true,
    requiredAnchors: 3,
    defaultCheckpointId: 'cp_c4_entry',
    defaultSpawnX: 160,
    defaultSpawnY: 420,
  },
  5: {
    id: 5,
    roman: 'V',
    title: 'A Convergência',
    subtitle: 'Capítulo V · O Coração da Fratura',
    closingQuote:
      'Presente, Eco e Ruptura deixaram de disputar espaço. Todas as engrenagens agora giram em torno do mesmo pulso.',
    unlockedEcho: true,
    unlockedRuptura: true,
    requiredAnchors: 3,
    defaultCheckpointId: 'cp_c5_entry',
    defaultSpawnX: 160,
    defaultSpawnY: 430,
  },
  6: {
    id: 6,
    roman: 'VI',
    title: 'O Limiar da Existência',
    subtitle: 'Capítulo VI · Além da Forma',
    closingQuote:
      'O Núcleo já não pertence a uma única silhueta. Diante da claridade aberta, o que permanece é a travessia — e a escolha do que virá depois.',
    unlockedEcho: true,
    unlockedRuptura: true,
    requiredAnchors: 3,
    defaultCheckpointId: 'cp_c6_entry',
    defaultSpawnX: 160,
    defaultSpawnY: 460,
  },
};

export const CHAPTER_AREAS: AreaZone[] = [
  { id: 1, startX: 0, endX: 1350, title: 'O Primeiro Silêncio', subtitle: 'Área I · Despertar', whisper: 'Um núcleo desperta sobre águas imóveis.' },
  { id: 2, startX: 1350, endX: 2650, title: 'O Vestígio', subtitle: 'Área II · Traços Ocultos', whisper: 'Passarelas oxidadas guardam contornos do que existiu.' },
  { id: 3, startX: 2650, endX: 4100, title: 'A Memória', subtitle: 'Área III · Estado Eco', whisper: 'Invoque Eco para materializar pontes e lembranças apagadas.' },
  { id: 4, startX: 4100, endX: 5700, title: 'A Distorção', subtitle: 'Área IV · Estado Ruptura', whisper: 'Alinhe frequência, Eco e Ruptura para romper o selo espacial.' },
  { id: 5, startX: 5700, endX: 7050, title: 'O Chamado', subtitle: 'Área V · O Limiar', whisper: 'Além da última ponte, o Capítulo II aguarda seu passo.' },
];

export const CHAPTER_2_AREAS: AreaZone[] = [
  { id: 6, startX: 0, endX: 1350, title: 'O Silêncio Profundo', subtitle: 'Cap. II · Área I', whisper: 'Águas negras refletem colunas que nunca tocaram o teto.' },
  { id: 7, startX: 1350, endX: 2780, title: 'O Pêndulo de Fase', subtitle: 'Cap. II · Área II', whisper: 'Alterne entre Eco e Ruptura enquanto a arquitetura muda de lugar.' },
  { id: 8, startX: 2780, endX: 4355, title: 'O Arquivo de Ecos', subtitle: 'Cap. II · Área III', whisper: 'No arquivo suspenso, o que foi desfeito sustenta o caminho.' },
  { id: 9, startX: 4355, endX: 5950, title: 'O Abismo Invertido', subtitle: 'Cap. II · Área IV', whisper: 'Quando as três âncoras respondem, o abismo perde peso.' },
  { id: 10, startX: 5950, endX: 7350, title: 'A Convergência', subtitle: 'Cap. II · Área V', whisper: 'Todas as frequências retornam ao mesmo pulso no centro do limiar.' },
];

const CHAPTER_3_AREAS: AreaZone[] = [
  { id: 11, startX: 0, endX: 1380, title: 'Portões da Cidade Submersa', subtitle: 'Cap. III · Área I', whisper: 'Bastiões de concreto guardam ruas onde o vento não sopra.' },
  { id: 12, startX: 1380, endX: 2820, title: 'Aqueduto Partido', subtitle: 'Cap. III · Área II', whisper: 'Blocos caídos servem de degrau quando o caminho foi selado.' },
  { id: 13, startX: 2820, endX: 4280, title: 'Torre do Vigia', subtitle: 'Cap. III · Área III', whisper: 'Abaixe-se e caminhe sem pressa diante dos rastreadores.' },
  { id: 14, startX: 4280, endX: 5760, title: 'Praça dos Relógios Parados', subtitle: 'Cap. III · Área IV', whisper: 'Em Eco, até guardiões de ferro reconhecem o núcleo antigo.' },
  { id: 15, startX: 5760, endX: 7200, title: 'Catedral de Ferro', subtitle: 'Cap. III · Área V', whisper: 'O último elevador conduz às raízes abaixo da cidade.' },
];

const CHAPTER_4_AREAS: AreaZone[] = [
  { id: 16, startX: 0, endX: 1420, title: 'Beira do Esquecimento', subtitle: 'Cap. IV · Área I', whisper: 'Neblina densa sobe das fendas onde cabos descem ao escuro.' },
  { id: 17, startX: 1420, endX: 2880, title: 'Raízes do Eco', subtitle: 'Cap. IV · Área II', whisper: 'Escale as vinhas minerais e alinhe a memória oculta.' },
  { id: 18, startX: 2880, endX: 4380, title: 'Câmara dos Vultos', subtitle: 'Cap. IV · Área III', whisper: 'As sondas do véu patrulham enquanto o presente bloqueia o salto.' },
  { id: 19, startX: 4380, endX: 5860, title: 'Ponte Suspensa', subtitle: 'Cap. IV · Área IV', whisper: 'Três selos sustentam o último vão sobre o abismo.' },
  { id: 20, startX: 5860, endX: 7300, title: 'Fenda da Lembrança', subtitle: 'Cap. IV · Área V', whisper: 'Abaixo das memórias, as engrenagens da Convergência já giram.' },
];

const CHAPTER_5_AREAS: AreaZone[] = [
  { id: 21, startX: 0, endX: 1450, title: 'Câmara das Engrenagens', subtitle: 'Cap. V · Área I', whisper: 'Plataformas móveis cruzam o vazio em cadência milimétrica.' },
  { id: 22, startX: 1450, endX: 2950, title: 'Eixo de Fase', subtitle: 'Cap. V · Área II', whisper: 'Ruptura desloca pontes; Eco acalma a vigília.' },
  { id: 23, startX: 2950, endX: 4480, title: 'Corredor dos Guardiões', subtitle: 'Cap. V · Área III', whisper: 'Silêncio nos passos evita despertar o que guarda os arquivos.' },
  { id: 24, startX: 4480, endX: 6020, title: 'Tríade Harmônica', subtitle: 'Cap. V · Área IV', whisper: 'Empurre o contrapeso e sincronize as âncoras finais.' },
  { id: 25, startX: 6020, endX: 7500, title: 'Coração da Fratura', subtitle: 'Cap. V · Área V', whisper: 'Além do último selo, resta apenas o Limiar.' },
];

const CHAPTER_6_AREAS: AreaZone[] = [
  { id: 26, startX: 0, endX: 1320, title: 'Última Travessia', subtitle: 'Cap. VI · Área I', whisper: 'Uma claridade âmbar atravessa a neblina pela primeira vez.' },
  { id: 27, startX: 1320, endX: 2680, title: 'Jardim de Cinzas', subtitle: 'Cap. VI · Área II', whisper: 'Folhas douradas resistem entre colunas quebradas.' },
  { id: 28, startX: 2680, endX: 4080, title: 'Espelho do Núcleo', subtitle: 'Cap. VI · Área III', whisper: 'Todas as formas observam em silêncio a sua ascensão.' },
  { id: 29, startX: 4080, endX: 5480, title: 'Escadaria do Limiar', subtitle: 'Cap. VI · Área IV', whisper: 'Três últimas âncoras unem passado, instante e ruptura.' },
  { id: 30, startX: 5480, endX: 6900, title: 'Além da Forma', subtitle: 'Cap. VI · Área V', whisper: 'Onde o caminho termina, o despertar continua.' },
];

export function getChapterAreas(chapter: ChapterNumber): AreaZone[] {
  switch (chapter) {
    case 1:
      return CHAPTER_AREAS;
    case 2:
      return CHAPTER_2_AREAS;
    case 3:
      return CHAPTER_3_AREAS;
    case 4:
      return CHAPTER_4_AREAS;
    case 5:
      return CHAPTER_5_AREAS;
    case 6:
      return CHAPTER_6_AREAS;
  }
}

const mkPlat = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  mode: Platform['mode'] = 'ALWAYS_SOLID',
  extra: Partial<Platform> = {}
): Platform => ({
  id,
  x,
  y,
  w,
  h,
  mode,
  curX: x,
  curY: y,
  ...extra,
});

function buildMonoliths(seedOffset: number, count: number, withGears = false): BgMonolith[] {
  const monoliths: BgMonolith[] = [];
  for (let i = 0; i < count; i++) {
    const baseX = -200 + i * 210;
    const idx = i + seedOffset;
    monoliths.push({
      x: baseX,
      y: -120 + (idx % 3) * 44,
      w: 72 + (idx % 4) * 38,
      h: 740,
      depth: 0.17 + (idx % 3) * 0.08,
      kind: idx % 5 === 0 ? 'inverted' : idx % 3 === 0 ? 'arch' : 'pillar',
    });
  }
  for (let i = 0; i < Math.ceil(count * 0.45); i++) {
    monoliths.push({
      x: 150 + i * 390,
      y: -85,
      w: 110 + ((i + seedOffset) % 3) * 45,
      h: 760,
      depth: 0.42,
      kind: 'beam',
    });
  }
  for (let i = 0; i < Math.ceil(count * 0.55); i++) {
    monoliths.push({
      x: 230 + i * 320,
      y: -60,
      w: 4,
      h: 230 + ((i + seedOffset) % 4) * 75,
      depth: 0.65,
      kind: 'chain',
    });
  }
  if (withGears) {
    for (let i = 0; i < 12; i++) {
      monoliths.push({
        x: 340 + i * 620,
        y: 80 + (i % 3) * 70,
        w: 96 + (i % 3) * 34,
        h: 96 + (i % 3) * 34,
        depth: 0.28 + (i % 2) * 0.1,
        kind: 'gear',
      });
    }
  }
  return monoliths;
}

function buildVegetationOnPlatforms(
  platforms: Platform[],
  density = 1,
  kind: VegetationTuft['kind'] = 'grass'
): VegetationTuft[] {
  const tufts: VegetationTuft[] = [];
  for (const p of platforms) {
    if (p.mode !== 'ALWAYS_SOLID' || p.w < 130 || p.moveDx || p.moveDy) continue;
    const step = density > 1 ? 32 : 48;
    for (let x = p.x + 22; x < p.x + p.w - 22; x += step) {
      // Deterministic organic spacing
      const hash = Math.abs(Math.sin(x * 0.13 + p.y * 0.07));
      if (hash < 0.34) continue;
      tufts.push({
        x,
        y: p.y,
        height: 9 + Math.floor(hash * 11),
        kind: hash > 0.78 ? 'fern' : kind,
        bend: 0,
        bendVel: 0,
      });
    }
  }
  return tufts;
}

function buildFallingLeaves(maxX: number, count: number): FallingLeaf[] {
  const leaves: FallingLeaf[] = [];
  for (let i = 0; i < count; i++) {
    leaves.push({
      x: (i / Math.max(1, count)) * maxX,
      y: 40 + ((i * 73) % 360),
      vx: -10 - (i % 4) * 5,
      vy: 16 + (i % 5) * 4,
      phase: i * 0.9,
      size: 2.8 + (i % 3) * 1.1,
    });
  }
  return leaves;
}

function buildSilhouettes(maxX: number, count: number): DistantSilhouette[] {
  const list: DistantSilhouette[] = [];
  const poses: DistantSilhouette['pose'][] = ['watching', 'sentinel', 'fallen'];
  for (let i = 0; i < count; i++) {
    list.push({
      x: 560 + (i * (maxX - 800)) / Math.max(1, count),
      y: 255 + (i % 3) * 38,
      depth: 0.32 + (i % 2) * 0.14,
      pose: poses[i % poses.length],
    });
  }
  return list;
}

export function createChapterGeometry(chapterNumber: ChapterNumber): ChapterGeometry {
  switch (chapterNumber) {
    case 1:
      return createChapter1Geometry();
    case 2:
      return createChapter2Geometry();
    case 3:
      return createChapter3Geometry();
    case 4:
      return createChapter4Geometry();
    case 5:
      return createChapter5Geometry();
    case 6:
      return createChapter6Geometry();
  }
}

function createChapter1Geometry(): ChapterGeometry {
  const platforms: Platform[] = [
    // Área 1
    mkPlat('a1_ground_1', -120, 480, 740, 260, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('a1_step_1', 620, 450, 220, 290, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('a1_ground_2', 950, 450, 430, 290, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 2
    mkPlat('a2_ledge_1', 1470, 435, 220, 46, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('a2_ghost_preview', 1520, 310, 240, 22, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('a2_ledge_2', 1785, 390, 210, 46, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('a2_ledge_3', 2075, 355, 510, 120, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 3
    mkPlat('a3_echo_1', 2685, 370, 270, 26, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('a3_solid_mid', 3045, 395, 220, 75, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('a3_echo_2', 3345, 355, 220, 26, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('a3_present_wall', 3470, 240, 36, 115, 'PRESENT_ONLY', { material: 'concrete' }),
    mkPlat('a3_echo_3', 3630, 330, 210, 26, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('a3_end_terrace', 3890, 360, 340, 160, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 4
    mkPlat('a4_entry', 4230, 390, 280, 140, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('a4_ruptura_elev', 4615, 430, 185, 38, 'RUPTURA_SHIFT', {
      material: 'metal',
      rupturaDx: 0,
      rupturaDy: -155,
    }),
    mkPlat('a4_eco_balcony', 4320, 235, 265, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('a4_chamber', 4885, 410, 485, 140, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('a4_exit_ledge', 5435, 395, 320, 160, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 5
    mkPlat('a5_step_up_1', 5805, 375, 240, 180, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('a5_step_up_2', 6045, 355, 240, 200, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('a5_threshold_bridge', 6285, 335, 760, 220, 'ALWAYS_SOLID', { material: 'wet' }),
  ];

  const gates: SpatialGate[] = [
    { id: 'a4_spatial_gate', x: 5005, y: 230, w: 38, h: 180, curY: 230, openDy: -175, isOpen: false, requiresFrequencySwitch: true, permanentOnPuzzle: false },
    { id: 'a4_exit_seal', x: 5325, y: 230, w: 38, h: 180, curY: 230, openDy: -175, isOpen: false, permanentOnPuzzle: true },
  ];

  const nodes: InteractableNode[] = [
    { id: 'node_unlock_eco', x: 2410, y: 355, type: 'UNLOCK_ECO', title: 'Vestígio do Núcleo', hint: 'Despertar Estado ECO', activated: false },
    { id: 'node_unlock_ruptura', x: 4360, y: 390, type: 'UNLOCK_RUPTURA', title: 'Fratura Primordial', hint: 'Despertar Estado RUPTURA', activated: false },
    { id: 'anchor_1', x: 4410, y: 235, type: 'PUZZLE_ANCHOR', title: 'Âncora Harmônica I', hint: 'Alinhar Selo da Distorção (1/2)', activated: false },
    { id: 'node_freq_switch', x: 4935, y: 410, type: 'FREQUENCY_SWITCH', title: 'Ressoador de Fase', hint: 'Sincronizar Portão com Ruptura', activated: false },
    { id: 'anchor_2', x: 5185, y: 410, type: 'PUZZLE_ANCHOR', title: 'Âncora Harmônica II', hint: 'Alinhar Selo da Distorção (2/2)', activated: false },
    { id: 'chapter_threshold', x: 6860, y: 335, type: 'CHAPTER_THRESHOLD', title: 'O Limiar da Existência', hint: 'Avançar para Capítulo II', activated: false },
  ];

  const checkpoints: CheckpointData[] = [
    { id: 'cp_area_1', areaId: 1, x: 1080, y: 450, ignited: false },
    { id: 'cp_area_3', areaId: 3, x: 4020, y: 360, ignited: false },
    { id: 'cp_area_4', areaId: 4, x: 5580, y: 395, ignited: false },
  ];

  const memories: EchoMemory[] = [
    { id: 'mem_vestige_observer', x: 2230, y: 355, pose: 'watcher', whisper: 'Alguém observava a passagem antes da queda.', discovered: false },
    { id: 'mem_kneeling_silhouette', x: 3155, y: 395, pose: 'kneeling', whisper: 'Um eco ajoelhado guardou a ponte entre dois tempos.', discovered: false },
    { id: 'mem_fracture_witness', x: 4480, y: 235, pose: 'converged', whisper: 'Duas presenças fundiram suas frequências diante da fratura.', discovered: false },
    { id: 'mem_threshold_echo', x: 6560, y: 335, pose: 'converged', whisper: 'O Chamado sempre respondeu àqueles que mantêm o Núcleo aceso.', discovered: false },
  ];

  const climbables: ClimbableZone[] = [
    { id: 'c1_conduit_a2', x: 1560, y: 310, w: 30, h: 125, kind: 'conduit' },
  ];

  const creatures: Creature[] = [
    {
      id: 'c1_wisp_1',
      kind: 'veil_wisp',
      x: 5110,
      y: 355,
      baseX: 5110,
      baseY: 355,
      patrolMinX: 5055,
      patrolMaxX: 5270,
      vx: 52,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 0.4,
    },
  ];

  return {
    platforms,
    gates,
    nodes,
    checkpoints,
    monoliths: buildMonoliths(0, 42, false),
    memories,
    waterPools: [
      { id: 'water_a1', x: -120, y: 506, w: 1580, h: 240 },
      { id: 'water_a2', x: 1460, y: 518, w: 1200, h: 240 },
      { id: 'water_a3', x: 2660, y: 512, w: 1580, h: 240 },
      { id: 'water_a5', x: 6250, y: 500, w: 900, h: 250 },
    ],
    drips: [
      { x: 260, y: 120, groundY: 480, phase: 0.2 },
      { x: 730, y: 95, groundY: 450, phase: 1.4 },
      { x: 1580, y: 110, groundY: 435, phase: 2.1 },
      { x: 2320, y: 90, groundY: 355, phase: 0.9 },
      { x: 3980, y: 100, groundY: 360, phase: 1.8 },
      { x: 5120, y: 115, groundY: 410, phase: 2.7 },
      { x: 6440, y: 80, groundY: 335, phase: 0.5 },
    ],
    debris: Array.from({ length: 14 }, (_, i) => ({
      x: 4220 + i * 105,
      y: 120 + (i % 4) * 55,
      w: 16 + (i % 3) * 14,
      h: 10 + (i % 4) * 8,
      phase: i * 0.85,
    })),
    climbables,
    pushBlocks: [],
    hazards: [],
    vegetation: buildVegetationOnPlatforms(platforms, 1, 'grass'),
    leaves: buildFallingLeaves(7000, 18),
    creatures,
    silhouettes: buildSilhouettes(6800, 4),
    maxWorldX: 7010,
  };
}

function createChapter2Geometry(): ChapterGeometry {
  const platforms: Platform[] = [
    mkPlat('c2_a1_entry', -100, 430, 680, 260, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c2_a1_echo_span', 685, 405, 220, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c2_a1_solid_end', 990, 390, 360, 220, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c2_a2_ledge_1', 1455, 395, 230, 52, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c2_a2_rup_bridge', 1790, 430, 210, 36, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 0, rupturaDy: -95 }),
    mkPlat('c2_a2_present_wall', 1875, 245, 34, 110, 'PRESENT_ONLY', { material: 'concrete' }),
    mkPlat('c2_a2_mid_solid', 2095, 360, 635, 130, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c2_a2_step', 2350, 320, 120, 40, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c2_a2_echo_upper', 2080, 285, 240, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c2_a3_echo_1', 2825, 365, 250, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c2_a3_chamber_1', 3170, 385, 420, 110, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c2_a3_rup_slide', 3685, 385, 225, 34, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 80, rupturaDy: -35 }),
    mkPlat('c2_a3_end_terrace', 4050, 370, 290, 150, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c2_a4_entry', 4450, 385, 310, 130, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c2_a4_entry_step', 4695, 325, 65, 60, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c2_a4_echo_alcove', 4465, 270, 210, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c2_a4_shutter_wall', 4585, 155, 34, 115, 'PRESENT_ONLY', { material: 'concrete' }),
    mkPlat('c2_a4_rup_elev', 4850, 425, 180, 36, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 0, rupturaDy: -150 }),
    mkPlat('c2_a4_upper_bridge', 5110, 275, 240, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c2_a4_lower_vault', 5120, 410, 500, 135, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c2_a4_exit_ledge', 5710, 395, 240, 145, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c2_a5_step_1', 6040, 375, 220, 165, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c2_a5_step_2', 6340, 350, 200, 185, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c2_a5_sanctum', 6620, 325, 660, 230, 'ALWAYS_SOLID', { material: 'wet' }),
  ];

  const gates: SpatialGate[] = [
    { id: 'c2_archive_gate', x: 3395, y: 205, w: 38, h: 180, curY: 205, openDy: -175, isOpen: false, requiresFrequencySwitch: true, permanentOnPuzzle: false },
    { id: 'c2_exit_seal', x: 5510, y: 230, w: 38, h: 180, curY: 230, openDy: -175, isOpen: false, permanentOnPuzzle: true },
  ];

  const nodes: InteractableNode[] = [
    { id: 'c2_anchor_1', x: 2150, y: 285, type: 'PUZZLE_ANCHOR', title: 'Âncora do Pêndulo I', hint: 'Alinhar Selo do Chamado (1/3)', activated: false },
    { id: 'c2_freq_switch', x: 3255, y: 385, type: 'FREQUENCY_SWITCH', title: 'Ressoador do Arquivo', hint: 'Sincronizar Comporta com Ruptura', activated: false },
    { id: 'c2_anchor_2', x: 4515, y: 270, type: 'PUZZLE_ANCHOR', title: 'Âncora do Abismo II', hint: 'Alinhar Selo do Chamado (2/3)', activated: false },
    { id: 'c2_anchor_3', x: 5230, y: 275, type: 'PUZZLE_ANCHOR', title: 'Âncora do Abismo III', hint: 'Alinhar Selo do Chamado (3/3)', activated: false },
    { id: 'c2_convergence_altar', x: 7040, y: 325, type: 'CHAPTER_THRESHOLD', title: 'Altar do Chamado', hint: 'Avançar para Capítulo III', activated: false },
  ];

  const checkpoints: CheckpointData[] = [
    { id: 'cp_c2_area_1', areaId: 6, x: 1245, y: 390, ignited: false },
    { id: 'cp_c2_area_3', areaId: 8, x: 4205, y: 370, ignited: false },
    { id: 'cp_c2_area_4', areaId: 9, x: 5830, y: 395, ignited: false },
  ];

  const memories: EchoMemory[] = [
    { id: 'mem_c2_submerged_choir', x: 1110, y: 390, pose: 'watcher', whisper: 'As vozes submersas não chamavam por socorro — chamavam por alinhamento.', discovered: false },
    { id: 'mem_c2_pendulum_architect', x: 2590, y: 360, pose: 'kneeling', whisper: 'O arquiteto mediu o tempo pelas quedas, não pelos relógios.', discovered: false },
    { id: 'mem_c2_twin_oath', x: 3510, y: 385, pose: 'converged', whisper: 'Duas assinaturas harmônicas selaram o arquivo contra o esquecimento.', discovered: false },
    { id: 'mem_c2_inverted_spire', x: 5250, y: 410, pose: 'watcher', whisper: 'Quando os três selos responderam, o abismo deixou de puxar para baixo.', discovered: false },
    { id: 'mem_c2_core_origin', x: 6780, y: 325, pose: 'converged', whisper: 'O Núcleo não foi aprisionado — ele escolheu permanecer como farol.', discovered: false },
  ];

  const creatures: Creature[] = [
    {
      id: 'c2_warden_1',
      kind: 'hollow_warden',
      x: 5310,
      y: 410,
      baseX: 5310,
      baseY: 410,
      patrolMinX: 5160,
      patrolMaxX: 5470,
      vx: 42,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 0.9,
    },
  ];

  return {
    platforms,
    gates,
    nodes,
    checkpoints,
    monoliths: buildMonoliths(2, 44, true),
    memories,
    waterPools: [
      { id: 'c2_water_a1', x: -160, y: 472, w: 1560, h: 250 },
      { id: 'c2_water_a2', x: 1420, y: 492, w: 1380, h: 250 },
      { id: 'c2_water_a3', x: 2800, y: 488, w: 1620, h: 250 },
      { id: 'c2_water_a5', x: 6020, y: 480, w: 1460, h: 260 },
    ],
    drips: [
      { x: 260, y: 95, groundY: 430, phase: 0.3 },
      { x: 1150, y: 80, groundY: 390, phase: 1.7 },
      { x: 1560, y: 90, groundY: 395, phase: 0.9 },
      { x: 2420, y: 75, groundY: 360, phase: 2.2 },
      { x: 3320, y: 85, groundY: 385, phase: 1.1 },
      { x: 4620, y: 90, groundY: 385, phase: 2.5 },
      { x: 5380, y: 85, groundY: 410, phase: 0.6 },
      { x: 6880, y: 70, groundY: 325, phase: 1.4 },
    ],
    debris: Array.from({ length: 18 }, (_, i) => ({
      x: 4380 + i * 105,
      y: 110 + (i % 4) * 52,
      w: 18 + (i % 3) * 14,
      h: 10 + (i % 4) * 8,
      phase: i * 0.78,
    })),
    climbables: [{ id: 'c2_chain_a4', x: 4720, y: 270, w: 28, h: 115, kind: 'chain' }],
    pushBlocks: [],
    hazards: [],
    vegetation: buildVegetationOnPlatforms(platforms, 1, 'moss'),
    leaves: buildFallingLeaves(7300, 18),
    creatures,
    silhouettes: buildSilhouettes(7100, 5),
    maxWorldX: 7240,
  };
}

function createChapter3Geometry(): ChapterGeometry {
  // Capítulo III: A Cidade Esquecida
  const platforms: Platform[] = [
    // Área 11: Portões da Cidade Submersa
    mkPlat('c3_a1_plaza', -100, 430, 620, 260, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c3_a1_bridge', 640, 415, 250, 38, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c3_a1_terrace', 1005, 395, 395, 220, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 12: Aqueduto Partido (push block + elevation + climb)
    mkPlat('c3_a2_basin', 1495, 420, 480, 150, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c3_a2_aqueduct_wall', 1845, 285, 130, 135, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c3_a2_echo_span', 2070, 325, 220, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c3_a2_elevator', 2380, 385, 165, 30, 'ALWAYS_SOLID', {
      material: 'metal',
      moveDx: 0,
      moveDy: -110,
      movePeriod: 5.2,
      movePhase: 0.2,
    }),
    mkPlat('c3_a2_upper_walk', 2625, 315, 245, 130, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 13: Torre do Vigia (stalker stealth + Echo)
    mkPlat('c3_a3_corridor', 2965, 370, 740, 145, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c3_a3_alcove_echo', 3180, 255, 210, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c3_a3_rup_lift', 3795, 405, 175, 32, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 0, rupturaDy: -115 }),
    mkPlat('c3_a3_tower_end', 4040, 340, 270, 170, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 14: Praça dos Relógios Parados (warden + anchors + gates)
    mkPlat('c3_a4_entry', 4395, 375, 320, 140, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c3_a4_ferry', 4795, 375, 160, 28, 'ALWAYS_SOLID', {
      material: 'metal',
      moveDx: 155,
      moveDy: 0,
      movePeriod: 5.6,
      movePhase: 0,
    }),
    mkPlat('c3_a4_inner_court', 5175, 375, 580, 155, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c3_a4_present_divider', 5365, 260, 34, 115, 'PRESENT_ONLY', { material: 'concrete' }),
    // Área 15: Catedral de Ferro
    mkPlat('c3_a5_steps_1', 5850, 360, 240, 170, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c3_a5_steps_2', 6175, 335, 240, 195, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c3_a5_sanctum', 6495, 315, 650, 230, 'ALWAYS_SOLID', { material: 'wet' }),
  ];

  const gates: SpatialGate[] = [
    { id: 'c3_aqueduct_gate', x: 3530, y: 190, w: 38, h: 180, curY: 190, openDy: -175, isOpen: false, requiresFrequencySwitch: true, permanentOnPuzzle: false },
    { id: 'c3_cathedral_seal', x: 5645, y: 195, w: 38, h: 180, curY: 195, openDy: -175, isOpen: false, permanentOnPuzzle: true },
  ];

  const nodes: InteractableNode[] = [
    { id: 'c3_anchor_1', x: 1905, y: 285, type: 'PUZZLE_ANCHOR', title: 'Âncora do Aqueduto I', hint: 'Alinhar Selo da Cidade (1/3)', activated: false },
    { id: 'c3_freq_switch', x: 3255, y: 255, type: 'FREQUENCY_SWITCH', title: 'Ressoador da Torre', hint: 'Sincronizar Comporta com Ruptura', activated: false },
    { id: 'c3_anchor_2', x: 4520, y: 375, type: 'PUZZLE_ANCHOR', title: 'Âncora da Praça II', hint: 'Alinhar Selo da Cidade (2/3)', activated: false },
    { id: 'c3_anchor_3', x: 5510, y: 375, type: 'PUZZLE_ANCHOR', title: 'Âncora da Catedral III', hint: 'Alinhar Selo da Cidade (3/3)', activated: false },
    { id: 'c3_threshold', x: 6930, y: 315, type: 'CHAPTER_THRESHOLD', title: 'Descida ao Abismo', hint: 'Avançar para Capítulo IV', activated: false },
  ];

  const checkpoints: CheckpointData[] = [
    { id: 'cp_c3_area_1', areaId: 11, x: 1250, y: 395, ignited: false },
    { id: 'cp_c3_area_3', areaId: 13, x: 4160, y: 340, ignited: false },
    { id: 'cp_c3_area_4', areaId: 14, x: 5930, y: 360, ignited: false },
  ];

  const memories: EchoMemory[] = [
    { id: 'mem_c3_gate_watch', x: 1110, y: 395, pose: 'watcher', whisper: 'As comportas fecharam-se quando a água subiu além dos arcos.', discovered: false },
    { id: 'mem_c3_mason', x: 2740, y: 315, pose: 'kneeling', whisper: 'Nenhum tijolo foi posto ao acaso; cada bloco guarda um contrapeso.', discovered: false },
    { id: 'mem_c3_warden_vigil', x: 4475, y: 375, pose: 'watcher', whisper: 'Os guardiões de ferro ainda reconhecem a chama do Núcleo.', discovered: false },
    { id: 'mem_c3_cathedral_choir', x: 6680, y: 315, pose: 'converged', whisper: 'Abaixo do ferro silencioso, o abismo respira com voz própria.', discovered: false },
  ];

  const climbables: ClimbableZone[] = [
    { id: 'c3_conduit_tower', x: 3105, y: 255, w: 32, h: 115, kind: 'conduit' },
  ];

  const pushBlocks: PushBlock[] = [
    { id: 'c3_block_aqueduct', x: 1620, y: 372, w: 48, h: 48, curX: 1620, curY: 372, vx: 0, vy: 0, material: 'stone' },
  ];

  const creatures: Creature[] = [
    {
      id: 'c3_stalker_1',
      kind: 'archive_stalker',
      x: 3330,
      y: 370,
      baseX: 3330,
      baseY: 370,
      patrolMinX: 3150,
      patrolMaxX: 3490,
      vx: 62,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 0.3,
    },
    {
      id: 'c3_warden_1',
      kind: 'hollow_warden',
      x: 5260,
      y: 375,
      baseX: 5260,
      baseY: 375,
      patrolMinX: 5205,
      patrolMaxX: 5580,
      vx: 44,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 1.5,
    },
  ];

  return {
    platforms,
    gates,
    nodes,
    checkpoints,
    monoliths: buildMonoliths(4, 44, true),
    memories,
    waterPools: [
      { id: 'c3_w1', x: -160, y: 472, w: 1580, h: 250 },
      { id: 'c3_w2', x: 1440, y: 495, w: 1480, h: 250 },
      { id: 'c3_w3', x: 5800, y: 475, w: 1450, h: 250 },
    ],
    drips: [
      { x: 310, y: 90, groundY: 430, phase: 0.5 },
      { x: 1690, y: 85, groundY: 420, phase: 1.9 },
      { x: 3250, y: 70, groundY: 370, phase: 1.2 },
      { x: 5410, y: 75, groundY: 375, phase: 2.4 },
      { x: 6720, y: 70, groundY: 315, phase: 0.7 },
    ],
    debris: Array.from({ length: 12 }, (_, i) => ({
      x: 4320 + i * 118,
      y: 110 + (i % 3) * 48,
      w: 20 + (i % 3) * 12,
      h: 12 + (i % 2) * 8,
      phase: i * 0.7,
    })),
    climbables,
    pushBlocks,
    hazards: [{ id: 'c3_steam_gap', x: 2020, y: 505, w: 460, h: 65, kind: 'abyss_steam' }],
    vegetation: buildVegetationOnPlatforms(platforms, 1, 'moss'),
    leaves: buildFallingLeaves(7150, 20),
    creatures,
    silhouettes: buildSilhouettes(7000, 5),
    maxWorldX: 7160,
  };
}

function createChapter4Geometry(): ChapterGeometry {
  // Capítulo IV: O Abismo das Memórias
  const platforms: Platform[] = [
    // Área 16: Beira do Esquecimento
    mkPlat('c4_a1_edge', -100, 420, 560, 260, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c4_a1_echo_arc', 565, 385, 220, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c4_a1_pillar', 875, 370, 175, 220, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c4_a1_end', 1140, 390, 320, 200, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 17: Raízes do Eco (vines climb + high path)
    mkPlat('c4_a2_lower', 1555, 425, 340, 150, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c4_a2_upper_root', 1625, 265, 255, 28, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c4_a2_echo_step', 1975, 290, 230, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c4_a2_basin', 2285, 380, 535, 150, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 18: Câmara dos Vultos (veil wisps + present wall + push block)
    mkPlat('c4_a3_hall', 2915, 380, 680, 150, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c4_a3_present_wall', 3240, 265, 34, 115, 'PRESENT_ONLY', { material: 'concrete' }),
    mkPlat('c4_a3_elev', 3685, 410, 165, 30, 'ALWAYS_SOLID', {
      material: 'metal',
      moveDx: 0,
      moveDy: -115,
      movePeriod: 4.8,
      movePhase: 0.4,
    }),
    mkPlat('c4_a3_terrace', 3940, 330, 390, 175, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 19: Ponte Suspensa
    mkPlat('c4_a4_entry', 4425, 365, 330, 145, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c4_a4_rup_span', 4850, 410, 200, 34, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 0, rupturaDy: -105 }),
    mkPlat('c4_a4_vault', 5140, 360, 680, 155, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c4_a4_high_echo', 5240, 240, 220, 24, 'ECHO_ONLY', { material: 'stone' }),
    // Área 20: Fenda da Lembrança
    mkPlat('c4_a5_bridge_1', 5915, 350, 260, 165, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c4_a5_bridge_2', 6260, 325, 250, 190, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c4_a5_sanctum', 6595, 305, 650, 240, 'ALWAYS_SOLID', { material: 'wet' }),
  ];

  const gates: SpatialGate[] = [
    { id: 'c4_vault_gate', x: 5495, y: 180, w: 38, h: 180, curY: 180, openDy: -175, isOpen: false, requiresFrequencySwitch: true, permanentOnPuzzle: false },
    { id: 'c4_memory_seal', x: 5745, y: 180, w: 38, h: 180, curY: 180, openDy: -175, isOpen: false, permanentOnPuzzle: true },
  ];

  const nodes: InteractableNode[] = [
    { id: 'c4_anchor_1', x: 1745, y: 265, type: 'PUZZLE_ANCHOR', title: 'Âncora das Raízes I', hint: 'Alinhar Selo do Abismo (1/3)', activated: false },
    { id: 'c4_freq_switch', x: 4075, y: 330, type: 'FREQUENCY_SWITCH', title: 'Ressoador dos Vultos', hint: 'Sincronizar Comporta com Ruptura', activated: false },
    { id: 'c4_anchor_2', x: 3460, y: 380, type: 'PUZZLE_ANCHOR', title: 'Âncora dos Vultos II', hint: 'Alinhar Selo do Abismo (2/3)', activated: false },
    { id: 'c4_anchor_3', x: 5345, y: 240, type: 'PUZZLE_ANCHOR', title: 'Âncora da Ponte III', hint: 'Alinhar Selo do Abismo (3/3)', activated: false },
    { id: 'c4_threshold', x: 7020, y: 305, type: 'CHAPTER_THRESHOLD', title: 'Portal da Convergência', hint: 'Avançar para Capítulo V', activated: false },
  ];

  const checkpoints: CheckpointData[] = [
    { id: 'cp_c4_area_1', areaId: 16, x: 1320, y: 390, ignited: false },
    { id: 'cp_c4_area_3', areaId: 18, x: 4210, y: 330, ignited: false },
    { id: 'cp_c4_area_4', areaId: 19, x: 6020, y: 350, ignited: false },
  ];

  const memories: EchoMemory[] = [
    { id: 'mem_c4_roots', x: 1680, y: 425, pose: 'kneeling', whisper: 'As raízes antigas abraçaram as pedras para impedir que o fundo cedesse.', discovered: false },
    { id: 'mem_c4_whisper_hall', x: 3030, y: 380, pose: 'watcher', whisper: 'Cada sonda do véu guarda um fragmento de alguém que hesitou.', discovered: false },
    { id: 'mem_c4_suspended_bridge', x: 5230, y: 360, pose: 'converged', whisper: 'Atravessar o abismo exige lembrar sem temer a perda.', discovered: false },
    { id: 'mem_c4_converge_threshold', x: 6760, y: 305, pose: 'converged', whisper: 'Todas as memórias apontam para o centro da fratura.', discovered: false },
  ];

  const climbables: ClimbableZone[] = [
    { id: 'c4_vine_a2', x: 1660, y: 265, w: 32, h: 160, kind: 'vine' },
    { id: 'c4_chain_a4', x: 5185, y: 240, w: 30, h: 120, kind: 'chain' },
  ];

  const pushBlocks: PushBlock[] = [
    { id: 'c4_block_a2', x: 2430, y: 332, w: 48, h: 48, curX: 2430, curY: 332, vx: 0, vy: 0, material: 'stone' },
  ];

  const creatures: Creature[] = [
    {
      id: 'c4_wisp_1',
      kind: 'veil_wisp',
      x: 3140,
      y: 325,
      baseX: 3140,
      baseY: 325,
      patrolMinX: 2980,
      patrolMaxX: 3360,
      vx: 58,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 0.6,
    },
    {
      id: 'c4_stalker_1',
      kind: 'archive_stalker',
      x: 5310,
      y: 360,
      baseX: 5310,
      baseY: 360,
      patrolMinX: 5170,
      patrolMaxX: 5460,
      vx: 65,
      facing: -1,
      state: 'patrol',
      alertTimer: 0,
      phase: 1.4,
    },
  ];

  return {
    platforms,
    gates,
    nodes,
    checkpoints,
    monoliths: buildMonoliths(6, 46, false),
    memories,
    waterPools: [
      { id: 'c4_w1', x: -160, y: 478, w: 1600, h: 260 },
      { id: 'c4_w4', x: 5880, y: 475, w: 1450, h: 260 },
    ],
    drips: [
      { x: 320, y: 80, groundY: 420, phase: 0.4 },
      { x: 1750, y: 90, groundY: 425, phase: 1.8 },
      { x: 3150, y: 85, groundY: 380, phase: 1.1 },
      { x: 5250, y: 80, groundY: 360, phase: 2.3 },
      { x: 6780, y: 70, groundY: 305, phase: 0.8 },
    ],
    debris: Array.from({ length: 16 }, (_, i) => ({
      x: 1500 + i * 320,
      y: 95 + (i % 4) * 50,
      w: 18 + (i % 3) * 14,
      h: 12 + (i % 3) * 8,
      phase: i * 0.9,
    })),
    climbables,
    pushBlocks,
    hazards: [
      { id: 'c4_steam_1', x: 1890, y: 505, w: 420, h: 65, kind: 'abyss_steam' },
      { id: 'c4_steam_2', x: 4740, y: 500, w: 420, h: 65, kind: 'ruptura_surge' },
    ],
    vegetation: buildVegetationOnPlatforms(platforms, 1.3, 'fern'),
    leaves: buildFallingLeaves(7250, 26),
    creatures,
    silhouettes: buildSilhouettes(7100, 6),
    maxWorldX: 7260,
  };
}

function createChapter5Geometry(): ChapterGeometry {
  // Capítulo V: A Convergência
  const platforms: Platform[] = [
    // Área 21: Câmara das Engrenagens
    mkPlat('c5_a1_entry', -100, 430, 520, 250, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c5_a1_gear_lift_1', 515, 395, 165, 28, 'ALWAYS_SOLID', { material: 'metal', moveDx: 0, moveDy: -90, movePeriod: 4.5, movePhase: 0 }),
    mkPlat('c5_a1_gear_shuttle', 775, 330, 175, 28, 'ALWAYS_SOLID', { material: 'metal', moveDx: 150, moveDy: 0, movePeriod: 5.0, movePhase: 1.2 }),
    mkPlat('c5_a1_end', 1170, 370, 310, 210, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 22: Eixo de Fase
    mkPlat('c5_a2_bridge', 1575, 385, 340, 140, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c5_a2_rup_deck', 2005, 415, 215, 32, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 65, rupturaDy: -80 }),
    mkPlat('c5_a2_echo_deck', 2335, 330, 240, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c5_a2_end', 2660, 360, 320, 165, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 23: Corredor dos Guardiões
    mkPlat('c5_a3_corridor', 3075, 375, 860, 150, 'ALWAYS_SOLID', { material: 'concrete' }),
    mkPlat('c5_a3_present_shield', 3510, 260, 34, 115, 'PRESENT_ONLY', { material: 'concrete' }),
    mkPlat('c5_a3_echo_catwalk', 3320, 250, 260, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c5_a3_end', 4030, 365, 390, 160, 'ALWAYS_SOLID', { material: 'metal' }),
    // Área 24: Tríade Harmônica
    mkPlat('c5_a4_entry', 4510, 385, 420, 150, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c5_a4_step_high', 4765, 265, 165, 26, 'ALWAYS_SOLID', { material: 'metal' }),
    mkPlat('c5_a4_rup_span', 5020, 410, 195, 32, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 0, rupturaDy: -110 }),
    mkPlat('c5_a4_chamber', 5305, 355, 670, 165, 'ALWAYS_SOLID', { material: 'concrete' }),
    // Área 25: Coração da Fratura
    mkPlat('c5_a5_step_1', 6065, 345, 240, 180, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c5_a5_step_2', 6390, 320, 240, 205, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c5_a5_core', 6715, 295, 690, 245, 'ALWAYS_SOLID', { material: 'wet' }),
  ];

  const gates: SpatialGate[] = [
    { id: 'c5_guard_gate', x: 3825, y: 195, w: 38, h: 180, curY: 195, openDy: -175, isOpen: false, requiresFrequencySwitch: true, permanentOnPuzzle: false },
    { id: 'c5_core_seal', x: 5895, y: 175, w: 38, h: 180, curY: 175, openDy: -175, isOpen: false, permanentOnPuzzle: true },
  ];

  const nodes: InteractableNode[] = [
    { id: 'c5_anchor_1', x: 2440, y: 330, type: 'PUZZLE_ANCHOR', title: 'Âncora do Eixo I', hint: 'Alinhar Selo da Convergência (1/3)', activated: false },
    { id: 'c5_freq_switch', x: 3440, y: 250, type: 'FREQUENCY_SWITCH', title: 'Ressoador da Tríade', hint: 'Sincronizar Portão dos Guardiões', activated: false },
    { id: 'c5_anchor_2', x: 4845, y: 265, type: 'PUZZLE_ANCHOR', title: 'Âncora do Contrapeso II', hint: 'Alinhar Selo da Convergência (2/3)', activated: false },
    { id: 'c5_anchor_3', x: 5710, y: 355, type: 'PUZZLE_ANCHOR', title: 'Âncora do Coração III', hint: 'Alinhar Selo da Convergência (3/3)', activated: false },
    { id: 'c5_threshold', x: 7160, y: 295, type: 'CHAPTER_THRESHOLD', title: 'Portal do Limiar', hint: 'Avançar para Capítulo VI', activated: false },
  ];

  const checkpoints: CheckpointData[] = [
    { id: 'cp_c5_area_1', areaId: 21, x: 1350, y: 370, ignited: false },
    { id: 'cp_c5_area_3', areaId: 23, x: 4230, y: 365, ignited: false },
    { id: 'cp_c5_area_4', areaId: 24, x: 6160, y: 345, ignited: false },
  ];

  const memories: EchoMemory[] = [
    { id: 'mem_c5_gears', x: 1255, y: 370, pose: 'watcher', whisper: 'As engrenagens não medem horas — medem alinhamentos entre mundos.', discovered: false },
    { id: 'mem_c5_guardians', x: 4135, y: 365, pose: 'kneeling', whisper: 'Em paz com Eco, o guardião depõe sua vigília milenar.', discovered: false },
    { id: 'mem_c5_triad', x: 5470, y: 355, pose: 'converged', whisper: 'Três estados sustentam uma só existência sob tensão perfeita.', discovered: false },
    { id: 'mem_c5_fracture_heart', x: 6910, y: 295, pose: 'converged', whisper: 'Diante do último portal, nada do que foi vivido se perdeu.', discovered: false },
  ];

  const climbables: ClimbableZone[] = [
    { id: 'c5_conduit_a3', x: 3255, y: 250, w: 30, h: 125, kind: 'conduit' },
    { id: 'c5_chain_a4', x: 4785, y: 265, w: 30, h: 120, kind: 'chain' },
  ];

  const pushBlocks: PushBlock[] = [
    { id: 'c5_block_triad', x: 4620, y: 337, w: 48, h: 48, curX: 4620, curY: 337, vx: 0, vy: 0, material: 'metal' },
  ];

  const creatures: Creature[] = [
    {
      id: 'c5_wisp_1',
      kind: 'veil_wisp',
      x: 1740,
      y: 330,
      baseX: 1740,
      baseY: 330,
      patrolMinX: 1610,
      patrolMaxX: 1880,
      vx: 56,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 0.4,
    },
    {
      id: 'c5_stalker_1',
      kind: 'archive_stalker',
      x: 3320,
      y: 375,
      baseX: 3320,
      baseY: 375,
      patrolMinX: 3110,
      patrolMaxX: 3480,
      vx: 66,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 1.1,
    },
    {
      id: 'c5_warden_1',
      kind: 'hollow_warden',
      x: 5510,
      y: 355,
      baseX: 5510,
      baseY: 355,
      patrolMinX: 5340,
      patrolMaxX: 5760,
      vx: 46,
      facing: -1,
      state: 'patrol',
      alertTimer: 0,
      phase: 2.0,
    },
  ];

  return {
    platforms,
    gates,
    nodes,
    checkpoints,
    monoliths: buildMonoliths(8, 46, true),
    memories,
    waterPools: [
      { id: 'c5_w1', x: -160, y: 480, w: 1640, h: 260 },
      { id: 'c5_w5', x: 6040, y: 472, w: 1480, h: 260 },
    ],
    drips: [
      { x: 280, y: 90, groundY: 430, phase: 0.2 },
      { x: 1710, y: 80, groundY: 385, phase: 1.4 },
      { x: 3640, y: 85, groundY: 375, phase: 2.0 },
      { x: 5520, y: 75, groundY: 355, phase: 0.9 },
      { x: 6980, y: 65, groundY: 295, phase: 1.7 },
    ],
    debris: Array.from({ length: 18 }, (_, i) => ({
      x: 1600 + i * 310,
      y: 100 + (i % 4) * 48,
      w: 18 + (i % 3) * 14,
      h: 12 + (i % 3) * 8,
      phase: i * 0.72,
    })),
    climbables,
    pushBlocks,
    hazards: [{ id: 'c5_surge_1', x: 2220, y: 500, w: 420, h: 65, kind: 'ruptura_surge' }],
    vegetation: buildVegetationOnPlatforms(platforms, 1, 'grass'),
    leaves: buildFallingLeaves(7400, 16),
    creatures,
    silhouettes: buildSilhouettes(7200, 6),
    maxWorldX: 7410,
  };
}

function createChapter6Geometry(): ChapterGeometry {
  // Capítulo VI: O Limiar da Existência (Ascensão e Encerramento)
  const platforms: Platform[] = [
    // Área 26: Última Travessia
    mkPlat('c6_a1_start', -100, 460, 640, 260, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c6_a1_step', 640, 425, 220, 260, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c6_a1_terrace', 955, 395, 365, 240, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 27: Jardim de Cinzas
    mkPlat('c6_a2_garden_1', 1420, 380, 420, 170, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c6_a2_echo_arch', 1935, 335, 250, 24, 'ECHO_ONLY', { material: 'stone' }),
    mkPlat('c6_a2_garden_2', 2280, 360, 400, 180, 'ALWAYS_SOLID', { material: 'stone' }),
    // Área 28: Espelho do Núcleo
    mkPlat('c6_a3_mirror_1', 2780, 360, 560, 175, 'ALWAYS_SOLID', { material: 'wet' }),
    mkPlat('c6_a3_elev', 3435, 395, 165, 28, 'ALWAYS_SOLID', { material: 'metal', moveDx: 0, moveDy: -100, movePeriod: 5.4, movePhase: 0.3 }),
    mkPlat('c6_a3_mirror_2', 3695, 315, 385, 195, 'ALWAYS_SOLID', { material: 'wet' }),
    // Área 29: Escadaria do Limiar
    mkPlat('c6_a4_base', 4175, 345, 390, 175, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c6_a4_rup_bridge', 4660, 390, 195, 32, 'RUPTURA_SHIFT', { material: 'metal', rupturaDx: 0, rupturaDy: -95 }),
    mkPlat('c6_a4_upper', 4945, 310, 535, 190, 'ALWAYS_SOLID', { material: 'stone' }),
    // Área 30: Além da Forma
    mkPlat('c6_a5_ascent_1', 5575, 290, 240, 210, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c6_a5_ascent_2', 5900, 265, 240, 235, 'ALWAYS_SOLID', { material: 'stone' }),
    mkPlat('c6_a5_horizon', 6225, 245, 675, 265, 'ALWAYS_SOLID', { material: 'wet' }),
  ];

  const gates: SpatialGate[] = [
    { id: 'c6_final_seal', x: 5395, y: 130, w: 38, h: 180, curY: 130, openDy: -175, isOpen: false, permanentOnPuzzle: true },
  ];

  const nodes: InteractableNode[] = [
    { id: 'c6_anchor_1', x: 2060, y: 335, type: 'PUZZLE_ANCHOR', title: 'Âncora das Cinzas I', hint: 'Unir Memória Final (1/3)', activated: false },
    { id: 'c6_anchor_2', x: 3860, y: 315, type: 'PUZZLE_ANCHOR', title: 'Âncora do Espelho II', hint: 'Unir Memória Final (2/3)', activated: false },
    { id: 'c6_anchor_3', x: 5195, y: 310, type: 'PUZZLE_ANCHOR', title: 'Âncora do Limiar III', hint: 'Unir Memória Final (3/3)', activated: false },
    { id: 'c6_finale_threshold', x: 6680, y: 245, type: 'CHAPTER_THRESHOLD', title: 'O Limiar Aberto', hint: 'Concluir Travessia', activated: false },
  ];

  const checkpoints: CheckpointData[] = [
    { id: 'cp_c6_area_1', areaId: 26, x: 1180, y: 395, ignited: false },
    { id: 'cp_c6_area_3', areaId: 28, x: 3960, y: 315, ignited: false },
    { id: 'cp_c6_area_4', areaId: 29, x: 5690, y: 290, ignited: false },
  ];

  const memories: EchoMemory[] = [
    { id: 'mem_c6_ashes', x: 1620, y: 380, pose: 'kneeling', whisper: 'Mesmo sobre cinzas antigas, o núcleo aprende a florescer.', discovered: false },
    { id: 'mem_c6_mirror', x: 3040, y: 360, pose: 'converged', whisper: 'O reflexo nas águas já não mostra solidão, mas companhia.', discovered: false },
    { id: 'mem_c6_watchers', x: 4380, y: 345, pose: 'watcher', whisper: 'As presenças distantes baixam o olhar; o caminho está livre.', discovered: false },
    { id: 'mem_c6_beyond', x: 6440, y: 245, pose: 'converged', whisper: 'Entre o que fomos e o que seremos, existe apenas o Limiar.', discovered: false },
  ];

  const climbables: ClimbableZone[] = [
    { id: 'c6_spire_chain', x: 4310, y: 230, w: 32, h: 115, kind: 'chain' },
  ];

  const creatures: Creature[] = [
    {
      id: 'c6_warden_peace',
      kind: 'hollow_warden',
      x: 3110,
      y: 360,
      baseX: 3110,
      baseY: 360,
      patrolMinX: 2850,
      patrolMaxX: 3270,
      vx: 32,
      facing: 1,
      state: 'patrol',
      alertTimer: 0,
      phase: 0.7,
    },
  ];

  return {
    platforms,
    gates,
    nodes,
    checkpoints,
    monoliths: buildMonoliths(10, 44, false),
    memories,
    waterPools: [
      { id: 'c6_w1', x: -160, y: 495, w: 1560, h: 250 },
      { id: 'c6_w3', x: 2740, y: 488, w: 1380, h: 250 },
      { id: 'c6_w5', x: 6180, y: 470, w: 920, h: 260 },
    ],
    drips: [
      { x: 250, y: 90, groundY: 460, phase: 0.4 },
      { x: 1580, y: 80, groundY: 380, phase: 1.5 },
      { x: 3000, y: 75, groundY: 360, phase: 2.1 },
      { x: 6500, y: 60, groundY: 245, phase: 0.9 },
    ],
    debris: Array.from({ length: 12 }, (_, i) => ({
      x: 4100 + i * 210,
      y: 90 + (i % 3) * 42,
      w: 16 + (i % 3) * 10,
      h: 10 + (i % 2) * 8,
      phase: i * 0.65,
    })),
    climbables,
    pushBlocks: [],
    hazards: [],
    vegetation: buildVegetationOnPlatforms(platforms, 1.8, 'grass'),
    leaves: buildFallingLeaves(6900, 34),
    creatures,
    silhouettes: buildSilhouettes(6650, 7),
    maxWorldX: 6850,
  };
}

// Backward compatibility aliases
export const createWorldGeometry = createChapter1Geometry;
export const createChapter2ThresholdGeometry = createChapter2Geometry;
