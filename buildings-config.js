/* buildings-config.js */
(function (global) {
  const drillMarkers = [
    '#ff6b6b', '#ff9f1c', '#ffd93d', '#6bcB77', '#4d96ff',
    '#845ec2', '#f368e0', '#00c9a7', '#ff9671', '#c34a36',
  ];

  const buildings = [
    {
      id: 'campfire',
      titleRu: 'Костёр',
      assetUrl: './img/building/campfire.png',
      unlockCost: 0,
      collider: false,
      colliderRadius: 2,
      defaultUnlocked: true,
      primitive: {
        kind: 'campfire',
        base: '#5b4636',
        stone: '#6e7a86',
        flame: '#ff8a3d',
        glow: 'rgba(255,165,90,0.55)',
      },
    },
    {
      id: 'campfire-upgrade-1',
      titleRu: 'Костёр II',
      assetUrl: './img/building/campfire2.png',
      unlockCost: 1500,
      collider: false,
      colliderRadius: 2.2,
      campfireUpgrade: true,
      detail: 'Апгрейд костра',
      primitive: {
        kind: 'campfire',
        base: '#6a4f3d',
        stone: '#808a96',
        flame: '#ff9f4a',
        glow: 'rgba(255,180,110,0.6)',
      },
    },
    {
      id: 'campfire-upgrade-2',
      titleRu: 'Костёр III',
      assetUrl: '',
      unlockCost: 2500,
      collider: false,
      colliderRadius: 2.4,
      campfireUpgrade: true,
      detail: 'Апгрейд костра',
      primitive: {
        kind: 'campfire',
        base: '#75533f',
        stone: '#8a96a3',
        flame: '#ffb057',
        glow: 'rgba(255,195,130,0.62)',
      },
    },
    {
      id: 'campfire-upgrade-3',
      titleRu: 'Костёр IV',
      assetUrl: '',
      unlockCost: 4500,
      collider: false,
      colliderRadius: 2.6,
      campfireUpgrade: true,
      detail: 'Апгрейд костра',
      primitive: {
        kind: 'campfire',
        base: '#815944',
        stone: '#99a3ae',
        flame: '#ffc066',
        glow: 'rgba(255,210,150,0.65)',
      },
    },
    {
      id: 'whetstone',
      titleRu: 'Точильный камень',
      assetUrl: './img/building/whetstone.png',
      unlockCost: 500,
      collider: true,
      colliderRadius: 1,
      primitive: { kind: 'whetstone', base: '#9da3aa', edge: '#dfe5ec', accent: '#6e747c' },
    },
    {
      id: 'forge',
      titleRu: 'Кузница',
      assetUrl: './img/building/forge.png',
      unlockCost: 1000,
      collider: true,
      colliderRadius: 1,
      primitive: { kind: 'forge', base: '#5b3b2d', metal: '#c0c7cf', roof: '#343a40', fire: '#ff7a35' },
    },

    ...drillMarkers.map((marker, index) => ({
      id: `drill-${index + 1}`,
      titleRu: `Дрель ${index + 1}`,
      assetUrl: `./img/building/drill-${index + 1}.png`,
      unlockCost: 1500 + index * 500,
      collider: true,
      colliderRadius: 1,
      primitive: { kind: 'drill', base: '#2f3a4a', accent: '#59687a', marker },
    })),
  ];

  // Сдвиг для совместимости с твоей старой логикой (оставляем как было)
  const layoutOffset = { x: -0.5, y: -0.5 };

  function collectLandCells(map) {
    const cells = [];
    for (let y = 0; y < map.length; y += 1) {
      const row = map[y] || [];
      for (let x = 0; x < row.length; x += 1) {
        if (!row[x]) continue;
        cells.push({ x, y });
      }
    }
    return cells;
  }

  function medianSorted(sorted) {
    if (!sorted.length) return 0;
    return sorted[Math.floor(sorted.length / 2)];
  }

  function findNearestLand(map, sx, sy) {
    if (map[sy]?.[sx]) return { x: sx, y: sy };

    const H = map.length;
    const W = map[0]?.length || 0;
    const maxR = Math.max(W, H);

    for (let r = 1; r <= maxR; r += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        const y1 = sy + dy;
        if (y1 < 0 || y1 >= H) continue;

        const dx = r - Math.abs(dy);

        const xA = sx - dx;
        if (xA >= 0 && xA < W && map[y1]?.[xA]) return { x: xA, y: y1 };

        const xB = sx + dx;
        if (xB >= 0 && xB < W && map[y1]?.[xB]) return { x: xB, y: y1 };
      }
    }
    return null;
  }

  /**
   * Центр "ядра" острова:
   * 1) берём медианы x/y (почти не реагируют на выступы)
   * 2) отрезаем дальние 30% клеток по расстоянию и усредняем оставшиеся
   * 3) если попали в воду — переносим в ближайшую землю
   */
  function getCoreIslandCenter(map) {
    const cells = collectLandCells(map);
    if (!cells.length) return null;

    const xs = cells.map(c => c.x).sort((a, b) => a - b);
    const ys = cells.map(c => c.y).sort((a, b) => a - b);
    const mx = medianSorted(xs);
    const my = medianSorted(ys);

    const keepN = Math.max(20, Math.floor(cells.length * 0.7));
    const core = cells
      .map(c => {
        const dx = c.x - mx;
        const dy = c.y - my;
        return { x: c.x, y: c.y, d: dx * dx + dy * dy };
      })
      .sort((a, b) => a.d - b.d)
      .slice(0, keepN);

    let sx = 0, sy = 0;
    for (const c of core) { sx += c.x; sy += c.y; }
    let cx = Math.round(sx / core.length);
    let cy = Math.round(sy / core.length);

    if (!map[cy]?.[cx]) {
      const near = findNearestLand(map, cx, cy);
      if (near) { cx = near.x; cy = near.y; }
    }
    return { x: cx, y: cy };
  }

  function getBuildingLayout(map) {
    if (!Array.isArray(map) || !map.length) return [];

    const center = getCoreIslandCenter(map);
    if (!center) return [];

    const placed = [];
    const rest = buildings.filter((item) => item.id !== 'campfire' && !item.campfireUpgrade);

    const getRadius = (def) => {
      const radius = Number.isFinite(def?.colliderRadius) ? def.colliderRadius : 1;
      return Math.max(1, Math.round(radius));
    };

    const campfireDef = buildings.find((item) => item.id === 'campfire');
    const campfireRadius = getRadius(campfireDef);

    // Костёр всегда в центре ядра острова
    placed.push({ id: 'campfire', x: center.x, y: center.y, radius: campfireRadius });

    // Сетка слотов вокруг костра (как было)
    const layoutGrid = [
      [13, 9, 6, 14],
      [5, 1, 2, 10],
      [12, 4, 3, 7],
      [16, 8, 11, 15],
    ];
    const spacing = 4;
    const midGap = 3;
    const rowOffsets = [0, spacing, spacing + midGap, spacing + midGap + spacing];

    const colCount = layoutGrid[0]?.length || 0;
    const rowCount = layoutGrid.length;

    const layoutWidth = spacing * Math.max(0, colCount - 1);
    const layoutHeight = rowOffsets.length
      ? rowOffsets[rowOffsets.length - 1]
      : spacing * Math.max(0, rowCount - 1);

    const startX = center.x - Math.round(layoutWidth / 2);
    const startY = center.y - Math.round(layoutHeight / 2);

    const slotByNumber = new Map();
    layoutGrid.forEach((row, rowIndex) => {
      row.forEach((slotNumber, colIndex) => {
        const x = startX + spacing * colIndex;
        const baseY = startY + (rowOffsets[rowIndex] ?? spacing * rowIndex);
        const y = baseY > center.y ? baseY + 2 : baseY;

        if (!map[y] || !map[y][x]) return; // ставим только на землю
        slotByNumber.set(slotNumber, { x, y });
      });
    });

    const orderedSlots = Array.from({ length: 16 }, (_, index) => slotByNumber.get(index + 1)).filter(Boolean);

    rest.forEach((item, index) => {
      const spot = orderedSlots[index];
      if (!spot) return;
      const radius = getRadius(item);
      placed.push({ id: item.id, x: spot.x, y: spot.y, radius });
    });

    // финальный offset (как было)
    return placed.map(({ id, x, y }) => ({
      id,
      x: x + layoutOffset.x,
      y: y + layoutOffset.y,
    }));
  }

  global.BuildingsConfig = { buildings, getBuildingLayout, layoutOffset };
})(window);
