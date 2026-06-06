(function () {
  const errorBox = document.getElementById('runtimeError');
  const showError = (message) => {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.add('open');
  };

  if (!window.PIXI) {
    showError('PixiJS did not load. Check the network connection or bundle pixi locally.');
    return;
  }

  const PIXI = window.PIXI;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

  const mount = document.getElementById('pixiMount');
  const shell = document.getElementById('gameShell');
  const berriesConfig = window.BerriesConfig || { berries: [], getResourceWeight: () => 1 };
  const buildingsConfig = window.BuildingsConfig || { buildings: [], getBuildingLayout: () => [] };
  const scenarioConfig = window.ScenarioObjectsConfig || { objects: [] };

  const DEFAULT_MAP_WIDTH = 25;
  const DEFAULT_MAP_HEIGHT = 25;
  const DEFAULT_ISLAND_SIZE = 18;
  const WORLD_ZOOM = 1.15;
  const BASE_CELL_PX = 28;

  const SPAWN_MS = 1000;
  const BURST_R_PCT = 12;
  const PICK_R_PCT = 8;
  const PICK_COOLDOWN_MS = 1;
  const BUSH_GROW_MS = 1000;
  const BERRIES_GROW_MS = 100;
  const BERRIES_MIN_MAX = [6, 9];
  const SCATTER_MIN_PCT = 5;
  const SCATTER_MAX_PCT = 13;
  const BERRY_FLY_MS = 200;
  const LEAF_COUNT = 28;
  const LEAF_LIFE_MS = 700;
  const LEAF_SPD_MIN = 6;
  const LEAF_SPD_MAX = 10;
  const RESOURCE_BURST_COUNT = 34;
  const CENTERED_RESOURCE_BURST_COUNT = 58;
  const WOOD_CHIP_COUNT = 9;
  const WOOD_CHIP_LIFE_MS = 560;
  const WOOD_CHIP_SPD_MIN = 7;
  const WOOD_CHIP_SPD_MAX = 14;
  const TREE_CHOP_SHAKE_MS = 520;
  const TREE_CHOP_SHAKE_ROT = 0.11;
  const TREE_SHADOW_FADE_MS = 300;
  const BERRY_R_PCT = 1.2;
  const BUSH_R_PCT = 3.7;
  const BUSH_TOP_GROW_MULT = 1.2;
  const PICK_OUT_MS = 200;
  const PICK_IN_MS = 200;
  const PICK_OUT_DIST_PCT = 1;
  const PICK_TARGET_UP_CELLS = 2.2;
  const DEFAULT_MIN_SPAWN_RADIUS = 0;
  const DEFAULT_MAX_SPAWN_RADIUS = 10;
  const EXTRACT_PARTICLE_COUNT = 3;
  const RESOURCE_COLLIDER_PADDING = 1;
  const RESOURCE_FARMING_PADDING = RESOURCE_COLLIDER_PADDING + 1;
  const COLLIDER_SPAWN_HERO_BUFFER_CELLS = 2;
  const OFFLINE_FILL_WINDOW_MS = 60 * 60 * 1000;
  const RESOURCE_LAST_SEEN_KEY = 'resourceLastSeenAt';
  const TARGET_BUSHES_AT_CURRENT_MAP = 30;
  const HERO_PIVOT = { left: 1.7, right: 1.7, up: 4, down: -0.5 };
  const HERO_CHAR_R_PCT = 6;
  const HERO_SCALE = 1.6;
  const HERO_SPRITES = ['shadow', 'arm1', 'arm2', 'axe', 'backpack', 'body', 'cap', 'eyes', 'head', 'leg1', 'leg2', 'pants'];
  const HERO_OFFSETS = {
    backpack: { x: -0.35, y: 0.2 },
    body: { x: 0, y: -0.1 },
    head: { x: 0, y: -0.05 },
    eyes: { x: 0, y: 0.1 },
    cap: { x: 0, y: -0.05 },
    legBack: { x: 0.1, y: -0.2 },
    legFront: { x: 0.28, y: -0.2 },
    shadow: { x: 0.1, y: -0.2 },
    armBack: { x: -0.35, y: 0.4 },
    armFront: { x: 0.5, y: 0.4 },
    axe: { x: 1.1, y: 0.7 },
    pants: { x: 0, y: -0.18 },
  };
  const WALK_FREQ = 2 * Math.PI * 1.5;
  const IDLE_FREQ = 2 * Math.PI * 0.3;
  const CHOP_DUR = 450;
  const CHOP_STRIKE_RATIO = 0.78;
  const CHOP_REARM_MS = 80;
  const BLINK_DUR = 200;

  const SCENARIO_OPENED_KEY = 'scenarioObjectsOpened';
  const SCENARIO_STATE_KEY = 'scenarioObjectsState';
  const SCENARIO_DROPS_KEY = 'scenarioDropsState';
  const PENDING_FOUND_ITEM_KEY = 'pendingFoundItem';
  const SCENARIO_COLLIDER_CELLS_KEY = 'scenarioColliderCells';
  const SCENARIO_COLLIDER_UPDATED_KEY = 'scenarioColliderUpdatedAt';
  const DIALOGUE_TEXT_KEY = 'scenarioDialogueText';
  const DIALOGUE_TEXT_AT_KEY = 'scenarioDialogueTextAt';
  const DIALOGUE_TEXT_TTL_MS = 15000;
  const ISLAND_RUN_KEY = 'islandRun';
  const BOAT_REPAIRED_KEY = 'boatRepaired';
  const BOAT_REPAIR_REQUEST_KEY = 'boatRepairRequestedAt';
  const BOAT_REPAIR_COST = 100000;
  const LIGHTHOUSE_REQUIRED_METERS = DEFAULT_ISLAND_SIZE + 22;
  const TENT_UPGRADE_IDS = ['campfire-upgrade-1', 'campfire-upgrade-2', 'campfire-upgrade-3'];
  const NEW_ISLAND_SIZE = 27;
  const NEW_ISLAND_MAP_SIZE = 37;
  const WATER_RIPPLE_PERIOD_MS = 1900;
  const WATER_RIPPLE_COUNT = 3;
  const SCENARIO_GLINT_PERIOD_MS = 3400;
  const SCENARIO_GLINT_ACTIVE_MS = 950;
  const SCENARIO_GLINT_HIT_PAD = 0.28;
  const SCENARIO_DROP_FLY_MS = 280;
  const WATER_BURST_ASSET = './img/sea/water-foam-burst.png';
  const WATER_BURST_MIN_DELAY_MS = 900;
  const WATER_BURST_MAX_DELAY_MS = 2300;
  const WATER_BURST_LIFE_MS = 2400;
  const WATER_BURST_MAX_ACTIVE = 5;
  const CLOUD_ASSET = './img/sea/sunset-cloud.png';
  const CLOUD_SOURCE_W = 384;
  const CLOUD_SOURCE_H = 176;
  const CLOUD_COUNT = 6;
  const CLOUD_WRAP_PAD = 180;
  const CLOUD_FRONT_CHANCE = 0.07;
  const CLOUD_SHADOW_ALPHA = 0.11;
  const CLOUD_FOREGROUND_SHADOW_ALPHA = 0.12;
  const SUNSET_HORIZON_ASSET = './img/sea/sunset-horizon.png';
  const SUNSET_HORIZON_LEFT_EDGE_ASSET = './img/sea/sunset-horizon-left-edge.png';
  const SUNSET_HORIZON_RIGHT_EDGE_ASSET = './img/sea/sunset-horizon-right-edge.png';
  const HORIZON_WATER_GAP_CELLS = 2.8;
  const HORIZON_LINE_Y_RATIO = 0.67;
  const HORIZON_SIDE_PAD_MULT = 3.6;
  const HORIZON_BOTTOM_FADE_RATIO = 0.34;
  const HORIZON_MAX_HEIGHT = 190;
  const HORIZON_MIN_HEIGHT = 120;
  const HORIZON_TOP_OVERSCAN_PX = 2;
  const CAMPFIRE_DISPLAY_SCALE = 1.4;
  const RESOURCE_AURA_PERIOD_MS = 1900;
  const RESOURCE_AURA_PARTICLES = 4;

  const SHARK_N = 5;
  const SHARK_WANDER_R = 7;
  const SHARK_SAFE_FACTOR = 1.5;
  const SHARK_ANG_SPEED_MIN = 0.0006;
  const SHARK_ANG_SPEED_MAX = 0.0016;
  const SHARK_SCENARIO_SAFE_CELLS = 2;
  const SHARK_ANCHOR_PULL = 0.002;
  const SHARK_ANCHOR_POINTS = [
    { xPct: 10, yPct: 10 },
    { xPct: 90, yPct: 10 },
    { xPct: 10, yPct: 90 },
    { xPct: 90, yPct: 90 },
  ];

  const MINEABLE_ASSETS = [
    './img/mineable/pine1.png',
    './img/mineable/pine2.png',
    './img/mineable/pine3.png',
    './img/mineable/pine4.png',
    './img/mineable/tree1.png',
    './img/mineable/tree2_.png',
    './img/mineable/tree3.png',
    './img/mineable/tree4.png',
    './img/mineable/dead_tree1.png',
    './img/mineable/dead_tree2.png',
    './img/mineable/dead_tree3.png',
    './img/mineable/dead_tree4.png',
    './img/mineable/snow_pine1.png',
    './img/mineable/snow_pine2.png',
    './img/mineable/snow_pine3.png',
    './img/mineable/snow_pine4.png',
    './img/mineable/log-pine.png',
    './img/mineable/log-birch.png',
    './img/mineable/log-dead.png',
    './img/mineable/log-snow-pine.png',
  ];

  const BERRY_IMAGE_ASSETS = [
    './img/berry/strawberry-item.png',
    './img/berry/blueberry.png',
    './img/berry/raspberry.png',
    './img/berry/tomato.png',
    './img/berry/champignon.png',
    './img/berry/beet.png',
    './img/berry/radish.png',
    './img/berry/potato.png',
    './img/berry/strawberry-bush.png',
    './img/berry/blueberry-bush.png',
    './img/berry/raspberry-bush.png',
    './img/berry/tomato-bush.png',
    './img/berry/champignon-bush.png',
    './img/berry/beet-bush.png',
    './img/berry/radish-bush.png',
    './img/berry/potato-bush.png',
    './img/rare/pine-cone.png',
    './img/rare/colorado-beetle.png',
  ];

  const BUILDING_IMAGE_ASSETS = [
    './img/building/campfire.png',
    './img/building/campfire2.png',
    './img/building/campfire3.png',
    './img/building/campfire4.png',
    './img/building/whetstone.png',
    './img/building/forge.png',
    ...Array.from({ length: 10 }, (_, index) => `./img/building/drill-${index + 1}.png`),
  ];

  const SEA_IMAGE_ASSETS = [
    './img/sea/shark-fin.png',
    WATER_BURST_ASSET,
    SUNSET_HORIZON_ASSET,
    SUNSET_HORIZON_LEFT_EDGE_ASSET,
    SUNSET_HORIZON_RIGHT_EDGE_ASSET,
    CLOUD_ASSET,
  ];

  const SCENARIO_IMAGE_ASSETS = [
    './images/scenario/wood-crate.png',
    './images/scenario/suitcase.png',
    './images/scenario/plane-wing.png',
    './images/scenario/message-bottle.png',
    './images/scenario/lighthouse-on.png',
    './images/scenario/lighthouse-off.png',
    './images/scenario/lifebuoy.png',
    './images/scenario/boat-broken.png',
    './images/scenario/boat-repaired.png',
    './images/scenario/blanket-survivor.png',
  ];

  const SCENARIO_DROP_IMAGE_ASSETS = [
    './img/scenario-drop/metal-scrap.png?v=20260605-material-inventory',
    './img/scenario-drop/nail-puller.png',
    './img/scenario-drop/kettle.png',
    './img/scenario-drop/axe.png',
    './img/mineable/log-pine.png',
  ];

  const DROP_OUTLINE_BASE_ASSETS = [
    './img/berry/strawberry-item.png',
    './img/berry/blueberry.png',
    './img/berry/raspberry.png',
    './img/berry/tomato.png',
    './img/berry/champignon.png',
    './img/berry/beet.png',
    './img/berry/radish.png',
    './img/berry/potato.png',
    './img/rare/pine-cone.png',
    './img/rare/colorado-beetle.png',
    './img/scenario-drop/metal-scrap.png?v=20260605-material-inventory',
    './img/scenario-drop/nail-puller.png',
    './img/scenario-drop/kettle.png',
    './img/scenario-drop/axe.png',
    './img/mineable/log-pine.png',
    './img/mineable/log-birch.png',
    './img/mineable/log-dead.png',
    './img/mineable/log-snow-pine.png',
  ];

  function getDropOutlineAssetUrl(url) {
    if (!url || !String(url).includes('.png')) return '';
    const [path, query] = String(url).split('?');
    if (!path.endsWith('.png')) return '';
    const outlined = path.replace(/\.png$/, '-drop-outline.png');
    return query ? `${outlined}?${query}` : outlined;
  }

  const DROP_OUTLINE_IMAGE_ASSETS = DROP_OUTLINE_BASE_ASSETS
    .map(getDropOutlineAssetUrl)
    .filter(Boolean);

  const KNOWN_ASSETS = new Set([
    './img/berry/1.png',
    './img/building/campfire.png',
    './img/building/campfire2.png',
    './img/island_shadow.png',
    './img/tiles/1.png',
    './img/tiles/dead.png',
    './img/tiles/snow.png',
    './images/scenario/wood-crate-fallback.svg',
    './images/scenario/suitcase-fallback.svg',
    './images/scenario/radio-buoy-fallback.svg',
    './images/scenario/plane-wing-fallback.svg',
    './images/scenario/message-bottle-fallback.svg',
    './images/scenario/lighthouse-on-fallback.svg',
    './images/scenario/lighthouse-off-fallback.svg',
    './images/scenario/lifebuoy-fallback.svg',
  ]);
  MINEABLE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  BERRY_IMAGE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  BUILDING_IMAGE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  SEA_IMAGE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  SCENARIO_IMAGE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  SCENARIO_DROP_IMAGE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  DROP_OUTLINE_IMAGE_ASSETS.forEach((url) => KNOWN_ASSETS.add(url));
  HERO_SPRITES.forEach((name) => KNOWN_ASSETS.add(`./img/hero/${name}.png`));

  const rnd = (a, b) => a + Math.random() * (b - a);
  const rndi = (a, b) => Math.floor(rnd(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vec = (a) => ({ x: Math.cos(a), y: Math.sin(a) });
  const outBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  };
  const outCub = (t) => 1 - (1 - t) ** 3;
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 1, 2) / 2;
  const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
  const easeInCubic = (t) => t * t * t;

  function parseColor(input, fallback = '#ffffff') {
    const value = String(input || fallback).trim();
    if (value.startsWith('#')) {
      let hex = value.slice(1);
      if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
      const color = Number.parseInt(hex.slice(0, 6), 16);
      return { color: Number.isFinite(color) ? color : 0xffffff, alpha: 1 };
    }
    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (match) {
      const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
      const r = clamp(parts[0] || 0, 0, 255);
      const g = clamp(parts[1] || 0, 0, 255);
      const b = clamp(parts[2] || 0, 0, 255);
      const alpha = Number.isFinite(parts[3]) ? clamp(parts[3], 0, 1) : 1;
      return { color: (r << 16) + (g << 8) + b, alpha };
    }
    return parseColor(fallback, '#ffffff');
  }

  function beginFill(g, color, fallback) {
    const parsed = parseColor(color, fallback);
    g.beginFill(parsed.color, parsed.alpha);
  }

  function drawRoundedRect(g, x, y, w, h, r) {
    g.drawRoundedRect(x, y, w, h, Math.max(0, r || 0));
  }

  function safeJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (err) {
      return fallback;
    }
  }

  function setGameSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const portraitRatio = 9 / 16;
    const gameW = (vw > vh) ? Math.floor(vh * portraitRatio) : vw;
    const gameH = (vw > vh) ? vh : Math.floor(gameW / portraitRatio);
    document.documentElement.style.setProperty('--game-width', `${gameW}px`);
    localStorage.setItem('gameWidth', String(gameW));
    localStorage.setItem('gameHeight', String(gameH));
    return { gameW, gameH };
  }

  function initDefaultMap() {
    const startX = Math.floor((DEFAULT_MAP_WIDTH - DEFAULT_ISLAND_SIZE) / 2);
    const startY = Math.floor((DEFAULT_MAP_HEIGHT - DEFAULT_ISLAND_SIZE) / 2);
    const defaultMap = Array.from({ length: DEFAULT_MAP_HEIGHT }, (_, y) =>
      Array.from({ length: DEFAULT_MAP_WIDTH }, (_, x) =>
        (x >= startX && x < startX + DEFAULT_ISLAND_SIZE && y >= startY && y < startY + DEFAULT_ISLAND_SIZE) ? 1 : 0
      )
    );
    const existing = localStorage.getItem('map');
    if (!existing || existing === '[]') {
      localStorage.setItem('map', JSON.stringify(defaultMap));
    }
    const baseGridW = Number(localStorage.getItem('baseGridW') || '0');
    if (!Number.isFinite(baseGridW) || baseGridW <= 0) {
      const current = safeJson('map', []);
      const gridW = current[0] ? current[0].length : 0;
      if (gridW) localStorage.setItem('baseGridW', String(gridW));
    }
  }

  setGameSize();
  initDefaultMap();

  const app = new PIXI.Application({
    width: Math.max(1, mount.clientWidth || window.innerWidth),
    height: Math.max(1, mount.clientHeight || window.innerHeight),
    backgroundColor: 0x1e6fff,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    powerPreference: 'high-performance',
  });
  mount.appendChild(app.view);
  app.stage.sortableChildren = true;

  const seaGraphics = new PIXI.Graphics();
  seaGraphics.zIndex = 0;
  const horizonLayer = new PIXI.Container();
  horizonLayer.zIndex = 0.25;
  horizonLayer.eventMode = 'none';
  horizonLayer.interactiveChildren = false;
  const worldRoot = new PIXI.Container();
  worldRoot.sortableChildren = true;
  worldRoot.zIndex = 1;
  const cloudLayer = new PIXI.Container();
  cloudLayer.zIndex = 3.35;
  cloudLayer.eventMode = 'none';
  cloudLayer.interactiveChildren = false;
  const screenLayer = new PIXI.Container();
  screenLayer.zIndex = 2;
  app.stage.addChild(seaGraphics, worldRoot, screenLayer);

  const sharkGraphics = new PIXI.Graphics();
  sharkGraphics.zIndex = 1;
  const waterFxLayer = new PIXI.Container();
  waterFxLayer.zIndex = 1.35;
  waterFxLayer.eventMode = 'none';
  waterFxLayer.interactiveChildren = false;
  const cloudShadowGraphics = new PIXI.Graphics();
  cloudShadowGraphics.zIndex = 1.8;
  const sharkSpriteLayer = new PIXI.Container();
  sharkSpriteLayer.zIndex = 1.5;
  const islandLayer = new PIXI.Container();
  islandLayer.zIndex = 2;
  const scenarioSpriteLayer = new PIXI.Container();
  scenarioSpriteLayer.zIndex = 3;
  const scenarioGraphics = new PIXI.Graphics();
  scenarioGraphics.zIndex = 2.8;
  const scenarioFxGraphics = new PIXI.Graphics();
  scenarioFxGraphics.zIndex = 3.2;
  const buildingGlowGraphics = new PIXI.Graphics();
  buildingGlowGraphics.zIndex = 4.8;
  const buildingsGraphics = new PIXI.Graphics();
  buildingsGraphics.zIndex = 5;
  const buildingSpriteLayer = new PIXI.Container();
  buildingSpriteLayer.sortableChildren = true;
  buildingSpriteLayer.zIndex = 5.1;
  const resourceShadowGraphics = new PIXI.Graphics();
  resourceShadowGraphics.zIndex = 5.8;
  const resourceSpriteLayer = new PIXI.Container();
  resourceSpriteLayer.sortableChildren = true;
  resourceSpriteLayer.zIndex = 6;
  const resourceGraphics = new PIXI.Graphics();
  resourceGraphics.zIndex = 6.5;
  const heroLayer = new PIXI.Container();
  heroLayer.zIndex = 7;
  const foregroundCloudShadowGraphics = new PIXI.Graphics();
  foregroundCloudShadowGraphics.zIndex = 7.8;
  const foregroundCloudLayer = new PIXI.Container();
  foregroundCloudLayer.zIndex = 8.2;
  foregroundCloudLayer.eventMode = 'none';
  foregroundCloudLayer.interactiveChildren = false;
  worldRoot.addChild(
    horizonLayer,
    cloudLayer,
    sharkGraphics,
    waterFxLayer,
    cloudShadowGraphics,
    sharkSpriteLayer,
    islandLayer,
    scenarioSpriteLayer,
    scenarioGraphics,
    scenarioFxGraphics,
    buildingGlowGraphics,
    buildingsGraphics,
    buildingSpriteLayer,
    resourceShadowGraphics,
    resourceSpriteLayer,
    resourceGraphics,
    heroLayer,
    foregroundCloudShadowGraphics,
    foregroundCloudLayer
  );

  const joystickGraphics = new PIXI.Graphics();
  joystickGraphics.zIndex = 10;
  screenLayer.addChild(joystickGraphics);
  const transitionGraphics = new PIXI.Graphics();
  transitionGraphics.zIndex = 30;
  const transitionText = new PIXI.Text('', new PIXI.TextStyle({
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    fontSize: 28,
    fontWeight: '800',
    fill: 0xffffff,
    align: 'center',
  }));
  transitionText.anchor.set(0.5);
  transitionText.zIndex = 31;
  const cutsceneGraphics = new PIXI.Graphics();
  cutsceneGraphics.zIndex = 29;
  const cutsceneBoatSprite = new PIXI.Sprite();
  cutsceneBoatSprite.anchor.set(0.5);
  cutsceneBoatSprite.zIndex = 29.1;
  cutsceneBoatSprite.visible = false;
  screenLayer.addChild(cutsceneGraphics, cutsceneBoatSprite, transitionGraphics, transitionText);

  let gameWidth = mount.clientWidth || window.innerWidth;
  let gameHeight = mount.clientHeight || window.innerHeight;
  let map = [];
  let GRID_W = 0;
  let GRID_H = 0;
  let H_PCT = 100;
  let cellPct = 0;
  let land = [];
  let landSet = new Set();
  let islandBounds = { minXPct: 0, maxXPct: 100, minYPct: 0, maxYPct: 100 };
  let buildingLayout = [];
  let campfireCenter = null;
  let charXPct = 50;
  let charYPct = 50;
  let facing = 1;
  let boatCutscene = null;
  let camera = { x: 0, y: 0 };
  let BUSH_DENSITY = 0.05;
  let MAX_UNPICKED_BUSHES = 1;
  const clouds = [];
  const waterBursts = [];
  let nextWaterBurstDelay = 0;
  let horizonSprite = null;
  let horizonBackdropGraphics = null;
  let horizonTopFillGraphics = null;
  let horizonLeftEdgeSprite = null;
  let horizonRightEdgeSprite = null;
  let horizonFadeGraphics = null;

  const buildingDefs = buildingsConfig.buildings || [];
  const buildingById = new Map(buildingDefs.map((item) => [item.id, item]));
  const scenarioObjects = Array.isArray(scenarioConfig.objects) ? scenarioConfig.objects : [];
  const scenarioById = new Map(scenarioObjects.map((obj) => [obj.id, obj]));
  const scenarioDropDefs = Array.isArray(scenarioConfig.drops) ? scenarioConfig.drops : [];
  const BERRIES_LIST = Array.isArray(berriesConfig.berries) ? berriesConfig.berries : [];
  const INVENTORY_ITEMS = Array.isArray(berriesConfig.inventoryItems) ? berriesConfig.inventoryItems : [];
  const MATERIAL_RESOURCE_CATEGORIES = new Set(['wood', 'metal', 'ore', 'stone']);
  const resourceById = new Map(BERRIES_LIST.map((item) => [item.id, item]));
  const inventoryItemById = new Map(INVENTORY_ITEMS.map((item) => [item.id, item]));
  const scenarioDropById = new Map([...BERRIES_LIST, ...scenarioDropDefs, ...INVENTORY_ITEMS].map((item) => [item.id, item]));
  const getResourceWeight = typeof berriesConfig.getResourceWeight === 'function'
    ? berriesConfig.getResourceWeight
    : () => 1;

  const textureCache = new Map();
  function getTexture(url) {
    if (!url || !KNOWN_ASSETS.has(url)) return null;
    if (!textureCache.has(url)) textureCache.set(url, PIXI.Texture.from(url));
    return textureCache.get(url);
  }

  function toHexColor(color) {
    return `#${(color & 0xffffff).toString(16).padStart(6, '0')}`;
  }

  function mixColor(input, target, amount) {
    const a = parseColor(input, '#ffffff').color;
    const b = parseColor(target, '#000000').color;
    const t = clamp(amount, 0, 1);
    const ar = (a >> 16) & 255;
    const ag = (a >> 8) & 255;
    const ab = a & 255;
    const br = (b >> 16) & 255;
    const bg = (b >> 8) & 255;
    const bb = b & 255;
    const r = Math.round(lerp(ar, br, t));
    const g = Math.round(lerp(ag, bg, t));
    const blue = Math.round(lerp(ab, bb, t));
    return toHexColor((r << 16) + (g << 8) + blue);
  }

  function ensureHorizonEdgeSprites() {
    if (!horizonBackdropGraphics) {
      horizonBackdropGraphics = new PIXI.Container();
      horizonBackdropGraphics.eventMode = 'none';
      horizonBackdropGraphics.interactiveChildren = false;
      horizonLayer.addChildAt(horizonBackdropGraphics, 0);
    }
    if (!horizonTopFillGraphics) {
      horizonTopFillGraphics = new PIXI.Graphics();
      horizonBackdropGraphics.addChildAt(horizonTopFillGraphics, 0);
    }
    const leftTexture = getTexture(SUNSET_HORIZON_LEFT_EDGE_ASSET);
    const rightTexture = getTexture(SUNSET_HORIZON_RIGHT_EDGE_ASSET);
    if (!leftTexture || !rightTexture) return false;
    if (!horizonLeftEdgeSprite) {
      horizonLeftEdgeSprite = new PIXI.Sprite(leftTexture);
      horizonLeftEdgeSprite.anchor.set(0, 0);
      horizonBackdropGraphics.addChild(horizonLeftEdgeSprite);
    } else if (horizonLeftEdgeSprite.texture !== leftTexture) {
      horizonLeftEdgeSprite.texture = leftTexture;
    }
    if (!horizonRightEdgeSprite) {
      horizonRightEdgeSprite = new PIXI.Sprite(rightTexture);
      horizonRightEdgeSprite.anchor.set(0, 0);
      horizonBackdropGraphics.addChild(horizonRightEdgeSprite);
    } else if (horizonRightEdgeSprite.texture !== rightTexture) {
      horizonRightEdgeSprite.texture = rightTexture;
    }
    return true;
  }

  function drawHorizonBackdrop(x, y, width, height) {
    const hasEdges = ensureHorizonEdgeSprites();
    if (!horizonFadeGraphics) {
      horizonFadeGraphics = new PIXI.Graphics();
      horizonLayer.addChild(horizonFadeGraphics);
    }
    const sidePad = Math.max(gameWidth * HORIZON_SIDE_PAD_MULT, getWorldWidth() * 0.9);
    const bx = x - sidePad;
    const bw = width + sidePad * 2;
    horizonBackdropGraphics.visible = true;
    horizonTopFillGraphics.clear();
    const topFillY = Math.min(y - 1, -gameHeight * 2 - HORIZON_TOP_OVERSCAN_PX);
    const topFillHeight = Math.max(0, y - topFillY + 1);
    const topSteps = 10;
    for (let i = 0; i < topSteps; i += 1) {
      const t = i / Math.max(1, topSteps - 1);
      beginFill(horizonTopFillGraphics, mixColor('#8d6fd8', '#ac67a2', t), '#ac67a2');
      horizonTopFillGraphics.drawRect(bx, topFillY + topFillHeight * (i / topSteps), bw, Math.ceil(topFillHeight / topSteps) + 1);
      horizonTopFillGraphics.endFill();
    }
    if (hasEdges) {
      horizonLeftEdgeSprite.x = bx;
      horizonLeftEdgeSprite.y = y;
      horizonLeftEdgeSprite.width = sidePad + 1;
      horizonLeftEdgeSprite.height = height;
      horizonLeftEdgeSprite.alpha = horizonSprite ? horizonSprite.alpha : 0.88;
      horizonRightEdgeSprite.x = x + width - 1;
      horizonRightEdgeSprite.y = y;
      horizonRightEdgeSprite.width = sidePad + 1;
      horizonRightEdgeSprite.height = height;
      horizonRightEdgeSprite.alpha = horizonSprite ? horizonSprite.alpha : 0.88;
    }

    horizonFadeGraphics.clear();
    const fadeStart = y + height * (1 - HORIZON_BOTTOM_FADE_RATIO);
    const steps = 18;
    for (let i = 0; i < steps; i += 1) {
      const t = i / Math.max(1, steps - 1);
      const alpha = t * t * 0.98;
      horizonFadeGraphics.beginFill(0x1e6fff, alpha);
      horizonFadeGraphics.drawRect(bx, fadeStart + (height - (fadeStart - y)) * (i / steps), bw, Math.ceil((height * HORIZON_BOTTOM_FADE_RATIO) / steps) + 1);
      horizonFadeGraphics.endFill();
    }
  }

  function renderHorizon() {
    const texture = getTexture(SUNSET_HORIZON_ASSET);
    if (!texture) return;
    if (!horizonSprite) {
      horizonSprite = new PIXI.Sprite(texture);
      horizonSprite.anchor.set(0, 0);
      horizonLayer.addChild(horizonSprite);
    } else if (horizonSprite.texture !== texture) {
      horizonSprite.texture = texture;
    }
    const ratio = texture.width && texture.height ? texture.height / texture.width : 0.41;
    const cell = getWorldCellPx();
    const worldW = getWorldWidth();
    const width = Math.max(gameWidth * 1.35, worldW * 1.18);
    const height = clamp(width * ratio, HORIZON_MIN_HEIGHT, Math.min(HORIZON_MAX_HEIGHT, gameHeight * 0.26));
    const topRef = getTopScenarioOrIslandWorldY();
    const gap = Math.max(cell * HORIZON_WATER_GAP_CELLS, gameHeight * 0.055);
    const baseY = topRef - gap - height * HORIZON_LINE_Y_RATIO;
    const topY = Math.min(baseY, -HORIZON_TOP_OVERSCAN_PX);
    const displayHeight = height + (baseY - topY);
    horizonSprite.visible = true;
    horizonSprite.x = (worldW - width) / 2;
    horizonSprite.y = topY;
    horizonSprite.width = width;
    horizonSprite.height = displayHeight;
    horizonSprite.alpha = 0.88;
    drawHorizonBackdrop(horizonSprite.x, horizonSprite.y, horizonSprite.width, horizonSprite.height);
    if (horizonFadeGraphics && horizonFadeGraphics.parent === horizonLayer) horizonLayer.setChildIndex(horizonFadeGraphics, horizonLayer.children.length - 1);
  }

  function createCloud(index) {
    const container = new PIXI.Container();
    container.eventMode = 'none';
    container.interactiveChildren = false;
    const texture = getTexture(CLOUD_ASSET);
    if (texture) {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      container.sprite = sprite;
      container.addChild(sprite);
    } else {
      const g = new PIXI.Graphics();
      g.beginFill(0xffffff, 0.9);
      g.drawEllipse(-36, 0, 46, 18);
      g.drawEllipse(8, -6, 58, 24);
      g.drawEllipse(52, 3, 42, 16);
      g.endFill();
      container.addChild(g);
    }
    container.cloudIndex = index;
    return container;
  }

  function getIslandWorldBoundsPx() {
    return {
      left: pct2px(islandBounds.minXPct),
      right: pct2px(islandBounds.maxXPct),
      top: pct2px(islandBounds.minYPct),
      bottom: pct2px(islandBounds.maxYPct),
    };
  }

  function getTopScenarioOrIslandWorldY() {
    const cell = getWorldCellPx();
    let top = pct2px(islandBounds.minYPct);
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!def || !Number.isFinite(state.gridY)) return;
      const sizeScale = cell > 0 ? cell / BASE_CELL_PX : 1;
      const height = (Number.isFinite(def.heightPx) ? def.heightPx : 60) * sizeScale;
      top = Math.min(top, (state.gridY + 0.5) * cell - height * 0.55);
    });
    return Number.isFinite(top) ? top : 0;
  }

  function getCloudTravelBounds() {
    const bounds = getIslandWorldBoundsPx();
    const cell = getWorldCellPx();
    const pad = Math.max(gameWidth * 0.45, cell * 7, CLOUD_WRAP_PAD);
    return {
      left: Math.min(bounds.left - pad, horizonSprite ? horizonSprite.x - pad : -pad),
      right: Math.max(bounds.right + pad, horizonSprite ? horizonSprite.x + horizonSprite.width + pad : getWorldWidth() + pad),
      top: bounds.top,
      bottom: bounds.bottom,
    };
  }

  function attachCloudToLayer(cloud) {
    const target = cloud.foreground ? foregroundCloudLayer : cloudLayer;
    if (cloud.parent !== target) target.addChild(cloud);
  }

  function resetCloud(cloud, initial = false) {
    const bounds = getIslandWorldBoundsPx();
    const travel = getCloudTravelBounds();
    const cell = getWorldCellPx();
    const viewportScale = clamp(gameWidth / 430, 0.82, 1.16);
    const foreground = Math.random() < CLOUD_FRONT_CHANCE;
    const targetW = (foreground ? rnd(142, 210) : rnd(126, 196)) * viewportScale;
    const targetH = targetW * (CLOUD_SOURCE_H / CLOUD_SOURCE_W) * rnd(0.94, 1.05);
    const flip = Math.random() < 0.5 ? -1 : 1;
    cloud.foreground = foreground;
    cloud.visualWidth = targetW;
    cloud.visualHeight = targetH;
    if (cloud.sprite) {
      cloud.scale.set(1);
      cloud.sprite.scale.set((targetW / CLOUD_SOURCE_W) * flip, targetH / CLOUD_SOURCE_H);
    } else {
      cloud.scale.set((targetW / 128) * flip, targetH / 52);
    }
    cloud.alpha = foreground ? rnd(0.84, 0.96) : rnd(0.68, 0.84);
    const safeTopY = (horizonSprite ? horizonSprite.y + horizonSprite.height * 0.2 : bounds.top - cell * 7);
    const safeBottomY = bounds.top - cell * 1.35;
    cloud.baseY = foreground
      ? rnd(bounds.top + cell * 1.8, Math.max(bounds.top + cell * 2.2, bounds.bottom - cell * 2.4))
      : rnd(safeTopY, Math.max(safeTopY + 1, safeBottomY));
    cloud.y = cloud.baseY;
    cloud.speed = rnd(0.008, 0.019) * (foreground ? 0.86 : 1);
    cloud.phase = rnd(0, Math.PI * 2);
    cloud.x = initial
      ? rnd(travel.left, travel.right)
      : travel.left - cloud.visualWidth - rnd(0, gameWidth * 0.35);
    attachCloudToLayer(cloud);
  }

  function initClouds() {
    if (clouds.length) return;
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const cloud = createCloud(i);
      resetCloud(cloud, true);
      clouds.push(cloud);
      cloudLayer.addChild(cloud);
    }
  }

  function resizeClouds() {
    if (!clouds.length) return;
    clouds.forEach((cloud) => resetCloud(cloud, true));
  }

  function renderCloudShadows() {
    cloudShadowGraphics.clear();
    foregroundCloudShadowGraphics.clear();
    clouds.forEach((cloud) => {
      const target = cloud.foreground ? foregroundCloudShadowGraphics : cloudShadowGraphics;
      const alphaBase = cloud.foreground ? CLOUD_FOREGROUND_SHADOW_ALPHA : CLOUD_SHADOW_ALPHA;
      const alpha = alphaBase * (cloud.alpha || 1);
      beginFill(target, `rgba(18,36,62,${alpha})`, '#12243e');
      target.drawEllipse(
        cloud.x,
        cloud.y + cloud.visualHeight * 0.64,
        cloud.visualWidth * 0.45,
        Math.max(8, cloud.visualHeight * 0.18)
      );
      target.endFill();
    });
  }

  function updateClouds(now, deltaMS) {
    initClouds();
    const travel = getCloudTravelBounds();
    clouds.forEach((cloud) => {
      cloud.x += cloud.speed * deltaMS;
      cloud.y = cloud.baseY + Math.sin(now / 4200 + cloud.phase) * (cloud.foreground ? 5 : 3);
      const rightEdge = travel.right + CLOUD_WRAP_PAD;
      const leftEdge = travel.left - CLOUD_WRAP_PAD - cloud.visualWidth * 2;
      if (cloud.x - cloud.visualWidth > rightEdge || cloud.x < leftEdge) resetCloud(cloud, false);
    });
    renderCloudShadows();
  }

  function cellKey(x, y) {
    return `${x},${y}`;
  }

  function getExpansionLevel() {
    const stored = Number(localStorage.getItem('islandExpansionLevel') || '0');
    return Number.isFinite(stored) ? Math.max(0, Math.floor(stored)) : 0;
  }

  function getBaseGridW() {
    const stored = Number(localStorage.getItem('baseGridW') || '0');
    if (Number.isFinite(stored) && stored > 0) return stored;
    if (GRID_W) {
      localStorage.setItem('baseGridW', String(GRID_W));
      return GRID_W;
    }
    return 0;
  }

  function getWorldCellPx() {
    const baseGridW = getBaseGridW();
    if (!baseGridW) return 0;
    const vw = parseFloat(localStorage.getItem('gameWidth')) || gameWidth;
    const scale = Math.pow(0.97, getExpansionLevel()) * WORLD_ZOOM;
    return (vw / baseGridW) * scale;
  }

  function getWorldWidth() {
    const cell = getWorldCellPx();
    return cell && GRID_W ? cell * GRID_W : (parseFloat(localStorage.getItem('gameWidth')) || gameWidth);
  }

  function pct2px(p) {
    return p * getWorldWidth() / 100;
  }

  function px2pct(px) {
    const worldW = getWorldWidth() || 1;
    return px * 100 / worldW;
  }

  function getWiggleOffset(duration = 3500) {
    const start = Number(localStorage.getItem('islandWiggleAt') || 0);
    if (!start) return { x: 0, y: 0 };
    const elapsed = performance.now() - start;
    if (elapsed < 0 || elapsed > duration) return { x: 0, y: 0 };
    const t = elapsed / duration;
    const decay = 1 - t;
    const cell = getWorldCellPx();
    return {
      x: Math.sin(t * Math.PI * 4) * cell * 0.12 * decay,
      y: Math.cos(t * Math.PI * 4) * cell * 0.08 * decay,
    };
  }

  const SURFACE_DEFS = {
    grass: { color: '#2fb84b', edge: '#1f8a3a', soil: '#8a5a2b' },
    sand: { color: '#e8c982', edge: '#cfa766', soil: '#9a7243' },
    dead: { color: '#706a4b', edge: '#514b38', soil: '#5b4430', tileUrl: './img/tiles/dead.png' },
    snow: { color: '#dff4ff', edge: '#9cc8d2', soil: '#756555', tileUrl: './img/tiles/snow.png' },
  };

  function getTileSurfaceType(value) {
    if (!value) return null;
    if (typeof value === 'object' && value.surfaceType) return value.surfaceType;
    return 'grass';
  }

  function getSurfaceDef(value) {
    return SURFACE_DEFS[getTileSurfaceType(value)] || SURFACE_DEFS.grass;
  }

  function getTileTextureForCell(value) {
    const surface = getSurfaceDef(value);
    if (surface.tileUrl) return getTexture(surface.tileUrl);
    if (getTileSurfaceType(value) === 'grass') return getTexture('./img/tiles/1.png');
    return null;
  }

  function getTileSurfaceColor(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.surfaceColor) return value.surfaceColor;
    return getSurfaceDef(value).color;
  }

  function getTileEdgeColor(value) {
    if (typeof value === 'string') return mixColor(value, '#000000', 0.22);
    if (typeof value === 'object' && value.surfaceColor && !value.surfaceType) return mixColor(value.surfaceColor, '#000000', 0.22);
    return getSurfaceDef(value).edge;
  }

  function getTileSoilColor(value) {
    if (typeof value === 'string') return mixColor('#8a5a2b', value, 0.14);
    if (typeof value === 'object' && value.surfaceColor && !value.surfaceType) return mixColor('#8a5a2b', value.surfaceColor, 0.14);
    return getSurfaceDef(value).soil;
  }

  function drawIslandTileTop(g, cellValue, sx, sy, ww, hh, radius) {
    const surface = getTileSurfaceColor(cellValue) || '#2fb84b';
    beginFill(g, surface, '#2fb84b');
    drawRoundedRect(g, sx, sy, ww, hh, radius);
    g.endFill();
    beginFill(g, 'rgba(255,255,255,0.04)', '#ffffff');
    drawRoundedRect(g, sx + ww * 0.04, sy + hh * 0.04, ww * 0.92, hh * 0.33, radius * 0.65);
    g.endFill();
    beginFill(g, 'rgba(0,0,0,0.035)', '#000000');
    g.drawRect(sx + ww * 0.03, sy + hh * 0.72, ww * 0.94, hh * 0.16);
    g.endFill();
  }

  function drawIslandTileFrontSide(g, cellValue, sx, sy, cellSize) {
    beginFill(g, getTileEdgeColor(cellValue) || '#1f8a3a');
    g.drawRect(sx, sy + cellSize, cellSize, cellSize * 0.035);
    g.endFill();
    beginFill(g, getTileSurfaceColor(cellValue) || '#2fb84b');
    g.drawRect(sx, sy + cellSize + cellSize * 0.035, cellSize, cellSize * 0.03);
    g.endFill();
    beginFill(g, getTileSoilColor(cellValue) || '#8a5a2b');
    g.drawRect(sx, sy + cellSize + cellSize * 0.065, cellSize, cellSize * 0.12);
    g.endFill();
  }

  function drawIslandTileRightSide(g, cellValue, sx, sy, cellSize) {
    beginFill(g, getTileEdgeColor(cellValue) || '#1f8a3a');
    g.drawRect(sx + cellSize, sy, cellSize * 0.035, cellSize);
    g.endFill();
    beginFill(g, getTileSurfaceColor(cellValue) || '#2fb84b');
    g.drawRect(sx + cellSize + cellSize * 0.035, sy, cellSize * 0.03, cellSize);
    g.endFill();
    beginFill(g, getTileSoilColor(cellValue) || '#8a5a2b');
    g.drawRect(sx + cellSize + cellSize * 0.065, sy, cellSize * 0.12, cellSize);
    g.endFill();
  }

  function hasIslandCell(x, y) {
    return Boolean(map[y] && map[y][x]);
  }

  function drawIslandWaterOutline(g, cellSize) {
    const mainThickness = clamp(cellSize * 0.24, 10, 15);
    const passes = [
      { offset: mainThickness + 8, thickness: mainThickness + 8, alpha: 1 },
      { offset: mainThickness, thickness: mainThickness, alpha: 1 },
    ];
    passes.forEach((pass) => {
      g.beginFill(0x061b58, pass.alpha);
      for (let y = 0; y < GRID_H; y += 1) {
        for (let x = 0; x < GRID_W; x += 1) {
          if (!hasIslandCell(x, y)) continue;
          const sx = x * cellSize;
          const sy = y * cellSize;
          if (!hasIslandCell(x - 1, y)) {
            g.drawRect(sx - pass.offset, sy, pass.thickness, cellSize);
          }
          if (!hasIslandCell(x + 1, y)) {
            g.drawRect(sx + cellSize + pass.offset - pass.thickness, sy, pass.thickness, cellSize);
          }
          if (!hasIslandCell(x, y - 1)) {
            g.drawRect(sx, sy - pass.offset, cellSize, pass.thickness);
          }
          if (!hasIslandCell(x, y + 1)) {
            g.drawRect(sx, sy + cellSize + pass.offset - pass.thickness, cellSize, pass.thickness);
          }
          if (!hasIslandCell(x - 1, y) && !hasIslandCell(x, y - 1)) {
            g.drawCircle(sx, sy, pass.thickness);
          }
          if (!hasIslandCell(x + 1, y) && !hasIslandCell(x, y - 1)) {
            g.drawCircle(sx + cellSize, sy, pass.thickness);
          }
          if (!hasIslandCell(x - 1, y) && !hasIslandCell(x, y + 1)) {
            g.drawCircle(sx, sy + cellSize, pass.thickness);
          }
          if (!hasIslandCell(x + 1, y) && !hasIslandCell(x, y + 1)) {
            g.drawCircle(sx + cellSize, sy + cellSize, pass.thickness);
          }
        }
      }
      g.endFill();
    });
  }

  function getIslandBoundsCells(landCells) {
    if (!landCells.length) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    landCells.forEach(({ x, y }) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    return { minX, minY, maxX, maxY };
  }

  function getIslandBoundsPct(landCells, cellSize) {
    const bounds = getIslandBoundsCells(landCells);
    if (!bounds) return { minXPct: 0, maxXPct: 100, minYPct: 0, maxYPct: 100 };
    return {
      minXPct: bounds.minX * cellSize,
      maxXPct: (bounds.maxX + 1) * cellSize,
      minYPct: bounds.minY * cellSize,
      maxYPct: (bounds.maxY + 1) * cellSize,
    };
  }

  function getBuildingAnchorSpot(layout) {
    const anchorSpot = layout.find((spot) => spot.id === 'campfire');
    if (anchorSpot) return anchorSpot;
    if (GRID_W && GRID_H) return { x: (GRID_W * 0.5) - 0.5, y: (GRID_H * 0.5) - 0.5 };
    return null;
  }

  function resolveCampfireCenter() {
    const campfireSpot = buildingLayout.find((spot) => spot.id === 'campfire');
    if (campfireSpot) {
      const offset = buildingsConfig.layoutOffset || { x: 0, y: 0 };
      return {
        x: campfireSpot.x - (Number.isFinite(offset.x) ? offset.x : 0),
        y: campfireSpot.y - (Number.isFinite(offset.y) ? offset.y : 0),
      };
    }
    const bounds = getIslandBoundsCells(land);
    if (bounds) return { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
    return null;
  }

  function readMap() {
    const parsed = safeJson('map', []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function loadMapData({ initial = false, resetHero = false, skipScenarioShift = false } = {}) {
    const prevCellPct = cellPct;
    const prevGridW = GRID_W;
    const nextMap = readMap();
    const nextGridW = nextMap[0] ? nextMap[0].length : 0;
    const nextGridH = nextMap.length;

    if (!initial && !skipScenarioShift && GRID_W && GRID_H && nextGridW && nextGridH) {
      const shift = safeJson('mapShift', { x: 0, y: 0 });
      const shiftX = Number.isFinite(shift.x) ? shift.x : 0;
      const shiftY = Number.isFinite(shift.y) ? shift.y : 0;
      if (shiftX || shiftY) {
        scenarioState.forEach((state) => {
          state.gridX += shiftX;
          state.gridY += shiftY;
        });
        persistScenarioState();
      }
    }

    map = nextMap;
    GRID_H = nextGridH;
    GRID_W = nextGridW;
    H_PCT = GRID_W ? (GRID_H / GRID_W) * 100 : 100;
    cellPct = GRID_W ? 100 / GRID_W : 0;
    land = [];
    landSet = new Set();
    map.forEach((row, y) => {
      (row || []).forEach((value, x) => {
        if (!value) return;
        land.push({ x, y });
        landSet.add(cellKey(x, y));
      });
    });
    BUSH_DENSITY = land.length ? TARGET_BUSHES_AT_CURRENT_MAP / land.length : 0.05;
    MAX_UNPICKED_BUSHES = Math.max(1, Math.round(land.length * BUSH_DENSITY));
    islandBounds = getIslandBoundsPct(land, cellPct);
    ensureNewIslandCampfireCenter();
    buildingLayout = buildingsConfig.getBuildingLayout(map);
    campfireCenter = resolveCampfireCenter();

    if (initial || resetHero) {
      charXPct = 50;
      const cell = getWorldCellPx();
      const worldW = cell && GRID_W ? cell * GRID_W : gameWidth;
      const offsetY = worldW ? (50 / worldW) * 100 : 0;
      const offsetX = worldW ? (3 / worldW) * 100 : 0;
      charXPct = 50 - offsetX;
      charYPct = GRID_W ? (GRID_H / 2) / GRID_W * 100 + offsetY : 50;
    } else if (prevGridW && GRID_W && prevCellPct) {
      const shift = safeJson('mapShift', { x: 0, y: 0 });
      const shiftX = Number.isFinite(shift.x) ? shift.x : 0;
      const shiftY = Number.isFinite(shift.y) ? shift.y : 0;
      if (shiftX || shiftY || prevCellPct !== cellPct) {
        const gridX = (charXPct / 100) * prevGridW + shiftX;
        const gridY = (charYPct / 100) * prevGridW + shiftY;
        charXPct = (gridX / GRID_W) * 100;
        charYPct = (gridY / GRID_W) * 100;
        shiftResourcesAfterMapChange(prevCellPct, shiftX, shiftY);
      }
    }
    redrawIsland();
    renderHorizon();
    resizeClouds();
    spawnSharks();
    rebuildScenarioColliderCells();
    rebuildResourceColliderCells();
    rebuildResourceSpawnCells();
  }

  function redrawSea() {
    seaGraphics.clear();
    seaGraphics.beginFill(0x1e6fff);
    seaGraphics.drawRect(0, 0, gameWidth, gameHeight);
    seaGraphics.endFill();
  }

  function redrawIsland() {
    islandLayer.removeChildren();
    const cell = getWorldCellPx();
    if (!cell || !GRID_W) return;
    const g = new PIXI.Graphics();
    islandLayer.addChild(g);
    drawIslandWaterOutline(g, cell);

    const radius = cell * 0.22;
    const overlap = cell * 0.12;
    beginFill(g, 'rgba(0,0,0,0.16)', '#000000');
    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        if (!map[y] || !map[y][x]) continue;
        drawRoundedRect(g, x * cell - overlap / 2, y * cell + cell * 0.24 - overlap / 2, cell + overlap, cell + overlap, radius);
      }
    }
    g.endFill();

    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        const cellValue = map[y] && map[y][x];
        if (!cellValue) continue;
        const sx = x * cell - overlap / 2;
        const sy = y * cell - overlap / 2;
        const ww = cell + overlap;
        const hh = cell + overlap;
        const tileTexture = getTileTextureForCell(cellValue);
        if (tileTexture) {
          const sprite = new PIXI.Sprite(tileTexture);
          sprite.x = sx;
          sprite.y = sy;
          sprite.width = ww;
          sprite.height = hh + 10;
          islandLayer.addChild(sprite);
        } else {
          drawIslandTileTop(g, cellValue, sx, sy, ww, hh, radius);
        }
      }
    }

    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        if (!map[y] || !map[y][x]) continue;
        const sx = x * cell;
        const sy = y * cell;
        if (!map[y + 1] || !map[y + 1][x]) {
          drawIslandTileFrontSide(g, map[y][x], sx, sy, cell);
        }
        if (!map[y][x + 1]) {
          drawIslandTileRightSide(g, map[y][x], sx, sy, cell);
        }
      }
    }
  }

  function getUserState() {
    let user = safeJson('user', {});
    if (typeof user.money !== 'number' || Number.isNaN(user.money)) user.money = 0;
    if (typeof user.rainbowStones !== 'number' || Number.isNaN(user.rainbowStones)) user.rainbowStones = 0;
    if (!user.unlockedResources || typeof user.unlockedResources !== 'object') user.unlockedResources = {};
    if (!user.inventory || typeof user.inventory !== 'object' || Array.isArray(user.inventory)) user.inventory = {};
    ensureUserStats(user);
    ensurePlayerProgress(user);
    if (BERRIES_LIST[0]) user.unlockedResources[BERRIES_LIST[0].id] = true;
    const campfire = buildingDefs.find((item) => item.id === 'campfire');
    if (campfire) user.unlockedResources[campfire.id] = true;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  function setUserState(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  function getInventoryTotal(user) {
    const inventory = user && user.inventory && typeof user.inventory === 'object' ? user.inventory : {};
    return Object.values(inventory).reduce((sum, count) => {
      const value = Math.max(0, Math.floor(Number(count) || 0));
      return sum + value;
    }, 0);
  }

  function ensureUserStats(user) {
    if (!user.stats || typeof user.stats !== 'object' || Array.isArray(user.stats)) user.stats = {};
    const stats = user.stats;
    const moneyEarned = Math.max(0, Math.floor(Number(stats.moneyEarned) || 0));
    const currentMoney = Math.max(0, Math.floor(Number(user.money) || 0));
    stats.moneyEarned = Math.max(moneyEarned, currentMoney);
    const legacyFoodCount = Math.max(0, Math.floor(Number(localStorage.getItem('berriesCollected') || 0) || 0));
    const inventoryTotal = getInventoryTotal(user);
    stats.itemsCollected = Math.max(0, Math.floor(Number(stats.itemsCollected) || 0), legacyFoodCount + inventoryTotal);
    if (!stats.itemsCollectedById || typeof stats.itemsCollectedById !== 'object' || Array.isArray(stats.itemsCollectedById)) {
      stats.itemsCollectedById = {};
    }
    Object.entries(user.inventory || {}).forEach(([id, count]) => {
      stats.itemsCollectedById[id] = Math.max(
        Math.floor(Number(stats.itemsCollectedById[id]) || 0),
        Math.max(0, Math.floor(Number(count) || 0))
      );
    });
    return stats;
  }

  function addMoneyEarnedStat(user, amount) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (!value) return;
    const stats = ensureUserStats(user);
    stats.moneyEarned = Math.max(0, Math.floor(Number(stats.moneyEarned) || 0)) + value;
  }

  function addItemCollectedStat(user, id, amount = 1) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (!value) return;
    const stats = ensureUserStats(user);
    stats.itemsCollected = Math.max(0, Math.floor(Number(stats.itemsCollected) || 0)) + value;
    if (id) {
      stats.itemsCollectedById[id] = Math.max(0, Math.floor(Number(stats.itemsCollectedById[id]) || 0)) + value;
    }
  }

  function getXpNeededForLevel(level) {
    return Math.max(1, Math.floor(Number(level) || 1)) * 100;
  }

  function ensurePlayerProgress(user) {
    if (!user.player || typeof user.player !== 'object' || Array.isArray(user.player)) user.player = {};
    let level = Math.max(1, Math.floor(Number(user.player.level) || 1));
    let xp = Math.max(0, Math.floor(Number(user.player.xp) || 0));
    let guard = 0;
    while (xp >= getXpNeededForLevel(level) && guard < 10000) {
      xp -= getXpNeededForLevel(level);
      level += 1;
      guard += 1;
    }
    user.player.level = level;
    user.player.xp = xp;
    return user.player;
  }

  function addPlayerExperience(amount = 1) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (!value) return;
    const user = getUserState();
    const player = ensurePlayerProgress(user);
    player.xp += value;
    ensurePlayerProgress(user);
    setUserState(user);
    localStorage.setItem('playerProgressUpdatedAt', String(Date.now()));
  }

  function awardChopExperience(b) {
    if (!b || b.xpAwarded) return;
    b.xpAwarded = true;
    addPlayerExperience(1);
  }

  function getUnlockedResourceIds() {
    const user = getUserState();
    return Object.keys(user.unlockedResources).filter((id) => user.unlockedResources[id]);
  }

  function getResourceProfitById(id) {
    const found = resourceById.get(id);
    return found && typeof found.profit === 'number' ? found.profit : 1;
  }

  function getTentProfitBonusPercent(user) {
    const unlocked = user && user.unlockedResources ? user.unlockedResources : {};
    let level = 0;
    TENT_UPGRADE_IDS.forEach((id, index) => {
      if (unlocked[id]) level = Math.max(level, index + 1);
    });
    return level * 100;
  }

  function applyProfitBonus(value, user = getUserState()) {
    const base = Math.max(0, Number(value) || 0);
    const bonus = getTentProfitBonusPercent(user);
    return Math.floor(base * (1 + bonus / 100));
  }

  function getCollectProfit(def) {
    const baseProfit = def && Number.isFinite(def.profit) ? def.profit : getResourceProfitById(def && def.id);
    return applyProfitBonus(baseProfit);
  }

  function isMaterialDropDef(def) {
    if (!def) return false;
    const category = def.resourceCategory || def.materialType || def.resourceKind;
    return Boolean(def.materialItem || def.collectToInventory || MATERIAL_RESOURCE_CATEGORIES.has(category));
  }

  function isFindingDropDef(def) {
    return Boolean(def && (def.findingItem || def.scenarioFinding));
  }

  function pickWeightedIndex(list, getW) {
    let sum = 0;
    for (let i = 0; i < list.length; i += 1) sum += Math.max(0, +getW(i) || 0);
    if (sum <= 0) return 0;
    let r = Math.random() * sum;
    for (let i = 0; i < list.length; i += 1) {
      r -= Math.max(0, +getW(i) || 0);
      if (r <= 0) return i;
    }
    return list.length - 1;
  }

  function pickBerryDef() {
    if (!BERRIES_LIST.length) {
      return { id: 'fallback', titleRu: 'Berry', widthPx: 24, heightPx: 24, primitive: { base: '#e11', highlight: 'rgba(255,255,255,0.6)' } };
    }
    const unlocked = new Set(getUnlockedResourceIds());
    const hasSurface = (def) => !land.length || land.some((cell) => canSpawnResourceOnCell(def, cell.x, cell.y));
    const available = BERRIES_LIST.filter((def) => (unlocked.has(def.id) || isBiomeOnlyResource(def)) && hasSurface(def));
    const surfacePool = BERRIES_LIST.filter(hasSurface);
    const pool = available.length ? available : (surfacePool.length ? surfacePool : BERRIES_LIST);
    const idx = pickWeightedIndex(pool, (i) => {
      const originalIndex = BERRIES_LIST.indexOf(pool[i]);
      const baseWeight = getResourceWeight(originalIndex >= 0 ? originalIndex : i);
      return baseWeight * (isBiomeOnlyResource(pool[i]) ? 2.5 : 1);
    });
    return pool[idx] || pool[0];
  }

  function getHero() {
    return { charXPct, charYPct, facing, isMoving: controllerState.isMoving || false };
  }

  function getVirtualCellPx() {
    const value = buildingsConfig.virtualCellPx;
    if (Number.isFinite(value)) return value;
    const cell = getWorldCellPx();
    return Number.isFinite(cell) ? cell : 0;
  }

  function getBuildingCellPx() {
    const value = buildingsConfig.buildingCellPx;
    if (Number.isFinite(value)) return value;
    const cell = getWorldCellPx();
    return Number.isFinite(cell) ? cell : 0;
  }

  function getActiveBuildingCells(padding = 0, collidersOnly = false) {
    const user = getUserState();
    const cells = new Set();
    if (!Array.isArray(buildingLayout) || !GRID_W) return cells;
    buildingLayout.forEach((spot) => {
      const def = buildingById.get(spot.id);
      if (!def) return;
      if (collidersOnly && !def.collider) return;
      const unlocked = def.defaultUnlocked || user.unlockedResources[def.id];
      if (!unlocked) return;
      const radius = Number.isFinite(def.colliderRadius) ? def.colliderRadius : 1;
      const offset = buildingsConfig.layoutOffset || { x: 0, y: 0 };
      const gridX = Math.round(spot.x + offset.x);
      const gridY = Math.round(spot.y + offset.y);
      const expanded = Math.max(0, Math.max(1, Math.round(radius)) + Math.max(0, Math.round(padding)));
      for (let dy = -expanded; dy <= expanded; dy += 1) {
        for (let dx = -expanded; dx <= expanded; dx += 1) cells.add(cellKey(gridX + dx, gridY + dy));
      }
    });
    return cells;
  }

  function isLandCell(x, y) {
    return landSet.has(cellKey(x, y));
  }

  function isAllowedLandCell(x, y, avoid) {
    if (!isLandCell(x, y)) return false;
    if (avoid && avoid.has(cellKey(x, y))) return false;
    return true;
  }

  function findNearestLandCell(x, y, avoid, maxR = 8) {
    if (isAllowedLandCell(x, y, avoid)) return { x, y };
    for (let r = 1; r <= maxR; r += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (isAllowedLandCell(nx, ny, avoid)) return { x: nx, y: ny };
        }
      }
    }
    return null;
  }

  function clampToIsland(xPct, yPct, radPct = 0) {
    return {
      xPct: Math.max(islandBounds.minXPct + radPct, Math.min(islandBounds.maxXPct - radPct, xPct)),
      yPct: Math.max(islandBounds.minYPct + radPct, Math.min(islandBounds.maxYPct - radPct, yPct)),
    };
  }

  function clampToLandSafe(xPct, yPct, radPct = 0, avoid = null) {
    if (!cellPct || !GRID_W) return clampToIsland(xPct, yPct, radPct);
    const clamped = clampToIsland(xPct, yPct, radPct);
    const gx = Math.floor(clamped.xPct / cellPct);
    const gy = Math.floor(clamped.yPct / cellPct);
    if (isAllowedLandCell(gx, gy, avoid)) return clamped;
    const nearest = findNearestLandCell(gx, gy, avoid);
    if (!nearest) return clamped;
    return { xPct: (nearest.x + 0.5) * cellPct, yPct: (nearest.y + 0.5) * cellPct };
  }

  function center(x, y) {
    return { xPct: (x + 0.5) * cellPct, yPct: (y + 0.5) * cellPct };
  }

  function getHeroRect(hxPct, hyPct) {
    return {
      left: hxPct - HERO_PIVOT.left * cellPct,
      right: hxPct + HERO_PIVOT.right * cellPct,
      top: hyPct - HERO_PIVOT.up * cellPct,
      bottom: hyPct + HERO_PIVOT.down * cellPct,
    };
  }

  function isInHeroRect(xPct, yPct, hxPct, hyPct) {
    const rect = getHeroRect(hxPct, hyPct);
    return xPct >= rect.left && xPct <= rect.right && yPct >= rect.top && yPct <= rect.bottom;
  }

  function bushTouchesHero(bxPct, byPct, hxPct, hyPct, radPct = BUSH_R_PCT) {
    const rect = getHeroRect(hxPct, hyPct);
    const cx = Math.max(rect.left, Math.min(rect.right, bxPct));
    const cy = Math.max(rect.top, Math.min(rect.bottom, byPct));
    const dx = pct2px(bxPct - cx);
    const dy = pct2px(byPct - cy);
    return Math.hypot(dx, dy) <= pct2px(radPct);
  }

  function getHeroGridPosition() {
    if (!GRID_W || !cellPct) return null;
    const gridX = Math.floor(charXPct / cellPct);
    const gridY = Math.floor(charYPct / cellPct);
    if (!Number.isFinite(gridX) || !Number.isFinite(gridY)) return null;
    return { gridX, gridY };
  }

  let openedIds = loadOpenedIds();
  let scenarioState = [];
  let scenarioDrops = [];
  let activeDialogue = null;
  let lastDialogueText = '';
  const scenarioSprites = new Map();

  function loadOpenedIds() {
    const stored = safeJson(SCENARIO_OPENED_KEY, []);
    return new Set(Array.isArray(stored) ? stored.filter((x) => typeof x === 'string') : []);
  }

  function persistOpenedIds() {
    localStorage.setItem(SCENARIO_OPENED_KEY, JSON.stringify([...openedIds]));
  }

  function getIslandBoundsGrid() {
    return getIslandBoundsCells(land);
  }

  function ensureNewIslandCampfireCenter() {
    const islandRun = Math.max(1, Math.floor(Number(localStorage.getItem(ISLAND_RUN_KEY) || 1) || 1));
    if (islandRun < 2 || !GRID_W || !GRID_H || !map.length) return;
    const signature = `${GRID_W}x${GRID_H}`;
    const stored = safeJson('campfireCenter', null);
    const storedSig = localStorage.getItem('campfireCenterMapSig') || '';
    if (
      storedSig === signature
      && stored
      && Number.isFinite(stored.x)
      && Number.isFinite(stored.y)
      && map[stored.y]?.[stored.x]
    ) {
      return;
    }
    const bounds = getIslandBoundsGrid();
    if (!bounds) return;
    const centerX = Math.round((bounds.minX + bounds.maxX) / 2);
    const centerY = Math.round((bounds.minY + bounds.maxY) / 2);
    const target = {
      x: clamp(centerX + 4, bounds.minX + 5, bounds.maxX - 5),
      y: centerY,
    };
    let best = null;
    let bestScore = Infinity;
    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
      for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
        if (!map[y] || !map[y][x] || getTileSurfaceType(map[y][x]) === 'sand') continue;
        const score = (x - target.x) * (x - target.x) + (y - target.y) * (y - target.y);
        if (score < bestScore) {
          bestScore = score;
          best = { x, y };
        }
      }
    }
    if (!best) return;
    localStorage.setItem('campfireCenter', JSON.stringify(best));
    localStorage.setItem('campfireCenterMapSig', signature);
  }

  function computeInitialScenarioPositions() {
    const bounds = getIslandBoundsGrid();
    if (!bounds) return [];
    const islandRun = Math.max(1, Math.floor(Number(localStorage.getItem(ISLAND_RUN_KEY) || 1) || 1));
    const centerX = Math.round((bounds.minX + bounds.maxX) / 2);
    const centerY = Math.round((bounds.minY + bounds.maxY) / 2);
    const dirMap = {
      east: { x: 1, y: 0 },
      west: { x: -1, y: 0 },
      north: { x: 0, y: -1 },
      south: { x: 0, y: 1 },
      northEast: { x: 1, y: -1 },
      northWest: { x: -1, y: -1 },
      southEast: { x: 1, y: 1 },
      southWest: { x: -1, y: 1 },
    };
    return scenarioObjects.map((def) => {
      if (def.newIslandOnly && islandRun < 2) return null;
      if (!def.newIslandOnly && islandRun >= 2) return null;
      if (def.position === 'center') {
        return {
          id: def.id,
          gridX: centerX,
          gridY: centerY,
          triggered: false,
          transformed: false,
          repaired: false,
          opened: true,
          positionVersion: Number.isFinite(def.positionVersion) ? def.positionVersion : 0,
        };
      }
      if (def.position === 'westShore') {
        const distance = Number.isFinite(def.distanceCells) ? def.distanceCells : 1;
        return {
          id: def.id,
          gridX: bounds.minX - distance,
          gridY: centerY,
          triggered: false,
          transformed: false,
          repaired: false,
          opened: true,
          positionVersion: Number.isFinite(def.positionVersion) ? def.positionVersion : 0,
        };
      }
      const distance = Number.isFinite(def.distanceCells) ? def.distanceCells : 2;
      const dir = dirMap[def.direction] || dirMap.east;
      const offset = def.offsetCells || {};
      const offsetX = Number.isFinite(offset.x) ? offset.x : 0;
      const offsetY = Number.isFinite(offset.y) ? offset.y : 0;
      return {
        id: def.id,
        gridX: (dir.x === 0 ? centerX : (dir.x > 0 ? bounds.maxX + distance : bounds.minX - distance)) + offsetX,
        gridY: (dir.y === 0 ? centerY : (dir.y > 0 ? bounds.maxY + distance : bounds.minY - distance)) + offsetY,
        triggered: false,
        transformed: false,
        repaired: false,
        opened: openedIds.has(def.id),
        positionVersion: Number.isFinite(def.positionVersion) ? def.positionVersion : 0,
      };
    }).filter(Boolean);
  }

  function scenarioAllowedForCurrentIsland(def) {
    const islandRun = Math.max(1, Math.floor(Number(localStorage.getItem(ISLAND_RUN_KEY) || 1) || 1));
    if (def && def.newIslandOnly) return islandRun >= 2;
    return islandRun < 2;
  }

  function loadScenarioState() {
    let stored = safeJson(SCENARIO_STATE_KEY, []);
    if (!Array.isArray(stored)) stored = [];
    const byId = new Map(stored.map((item) => [item.id, item]));
    const initial = computeInitialScenarioPositions();
    const initialById = new Map(initial.map((item) => [item.id, item]));
    const next = [];
    scenarioObjects.forEach((def) => {
      if (!scenarioAllowedForCurrentIsland(def)) return;
      const stored = byId.get(def.id);
      const initialState = initialById.get(def.id);
      const existing = stored || initialState;
      if (!existing) return;
      const expectedPositionVersion = Number.isFinite(def.positionVersion) ? def.positionVersion : 0;
      const storedPositionVersion = Math.floor(Number(existing.positionVersion) || 0);
      const useInitialPosition = Boolean(stored && initialState && expectedPositionVersion && storedPositionVersion !== expectedPositionVersion);
      const positionSource = useInitialPosition ? initialState : existing;
      next.push({
        id: def.id,
        gridX: Number.isFinite(positionSource.gridX) ? positionSource.gridX : 0,
        gridY: Number.isFinite(positionSource.gridY) ? positionSource.gridY : 0,
        triggered: Boolean(existing.triggered),
        transformed: Boolean(existing.transformed),
        repaired: Boolean(existing.repaired),
        hidden: Boolean(existing.hidden),
        opened: scenarioRequirementMet(def) && (openedIds.has(def.id) || Boolean(existing.opened)),
        positionVersion: expectedPositionVersion,
      });
    });
    let changed = false;
    next.forEach((s) => {
      const def = scenarioById.get(s.id);
      if (!scenarioRequirementMet(def)) return;
      if (map[s.gridY] && map[s.gridY][s.gridX] && !openedIds.has(s.id)) {
        openedIds.add(s.id);
        s.opened = true;
        changed = true;
      }
    });
    if (changed) persistOpenedIds();
    return next;
  }

  function persistScenarioState() {
    localStorage.setItem(SCENARIO_STATE_KEY, JSON.stringify(scenarioState));
  }

  function getScenarioDropDef(id) {
    if (!id) return null;
    return scenarioDropById.get(id) || resourceById.get(id) || inventoryItemById.get(id) || null;
  }

  function loadScenarioDrops() {
    const stored = safeJson(SCENARIO_DROPS_KEY, []);
    if (!Array.isArray(stored)) return [];
    return stored.map((item) => {
      const def = getScenarioDropDef(item && item.id);
      if (!def || !Number.isFinite(item.xPct) || !Number.isFinite(item.yPct)) return null;
      return {
        uid: Number.isFinite(item.uid) ? item.uid : nextBerryUid++,
        id: item.id,
        def,
        sourceId: item.sourceId || '',
        onBush: false,
        xPct: item.xPct,
        yPct: item.yPct,
        scale: Number.isFinite(item.scale) ? item.scale : 1,
        t0: performance.now(),
        alive: item.alive !== false,
        x0: Number.isFinite(item.x0) ? item.x0 : item.xPct,
        y0: Number.isFinite(item.y0) ? item.y0 : item.yPct,
        tx: Number.isFinite(item.tx) ? item.tx : item.xPct,
        ty: Number.isFinite(item.ty) ? item.ty : item.yPct,
        flying: Boolean(item.flying),
        tFly0: Number.isFinite(item.tFly0) ? item.tFly0 : 0,
        flyDur: Number.isFinite(item.flyDur) ? item.flyDur : SCENARIO_DROP_FLY_MS,
        stage: item.stage || 'idle',
        tPick0: 0,
        ux: 0,
        uy: 0,
        scenarioDrop: true,
        special: Boolean(((item.special || item.finding) && !isMaterialDropDef(def)) || isFindingDropDef(def)),
      };
    }).filter(Boolean);
  }

  function persistScenarioDrops() {
    const compact = scenarioDrops
      .filter((drop) => drop && drop.stage !== 'done')
      .map((drop) => ({
        uid: drop.uid,
        id: drop.id || (drop.def && drop.def.id),
        sourceId: drop.sourceId || '',
        xPct: drop.xPct,
        yPct: drop.yPct,
        x0: drop.x0,
        y0: drop.y0,
        tx: drop.tx,
        ty: drop.ty,
        scale: drop.scale,
        alive: drop.alive !== false,
        flying: Boolean(drop.flying),
        tFly0: drop.flying ? drop.tFly0 : 0,
        flyDur: drop.flyDur || SCENARIO_DROP_FLY_MS,
        stage: drop.stage || 'idle',
        special: Boolean(drop.special),
      }));
    localStorage.setItem(SCENARIO_DROPS_KEY, JSON.stringify(compact));
  }

  function getInwardStep(def) {
    const inward = {
      east: { x: -1, y: 0 },
      west: { x: 1, y: 0 },
      north: { x: 0, y: 1 },
      south: { x: 0, y: -1 },
      northEast: { x: -1, y: 1 },
      northWest: { x: 1, y: 1 },
      southEast: { x: -1, y: -1 },
      southWest: { x: 1, y: -1 },
    };
    return inward[def && def.direction] || { x: 0, y: 0 };
  }

  function scenarioIsOnLand(state, cellsAhead = 1) {
    const def = scenarioById.get(state.id);
    const step = getInwardStep(def);
    const y0 = state.gridY;
    const x0 = state.gridX;
    const y1 = y0 + step.y * cellsAhead;
    const x1 = x0 + step.x * cellsAhead;
    return Boolean((map[y0] && map[y0][x0]) || (map[y1] && map[y1][x1]));
  }

  function scenarioCenterIsOnLand(state) {
    return Boolean(state && map[state.gridY] && map[state.gridY][state.gridX]);
  }

  function scenarioRequirementMet(def) {
    if (!def || !def.requiresOpenedId) return true;
    return openedIds.has(def.requiresOpenedId);
  }

  function shouldRenderScenarioState(state, def) {
    if (!state || !def) return false;
    if (!scenarioRequirementMet(def)) return false;
    if (state.hidden) return false;
    return !state.triggered || def.persistentAfterTrigger;
  }

  function applyPaddingToMap(mapData, padding) {
    const width = mapData[0] ? mapData[0].length : 0;
    const padded = mapData.map((row) => {
      const next = row.slice();
      for (let i = 0; i < padding.left; i += 1) next.unshift(0);
      for (let i = 0; i < padding.right; i += 1) next.push(0);
      return next;
    });
    const nextWidth = width + padding.left + padding.right;
    for (let i = 0; i < padding.top; i += 1) padded.unshift(Array.from({ length: nextWidth }, () => 0));
    for (let i = 0; i < padding.bottom; i += 1) padded.push(Array.from({ length: nextWidth }, () => 0));
    return padded;
  }

  function getTriggerRadius(def, state) {
    const base = Number.isFinite(def && def.triggerRadiusCells) ? def.triggerRadiusCells : 3;
    const bonus = state && openedIds.has(state.id) ? 2 : 0;
    return base + bonus;
  }

  function triggerRadiusTouchesLand(state, radius) {
    if (!Number.isFinite(radius)) return false;
    const rounded = Math.max(1, Math.round(radius));
    for (let dy = -rounded; dy <= rounded; dy += 1) {
      for (let dx = -rounded; dx <= rounded; dx += 1) {
        if (Math.hypot(dx, dy) > radius) continue;
        if (map[state.gridY + dy] && map[state.gridY + dy][state.gridX + dx]) return true;
      }
    }
    return false;
  }

  function isHeroWithinTrigger(state, def) {
    const heroPos = getHeroGridPosition();
    if (!heroPos) return false;
    const radius = getTriggerRadius(def, state);
    const dx = state.gridX + 0.5 - heroPos.gridX;
    const dy = state.gridY + 0.5 - heroPos.gridY;
    return Math.hypot(dx, dy) <= radius;
  }

  function getScenarioDropRules(def) {
    return def && Array.isArray(def.drops) ? def.drops : [];
  }

  function makeScenarioDropAvoidSet(sourceState, sourceDef) {
    const avoidSet = new Set([...getActiveBuildingCells(), ...getScenarioBlockers()]);
    if (!sourceState) return avoidSet;
    const radius = Number.isFinite(sourceDef && sourceDef.colliderRadius) ? Math.max(1, Math.round(sourceDef.colliderRadius)) : 1;
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        avoidSet.delete(cellKey(sourceState.gridX + dx, sourceState.gridY + dy));
      }
    }
    return avoidSet;
  }

  function getScenarioDropTarget(sourceState, startX, startY, angle, dist, avoidSet) {
    const minMove = Math.max(cellPct * 0.42, SCATTER_MIN_PCT * 0.45);
    const candidates = [
      { angle, dist },
      { angle: angle + 0.5, dist: dist * 1.12 },
      { angle: angle - 0.5, dist: dist * 1.12 },
      { angle: angle + 1.1, dist: dist * 0.92 },
      { angle: angle - 1.1, dist: dist * 0.92 },
      { angle: angle + Math.PI, dist: dist * 0.75 },
    ];
    let best = null;
    let bestMove = -1;
    candidates.forEach((candidate) => {
      const v = vec(candidate.angle);
      const target = clampToLandSafe(startX + v.x * candidate.dist, startY + v.y * candidate.dist, BERRY_R_PCT, avoidSet);
      const move = Math.hypot(target.xPct - startX, target.yPct - startY);
      if (move > bestMove) {
        best = target;
        bestMove = move;
      }
    });
    if (best && bestMove >= minMove) return best;

    const ringCells = [];
    for (let r = 1; r <= 4; r += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const x = sourceState.gridX + dx;
          const y = sourceState.gridY + dy;
          if (!isAllowedLandCell(x, y, avoidSet)) continue;
          const dirDiff = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - angle), Math.cos(Math.atan2(dy, dx) - angle)));
          ringCells.push({ x, y, score: dirDiff + r * 0.08 });
        }
      }
      if (ringCells.length) break;
    }
    if (ringCells.length) {
      ringCells.sort((a, b) => a.score - b.score);
      const cell = ringCells[0];
      return {
        xPct: (cell.x + 0.5) * cellPct + rnd(-cellPct * 0.16, cellPct * 0.16),
        yPct: (cell.y + 0.5) * cellPct + rnd(-cellPct * 0.16, cellPct * 0.16),
      };
    }
    return best || { xPct: startX, yPct: startY };
  }

  function createScenarioDrop(sourceState, rule, index, count, now, avoidSet) {
    const def = getScenarioDropDef(rule && rule.id);
    if (!def || !cellPct) return null;
    const spread = Math.max(SCATTER_MIN_PCT * 0.55, cellPct * 0.55);
    const angle = (Math.PI * 2 * index) / Math.max(1, count) + rnd(-0.45, 0.45);
    const dist = rnd(spread, Math.max(spread + 0.01, SCATTER_MAX_PCT * 0.78));
    const startX = (sourceState.gridX + 0.5) * cellPct;
    const startY = (sourceState.gridY + 0.5) * cellPct;
    const to = getScenarioDropTarget(sourceState, startX, startY, angle, dist, avoidSet);
    return {
      uid: nextBerryUid++,
      id: def.id,
      def,
      sourceId: sourceState.id,
      onBush: false,
      xPct: startX,
      yPct: startY,
      scale: 1,
      t0: now,
      alive: true,
      x0: startX,
      y0: startY,
      tx: to.xPct,
      ty: to.yPct,
      flying: true,
      tFly0: now,
      flyDur: SCENARIO_DROP_FLY_MS,
      stage: 'idle',
      tPick0: 0,
      ux: 0,
      uy: 0,
      scenarioDrop: true,
      special: Boolean((rule.special || rule.finding || isFindingDropDef(def)) && !isMaterialDropDef(def)),
    };
  }

  function spawnScenarioDrops(sourceState, def) {
    const rules = getScenarioDropRules(def);
    if (!rules.length || !sourceState || !cellPct) return;
    const now = performance.now();
    const avoidSet = makeScenarioDropAvoidSet(sourceState, def);
    const expanded = [];
    rules.forEach((rule) => {
      const count = Number.isFinite(rule.count) ? Math.max(1, Math.floor(rule.count)) : 1;
      for (let i = 0; i < count; i += 1) expanded.push(rule);
    });
    expanded.forEach((rule, index) => {
      const drop = createScenarioDrop(sourceState, rule, index, expanded.length, now, avoidSet);
      if (drop) scenarioDrops.push(drop);
    });
    persistScenarioDrops();
  }

  function activateScenarioObject(state, def) {
    if (!state || !def || state.triggered || activeDialogue) return false;
    if (def.repairQuest) return false;
    state.triggered = true;
    state.opened = true;
    openedIds.add(state.id);
    if (def.transformOnApproach) state.transformed = true;
    spawnScenarioDrops(state, def);
    persistOpenedIds();
    persistScenarioState();
    rebuildScenarioColliderCells();
    startDialogue(def.dialog || []);
    return true;
  }

  function spawnScenarioLand() {
    if (!map.length) return;
    const seeds = [];
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!def || state.triggered) return;
      if (def.noSpawnLand) return;
      if (!scenarioRequirementMet(def)) return;
      const ahead = Number.isFinite(def.triggerRadiusCells) ? def.triggerRadiusCells - 1 : 1;
      if (!scenarioIsOnLand(state, ahead)) return;
      seeds.push({ id: state.id, x: state.gridX, y: state.gridY });
    });
    if (!seeds.length) return;

    const r = 1;
    const width = map[0] ? map[0].length : 0;
    const height = map.length;
    const padding = { left: 0, right: 0, top: 0, bottom: 0 };
    seeds.forEach(({ x, y }) => {
      if (x - r < 0) padding.left = Math.max(padding.left, -(x - r));
      if (y - r < 0) padding.top = Math.max(padding.top, -(y - r));
      if (x + r >= width) padding.right = Math.max(padding.right, x + r - width + 1);
      if (y + r >= height) padding.bottom = Math.max(padding.bottom, y + r - height + 1);
    });

    let nextMap = map;
    const shift = { x: 0, y: 0 };
    if (padding.left || padding.right || padding.top || padding.bottom) {
      nextMap = applyPaddingToMap(nextMap, padding);
      shift.x = padding.left;
      shift.y = padding.top;
    }
    if (shift.x || shift.y) {
      scenarioState.forEach((s) => {
        s.gridX += shift.x;
        s.gridY += shift.y;
      });
      seeds.forEach((seed) => {
        seed.x += shift.x;
        seed.y += shift.y;
      });
      persistScenarioState();
    }

    let changed = false;
    const openedNow = new Set();
    seeds.forEach(({ id, x, y }) => {
      let centerBecameLand = false;
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          const yy = y + dy;
          const xx = x + dx;
          if (!nextMap[yy] || typeof nextMap[yy][xx] === 'undefined') continue;
          if (nextMap[yy][xx]) continue;
          nextMap[yy][xx] = 1;
          changed = true;
          if (dx === 0 && dy === 0) centerBecameLand = true;
        }
      }
      if (centerBecameLand) openedNow.add(id);
    });

    if (openedNow.size) {
      let anyOpenedAdded = false;
      openedNow.forEach((id) => {
        const def = scenarioById.get(id);
        if (!scenarioRequirementMet(def)) return;
        if (!openedIds.has(id)) {
          openedIds.add(id);
          anyOpenedAdded = true;
        }
        const st = scenarioState.find((s) => s.id === id);
        if (st) st.opened = true;
      });
      if (anyOpenedAdded) persistOpenedIds();
      persistScenarioState();
    }
    if (!changed && !shift.x && !shift.y) return;
    map = nextMap;
    localStorage.setItem('map', JSON.stringify(map));
    localStorage.setItem('mapShift', JSON.stringify(shift));
    loadMapData({ skipScenarioShift: true });
  }

  function rebuildScenarioColliderCells() {
    const cells = new Set();
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!shouldRenderScenarioState(state, def) || !scenarioIsOnLand(state)) return;
      const radius = Number.isFinite(def.colliderRadius) ? Math.max(1, Math.round(def.colliderRadius)) : 1;
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) cells.add(cellKey(state.gridX + dx, state.gridY + dy));
      }
    });
    localStorage.setItem(SCENARIO_COLLIDER_CELLS_KEY, JSON.stringify([...cells]));
    localStorage.setItem(SCENARIO_COLLIDER_UPDATED_KEY, String(Date.now()));
  }

  function getScenarioBlockers() {
    const raw = localStorage.getItem(SCENARIO_COLLIDER_CELLS_KEY);
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      return new Set();
    }
  }

  function startDialogue(lines) {
    if (!Array.isArray(lines) || !lines.length) return;
    activeDialogue = { lines, index: 0, phase: 'show', phaseStart: performance.now() };
  }

  function updateDialogue(now) {
    if (!activeDialogue) return;
    const duration = activeDialogue.phase === 'show' ? 3000 : 1000;
    if (now - activeDialogue.phaseStart < duration) return;
    if (activeDialogue.phase === 'show') {
      activeDialogue.phase = 'pause';
      activeDialogue.phaseStart = now;
      return;
    }
    activeDialogue.index += 1;
    if (activeDialogue.index >= activeDialogue.lines.length) {
      activeDialogue = null;
      return;
    }
    activeDialogue.phase = 'show';
    activeDialogue.phaseStart = now;
  }

  function getActiveDialogueText() {
    if (!activeDialogue || activeDialogue.phase !== 'show') return null;
    return activeDialogue.lines[activeDialogue.index];
  }

  function syncDialogueText(text) {
    const next = text || '';
    if (next === lastDialogueText) return;
    lastDialogueText = next;
    localStorage.setItem(DIALOGUE_TEXT_KEY, next);
    if (next) localStorage.setItem(DIALOGUE_TEXT_AT_KEY, String(Date.now()));
    else localStorage.removeItem(DIALOGUE_TEXT_AT_KEY);
  }

  function pruneDialogueText() {
    const raw = localStorage.getItem(DIALOGUE_TEXT_KEY) || '';
    if (!raw) return;
    const at = Number(localStorage.getItem(DIALOGUE_TEXT_AT_KEY) || 0);
    if (!Number.isFinite(at) || !at || Date.now() - at > DIALOGUE_TEXT_TTL_MS) {
      localStorage.removeItem(DIALOGUE_TEXT_KEY);
      localStorage.removeItem(DIALOGUE_TEXT_AT_KEY);
    }
  }

  function checkScenarioTriggers() {
    if (activeDialogue) return;
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!shouldRenderScenarioState(state, def) || state.triggered || def.repairQuest) return;
      const radius = getTriggerRadius(def, state);
      if (!triggerRadiusTouchesLand(state, radius)) return;
      if (!isHeroWithinTrigger(state, def)) return;
      if (!scenarioIsOnLand(state)) return;
      activateScenarioObject(state, def);
    });
  }

  function getScenarioTexture(def, state) {
    if (def && def.primitive && def.primitive.kind) return null;
    const visual = state.repaired && def.repairedAssetUrl
      ? { assetUrl: def.repairedAssetUrl, fallbackUrl: def.repairedFallbackUrl || def.repairedAssetUrl }
      : (state.transformed && def.transformOnApproach ? def.transformOnApproach : def);
    const fallback = visual.fallbackUrl || def.fallbackUrl || '';
    const asset = visual.assetUrl || def.assetUrl || '';
    return getTexture(asset) || getTexture(fallback);
  }

  function drawScenarioBoatPrimitive(g, x, y, width, height, repaired, now) {
    const wobble = Math.sin(now / 520) * height * 0.025;
    const yy = y + wobble;
    g.beginFill(repaired ? 0x7f4a24 : 0x6c4a34, 1);
    g.drawPolygon([
      x - width * 0.48, yy - height * 0.02,
      x + width * 0.45, yy - height * 0.12,
      x + width * 0.32, yy + height * 0.24,
      x - width * 0.32, yy + height * 0.28,
    ]);
    g.endFill();
    g.beginFill(repaired ? 0xd8b073 : 0x9d7049, 1);
    g.drawPolygon([
      x - width * 0.35, yy - height * 0.1,
      x + width * 0.28, yy - height * 0.16,
      x + width * 0.18, yy + height * 0.08,
      x - width * 0.28, yy + height * 0.14,
    ]);
    g.endFill();
    g.beginFill(0x3a5878, 1);
    drawRoundedRect(g, x - width * 0.08, yy - height * 0.34, width * 0.25, height * 0.18, height * 0.04);
    g.endFill();
    g.beginFill(0xbfd8e8, 1);
    drawRoundedRect(g, x - width * 0.02, yy - height * 0.31, width * 0.09, height * 0.1, height * 0.025);
    g.endFill();
    if (!repaired) {
      g.lineStyle(Math.max(2, width * 0.025), 0x2f2219, 1);
      g.moveTo(x - width * 0.12, yy - height * 0.18);
      g.lineTo(x - width * 0.02, yy + height * 0.12);
      g.moveTo(x + width * 0.22, yy - height * 0.19);
      g.lineTo(x + width * 0.35, yy + height * 0.04);
      g.lineStyle(0, 0xffffff, 0);
      g.beginFill(0x3d2b20, 1);
      g.drawPolygon([
        x + width * 0.34, yy - height * 0.09,
        x + width * 0.5, yy - height * 0.14,
        x + width * 0.43, yy + height * 0.1,
      ]);
      g.endFill();
    } else {
      g.beginFill(0xf2f2de, 1);
      g.drawPolygon([
        x + width * 0.02, yy - height * 0.5,
        x + width * 0.02, yy - height * 0.18,
        x + width * 0.28, yy - height * 0.18,
      ]);
      g.endFill();
    }
  }

  function drawBlanketSurvivorPrimitive(g, x, y, width, height) {
    g.beginFill(0x253852, 0.28);
    g.drawEllipse(x, y + height * 0.26, width * 0.36, height * 0.14);
    g.endFill();
    g.beginFill(0x6e9ac8, 1);
    drawRoundedRect(g, x - width * 0.36, y - height * 0.05, width * 0.72, height * 0.36, height * 0.12);
    g.endFill();
    g.beginFill(0xd9b18d, 1);
    g.drawCircle(x + width * 0.18, y - height * 0.08, height * 0.16);
    g.endFill();
    g.beginFill(0x59402f, 1);
    g.drawEllipse(x + width * 0.18, y - height * 0.17, height * 0.15, height * 0.08);
    g.endFill();
  }

  function drawScenarioPrimitive(g, state, def, metrics, now) {
    const kind = def && def.primitive && def.primitive.kind;
    if (kind === 'brokenBoat') {
      drawScenarioBoatPrimitive(g, metrics.baseX, metrics.baseY + metrics.floatOffset, metrics.width, metrics.height, Boolean(state.repaired), now);
      return true;
    }
    if (kind === 'blanketSurvivor') {
      drawBlanketSurvivorPrimitive(g, metrics.baseX, metrics.baseY + metrics.floatOffset, metrics.width, metrics.height);
      return true;
    }
    return false;
  }

  function drawWaterRipples(g, x, y, width, height, now, state) {
    const seed = ((state.gridX * 17 + state.gridY * 31) % 1000) / 1000;
    const baseT = (now / WATER_RIPPLE_PERIOD_MS + seed) % 1;
    for (let i = 0; i < WATER_RIPPLE_COUNT; i += 1) {
      const t = (baseT + i / WATER_RIPPLE_COUNT) % 1;
      const fade = 1 - t;
      const alpha = 0.13 * fade * fade;
      if (alpha <= 0.01) continue;
      const wobble = Math.sin(now / 520 + i * 1.7 + seed * Math.PI * 2) * 0.025;
      const rx = width * (0.42 + t * 0.36 + wobble);
      const ry = height * (0.17 + t * 0.16 - wobble * 0.45);
      g.lineStyle(Math.max(1, getWorldCellPx() * 0.018), 0xffffff, alpha);
      g.drawEllipse(x, y, rx, ry);
    }
    g.lineStyle(0, 0xffffff, 0);
  }

  function drawScenarioLandGlint(g, x, y, width, height, now, state) {
    const seed = (((state.gridX * 73 + state.gridY * 41) % 997) + 997) % 997;
    const t = (now + seed * 13) % SCENARIO_GLINT_PERIOD_MS;
    if (t > SCENARIO_GLINT_ACTIVE_MS) return;
    const u = t / SCENARIO_GLINT_ACTIVE_MS;
    const alpha = Math.sin(u * Math.PI) * 0.92;
    if (alpha <= 0.01) return;
    const offsetX = Math.sin(seed * 0.37) * width * 0.18;
    const offsetY = Math.cos(seed * 0.29) * height * 0.1;
    const gx = x + width * 0.18 + offsetX;
    const gy = y - height * 0.23 + offsetY;
    const r = Math.max(6, Math.min(width, height) * (0.16 + 0.08 * easeOutQuad(u)));

    g.lineStyle(Math.max(1, r * 0.08), 0xffffff, alpha);
    g.moveTo(gx - r, gy);
    g.lineTo(gx + r, gy);
    g.moveTo(gx, gy - r);
    g.lineTo(gx, gy + r);
    g.lineStyle(Math.max(1, r * 0.045), 0xfff0a8, alpha * 0.75);
    g.moveTo(gx - r * 0.58, gy - r * 0.58);
    g.lineTo(gx + r * 0.58, gy + r * 0.58);
    g.moveTo(gx + r * 0.58, gy - r * 0.58);
    g.lineTo(gx - r * 0.58, gy + r * 0.58);
    g.lineStyle(Math.max(1, r * 0.035), 0xffffff, alpha * 0.34);
    g.drawCircle(gx, gy, r * (0.55 + u * 0.55));
    g.lineStyle(0, 0xffffff, 0);
    g.beginFill(0xffffff, alpha);
    g.drawCircle(gx, gy, Math.max(1.5, r * 0.14));
    g.endFill();
  }

  function getScenarioRenderMetrics(state, def, now = performance.now()) {
    const x = (state.gridX + 0.5) * cellPct;
    const y = (state.gridY + 0.5) * cellPct;
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    const renderOffset = def && def.renderOffsetPx ? def.renderOffsetPx : {};
    const offsetX = Number.isFinite(renderOffset.x) ? renderOffset.x * sizeScale : 0;
    const offsetY = Number.isFinite(renderOffset.y) ? renderOffset.y * sizeScale : 0;
    const baseX = pct2px(x) + offsetX;
    const baseY = pct2px(y) + offsetY;
    const floating = Boolean(def && def.forceFloating) || !scenarioCenterIsOnLand(state);
    const floatOffset = floating ? Math.sin(now / 600 + state.gridX) * pct2px(cellPct * 0.15) : 0;
    const width = (Number.isFinite(def && def.widthPx) ? def.widthPx : 60) * sizeScale;
    const height = (Number.isFinite(def && def.heightPx) ? def.heightPx : 60) * sizeScale;
    return { baseX, baseY, floating, floatOffset, width, height };
  }

  function hitAvailableLandScenarioAt(screenX, screenY) {
    if (!cellPct || activeDialogue) return null;
    const worldX = screenX - worldRoot.x;
    const worldY = screenY - worldRoot.y;
    const now = performance.now();
    for (let i = scenarioState.length - 1; i >= 0; i -= 1) {
      const state = scenarioState[i];
      const def = scenarioById.get(state.id);
      if (!shouldRenderScenarioState(state, def) || state.triggered || def.repairQuest) continue;
      const metrics = getScenarioRenderMetrics(state, def, now);
      if (metrics.floating || !state.opened) continue;
      const cx = metrics.baseX;
      const cy = metrics.baseY + metrics.floatOffset;
      const halfW = metrics.width * (0.5 + SCENARIO_GLINT_HIT_PAD);
      const halfH = metrics.height * (0.5 + SCENARIO_GLINT_HIT_PAD);
      if (Math.abs(worldX - cx) <= halfW && Math.abs(worldY - cy) <= halfH) return { state, def };
    }
    return null;
  }

  function activateAvailableLandScenarioAt(screenX, screenY) {
    const hit = hitAvailableLandScenarioAt(screenX, screenY);
    return Boolean(hit && activateScenarioObject(hit.state, hit.def));
  }

  function getScenarioWaterY(def, baseY, floatOffset, height) {
    const factor = Number.isFinite(def && def.waterShadowYFactor) ? def.waterShadowYFactor : 0.35;
    return baseY + floatOffset + height * factor;
  }

  function renderScenarioObjects(now) {
    scenarioGraphics.clear();
    scenarioFxGraphics.clear();
    const activeIds = new Set();
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!shouldRenderScenarioState(state, def)) return;
      if (!def || !Number.isFinite(state.gridX) || !Number.isFinite(state.gridY)) return;
      activeIds.add(state.id);
      const { baseX, baseY, floating, floatOffset, width, height } = getScenarioRenderMetrics(state, def, now);
      const waterY = getScenarioWaterY(def, baseY, floatOffset, height);

      if (floating) drawWaterRipples(scenarioGraphics, baseX, waterY, width, height, now, state);

      beginFill(scenarioGraphics, floating ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)');
      scenarioGraphics.drawEllipse(baseX, waterY, width * 0.35, height * 0.16);
      scenarioGraphics.endFill();

      let sprite = scenarioSprites.get(state.id);
      const texture = getScenarioTexture(def, state);
      if (texture) {
        if (!sprite) {
          sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          scenarioSprites.set(state.id, sprite);
          scenarioSpriteLayer.addChild(sprite);
        } else if (sprite.texture !== texture) {
          sprite.texture = texture;
        }
        sprite.visible = true;
        sprite.x = baseX;
        sprite.y = baseY + floatOffset;
        sprite.width = width;
        sprite.height = height;
      } else {
        if (sprite) sprite.visible = false;
        if (!drawScenarioPrimitive(scenarioGraphics, state, def, { baseX, baseY, floating, floatOffset, width, height }, now)) {
          beginFill(scenarioGraphics, '#cfd8dc');
          drawRoundedRect(scenarioGraphics, baseX - width / 2, baseY + floatOffset - height / 2, width, height, Math.min(width, height) * 0.2);
          scenarioGraphics.endFill();
        }
      }
      if (!floating && state.opened && !state.triggered && !def.repairQuest) drawScenarioLandGlint(scenarioFxGraphics, baseX, baseY + floatOffset, width, height, now, state);
    });
    scenarioSprites.forEach((sprite, id) => {
      if (!activeIds.has(id)) sprite.visible = false;
    });
  }

  function createSmallIslandMap() {
    const center = Math.floor(NEW_ISLAND_MAP_SIZE / 2);
    const radius = (NEW_ISLAND_SIZE - 1) / 2;
    const beachWidth = 2.1;
    return Array.from({ length: NEW_ISLAND_MAP_SIZE }, (_, y) =>
      Array.from({ length: NEW_ISLAND_MAP_SIZE }, (_, x) => {
        const dx = x - center;
        const dy = y - center;
        const d = Math.hypot(dx, dy);
        if (d > radius) return 0;
        if (d >= radius - beachWidth) return { surfaceType: 'sand' };
        return 1;
      })
    );
  }

  function placePreseededResource(def, gridX, gridY) {
    if (!def || !map[gridY] || !map[gridY][gridX] || !cellPct) return false;
    if (getTileSurfaceType(map[gridY][gridX]) === 'sand') return false;
    const key = cellKey(gridX, gridY);
    if (busy.has(key)) return false;
    const bush = {
      uid: nextBushUid++,
      gridX,
      gridY,
      ...center(gridX, gridY),
      stage: 'ripe',
      t0: performance.now() - BUSH_GROW_MS,
      scale: 1,
      berries: [],
      leafs: [],
      berryDef: def,
      extractStage: isExtractable(def) ? 0 : undefined,
      harvestStart: 0,
      preseeded: true,
    };
    bushes.push(bush);
    busy.add(key);
    registerResourceCollider(bush);
    registerResourceSpawn(bush);
    return true;
  }

  function seedNewIslandPines() {
    const islandRun = Math.max(1, Math.floor(Number(localStorage.getItem(ISLAND_RUN_KEY) || 1) || 1));
    if (islandRun < 2 || !campfireCenter) return;
    if (bushes.some((b) => b && b.preseeded && b.berryDef && b.berryDef.id === 'pine')) return;
    const pine = resourceById.get('pine');
    if (!pine) return;
    const cx = Math.round(campfireCenter.x);
    const cy = Math.round(campfireCenter.y);
    [
      { x: -2, y: -6 }, { x: 1, y: -6 }, { x: 4, y: -5 },
      { x: 6, y: -2 }, { x: 6, y: 2 }, { x: 4, y: 5 },
      { x: 1, y: 6 }, { x: -2, y: 6 },
    ].forEach((offset) => {
      placePreseededResource(pine, cx + offset.x, cy + offset.y);
    });
  }

  function getNewIslandArrivalCell() {
    const bounds = getIslandBoundsGrid();
    if (!bounds) return null;
    const y = Math.round((bounds.minY + bounds.maxY) / 2);
    for (let x = bounds.minX + 4; x <= bounds.maxX; x += 1) {
      if (map[y] && map[y][x] && getTileSurfaceType(map[y][x]) !== 'sand') return { gx: x, gy: y };
    }
    return { gx: bounds.minX + 2, gy: y };
  }

  function placeHeroAtNewIslandArrival() {
    const cell = getNewIslandArrivalCell();
    if (!cell) return;
    charXPct = ((cell.gx + 0.5) / GRID_W) * 100;
    charYPct = ((cell.gy + 0.5) / GRID_W) * 100;
    facing = -1;
    localStorage.setItem('heroState', JSON.stringify({ charXPct, charYPct, facing, isMoving: false }));
  }

  function resetProgressForNextIsland() {
    localStorage.setItem(ISLAND_RUN_KEY, '2');
    localStorage.setItem('map', JSON.stringify(createSmallIslandMap()));
    localStorage.setItem('baseGridW', String(NEW_ISLAND_MAP_SIZE));
    localStorage.setItem('islandExpansionLevel', '0');
    localStorage.setItem('mapShift', JSON.stringify({ x: 0, y: 0 }));
    localStorage.removeItem('campfireCenter');
    localStorage.removeItem('campfireCenterMapSig');
    localStorage.removeItem(SCENARIO_OPENED_KEY);
    localStorage.removeItem(SCENARIO_STATE_KEY);
    localStorage.removeItem(SCENARIO_DROPS_KEY);
    localStorage.removeItem(SCENARIO_COLLIDER_CELLS_KEY);
    localStorage.removeItem(BOAT_REPAIRED_KEY);
    localStorage.removeItem(BOAT_REPAIR_REQUEST_KEY);
    const user = getUserState();
    user.money = 0;
    user.inventory = {};
    user.unlockedResources = {};
    user.questLine = { index: 0, updatedAt: Date.now() };
    user.stats = { moneyEarned: 0, itemsCollected: 0, itemsCollectedById: {} };
    setUserState(user);
    bushes.splice(0);
    busy.clear();
    resourceColliderCells.clear();
    resourceSpawnCells.clear();
    scenarioDrops = [];
    openedIds = loadOpenedIds();
    loadMapData({ resetHero: true });
    scenarioState = loadScenarioState();
    persistScenarioState();
    persistScenarioDrops();
    rebuildScenarioColliderCells();
    placeHeroAtNewIslandArrival();
    seedNewIslandPines();
    rebuildResourceColliderCells();
    rebuildResourceSpawnCells();
    updateCameraToHero();
    window.dispatchEvent(new CustomEvent('vibe-map-changed'));
  }

  function getBoatScenarioState() {
    return scenarioState.find((state) => state.id === 'broken-boat') || null;
  }

  function startBoatCutscene() {
    if (boatCutscene) return;
    const state = getBoatScenarioState();
    const def = scenarioById.get('broken-boat');
    if (!state || !def) return;
    state.repaired = true;
    state.opened = true;
    updateCameraToHero();
    const now = performance.now();
    const metrics = getScenarioRenderMetrics(state, def, now);
    const lighthouseState = scenarioState.find((item) => item.id === 'lighthouse');
    const lighthouseDef = scenarioById.get('lighthouse');
    const lighthouseMetrics = lighthouseState && lighthouseDef ? getScenarioRenderMetrics(lighthouseState, lighthouseDef, now) : null;
    const startX = lighthouseMetrics ? (-camera.x + lighthouseMetrics.baseX) : (-camera.x + metrics.baseX);
    const startY = lighthouseMetrics ? (-camera.y + lighthouseMetrics.baseY - lighthouseMetrics.height * 0.72) : (-camera.y + metrics.baseY + metrics.floatOffset);
    state.hidden = true;
    localStorage.setItem(BOAT_REPAIRED_KEY, '1');
    persistScenarioState();
    boatCutscene = {
      phase: 'depart',
      t0: performance.now(),
      resetDone: false,
      startX,
      startY,
      width: metrics.width,
      height: metrics.height,
    };
    facing = 1;
    controllerState.joyActive = false;
    controllerState.vxPct = 0;
    controllerState.vyPct = 0;
    saveController();
  }

  function consumeBoatRepairRequest() {
    if (boatCutscene) return;
    const raw = localStorage.getItem(BOAT_REPAIR_REQUEST_KEY);
    if (!raw) return;
    localStorage.removeItem(BOAT_REPAIR_REQUEST_KEY);
    startBoatCutscene();
  }

  function drawCutsceneBoat(now) {
    if (!boatCutscene || boatCutscene.phase !== 'depart') return;
    const t = clamp((now - boatCutscene.t0) / 2800, 0, 1);
    const x = lerp(boatCutscene.startX, gameWidth + boatCutscene.width * 0.9, easeInCubic(t));
    const y = boatCutscene.startY + Math.sin(now / 260) * 5;
    const texture = getTexture('./images/scenario/boat-repaired.png');
    if (texture) {
      cutsceneBoatSprite.visible = true;
      cutsceneBoatSprite.texture = texture;
      cutsceneBoatSprite.x = x;
      cutsceneBoatSprite.y = y;
      cutsceneBoatSprite.width = boatCutscene.width;
      cutsceneBoatSprite.height = boatCutscene.height;
      cutsceneBoatSprite.rotation = Math.sin(now / 260) * 0.025;
    } else {
      cutsceneBoatSprite.visible = false;
      drawScenarioBoatPrimitive(cutsceneGraphics, x, y, boatCutscene.width, boatCutscene.height, true, now);
    }
    cutsceneGraphics.beginFill(0xd9b18d, 1);
    cutsceneGraphics.drawCircle(x - boatCutscene.width * 0.03, y - boatCutscene.height * 0.34, Math.max(4, boatCutscene.height * 0.11));
    cutsceneGraphics.endFill();
    cutsceneGraphics.beginFill(0xc84235, 1);
    cutsceneGraphics.drawRect(x - boatCutscene.width * 0.1, y - boatCutscene.height * 0.27, boatCutscene.width * 0.18, boatCutscene.height * 0.18);
    cutsceneGraphics.endFill();
  }

  function updateBoatCutscene(now) {
    if (!boatCutscene) return;
    const elapsed = now - boatCutscene.t0;
    if (boatCutscene.phase === 'depart' && elapsed >= 2800) {
      boatCutscene.phase = 'fadeOut';
      boatCutscene.t0 = now;
      return;
    }
    if (boatCutscene.phase === 'fadeOut' && elapsed >= 1000) {
      boatCutscene.phase = 'timeText';
      boatCutscene.t0 = now;
      if (!boatCutscene.resetDone) {
        boatCutscene.resetDone = true;
        resetProgressForNextIsland();
      }
      return;
    }
    if (boatCutscene.phase === 'timeText' && elapsed >= 1800) {
      boatCutscene.phase = 'fadeIn';
      boatCutscene.t0 = now;
      return;
    }
    if (boatCutscene.phase === 'fadeIn' && elapsed >= 1200) {
      boatCutscene = null;
      startDialogue(['кажется, топливо закончилось', 'надо исследовать этот остров']);
    }
  }

  function renderTransition(now) {
    cutsceneGraphics.clear();
    transitionGraphics.clear();
    transitionText.text = '';
    cutsceneBoatSprite.visible = false;
    if (!boatCutscene) return;
    drawCutsceneBoat(now);
    let alpha = 0;
    if (boatCutscene.phase === 'fadeOut') alpha = clamp((now - boatCutscene.t0) / 1000, 0, 1);
    else if (boatCutscene.phase === 'timeText') alpha = 1;
    else if (boatCutscene.phase === 'fadeIn') alpha = 1 - clamp((now - boatCutscene.t0) / 1200, 0, 1);
    if (alpha > 0) {
      transitionGraphics.beginFill(0x000000, alpha);
      transitionGraphics.drawRect(0, 0, gameWidth, gameHeight);
      transitionGraphics.endFill();
    }
    if (boatCutscene.phase === 'timeText') {
      transitionText.text = '8 часов спустя';
      transitionText.x = gameWidth / 2;
      transitionText.y = gameHeight / 2;
    }
  }

  const bushes = [];
  const busy = new Set();
  const resourceColliderCells = new Set();
  const resourceSpawnCells = new Set();
  const resourceSprites = new Map();
  const berrySprites = new Map();
  const buildingSprites = new Map();
  const sharkSprites = [];
  let pendingResourceColliderSync = false;
  let lastPickMs = 0;
  let nextBushUid = 1;
  let nextBerryUid = 1;
  let activeChopTargetUid = null;

  function requestResourceColliderSync() {
    if (pendingResourceColliderSync) return;
    pendingResourceColliderSync = true;
    setTimeout(() => {
      pendingResourceColliderSync = false;
      localStorage.setItem('resourceColliderCells', JSON.stringify([...resourceColliderCells]));
      localStorage.setItem('resourceColliderUpdatedAt', String(Date.now()));
    }, 0);
  }

  function shiftResourcesAfterMapChange(prevCellPct, shiftX, shiftY) {
    if (!prevCellPct || !GRID_W) return;
    const nextBusy = new Set();
    bushes.forEach((b) => {
      const oldGridX = b.gridX;
      const oldGridY = b.gridY;
      const newGridX = oldGridX + shiftX;
      const newGridY = oldGridY + shiftY;
      const oldCenterX = (oldGridX + 0.5) * prevCellPct;
      const oldCenterY = (oldGridY + 0.5) * prevCellPct;
      const newCenterX = (newGridX + 0.5) * cellPct;
      const newCenterY = (newGridY + 0.5) * cellPct;
      const dx = newCenterX - oldCenterX;
      const dy = newCenterY - oldCenterY;
      b.gridX = newGridX;
      b.gridY = newGridY;
      b.xPct += dx;
      b.yPct += dy;
      b.berries.forEach((be) => {
        be.xPct += dx;
        be.yPct += dy;
        be.x0 += dx;
        be.y0 += dy;
        be.tx += dx;
        be.ty += dy;
      });
      b.leafs.forEach((leaf) => {
        leaf.xPct += dx;
        leaf.yPct += dy;
      });
      if (b.stage === 'growing' || b.stage === 'ripe') nextBusy.add(cellKey(b.gridX, b.gridY));
    });
    scenarioDrops.forEach((drop) => {
      const shiftPoint = (xKey, yKey) => {
        if (!Number.isFinite(drop[xKey]) || !Number.isFinite(drop[yKey])) return;
        const gridX = drop[xKey] / prevCellPct + shiftX;
        const gridY = drop[yKey] / prevCellPct + shiftY;
        drop[xKey] = gridX * cellPct;
        drop[yKey] = gridY * cellPct;
      };
      shiftPoint('xPct', 'yPct');
      shiftPoint('x0', 'y0');
      shiftPoint('tx', 'ty');
    });
    if (scenarioDrops.length) persistScenarioDrops();
    busy.clear();
    nextBusy.forEach((key) => busy.add(key));
  }

  function mkBerry(onBush, xPct, yPct, def) {
    return {
      uid: nextBerryUid++,
      def,
      onBush,
      xPct,
      yPct,
      scale: 0.01,
      t0: performance.now(),
      alive: true,
      x0: xPct,
      y0: yPct,
      tx: xPct,
      ty: yPct,
      flying: false,
      tFly0: 0,
      flyDur: BERRY_FLY_MS,
      stage: 'idle',
      tPick0: 0,
      ux: 0,
      uy: 0,
    };
  }

  function mkLeaf(xPct, yPct, opts = {}) {
    const a = Number.isFinite(opts.angle) ? opts.angle : rnd(0, Math.PI * 2);
    const v = vec(a);
    const spd = rnd(
      Number.isFinite(opts.spdMin) ? opts.spdMin : LEAF_SPD_MIN,
      Number.isFinite(opts.spdMax) ? opts.spdMax : LEAF_SPD_MAX
    );
    return {
      xPct,
      yPct,
      vxPct: v.x * spd,
      vyPct: v.y * spd,
      rot: rnd(0, Math.PI * 2),
      angVel: rnd(-18, 18) * (Math.PI / 180),
      t0: Number.isFinite(opts.t0) ? opts.t0 : performance.now(),
      color: opts.color,
      sizePct: Number.isFinite(opts.sizePct) ? opts.sizePct : 1,
      lifeMs: Number.isFinite(opts.lifeMs) ? opts.lifeMs : LEAF_LIFE_MS,
    };
  }

  function mkWoodChip(xPct, yPct, side, now, primitive) {
    const speed = rnd(WOOD_CHIP_SPD_MIN, WOOD_CHIP_SPD_MAX);
    return {
      xPct,
      yPct,
      vxPct: side * speed * rnd(0.65, 1.1),
      vyPct: -speed * rnd(0.28, 0.72),
      rot: rnd(0, Math.PI * 2),
      angVel: rnd(-18, 18) * (Math.PI / 180),
      sizePct: rnd(0.22, 0.48),
      color: parseColor(primitive.trunk || primitive.bark || '#8a5a2b', '#8a5a2b').color,
      t0: now,
      lastT: now,
    };
  }

  function isExtractable(def) {
    return def && def.resourceType === 'extractable';
  }

  function isTreeDef(def) {
    const primitive = (def && (def.bushPrimitive || def.primitive)) || {};
    return primitive.kind === 'tree';
  }

  function isBiomeOnlyResource(def) {
    return Boolean(isExtractable(def) && getAllowedResourceSurfaceTypes(def));
  }

  function getExtractStages(def) {
    if (!def || !Array.isArray(def.extractStages) || !def.extractStages.length) return [1];
    return def.extractStages;
  }

  function getExtractHarvestMs(def) {
    return def && Number.isFinite(def.extractHarvestMs) ? def.extractHarvestMs : 700;
  }

  function getResourceColliderBox(def, stageIndex = 0) {
    if (!def || !def.collider) return null;
    if (Array.isArray(def.colliderBoxStages) && def.colliderBoxStages.length) {
      const idx = clamp(stageIndex, 0, def.colliderBoxStages.length - 1);
      const stage = def.colliderBoxStages[idx] || {};
      const radiusX = Math.max(0, Math.round(Number.isFinite(stage.x) ? stage.x : stage.radiusX || stage[0] || 0));
      const radiusY = Math.max(0, Math.round(Number.isFinite(stage.y) ? stage.y : stage.radiusY || stage[1] || 0));
      return { radiusX, radiusY };
    }
    const radius = Number.isFinite(def.colliderRadius) ? def.colliderRadius : 1;
    const normalized = Math.max(1, Math.round(radius));
    return { radiusX: normalized, radiusY: normalized };
  }

  function collectColliderCells(gridX, gridY, radiusX, radiusY, padding = 0) {
    const cells = [];
    const expandedX = Math.max(0, Math.round(radiusX) + Math.max(0, Math.round(padding)));
    const expandedY = Math.max(0, Math.round(radiusY) + Math.max(0, Math.round(padding)));
    for (let dy = -expandedY; dy <= expandedY; dy += 1) {
      for (let dx = -expandedX; dx <= expandedX; dx += 1) cells.push(cellKey(gridX + dx, gridY + dy));
    }
    return cells;
  }

  function getResourceColliderCells(gridX, gridY, def, stageIndex = 0, padding = 0) {
    const box = getResourceColliderBox(def, stageIndex);
    if (!box) return [];
    return collectColliderCells(gridX, gridY, box.radiusX, box.radiusY, padding);
  }

  function heroTouchesResourceCollider(bush) {
    if (!bush || !isExtractable(bush.berryDef)) return false;
    const heroPos = getHeroGridPosition();
    if (!heroPos) return false;
    const cells = getResourceColliderCells(
      bush.gridX,
      bush.gridY,
      bush.berryDef,
      typeof bush.extractStage === 'number' ? bush.extractStage : 0,
      RESOURCE_FARMING_PADDING
    );
    return cells.includes(cellKey(heroPos.gridX, heroPos.gridY));
  }

  function registerResourceCollider(bush) {
    if (!bush || !isExtractable(bush.berryDef)) return;
    const cells = getResourceColliderCells(
      bush.gridX,
      bush.gridY,
      bush.berryDef,
      typeof bush.extractStage === 'number' ? bush.extractStage : 0,
      RESOURCE_COLLIDER_PADDING
    );
    if (!cells.length) return;
    cells.forEach((key) => resourceColliderCells.add(key));
    bush.colliderCells = cells;
    requestResourceColliderSync();
  }

  function unregisterResourceCollider(bush) {
    if (!bush || !Array.isArray(bush.colliderCells)) return;
    bush.colliderCells.forEach((key) => resourceColliderCells.delete(key));
    bush.colliderCells = null;
    requestResourceColliderSync();
  }

  function refreshResourceCollider(bush) {
    if (!bush || !isExtractable(bush.berryDef)) return;
    unregisterResourceCollider(bush);
    registerResourceCollider(bush);
  }

  function getResourceSpawnCells(gridX, gridY, def, stageIndex = 0) {
    if (isExtractable(def)) return getResourceColliderCells(gridX, gridY, def, stageIndex, RESOURCE_COLLIDER_PADDING);
    return collectColliderCells(gridX, gridY, 0, 0, 0);
  }

  function registerResourceSpawn(bush) {
    if (!bush) return;
    const cells = getResourceSpawnCells(
      bush.gridX,
      bush.gridY,
      bush.berryDef,
      typeof bush.extractStage === 'number' ? bush.extractStage : 0
    );
    if (!cells.length) return;
    cells.forEach((key) => resourceSpawnCells.add(key));
    bush.spawnCells = cells;
  }

  function unregisterResourceSpawn(bush) {
    if (!bush || !Array.isArray(bush.spawnCells)) return;
    bush.spawnCells.forEach((key) => resourceSpawnCells.delete(key));
    bush.spawnCells = null;
  }

  function refreshResourceSpawn(bush) {
    if (!bush) return;
    unregisterResourceSpawn(bush);
    registerResourceSpawn(bush);
  }

  function rebuildResourceColliderCells() {
    resourceColliderCells.clear();
    bushes.forEach((b) => {
      if (!isExtractable(b.berryDef)) return;
      const cells = getResourceColliderCells(
        b.gridX,
        b.gridY,
        b.berryDef,
        typeof b.extractStage === 'number' ? b.extractStage : 0,
        RESOURCE_COLLIDER_PADDING
      );
      cells.forEach((key) => resourceColliderCells.add(key));
      b.colliderCells = cells;
    });
    requestResourceColliderSync();
  }

  function rebuildResourceSpawnCells() {
    resourceSpawnCells.clear();
    bushes.forEach((b) => {
      if (b.stage !== 'dead') registerResourceSpawn(b);
    });
  }

  function markResourceSeen() {
    localStorage.setItem(RESOURCE_LAST_SEEN_KEY, String(Date.now()));
  }

  function getOfflineFillRatio() {
    const lastSeen = Number(localStorage.getItem(RESOURCE_LAST_SEEN_KEY) || 0);
    if (!lastSeen) return 0;
    return clamp(Math.max(0, Date.now() - lastSeen) / OFFLINE_FILL_WINDOW_MS, 0, 1);
  }

  function getExtractStageScale(b) {
    if (!b || !isExtractable(b.berryDef)) return 1;
    const stages = getExtractStages(b.berryDef);
    const idx = clamp(typeof b.extractStage === 'number' ? b.extractStage : 0, 0, stages.length - 1);
    return stages[idx] || 1;
  }

  function getExtractParticleDef(def) {
    if (!def) return { id: 'log', widthPx: 20, heightPx: 12, primitive: { kind: 'log' } };
    if (def.__extractParticleDef) return def.__extractParticleDef;
    const primitive = def.primitive || {};
    if (primitive.kind === 'tree') {
      def.__extractParticleDef = {
        id: def.extractParticleItemId || def.extractParticleDropId || def.id,
        titleRu: def.extractParticleTitleRu || def.titleRu || def.id,
        assetUrl: def.extractParticleAssetUrl || '',
        widthPx: Number.isFinite(def.extractParticleWidthPx) ? def.extractParticleWidthPx : 48,
        heightPx: Number.isFinite(def.extractParticleHeightPx) ? def.extractParticleHeightPx : 34,
        inventoryItem: true,
        resourceCategory: 'wood',
        primitive: { kind: 'log', bark: primitive.trunk || '#6d4a2f', core: '#c89a5b' },
      };
    } else {
      def.__extractParticleDef = { id: def.id, widthPx: 18, heightPx: 18, primitive };
    }
    return def.__extractParticleDef;
  }

  function getBushVisualDef(bush) {
    const def = bush.berryDef || {};
    return {
      type: def.bushType || 'default',
      scale: typeof def.bushScale === 'number' ? def.bushScale : 1,
      assetUrl: def.bushAssetUrl || def.assetUrl || '',
      assetUrls: Array.isArray(def.bushAssetUrls) ? def.bushAssetUrls : null,
      widthPx: Number.isFinite(def.bushWidthPx) ? def.bushWidthPx : (Number.isFinite(def.widthPx) ? def.widthPx : null),
      heightPx: Number.isFinite(def.bushHeightPx) ? def.bushHeightPx : (Number.isFinite(def.heightPx) ? def.heightPx : null),
      anchorY: Number.isFinite(def.bushAnchorY) ? def.bushAnchorY : (Number.isFinite(def.assetAnchorY) ? def.assetAnchorY : null),
      primitive: def.bushPrimitive || null,
    };
  }

  function getCellSurfaceType(x, y) {
    return getTileSurfaceType(map[y] && map[y][x]);
  }

  function getAllowedResourceSurfaceTypes(def) {
    if (!def) return null;
    if (Array.isArray(def.surfaceTypes) && def.surfaceTypes.length) return new Set(def.surfaceTypes);
    if (def.surfaceType) return new Set([def.surfaceType]);
    return null;
  }

  function canSpawnResourceOnCell(def, x, y) {
    const surfaceType = getCellSurfaceType(x, y);
    const allowed = getAllowedResourceSurfaceTypes(def);
    if (allowed) return allowed.has(surfaceType);
    return surfaceType !== 'dead' && surfaceType !== 'snow';
  }

  function getSpawnRadius(def) {
    const minSpawnRadius = Number.isFinite(def && def.minSpawnRadius) ? def.minSpawnRadius : DEFAULT_MIN_SPAWN_RADIUS;
    const maxSpawnRadius = Number.isFinite(def && def.maxSpawnRadius) ? def.maxSpawnRadius : DEFAULT_MAX_SPAWN_RADIUS;
    const safeMin = Math.max(0, minSpawnRadius);
    return { min: safeMin, max: Math.max(safeMin, maxSpawnRadius) };
  }

  function spawnBush(berryDef) {
    if (!land.length) return false;
    const candidateCells = land.filter((cell) => canSpawnResourceOnCell(berryDef, cell.x, cell.y));
    if (!candidateCells.length) return false;
    const spawnRadius = getSpawnRadius(berryDef);
    const extractable = isExtractable(berryDef);
    const buildingCells = getActiveBuildingCells(extractable ? RESOURCE_COLLIDER_PADDING : 0);
    const heroPos = extractable ? getHeroGridPosition() : null;
    const scenarioBlockers = getScenarioBlockers();
    const attempts = Math.max(40, candidateCells.length * 2);
    for (let i = 0; i < attempts; i += 1) {
      const c = candidateCells[Math.random() * candidateCells.length | 0];
      const key = cellKey(c.x, c.y);
      if (campfireCenter) {
        const dist = Math.hypot(c.x - campfireCenter.x, c.y - campfireCenter.y);
        if (dist < spawnRadius.min || dist > spawnRadius.max) continue;
      }
      if (heroPos && Math.hypot(c.x - heroPos.gridX, c.y - heroPos.gridY) <= COLLIDER_SPAWN_HERO_BUFFER_CELLS) continue;
      if (buildingCells.has(key) || scenarioBlockers.has(key) || busy.has(key)) continue;
      const spawnCells = getResourceSpawnCells(c.x, c.y, berryDef, 0);
      if (spawnCells.some((cell) => buildingCells.has(cell) || scenarioBlockers.has(cell) || resourceSpawnCells.has(cell))) continue;
      if (extractable && spawnCells.some((cell) => resourceColliderCells.has(cell))) continue;
      busy.add(key);
      const bush = { uid: nextBushUid++, gridX: c.x, gridY: c.y, ...center(c.x, c.y), stage: 'growing', t0: performance.now(), scale: 0, berries: [], leafs: [], berryDef };
      bushes.push(bush);
      registerResourceSpawn(bush);
      if (extractable) registerResourceCollider(bush);
      return true;
    }
    return false;
  }

  function fillOfflineResources() {
    const ratio = getOfflineFillRatio();
    if (ratio <= 0) {
      markResourceSeen();
      return;
    }
    const target = Math.round(MAX_UNPICKED_BUSHES * ratio);
    let active = bushes.filter((b) => b.stage === 'growing' || b.stage === 'ripe').length;
    let needed = Math.max(0, Math.min(MAX_UNPICKED_BUSHES - active, target - active));
    if (needed <= 0) {
      markResourceSeen();
      return;
    }
    let attempts = 0;
    while (needed > 0 && attempts < needed * 20) {
      attempts += 1;
      if (spawnBush(pickBerryDef())) {
        needed -= 1;
        active += 1;
      }
    }
    markResourceSeen();
  }

  function updateFlyingDrop(be, now) {
    if (!be || !be.flying) return;
    const k = outCub(clamp((now - be.tFly0) / be.flyDur, 0, 1));
    be.xPct = be.x0 + (be.tx - be.x0) * k;
    be.yPct = be.y0 + (be.ty - be.y0) * k;
    if (k >= 1) be.flying = false;
  }

  function updateFlyingParticles(b, now) {
    b.berries.forEach((be) => updateFlyingDrop(be, now));
  }

  function spawnWoodChips(b, now) {
    if (!isTreeDef(b && b.berryDef)) return;
    if (!b.woodChips) b.woodChips = [];
    const h = getHero();
    const side = h.charXPct < b.xPct ? -1 : 1;
    const primitive = (b.berryDef && (b.berryDef.bushPrimitive || b.berryDef.primitive)) || {};
    const hitXPct = b.xPct + side * cellPct * rnd(0.18, 0.32);
    const hitYPct = b.yPct - cellPct * rnd(0.26, 0.48);
    for (let i = 0; i < WOOD_CHIP_COUNT; i += 1) {
      b.woodChips.push(mkWoodChip(hitXPct, hitYPct, side, now, primitive));
    }
    b.chopHitAt = now;
    b.chopShakeSide = side;
  }

  function updateWoodChips(b, now) {
    if (!b.woodChips || !b.woodChips.length) return;
    b.woodChips = b.woodChips.filter((chip) => {
      const dt = clamp((now - (chip.lastT || now)) / 1000, 0, 0.05);
      chip.lastT = now;
      chip.xPct += chip.vxPct * dt;
      chip.yPct += chip.vyPct * dt;
      chip.vyPct += 18 * dt;
      chip.rot += chip.angVel;
      return now - chip.t0 < WOOD_CHIP_LIFE_MS;
    });
  }

  function normalizeRareDropRules(def) {
    if (!def) return [];
    if (Array.isArray(def.rareDrops)) return def.rareDrops;
    if (def.rareDrop) return [def.rareDrop];
    return [];
  }

  function getRareDropDef(rule) {
    if (!rule || typeof rule !== 'object') return null;
    if (rule.def && typeof rule.def === 'object') return rule.def;
    const id = rule.id || rule.resourceId || rule.dropId;
    if (!id) return null;
    return inventoryItemById.get(id) || resourceById.get(id);
  }

  function shouldRollRareDrop(rule, phase) {
    const on = rule.on || rule.phase || 'final';
    if (on !== 'always' && on !== phase) return false;
    const chance = Number.isFinite(rule.chance) ? rule.chance : Number(rule.probability);
    return Math.random() < clamp(Number.isFinite(chance) ? chance : 0, 0, 1);
  }

  function getRareDropCount(rule) {
    if (Number.isFinite(rule.count)) return Math.max(1, Math.floor(rule.count));
    const min = Number.isFinite(rule.minCount) ? rule.minCount : 1;
    const max = Number.isFinite(rule.maxCount) ? rule.maxCount : min;
    return Math.max(1, rndi(Math.floor(min), Math.floor(Math.max(min, max))));
  }

  function spawnFlyingDrop(b, dropDef, now, avoidSet, minDist = SCATTER_MIN_PCT, maxDist = SCATTER_MAX_PCT) {
    const a = rnd(0, Math.PI * 2);
    const d = rnd(minDist, maxDist);
    const v = vec(a);
    const to = clampToLandSafe(b.xPct + v.x * d, b.yPct + v.y * d, BERRY_R_PCT, avoidSet);
    const be = mkBerry(false, b.xPct, b.yPct, dropDef);
    Object.assign(be, { x0: b.xPct, y0: b.yPct, tx: to.xPct, ty: to.yPct, flying: true, tFly0: now, flyDur: BERRY_FLY_MS, onBush: false, scale: 1 });
    b.berries.push(be);
  }

  function getResourceBurstColors(b, visual) {
    const primitive = (visual && visual.primitive) || (b.berryDef && (b.berryDef.bushPrimitive || b.berryDef.primitive)) || {};
    const colors = [];
    const add = (value, fallback) => {
      if (!value && !fallback) return;
      const parsed = parseColor(value || fallback, fallback || '#1d8f46');
      if (!colors.includes(parsed.color)) colors.push(parsed.color);
    };
    add(primitive.grass, '#1f8b45');
    add(primitive.leaf || primitive.foliage, '#2f9b52');
    add(primitive.accent, null);
    add(primitive.root, null);
    add(primitive.cap, null);
    add(primitive.capShade, null);
    add(primitive.stem, null);
    add(primitive.base, null);
    if (!colors.length) colors.push(0x1d8f46);
    return colors;
  }

  function getResourceBurstStart(b, visual, now) {
    const resolvedVisual = visual || getBushVisualDef(b);
    const bounds = getResourceAuraBounds(b, resolvedVisual, now);
    const centered = bounds && (resolvedVisual.type === 'centered' || bounds.primitive.kind === 'tree');
    const spreadX = bounds.width * (centered ? 0.32 : 0.44);
    const topY = centered ? bounds.topY + bounds.height * 0.18 : bounds.topY + bounds.height * 0.35;
    const bottomY = centered ? bounds.baseY - bounds.height * 0.08 : bounds.baseY + bounds.height * 0.06;
    const x = bounds.x + rnd(-spreadX, spreadX);
    const y = rnd(Math.min(topY, bottomY), Math.max(topY, bottomY));
    return { xPct: px2pct(x), yPct: px2pct(y) };
  }

  function spawnResourceBurst(b, now) {
    if (!b || b.resourceBurstSpawned) return;
    b.resourceBurstSpawned = true;
    const visual = getBushVisualDef(b);
    const centered = visual.type === 'centered';
    const colors = getResourceBurstColors(b, visual);
    const count = centered ? CENTERED_RESOURCE_BURST_COUNT : RESOURCE_BURST_COUNT;
    for (let i = 0; i < count; i += 1) {
      const start = getResourceBurstStart(b, visual, now);
      b.leafs.push(mkLeaf(start.xPct, start.yPct, {
        t0: now,
        color: colors[rndi(0, colors.length - 1)],
        sizePct: centered ? rnd(0.72, 1.55) : rnd(0.66, 1.22),
        spdMin: centered ? LEAF_SPD_MIN * 1.05 : LEAF_SPD_MIN,
        spdMax: centered ? LEAF_SPD_MAX * 1.7 : LEAF_SPD_MAX * 1.25,
        lifeMs: centered ? rnd(760, 980) : rnd(640, 820),
      }));
    }
  }

  function spawnRareDrops(b, now, avoidSet, phase) {
    const rules = normalizeRareDropRules(b && b.berryDef);
    if (!rules.length) return;
    rules.forEach((rule) => {
      if (!rule || typeof rule !== 'object') return;
      const rolls = Number.isFinite(rule.rolls) ? Math.max(1, Math.floor(rule.rolls)) : 1;
      for (let roll = 0; roll < rolls; roll += 1) {
        if (!shouldRollRareDrop(rule, phase)) continue;
        const dropDef = getRareDropDef(rule);
        if (!dropDef) continue;
        const count = getRareDropCount(rule);
        const minDist = Number.isFinite(rule.scatterMinPct) ? rule.scatterMinPct : SCATTER_MIN_PCT * 0.75;
        const maxDist = Number.isFinite(rule.scatterMaxPct) ? rule.scatterMaxPct : SCATTER_MAX_PCT * 0.9;
        for (let i = 0; i < count; i += 1) spawnFlyingDrop(b, dropDef, now, avoidSet, minDist, maxDist);
      }
    });
  }

  function spawnExtractParticles(b, now, avoidSet) {
    const particleDef = getExtractParticleDef(b.berryDef);
    const count = Number.isFinite(b.berryDef && b.berryDef.extractParticleCount) ? b.berryDef.extractParticleCount : EXTRACT_PARTICLE_COUNT;
    for (let i = 0; i < count; i += 1) {
      spawnFlyingDrop(b, particleDef, now, avoidSet);
    }
  }

  function heroInExtractRange(b) {
    const h = getHero();
    const dist = Math.hypot(pct2px(h.charXPct - b.xPct), pct2px(h.charYPct - b.yPct));
    const touch = heroTouchesResourceCollider(b) || bushTouchesHero(b.xPct, b.yPct, h.charXPct, h.charYPct, BUSH_R_PCT);
    return touch || dist <= pct2px(BURST_R_PCT);
  }

  function clearResourceChopTarget(b) {
    if (b && activeChopTargetUid === b.uid) activeChopTargetUid = null;
    if (!b) return;
    b.chopSwingAt = 0;
    b.chopStrikeDone = false;
  }

  function startResourceChopSwing(b, now) {
    if (!b.uid) b.uid = nextBushUid++;
    activeChopTargetUid = b.uid;
    b.chopSwingAt = now;
    b.chopStrikeDone = false;
    localStorage.setItem('heroAction', JSON.stringify({ chopAt: now, targetUid: b.uid }));
  }

  function applyResourceChop(b, now) {
    const avoidSet = new Set([...getActiveBuildingCells(), ...getScenarioBlockers()]);
    spawnWoodChips(b, now);
    spawnExtractParticles(b, now, avoidSet);
    const stages = getExtractStages(b.berryDef);
    const nextStage = (typeof b.extractStage === 'number' ? b.extractStage : 0) + 1;
    const willFinish = nextStage >= stages.length;
    spawnRareDrops(b, now, avoidSet, willFinish ? 'final' : 'hit');
    b.extractStage = nextStage;
    if (b.extractStage >= stages.length) {
      awardChopExperience(b);
      b.stage = 'exploded';
      if (isTreeDef(b.berryDef)) b.shadowFadeUntil = now + TREE_SHADOW_FADE_MS;
      busy.delete(cellKey(b.gridX, b.gridY));
      unregisterResourceCollider(b);
      clearResourceChopTarget(b);
    } else {
      refreshResourceCollider(b);
      refreshResourceSpawn(b);
    }
  }

  function updateBush(b) {
    const now = performance.now();
    updateWoodChips(b, now);
    if (b.stage === 'growing') {
      b.scale = outBack(clamp((now - b.t0) / BUSH_GROW_MS, 0, 1));
      if (b.scale >= 1) {
        b.stage = 'ripe';
        if (isExtractable(b.berryDef)) {
          b.extractStage = 0;
          b.harvestStart = 0;
          return;
        }
        const n = rndi(...BERRIES_MIN_MAX);
        if (!b.berryDef) b.berryDef = pickBerryDef();
        const bushType = b.berryDef && b.berryDef.bushType;
        for (let i = 0; i < n; i += 1) {
          if (bushType === 'centered') {
            b.berries.push(mkBerry(true, b.xPct, b.yPct, b.berryDef));
          } else {
            const a = rnd(0, Math.PI * 2);
            const r = rnd(0.3, 0.8) * BUSH_R_PCT;
            const v = vec(a);
            b.berries.push(mkBerry(true, b.xPct + v.x * r, b.yPct + v.y * r, b.berryDef));
          }
        }
      }
      return;
    }
    if (b.stage === 'ripe') {
      if (isExtractable(b.berryDef)) {
        updateFlyingParticles(b, now);
        if (!heroInExtractRange(b)) {
          clearResourceChopTarget(b);
          return;
        }
        if (activeChopTargetUid && activeChopTargetUid !== b.uid) return;
        const swingElapsed = b.chopSwingAt ? now - b.chopSwingAt : Infinity;
        if (!b.chopSwingAt || swingElapsed >= CHOP_DUR + CHOP_REARM_MS) {
          startResourceChopSwing(b, now);
          return;
        }
        if (!b.chopStrikeDone && swingElapsed >= CHOP_DUR * CHOP_STRIKE_RATIO) {
          if (!heroInExtractRange(b)) {
            clearResourceChopTarget(b);
            return;
          }
          b.chopStrikeDone = true;
          applyResourceChop(b, now);
        }
        return;
      }
      b.berries.forEach((be) => { be.scale = clamp((now - be.t0) / BERRIES_GROW_MS, 0, 1); });
      const h = getHero();
      const dist = Math.hypot(pct2px(h.charXPct - b.xPct), pct2px(h.charYPct - b.yPct));
      const touch = bushTouchesHero(b.xPct, b.yPct, h.charXPct, h.charYPct, BUSH_R_PCT);
      if (touch || dist <= pct2px(BURST_R_PCT)) {
        const visual = getBushVisualDef(b);
        const centered = visual.type === 'centered';
        spawnResourceBurst(b, now);
        const avoidSet = new Set([...getActiveBuildingCells(), ...getScenarioBlockers()]);
        b.berries.forEach((be) => {
          const a = rnd(0, Math.PI * 2);
          const d = rnd(SCATTER_MIN_PCT, SCATTER_MAX_PCT);
          const v = vec(a);
          const to = clampToLandSafe(b.xPct + v.x * d, b.yPct + v.y * d, BERRY_R_PCT, avoidSet);
          const from = centered ? getResourceBurstStart(b, visual, now) : { xPct: be.xPct, yPct: be.yPct };
          Object.assign(be, {
            xPct: from.xPct,
            yPct: from.yPct,
            x0: from.xPct,
            y0: from.yPct,
            tx: to.xPct,
            ty: to.yPct,
            flying: true,
            tFly0: now,
            flyDur: centered ? BERRY_FLY_MS * 1.35 : BERRY_FLY_MS,
            onBush: false,
            scale: 1,
          });
        });
        spawnRareDrops(b, now, avoidSet, 'final');
        awardChopExperience(b);
        b.stage = 'exploded';
        busy.delete(cellKey(b.gridX, b.gridY));
        localStorage.setItem('heroAction', JSON.stringify({ chopAt: now }));
      }
      return;
    }
    if (b.stage === 'exploded') {
      b.leafs = b.leafs.filter((leaf) => {
        const dt = 1 / 60;
        leaf.xPct += leaf.vxPct * dt;
        leaf.yPct += leaf.vyPct * dt;
        leaf.rot += leaf.angVel;
        return now - leaf.t0 < (leaf.lifeMs || LEAF_LIFE_MS);
      });
      updateFlyingParticles(b, now);
      const hasWoodChips = Boolean(b.woodChips && b.woodChips.length);
      if (!b.leafs.length && !hasWoodChips && b.berries.every((be) => !be.alive)) b.stage = 'dead';
    }
  }

  function isInventoryDropDef(def) {
    return Boolean(def && (def.inventoryItem || inventoryItemById.has(def.id) || isMaterialDropDef(def)));
  }

  function collectInventoryDrop(def) {
    if (!def || !def.id) return;
    const user = getUserState();
    if (!user.inventory || typeof user.inventory !== 'object') user.inventory = {};
    user.inventory[def.id] = Math.max(0, Number(user.inventory[def.id]) || 0) + 1;
    addItemCollectedStat(user, def.id, 1);
    setUserState(user);
    localStorage.setItem('inventoryUpdatedAt', String(Date.now()));
  }

  function collectBerryInstant(be) {
    if (!be || !be.alive) return;
    be.alive = false;
    be.stage = 'done';
    if (isInventoryDropDef(be.def)) {
      collectInventoryDrop(be.def);
      return;
    }
    localStorage.setItem('berriesCollected', String((+localStorage.getItem('berriesCollected') || 0) + 1));
    const user = getUserState();
    const profit = getCollectProfit(be.def);
    user.money = (user.money || 0) + profit;
    addMoneyEarnedStat(user, profit);
    addItemCollectedStat(user, be.def && be.def.id, 1);
    setUserState(user);
  }

  function getDropScreenPosition(drop) {
    return {
      x: Math.round(worldRoot.x + pct2px(drop.xPct)),
      y: Math.round(worldRoot.y + pct2px(drop.yPct)),
    };
  }

  function beginScenarioFoundItem(drop) {
    if (!drop || !drop.def || drop.stage === 'finding' || drop.stage === 'done') return;
    const pos = getDropScreenPosition(drop);
    const detail = {
      id: drop.def.id,
      dropUid: drop.uid,
      titleRu: drop.def.titleRu || drop.def.id,
      assetUrl: drop.def.assetUrl || '',
      widthPx: Number.isFinite(drop.def.widthPx) ? drop.def.widthPx : 48,
      heightPx: Number.isFinite(drop.def.heightPx) ? drop.def.heightPx : 48,
      startX: pos.x,
      startY: pos.y,
    };
    drop.alive = false;
    drop.stage = 'finding';
    persistScenarioDrops();
    localStorage.setItem(PENDING_FOUND_ITEM_KEY, JSON.stringify(detail));
    window.dispatchEvent(new CustomEvent('vibe-found-item', { detail }));
  }

  function completeScenarioFoundItem(detail) {
    const uid = detail && Number(detail.dropUid);
    if (!Number.isFinite(uid)) return;
    const before = scenarioDrops.length;
    scenarioDrops = scenarioDrops.filter((drop) => drop.uid !== uid);
    if (scenarioDrops.length !== before) persistScenarioDrops();
  }

  function collectScenarioDropInstant(drop) {
    if (!drop || drop.stage === 'finding') return;
    if (drop.special) {
      beginScenarioFoundItem(drop);
      return;
    }
    collectBerryInstant(drop);
    persistScenarioDrops();
  }

  function collectUnderBuildings() {
    if (!cellPct) return;
    const buildingCells = getActiveBuildingCells();
    if (!buildingCells.size) return;
    bushes.forEach((b) => {
      const key = cellKey(b.gridX, b.gridY);
      if (!buildingCells.has(key)) return;
      if (b.stage === 'growing' || b.stage === 'ripe') {
        if (isExtractable(b.berryDef)) {
          b.stage = 'dead';
          busy.delete(key);
          unregisterResourceCollider(b);
          unregisterResourceSpawn(b);
          return;
        }
        b.berries.forEach(collectBerryInstant);
        b.stage = 'dead';
        busy.delete(key);
        unregisterResourceSpawn(b);
      }
    });
    bushes.forEach((b) => {
      b.berries.forEach((be) => {
        if (!be.alive) return;
        const gx = Math.floor(be.xPct / cellPct);
        const gy = Math.floor(be.yPct / cellPct);
        if (buildingCells.has(cellKey(gx, gy))) collectBerryInstant(be);
      });
    });
  }

  function collectLoop() {
    collectUnderBuildings();
    const now = performance.now();
    const hxPct = charXPct;
    const hyPct = charYPct;
    const hx = pct2px(hxPct);
    const hy = pct2px(hyPct);
    const pickTargetYPct = hyPct - PICK_TARGET_UP_CELLS * cellPct;

    const updatePickAnimation = (be, onCollect) => {
      if (be.stage === 'collectOut') {
        const u = clamp((now - be.tPick0) / PICK_OUT_MS, 0, 1);
        be.xPct = lerp(be.x0, be.x0 + be.ux * PICK_OUT_DIST_PCT * PICK_R_PCT, u);
        be.yPct = lerp(be.y0, be.y0 + be.uy * PICK_OUT_DIST_PCT * PICK_R_PCT, u);
        if (u >= 1) {
          be.stage = 'collectIn';
          be.tPick0 = now;
          be.x0 = be.xPct;
          be.y0 = be.yPct;
        }
      } else if (be.stage === 'collectIn') {
        const u = clamp((now - be.tPick0) / PICK_IN_MS, 0, 1);
        be.xPct = lerp(be.x0, hxPct, u);
        be.yPct = lerp(be.y0, pickTargetYPct, u);
        if (u >= 1) onCollect(be);
      }
    };

    bushes.forEach((b) => b.berries.forEach((be) => updatePickAnimation(be, collectBerryInstant)));
    let scenarioDropsChanged = false;
    scenarioDrops.forEach((drop) => {
      const beforeFlying = drop.flying;
      updateFlyingDrop(drop, now);
      const beforeStage = drop.stage;
      updatePickAnimation(drop, collectScenarioDropInstant);
      if (drop.stage !== beforeStage || drop.flying !== beforeFlying) scenarioDropsChanged = true;
    });
    const beforeDropCount = scenarioDrops.length;
    scenarioDrops = scenarioDrops.filter((drop) => drop.stage !== 'done');
    if (scenarioDrops.length !== beforeDropCount) scenarioDropsChanged = true;
    if (scenarioDropsChanged) persistScenarioDrops();

    if (now - lastPickMs < PICK_COOLDOWN_MS) return;
    const cand = [];
    bushes.forEach((b) => b.berries.forEach((be) => {
      if (be.stage === 'idle' && be.alive && !be.flying && !be.onBush) {
        const d = Math.hypot(pct2px(be.xPct) - hx, pct2px(be.yPct) - hy);
        const under = isInHeroRect(be.xPct, be.yPct, hxPct, hyPct);
        if (under || d <= pct2px(PICK_R_PCT)) cand.push({ be, d });
      }
    }));
    scenarioDrops.forEach((be) => {
      if (be.stage === 'idle' && be.alive && !be.flying) {
        const d = Math.hypot(pct2px(be.xPct) - hx, pct2px(be.yPct) - hy);
        const under = isInHeroRect(be.xPct, be.yPct, hxPct, hyPct);
        if (under || d <= pct2px(PICK_R_PCT)) cand.push({ be, d });
      }
    });
    if (!cand.length) return;
    cand.sort((a, b) => a.d - b.d);
    const be = cand[0].be;
    lastPickMs = now;
    if (be.scenarioDrop && be.special) {
      beginScenarioFoundItem(be);
      return;
    }
    const ux = be.xPct - hxPct;
    const uy = be.yPct - hyPct;
    const len = Math.hypot(ux, uy) || 1;
    Object.assign(be, { ux: ux / len, uy: uy / len, stage: 'collectOut', tPick0: now, x0: be.xPct, y0: be.yPct });
  }

  function drawMushroomPrimitive(g, x, y, w, h, primitive) {
    beginFill(g, primitive.shadow || 'rgba(0,0,0,0.2)');
    g.drawEllipse(x, y + h * 0.25, w * 0.4, h * 0.1);
    g.endFill();
    beginFill(g, primitive.grass || '#1f8b45');
    g.drawEllipse(x, y + h * 0.32, w * 0.45, h * 0.13);
    g.endFill();
    beginFill(g, primitive.stem || '#e6d7c3');
    drawRoundedRect(g, x - w * 0.12, y - h * 0.05, w * 0.24, h * 0.28, w * 0.04);
    g.endFill();
    beginFill(g, primitive.cap || '#f2e9dd');
    g.drawEllipse(x, y - h * 0.08, w * 0.45, h * 0.25);
    g.endFill();
    beginFill(g, primitive.capShade || '#d6c7b4');
    g.drawEllipse(x, y, w * 0.35, h * 0.16);
    g.endFill();
  }

  function drawTreePrimitive(g, x, y, w, h, primitive) {
    if (primitive.form === 'pine') {
      beginFill(g, primitive.trunk || '#6d4a2f');
      g.drawRect(x - w * 0.08, y + h * 0.1, w * 0.16, h * 0.35);
      g.endFill();
      beginFill(g, primitive.foliage || '#1f6a32');
      g.drawPolygon([x, y - h * 0.45, x - w * 0.45, y + h * 0.15, x + w * 0.45, y + h * 0.15]);
      g.endFill();
      beginFill(g, primitive.accent || '#2d8845');
      g.drawPolygon([x, y - h * 0.3, x - w * 0.35, y + h * 0.2, x + w * 0.35, y + h * 0.2]);
      g.endFill();
    } else {
      beginFill(g, primitive.bark || primitive.trunk || '#6d4a2f');
      g.drawRect(x - w * 0.09, y + h * 0.1, w * 0.18, h * 0.38);
      g.endFill();
      beginFill(g, primitive.foliage || '#3c8f4d');
      g.drawEllipse(x, y - h * 0.05, w * 0.4, h * 0.35);
      g.endFill();
      beginFill(g, primitive.accent || '#58a95f');
      g.drawEllipse(x - w * 0.2, y - h * 0.2, w * 0.2, h * 0.18);
      g.endFill();
    }
  }

  function drawBeetPrimitive(g, x, y, w, h, primitive) {
    beginFill(g, primitive.shadow || 'rgba(0,0,0,0.2)');
    g.drawEllipse(x, y + h * 0.25, w * 0.4, h * 0.1);
    g.endFill();
    beginFill(g, primitive.grass || '#1b7d3e');
    g.drawEllipse(x, y + h * 0.28, w * 0.45, h * 0.12);
    g.endFill();
    beginFill(g, primitive.root || '#8a1227');
    g.drawEllipse(x, y + h * 0.05, w * 0.28, h * 0.32);
    g.drawPolygon([x, y + h * 0.35, x - w * 0.08, y + h * 0.45, x + w * 0.08, y + h * 0.45]);
    g.endFill();
    beginFill(g, primitive.leaf || '#2f9b52');
    g.drawPolygon([x, y - h * 0.1, x - w * 0.36, y - h * 0.36, x - w * 0.1, y - h * 0.45]);
    g.drawPolygon([x, y - h * 0.12, x + w * 0.36, y - h * 0.36, x + w * 0.1, y - h * 0.45]);
    g.endFill();
  }

  function getBushScale(stage, t0, now) {
    if (stage !== 'growing') return 1;
    return outBack(clamp((now - t0) / BUSH_GROW_MS, 0, 1));
  }

  function getTopBushScale(stage, t0, now) {
    if (stage !== 'growing') return 1;
    return outBack(clamp(((now - t0) * BUSH_TOP_GROW_MULT) / BUSH_GROW_MS, 0, 1));
  }

  function getCenteredBushScale(now, b) {
    const grow = clamp((now - b.t0) / BUSH_GROW_MS, 0, 1);
    return { sx: lerp(0.6, 1, outCub(grow)), sy: lerp(0.2, 1, outBack(grow)) };
  }

  function getExtractStageIndex(b) {
    if (!b || !isExtractable(b.berryDef)) return 0;
    const stages = getExtractStages(b.berryDef);
    return clamp(typeof b.extractStage === 'number' ? b.extractStage : 0, 0, stages.length - 1);
  }

  function getBushSpriteTexture(b, visual) {
    if (Array.isArray(visual.assetUrls) && visual.assetUrls.length) {
      const stageUrl = visual.assetUrls[getExtractStageIndex(b)] || visual.assetUrls[visual.assetUrls.length - 1];
      return getTexture(stageUrl) || getTexture(visual.assetUrl);
    }
    return getTexture(visual.assetUrl);
  }

  function shouldDrawTreeShadow(b, visual) {
    const primitive = visual.primitive || (b.berryDef && b.berryDef.primitive) || {};
    return primitive.kind === 'tree';
  }

  function drawResourceTreeShadow(b, visual, now, alpha = 1) {
    if (!shouldDrawTreeShadow(b, visual)) return;
    const scaleParts = getCenteredBushScale(now, b);
    const visualScale = typeof visual.scale === 'number' ? visual.scale : 1;
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    const fallbackH = pct2px(BUSH_R_PCT) * 5;
    const fallbackW = pct2px(BUSH_R_PCT) * 3.6;
    const stageScale = Array.isArray(visual.assetUrls) && visual.assetUrls.length ? 1 : getExtractStageScale(b);
    const width = (visual.widthPx || fallbackW) * sizeScale * scaleParts.sx * visualScale * stageScale;
    const height = (visual.heightPx || fallbackH) * sizeScale * scaleParts.sy * visualScale * stageScale;
    const x = pct2px(b.xPct);
    const y = pct2px(b.yPct);
    beginFill(resourceShadowGraphics, `rgba(0,0,0,${0.24 * clamp(alpha, 0, 1)})`, '#000000');
    resourceShadowGraphics.drawEllipse(x, y + height * 0.045, width * 0.28, Math.max(3, height * 0.045));
    resourceShadowGraphics.endFill();
  }

  function getTreeChopRotation(b, now) {
    if (!b || !b.chopHitAt || !isTreeDef(b.berryDef)) return 0;
    const t = (now - b.chopHitAt) / TREE_CHOP_SHAKE_MS;
    if (t < 0 || t >= 1) return 0;
    const fade = (1 - t) * (1 - t);
    const side = b.chopShakeSide || 1;
    return -side * Math.sin(t * Math.PI * 3.4) * TREE_CHOP_SHAKE_ROT * fade;
  }

  function renderBushSprite(b, now, visual, activeSpriteIds) {
    if (b.stage === 'exploded' || b.stage === 'dead') return false;
    const texture = getBushSpriteTexture(b, visual);
    if (!texture) return false;
    if (!b.uid) b.uid = nextBushUid++;
    let sprite = resourceSprites.get(b.uid);
    if (!sprite) {
      sprite = new PIXI.Sprite(texture);
      resourceSprites.set(b.uid, sprite);
      resourceSpriteLayer.addChild(sprite);
    } else if (sprite.texture !== texture) {
      sprite.texture = texture;
    }
    const scaleParts = getCenteredBushScale(now, b);
    const visualScale = typeof visual.scale === 'number' ? visual.scale : 1;
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    const fallbackH = pct2px(BUSH_R_PCT) * 5;
    const fallbackW = pct2px(BUSH_R_PCT) * 3.6;
    const stageScale = Array.isArray(visual.assetUrls) && visual.assetUrls.length ? 1 : getExtractStageScale(b);
    const x = pct2px(b.xPct);
    const y = pct2px(b.yPct);
    const width = (visual.widthPx || fallbackW) * sizeScale * scaleParts.sx * visualScale * stageScale;
    const height = (visual.heightPx || fallbackH) * sizeScale * scaleParts.sy * visualScale * stageScale;
    drawResourceTreeShadow(b, visual, now, 1);
    sprite.visible = true;
    sprite.anchor.set(0.5, Number.isFinite(visual.anchorY) ? visual.anchorY : 0.86);
    sprite.x = x;
    sprite.y = y;
    sprite.width = width;
    sprite.height = height;
    sprite.rotation = getTreeChopRotation(b, now);
    sprite.alpha = 1;
    sprite.zIndex = sprite.y;
    activeSpriteIds.add(b.uid);
    return true;
  }

  function drawBushCentered(g, b, now, visual) {
    if (b.stage === 'exploded' || b.stage === 'dead') return;
    const scaleParts = getCenteredBushScale(now, b);
    const base = pct2px(BUSH_R_PCT);
    const visualScale = typeof visual.scale === 'number' ? visual.scale : 1;
    const extractScale = getExtractStageScale(b);
    const w = base * 6 * scaleParts.sx * visualScale * extractScale;
    const h = base * 5 * scaleParts.sy * visualScale * extractScale;
    const x = pct2px(b.xPct);
    const y = pct2px(b.yPct);
    const primitive = visual.primitive || b.berryDef.primitive || {};
    if (primitive.kind === 'beet') drawBeetPrimitive(g, x, y, w, h, primitive);
    else if (primitive.kind === 'tree') drawTreePrimitive(g, x, y, w, h, primitive);
    else drawMushroomPrimitive(g, x, y, w, h, primitive);
  }

  function drawBushBottom(g, b, now) {
    if (b.stage === 'exploded' || b.stage === 'dead') return;
    const s = getBushScale(b.stage, b.t0, now);
    const r = pct2px(BUSH_R_PCT) * s;
    const x = pct2px(b.xPct);
    const y = pct2px(b.yPct);
    beginFill(g, '#145c2b');
    g.drawCircle(x, y, r);
    g.endFill();
    beginFill(g, '#197c3a');
    g.drawCircle(x - 0.3 * r, y - 0.2 * r, 0.8 * r);
    g.drawCircle(x + 0.35 * r, y - 0.1 * r, 0.75 * r);
    g.endFill();
  }

  function drawBushTop(g, b, now) {
    if (b.stage === 'exploded' || b.stage === 'dead') return;
    const s = getTopBushScale(b.stage, b.t0, now);
    const r = pct2px(BUSH_R_PCT) * s;
    beginFill(g, '#1a7b38');
    g.drawCircle(pct2px(b.xPct) - 0.2 * r, pct2px(b.yPct) - 0.35 * r, 0.82 * r);
    g.drawCircle(pct2px(b.xPct) + 0.35 * r, pct2px(b.yPct) - 0.3 * r, 0.9 * r);
    g.endFill();
  }

  function renderBerrySprite(be, activeBerrySpriteIds) {
    if (!be.alive && be.stage !== 'collectOut' && be.stage !== 'collectIn') return false;
    if (be.onBush && be.def && be.def.bushType === 'centered') return false;
    if (be.onBush && be.def && be.def.bushAssetUrl) return false;
    const def = be.def || {};
    const outlineUrl = !be.onBush ? (def.dropAssetUrl || getDropOutlineAssetUrl(def.assetUrl)) : '';
    const texture = getTexture(outlineUrl) || getTexture(def.assetUrl);
    if (!texture) return false;
    if (!be.uid) be.uid = nextBerryUid++;
    let sprite = berrySprites.get(be.uid);
    if (!sprite) {
      sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      berrySprites.set(be.uid, sprite);
      resourceSpriteLayer.addChild(sprite);
    } else if (sprite.texture !== texture) {
      sprite.texture = texture;
    }
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    const s = be.onBush ? be.scale : 1;
    const centeredScale = def.bushType === 'centered' ? 0.6 : 1;
    const width = (Number.isFinite(def.widthPx) ? def.widthPx : 24) * sizeScale * s * centeredScale;
    const height = (Number.isFinite(def.heightPx) ? def.heightPx : 24) * sizeScale * s * centeredScale;
    sprite.visible = true;
    sprite.x = pct2px(be.xPct);
    sprite.y = pct2px(be.yPct);
    sprite.width = width;
    sprite.height = height;
    sprite.zIndex = sprite.y + 1;
    activeBerrySpriteIds.add(be.uid);
    return true;
  }

  function drawBerry(g, be, activeBerrySpriteIds) {
    if (!be.alive && be.stage !== 'collectOut' && be.stage !== 'collectIn') return;
    if (be.onBush && be.def && be.def.bushType === 'centered') return;
    if (be.onBush && be.def && be.def.bushAssetUrl) return;
    if (renderBerrySprite(be, activeBerrySpriteIds)) return;
    const s = be.onBush ? be.scale : 1;
    const def = be.def || { primitive: { base: '#e11', highlight: 'rgba(255,255,255,0.6)' } };
    const monolithScale = def.bushType === 'centered' ? 1 / 2.5 : 1;
    const r = pct2px(BERRY_R_PCT) * s * monolithScale;
    const x = pct2px(be.xPct);
    const y = pct2px(be.yPct);
    const primitive = def.primitive || {};
    if (primitive.kind === 'mushroom') {
      beginFill(g, primitive.stem || '#e1d2bf');
      g.drawRect(x - r * 0.2, y + r * 0.05, r * 0.4, r * 0.5);
      g.endFill();
      beginFill(g, primitive.cap || '#f4eee6');
      g.drawEllipse(x, y - r * 0.1, r * 0.7, r * 0.45);
      g.endFill();
      return;
    }
    if (primitive.kind === 'beet') {
      beginFill(g, primitive.root || '#9b1b30');
      g.drawEllipse(x, y + r * 0.1, r * 0.6, r * 0.7);
      g.endFill();
      beginFill(g, primitive.leaf || '#2f9b52');
      g.drawPolygon([x, y - r * 0.1, x - r * 0.45, y - r * 0.6, x - r * 0.1, y - r * 0.55]);
      g.drawPolygon([x, y - r * 0.1, x + r * 0.45, y - r * 0.6, x + r * 0.1, y - r * 0.55]);
      g.endFill();
      return;
    }
    if (primitive.kind === 'log') {
      beginFill(g, primitive.bark || '#6d4a2f');
      drawRoundedRect(g, x - r * 1.4, y - r * 0.45, r * 2.8, r * 0.9, r * 0.45);
      g.endFill();
      beginFill(g, primitive.core || '#c89a5b');
      g.drawCircle(x - r * 1.1, y, r * 0.45);
      g.drawCircle(x + r * 1.1, y, r * 0.45);
      g.endFill();
      return;
    }
    beginFill(g, primitive.base || '#e11');
    g.drawCircle(x, y, r);
    g.endFill();
    beginFill(g, primitive.highlight || 'rgba(255,255,255,0.6)');
    g.drawCircle(x - 0.35 * r, y - 0.35 * r, 0.25 * r);
    g.endFill();
  }

  function drawLeaf(g, leaf, now) {
    const alpha = clamp(1 - (now - leaf.t0) / (leaf.lifeMs || LEAF_LIFE_MS), 0, 1);
    const x = pct2px(leaf.xPct);
    const y = pct2px(leaf.yPct);
    const size = Number.isFinite(leaf.sizePct) ? leaf.sizePct : 1;
    const w = pct2px(2 * size);
    const h = pct2px(1 * size);
    const c = Math.cos(leaf.rot);
    const s = Math.sin(leaf.rot);
    const points = [
      [-w / 2, 0],
      [0, -h / 2],
      [w / 2, 0],
      [0, h / 2],
    ].map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]).flat();
    resourceGraphics.beginFill(leaf.color || 0x1d8f46, alpha);
    resourceGraphics.drawPolygon(points);
    resourceGraphics.endFill();
  }

  function drawWoodChip(g, chip, now) {
    const alpha = clamp(1 - (now - chip.t0) / WOOD_CHIP_LIFE_MS, 0, 1);
    if (alpha <= 0) return;
    const x = pct2px(chip.xPct);
    const y = pct2px(chip.yPct);
    const w = Math.max(2, pct2px(chip.sizePct * 1.35));
    const h = Math.max(1.2, pct2px(chip.sizePct * 0.46));
    const c = Math.cos(chip.rot);
    const s = Math.sin(chip.rot);
    const points = [
      [-w / 2, -h / 2],
      [w / 2, -h / 2],
      [w / 2, h / 2],
      [-w / 2, h / 2],
    ].map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]).flat();
    g.beginFill(chip.color || 0x8a5a2b, alpha);
    g.drawPolygon(points);
    g.endFill();
  }

  function drawScenarioDropGlint(g, drop, now) {
    if (!drop || !drop.special || drop.flying || drop.stage !== 'idle' || !drop.alive) return;
    const t = (now + (drop.uid % 997) * 17) % SCENARIO_GLINT_PERIOD_MS;
    if (t > SCENARIO_GLINT_ACTIVE_MS) return;
    const u = t / SCENARIO_GLINT_ACTIVE_MS;
    const alpha = Math.sin(u * Math.PI) * 0.95;
    if (alpha <= 0.01) return;
    const x = pct2px(drop.xPct);
    const y = pct2px(drop.yPct) - pct2px(0.75);
    const r = Math.max(7, pct2px(1.4 + u * 0.8));
    g.lineStyle(Math.max(1, r * 0.08), 0xffffff, alpha);
    g.moveTo(x - r, y);
    g.lineTo(x + r, y);
    g.moveTo(x, y - r);
    g.lineTo(x, y + r);
    g.lineStyle(Math.max(1, r * 0.045), 0xfff0a8, alpha * 0.7);
    g.drawCircle(x, y, r * (0.5 + u * 0.65));
    g.lineStyle(0, 0xffffff, 0);
    g.beginFill(0xffffff, alpha);
    g.drawCircle(x, y, Math.max(1.4, r * 0.13));
    g.endFill();
  }

  function getResourceAuraBounds(b, visual, now) {
    const primitive = visual.primitive || (b.berryDef && b.berryDef.primitive) || {};
    const centered = visual.type === 'centered' || primitive.kind === 'tree';
    const x = pct2px(b.xPct);
    const y = pct2px(b.yPct);
    if (!centered) {
      const r = pct2px(BUSH_R_PCT);
      return { x, y, width: r * 2.8, height: r * 2.6, topY: y - r * 1.55, baseY: y + r * 0.28, primitive };
    }
    const scaleParts = getCenteredBushScale(now, b);
    const visualScale = typeof visual.scale === 'number' ? visual.scale : 1;
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    const fallbackH = pct2px(BUSH_R_PCT) * 5;
    const fallbackW = pct2px(BUSH_R_PCT) * 3.6;
    const stageScale = Array.isArray(visual.assetUrls) && visual.assetUrls.length ? 1 : getExtractStageScale(b);
    const width = (visual.widthPx || fallbackW) * sizeScale * scaleParts.sx * visualScale * stageScale;
    const height = (visual.heightPx || fallbackH) * sizeScale * scaleParts.sy * visualScale * stageScale;
    const anchorY = Number.isFinite(visual.anchorY) ? visual.anchorY : 0.86;
    return { x, y, width, height, topY: y - height * anchorY, baseY: y, primitive };
  }

  function drawResourceAuraParticles(g, b, visual, now) {
    if (!b || b.stage !== 'ripe') return;
    const mature = clamp((now - b.t0 - BUSH_GROW_MS) / 700, 0, 1);
    if (mature <= 0) return;
    const bounds = getResourceAuraBounds(b, visual, now);
    const tree = bounds.primitive.kind === 'tree';
    const count = tree ? RESOURCE_AURA_PARTICLES + 3 : RESOURCE_AURA_PARTICLES;
    const seedBase = ((b.uid || (b.gridX * 37 + b.gridY * 71)) * 97) % 1009;
    const cell = getWorldCellPx();
    for (let i = 0; i < count; i += 1) {
      const seed = seedBase + i * 173;
      const period = RESOURCE_AURA_PERIOD_MS * 2 * (0.82 + ((seed % 29) / 100));
      const u = ((now + seed * 19) % period) / period;
      const pulse = Math.sin(u * Math.PI);
      const alpha = pulse * mature * (tree ? 0.46 : 0.38);
      if (alpha <= 0.015) continue;
      const spread = bounds.width * (tree ? 0.14 : 0.18);
      const drift = bounds.height * (tree ? 0.3 : 0.42);
      const startY = tree ? lerp(bounds.topY + bounds.height * 0.28, bounds.baseY - bounds.height * 0.12, (seed % 7) / 6) : bounds.baseY - bounds.height * 0.18;
      const x = bounds.x + Math.sin(seed * 12.989 + u * Math.PI * 2.2) * spread * (0.35 + ((seed % 11) / 18));
      const y = startY - u * drift + Math.cos(seed * 7.31 + u * Math.PI * 2) * Math.max(1, cell * 0.04);
      const r = clamp(bounds.width * (0.014 + ((seed % 5) * 0.0025)), 1.5, tree ? 4.4 : 3.8);
      g.beginFill(0xffd15c, alpha * 0.5);
      g.drawCircle(x, y, r * 2.35);
      g.endFill();
      g.beginFill(0xfff08a, alpha * 0.95);
      g.drawCircle(x, y, r);
      g.endFill();
      if (u > 0.34 && u < 0.78) {
        const lineAlpha = alpha * 0.42;
        const l = r * 2.3;
        g.lineStyle(Math.max(1, r * 0.36), 0xffdc64, lineAlpha);
        g.moveTo(x - l, y);
        g.lineTo(x + l, y);
        g.moveTo(x, y - l);
        g.lineTo(x, y + l);
        g.lineStyle(0, 0xffffff, 0);
      }
    }
  }

  function renderResources(now) {
    resourceGraphics.clear();
    resourceShadowGraphics.clear();
    const activeSpriteIds = new Set();
    const activeBerrySpriteIds = new Set();
    bushes.forEach((b) => {
      const visual = getBushVisualDef(b);
      let bushSpriteRendered = false;
      if (visual.type === 'centered') {
        bushSpriteRendered = renderBushSprite(b, now, visual, activeSpriteIds);
        if (!bushSpriteRendered) {
          drawBushCentered(resourceGraphics, b, now, visual);
        }
      } else {
        bushSpriteRendered = renderBushSprite(b, now, visual, activeSpriteIds);
        if (!bushSpriteRendered) drawBushBottom(resourceGraphics, b, now);
      }
      b.leafs.forEach((leaf) => drawLeaf(resourceGraphics, leaf, now));
      if (b.woodChips && b.woodChips.length) b.woodChips.forEach((chip) => drawWoodChip(resourceGraphics, chip, now));
      b.berries.forEach((be) => drawBerry(resourceGraphics, be, activeBerrySpriteIds));
      if (visual.type !== 'centered' && !bushSpriteRendered) drawBushTop(resourceGraphics, b, now);
      drawResourceAuraParticles(resourceGraphics, b, visual, now);
      if (b.stage === 'exploded' && b.shadowFadeUntil && now < b.shadowFadeUntil) {
        drawResourceTreeShadow(b, visual, now, (b.shadowFadeUntil - now) / TREE_SHADOW_FADE_MS);
      }
    });
    scenarioDrops.forEach((drop) => {
      drawBerry(resourceGraphics, drop, activeBerrySpriteIds);
      drawScenarioDropGlint(resourceGraphics, drop, now);
    });
    resourceSprites.forEach((sprite, id) => {
      if (activeSpriteIds.has(id)) return;
      resourceSpriteLayer.removeChild(sprite);
      resourceSprites.delete(id);
    });
    berrySprites.forEach((sprite, id) => {
      if (activeBerrySpriteIds.has(id)) return;
      resourceSpriteLayer.removeChild(sprite);
      berrySprites.delete(id);
    });
  }

  function getCampfireDef(user) {
    const upgradeIds = ['campfire-upgrade-3', 'campfire-upgrade-2', 'campfire-upgrade-1'];
    for (const id of upgradeIds) {
      if (user.unlockedResources[id]) return buildingById.get(id) || buildingById.get('campfire');
    }
    return buildingById.get('campfire');
  }

  function drawBuildingPrimitive(g, def, centerX, centerY, size) {
    const primitive = def.primitive || {};
    const baseX = centerX - size / 2;
    const baseY = centerY - size / 2;
    const radius = size * 0.18;
    if (primitive.kind === 'campfire') {
      beginFill(g, primitive.glow || 'rgba(255,160,80,0.5)');
      g.drawEllipse(centerX, centerY + size * 0.1, size * 0.5, size * 0.3);
      g.endFill();
      beginFill(g, primitive.stone || '#6e7a86');
      drawRoundedRect(g, baseX + size * 0.15, baseY + size * 0.55, size * 0.7, size * 0.25, radius);
      g.endFill();
      beginFill(g, primitive.base || '#5b4636');
      drawRoundedRect(g, baseX + size * 0.2, baseY + size * 0.65, size * 0.6, size * 0.18, radius * 0.6);
      g.endFill();
      beginFill(g, primitive.flame || '#ff8a3d');
      g.drawPolygon([centerX, baseY + size * 0.2, baseX + size * 0.75, baseY + size * 0.55, centerX, baseY + size * 0.7, baseX + size * 0.25, baseY + size * 0.55]);
      g.endFill();
      return;
    }
    if (primitive.kind === 'whetstone') {
      beginFill(g, primitive.base || '#9da3aa');
      drawRoundedRect(g, baseX + size * 0.12, baseY + size * 0.2, size * 0.76, size * 0.6, radius);
      g.endFill();
      beginFill(g, primitive.edge || '#dfe5ec');
      drawRoundedRect(g, baseX + size * 0.22, baseY + size * 0.32, size * 0.56, size * 0.3, radius * 0.6);
      g.endFill();
      return;
    }
    if (primitive.kind === 'forge') {
      beginFill(g, primitive.base || '#5b3b2d');
      drawRoundedRect(g, baseX + size * 0.1, baseY + size * 0.25, size * 0.8, size * 0.65, radius);
      g.endFill();
      beginFill(g, primitive.roof || '#343a40');
      drawRoundedRect(g, baseX + size * 0.2, baseY + size * 0.15, size * 0.6, size * 0.18, radius * 0.7);
      g.endFill();
      beginFill(g, primitive.metal || '#c0c7cf');
      drawRoundedRect(g, baseX + size * 0.28, baseY + size * 0.45, size * 0.44, size * 0.28, radius * 0.6);
      g.endFill();
      return;
    }
    beginFill(g, primitive.base || '#2f3a4a');
    drawRoundedRect(g, baseX + size * 0.1, baseY + size * 0.2, size * 0.8, size * 0.65, radius);
    g.endFill();
    beginFill(g, primitive.accent || '#59687a');
    drawRoundedRect(g, baseX + size * 0.22, baseY + size * 0.35, size * 0.56, size * 0.2, radius * 0.6);
    g.endFill();
    beginFill(g, primitive.marker || '#ff6b6b');
    drawRoundedRect(g, baseX + size * 0.2, baseY + size * 0.12, size * 0.6, size * 0.12, radius * 0.4);
    g.endFill();
  }

  function renderBuildingSprite(def, centerX, centerY, size, activeBuildingIds) {
    const texture = getTexture(def && def.assetUrl);
    if (!texture) return false;
    let sprite = buildingSprites.get(def.id);
    if (!sprite) {
      sprite = new PIXI.Sprite(texture);
      buildingSprites.set(def.id, sprite);
      buildingSpriteLayer.addChild(sprite);
    } else if (sprite.texture !== texture) {
      sprite.texture = texture;
    }
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    let width = (Number.isFinite(def.widthPx) ? def.widthPx : size) * sizeScale;
    let height = (Number.isFinite(def.heightPx) ? def.heightPx : size) * sizeScale;
    if (isCampfireBuilding(def) && texture.width && texture.height) {
      const fit = Math.min(width / texture.width, height / texture.height);
      width = texture.width * fit;
      height = texture.height * fit;
    }
    if (isCampfireBuilding(def)) {
      width *= CAMPFIRE_DISPLAY_SCALE;
      height *= CAMPFIRE_DISPLAY_SCALE;
    }
    sprite.visible = true;
    sprite.anchor.set(0.5, Number.isFinite(def.assetAnchorY) ? def.assetAnchorY : 0.76);
    sprite.x = centerX;
    sprite.y = centerY;
    sprite.width = width;
    sprite.height = height;
    sprite.zIndex = centerY;
    activeBuildingIds.add(def.id);
    return true;
  }

  function isCampfireBuilding(def) {
    return def && def.primitive && def.primitive.kind === 'campfire';
  }

  function drawCampfireGlow(centerX, centerY, size, now, def) {
    const primitive = def.primitive || {};
    const t = now / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(t * 8.3);
    const flutter = 0.5 + 0.5 * Math.sin(t * 13.7 + 1.4);
    const jitterX = Math.sin(t * 17.1) * size * 0.012;
    const jitterY = Math.cos(t * 11.9) * size * 0.01;
    const radius = 0.95 + pulse * 0.08 + flutter * 0.045;
    const alpha = 0.16 + pulse * 0.055 + flutter * 0.035;
    const x = centerX + jitterX;
    const y = centerY + size * 0.08 + jitterY;

    beginFill(buildingGlowGraphics, primitive.glow || `rgba(255,180,90,${alpha})`, '#ffb45a');
    buildingGlowGraphics.drawEllipse(x, y, size * 0.68 * radius, size * 0.38 * radius);
    buildingGlowGraphics.endFill();

    beginFill(buildingGlowGraphics, `rgba(255,220,120,${alpha * 0.75})`, '#ffdc78');
    buildingGlowGraphics.drawEllipse(x + size * 0.04 * Math.sin(t * 9.7), y - size * 0.015, size * 0.46 * radius, size * 0.24 * radius);
    buildingGlowGraphics.endFill();

    beginFill(buildingGlowGraphics, `rgba(255,132,42,${alpha * 0.45})`, '#ff842a');
    buildingGlowGraphics.drawEllipse(x - size * 0.06 * Math.cos(t * 12.3), y + size * 0.035, size * 0.78 * (1.04 - flutter * 0.06), size * 0.18 * radius);
    buildingGlowGraphics.endFill();
  }

  function renderBuildings(now = performance.now()) {
    buildingsGraphics.clear();
    buildingGlowGraphics.clear();
    const cell = getWorldCellPx();
    const activeBuildingIds = new Set();
    const clearBuildingSprites = () => {
      buildingSprites.forEach((sprite, id) => {
        buildingSpriteLayer.removeChild(sprite);
        buildingSprites.delete(id);
      });
    };
    if (!cell || !buildingLayout.length) {
      clearBuildingSprites();
      return;
    }
    const buildingCellPx = getBuildingCellPx();
    const virtualCellPx = getVirtualCellPx();
    const user = getUserState();
    const anchorSpot = getBuildingAnchorSpot(buildingLayout);
    if (!anchorSpot) {
      clearBuildingSprites();
      return;
    }
    const ordered = buildingLayout.map((spot) => {
      if (spot.id === 'campfire') return { spot, def: getCampfireDef(user) };
      return { spot, def: buildingById.get(spot.id) };
    }).filter((entry) => entry.def).sort((a, b) => a.spot.y - b.spot.y);
    const anchorX = (anchorSpot.x + 0.5) * cell;
    const anchorY = (anchorSpot.y + 0.5) * cell;
    ordered.forEach(({ spot, def }) => {
      const unlocked = def.defaultUnlocked || user.unlockedResources[def.id];
      if (!unlocked) return;
      const radius = Number.isFinite(def.colliderRadius) ? Math.max(1, def.colliderRadius) : 2;
      const size = buildingCellPx * 0.82 * (radius * 2 + 1);
      const centerX = anchorX + (spot.x - anchorSpot.x) * virtualCellPx;
      const centerY = anchorY + (spot.y - anchorSpot.y) * virtualCellPx;
      const visualSize = isCampfireBuilding(def) ? size * CAMPFIRE_DISPLAY_SCALE : size;
      if (isCampfireBuilding(def)) drawCampfireGlow(centerX, centerY, visualSize, now, def);
      if (!renderBuildingSprite(def, centerX, centerY, size, activeBuildingIds)) {
        drawBuildingPrimitive(buildingsGraphics, def, centerX, centerY, visualSize);
      }
    });
    buildingSprites.forEach((sprite, id) => {
      if (activeBuildingIds.has(id)) return;
      buildingSpriteLayer.removeChild(sprite);
      buildingSprites.delete(id);
    });
  }

  const controllerState = {
    joyActive: false,
    joyCtr: { x: 0, y: 0 },
    joyVec: { x: 0, y: 0 },
    vxPct: 0,
    vyPct: 0,
    isMoving: false,
  };
  let pointerId = null;
  let joyR = 0;
  const JOY_R_PCT = 8;
  const SPEED_PCT = 0.4;
  const SPEED_SCALE = 1;
  const BASE_FRAME_MS = 1000 / 60;

  function saveController() {
    localStorage.setItem('controller', JSON.stringify(controllerState));
  }

  function getPointerPos(event) {
    const rect = app.view.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function isUiOpen() {
    return Boolean(boatCutscene || document.querySelector('.panel-overlay.open,.shop-panel.open,.idle-panel.open,.finding-overlay.open'));
  }

  function onPointerDown(event) {
    if (pointerId !== null || isUiOpen()) return;
    const pos = getPointerPos(event);
    if (activateAvailableLandScenarioAt(pos.x, pos.y)) {
      event.preventDefault();
      return;
    }
    pointerId = event.pointerId;
    app.view.setPointerCapture(pointerId);
    controllerState.joyActive = true;
    controllerState.joyCtr = pos;
    controllerState.joyVec = { x: 0, y: 0 };
    controllerState.vxPct = 0;
    controllerState.vyPct = 0;
    saveController();
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!controllerState.joyActive || event.pointerId !== pointerId) return;
    const pos = getPointerPos(event);
    const dx = pos.x - controllerState.joyCtr.x;
    const dy = pos.y - controllerState.joyCtr.y;
    const dist = Math.hypot(dx, dy);
    const max = joyR * 0.6;
    const c = dist > max ? max / dist : 1;
    controllerState.joyVec = { x: dx * c, y: dy * c };
    if (dist > 1e-3) {
      const k = SPEED_PCT / dist;
      controllerState.vxPct = dx * k;
      controllerState.vyPct = dy * k;
    } else {
      controllerState.vxPct = 0;
      controllerState.vyPct = 0;
    }
    saveController();
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (pointerId !== null && event.pointerId !== pointerId) return;
    if (pointerId !== null) app.view.releasePointerCapture(pointerId);
    pointerId = null;
    controllerState.joyActive = false;
    controllerState.joyVec = { x: 0, y: 0 };
    controllerState.vxPct = 0;
    controllerState.vyPct = 0;
    controllerState.isMoving = false;
    saveController();
  }

  app.view.addEventListener('pointerdown', onPointerDown, { passive: false });
  app.view.addEventListener('pointermove', onPointerMove, { passive: false });
  app.view.addEventListener('pointerup', onPointerUp);
  app.view.addEventListener('pointercancel', onPointerUp);
  saveController();

  function renderJoystick() {
    joystickGraphics.clear();
    if (!controllerState.joyActive) return;
    joystickGraphics.beginFill(0x999999, 0.25);
    joystickGraphics.drawCircle(controllerState.joyCtr.x, controllerState.joyCtr.y, joyR);
    joystickGraphics.endFill();
    joystickGraphics.beginFill(0xcccccc, 1);
    joystickGraphics.drawCircle(controllerState.joyCtr.x + controllerState.joyVec.x, controllerState.joyCtr.y + controllerState.joyVec.y, joyR * 0.4);
    joystickGraphics.endFill();
  }

  function getBuildingBlockers() {
    return getActiveBuildingCells(0, true);
  }

  function isCellFree(gx, gy, blockers, resourceBlockers, scenarioBlockers) {
    if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) return false;
    if (!map[gy] || !map[gy][gx]) return false;
    if (blockers.has(cellKey(gx, gy))) return false;
    if (resourceBlockers.has(cellKey(gx, gy))) return false;
    if (scenarioBlockers.has(cellKey(gx, gy))) return false;
    return true;
  }

  function findNearestFreeCell(gx, gy, blockers, resourceBlockers, scenarioBlockers, maxR = 6) {
    if (isCellFree(gx, gy, blockers, resourceBlockers, scenarioBlockers)) return { gx, gy };
    for (let r = 1; r <= maxR; r += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = gx + dx;
          const ny = gy + dy;
          if (isCellFree(nx, ny, blockers, resourceBlockers, scenarioBlockers)) return { gx: nx, gy: ny };
        }
      }
    }
    return null;
  }

  function snapHeroToCell(cell) {
    if (!cell) return;
    charXPct = ((cell.gx + 0.5) / GRID_W) * 100;
    charYPct = ((cell.gy + 0.5) / GRID_W) * 100;
  }

  function applyHeroTeleport() {
    const raw = localStorage.getItem('heroTeleport');
    if (!raw) return;
    let teleport = null;
    try {
      teleport = JSON.parse(raw);
    } catch (err) {
      teleport = null;
    }
    if (teleport && typeof teleport.xPct === 'number' && typeof teleport.yPct === 'number') {
      charXPct = teleport.xPct;
      charYPct = teleport.yPct;
    }
    localStorage.removeItem('heroTeleport');
  }

  function updateCameraToHero() {
    const cell = getWorldCellPx();
    const worldW = cell && GRID_W ? cell * GRID_W : gameWidth;
    const heroX = (charXPct * worldW) / 100;
    const heroY = (charYPct * worldW) / 100;
    camera = { x: heroX - gameWidth / 2, y: heroY - gameHeight / 2 };
    localStorage.setItem('camera', JSON.stringify(camera));
  }

  function updateHeroLogic(dtMs) {
    if (boatCutscene) {
      controllerState.isMoving = false;
      localStorage.setItem('heroState', JSON.stringify({ charXPct, charYPct, facing, isMoving: false }));
      updateCameraToHero();
      return;
    }
    applyHeroTeleport();
    const frameScale = dtMs / BASE_FRAME_MS;
    const vx = (controllerState.vxPct || 0) * SPEED_SCALE * frameScale;
    const vy = (controllerState.vyPct || 0) * SPEED_SCALE * frameScale;
    const isMoving = Math.abs(vx) + Math.abs(vy) > 0.001;
    controllerState.isMoving = isMoving;
    const cell = getWorldCellPx();
    const blockers = getBuildingBlockers();
    const resourceBlockers = resourceColliderCells;
    const scenarioBlockers = getScenarioBlockers();
    let blockedX = false;
    let blockedY = false;
    let movedX = false;
    let movedY = false;
    if (vx) {
      const nx = charXPct + vx;
      const gx = Math.floor(pct2px(nx) / cell);
      const gy = Math.floor(pct2px(charYPct) / cell);
      if (isCellFree(gx, gy, blockers, resourceBlockers, scenarioBlockers)) {
        charXPct = nx;
        movedX = true;
      } else {
        blockedX = true;
      }
    }
    if (vy) {
      const ny = charYPct + vy;
      const gx = Math.floor(pct2px(charXPct) / cell);
      const gy = Math.floor(pct2px(ny) / cell);
      if (isCellFree(gx, gy, blockers, resourceBlockers, scenarioBlockers)) {
        charYPct = ny;
        movedY = true;
      } else {
        blockedY = true;
      }
    }
    if (blockedX && !movedY && Math.abs(vy) > 0.001) {
      const slideY = charYPct + vy;
      const gx = Math.floor(pct2px(charXPct) / cell);
      const gy = Math.floor(pct2px(slideY) / cell);
      if (isCellFree(gx, gy, blockers, resourceBlockers, scenarioBlockers)) {
        charYPct = slideY;
        movedY = true;
      }
    }
    if (blockedY && !movedX && Math.abs(vx) > 0.001) {
      const slideX = charXPct + vx;
      const gx = Math.floor(pct2px(slideX) / cell);
      const gy = Math.floor(pct2px(charYPct) / cell);
      if (isCellFree(gx, gy, blockers, resourceBlockers, scenarioBlockers)) {
        charXPct = slideX;
        movedX = true;
      }
    }
    if (Math.abs(vx) > 0.001) facing = vx > 0 ? 1 : -1;
    const heroCell = getHeroGridPosition();
    if (heroCell && !isCellFree(heroCell.gridX, heroCell.gridY, blockers, resourceBlockers, scenarioBlockers)) {
      const safeCell = findNearestFreeCell(heroCell.gridX, heroCell.gridY, blockers, resourceBlockers, scenarioBlockers);
      if (safeCell) snapHeroToCell(safeCell);
    }
    localStorage.setItem('heroState', JSON.stringify({ charXPct, charYPct, facing, isMoving }));
    updateCameraToHero();
  }

  const heroParts = {};
  const heroContainer = new PIXI.Container();
  heroContainer.zIndex = 0;
  resourceSpriteLayer.addChild(heroContainer);
  let heroPhase = 0;
  let lastHeroAnimT = performance.now();
  let blinkTimer = 0;
  let nextBlink = 500 + Math.random() * 500;
  let chopActive = false;
  let chopT0 = 0;
  let lastChopAt = 0;
  let dialogueBubble = null;

  function makeHeroSprite(name, flipped = false) {
    const sprite = new PIXI.Sprite(getTexture(`./img/hero/${name}.png`) || PIXI.Texture.WHITE);
    sprite.anchor.set(0.5);
    if (flipped) sprite.scale.x = -1;
    heroContainer.addChild(sprite);
    return sprite;
  }

  function initHeroSprites() {
    heroParts.armBack = makeHeroSprite('arm1');
    heroParts.shadow = makeHeroSprite('shadow');
    heroParts.legBack = makeHeroSprite('leg1');
    heroParts.backpack = makeHeroSprite('backpack', true);
    heroParts.legFront = makeHeroSprite('leg2');
    heroParts.pants = makeHeroSprite('pants');
    heroParts.body = makeHeroSprite('body');
    heroParts.head = makeHeroSprite('head', true);
    heroParts.eyes = makeHeroSprite('eyes', true);
    heroParts.cap = makeHeroSprite('cap', true);
    heroParts.axe = makeHeroSprite('axe', true);
    heroParts.armFront = makeHeroSprite('arm2');
  }

  function updateSprite(sprite, x, y, rotation = 0) {
    if (!sprite) return;
    sprite.x = x;
    sprite.y = y;
    sprite.rotation = rotation;
  }

  function renderHero(now, dtMs) {
    heroContainer.visible = !boatCutscene;
    if (boatCutscene) {
      if (dialogueBubble) {
        heroLayer.removeChild(dialogueBubble);
        dialogueBubble.destroy({ children: true });
        dialogueBubble = null;
      }
      return;
    }
    const cell = getWorldCellPx();
    if (!cell) return;
    const baseGridW = getBaseGridW();
    const heroCellScale = baseGridW ? HERO_CHAR_R_PCT * baseGridW / 100 : 1.5;
    const charR = cell * heroCellScale;
    const footOffset = cell ? (38 / BASE_CELL_PX) * cell : 38;
    const headTexture = heroParts.head && heroParts.head.texture;
    const headHeight = headTexture && headTexture.height ? headTexture.height : 100;
    const S = ((charR * 2) / headHeight) * HERO_SCALE;

    const isMoving = controllerState.isMoving;
    const dt = dtMs / 1000;
    heroPhase += dt * (isMoving ? WALK_FREQ : IDLE_FREQ);
    if (heroPhase > Math.PI * 2) heroPhase -= Math.PI * 2;
    if (blinkTimer > 0) blinkTimer -= dtMs;
    else {
      nextBlink -= dtMs;
      if (nextBlink <= 0) {
        blinkTimer = BLINK_DUR;
        nextBlink = 2000 + Math.random() * 4000;
      }
    }

    const action = safeJson('heroAction', null);
    if (action && action.chopAt && action.chopAt !== lastChopAt) {
      lastChopAt = action.chopAt;
      if (!chopActive) {
        chopActive = true;
        chopT0 = now;
      }
    }
    let chopBlend = 0;
    if (chopActive) {
      chopBlend = (now - chopT0) / CHOP_DUR;
      if (chopBlend >= 1) {
        chopActive = false;
        chopBlend = 0;
      } else {
        chopBlend = easeInOutQuad(chopBlend);
      }
    }

    const legSwing = isMoving ? Math.sin(heroPhase) * charR * 0.3 : 0;
    const armSwing = isMoving ? Math.sin(heroPhase) * charR * 0.25 : 0;
    const bounce = (isMoving ? 0.1 : 0.04) * charR * Math.abs(Math.sin(heroPhase));
    heroContainer.x = pct2px(charXPct);
    heroContainer.y = pct2px(charYPct) - footOffset + cell / 2 - 8;
    heroContainer.zIndex = pct2px(charYPct) + cell * 0.45;
    heroContainer.scale.set(facing * S, S);

    updateSprite(heroParts.armBack, HERO_OFFSETS.armBack.x * charR, HERO_OFFSETS.armBack.y * charR - bounce, ((-20 + armSwing * 45 / charR) * Math.PI / 180) / 2);
    updateSprite(heroParts.shadow, HERO_OFFSETS.shadow.x * charR, HERO_OFFSETS.shadow.y * charR);
    updateSprite(heroParts.legBack, HERO_OFFSETS.legBack.x * charR - legSwing / 2, HERO_OFFSETS.legBack.y * charR);
    updateSprite(heroParts.backpack, HERO_OFFSETS.backpack.x * charR, HERO_OFFSETS.backpack.y * charR - bounce * 1.3);
    updateSprite(heroParts.legFront, HERO_OFFSETS.legFront.x * charR + legSwing / 2, HERO_OFFSETS.legFront.y * charR);
    updateSprite(heroParts.pants, HERO_OFFSETS.pants.x * charR, HERO_OFFSETS.pants.y * charR - bounce * 0.2);
    updateSprite(heroParts.body, HERO_OFFSETS.body.x * charR, HERO_OFFSETS.body.y * charR - bounce);
    updateSprite(heroParts.head, HERO_OFFSETS.head.x * charR, HERO_OFFSETS.head.y * charR - bounce);
    updateSprite(heroParts.eyes, HERO_OFFSETS.eyes.x * charR, HERO_OFFSETS.eyes.y * charR - bounce);
    heroParts.eyes.visible = blinkTimer <= 0;
    updateSprite(heroParts.cap, HERO_OFFSETS.cap.x * charR, HERO_OFFSETS.cap.y * charR - bounce * 1.4);

    let frontArmRotation = ((15 + armSwing * 55 / charR) * Math.PI / 180) / 2;
    if (chopBlend > 0) {
      const liftPhase = 0.6;
      if (chopBlend <= liftPhase) {
        frontArmRotation += -Math.PI * 0.35 * easeOutQuad(chopBlend / liftPhase);
      } else {
        frontArmRotation += -Math.PI * 0.35 - Math.PI * 0.85 * easeInCubic((chopBlend - liftPhase) / (1 - liftPhase));
      }
    }
    updateSprite(heroParts.armFront, HERO_OFFSETS.armFront.x * charR, HERO_OFFSETS.armFront.y * charR - bounce, frontArmRotation);
    updateSprite(heroParts.axe, (HERO_OFFSETS.armFront.x + 0.32) * charR, (HERO_OFFSETS.armFront.y + 0.08) * charR - bounce, frontArmRotation - 0.1);

    renderDialogueBubble(cell);
  }

  function renderDialogueBubble(cell) {
    pruneDialogueText();
    const text = localStorage.getItem(DIALOGUE_TEXT_KEY) || '';
    if (dialogueBubble) {
      heroLayer.removeChild(dialogueBubble);
      dialogueBubble.destroy({ children: true });
      dialogueBubble = null;
    }
    if (!text) return;
    const container = new PIXI.Container();
    const g = new PIXI.Graphics();
    const maxWidth = Math.min(gameWidth * 0.7, 280);
    const words = text.split(' ');
    const style = new PIXI.TextStyle({
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: 14,
      fill: 0x1f1f1f,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: maxWidth - 24,
    });
    const label = new PIXI.Text(words.join(' '), style);
    label.anchor.set(0.5);
    const bubbleWidth = Math.min(maxWidth, Math.max(80, label.width + 24));
    const bubbleHeight = Math.max(42, label.height + 24);
    g.beginFill(0xffffff, 0.95);
    g.lineStyle(1, 0x000000, 0.2);
    g.drawRoundedRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth, bubbleHeight, 12);
    g.drawPolygon([-8, 0, 8, 0, 0, 10]);
    g.endFill();
    label.x = 0;
    label.y = -bubbleHeight / 2;
    container.addChild(g, label);
    container.x = pct2px(charXPct);
    container.y = pct2px(charYPct) - cell * 3.2;
    dialogueBubble = container;
    heroLayer.addChild(dialogueBubble);
  }

  const sharks = [];

  function distPointRect(px, py, rx, ry, rw, rh) {
    const dx = Math.max(rx - px, 0, px - (rx + rw));
    const dy = Math.max(ry - py, 0, py - (ry + rh));
    return Math.hypot(dx, dy);
  }

  function getIslandBBoxPct() {
    if (!GRID_W || !GRID_H) return null;
    let minGX = Infinity;
    let minGY = Infinity;
    let maxGX = -Infinity;
    let maxGY = -Infinity;
    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        if (!map[y] || !map[y][x]) continue;
        minGX = Math.min(minGX, x);
        minGY = Math.min(minGY, y);
        maxGX = Math.max(maxGX, x + 1);
        maxGY = Math.max(maxGY, y + 1);
      }
    }
    if (!Number.isFinite(minGX)) return null;
    return { xPct: (minGX / GRID_W) * 100, yPct: (minGY / GRID_W) * 100, wPct: ((maxGX - minGX) / GRID_W) * 100, hPct: ((maxGY - minGY) / GRID_W) * 100 };
  }

  function isLandAtPct(xPct, yPct) {
    if (!GRID_W || !GRID_H) return false;
    const gx = Math.floor((xPct / 100) * GRID_W);
    const gy = Math.floor((yPct / H_PCT) * GRID_H);
    if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return false;
    return Boolean(map[gy] && map[gy][gx]);
  }

  function getScenarioObjectCells() {
    return scenarioState.map((state) => ({ x: state.gridX, y: state.gridY }));
  }

  function isNearScenario(xPct, yPct, scenarioCells, safeDist) {
    if (!scenarioCells.length) return false;
    for (let i = 0; i < scenarioCells.length; i += 1) {
      const c = scenarioCells[i];
      const cx = (c.x + 0.5) * cellPct;
      const cy = (c.y + 0.5) * cellPct;
      if (Math.hypot(xPct - cx, yPct - cy) < safeDist) return true;
    }
    return false;
  }

  function randomWaterBurstDelay() {
    return rnd(WATER_BURST_MIN_DELAY_MS, WATER_BURST_MAX_DELAY_MS);
  }

  function screenToWorldPct(screenX, screenY) {
    const worldW = Math.max(1, getWorldWidth());
    return {
      xPct: ((camera.x + screenX) / worldW) * 100,
      yPct: ((camera.y + screenY) / worldW) * 100,
    };
  }

  function isOpenWaterAtPct(xPct, yPct) {
    if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > H_PCT) return false;
    const margin = Math.max(cellPct * 0.42, 0.9);
    const samples = [
      [0, 0],
      [-margin, 0],
      [margin, 0],
      [0, -margin * 0.75],
      [0, margin * 0.75],
    ];
    return samples.every(([dx, dy]) => {
      const sx = xPct + dx;
      const sy = yPct + dy;
      return sx >= 0 && sx <= 100 && sy >= 0 && sy <= H_PCT && !isLandAtPct(sx, sy);
    });
  }

  function findWaterBurstSpot() {
    for (let i = 0; i < 28; i += 1) {
      const spot = screenToWorldPct(rnd(gameWidth * 0.08, gameWidth * 0.92), rnd(gameHeight * 0.08, gameHeight * 0.84));
      if (isOpenWaterAtPct(spot.xPct, spot.yPct)) return spot;
    }
    for (let i = 0; i < 24; i += 1) {
      const spot = { xPct: rnd(3, 97), yPct: rnd(3, Math.max(3, H_PCT - 3)) };
      if (isOpenWaterAtPct(spot.xPct, spot.yPct)) return spot;
    }
    return null;
  }

  function spawnWaterBurst(now) {
    if (waterBursts.length >= WATER_BURST_MAX_ACTIVE) return;
    const texture = getTexture(WATER_BURST_ASSET);
    if (!texture) return;
    const spot = findWaterBurstSpot();
    if (!spot) return;

    const sprite = new PIXI.Sprite(texture);
    const tw = Math.max(1, texture.width || 192);
    const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
    const baseWidth = rnd(38, 70) * sizeScale;
    const baseScale = baseWidth / tw;
    const yScale = baseScale * rnd(0.82, 1.06);
    sprite.anchor.set(0.5);
    sprite.alpha = 0;
    sprite.x = pct2px(spot.xPct);
    sprite.y = pct2px(spot.yPct);
    sprite.rotation = rnd(-0.35, 0.35);
    sprite.scale.set(baseScale, yScale);
    sprite.tint = 0xe9fbff;
    waterFxLayer.addChild(sprite);
    waterBursts.push({
      sprite,
      xPct: spot.xPct,
      yPct: spot.yPct,
      startedAt: now,
      lifeMs: WATER_BURST_LIFE_MS * rnd(0.82, 1.18),
      scaleX: baseScale,
      scaleY: yScale,
      rotation: sprite.rotation,
      spin: rnd(-0.08, 0.08),
    });
  }

  function updateWaterBursts(now, deltaMS) {
    nextWaterBurstDelay -= deltaMS;
    if (nextWaterBurstDelay <= 0) {
      spawnWaterBurst(now);
      nextWaterBurstDelay = randomWaterBurstDelay();
    }

    for (let i = waterBursts.length - 1; i >= 0; i -= 1) {
      const burst = waterBursts[i];
      const t = (now - burst.startedAt) / burst.lifeMs;
      if (t >= 1) {
        waterFxLayer.removeChild(burst.sprite);
        burst.sprite.destroy();
        waterBursts.splice(i, 1);
        continue;
      }
      const appear = clamp(t / 0.18, 0, 1);
      const fade = clamp((1 - t) / 0.55, 0, 1);
      const alpha = 0.34 * easeOutQuad(appear) * easeOutQuad(fade);
      const grow = 0.76 + easeOutQuad(t) * 0.46;
      burst.sprite.x = pct2px(burst.xPct);
      burst.sprite.y = pct2px(burst.yPct);
      burst.sprite.alpha = alpha;
      burst.sprite.rotation = burst.rotation + burst.spin * t;
      burst.sprite.scale.set(burst.scaleX * grow, burst.scaleY * (0.9 + grow * 0.1));
    }
  }

  function getAnchorPoints(bbox, expansionOffset, scenarioCells, safeDist) {
    const anchors = SHARK_ANCHOR_POINTS.map((p) => ({ xPct: p.xPct, yPct: p.yPct }));
    const cx = bbox ? bbox.xPct + bbox.wPct / 2 : 50;
    const cy = bbox ? bbox.yPct + bbox.hPct / 2 : H_PCT / 2;
    const push = Math.max(expansionOffset * 1.6, 0);
    anchors.forEach((a) => {
      let vx = a.xPct - cx;
      let vy = a.yPct - cy;
      const len = Math.hypot(vx, vy) || 1;
      vx /= len;
      vy /= len;
      a.xPct = Math.max(5, Math.min(95, a.xPct + vx * push));
      a.yPct = Math.max(5, Math.min(H_PCT - 5, a.yPct + vy * push));
      if (isNearScenario(a.xPct, a.yPct, scenarioCells, safeDist)) {
        a.xPct = Math.max(5, Math.min(95, a.xPct + vx * safeDist));
        a.yPct = Math.max(5, Math.min(H_PCT - 5, a.yPct + vy * safeDist));
      }
    });
    return anchors;
  }

  function spawnSharks() {
    sharks.length = 0;
    const bbox = getIslandBBoxPct();
    const expansionOffset = getExpansionLevel() * (GRID_W ? 100 / GRID_W : 0);
    const scenarioCells = getScenarioObjectCells();
    const safeDist = Math.max((GRID_W ? 100 / GRID_W : 0) * SHARK_SCENARIO_SAFE_CELLS, 0.5);
    const anchors = getAnchorPoints(bbox, expansionOffset, scenarioCells, safeDist);
    for (let i = 0; i < SHARK_N; i += 1) {
      let tries = 0;
      let sx = 0;
      let sy = 0;
      let ok = false;
      const anchor = anchors[i % Math.max(1, anchors.length)];
      while (tries < 200 && !ok) {
        tries += 1;
        sx = anchor ? anchor.xPct + rnd(-SHARK_WANDER_R, SHARK_WANDER_R) : rnd(SHARK_WANDER_R, 100 - SHARK_WANDER_R);
        sy = anchor ? anchor.yPct + rnd(-SHARK_WANDER_R, SHARK_WANDER_R) : rnd(SHARK_WANDER_R, H_PCT - SHARK_WANDER_R);
        sx = Math.max(SHARK_WANDER_R, Math.min(100 - SHARK_WANDER_R, sx));
        sy = Math.max(SHARK_WANDER_R, Math.min(H_PCT - SHARK_WANDER_R, sy));
        ok = true;
        if (bbox && distPointRect(sx, sy, bbox.xPct, bbox.yPct, bbox.wPct, bbox.hPct) < SHARK_SAFE_FACTOR * SHARK_WANDER_R + expansionOffset) ok = false;
        if (isNearScenario(sx, sy, scenarioCells, safeDist) || isLandAtPct(sx, sy)) ok = false;
      }
      sharks.push({
        sxPct: sx,
        syPct: sy,
        R: SHARK_WANDER_R,
        angle: Math.random() * Math.PI * 2,
        angSpeed: rnd(SHARK_ANG_SPEED_MIN, SHARK_ANG_SPEED_MAX),
        phase: Math.random() * Math.PI * 2,
        anchorIndex: i % Math.max(1, anchors.length),
        xPct: sx,
        yPct: sy,
      });
    }
  }

  function updateAndRenderSharks(dt) {
    sharkGraphics.clear();
    const bbox = getIslandBBoxPct();
    const expansionOffset = getExpansionLevel() * (GRID_W ? 100 / GRID_W : 0);
    const scenarioCells = getScenarioObjectCells();
    const safeDist = Math.max((GRID_W ? 100 / GRID_W : 0) * SHARK_SCENARIO_SAFE_CELLS, 0.5);
    const anchors = getAnchorPoints(bbox, expansionOffset, scenarioCells, safeDist);
    const finTexture = getTexture('./img/sea/shark-fin.png');
    const activeSharks = new Set();
    sharks.forEach((s, index) => {
      const prevXPct = Number.isFinite(s.xPct) ? s.xPct : s.sxPct;
      const anchor = anchors[s.anchorIndex % Math.max(1, anchors.length)];
      if (anchor) {
        s.sxPct += (anchor.xPct - s.sxPct) * SHARK_ANCHOR_PULL * dt;
        s.syPct += (anchor.yPct - s.syPct) * SHARK_ANCHOR_PULL * dt;
      }
      s.angle += s.angSpeed * dt;
      s.xPct = Math.max(0, Math.min(100, s.sxPct + Math.cos(s.angle) * s.R));
      s.yPct = Math.max(0, Math.min(H_PCT, s.syPct + Math.sin(s.angle * 1.25 + s.phase) * (s.R * 0.65)));
      if (bbox) {
        const d = distPointRect(s.xPct, s.yPct, bbox.xPct, bbox.yPct, bbox.wPct, bbox.hPct);
        const minD = SHARK_SAFE_FACTOR * s.R * 0.98 + expansionOffset;
        if (d < minD) {
          const cx = bbox.xPct + bbox.wPct / 2;
          const cy = bbox.yPct + bbox.hPct / 2;
          let vx = s.xPct - cx;
          let vy = s.yPct - cy;
          const len = Math.hypot(vx, vy) || 1;
          vx /= len;
          vy /= len;
          s.xPct += vx * (minD - d);
          s.yPct += vy * (minD - d);
        }
      }
      const vxPct = s.xPct - prevXPct;
      if (Math.abs(vxPct) > 0.002) s.flip = vxPct > 0 ? -1 : 1;
      const x = pct2px(s.xPct);
      const y = pct2px(s.yPct);
      sharkGraphics.beginFill(0xffffff, 0.5);
      sharkGraphics.drawEllipse(x, y + 4, 16, 6);
      sharkGraphics.endFill();
      const flip = s.flip || 1;
      if (finTexture) {
        let sprite = sharkSprites[index];
        if (!sprite) {
          sprite = new PIXI.Sprite(finTexture);
          sprite.anchor.set(0.5, 0.78);
          sharkSprites[index] = sprite;
          sharkSpriteLayer.addChild(sprite);
        }
        const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
        sprite.visible = true;
        sprite.x = x;
        sprite.y = y + 3;
        sprite.scale.set((42 * sizeScale / Math.max(1, finTexture.width)) * flip, 30 * sizeScale / Math.max(1, finTexture.height));
        activeSharks.add(index);
      } else {
        sharkGraphics.beginFill(0x0a2a66, 1);
        sharkGraphics.drawPolygon([x - 10 * flip, y + 6, x, y - 16, x + 10 * flip, y + 6]);
        sharkGraphics.endFill();
      }
    });
    sharkSprites.forEach((sprite, index) => {
      if (activeSharks.has(index)) return;
      sprite.visible = false;
    });
  }

  function resize() {
    setGameSize();
    gameWidth = mount.clientWidth || window.innerWidth;
    gameHeight = mount.clientHeight || window.innerHeight;
    app.renderer.resolution = Math.min(window.devicePixelRatio || 1, 2);
    app.renderer.resize(gameWidth, gameHeight);
    joyR = JOY_R_PCT * gameWidth / 100;
    redrawSea();
    renderHorizon();
    redrawIsland();
    resizeClouds();
  }

  function onMapChanged() {
    loadMapData();
  }

  function init() {
    resize();
    nextWaterBurstDelay = randomWaterBurstDelay();
    initHeroSprites();
    loadMapData({ initial: true, resetHero: true });
    openedIds = loadOpenedIds();
    scenarioState = loadScenarioState();
    scenarioDrops = loadScenarioDrops();
    scenarioDrops.forEach((drop) => {
      if (Number.isFinite(drop.uid) && drop.uid >= nextBerryUid) nextBerryUid = drop.uid + 1;
    });
    persistScenarioState();
    persistScenarioDrops();
    renderHorizon();
    initClouds();
    resizeClouds();
    rebuildScenarioColliderCells();
    seedNewIslandPines();
    rebuildResourceColliderCells();
    rebuildResourceSpawnCells();
    syncDialogueText(null);
    fillOfflineResources();
    spawnSharks();
  }

  let spawnAccumulator = 0;
  function frame(deltaMS) {
    const now = performance.now();
    consumeBoatRepairRequest();
    updateBoatCutscene(now);
    updateHeroLogic(deltaMS);
    if (!boatCutscene) {
      spawnScenarioLand();
      updateDialogue(now);
      checkScenarioTriggers();
    }
    syncDialogueText(getActiveDialogueText());

    if (!boatCutscene) {
      spawnAccumulator += deltaMS;
      if (spawnAccumulator >= SPAWN_MS) {
        spawnAccumulator = 0;
        const unpicked = bushes.filter((b) => b.stage === 'growing' || b.stage === 'ripe').length;
        if (land.length && unpicked < MAX_UNPICKED_BUSHES) spawnBush(pickBerryDef());
      }
    }

    if (!boatCutscene) {
      bushes.forEach((b) => {
        if (b.stage !== 'dead') updateBush(b);
      });
      for (let i = bushes.length - 1; i >= 0; i -= 1) {
        if (bushes[i].stage !== 'dead') continue;
        unregisterResourceCollider(bushes[i]);
        unregisterResourceSpawn(bushes[i]);
        bushes.splice(i, 1);
      }
      collectLoop();
    }

    const wiggle = getWiggleOffset();
    worldRoot.x = -camera.x + wiggle.x;
    worldRoot.y = -camera.y + wiggle.y;
    updateClouds(now, deltaMS);
    updateWaterBursts(now, deltaMS);
    updateAndRenderSharks(deltaMS);
    renderScenarioObjects(now);
    renderBuildings(now);
    renderResources(now);
    renderHero(now, deltaMS || (now - lastHeroAnimT));
    lastHeroAnimT = now;
    renderTransition(now);
    renderJoystick();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('storage', (event) => {
    if (event.key === 'map' || event.key === SCENARIO_OPENED_KEY) onMapChanged();
  });
  window.addEventListener('vibe-found-item-complete', (event) => completeScenarioFoundItem(event.detail || {}));
  window.addEventListener('vibe-map-changed', onMapChanged);
  window.addEventListener('vibe-boat-repair', consumeBoatRepairRequest);
  window.addEventListener('beforeunload', markResourceSeen);
  window.addEventListener('pagehide', markResourceSeen);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') markResourceSeen();
  });

  init();
  app.ticker.add((delta) => {
    frame(app.ticker.deltaMS || delta * 16.6667);
  });
})();
