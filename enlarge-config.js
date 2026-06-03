/* enlarge-config.js */
(function (global) {
  const expansions = [
    { id: 'expand-1', titleRu: 'Расширение острова I', unlockCost: 1000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-2', titleRu: 'Расширение острова II', unlockCost: 2000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-3', titleRu: 'Расширение острова III', unlockCost: 3000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-4', titleRu: 'Расширение острова IV', unlockCost: 5000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-5', titleRu: 'Мертвые земли I', unlockCost: 7000, expandBy: 1, surfaceType: 'dead', surfaceColor: '#6f684a' },
    { id: 'expand-6', titleRu: 'Мертвые земли II', unlockCost: 7500, expandBy: 1, surfaceType: 'dead', surfaceColor: '#6f684a' },
    { id: 'expand-7', titleRu: 'Мертвые земли III', unlockCost: 8000, expandBy: 1, surfaceType: 'dead', surfaceColor: '#6f684a' },
    { id: 'expand-8', titleRu: 'Мертвые земли IV', unlockCost: 8500, expandBy: 1, surfaceType: 'dead', surfaceColor: '#6f684a' },
    { id: 'expand-9', titleRu: 'Снежная земля I', unlockCost: 9000, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
    { id: 'expand-10', titleRu: 'Снежная земля II', unlockCost: 9500, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
    { id: 'expand-11', titleRu: 'Снежная земля III', unlockCost: 10000, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
    { id: 'expand-12', titleRu: 'Снежная земля IV', unlockCost: 10500, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
    { id: 'expand-13', titleRu: 'Снежная земля V', unlockCost: 11000, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
    { id: 'expand-14', titleRu: 'Снежная земля VI', unlockCost: 11500, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
    { id: 'expand-15', titleRu: 'Снежная земля VII', unlockCost: 12000, expandBy: 1, surfaceType: 'snow', surfaceColor: '#dff4ff' },
  ];

  global.EnlargeConfig = {
    expansions,
  };
})(window);
