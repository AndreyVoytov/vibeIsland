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
      colliderRadius: 2,
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
      colliderRadius: 2,
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
      colliderRadius: 2,
      primitive: {
        kind: 'drill',
        base: '#2f3a4a',
        accent: '#59687a',
        marker,
      },
    })),
  ];

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
    const gridStep = 4;
    const islandWidth = bounds.maxX - bounds.minX + 1;
    const islandHeight = bounds.maxY - bounds.minY + 1;
    const maxGridRadius = Math.max(
      1,
      Math.floor(Math.max(islandWidth, islandHeight) / gridStep),
    );

    const placed = [];
    const used = new Set();
    const rest = buildings.filter((item) => item.id !== 'campfire');

    function isValidCell(x, y) {
      if (!map[y] || !map[y][x]) return false;
      if (x === center.x || y === center.y) return false;
      const key = `${x},${y}`;
      return !used.has(key);
    }

    function claimCell(x, y) {
      used.add(`${x},${y}`);
      return { x, y };
    }

    function getOrderedGridOffsets(radius) {
      if (radius !== 1) {
        const offsets = [];
        for (let gy = -radius; gy <= radius; gy += 1) {
          for (let gx = -radius; gx <= radius; gx += 1) {
            if (Math.max(Math.abs(gx), Math.abs(gy)) !== radius) continue;
            offsets.push({ gx, gy });
          }
        }
        return offsets;
      }
      return [
        { gx: -1, gy: -1 },
        { gx: 1, gy: -1 },
        { gx: 1, gy: 1 },
        { gx: -1, gy: 1 },
        { gx: 0, gy: -1 },
        { gx: 1, gy: 0 },
        { gx: 0, gy: 1 },
        { gx: -1, gy: 0 },
      ];
    }

    function getGridPositions() {
      const positions = [];
      for (let radius = 1; radius <= maxGridRadius; radius += 1) {
        const offsets = getOrderedGridOffsets(radius);
        offsets.forEach(({ gx, gy }) => {
          const x = center.x + gx * gridStep;
          const y = center.y + gy * gridStep;
          if (isValidCell(x, y)) {
            positions.push(claimCell(x, y));
          }
        });
      }
      return positions;
    }

    placed.push({ id: 'campfire', x: center.x, y: center.y });
    used.add(`${center.x},${center.y}`);

    const gridPositions = getGridPositions();
    rest.forEach((item, index) => {
      const spot = gridPositions[index];
      if (spot) placed.push({ id: item.id, x: spot.x, y: spot.y });
    });

    return placed;
  }

  global.BuildingsConfig = {
    buildings,
    getBuildingLayout,
  };
})(window);
