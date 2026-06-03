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
  const SCENARIO_COLLIDER_CELLS_KEY = 'scenarioColliderCells';
  const SCENARIO_COLLIDER_UPDATED_KEY = 'scenarioColliderUpdatedAt';
  const DIALOGUE_TEXT_KEY = 'scenarioDialogueText';
  const DIALOGUE_TEXT_AT_KEY = 'scenarioDialogueTextAt';
  const DIALOGUE_TEXT_TTL_MS = 15000;

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
  ];

  const BERRY_IMAGE_ASSETS = [
    './img/berry/strawberry.png',
    './img/berry/blueberry.png',
    './img/berry/raspberry.png',
    './img/berry/tomato.png',
    './img/berry/champignon.png',
    './img/berry/strawberry-bush.png',
    './img/berry/blueberry-bush.png',
    './img/berry/raspberry-bush.png',
    './img/berry/tomato-bush.png',
    './img/berry/champignon-bush.png',
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
  ];

  const SCENARIO_IMAGE_ASSETS = [
    './images/scenario/wood-crate.png',
    './images/scenario/suitcase.png',
    './images/scenario/plane-wing.png',
    './images/scenario/message-bottle.png',
    './images/scenario/lighthouse-on.png',
    './images/scenario/lighthouse-off.png',
    './images/scenario/lifebuoy.png',
  ];

  const KNOWN_ASSETS = new Set([
    './img/berry/1.png',
    './img/building/campfire.png',
    './img/building/campfire2.png',
    './img/island_shadow.png',
    './img/tiles/1.png',
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
  const worldRoot = new PIXI.Container();
  worldRoot.sortableChildren = true;
  worldRoot.zIndex = 1;
  const screenLayer = new PIXI.Container();
  screenLayer.zIndex = 2;
  app.stage.addChild(seaGraphics, worldRoot, screenLayer);

  const sharkGraphics = new PIXI.Graphics();
  sharkGraphics.zIndex = 1;
  const sharkSpriteLayer = new PIXI.Container();
  sharkSpriteLayer.zIndex = 1.5;
  const islandLayer = new PIXI.Container();
  islandLayer.zIndex = 2;
  const scenarioSpriteLayer = new PIXI.Container();
  scenarioSpriteLayer.zIndex = 3;
  const scenarioGraphics = new PIXI.Graphics();
  scenarioGraphics.zIndex = 4;
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
  worldRoot.addChild(
    sharkGraphics,
    sharkSpriteLayer,
    islandLayer,
    scenarioSpriteLayer,
    scenarioGraphics,
    buildingGlowGraphics,
    buildingsGraphics,
    buildingSpriteLayer,
    resourceShadowGraphics,
    resourceSpriteLayer,
    resourceGraphics,
    heroLayer
  );

  const joystickGraphics = new PIXI.Graphics();
  joystickGraphics.zIndex = 10;
  screenLayer.addChild(joystickGraphics);

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
  let camera = { x: 0, y: 0 };
  let BUSH_DENSITY = 0.05;
  let MAX_UNPICKED_BUSHES = 1;

  const buildingDefs = buildingsConfig.buildings || [];
  const buildingById = new Map(buildingDefs.map((item) => [item.id, item]));
  const scenarioObjects = Array.isArray(scenarioConfig.objects) ? scenarioConfig.objects : [];
  const scenarioById = new Map(scenarioObjects.map((obj) => [obj.id, obj]));
  const BERRIES_LIST = Array.isArray(berriesConfig.berries) ? berriesConfig.berries : [];
  const getResourceWeight = typeof berriesConfig.getResourceWeight === 'function'
    ? berriesConfig.getResourceWeight
    : () => 1;

  const textureCache = new Map();
  function getTexture(url) {
    if (!url || !KNOWN_ASSETS.has(url)) return null;
    if (!textureCache.has(url)) textureCache.set(url, PIXI.Texture.from(url));
    return textureCache.get(url);
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
    dead: { color: '#6f684a', edge: '#514b38', soil: '#5b4430' },
    snow: { color: '#dff4ff', edge: '#a9d7e6', soil: '#756555' },
  };

  function getTileSurfaceType(value) {
    if (!value) return null;
    if (typeof value === 'object' && value.surfaceType) return value.surfaceType;
    return 'grass';
  }

  function getSurfaceDef(value) {
    return SURFACE_DEFS[getTileSurfaceType(value)] || SURFACE_DEFS.grass;
  }

  function getTileSurfaceColor(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.surfaceColor) return value.surfaceColor;
    return getSurfaceDef(value).color;
  }

  function getTileEdgeColor(value) {
    return getSurfaceDef(value).edge;
  }

  function getTileSoilColor(value) {
    return getSurfaceDef(value).soil;
  }

  function isCustomSurface(value) {
    const surface = getTileSurfaceColor(value);
    return surface && surface !== '#2fb84b';
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

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        if (!map[y] || !map[y][x]) continue;
        minX = Math.min(minX, x * cell);
        minY = Math.min(minY, y * cell);
        maxX = Math.max(maxX, (x + 1) * cell);
        maxY = Math.max(maxY, (y + 1) * cell);
      }
    }
    if (Number.isFinite(minX)) {
      const w = maxX - minX;
      const h = maxY - minY;
      beginFill(g, 'rgba(12,32,92,0.35)', '#0c205c');
      drawRoundedRect(g, minX - w * 0.04, minY - h * 0.045 + h * 0.015, w * 1.08, h * 1.09, Math.min(w, h) * 0.02);
      g.endFill();
    }

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

    const tileTexture = getTexture('./img/tiles/1.png');
    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        const cellValue = map[y] && map[y][x];
        if (!cellValue) continue;
        const sx = x * cell - overlap / 2;
        const sy = y * cell - overlap / 2;
        const ww = cell + overlap;
        const hh = cell + overlap;
        if (tileTexture && !isCustomSurface(cellValue)) {
          const sprite = new PIXI.Sprite(tileTexture);
          sprite.x = sx;
          sprite.y = sy;
          sprite.width = ww;
          sprite.height = hh + 10;
          islandLayer.addChild(sprite);
        } else {
          beginFill(g, getTileSurfaceColor(cellValue) || '#2fb84b', '#2fb84b');
          drawRoundedRect(g, sx, sy, ww, hh, radius);
          g.endFill();
        }
      }
    }

    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        if (!map[y] || !map[y][x]) continue;
        const sx = x * cell;
        const sy = y * cell;
        if (!map[y + 1] || !map[y + 1][x]) {
          beginFill(g, getTileEdgeColor(map[y][x]) || '#1f8a3a');
          g.drawRect(sx, sy + cell, cell, cell * 0.035);
          g.endFill();
          beginFill(g, getTileSurfaceColor(map[y][x]) || '#2fb84b');
          g.drawRect(sx, sy + cell + cell * 0.035, cell, cell * 0.03);
          g.endFill();
          beginFill(g, getTileSoilColor(map[y][x]) || '#8a5a2b');
          g.drawRect(sx, sy + cell + cell * 0.065, cell, cell * 0.12);
          g.endFill();
        }
        if (!map[y][x + 1]) {
          beginFill(g, getTileEdgeColor(map[y][x]) || '#1f8a3a');
          g.drawRect(sx + cell, sy, cell * 0.035, cell);
          g.endFill();
          beginFill(g, getTileSurfaceColor(map[y][x]) || '#2fb84b');
          g.drawRect(sx + cell + cell * 0.035, sy, cell * 0.03, cell);
          g.endFill();
          beginFill(g, getTileSoilColor(map[y][x]) || '#8a5a2b');
          g.drawRect(sx + cell + cell * 0.065, sy, cell * 0.12, cell);
          g.endFill();
        }
      }
    }
  }

  function getUserState() {
    let user = safeJson('user', {});
    if (typeof user.money !== 'number' || Number.isNaN(user.money)) user.money = 0;
    if (!user.unlockedResources || typeof user.unlockedResources !== 'object') user.unlockedResources = {};
    if (BERRIES_LIST[0]) user.unlockedResources[BERRIES_LIST[0].id] = true;
    const campfire = buildingDefs.find((item) => item.id === 'campfire');
    if (campfire) user.unlockedResources[campfire.id] = true;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  function setUserState(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  function getUnlockedResourceIds() {
    const user = getUserState();
    return Object.keys(user.unlockedResources).filter((id) => user.unlockedResources[id]);
  }

  function getResourceProfitById(id) {
    const found = BERRIES_LIST.find((entry) => entry.id === id);
    return found && typeof found.profit === 'number' ? found.profit : 1;
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
    const available = BERRIES_LIST.filter((def) => unlocked.has(def.id) && hasSurface(def));
    const surfacePool = BERRIES_LIST.filter(hasSurface);
    const pool = available.length ? available : (surfacePool.length ? surfacePool : BERRIES_LIST);
    const idx = pickWeightedIndex(pool, (i) => {
      const originalIndex = BERRIES_LIST.indexOf(pool[i]);
      return getResourceWeight(originalIndex >= 0 ? originalIndex : i);
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

  function computeInitialScenarioPositions() {
    const bounds = getIslandBoundsGrid();
    if (!bounds) return [];
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
      const distance = Number.isFinite(def.distanceCells) ? def.distanceCells : 2;
      const dir = dirMap[def.direction] || dirMap.east;
      return {
        id: def.id,
        gridX: dir.x === 0 ? centerX : (dir.x > 0 ? bounds.maxX + distance : bounds.minX - distance),
        gridY: dir.y === 0 ? centerY : (dir.y > 0 ? bounds.maxY + distance : bounds.minY - distance),
        triggered: false,
        transformed: false,
        opened: openedIds.has(def.id),
      };
    });
  }

  function loadScenarioState() {
    let stored = safeJson(SCENARIO_STATE_KEY, []);
    if (!Array.isArray(stored)) stored = [];
    const byId = new Map(stored.map((item) => [item.id, item]));
    const initial = computeInitialScenarioPositions();
    const next = [];
    scenarioObjects.forEach((def, index) => {
      const existing = byId.get(def.id) || initial[index];
      if (!existing) return;
      next.push({
        id: def.id,
        gridX: Number.isFinite(existing.gridX) ? existing.gridX : 0,
        gridY: Number.isFinite(existing.gridY) ? existing.gridY : 0,
        triggered: Boolean(existing.triggered),
        transformed: Boolean(existing.transformed),
        opened: openedIds.has(def.id) || Boolean(existing.opened),
      });
    });
    let changed = false;
    next.forEach((s) => {
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

  function spawnScenarioLand() {
    if (!map.length) return;
    const seeds = [];
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!def || state.triggered) return;
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
      if (!def || !scenarioIsOnLand(state)) return;
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
      if (state.triggered) return;
      const def = scenarioById.get(state.id);
      if (!def) return;
      const radius = getTriggerRadius(def, state);
      if (!triggerRadiusTouchesLand(state, radius)) return;
      if (!isHeroWithinTrigger(state, def)) return;
      if (!scenarioIsOnLand(state)) return;
      state.triggered = true;
      if (def.transformOnApproach) state.transformed = true;
      persistScenarioState();
      rebuildScenarioColliderCells();
      startDialogue(def.dialog || []);
    });
  }

  function getScenarioTexture(def, state) {
    const visual = state.transformed && def.transformOnApproach ? def.transformOnApproach : def;
    const fallback = visual.fallbackUrl || def.fallbackUrl || '';
    const asset = visual.assetUrl || def.assetUrl || '';
    return getTexture(asset) || getTexture(fallback);
  }

  function renderScenarioObjects(now) {
    scenarioGraphics.clear();
    const activeIds = new Set();
    scenarioState.forEach((state) => {
      const def = scenarioById.get(state.id);
      if (!def || !Number.isFinite(state.gridX) || !Number.isFinite(state.gridY)) return;
      activeIds.add(state.id);
      const x = (state.gridX + 0.5) * cellPct;
      const y = (state.gridY + 0.5) * cellPct;
      const baseX = pct2px(x);
      const baseY = pct2px(y);
      const floating = !scenarioIsOnLand(state, def.triggerRadiusCells);
      const floatOffset = floating ? Math.sin(now / 600 + state.gridX) * pct2px(cellPct * 0.15) : 0;
      const sizeScale = getWorldCellPx() > 0 ? getWorldCellPx() / BASE_CELL_PX : 1;
      const width = (Number.isFinite(def.widthPx) ? def.widthPx : 60) * sizeScale;
      const height = (Number.isFinite(def.heightPx) ? def.heightPx : 60) * sizeScale;

      beginFill(scenarioGraphics, floating ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)');
      scenarioGraphics.drawEllipse(baseX, baseY + floatOffset + height * 0.35, width * 0.35, height * 0.16);
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
        beginFill(scenarioGraphics, '#cfd8dc');
        drawRoundedRect(scenarioGraphics, baseX - width / 2, baseY + floatOffset - height / 2, width, height, Math.min(width, height) * 0.2);
        scenarioGraphics.endFill();
      }
    });
    scenarioSprites.forEach((sprite, id) => {
      if (!activeIds.has(id)) sprite.visible = false;
    });
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

  function mkLeaf(xPct, yPct) {
    const a = rnd(0, Math.PI * 2);
    const v = vec(a);
    const spd = rnd(LEAF_SPD_MIN, LEAF_SPD_MAX);
    return { xPct, yPct, vxPct: v.x * spd, vyPct: v.y * spd, rot: rnd(0, Math.PI * 2), angVel: rnd(-10, 10) * (Math.PI / 180), t0: performance.now() };
  }

  function isExtractable(def) {
    return def && def.resourceType === 'extractable';
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
        id: def.id,
        widthPx: 20,
        heightPx: 12,
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
    const spawnRadius = getSpawnRadius(berryDef);
    const extractable = isExtractable(berryDef);
    const buildingCells = getActiveBuildingCells(extractable ? RESOURCE_COLLIDER_PADDING : 0);
    const heroPos = extractable ? getHeroGridPosition() : null;
    const scenarioBlockers = getScenarioBlockers();
    for (let i = 0; i < 30; i += 1) {
      const c = land[Math.random() * land.length | 0];
      const key = cellKey(c.x, c.y);
      if (!canSpawnResourceOnCell(berryDef, c.x, c.y)) continue;
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

  function updateFlyingParticles(b, now) {
    b.berries.forEach((be) => {
      if (!be.flying) return;
      const k = outCub(clamp((now - be.tFly0) / be.flyDur, 0, 1));
      be.xPct = be.x0 + (be.tx - be.x0) * k;
      be.yPct = be.y0 + (be.ty - be.y0) * k;
      if (k >= 1) be.flying = false;
    });
  }

  function spawnExtractParticles(b, now, avoidSet) {
    const particleDef = getExtractParticleDef(b.berryDef);
    const count = Number.isFinite(b.berryDef && b.berryDef.extractParticleCount) ? b.berryDef.extractParticleCount : EXTRACT_PARTICLE_COUNT;
    for (let i = 0; i < count; i += 1) {
      const a = rnd(0, Math.PI * 2);
      const d = rnd(SCATTER_MIN_PCT, SCATTER_MAX_PCT);
      const v = vec(a);
      const to = clampToLandSafe(b.xPct + v.x * d, b.yPct + v.y * d, BERRY_R_PCT, avoidSet);
      const be = mkBerry(false, b.xPct, b.yPct, particleDef);
      Object.assign(be, { x0: b.xPct, y0: b.yPct, tx: to.xPct, ty: to.yPct, flying: true, tFly0: now, flyDur: BERRY_FLY_MS, onBush: false, scale: 1 });
      b.berries.push(be);
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
    spawnExtractParticles(b, now, avoidSet);
    const stages = getExtractStages(b.berryDef);
    b.extractStage = (typeof b.extractStage === 'number' ? b.extractStage : 0) + 1;
    if (b.extractStage >= stages.length) {
      b.stage = 'exploded';
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
        for (let i = 0; i < LEAF_COUNT; i += 1) b.leafs.push(mkLeaf(b.xPct, b.yPct));
        const avoidSet = new Set([...getActiveBuildingCells(), ...getScenarioBlockers()]);
        b.berries.forEach((be) => {
          const a = rnd(0, Math.PI * 2);
          const d = rnd(SCATTER_MIN_PCT, SCATTER_MAX_PCT);
          const v = vec(a);
          const to = clampToLandSafe(b.xPct + v.x * d, b.yPct + v.y * d, BERRY_R_PCT, avoidSet);
          Object.assign(be, { x0: be.xPct, y0: be.yPct, tx: to.xPct, ty: to.yPct, flying: true, tFly0: now, flyDur: BERRY_FLY_MS, onBush: false, scale: 1 });
        });
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
        return now - leaf.t0 < LEAF_LIFE_MS;
      });
      updateFlyingParticles(b, now);
      if (!b.leafs.length && b.berries.every((be) => !be.alive)) b.stage = 'dead';
    }
  }

  function collectBerryInstant(be) {
    if (!be || !be.alive) return;
    be.alive = false;
    be.stage = 'done';
    localStorage.setItem('berriesCollected', String((+localStorage.getItem('berriesCollected') || 0) + 1));
    const user = getUserState();
    user.money = (user.money || 0) + getResourceProfitById(be.def && be.def.id);
    setUserState(user);
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

    bushes.forEach((b) => b.berries.forEach((be) => {
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
        if (u >= 1) collectBerryInstant(be);
      }
    }));

    if (now - lastPickMs < PICK_COOLDOWN_MS) return;
    const cand = [];
    bushes.forEach((b) => b.berries.forEach((be) => {
      if (be.stage === 'idle' && be.alive && !be.flying && !be.onBush) {
        const d = Math.hypot(pct2px(be.xPct) - hx, pct2px(be.yPct) - hy);
        const under = isInHeroRect(be.xPct, be.yPct, hxPct, hyPct);
        if (under || d <= pct2px(PICK_R_PCT)) cand.push({ be, d });
      }
    }));
    if (!cand.length) return;
    cand.sort((a, b) => a.d - b.d);
    const be = cand[0].be;
    lastPickMs = now;
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
    if (shouldDrawTreeShadow(b, visual)) {
      beginFill(resourceShadowGraphics, 'rgba(0,0,0,0.24)', '#000000');
      resourceShadowGraphics.drawEllipse(x, y + height * 0.045, width * 0.28, Math.max(3, height * 0.045));
      resourceShadowGraphics.endFill();
    }
    sprite.visible = true;
    sprite.anchor.set(0.5, Number.isFinite(visual.anchorY) ? visual.anchorY : 0.86);
    sprite.x = x;
    sprite.y = y;
    sprite.width = width;
    sprite.height = height;
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
    const texture = getTexture(def.assetUrl);
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
    const alpha = clamp(1 - (now - leaf.t0) / LEAF_LIFE_MS, 0, 1);
    const x = pct2px(leaf.xPct);
    const y = pct2px(leaf.yPct);
    const w = pct2px(2);
    const h = pct2px(1);
    const c = Math.cos(leaf.rot);
    const s = Math.sin(leaf.rot);
    const points = [
      [-w / 2, 0],
      [0, -h / 2],
      [w / 2, 0],
      [0, h / 2],
    ].map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]).flat();
    resourceGraphics.beginFill(0x1d8f46, alpha);
    resourceGraphics.drawPolygon(points);
    resourceGraphics.endFill();
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
      b.berries.forEach((be) => drawBerry(resourceGraphics, be, activeBerrySpriteIds));
      if (visual.type !== 'centered' && !bushSpriteRendered) drawBushTop(resourceGraphics, b, now);
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
    const width = (Number.isFinite(def.widthPx) ? def.widthPx : size) * sizeScale;
    const height = (Number.isFinite(def.heightPx) ? def.heightPx : size) * sizeScale;
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
      if (isCampfireBuilding(def)) drawCampfireGlow(centerX, centerY, size, now, def);
      if (!renderBuildingSprite(def, centerX, centerY, size, activeBuildingIds)) {
        drawBuildingPrimitive(buildingsGraphics, def, centerX, centerY, size);
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
    return Boolean(document.querySelector('.panel-overlay.open,.shop-panel.open,.idle-panel.open'));
  }

  function onPointerDown(event) {
    if (pointerId !== null || isUiOpen()) return;
    pointerId = event.pointerId;
    app.view.setPointerCapture(pointerId);
    const pos = getPointerPos(event);
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

  function updateHeroLogic(dtMs) {
    applyHeroTeleport();
    const frameScale = dtMs / BASE_FRAME_MS;
    const vx = (controllerState.vxPct || 0) * SPEED_SCALE * frameScale;
    const vy = (controllerState.vyPct || 0) * SPEED_SCALE * frameScale;
    const isMoving = Math.abs(vx) + Math.abs(vy) > 0.001;
    controllerState.isMoving = isMoving;
    const cell = getWorldCellPx();
    const worldW = cell && GRID_W ? cell * GRID_W : gameWidth;
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
    const heroX = (charXPct * worldW) / 100;
    const heroY = (charYPct * worldW) / 100;
    camera = { x: heroX - gameWidth / 2, y: heroY - gameHeight / 2 };
    localStorage.setItem('camera', JSON.stringify(camera));
  }

  const heroParts = {};
  const heroContainer = new PIXI.Container();
  heroLayer.addChild(heroContainer);
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
      const x = pct2px(s.xPct);
      const y = pct2px(s.yPct);
      sharkGraphics.beginFill(0xffffff, 0.5);
      sharkGraphics.drawEllipse(x, y + 4, 16, 6);
      sharkGraphics.endFill();
      const dx = -Math.sin(s.angle);
      const flip = dx < 0 ? -1 : 1;
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
    redrawIsland();
  }

  function onMapChanged() {
    loadMapData();
  }

  function init() {
    resize();
    initHeroSprites();
    loadMapData({ initial: true, resetHero: true });
    openedIds = loadOpenedIds();
    scenarioState = loadScenarioState();
    persistScenarioState();
    rebuildScenarioColliderCells();
    syncDialogueText(null);
    fillOfflineResources();
    spawnSharks();
  }

  let spawnAccumulator = 0;
  function frame(deltaMS) {
    const now = performance.now();
    updateHeroLogic(deltaMS);
    spawnScenarioLand();
    updateDialogue(now);
    checkScenarioTriggers();
    syncDialogueText(getActiveDialogueText());

    spawnAccumulator += deltaMS;
    if (spawnAccumulator >= SPAWN_MS) {
      spawnAccumulator = 0;
      const unpicked = bushes.filter((b) => b.stage === 'growing' || b.stage === 'ripe').length;
      if (land.length && unpicked < MAX_UNPICKED_BUSHES) spawnBush(pickBerryDef());
    }

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

    const wiggle = getWiggleOffset();
    worldRoot.x = -camera.x + wiggle.x;
    worldRoot.y = -camera.y + wiggle.y;
    updateAndRenderSharks(deltaMS);
    renderScenarioObjects(now);
    renderBuildings(now);
    renderResources(now);
    renderHero(now, deltaMS || (now - lastHeroAnimT));
    lastHeroAnimT = now;
    renderJoystick();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('storage', (event) => {
    if (event.key === 'map' || event.key === SCENARIO_OPENED_KEY) onMapChanged();
  });
  window.addEventListener('vibe-map-changed', onMapChanged);
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
