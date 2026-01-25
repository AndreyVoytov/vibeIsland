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

    placed.push({ id: 'campfire', x: center.x, y: center.y });

    const quadrants = {
      nw: [],
      ne: [],
      se: [],
      sw: [],
    };

    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
      const row = map[y] || [];
      for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
        if (!row[x]) continue;
        if (x === center.x || y === center.y) continue;
        const dx = x - center.x;
        const dy = y - center.y;
        const dist = Math.hypot(dx, dy);
        if (dx < 0 && dy < 0) quadrants.nw.push({ x, y, dist });
        else if (dx > 0 && dy < 0) quadrants.ne.push({ x, y, dist });
        else if (dx > 0 && dy > 0) quadrants.se.push({ x, y, dist });
        else if (dx < 0 && dy > 0) quadrants.sw.push({ x, y, dist });
      }
    }

    const compareDistance = (a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    };

    Object.values(quadrants).forEach((list) => list.sort(compareDistance));

    const quadrantOrder = ['nw', 'ne', 'se', 'sw'];
    let quadrantIndex = 0;

    rest.forEach((item) => {
      for (let attempts = 0; attempts < quadrantOrder.length; attempts += 1) {
        const quadrantKey = quadrantOrder[quadrantIndex];
        quadrantIndex = (quadrantIndex + 1) % quadrantOrder.length;
        const spot = quadrants[quadrantKey].shift();
        if (spot) {
          placed.push({ id: item.id, x: spot.x, y: spot.y });
          break;
        }
      }
    });

    return placed;
  }

  global.BuildingsConfig = {
    buildings,
    getBuildingLayout,
  };
})(window);
