/* buildings-config.js */
(function (global) {
  const drillMarkers = [
    '#ff6b6b',
    '#ff9f1c',
    '#ffd93d',
    '#6bcB77',
    '#4d96ff',
    '#845ec2',
    '#f368e0',
    '#00c9a7',
    '#ff9671',
    '#c34a36',
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
      id: 'whetstone',
      titleRu: 'Точильный камень',
      assetUrl: './img/building/whetstone.png',
      unlockCost: 500,
      collider: true,
      colliderRadius: 1,
      primitive: {
        kind: 'whetstone',
        base: '#9da3aa',
        edge: '#dfe5ec',
        accent: '#6e747c',
      },
    },
    {
      id: 'forge',
      titleRu: 'Кузница',
      assetUrl: './img/building/forge.png',
      unlockCost: 1000,
      collider: true,
      colliderRadius: 1,
      primitive: {
        kind: 'forge',
        base: '#5b3b2d',
        metal: '#c0c7cf',
        roof: '#343a40',
        fire: '#ff7a35',
      },
    },
    ...drillMarkers.map((marker, index) => ({
      id: `drill-${index + 1}`,
      titleRu: `Дрель ${index + 1}`,
      assetUrl: `./img/building/drill-${index + 1}.png`,
      unlockCost: 1500 + index * 500,
      collider: true,
      colliderRadius: 1,
      primitive: {
        kind: 'drill',
        base: '#2f3a4a',
        accent: '#59687a',
        marker,
      },
    })),
  ];

  const layoutOffset = { x: -0.5, y: -0.5 };

  function getIslandBounds(map) {
    const bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };
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
    if (!Number.isFinite(bounds.minX)) {
      return null;
    }
    return bounds;
  }

  function getBuildingLayout(map) {
    if (!Array.isArray(map) || !map.length) return [];
    const bounds = getIslandBounds(map);
    if (!bounds) return [];

    const center = {
      x: Math.round((bounds.minX + bounds.maxX) / 2),
      y: Math.round((bounds.minY + bounds.maxY) / 2),
    };
    const placed = [];
    const rest = buildings.filter((item) => item.id !== 'campfire');

    const getRadius = (def) => {
      const radius = Number.isFinite(def?.colliderRadius) ? def.colliderRadius : 1;
      return Math.max(1, Math.round(radius));
    };

    const campfireDef = buildings.find((item) => item.id === 'campfire');
    const campfireRadius = getRadius(campfireDef);
    placed.push({ id: 'campfire', x: center.x, y: center.y, radius: campfireRadius });

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
    const layoutHeight = rowOffsets.length ? rowOffsets[rowOffsets.length - 1] : spacing * Math.max(0, rowCount - 1);
    const startX = center.x - Math.round(layoutWidth / 2);
    const startY = center.y - Math.round(layoutHeight / 2);
    const slotByNumber = new Map();

    layoutGrid.forEach((row, rowIndex) => {
      row.forEach((slotNumber, colIndex) => {
        const x = startX + spacing * colIndex;
        const baseY = startY + (rowOffsets[rowIndex] ?? spacing * rowIndex);
        const y = baseY > center.y ? baseY + 2 : baseY;
        if (!map[y] || !map[y][x]) return;
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

    return placed.map(({ id, x, y }) => ({
      id,
      x: x + layoutOffset.x,
      y: y + layoutOffset.y,
    }));
  }

  global.BuildingsConfig = {
    buildings,
    getBuildingLayout,
    layoutOffset,
  };
})(window);
