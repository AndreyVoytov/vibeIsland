(function () {
  const uiConfig = window.UIConfig || { uiAssets: {} };
  const berryConfig = window.BerriesConfig || { berries: [] };
  const buildingConfig = window.BuildingsConfig || { buildings: [] };
  const enlargeConfig = window.EnlargeConfig || { expansions: [] };
  const scenarioConfig = window.ScenarioObjectsConfig || { objects: [] };
  const scenarioById = new Map((scenarioConfig.objects || []).map((obj) => [obj.id, obj]));
  const inventoryItems = Array.isArray(berryConfig.inventoryItems) ? berryConfig.inventoryItems : [];
  const KNOWN_LOCAL_ASSETS = new Set([
    './img/berry/1.png',
    './img/berry/strawberry.png',
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
    return '#2fb84b';
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
      const stored = JSON.parse(localStorage.getItem('scenarioObjectsState') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (err) {
      return [];
    }
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

  const berryResources = (berryConfig.berries || []).map((def, index) => {
    const profit = typeof def.profit === 'number' ? def.profit : index + 1;
    return {
      id: def.id,
      title: def.titleRu || def.id,
      assetUrl: knownAssetUrl(def.assetUrl),
      fallbackUrl: buildResourceFallback(def),
      profit,
      unlockCost: typeof def.unlockCost === 'number' ? def.unlockCost : 0,
      detail: `Прибыль: +${profit}`,
    };
  });

  const buildingDefinitions = buildingConfig.buildings || [];
  const buildingById = new Map(buildingDefinitions.map((item) => [item.id, item]));
  const buildingResources = buildingDefinitions.map((def) => ({
    id: def.id,
    title: def.titleRu || def.id,
    assetUrl: knownAssetUrl(def.assetUrl),
    unlockCost: typeof def.unlockCost === 'number' ? def.unlockCost : 0,
    detail: def.detail || 'Постройка',
    fallbackUrl: buildBuildingFallback(def),
    category: 'building',
  }));

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
      const result = expandIsland(current, getExpansionSurfaceValue(def));
      localStorage.setItem('mapShift', JSON.stringify(result.shift || { x: 0, y: 0 }));
      localStorage.setItem('map', JSON.stringify(result.map));
      const expansionLevel = Number(localStorage.getItem('islandExpansionLevel') || '0');
      const nextLevel = Number.isFinite(expansionLevel) ? Math.max(0, Math.floor(expansionLevel) + 1) : 1;
      localStorage.setItem('islandExpansionLevel', String(nextLevel));
      localStorage.setItem('islandWiggleAt', String(Date.now()));
      window.dispatchEvent(new CustomEvent('vibe-map-changed'));
    },
  }));

  const resources = [...berryResources, ...buildingResources, ...expansionResources].sort((a, b) => {
    const diff = a.unlockCost - b.unlockCost;
    if (diff !== 0) return diff;
    return String(a.title).localeCompare(String(b.title));
  });

  const moneyValue = document.getElementById('moneyValue');
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
  const upgradeMarker = document.getElementById('upgradeMarker');
  const resourceCards = new Map();
  const EXPANSION_DELAY_MS = 1500;
  const PENDING_FOUND_ITEM_KEY = 'pendingFoundItem';

  function setImageWithFallback(img, key) {
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
  setImageWithFallback(document.getElementById('cartIcon'), 'cart');
  setImageWithFallback(document.getElementById('arrowIcon'), 'arrowUp');
  if (inventoryIcon) inventoryIcon.src = knownAssetUrl('./img/ui/inventory-bag.png') || './img/ui/inventory-bag.png';

  function getUserState() {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (err) {
      user = {};
    }
    if (typeof user.money !== 'number' || Number.isNaN(user.money)) user.money = 0;
    if (!user.unlockedResources || typeof user.unlockedResources !== 'object') user.unlockedResources = {};
    if (!user.inventory || typeof user.inventory !== 'object' || Array.isArray(user.inventory)) user.inventory = {};
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

  function getHeroState() {
    try {
      const hero = JSON.parse(localStorage.getItem('heroState') || '{}');
      if (typeof hero.charXPct !== 'number' || typeof hero.charYPct !== 'number') return null;
      return hero;
    } catch (err) {
      return null;
    }
  }

  function getMostExpensiveResourceProfit() {
    let chosen = null;
    berryResources.forEach((res) => {
      if (!chosen || res.unlockCost > chosen.unlockCost) chosen = res;
    });
    return chosen ? chosen.profit : 0;
  }

  const WORLD_ZOOM = 1.265;
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
    const baseProfit = getMostExpensiveResourceProfit();
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

  function attemptUnlock(res) {
    const latest = getUserState();
    if (latest.unlockedResources[res.id]) return false;
    if (latest.money < res.unlockCost) return false;
    latest.money -= res.unlockCost;
    latest.unlockedResources[res.id] = true;
    setUserState(latest);
    const isExpansion = res.category === 'expansion';
    if (isExpansion) togglePanel(false);
    maybeTeleportHeroFromBuilding(res);
    if (typeof res.onUnlock === 'function') {
      if (isExpansion) setTimeout(() => res.onUnlock(), EXPANSION_DELAY_MS);
      else res.onUnlock();
    }
    renderResources();
    return true;
  }

  function createResourceCard(res) {
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
    return { card, button, label, check };
  }

  function renderResources() {
    const user = getUserState();
    moneyValue.textContent = user.money;
    let canUpgrade = false;
    resources.forEach((res) => {
      const unlocked = !!user.unlockedResources[res.id];
      const canBuy = user.money >= res.unlockCost && !unlocked;
      if (canBuy) canUpgrade = true;
      let entry = resourceCards.get(res.id);
      if (!entry) {
        entry = createResourceCard(res);
        resourceCards.set(res.id, entry);
      }
      entry.card.className = 'resource-card ' + (unlocked ? 'unlocked' : canBuy ? 'available clickable' : 'locked');
      entry.label.textContent = res.unlockCost;
      entry.button.className = 'unlock-button' + (canBuy ? '' : ' locked');
      entry.button.disabled = !canBuy;
      entry.button.style.display = unlocked ? 'none' : 'flex';
      entry.check.style.display = unlocked ? 'block' : 'none';
    });
    upgradeMarker.classList.toggle('hidden', !canUpgrade);
  }

  function getInventoryTotal(user) {
    const inventory = user.inventory || {};
    return Object.values(inventory).reduce((sum, count) => {
      const value = Number(count) || 0;
      return sum + Math.max(0, Math.floor(value));
    }, 0);
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
    }
    inventoryPanel.classList.toggle('open', open);
    inventoryPanel.setAttribute('aria-hidden', String(!open));
    syncPanelOverlay();
    if (open) renderInventory();
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
    shopPanel.classList.toggle('open', open);
    shopPanel.setAttribute('aria-hidden', String(!open));
    syncPanelOverlay();
    if (open) {
      renderResources();
      requestAnimationFrame(focusCheapestLocked);
    }
  }

  shopButton.addEventListener('click', () => togglePanel());
  closePanel.addEventListener('click', () => togglePanel(false));
  if (inventoryButton) inventoryButton.addEventListener('click', () => toggleInventory());
  if (closeInventory) closeInventory.addEventListener('click', () => toggleInventory(false));
  if (findingOk) findingOk.addEventListener('click', finishFindingItem);
  window.addEventListener('vibe-found-item', (event) => showFindingItem(event.detail || {}));
  panelOverlay.addEventListener('click', () => {
    togglePanel(false);
    toggleInventory(false);
  });
  idleClose.addEventListener('click', hideIdlePanel);
  idleOverlay.addEventListener('click', hideIdlePanel);

  applyIdleIncome();
  setLastActiveAt();
  renderResources();
  renderInventory();
  try {
    const pendingFinding = JSON.parse(localStorage.getItem(PENDING_FOUND_ITEM_KEY) || 'null');
    if (pendingFinding && pendingFinding.id) setTimeout(() => showFindingItem(pendingFinding), 300);
  } catch (err) {
    localStorage.removeItem(PENDING_FOUND_ITEM_KEY);
  }
  setInterval(() => {
    renderResources();
    renderInventory();
  }, 400);
  window.addEventListener('storage', () => {
    renderResources();
    renderInventory();
  });
  window.addEventListener('pagehide', setLastActiveAt);
  window.addEventListener('beforeunload', setLastActiveAt);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') setLastActiveAt();
  });
})();
