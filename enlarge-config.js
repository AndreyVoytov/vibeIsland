/* enlarge-config.js */
(function (global) {
  const expansions = [
    { id: 'expand-1', titleRu: 'Расширение острова I', unlockCost: 1000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-2', titleRu: 'Расширение острова II', unlockCost: 2000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-3', titleRu: 'Расширение острова III', unlockCost: 3000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-4', titleRu: 'Расширение острова IV', unlockCost: 5000, expandBy: 1, surfaceColor: '#1f8a3a' },
    { id: 'expand-5', titleRu: 'Расширение острова V', unlockCost: 7000, expandBy: 1 },
  ];

  global.EnlargeConfig = {
    expansions,
  };
})(window);
