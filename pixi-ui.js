(function () {
  const uiConfig = window.UIConfig || { uiAssets: {} };
  const berryConfig = window.BerriesConfig || { berries: [] };
  const buildingConfig = window.BuildingsConfig || { buildings: [] };
  const enlargeConfig = window.EnlargeConfig || { expansions: [] };
  const scenarioConfig = window.ScenarioObjectsConfig || { objects: [] };
  const playSound = (key, options) => {
    if (window.VibeAudio) return window.VibeAudio.play(key, options);
    return null;
  };
  const GAME_DAY_KEY = 'gameDay';
  const BASE_LAND_CELLS_KEY = 'baseLandCellCount';
  const MOVEMENT_HINT_SEEN_KEY = 'movementHintSeen';
  const STRAWBERRY_UPGRADE_HINT_SEEN_KEY = 'strawberryUpgradeHintSeen';
  const FIRST_DAY_ALLOWED_UPGRADES = new Set(['upgrade-strawberry-fertilizer', 'upgrade-sharp-sight', 'expand-1']);
  function getGameDay() {
    const stored = Math.floor(Number(localStorage.getItem(GAME_DAY_KEY) || 0));
    if (stored > 0) return stored;
    return Math.max(1, Math.floor(Number(localStorage.getItem('islandRun') || 1) || 1));
  }
  function isFirstGameDay() {
    return getGameDay() === 1 && Math.max(1, Math.floor(Number(localStorage.getItem('islandRun') || 1) || 1)) === 1;
  }
  const scenarioById = new Map((scenarioConfig.objects || []).map((obj) => [obj.id, obj]));
  const inventoryItems = Array.isArray(berryConfig.inventoryItems) ? berryConfig.inventoryItems : [];
  const DEFAULT_ISLAND_METERS = 18;
  const BOAT_REPAIR_COST = 20000;
  const LIGHTHOUSE_REQUIRED_METERS = getScenarioRequiredMeters('lighthouse');
  const CROPS_PER_TWO_EXPANSIONS = 5;
  const METERS_PER_TWO_EXPANSIONS = 4;
  const RESOURCE_UPGRADE_LEVELS_PER_STAR = 4;
  const RESOURCE_UPGRADE_MAX_STARS = 5;
  const RESOURCE_UPGRADE_MAX_LEVEL = RESOURCE_UPGRADE_LEVELS_PER_STAR * RESOURCE_UPGRADE_MAX_STARS;
  const TENT_UPGRADE_IDS = ['campfire-upgrade-1', 'campfire-upgrade-2', 'campfire-upgrade-3'];
  const SPECIAL_PROFIT_UPGRADES = [
    {
      id: 'upgrade-strawberry-fertilizer',
      title: 'Удобрения для клубники',
      assetUrl: './img/berry/strawberry-item.png',
      unlockCost: 500,
      requiredMeters: 18,
      resourceIds: ['strawberry'],
      growthSpeedMultiplier: 1.5,
      detail: 'Скорость роста клубники +50%',
    },
    {
      id: 'upgrade-sharp-sight',
      title: 'Зоркость',
      assetUrl: './img/upgrade/sharp-sight.png',
      unlockCost: 800,
      requiredMeters: 18,
      resourceIds: ['strawberry'],
      yieldMultiplier: 1.5,
      detail: 'В 1.5 раза больше ягод с куста',
    },
    {
      id: 'upgrade-mushroom-sense',
      title: 'Грибное чутьё',
      assetUrl: './img/upgrade/mushroom-sense.png',
      unlockCost: 1600,
      requiredMeters: 18,
      resourceIds: ['champignon'],
      bonusPercent: 200,
      detail: 'Шампиньоны +200%',
    },
    {
      id: 'upgrade-digging-technique',
      title: 'Техника копания',
      assetUrl: './img/upgrade/digging-technique.png',
      unlockCost: 3800,
      requiredMeters: 22,
      resourceIds: ['potato'],
      bonusPercent: 200,
      detail: 'Картофель +200%',
    },
    {
      id: 'upgrade-root-care',
      title: 'Корнеплодный уход',
      assetUrl: './img/upgrade/root-care.png',
      unlockCost: 5200,
      requiredMeters: 22,
      resourceIds: ['beet', 'radish'],
      bonusPercent: 150,
      detail: 'Свёкла и редиска +150%',
    },
    {
      id: 'upgrade-tomato-watering',
      title: 'Томатный полив',
      assetUrl: './img/upgrade/tomato-watering.png',
      unlockCost: 6500,
      requiredMeters: 22,
      resourceIds: ['tomato'],
      bonusPercent: 200,
      detail: 'Помидоры +200%',
    },
  ];
  const BOAT_REPAIR_REQUEST_KEY = 'boatRepairRequestedAt';
  const SCENARIO_OPENED_KEY = 'scenarioObjectsOpened';
  const SCENARIO_STATE_KEY = 'scenarioObjectsState';
  const KNOWN_LOCAL_ASSETS = new Set([
    './img/berry/1.png',
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
    './img/building/campfire.png',
    './img/building/campfire2.png',
    './img/building/campfire3.png',
    './img/building/campfire4.png',
    './img/building/whetstone.png',
    './img/building/forge.png',
    './img/rare/pine-cone.png',
    './img/rare/colorado-beetle.png',
    './img/ui/inventory-bag.png',
    './img/ui/shine.png',
    './img/ui/rainbow-stone.png',
    './img/ui/hero-portrait.png',
    './images/scenario/boat-repaired.png',
    './img/upgrade/sharp-sight.png',
    './img/upgrade/digging-technique.png',
    './img/upgrade/mushroom-sense.png',
    './img/upgrade/root-care.png',
    './img/upgrade/tomato-watering.png',
    './img/scenario-drop/metal-scrap.png?v=20260605-material-inventory',
    './img/scenario-drop/nail-puller.png',
    './img/scenario-drop/kettle.png',
    './img/scenario-drop/axe.png',
    './img/mineable/log-pine.png',
    './img/mineable/log-birch.png',
    './img/mineable/log-dead.png',
    './img/mineable/log-snow-pine.png',
  ]);
  Array.from({ length: 10 }, (_, index) => `./img/building/drill-${index + 1}.png`)
    .forEach((url) => KNOWN_LOCAL_ASSETS.add(url));
  [
    './img/mineable/pine1.png',
    './img/mineable/tree1.png',
    './img/mineable/dead_tree1.png',
    './img/mineable/snow_pine1.png',
  ].forEach((url) => KNOWN_LOCAL_ASSETS.add(url));

  const DAY_ONE_QUESTS = [
    {
      id: 'day-1-collect-10000',
      type: 'moneyEarned',
      title: 'Собрать 10k монет',
      target: 10000,
      reward: { type: 'dayTransition', amount: 0 },
    },
  ];
  const QUESTS = [
    {
      id: 'earn-25',
      type: 'moneyEarned',
      title: 'Заработай 25',
      target: 25,
      reward: { type: 'rainbowStones', amount: 1 },
    },
    {
      id: 'collect-8',
      type: 'itemsCollected',
      title: 'Собери 8 предметов',
      target: 8,
      reward: { type: 'money', amount: 30 },
    },
    {
      id: 'earn-150',
      type: 'moneyEarned',
      title: 'Заработай 150',
      target: 150,
      reward: { type: 'rainbowStones', amount: 2 },
    },
    {
      id: 'collect-25',
      type: 'itemsCollected',
      title: 'Собери 25 предметов',
      target: 25,
      reward: { type: 'money', amount: 120 },
    },
    {
      id: 'earn-500',
      type: 'moneyEarned',
      title: 'Заработай 500',
      target: 500,
      reward: { type: 'rainbowStones', amount: 3 },
    },
    {
      id: 'collect-60',
      type: 'itemsCollected',
      title: 'Собери 60 предметов',
      target: 60,
      reward: { type: 'money', amount: 320 },
    },
    {
      id: 'earn-1500',
      type: 'moneyEarned',
      title: 'Заработай 1.5k',
      target: 1500,
      reward: { type: 'rainbowStones', amount: 5 },
    },
    {
      id: 'collect-150',
      type: 'itemsCollected',
      title: 'Собери 150 предметов',
      target: 150,
      reward: { type: 'money', amount: 900 },
    },
    {
      id: 'repair-boat',
      type: 'repairBoat',
      title: 'починить катер',
      target: BOAT_REPAIR_COST,
      reward: { type: 'story', amount: 1 },
    },
  ];
  function getActiveQuests() {
    return isFirstGameDay() ? DAY_ONE_QUESTS : QUESTS;
  }

  function getScenarioRequiredMeters(id) {
    const def = scenarioById.get(id);
    if (!def) return DEFAULT_ISLAND_METERS;
    const distance = Math.max(0, Math.floor(Number(def.distanceCells) || 0));
    const triggerRadius = Math.max(1, Math.floor(Number(def.triggerRadiusCells) || 1));
    const expansionSteps = Math.max(0, distance - Math.max(0, triggerRadius - 1));
    return DEFAULT_ISLAND_METERS + expansionSteps * 2;
  }

  const svgDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  function buildBuildingFallback(def) {
    const primitive = def.primitive || {};
    let svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>";
    if (primitive.kind === 'campfire') {
      svg += `<ellipse cx='32' cy='42' rx='22' ry='12' fill='${primitive.glow || 'rgba(255,160,80,0.5)'}'/>`;
      svg += `<rect x='14' y='36' width='36' height='14' rx='6' fill='${primitive.stone || '#6e7a86'}'/>`;
      svg += `<path d='M32 18c8 6 10 12 0 22-10-10-8-16 0-22z' fill='${primitive.flame || '#ff8a3d'}'/>`;
    } else if (primitive.kind === 'whetstone') {
      svg += `<rect x='12' y='16' width='40' height='32' rx='8' fill='${primitive.base || '#9da3aa'}'/>`;
      svg += `<rect x='18' y='24' width='28' height='14' rx='6' fill='${primitive.edge || '#dfe5ec'}'/>`;
    } else if (primitive.kind === 'forge') {
      svg += `<rect x='10' y='18' width='44' height='36' rx='8' fill='${primitive.base || '#5b3b2d'}'/>`;
      svg += `<rect x='18' y='10' width='28' height='10' rx='4' fill='${primitive.roof || '#343a40'}'/>`;
      svg += `<rect x='22' y='30' width='20' height='16' rx='4' fill='${primitive.metal || '#c0c7cf'}'/>`;
      svg += `<path d='M32 32c6 4 6 8 0 14-6-6-6-10 0-14z' fill='${primitive.fire || '#ff7a35'}'/>`;
    } else {
      svg += `<rect x='12' y='16' width='40' height='32' rx='8' fill='${primitive.base || '#2f3a4a'}'/>`;
      svg += `<rect x='16' y='12' width='32' height='8' rx='4' fill='${primitive.marker || '#ff6b6b'}'/>`;
    }
    svg += '</svg>';
    return svgDataUri(svg);
  }

  function buildResourceFallback(def) {
    const primitive = def.primitive || {};
    let svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>";
    if (primitive.kind === 'mushroom') {
      svg += `<rect x='10' y='34' width='44' height='20' rx='10' fill='${primitive.stem || '#e1d2bf'}'/>`;
      svg += `<path d='M12 34c4-14 36-14 40 0' fill='${primitive.cap || '#f4eee6'}'/>`;
      svg += `<circle cx='24' cy='28' r='4' fill='${primitive.spots || 'rgba(255,255,255,0.8)'}'/>`;
      svg += `<circle cx='40' cy='26' r='3' fill='${primitive.spots || 'rgba(255,255,255,0.8)'}'/>`;
    } else if (primitive.kind === 'beet') {
      svg += `<circle cx='32' cy='36' r='14' fill='${primitive.root || '#9b1b30'}'/>`;
      svg += `<path d='M32 14c6 2 10 6 12 12-6-2-14-2-24 0 2-6 6-10 12-12z' fill='${primitive.leaf || '#2f9b52'}'/>`;
      svg += `<circle cx='26' cy='32' r='4' fill='${primitive.highlight || 'rgba(255,255,255,0.4)'}'/>`;
    } else if (primitive.kind === 'tree') {
      const trunk = primitive.trunk || '#6d4a2f';
      const foliage = primitive.foliage || '#2f7b3d';
      const accent = primitive.accent || '#4aa25e';
      if (primitive.form === 'pine') {
        svg += `<rect x='29' y='32' width='6' height='18' rx='2' fill='${trunk}'/>`;
        svg += `<path d='M32 8 L14 34 L50 34 Z' fill='${foliage}'/>`;
        svg += `<path d='M32 16 L18 36 L46 36 Z' fill='${accent}' opacity='0.9'/>`;
      } else {
        svg += `<rect x='28' y='34' width='8' height='18' rx='2' fill='${trunk}'/>`;
        svg += `<circle cx='32' cy='26' r='18' fill='${foliage}'/>`;
        svg += `<circle cx='24' cy='20' r='10' fill='${accent}' opacity='0.9'/>`;
      }
    } else {
      svg += `<circle cx='32' cy='32' r='20' fill='${primitive.base || '#e11'}'/>`;
      svg += `<circle cx='24' cy='26' r='6' fill='${primitive.highlight || 'rgba(255,255,255,0.5)'}'/>`;
    }
    svg += '</svg>';
    return svgDataUri(svg);
  }

  function getExpansionSurfaceColor(def) {
    if (def && def.surfaceColor) return def.surfaceColor;
    if (def && def.surfaceType === 'dead') return '#6f684a';
    if (def && def.surfaceType === 'snow') return '#dff4ff';
    return '#a9c745';
  }

  function getExpansionSurfaceValue(def) {
    if (!def) return 1;
    if (def.surfaceType) {
      return {
        surfaceType: def.surfaceType,
        surfaceColor: getExpansionSurfaceColor(def),
      };
    }
    return def.surfaceColor || 1;
  }

  function buildExpandFallback(def) {
    const surfaceColor = getExpansionSurfaceColor(def);
    return svgDataUri(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
      `<rect x='8' y='8' width='48' height='48' rx='12' fill='${surfaceColor}'/>` +
      "<path d='M32 18v28M18 32h28' stroke='#ffffff' stroke-width='6' stroke-linecap='round'/>" +
      '</svg>'
    );
  }

  function buildBoatRepairFallback() {
    return svgDataUri(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 64'>" +
      "<ellipse cx='40' cy='50' rx='30' ry='7' fill='rgba(0,0,0,0.18)'/>" +
      "<path d='M12 35h52l-8 14H23c-6 0-10-5-11-14z' fill='#2f8fca'/>" +
      "<path d='M21 29h30l7 7H16l5-7z' fill='#f3f0df'/>" +
      "<rect x='28' y='18' width='20' height='12' rx='3' fill='#d85f38'/>" +
      "<rect x='33' y='12' width='5' height='20' rx='2' fill='#7a4c35'/>" +
      "<path d='M55 23l9-6 2 18-10-4z' fill='#7a4c35'/>" +
      "</svg>"
    );
  }

  function knownAssetUrl(url) {
    if (!url) return '';
    if (url.startsWith('data:image')) return url;
    return KNOWN_LOCAL_ASSETS.has(url) ? url : '';
  }

  function loadMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem('map') || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.map((row) => Array.isArray(row) ? row.slice() : []);
    } catch (err) {
      return [];
    }
  }

  function normalizeMap(map) {
    const width = Math.max(0, ...map.map((row) => row.length));
    return map.map((row) => {
      const next = Array.isArray(row) ? row.slice() : [];
      while (next.length < width) next.push(0);
      return next;
    });
  }

  function getIslandBounds(map) {
    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (let y = 0; y < map.length; y += 1) {
      const row = map[y] || [];
      for (let x = 0; x < row.length; x += 1) {
        if (!row[x]) continue;
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
      }
    }
    if (!Number.isFinite(bounds.minX)) return null;
    return bounds;
  }

  function applyPadding(map, { top = 0, right = 0, bottom = 0, left = 0 }) {
    const padded = map.map((row) => {
      const next = row.slice();
      for (let i = 0; i < left; i += 1) next.unshift(0);
      for (let i = 0; i < right; i += 1) next.push(0);
      return next;
    });
    const width = padded[0] ? padded[0].length : 0;
    for (let i = 0; i < top; i += 1) padded.unshift(Array.from({ length: width }, () => 0));
    for (let i = 0; i < bottom; i += 1) padded.push(Array.from({ length: width }, () => 0));
    return padded;
  }

  function loadScenarioObjectsState() {
    try {
      const stored = JSON.parse(localStorage.getItem(SCENARIO_STATE_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (err) {
      return [];
    }
  }

  function getIslandSizeMeters() {
    const bounds = getIslandBounds(loadMap());
    if (!bounds) return DEFAULT_ISLAND_METERS;
    return Math.max(bounds.maxX - bounds.minX + 1, bounds.maxY - bounds.minY + 1);
  }

  function renderIslandSizeMeters() {
    if (!islandSizeMeters) return;
    islandSizeMeters.textContent = `⌀ ${formatCompactNumber(getIslandSizeMeters())} м`;
  }

  function loadScenarioOpenedIds() {
    try {
      const stored = JSON.parse(localStorage.getItem(SCENARIO_OPENED_KEY) || '[]');
      return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : []);
    } catch (err) {
      return new Set();
    }
  }

  function isScenarioOpened(id) {
    if (loadScenarioOpenedIds().has(id)) return true;
    return loadScenarioObjectsState().some((state) =>
      state && state.id === id && (state.opened || state.triggered || state.transformed)
    );
  }

  function isLighthouseOpened() {
    return isScenarioOpened('lighthouse');
  }

  function getRepairBoatTarget() {
    return isLighthouseOpened() ? BOAT_REPAIR_COST : LIGHTHOUSE_REQUIRED_METERS;
  }

  function getRepairBoatCurrent(user) {
    if (!isLighthouseOpened()) return getIslandSizeMeters();
    return Math.max(0, Math.floor(Number(user && user.money) || 0));
  }

  function isCropResource(def) {
    return Boolean(def && def.id && def.resourceType !== 'extractable' && !def.surfaceTypes);
  }

  function getCropRequiredMeters(cropIndex) {
    const group = Math.max(0, Math.floor(cropIndex / CROPS_PER_TWO_EXPANSIONS));
    return DEFAULT_ISLAND_METERS + group * METERS_PER_TWO_EXPANSIONS;
  }

  function getTentUpgradeLevel(id) {
    const index = TENT_UPGRADE_IDS.indexOf(id);
    return index >= 0 ? index + 1 : 0;
  }

  function toRoman(value) {
    return ['I', 'II', 'III', 'IV', 'V'][Math.max(0, Math.floor(Number(value) || 1) - 1)] || String(value);
  }

  function getTentProfitBonusPercent(user) {
    const unlocked = user && user.unlockedResources ? user.unlockedResources : {};
    let level = 0;
    TENT_UPGRADE_IDS.forEach((id, index) => {
      if (unlocked[id]) level = Math.max(level, index + 1);
    });
    return level * 100;
  }

  function getSpecialProfitBonusPercent(user, resourceId) {
    if (!resourceId) return 0;
    const unlocked = user && user.unlockedResources ? user.unlockedResources : {};
    return SPECIAL_PROFIT_UPGRADES.reduce((sum, upgrade) => {
      if (!unlocked[upgrade.id]) return sum;
      if (!upgrade.resourceIds.includes(resourceId)) return sum;
      return sum + Math.max(0, Math.floor(Number(upgrade.bonusPercent) || 0));
    }, 0);
  }

  function ensureResourceUpgrades(user) {
    if (!user.resourceUpgrades || typeof user.resourceUpgrades !== 'object' || Array.isArray(user.resourceUpgrades)) {
      user.resourceUpgrades = {};
    }
    return user.resourceUpgrades;
  }

  function getResourceMaxStars(resourceId) {
    return isFirstGameDay() && resourceId === 'strawberry' ? 3 : RESOURCE_UPGRADE_MAX_STARS;
  }

  function getResourceMaxLevel(resourceId) {
    return getResourceMaxStars(resourceId) * RESOURCE_UPGRADE_LEVELS_PER_STAR;
  }

  function getResourceUpgradeLevel(user, resourceId) {
    const upgrades = ensureResourceUpgrades(user);
    return Math.min(getResourceMaxLevel(resourceId), Math.max(0, Math.floor(Number(upgrades[resourceId]) || 0)));
  }

  function getResourceUpgradeStars(user, resourceId) {
    return Math.min(getResourceMaxStars(resourceId), Math.floor(getResourceUpgradeLevel(user, resourceId) / RESOURCE_UPGRADE_LEVELS_PER_STAR));
  }

  function getResourceGrowthSpeedMultiplier(user, resourceId) {
    if (resourceId === 'strawberry' && user?.unlockedResources?.['upgrade-strawberry-fertilizer']) return 1.5;
    return 1;
  }

  function getResourceYieldMultiplier(user, resourceId) {
    if (resourceId === 'strawberry' && user?.unlockedResources?.['upgrade-sharp-sight']) return 1.5;
    return 1;
  }

  function getTerritorySpawnMultiplier() {
    const currentMap = loadMap();
    const landCount = currentMap.reduce((sum, row) => sum + (Array.isArray(row) ? row.filter(Boolean).length : 0), 0);
    const base = Math.max(1, Math.floor(Number(localStorage.getItem(BASE_LAND_CELLS_KEY)) || landCount || 1));
    return Math.max(1, landCount / base);
  }

  function getResourceUpgradeBonusPercent(user, resourceId) {
    return Math.min(200, getResourceUpgradeLevel(user, resourceId) * 10);
  }

  function getResourceUpgradeMultiplierAtLevel(level) {
    const safeLevel = Math.min(RESOURCE_UPGRADE_MAX_LEVEL, Math.max(0, Math.floor(Number(level) || 0)));
    const regularMultiplier = 1 + Math.min(200, safeLevel * 10) / 100;
    const stars = Math.min(RESOURCE_UPGRADE_MAX_STARS, Math.floor(safeLevel / RESOURCE_UPGRADE_LEVELS_PER_STAR));
    return regularMultiplier * (2 ** stars);
  }

  function getResourceUpgradeCost(resource, user) {
    const level = getResourceUpgradeLevel(user, resource.id);
    if (level >= getResourceMaxLevel(resource.id)) return 0;
    const baseCost = Math.max(10, Math.ceil((resource.unlockCost || 0) * 0.25), Math.ceil(resource.profit * 10));
    return Math.ceil(baseCost * (1.65 ** level));
  }

  function applyProfitBonus(value, user, resourceId) {
    const base = Math.max(0, Number(value) || 0);
    const bonus = getTentProfitBonusPercent(user) + getSpecialProfitBonusPercent(user, resourceId);
    const globalMultiplier = 1 + bonus / 100;
    const level = getResourceUpgradeLevel(user, resourceId);
    let result = Math.ceil(base * globalMultiplier);
    for (let nextLevel = 1; nextLevel <= level; nextLevel += 1) {
      const scaled = Math.ceil(base * getResourceUpgradeMultiplierAtLevel(nextLevel) * globalMultiplier);
      const starEarned = nextLevel % RESOURCE_UPGRADE_LEVELS_PER_STAR === 0;
      result = Math.max(result + 1, scaled, starEarned ? result * 2 : 0);
    }
    return result;
  }

  function hasLandNeighbor(map, x, y) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        if (map[y + dy] && map[y + dy][x + dx]) return true;
      }
    }
    return false;
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

  function isScenarioOnLand(map, state, def) {
    const step = getInwardStep(def);
    const radius = Math.max(1, (def && def.triggerRadiusCells) || 1) - 1;
    const y0 = state.gridY;
    const x0 = state.gridX;
    const checks = [
      [x0, y0],
      [x0, y0 + step.y * radius],
      [x0, y0 - step.y * radius],
      [x0 + step.x * radius, y0],
      [x0 - step.x * radius, y0],
    ];
    return checks.some(([x, y]) => Boolean(map[y] && map[y][x]));
  }

  function applyScenarioObjectsToMap(map, shift, surfaceValue) {
    const scenarioObjects = loadScenarioObjectsState();
    if (!scenarioObjects.length) return map;
    const expansionValue = surfaceValue || 1;
    scenarioObjects.forEach((obj) => {
      const gridX = (Number.isFinite(obj.gridX) ? obj.gridX : 0) + ((shift && shift.x) || 0);
      const gridY = (Number.isFinite(obj.gridY) ? obj.gridY : 0) + ((shift && shift.y) || 0);
      const def = scenarioById.get(obj.id);
      const stateOnMap = { id: obj.id, gridX, gridY };
      if (!map[gridY] || typeof map[gridY][gridX] === 'undefined') return;
      if (map[gridY][gridX]) return;
      if (isScenarioOnLand(map, stateOnMap, def) || hasLandNeighbor(map, gridX, gridY)) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const ny = gridY + dy;
            const nx = gridX + dx;
            if (!map[ny] || typeof map[ny][nx] === 'undefined') continue;
            if (map[ny][nx]) continue;
            map[ny][nx] = expansionValue;
          }
        }
      }
    });
    return map;
  }

  function expandIsland(map, surfaceValue) {
    if (!Array.isArray(map) || !map.length) return { map, shift: { x: 0, y: 0 } };
    let nextMap = normalizeMap(map);
    const bounds = getIslandBounds(nextMap);
    if (!bounds) return { map: nextMap, shift: { x: 0, y: 0 } };
    const width = nextMap[0] ? nextMap[0].length : 0;
    const height = nextMap.length;
    const padding = {
      top: bounds.minY === 0 ? 1 : 0,
      bottom: bounds.maxY === height - 1 ? 1 : 0,
      left: bounds.minX === 0 ? 1 : 0,
      right: bounds.maxX === width - 1 ? 1 : 0,
    };
    if (padding.top || padding.right || padding.bottom || padding.left) {
      nextMap = applyPadding(nextMap, padding);
    }
    const expanded = nextMap.map((row) => row.slice());
    const h = nextMap.length;
    const w = nextMap[0] ? nextMap[0].length : 0;
    const expansionValue = surfaceValue || 1;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (!nextMap[y] || !nextMap[y][x]) continue;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
            if (!expanded[ny][nx]) expanded[ny][nx] = expansionValue;
          }
        }
      }
    }
    const shift = { x: padding.left, y: padding.top };
    applyScenarioObjectsToMap(expanded, shift, surfaceValue);
    return { map: expanded, shift };
  }

  let cropResourceIndex = 0;
  const berryResources = (berryConfig.berries || []).filter((def) => def.resourceType !== 'extractable').map((def, index) => {
    const profit = typeof def.profit === 'number' ? def.profit : index + 1;
    const cropIndex = isCropResource(def) ? cropResourceIndex++ : -1;
    return {
      id: def.id,
      title: def.titleRu || def.id,
      assetUrl: knownAssetUrl(def.assetUrl),
      fallbackUrl: buildResourceFallback(def),
      profit,
      unlockCost: typeof def.unlockCost === 'number' ? def.unlockCost : 0,
      detail: `Прибыль: +${profit}`,
      requiredMeters: cropIndex >= 0 ? getCropRequiredMeters(cropIndex) : DEFAULT_ISLAND_METERS,
      category: 'resource',
    };
  });

  const specialUpgradeResources = SPECIAL_PROFIT_UPGRADES.map((def) => ({
    id: def.id,
    title: def.title,
    assetUrl: knownAssetUrl(def.assetUrl),
    unlockCost: Math.max(0, Math.floor(Number(def.unlockCost) || 0)),
    detail: def.detail,
    requiredMeters: Math.max(DEFAULT_ISLAND_METERS, Math.floor(Number(def.requiredMeters) || DEFAULT_ISLAND_METERS)),
    category: 'specialUpgrade',
    resourceIds: def.resourceIds,
    bonusPercent: def.bonusPercent,
    growthSpeedMultiplier: def.growthSpeedMultiplier,
    yieldMultiplier: def.yieldMultiplier,
  }));

  const buildingDefinitions = buildingConfig.buildings || [];
  const buildingById = new Map(buildingDefinitions.map((item) => [item.id, item]));
  const buildingResources = buildingDefinitions.map((def) => {
    const tentLevel = getTentUpgradeLevel(def.id);
    return {
      id: def.id,
      title: tentLevel ? `Палатка ${toRoman(tentLevel)}` : (def.titleRu || def.id),
      assetUrl: knownAssetUrl(def.assetUrl),
      unlockCost: typeof def.unlockCost === 'number' ? def.unlockCost : 0,
      detail: tentLevel ? `Общая прибыль +${tentLevel * 100}%` : (def.detail || 'Постройка'),
      fallbackUrl: buildBuildingFallback(def),
      category: 'building',
      tentUpgrade: tentLevel > 0,
    };
  });

  const expansionResources = (enlargeConfig.expansions || []).map((def) => ({
    id: def.id,
    title: def.titleRu || def.id,
    assetUrl: knownAssetUrl(def.assetUrl),
    unlockCost: typeof def.unlockCost === 'number' ? def.unlockCost : 0,
    detail: 'Расширение острова +1',
    fallbackUrl: buildExpandFallback(def),
    category: 'expansion',
    onUnlock: () => {
      const current = loadMap();
      if (!Number(localStorage.getItem(BASE_LAND_CELLS_KEY))) {
        const baseLandCount = current.reduce((sum, row) => sum + (Array.isArray(row) ? row.filter(Boolean).length : 0), 0);
        localStorage.setItem(BASE_LAND_CELLS_KEY, String(Math.max(1, baseLandCount)));
      }
      const result = expandIsland(current, getExpansionSurfaceValue(def));
      localStorage.setItem('islandExpansionPreviousMap', JSON.stringify(current));
      localStorage.setItem('mapShift', JSON.stringify(result.shift || { x: 0, y: 0 }));
      localStorage.setItem('map', JSON.stringify(result.map));
      const expansionLevel = Number(localStorage.getItem('islandExpansionLevel') || '0');
      const nextLevel = Number.isFinite(expansionLevel) ? Math.max(0, Math.floor(expansionLevel) + 1) : 1;
      localStorage.setItem('islandExpansionLevel', String(nextLevel));
      localStorage.setItem('islandExpansionAt', String(Date.now()));
      playSound('world.islandExpand', { volume: 0.34 });
      window.dispatchEvent(new CustomEvent('vibe-map-changed'));
    },
  }));

  const boatRepairResource = {
    id: 'repair-boat-upgrade',
    title: 'Починить катер',
    assetUrl: './images/scenario/boat-repaired.png',
    unlockCost: BOAT_REPAIR_COST,
    detail: 'И уплыть с острова',
    fallbackUrl: buildBoatRepairFallback(),
    category: 'boatRepair',
    onUnlock: () => {
      const user = getUserState();
      const questState = ensureQuestState(user);
      const repairQuestIndex = QUESTS.findIndex((quest) => quest.type === 'repairBoat');
      if (repairQuestIndex >= 0 && questState.index <= repairQuestIndex) {
        questState.index = Math.min(repairQuestIndex + 1, QUESTS.length);
        questState.updatedAt = Date.now();
      }
      setUserState(user);
      localStorage.setItem(BOAT_REPAIR_REQUEST_KEY, String(Date.now()));
      window.dispatchEvent(new CustomEvent('vibe-boat-repair'));
    },
  };

  const tentUpgradeResources = buildingResources.filter((res) => res.tentUpgrade);
  const resources = [...berryResources, ...specialUpgradeResources, ...tentUpgradeResources, ...expansionResources, boatRepairResource].sort((a, b) => {
    const diff = a.unlockCost - b.unlockCost;
    if (diff !== 0) return diff;
    return String(a.title).localeCompare(String(b.title));
  });
  function isResourceVisibleForCurrentDay(resource) {
    if (!isFirstGameDay()) return true;
    return Boolean(resource && FIRST_DAY_ALLOWED_UPGRADES.has(resource.id));
  }

  const moneyValue = document.getElementById('moneyValue');
  const uiRoot = document.getElementById('uiRoot');
  const gameShell = document.getElementById('gameShell');
  const loadingScreen = document.getElementById('loadingScreen');
  const introComic = document.getElementById('introComic');
  const dayTitleOverlay = document.getElementById('dayTitleOverlay');
  const dayTitleSubtitle = document.getElementById('dayTitleSubtitle');
  const dayTitleText = document.getElementById('dayTitleText');
  const movementHint = document.getElementById('movementHint');
  const strawberryUpgradeHint = document.getElementById('strawberryUpgradeHint');
  const gemValue = document.getElementById('gemValue');
  const gemIcon = document.getElementById('gemIcon');
  const heroPortrait = document.getElementById('heroPortrait');
  const playerLevel = document.getElementById('playerLevel');
  const playerXpFill = document.getElementById('playerXpFill');
  const playerXpText = document.getElementById('playerXpText');
  const settingsButton = document.getElementById('settingsButton');
  const settingsPanel = document.getElementById('settingsPanel');
  const soundToggle = document.getElementById('soundToggle');
  const musicToggle = document.getElementById('musicToggle');
  const islandSizeMeters = document.getElementById('islandSizeMeters');
  const shopButton = document.getElementById('shopButton');
  const shopPanel = document.getElementById('shopPanel');
  const closePanel = document.getElementById('closePanel');
  const inventoryButton = document.getElementById('inventoryButton');
  const inventoryIcon = document.getElementById('inventoryIcon');
  const inventoryPanel = document.getElementById('inventoryPanel');
  const closeInventory = document.getElementById('closeInventory');
  const inventoryList = document.getElementById('inventoryList');
  const inventoryBadge = document.getElementById('inventoryBadge');
  const findingOverlay = document.getElementById('findingOverlay');
  const findingItem = document.getElementById('findingItem');
  const findingTitle = document.getElementById('findingTitle');
  const findingOk = document.getElementById('findingOk');
  const panelOverlay = document.getElementById('panelOverlay');
  const idleOverlay = document.getElementById('idleOverlay');
  const idlePanel = document.getElementById('idlePanel');
  const idleDetail = document.getElementById('idleDetail');
  const idleClose = document.getElementById('idleClose');
  const resourceList = document.getElementById('resourceList');
  const farmResourceStrip = document.getElementById('farmResourceStrip');
  const resourceUpgradePanel = document.getElementById('resourceUpgradePanel');
  const closeResourceUpgrade = document.getElementById('closeResourceUpgrade');
  const resourceUpgradeIcon = document.getElementById('resourceUpgradeIcon');
  const resourceUpgradeLevel = document.getElementById('resourceUpgradeLevel');
  const resourceUpgradeName = document.getElementById('resourceUpgradeName');
  const resourceUpgradeStars = document.getElementById('resourceUpgradeStars');
  const resourceUpgradeProgressFill = document.getElementById('resourceUpgradeProgressFill');
  const resourceUpgradePrice = document.getElementById('resourceUpgradePrice');
  const resourceUpgradeBonus = document.getElementById('resourceUpgradeBonus');
  const resourceUpgradeGrowth = document.getElementById('resourceUpgradeGrowth');
  const resourceUpgradeYield = document.getElementById('resourceUpgradeYield');
  const resourceUpgradeSpawn = document.getElementById('resourceUpgradeSpawn');
  const resourceUpgradeButton = document.getElementById('resourceUpgradeButton');
  const resourceUpgradeCoin = document.getElementById('resourceUpgradeCoin');
  const resourceUpgradeCost = document.getElementById('resourceUpgradeCost');
  const upgradeMarker = document.getElementById('upgradeMarker');
  const questStage = document.getElementById('questStage');
  const questTrackFill = document.getElementById('questTrackFill');
  const questMilestones = document.getElementById('questMilestones');
  const questCard = document.getElementById('questCard');
  const questPointer = document.getElementById('questPointer');
  const questIcon = document.getElementById('questIcon');
  const questTitle = document.getElementById('questTitle');
  const questProgressFill = document.getElementById('questProgressFill');
  const questProgressText = document.getElementById('questProgressText');
  const questReward = document.getElementById('questReward');
  const questRewardIcon = document.getElementById('questRewardIcon');
  const questRewardValue = document.getElementById('questRewardValue');
  const questClaim = document.getElementById('questClaim');
  const questToggle = document.getElementById('questToggle');
  const questCollapse = document.getElementById('questCollapse');
  const resourceCards = new Map();
  const farmResourceCards = new Map();
  let activeResourceUpgradeId = null;
  const EXPANSION_DELAY_MS = 900;
  const PENDING_FOUND_ITEM_KEY = 'pendingFoundItem';

  function setImageWithFallback(img, key) {
    if (!img) return;
    const asset = uiConfig.uiAssets[key] || {};
    if (knownAssetUrl(asset.url)) {
      img.src = asset.url;
      img.onerror = () => {
        if (asset.fallback) img.src = asset.fallback;
      };
    } else if (asset.fallback) {
      img.src = asset.fallback;
    }
  }

  setImageWithFallback(document.getElementById('coinIcon'), 'coin');
  setImageWithFallback(resourceUpgradeCoin, 'coin');
  setImageWithFallback(document.getElementById('cartIcon'), 'cart');
  setImageWithFallback(gemIcon, 'rainbowStone');
  setImageWithFallback(heroPortrait, 'heroPortrait');
  if (inventoryIcon) inventoryIcon.src = knownAssetUrl('./img/ui/inventory-bag.png') || './img/ui/inventory-bag.png';

  function getUserState() {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (err) {
      user = {};
    }
    if (typeof user.money !== 'number' || Number.isNaN(user.money)) user.money = 0;
    if (typeof user.rainbowStones !== 'number' || Number.isNaN(user.rainbowStones)) user.rainbowStones = 0;
    if (!user.unlockedResources || typeof user.unlockedResources !== 'object') user.unlockedResources = {};
    if (!user.inventory || typeof user.inventory !== 'object' || Array.isArray(user.inventory)) user.inventory = {};
    ensureResourceUpgrades(user);
    ensureUserStats(user);
    ensurePlayerProgress(user);
    ensureQuestState(user);
    const defaultUnlocks = [];
    const campfire = buildingResources.find((item) => item.id === 'campfire');
    if (campfire) defaultUnlocks.push(campfire.id);
    if (berryResources[0]) defaultUnlocks.push(berryResources[0].id);
    defaultUnlocks.forEach((id) => { user.unlockedResources[id] = true; });
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  function setUserState(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  function ensureUserStats(user) {
    if (!user.stats || typeof user.stats !== 'object' || Array.isArray(user.stats)) user.stats = {};
    const stats = user.stats;
    const currentMoney = Math.max(0, Math.floor(Number(user.money) || 0));
    stats.moneyEarned = Math.max(0, Math.floor(Number(stats.moneyEarned) || 0), currentMoney);
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

  function ensureQuestState(user) {
    if (!user.questLine || typeof user.questLine !== 'object' || Array.isArray(user.questLine)) user.questLine = {};
    const mode = isFirstGameDay() ? 'day-1' : 'normal';
    if (user.questLine.mode !== mode) user.questLine = { index: 0, mode, updatedAt: Date.now() };
    const activeQuests = getActiveQuests();
    const index = Math.floor(Number(user.questLine.index) || 0);
    user.questLine.index = Math.min(Math.max(0, index), activeQuests.length);
    return user.questLine;
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

  function getHeroState() {
    try {
      const hero = JSON.parse(localStorage.getItem('heroState') || '{}');
      if (typeof hero.charXPct !== 'number' || typeof hero.charYPct !== 'number') return null;
      return hero;
    } catch (err) {
      return null;
    }
  }

  function getMostExpensiveResourceProfit(user = getUserState()) {
    let chosen = null;
    berryResources.forEach((res) => {
      if (!user.unlockedResources[res.id]) return;
      if (!chosen || res.unlockCost > chosen.unlockCost) chosen = res;
    });
    return chosen ? applyProfitBonus(chosen.profit, user, chosen.id) : 0;
  }

  const WORLD_ZOOM = 1.15;
  function getWorldCellPx() {
    const gameW = parseFloat(localStorage.getItem('gameWidth')) || innerWidth;
    const baseGridW = Number(localStorage.getItem('baseGridW') || '0');
    if (!Number.isFinite(baseGridW) || baseGridW <= 0) return 0;
    const expansionLevel = Math.max(0, Math.floor(Number(localStorage.getItem('islandExpansionLevel') || '0') || 0));
    return (gameW / baseGridW) * Math.pow(0.97, expansionLevel) * WORLD_ZOOM;
  }

  function getVirtualCellPx() {
    const value = buildingConfig.virtualCellPx;
    if (Number.isFinite(value)) return value;
    const cellPx = getWorldCellPx();
    return Number.isFinite(cellPx) ? cellPx : 0;
  }

  function getBuildingAnchorSpot(layout, gridW, gridH) {
    const anchorSpot = layout.find((spot) => spot.id === 'campfire');
    if (anchorSpot) return anchorSpot;
    if (gridW && gridH) return { x: (gridW * 0.5) - 0.5, y: (gridH * 0.5) - 0.5 };
    return null;
  }

  function getBuildingColliderInfo(spot, def) {
    if (!spot || !def) return null;
    const radius = Number.isFinite(def.colliderRadius) ? def.colliderRadius : 1;
    const offset = buildingConfig.layoutOffset || { x: 0, y: 0 };
    return {
      gridX: Math.round(spot.x + offset.x),
      gridY: Math.round(spot.y + offset.y),
      radiusCells: Math.max(1, Math.round(radius)),
    };
  }

  function calculateIdleIncome() {
    const lastActiveAt = Number(localStorage.getItem('lastActiveAt') || 0);
    if (!Number.isFinite(lastActiveAt) || lastActiveAt <= 0) return { income: 0, secondsAway: 0 };
    const cappedSeconds = Math.min(Math.max(0, (Date.now() - lastActiveAt) / 1000), 3600 * 3);
    const user = getUserState();
    const baseProfit = getMostExpensiveResourceProfit(user);
    if (baseProfit <= 0 || cappedSeconds <= 0) return { income: 0, secondsAway: cappedSeconds };
    return { income: Math.floor((baseProfit * 5 * cappedSeconds) / 15), secondsAway: cappedSeconds };
  }

  function showIdlePanel(income) {
    idleDetail.textContent = `Вы получили +${income}`;
    idlePanel.classList.add('open');
    idleOverlay.classList.add('open');
    idlePanel.setAttribute('aria-hidden', 'false');
  }

  function hideIdlePanel() {
    idlePanel.classList.remove('open');
    idleOverlay.classList.remove('open');
    idlePanel.setAttribute('aria-hidden', 'true');
  }

  function setLastActiveAt() {
    localStorage.setItem('lastActiveAt', String(Date.now()));
  }

  function applyIdleIncome() {
    const result = calculateIdleIncome();
    if (result.income <= 0) return;
    const user = getUserState();
    user.money += result.income;
    addMoneyEarnedStat(user, result.income);
    setUserState(user);
    showIdlePanel(result.income);
    renderResources();
  }

  function maybeTeleportHeroFromBuilding(res) {
    if (res.category !== 'building') return;
    const def = buildingById.get(res.id);
    if (!def || !def.collider) return;
    const currentMap = loadMap();
    const gridW = currentMap[0] ? currentMap[0].length : 0;
    const gridH = currentMap.length;
    if (!gridW) return;
    const layout = buildingConfig.getBuildingLayout(currentMap);
    const spot = layout.find((entry) => entry.id === res.id);
    const campfireSpot = layout.find((entry) => entry.id === 'campfire');
    if (!spot || !campfireSpot) return;
    const anchorSpot = getBuildingAnchorSpot(layout, gridW, gridH);
    if (!anchorSpot || !getVirtualCellPx()) return;
    const collider = getBuildingColliderInfo(spot, def);
    if (!collider) return;
    const hero = getHeroState();
    if (!hero) return;
    const heroCellX = Math.floor((hero.charXPct / 100) * gridW);
    const heroCellY = Math.floor((hero.charYPct / 100) * gridW);
    const inZone = Math.abs(heroCellX - collider.gridX) <= collider.radiusCells
      && Math.abs(heroCellY - collider.gridY) <= collider.radiusCells;
    if (!inZone) return;
    localStorage.setItem('heroTeleport', JSON.stringify({
      xPct: (campfireSpot.x / gridW) * 100,
      yPct: (campfireSpot.y / gridW) * 100,
    }));
  }

  function getResourceExpansionRequirement(res, islandMeters = getIslandSizeMeters()) {
    if (!res) return 0;
    if (res.category === 'boatRepair' && !isLighthouseOpened()) return LIGHTHOUSE_REQUIRED_METERS;
    const requiredMeters = Math.max(DEFAULT_ISLAND_METERS, Math.floor(Number(res.requiredMeters) || 0));
    if (requiredMeters > islandMeters) return requiredMeters;
    return 0;
  }

  function getResourceLockInfo(res, user, islandMeters = getIslandSizeMeters()) {
    const expansionRequiredMeters = getResourceExpansionRequirement(res, islandMeters);
    const storyLocked = res && res.category === 'boatRepair' && !isLighthouseOpened();
    const expansionLocked = expansionRequiredMeters > islandMeters || storyLocked;
    const canBuy = !expansionLocked && Math.max(0, Math.floor(Number(user.money) || 0)) >= res.unlockCost;
    return { expansionLocked, expansionRequiredMeters, canBuy };
  }

  function attemptUnlock(res) {
    if (!isResourceVisibleForCurrentDay(res)) return false;
    const latest = getUserState();
    if (latest.unlockedResources[res.id]) return false;
    const lockInfo = getResourceLockInfo(res, latest);
    if (lockInfo.expansionLocked) return false;
    if (latest.money < res.unlockCost) {
      playSound('ui.notEnoughMoney', { volume: 0.28, cooldownMs: 250 });
      return false;
    }
    latest.money -= res.unlockCost;
    latest.unlockedResources[res.id] = true;
    setUserState(latest);
    const isBoatRepair = res.category === 'boatRepair';
    const isExpansion = res.category === 'expansion';
    if (isExpansion || isBoatRepair) togglePanel(false);
    maybeTeleportHeroFromBuilding(res);
    if (typeof res.onUnlock === 'function') {
      if (isExpansion) setTimeout(() => res.onUnlock(), EXPANSION_DELAY_MS);
      else res.onUnlock();
    }
    playSound('ui.questReward', { volume: 0.3 });
    renderResources();
    return true;
  }

  function createResourceCard(res) {
    const lockDivider = document.createElement('div');
    lockDivider.className = 'resource-lock-divider';
    lockDivider.setAttribute('data-ui-control', '');
    const lockLabel = document.createElement('span');
    lockDivider.appendChild(lockLabel);

    const card = document.createElement('div');
    card.setAttribute('data-ui-control', '');
    card.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      attemptUnlock(res);
    });

    const icon = document.createElement('div');
    icon.className = 'resource-icon';
    const img = document.createElement('img');
    img.alt = res.title;
    img.src = res.assetUrl || res.fallbackUrl || '';
    img.onerror = () => {
      if (res.fallbackUrl && img.src !== res.fallbackUrl) {
        img.src = res.fallbackUrl;
        return;
      }
      const fallbackAsset = uiConfig.uiAssets.resourceFallback || {};
      const fallbackUrl = fallbackAsset.url || fallbackAsset.fallback;
      if (fallbackUrl && img.src !== fallbackUrl) {
        img.src = fallbackUrl;
        return;
      }
      icon.innerHTML = '';
    };
    icon.appendChild(img);

    const info = document.createElement('div');
    info.className = 'resource-info';
    const title = document.createElement('span');
    title.textContent = res.title;
    const profit = document.createElement('small');
    profit.textContent = res.detail || `Прибыль: +${res.profit}`;
    info.appendChild(title);
    info.appendChild(profit);

    const button = document.createElement('button');
    button.className = 'unlock-button';
    const coin = document.createElement('img');
    setImageWithFallback(coin, 'coin');
    const label = document.createElement('span');
    button.appendChild(coin);
    button.appendChild(label);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      attemptUnlock(res);
    });

    const check = document.createElement('img');
    check.className = 'check-icon';
    check.alt = 'unlocked';
    setImageWithFallback(check, 'check');

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(button);
    card.appendChild(check);
    resourceList.appendChild(card);
    return { card, button, label, detail: profit, check, lockDivider, lockLabel };
  }

  function setResourceImage(img, resource) {
    if (!img || !resource) return;
    img.style.visibility = '';
    img.alt = resource.title;
    img.src = resource.assetUrl || resource.fallbackUrl || '';
    img.onerror = () => {
      if (resource.fallbackUrl && img.src !== resource.fallbackUrl) {
        img.src = resource.fallbackUrl;
        return;
      }
      img.style.visibility = 'hidden';
    };
  }

  function createFarmResourceCard(resource) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'farm-resource-card';
    card.setAttribute('data-ui-control', '');
    card.setAttribute('aria-label', resource.title);
    const icon = document.createElement('img');
    const price = document.createElement('span');
    price.className = 'farm-resource-price';
    const stars = document.createElement('span');
    stars.className = 'farm-resource-stars';
    for (let index = 0; index < RESOURCE_UPGRADE_MAX_STARS; index += 1) {
      const star = document.createElement('span');
      star.textContent = '\u2605';
      stars.appendChild(star);
    }
    const progress = document.createElement('span');
    progress.className = 'farm-resource-progress';
    const progressFill = document.createElement('span');
    progressFill.className = 'farm-resource-progress-fill';
    progress.appendChild(progressFill);
    const marker = document.createElement('span');
    marker.className = 'upgrade-marker hidden';
    marker.setAttribute('aria-hidden', 'true');
    setResourceImage(icon, resource);
    card.appendChild(icon);
    card.appendChild(price);
    card.appendChild(stars);
    card.appendChild(progress);
    card.appendChild(marker);
    card.addEventListener('click', () => {
      if (resource.id === 'strawberry') dismissStrawberryUpgradeHint();
      toggleResourceUpgrade(true, resource.id);
    });
    farmResourceStrip.appendChild(card);
    return { card, price, stars, progressFill, marker };
  }

  function renderFarmResourceStrip(user = getUserState()) {
    if (!farmResourceStrip) return;
    const unlockedResources = berryResources.filter((resource) =>
      user.unlockedResources[resource.id] && (!isFirstGameDay() || resource.id === 'strawberry')
    );
    const unlockedIds = new Set(unlockedResources.map((resource) => resource.id));
    const columnCount = Math.max(1, unlockedResources.length);
    const slotCount = Math.max(8, columnCount);
    const visibleSlots = isFirstGameDay() ? Math.min(3, slotCount) : columnCount;
    const availableWidth = Math.min(window.innerWidth, 500) - 12;
    farmResourceStrip.style.setProperty('--farm-resource-columns', String(columnCount));
    farmResourceStrip.style.setProperty('--farm-resource-strip-width', `${Math.max(44, availableWidth * visibleSlots / slotCount)}px`);
    farmResourceCards.forEach((entry, id) => {
      if (unlockedIds.has(id)) return;
      entry.card.remove();
      farmResourceCards.delete(id);
    });
    berryResources.forEach((resource) => {
      if (!unlockedIds.has(resource.id)) return;
      let entry = farmResourceCards.get(resource.id);
      if (!entry) {
        entry = createFarmResourceCard(resource);
        farmResourceCards.set(resource.id, entry);
      }
      entry.price.textContent = formatCompactNumber(applyProfitBonus(resource.profit, user, resource.id));
      const level = getResourceUpgradeLevel(user, resource.id);
      const stars = getResourceUpgradeStars(user, resource.id);
      const maxStars = getResourceMaxStars(resource.id);
      Array.from(entry.stars.children).forEach((star, index) => {
        star.hidden = index >= maxStars;
        star.classList.toggle('filled', index < stars);
      });
      const maxLevel = getResourceMaxLevel(resource.id);
      entry.progressFill.style.width = level >= maxLevel
        ? '100%'
        : `${((level % RESOURCE_UPGRADE_LEVELS_PER_STAR) / RESOURCE_UPGRADE_LEVELS_PER_STAR) * 100}%`;
      const canUpgrade = level < maxLevel && user.money >= getResourceUpgradeCost(resource, user);
      entry.card.classList.toggle('can-upgrade', canUpgrade);
      entry.card.classList.toggle('cannot-upgrade', !canUpgrade);
      entry.marker.classList.toggle('hidden', !canUpgrade);
    });
    renderStrawberryUpgradeHint();
  }

  function renderResourceUpgradePanel(user = getUserState()) {
    if (!resourceUpgradePanel || !activeResourceUpgradeId) return;
    const resource = berryResources.find((item) => item.id === activeResourceUpgradeId);
    if (!resource || !user.unlockedResources[resource.id]) {
      toggleResourceUpgrade(false);
      return;
    }
    const level = getResourceUpgradeLevel(user, resource.id);
    const stars = getResourceUpgradeStars(user, resource.id);
    const maxStars = getResourceMaxStars(resource.id);
    const maxLevel = getResourceMaxLevel(resource.id);
    const starMultiplier = 2 ** stars;
    const atMax = level >= maxLevel;
    setResourceImage(resourceUpgradeIcon, resource);
    resourceUpgradeLevel.textContent = `Уровень ${level + 1}`;
    resourceUpgradeName.textContent = resource.title;
    resourceUpgradeStars.replaceChildren();
    for (let index = 0; index < maxStars; index += 1) {
      const star = document.createElement('span');
      star.textContent = '★';
      if (index < stars) star.className = 'filled';
      resourceUpgradeStars.appendChild(star);
    }
    const progress = atMax ? 100 : ((level % RESOURCE_UPGRADE_LEVELS_PER_STAR) / RESOURCE_UPGRADE_LEVELS_PER_STAR) * 100;
    resourceUpgradeProgressFill.style.width = `${progress}%`;
    resourceUpgradePrice.textContent = `+${formatCompactNumber(applyProfitBonus(resource.profit, user, resource.id))}`;
    resourceUpgradeBonus.textContent = `+${getResourceUpgradeBonusPercent(user, resource.id)}% · x${starMultiplier}`;
    if (resourceUpgradeGrowth) resourceUpgradeGrowth.textContent = `Рост x${getResourceGrowthSpeedMultiplier(user, resource.id).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
    if (resourceUpgradeYield) resourceUpgradeYield.textContent = `Урожай x${getResourceYieldMultiplier(user, resource.id).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
    if (resourceUpgradeSpawn) resourceUpgradeSpawn.textContent = `Спавн x${getTerritorySpawnMultiplier().toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
    resourceUpgradeButton.disabled = atMax || user.money < getResourceUpgradeCost(resource, user);
    resourceUpgradeCost.textContent = atMax ? 'MAX' : formatCompactNumber(getResourceUpgradeCost(resource, user));
    resourceUpgradeCoin.style.display = atMax ? 'none' : '';
    if (resourceUpgradePanel.classList.contains('open')) requestAnimationFrame(positionResourceUpgradePanel);
  }

  function positionResourceUpgradePanel() {
    if (!resourceUpgradePanel || !uiRoot || !activeResourceUpgradeId) return;
    const entry = farmResourceCards.get(activeResourceUpgradeId);
    if (!entry || !entry.card) return;
    const rootRect = uiRoot.getBoundingClientRect();
    const cardRect = entry.card.getBoundingClientRect();
    const panelWidth = resourceUpgradePanel.offsetWidth;
    const panelHeight = resourceUpgradePanel.offsetHeight;
    const halfWidth = panelWidth / 2;
    const desiredCenter = cardRect.left - rootRect.left + cardRect.width / 2;
    const center = Math.max(halfWidth + 8, Math.min(rootRect.width - halfWidth - 8, desiredCenter));
    const top = Math.max(8, cardRect.top - rootRect.top - panelHeight - 14);
    const tail = Math.max(12, Math.min(panelWidth - 12, desiredCenter - center + halfWidth));
    resourceUpgradePanel.style.setProperty('--resource-panel-left', `${center}px`);
    resourceUpgradePanel.style.setProperty('--resource-panel-top', `${top}px`);
    resourceUpgradePanel.style.setProperty('--resource-panel-tail-left', `${tail}px`);
  }

  function toggleResourceUpgrade(forceOpen, resourceId = activeResourceUpgradeId) {
    if (!resourceUpgradePanel) return;
    const open = typeof forceOpen === 'boolean' ? forceOpen : !resourceUpgradePanel.classList.contains('open');
    if (open) {
      const user = getUserState();
      const resource = berryResources.find((item) => item.id === resourceId);
      if (!resource || !user.unlockedResources[resource.id]) return;
      activeResourceUpgradeId = resource.id;
      shopPanel.classList.remove('open');
      shopPanel.setAttribute('aria-hidden', 'true');
      if (inventoryPanel) {
        inventoryPanel.classList.remove('open');
        inventoryPanel.setAttribute('aria-hidden', 'true');
      }
    }
    if (open) {
      renderResourceUpgradePanel();
      positionResourceUpgradePanel();
      resourceUpgradePanel.classList.add('open');
      requestAnimationFrame(positionResourceUpgradePanel);
    } else {
      resourceUpgradePanel.classList.remove('open');
      activeResourceUpgradeId = null;
    }
    resourceUpgradePanel.setAttribute('aria-hidden', String(!open));
    syncPanelOverlay();
    renderFarmResourceStrip();
    playSound(open ? 'ui.panelOpen' : 'ui.panelClose', { volume: 0.2, cooldownMs: 80 });
  }

  function buyResourceUpgrade() {
    if (!activeResourceUpgradeId) return;
    const user = getUserState();
    const resource = berryResources.find((item) => item.id === activeResourceUpgradeId);
    if (!resource || !user.unlockedResources[resource.id]) return;
    const level = getResourceUpgradeLevel(user, resource.id);
    const cost = getResourceUpgradeCost(resource, user);
    if (level >= getResourceMaxLevel(resource.id) || user.money < cost) return;
    user.money -= cost;
    ensureResourceUpgrades(user)[resource.id] = level + 1;
    setUserState(user);
    renderResources();
    renderResourceUpgradePanel(user);
    playSound('ui.questReward', { volume: 0.3 });
    window.dispatchEvent(new CustomEvent('vibe-resource-upgraded', { detail: { id: resource.id, level: level + 1 } }));
  }

  function formatCompactNumber(value) {
    const number = Math.max(0, Math.floor(Number(value) || 0));
    if (number >= 1000000) {
      const rounded = number / 1000000;
      return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}m`;
    }
    if (number >= 1000) {
      const rounded = number / 1000;
      return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}k`;
    }
    return String(number);
  }

  function getQuestCurrent(quest, user) {
    const stats = ensureUserStats(user);
    if (quest.type === 'moneyOwned') return Math.floor(Number(user.money) || 0);
    if (quest.type === 'moneyEarned') return Math.floor(Number(stats.moneyEarned) || 0);
    if (quest.type === 'itemsCollected') return Math.floor(Number(stats.itemsCollected) || 0);
    if (quest.type === 'repairBoat') return getRepairBoatCurrent(user);
    return 0;
  }

  function getQuestIconUrl(quest) {
    if (quest && (quest.type === 'moneyEarned' || quest.type === 'moneyOwned')) return uiConfig.uiAssets.coin || {};
    if (quest && quest.type === 'repairBoat') return uiConfig.uiAssets.coin || {};
    return { url: './img/ui/inventory-bag.png' };
  }

  function getRewardIconAsset(reward) {
    if (reward && reward.type === 'rainbowStones') return uiConfig.uiAssets.rainbowStone || {};
    return uiConfig.uiAssets.coin || {};
  }

  function setUiAssetImage(img, asset) {
    if (!img) return;
    if (asset && asset.url && knownAssetUrl(asset.url)) {
      img.src = asset.url;
      img.onerror = () => {
        if (asset.fallback) img.src = asset.fallback;
      };
      return;
    }
    if (asset && asset.fallback) {
      img.src = asset.fallback;
      return;
    }
    if (asset && asset.url) {
      img.src = asset.url;
      img.onerror = () => { img.style.visibility = 'hidden'; };
      return;
    }
    img.style.visibility = 'hidden';
  }

  function buildQuestMilestones() {
    if (!questMilestones) return;
    const activeQuests = getActiveQuests();
    const signature = activeQuests.map((quest) => quest.id).join(',');
    if (questMilestones.dataset.signature === signature) return;
    questMilestones.replaceChildren();
    questMilestones.dataset.signature = signature;
    activeQuests.forEach((quest, index) => {
      const dot = document.createElement('span');
      dot.className = 'quest-milestone';
      dot.style.left = `${activeQuests.length === 1 ? 100 : ((index + 0.5) / activeQuests.length) * 100}%`;
      dot.dataset.questId = quest.id;
      questMilestones.appendChild(dot);
    });
  }

  function positionQuestPointer(index) {
    if (!questPointer || !questCard || !questMilestones) return;
    const dot = questMilestones.children[index];
    questPointer.hidden = !dot;
    if (!dot) return;
    requestAnimationFrame(() => {
      if (!questCard.classList.contains('open')) return;
      const cardRect = questCard.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();
      const x = Math.min(cardRect.width - 20, Math.max(20, dotRect.left + dotRect.width / 2 - cardRect.left));
      questCard.style.setProperty('--quest-pointer-x', `${x}px`);
    });
  }

  function applyQuestReward(user, reward) {
    const amount = Math.max(0, Math.floor(Number(reward && reward.amount) || 0));
    if (!amount) return;
    if (reward.type === 'rainbowStones') {
      user.rainbowStones = Math.max(0, Math.floor(Number(user.rainbowStones) || 0)) + amount;
      return;
    }
    user.money = Math.max(0, Math.floor(Number(user.money) || 0)) + amount;
    addMoneyEarnedStat(user, amount);
  }

  function claimQuestReward() {
    const user = getUserState();
    const questState = ensureQuestState(user);
    const activeQuests = getActiveQuests();
    const index = questState.index;
    const quest = activeQuests[index];
    if (!quest) return;
    const current = getQuestCurrent(quest, user);
    const target = quest.type === 'repairBoat' ? getRepairBoatTarget() : Math.max(1, Math.floor(Number(quest.target) || 1));
    if (current < target) return;
    if (isFirstGameDay()) {
      localStorage.setItem(GAME_DAY_KEY, '2');
      user.questLine = { index: 0, mode: 'normal', updatedAt: Date.now() };
      setUserState(user);
      playSound('ui.questReward', { volume: 0.32 });
      window.dispatchEvent(new CustomEvent('vibe-day-changed', { detail: { day: 2 } }));
      renderResources();
      renderInventory();
      renderQuestLine();
      return;
    }
    if (quest.type === 'repairBoat') {
      if (!isLighthouseOpened() || user.money < BOAT_REPAIR_COST) return;
      user.money = Math.max(0, Math.floor(Number(user.money) || 0) - BOAT_REPAIR_COST);
      user.unlockedResources['repair-boat-upgrade'] = true;
      questState.index = Math.min(index + 1, QUESTS.length);
      questState.updatedAt = Date.now();
      setUserState(user);
      localStorage.setItem(BOAT_REPAIR_REQUEST_KEY, String(Date.now()));
      window.dispatchEvent(new CustomEvent('vibe-boat-repair'));
      renderResources();
      renderInventory();
      renderQuestLine();
      playSound('ui.questReward', { volume: 0.32 });
      return;
    }
    applyQuestReward(user, quest.reward);
    questState.index = Math.min(index + 1, activeQuests.length);
    questState.updatedAt = Date.now();
    setUserState(user);
    renderResources();
    renderInventory();
    renderQuestLine();
    playSound('ui.questReward', { volume: 0.32 });
  }

  function renderQuestLine() {
    buildQuestMilestones();
    const user = getUserState();
    const questState = ensureQuestState(user);
    const activeQuests = getActiveQuests();
    const index = questState.index;
    const quest = activeQuests[index];
    const done = !quest;
    const repairLocked = Boolean(quest && quest.type === 'repairBoat' && !isLighthouseOpened());
    const target = quest ? (quest.type === 'repairBoat' ? getRepairBoatTarget() : Math.max(1, Math.floor(Number(quest.target) || 1))) : 1;
    const current = quest ? getQuestCurrent(quest, user) : target;
    const progress = done ? 1 : Math.min(1, current / target);
    const claimReady = !done && progress >= 1 && !repairLocked;
    const totalProgress = activeQuests.length ? ((Math.min(index, activeQuests.length) + progress) / activeQuests.length) * 100 : 100;

    if (questStage) {
      questStage.textContent = `day ${getGameDay()}`;
    }
    if (questTrackFill) questTrackFill.style.width = `${Math.min(100, Math.max(0, totalProgress))}%`;
    if (questMilestones) {
      Array.from(questMilestones.children).forEach((dot, dotIndex) => {
        dot.classList.toggle('done', dotIndex < index || done);
        dot.classList.toggle('current', dotIndex === index && !done);
        dot.classList.toggle('ready', dotIndex === index && claimReady);
      });
    }
    positionQuestPointer(done ? -1 : index);
    if (isFirstGameDay() && claimReady) {
      claimQuestReward();
      return;
    }

    if (!questCard || !questTitle) return;
    if (questToggle) {
      questToggle.hidden = done || isFirstGameDay();
      questToggle.classList.toggle('reward-ready', claimReady);
    }
    questCard.classList.toggle('finished', done);
    questCard.classList.toggle('complete', claimReady);
    questCard.hidden = done;

    if (done) {
      setUiAssetImage(questIcon, uiConfig.uiAssets.rainbowStone || {});
      questTitle.textContent = 'Все задания выполнены';
      if (questProgressFill) questProgressFill.style.width = '100%';
      if (questProgressText) questProgressText.textContent = '';
      return;
    }

    questCard.hidden = false;
    setUiAssetImage(questIcon, getQuestIconUrl(quest));
    if (quest.type === 'repairBoat') {
      questTitle.textContent = repairLocked ? `расширьте остров до ⌀ ${LIGHTHOUSE_REQUIRED_METERS} м` : 'починить катер';
    } else {
      questTitle.textContent = progress >= 1 ? (isFirstGameDay() ? 'Начать День 2' : 'Награда') : quest.title;
    }
    if (questProgressFill) questProgressFill.style.width = `${Math.round(progress * 100)}%`;
    if (questProgressText) {
      questProgressText.textContent = repairLocked
        ? `⌀ ${formatCompactNumber(Math.min(current, target))}/${formatCompactNumber(target)} м`
        : `${formatCompactNumber(Math.min(current, target))}/${formatCompactNumber(target)}`;
    }
    if (questReward) questReward.style.display = quest.type === 'repairBoat' || isFirstGameDay() ? 'none' : '';
    if (quest.type !== 'repairBoat' && !isFirstGameDay()) {
      if (questRewardIcon) setUiAssetImage(questRewardIcon, getRewardIconAsset(quest.reward));
      if (questRewardValue) questRewardValue.textContent = `x${formatCompactNumber(quest.reward && quest.reward.amount)}`;
    }
  }

  function applyDayUiState() {
    const firstDay = isFirstGameDay();
    if (gameShell) gameShell.classList.toggle('first-day', firstDay);
    if (firstDay && questCard) {
      questCard.classList.remove('open');
      if (questToggle) questToggle.classList.remove('visible');
    }
  }

  let dayTitleTimer = 0;
  let movementHintTimer = 0;
  let movementHintHideTimer = 0;

  function dismissMovementHint(markSeen = true) {
    window.clearTimeout(movementHintTimer);
    window.clearTimeout(movementHintHideTimer);
    if (markSeen) localStorage.setItem(MOVEMENT_HINT_SEEN_KEY, '1');
    if (!movementHint || movementHint.hidden) return;
    movementHint.classList.add('hiding');
    window.setTimeout(() => {
      movementHint.hidden = true;
      movementHint.classList.remove('hiding');
      movementHint.setAttribute('aria-hidden', 'true');
      renderStrawberryUpgradeHint();
    }, 220);
  }

  function showMovementHint() {
    if (!movementHint || !isFirstGameDay() || localStorage.getItem(MOVEMENT_HINT_SEEN_KEY) === '1') return;
    const loading = loadingScreen && !loadingScreen.hidden && !loadingScreen.classList.contains('done');
    const introOpen = introComic && !introComic.hidden;
    const dayTitleOpen = dayTitleOverlay && dayTitleOverlay.classList.contains('open');
    if (loading || introOpen || dayTitleOpen) {
      movementHintTimer = window.setTimeout(showMovementHint, 300);
      return;
    }
    movementHint.hidden = false;
    movementHint.setAttribute('aria-hidden', 'false');
    movementHintHideTimer = window.setTimeout(() => dismissMovementHint(true), 9000);
  }

  function scheduleMovementHint(delay = 300) {
    window.clearTimeout(movementHintTimer);
    movementHintTimer = window.setTimeout(showMovementHint, delay);
  }

  function dismissStrawberryUpgradeHint() {
    if (!strawberryUpgradeHint) return;
    localStorage.setItem(STRAWBERRY_UPGRADE_HINT_SEEN_KEY, '1');
    strawberryUpgradeHint.hidden = true;
    strawberryUpgradeHint.setAttribute('aria-hidden', 'true');
  }

  function positionStrawberryUpgradeHint() {
    if (!strawberryUpgradeHint || strawberryUpgradeHint.hidden || !gameShell) return;
    const entry = farmResourceCards.get('strawberry');
    if (!entry || !entry.card) return;
    const shellRect = gameShell.getBoundingClientRect();
    const cardRect = entry.card.getBoundingClientRect();
    const left = cardRect.left - shellRect.left + cardRect.width / 2 - strawberryUpgradeHint.offsetWidth / 2;
    const top = cardRect.top - shellRect.top - strawberryUpgradeHint.offsetHeight + 5;
    strawberryUpgradeHint.style.left = `${Math.max(5, Math.min(shellRect.width - strawberryUpgradeHint.offsetWidth - 5, left))}px`;
    strawberryUpgradeHint.style.top = `${Math.max(5, top)}px`;
  }

  function renderStrawberryUpgradeHint() {
    if (!strawberryUpgradeHint || localStorage.getItem(STRAWBERRY_UPGRADE_HINT_SEEN_KEY) === '1') return;
    const entry = farmResourceCards.get('strawberry');
    const blocked = (loadingScreen && !loadingScreen.hidden && !loadingScreen.classList.contains('done'))
      || (introComic && !introComic.hidden)
      || (dayTitleOverlay && dayTitleOverlay.classList.contains('open'))
      || (movementHint && !movementHint.hidden);
    const shouldShow = Boolean(entry && entry.card.classList.contains('can-upgrade') && !blocked);
    strawberryUpgradeHint.hidden = !shouldShow;
    strawberryUpgradeHint.setAttribute('aria-hidden', String(!shouldShow));
    if (shouldShow) requestAnimationFrame(positionStrawberryUpgradeHint);
  }

  function showDayTitle(day, subtitle = '') {
    if (!dayTitleOverlay || !dayTitleText || !dayTitleSubtitle) return;
    window.clearTimeout(dayTitleTimer);
    dayTitleSubtitle.textContent = subtitle;
    dayTitleText.textContent = `День ${day}`;
    dayTitleOverlay.classList.add('open');
    dayTitleTimer = window.setTimeout(() => {
      dayTitleOverlay.classList.remove('open');
      scheduleMovementHint();
      renderStrawberryUpgradeHint();
    }, 1850);
  }

  let introFinished = false;
  let introCanContinue = false;
  let introFinishTimer = 0;
  let introMusicAudio = null;
  let introMusicStartedAt = 0;

  function startIntroMusic() {
    if (introMusicAudio) return introMusicAudio;
    introMusicAudio = playSound('music.intro', { volume: 0.22 });
    if (introMusicAudio) introMusicStartedAt = performance.now();
    return introMusicAudio;
  }

  function stopIntroMusic(minimumPlayMs = 0) {
    if (!introMusicAudio) return;
    const audio = introMusicAudio;
    const delay = Math.max(0, minimumPlayMs - (performance.now() - introMusicStartedAt));
    introMusicAudio = null;
    introMusicStartedAt = 0;
    window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, delay);
  }

  function finishIntroComic() {
    if (introFinished || !introCanContinue || !introComic || introComic.hidden) return;
    introFinished = true;
    window.clearTimeout(introFinishTimer);
    stopIntroMusic(2200);
    introComic.classList.add('finishing');
    localStorage.setItem('dayOneIntroSeen', '1');
    showDayTitle(1);
    window.setTimeout(() => {
      introComic.hidden = true;
      introComic.classList.remove('finishing');
    }, 720);
  }

  function startIntroComic() {
    if (!introComic || !isFirstGameDay() || localStorage.getItem('dayOneIntroSeen') === '1') return false;
    introFinished = false;
    introCanContinue = false;
    introComic.hidden = false;
    introComic.classList.remove('ready');
    Array.from(introComic.querySelectorAll('.intro-comic-panel')).forEach((panel) => panel.classList.remove('visible'));
    startIntroMusic();
    Array.from(introComic.querySelectorAll('.intro-comic-panel')).forEach((panel, index) => {
      window.setTimeout(() => {
        panel.classList.add('visible');
        playSound('ui.introSlide', { volume: 0.22, playbackRate: 0.96 + index * 0.04 });
      }, index * 1100);
    });
    window.setTimeout(() => {
      introCanContinue = true;
      introComic.classList.add('ready');
    }, 4000);
    introFinishTimer = window.setTimeout(finishIntroComic, 10000);
    return true;
  }

  function handleIntroClick() {
    if (!introCanContinue) {
      startIntroMusic();
      playSound('ui.introSlide', { volume: 0.18 });
      return;
    }
    startIntroMusic();
    finishIntroComic();
  }

  function handleGameReady() {
    if (!startIntroComic()) scheduleMovementHint();
  }

  function renderResources() {
    const preserveScroll = Boolean(shopPanel && shopPanel.classList.contains('open'));
    const previousScrollTop = preserveScroll && resourceList ? resourceList.scrollTop : 0;
    const user = getUserState();
    applyDayUiState();
    renderIslandSizeMeters();
    moneyValue.textContent = user.money;
    if (gemValue) gemValue.textContent = formatCompactNumber(user.rainbowStones);
    const islandMeters = getIslandSizeMeters();
    let canUpgrade = false;
    const pendingResources = resources
      .filter((res) => isResourceVisibleForCurrentDay(res) && !user.unlockedResources[res.id])
      .map((res) => ({ res, lockInfo: getResourceLockInfo(res, user, islandMeters) }))
      .sort((a, b) => {
        const aGroup = a.lockInfo.expansionLocked ? 1 : 0;
        const bGroup = b.lockInfo.expansionLocked ? 1 : 0;
        if (aGroup !== bGroup) return aGroup - bGroup;
        if (a.lockInfo.expansionLocked && b.lockInfo.expansionLocked) {
          const reqDiff = a.lockInfo.expansionRequiredMeters - b.lockInfo.expansionRequiredMeters;
          if (reqDiff !== 0) return reqDiff;
        }
        const costDiff = a.res.unlockCost - b.res.unlockCost;
        if (costDiff !== 0) return costDiff;
        return String(a.res.title).localeCompare(String(b.res.title));
      });

    resources.forEach((res) => {
      const hidden = !isResourceVisibleForCurrentDay(res);
      const unlocked = !!user.unlockedResources[res.id];
      if (unlocked || hidden) {
        const existing = resourceCards.get(res.id);
        if (existing && existing.lockDivider && existing.lockDivider.parentNode) existing.lockDivider.parentNode.removeChild(existing.lockDivider);
        if (existing && existing.card && existing.card.parentNode) existing.card.parentNode.removeChild(existing.card);
        resourceCards.delete(res.id);
      }
    });

    let lastExpansionRequirement = 0;
    pendingResources.forEach(({ res, lockInfo }) => {
      if (lockInfo.canBuy) canUpgrade = true;
      let entry = resourceCards.get(res.id);
      if (!entry) {
        entry = createResourceCard(res);
        resourceCards.set(res.id, entry);
      }
      const className = lockInfo.canBuy
        ? 'resource-card available clickable'
        : (lockInfo.expansionLocked ? 'resource-card expansion-locked' : 'resource-card locked');
      entry.card.className = className;
      if (entry.detail && res.category === 'boatRepair') {
        entry.detail.textContent = lockInfo.expansionLocked ? 'И уплыть с острова' : 'Отправиться к новому острову';
      }
      entry.label.textContent = formatCompactNumber(res.unlockCost);
      entry.button.className = 'unlock-button' + (lockInfo.canBuy ? '' : (lockInfo.expansionLocked ? ' expansion-locked' : ' locked'));
      entry.button.disabled = !lockInfo.canBuy;
      entry.button.style.display = 'flex';
      entry.check.style.display = 'none';
      const showDivider = lockInfo.expansionLocked && lockInfo.expansionRequiredMeters !== lastExpansionRequirement;
      if (entry.lockDivider) {
        if (showDivider) {
          entry.lockLabel.textContent = `Расширьте остров до ⌀ ${lockInfo.expansionRequiredMeters} м`;
          resourceList.appendChild(entry.lockDivider);
          lastExpansionRequirement = lockInfo.expansionRequiredMeters;
        } else if (entry.lockDivider.parentNode) {
          entry.lockDivider.parentNode.removeChild(entry.lockDivider);
        }
      }
      resourceList.appendChild(entry.card);
    });
    upgradeMarker.classList.toggle('hidden', !canUpgrade);
    if (preserveScroll && resourceList) resourceList.scrollTop = previousScrollTop;
    renderFarmResourceStrip(user);
    if (resourceUpgradePanel && resourceUpgradePanel.classList.contains('open')) renderResourceUpgradePanel(user);
  }

  function renderPlayerProgress() {
    const user = getUserState();
    const player = ensurePlayerProgress(user);
    const needed = getXpNeededForLevel(player.level);
    const xp = Math.min(player.xp, needed);
    if (playerLevel) playerLevel.textContent = String(player.level);
    if (playerXpFill) playerXpFill.style.width = `${Math.round((xp / needed) * 100)}%`;
    if (playerXpText) playerXpText.textContent = `${xp}/${needed}`;
  }

  function getInventoryTotal(user) {
    const inventory = user.inventory || {};
    return Object.values(inventory).reduce((sum, count) => {
      const value = Number(count) || 0;
      return sum + Math.max(0, Math.floor(value));
    }, 0);
  }

  function getInventoryCount(inventory, id) {
    return Math.max(0, Math.floor(Number(inventory && inventory[id]) || 0));
  }

  function createInventoryIcon(item, className) {
    const img = document.createElement('img');
    img.className = className || '';
    img.alt = item.titleRu || item.id || '';
    img.src = knownAssetUrl(item.assetUrl) || item.assetUrl || '';
    img.onerror = () => { img.style.visibility = 'hidden'; };
    return img;
  }

  function appendGearSlot(parent, inventory, slotDef) {
    const slot = document.createElement('div');
    slot.className = `gear-slot ${slotDef.className || ''}`;
    slot.setAttribute('data-ui-control', '');
    const item = inventoryItems.find((entry) => entry.id === slotDef.itemId);
    const count = item ? getInventoryCount(inventory, item.id) : 0;
    if (item && count > 0) {
      slot.title = item.titleRu || item.id;
      slot.appendChild(createInventoryIcon(item));
      const badge = document.createElement('span');
      badge.className = 'gear-slot-badge';
      badge.textContent = count > 9 ? '9+' : String(count);
      slot.appendChild(badge);
    } else {
      slot.classList.add('empty');
    }
    parent.appendChild(slot);
  }

  function appendBagSlot(parent, item, count) {
    const slot = document.createElement('div');
    slot.className = 'bag-slot';
    slot.setAttribute('data-ui-control', '');
    if (item && count > 0) {
      slot.title = item.titleRu || item.id;
      slot.appendChild(createInventoryIcon(item));
      const badge = document.createElement('span');
      badge.className = 'bag-slot-count';
      badge.textContent = count > 99 ? '99+' : String(count);
      slot.appendChild(badge);
    } else {
      slot.classList.add('empty');
    }
    parent.appendChild(slot);
  }

  function renderInventory() {
    const user = getUserState();
    const inventory = user.inventory || {};
    const total = getInventoryTotal(user);
    if (inventoryBadge) {
      inventoryBadge.textContent = String(total);
      inventoryBadge.classList.toggle('hidden', total <= 0);
    }
    if (!inventoryList) return;

    inventoryList.innerHTML = '';
    const gear = document.createElement('div');
    gear.className = 'inventory-gear';
    gear.setAttribute('data-ui-control', '');

    const character = document.createElement('div');
    character.className = 'inventory-character';
    const hero = document.createElement('img');
    hero.alt = 'hero';
    hero.src = heroPortrait && heroPortrait.src ? heroPortrait.src : './img/ui/hero-portrait.png';
    character.appendChild(hero);
    gear.appendChild(character);

    [
      { itemId: 'axe', className: 'gear-slot-weapon' },
      { itemId: 'nail-puller', className: 'gear-slot-tool' },
      { itemId: 'kettle', className: 'gear-slot-utility' },
      { itemId: '', className: 'gear-slot-bag' },
      { itemId: '', className: 'gear-slot-water' },
      { itemId: '', className: 'gear-slot-rare' },
    ].forEach((slotDef) => appendGearSlot(gear, inventory, slotDef));
    inventoryList.appendChild(gear);

    const tabs = document.createElement('div');
    tabs.className = 'inventory-tabs';
    ['Farming', 'Dungeon'].forEach((label, index) => {
      const tab = document.createElement('div');
      tab.className = `inventory-tab${index ? ' inactive' : ''}`;
      tab.textContent = label;
      tabs.appendChild(tab);
    });
    inventoryList.appendChild(tabs);

    const sort = document.createElement('div');
    sort.className = 'inventory-sort';
    ['By Level', 'Collection', 'Merge'].forEach((label, index) => {
      const button = document.createElement('div');
      button.className = `inventory-sort-button${index === 0 ? ' active' : ''}`;
      button.textContent = label;
      sort.appendChild(button);
    });
    inventoryList.appendChild(sort);

    const grid = document.createElement('div');
    grid.className = 'inventory-bag-grid';
    const visibleResourceItems = inventoryItems.filter((item) => item.resourceCategory && getInventoryCount(inventory, item.id) > 0);
    const visibleOtherItems = inventoryItems.filter((item) => !item.resourceCategory && getInventoryCount(inventory, item.id) > 0);
    const bagItems = [...visibleResourceItems, ...visibleOtherItems];
    const slotCount = Math.max(25, Math.ceil(Math.max(1, bagItems.length) / 5) * 5);
    for (let i = 0; i < slotCount; i += 1) {
      const item = bagItems[i];
      appendBagSlot(grid, item, item ? getInventoryCount(inventory, item.id) : 0);
    }
    inventoryList.appendChild(grid);
    return;

    const visibleItems = inventoryItems.filter((item) => Math.max(0, Math.floor(Number(inventory[item.id]) || 0)) > 0);
    if (!visibleItems.length) {
      const empty = document.createElement('div');
      empty.className = 'inventory-empty';
      empty.textContent = 'Пока пусто';
      inventoryList.appendChild(empty);
      return;
    }

    visibleItems.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'inventory-item';
      row.setAttribute('data-ui-control', '');

      const icon = document.createElement('img');
      icon.alt = item.titleRu || item.id;
      icon.src = knownAssetUrl(item.assetUrl) || item.assetUrl || '';
      icon.onerror = () => { icon.style.visibility = 'hidden'; };

      const title = document.createElement('span');
      title.textContent = item.titleRu || item.id;

      const count = document.createElement('strong');
      count.textContent = `x${Math.max(0, Math.floor(Number(inventory[item.id]) || 0))}`;

      row.appendChild(icon);
      row.appendChild(title);
      row.appendChild(count);
      inventoryList.appendChild(row);
    });
  }

  function getInventoryItemInfo(detail) {
    if (!detail || !detail.id) return null;
    const configured = inventoryItems.find((item) => item.id === detail.id) || {};
    return {
      id: detail.id,
      titleRu: detail.titleRu || configured.titleRu || detail.id,
      assetUrl: detail.assetUrl || configured.assetUrl || '',
      widthPx: Number.isFinite(detail.widthPx) ? detail.widthPx : (Number.isFinite(configured.widthPx) ? configured.widthPx : 48),
      heightPx: Number.isFinite(detail.heightPx) ? detail.heightPx : (Number.isFinite(configured.heightPx) ? configured.heightPx : 48),
      dropUid: detail.dropUid,
      startX: Number.isFinite(detail.startX) ? detail.startX : null,
      startY: Number.isFinite(detail.startY) ? detail.startY : null,
    };
  }

  function addInventoryItem(id) {
    if (!id) return;
    const user = getUserState();
    if (!user.inventory || typeof user.inventory !== 'object') user.inventory = {};
    user.inventory[id] = Math.max(0, Number(user.inventory[id]) || 0) + 1;
    addItemCollectedStat(user, id, 1);
    setUserState(user);
    localStorage.setItem('inventoryUpdatedAt', String(Date.now()));
    renderInventory();
  }

  let activeFinding = null;
  let findingSettledTimer = null;

  function clearFindingTimer() {
    if (!findingSettledTimer) return;
    clearTimeout(findingSettledTimer);
    findingSettledTimer = null;
  }

  function showFindingItem(rawDetail) {
    const detail = getInventoryItemInfo(rawDetail);
    if (!detail || !findingOverlay || !findingItem || !findingTitle || !findingOk) return;
    activeFinding = detail;
    clearFindingTimer();
    togglePanel(false);
    toggleInventory(false);
    localStorage.setItem(PENDING_FOUND_ITEM_KEY, JSON.stringify(detail));

    const overlayRect = findingOverlay.getBoundingClientRect();
    const itemW = Math.max(88, Math.min(150, detail.widthPx * 2.45));
    const itemH = Math.max(88, Math.min(150, detail.heightPx * 2.45));
    const fromX = (detail.startX === null ? overlayRect.width * 0.5 : detail.startX - overlayRect.left) - itemW / 2;
    const fromY = (detail.startY === null ? overlayRect.height * 0.5 : detail.startY - overlayRect.top) - itemH / 2;
    const centerX = overlayRect.width * 0.5 - itemW / 2;
    const centerY = overlayRect.height * 0.4 - itemH / 2;

    findingTitle.textContent = `находка: ${detail.titleRu}`;
    findingItem.alt = detail.titleRu;
    findingItem.src = knownAssetUrl(detail.assetUrl) || detail.assetUrl || '';
    findingItem.style.width = `${itemW}px`;
    findingItem.style.height = `${itemH}px`;
    findingItem.style.transition = 'none';
    findingItem.style.opacity = '0';
    findingItem.style.transform = `translate(${fromX}px, ${fromY}px) scale(0.45)`;
    findingOk.disabled = true;

    findingOverlay.classList.remove('settled');
    findingOverlay.classList.add('open');
    findingOverlay.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      findingItem.style.transition = 'transform 0.62s cubic-bezier(.18,.84,.26,1), opacity 0.24s ease';
      findingItem.style.opacity = '1';
      findingItem.style.transform = `translate(${centerX}px, ${centerY}px) scale(1.18)`;
      findingSettledTimer = setTimeout(() => {
        findingOverlay.classList.add('settled');
        findingOk.disabled = false;
      }, 620);
    });
  }

  function hideFindingOverlay() {
    findingOverlay.classList.remove('open', 'settled');
    findingOverlay.setAttribute('aria-hidden', 'true');
    findingItem.style.opacity = '0';
    activeFinding = null;
    clearFindingTimer();
  }

  function finishFindingItem() {
    if (!activeFinding || !findingOverlay || !findingItem || !inventoryButton) return;
    const detail = activeFinding;
    findingOk.disabled = true;
    findingOverlay.classList.remove('settled');

    const overlayRect = findingOverlay.getBoundingClientRect();
    const targetRect = inventoryButton.getBoundingClientRect();
    const itemRect = findingItem.getBoundingClientRect();
    const targetX = targetRect.left - overlayRect.left + targetRect.width / 2 - itemRect.width / 2;
    const targetY = targetRect.top - overlayRect.top + targetRect.height / 2 - itemRect.height / 2;
    findingItem.style.transition = 'transform 0.48s cubic-bezier(.45,0,.2,1), opacity 0.48s ease';
    findingItem.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.28)`;
    findingItem.style.opacity = '0.85';

    setTimeout(() => {
      addInventoryItem(detail.id);
      localStorage.removeItem(PENDING_FOUND_ITEM_KEY);
      window.dispatchEvent(new CustomEvent('vibe-found-item-complete', { detail }));
      hideFindingOverlay();
    }, 500);
  }

  function syncPanelOverlay() {
    const shopOpen = shopPanel.classList.contains('open');
    const inventoryOpen = inventoryPanel && inventoryPanel.classList.contains('open');
    panelOverlay.classList.toggle('open', shopOpen || inventoryOpen);
  }

  function toggleInventory(forceOpen) {
    if (!inventoryPanel) return;
    const open = typeof forceOpen === 'boolean' ? forceOpen : !inventoryPanel.classList.contains('open');
    if (open) {
      shopPanel.classList.remove('open');
      shopPanel.setAttribute('aria-hidden', 'true');
      if (resourceUpgradePanel) {
        resourceUpgradePanel.classList.remove('open');
        resourceUpgradePanel.setAttribute('aria-hidden', 'true');
        activeResourceUpgradeId = null;
      }
    }
    inventoryPanel.classList.toggle('open', open);
    inventoryPanel.setAttribute('aria-hidden', String(!open));
    syncPanelOverlay();
    if (open) renderInventory();
    playSound(open ? 'ui.panelOpen' : 'ui.panelClose', { volume: 0.2, cooldownMs: 80 });
  }

  function focusCheapestLocked() {
    const user = getUserState();
    const cheapest = resources.find((res) => !user.unlockedResources[res.id]);
    if (!cheapest) return;
    const entry = resourceCards.get(cheapest.id);
    if (!entry) return;
    const card = entry.card;
    const styles = getComputedStyle(resourceList);
    const gapValue = parseFloat(styles.rowGap || styles.gap || 0);
    const offset = Math.max(0, card.offsetTop - card.offsetHeight - (Number.isFinite(gapValue) ? gapValue : 0));
    resourceList.scrollTop = offset;
  }

  function togglePanel(forceOpen) {
    const open = typeof forceOpen === 'boolean' ? forceOpen : !shopPanel.classList.contains('open');
    if (open && inventoryPanel) {
      inventoryPanel.classList.remove('open');
      inventoryPanel.setAttribute('aria-hidden', 'true');
    }
    if (open && resourceUpgradePanel) {
      resourceUpgradePanel.classList.remove('open');
      resourceUpgradePanel.setAttribute('aria-hidden', 'true');
      activeResourceUpgradeId = null;
    }
    shopPanel.classList.toggle('open', open);
    shopPanel.setAttribute('aria-hidden', String(!open));
    syncPanelOverlay();
    if (open) {
      renderResources();
      requestAnimationFrame(focusCheapestLocked);
    }
    playSound(open ? 'ui.panelOpen' : 'ui.panelClose', { volume: 0.2, cooldownMs: 80 });
  }

  function renderAudioSettings() {
    if (!window.VibeAudio) return;
    const update = (button, muted) => {
      if (!button) return;
      button.classList.toggle('off', muted);
      const state = button.querySelector('.settings-state');
      if (state) state.textContent = muted ? 'выкл' : 'вкл';
    };
    update(soundToggle, window.VibeAudio.isEffectsMuted && window.VibeAudio.isEffectsMuted());
    update(musicToggle, window.VibeAudio.isMusicMuted && window.VibeAudio.isMusicMuted());
  }

  function toggleSettings(forceOpen) {
    if (!settingsPanel) return;
    const open = typeof forceOpen === 'boolean' ? forceOpen : !settingsPanel.classList.contains('open');
    settingsPanel.classList.toggle('open', open);
    settingsPanel.setAttribute('aria-hidden', String(!open));
    if (open) renderAudioSettings();
  }

  shopButton.addEventListener('click', () => togglePanel());
  closePanel.addEventListener('click', () => togglePanel(false));
  if (inventoryButton) inventoryButton.addEventListener('click', () => toggleInventory());
  if (closeInventory) closeInventory.addEventListener('click', () => toggleInventory(false));
  if (closeResourceUpgrade) closeResourceUpgrade.addEventListener('click', () => toggleResourceUpgrade(false));
  if (resourceUpgradeButton) resourceUpgradeButton.addEventListener('click', buyResourceUpgrade);
  if (settingsButton) settingsButton.addEventListener('click', () => toggleSettings());
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (!window.VibeAudio || !window.VibeAudio.setEffectsMuted) return;
      window.VibeAudio.setEffectsMuted(!window.VibeAudio.isEffectsMuted());
      renderAudioSettings();
    });
  }
  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (!window.VibeAudio || !window.VibeAudio.setMusicMuted) return;
      window.VibeAudio.setMusicMuted(!window.VibeAudio.isMusicMuted());
      renderAudioSettings();
    });
  }
  if (findingOk) findingOk.addEventListener('click', finishFindingItem);
  if (questClaim) {
    questClaim.addEventListener('click', (event) => {
      event.stopPropagation();
      claimQuestReward();
    });
  }
  const setQuestCardOpen = (open) => {
    if (!questCard || !questToggle) return;
    questCard.classList.toggle('open', open);
    questToggle.classList.toggle('visible', !open);
    questToggle.setAttribute('aria-expanded', String(open));
    if (open) requestAnimationFrame(renderQuestLine);
  };
  if (questCard) {
    questCard.addEventListener('click', (event) => {
      if (event.target.closest('#questCollapse')) return;
      if (questCard.classList.contains('complete')) claimQuestReward();
    });
  }
  if (questCollapse) {
    questCollapse.addEventListener('click', (event) => {
      event.stopPropagation();
      if (questCard && questCard.classList.contains('complete')) claimQuestReward();
      setQuestCardOpen(false);
    });
  }
  if (questToggle && questCard) {
    questToggle.addEventListener('click', () => setQuestCardOpen(true));
  }
  if (introComic) introComic.addEventListener('click', handleIntroClick);
  window.addEventListener('vibe-game-ready', handleGameReady);
  window.addEventListener('vibe-day-changed', (event) => {
    const day = Math.max(1, Math.floor(Number(event.detail && event.detail.day) || getGameDay()));
    togglePanel(false);
    toggleInventory(false);
    toggleResourceUpgrade(false);
    if (day > 1) setQuestCardOpen(true);
    showDayTitle(day, event.detail && event.detail.subtitle ? event.detail.subtitle : '');
    renderResources();
    renderQuestLine();
  });
  window.addEventListener('vibe-found-item', (event) => showFindingItem(event.detail || {}));
  window.addEventListener('vibe-map-changed', () => {
    renderResources();
    renderQuestLine();
  });
  panelOverlay.addEventListener('click', () => {
    togglePanel(false);
    toggleInventory(false);
    toggleResourceUpgrade(false);
  });
  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (movementHint && !movementHint.hidden && target.closest('#pixiMount canvas')) {
      dismissMovementHint();
    }
    if (settingsPanel && settingsPanel.classList.contains('open') && !target.closest('#settingsPanel,#settingsButton')) {
      toggleSettings(false);
    }
    if (!resourceUpgradePanel || !resourceUpgradePanel.classList.contains('open')) return;
    if (target.closest('#resourceUpgradePanel,.farm-resource-card')) return;
    toggleResourceUpgrade(false);
  }, true);
  idleClose.addEventListener('click', hideIdlePanel);
  idleOverlay.addEventListener('click', hideIdlePanel);

  applyIdleIncome();
  setLastActiveAt();
  renderResources();
  renderPlayerProgress();
  renderInventory();
  renderQuestLine();
  if (loadingScreen?.hidden) handleGameReady();
  try {
    const pendingFinding = JSON.parse(localStorage.getItem(PENDING_FOUND_ITEM_KEY) || 'null');
    if (pendingFinding && pendingFinding.id) setTimeout(() => showFindingItem(pendingFinding), 300);
  } catch (err) {
    localStorage.removeItem(PENDING_FOUND_ITEM_KEY);
  }
  setInterval(() => {
    renderResources();
    renderPlayerProgress();
    renderInventory();
    renderQuestLine();
  }, 400);
  window.addEventListener('storage', () => {
    renderResources();
    renderPlayerProgress();
    renderInventory();
    renderQuestLine();
  });
  window.addEventListener('resize', () => {
    renderQuestLine();
    positionResourceUpgradePanel();
    positionStrawberryUpgradeHint();
  });
  window.addEventListener('pagehide', setLastActiveAt);
  window.addEventListener('beforeunload', setLastActiveAt);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') setLastActiveAt();
  });
})();
