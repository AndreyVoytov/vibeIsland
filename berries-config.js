/* berries-config.js */
(function (global) {
  /** @type {{id:string,titleRu:string,assetUrl:string,widthPx:number,heightPx:number,primitive:{base:string,highlight:string}}[]} */
  const berries = [
    {
      id: 'strawberry',
      titleRu: 'Клубника',
      assetUrl: './img/berry/1.png',
      widthPx: 28,
      heightPx: 28,
      primitive: { base: '#e11', highlight: 'rgba(255,255,255,0.65)' },
    },
    {
      id: 'blueberry',
      titleRu: 'Черника',
      assetUrl: './img/berry/2.png',
      widthPx: 24,
      heightPx: 24,
      primitive: { base: '#2d44ff', highlight: 'rgba(255,255,255,0.55)' },
    },
    {
      id: 'raspberry',
      titleRu: 'Малина',
      assetUrl: './img/berry/1.png',
      widthPx: 26,
      heightPx: 26,
      primitive: { base: '#ff2a6a', highlight: 'rgba(255,255,255,0.55)' },
    },
    // {
      // id: 'blackberry',
      // titleRu: 'Ежевика',
      // assetUrl: './images/berries/blackberry.png',
      // widthPx: 24,
      // heightPx: 24,
      // primitive: { base: '#3a1f6b', highlight: 'rgba(255,255,255,0.5)' },
    // },
    // {
      // id: 'cranberry',
      // titleRu: 'Клюква',
      // assetUrl: './images/berries/cranberry.png',
      // widthPx: 22,
      // heightPx: 22,
      // primitive: { base: '#c01616', highlight: 'rgba(255,255,255,0.55)' },
    // },
    // {
      // id: 'gooseberry',
      // titleRu: 'Крыжовник',
      // assetUrl: './images/berries/gooseberry.png',
      // widthPx: 24,
      // heightPx: 24,
      // primitive: { base: '#7cc943', highlight: 'rgba(255,255,255,0.5)' },
    // },
    // {
      // id: 'redcurrant',
      // titleRu: 'Красная смородина',
      // assetUrl: './images/berries/redcurrant.png',
      // widthPx: 22,
      // heightPx: 22,
      // primitive: { base: '#ff1f2e', highlight: 'rgba(255,255,255,0.55)' },
    // },
    // {
      // id: 'cloudberry',
      // titleRu: 'Морошка',
      // assetUrl: './images/berries/cloudberry.png',
      // widthPx: 24,
      // heightPx: 24,
      // primitive: { base: '#ffb21a', highlight: 'rgba(255,255,255,0.6)' },
    // },
    // {
      // id: 'elderberry',
      // titleRu: 'Бузина',
      // assetUrl: './images/berries/elderberry.png',
      // widthPx: 22,
      // heightPx: 22,
      // primitive: { base: '#221a3a', highlight: 'rgba(255,255,255,0.5)' },
    // },
    // {
      // id: 'rowan',
      // titleRu: 'Рябина',
      // assetUrl: './images/berries/rowan.png',
      // widthPx: 22,
      // heightPx: 22,
      // primitive: { base: '#ff5a1f', highlight: 'rgba(255,255,255,0.55)' },
    // },
  ];

  /** Веса ресурсов (пока все = 1) */
  function getResourceWeight(index) {
    return 1;
  }

  global.BerriesConfig = {
    berries,
    getResourceWeight,
  };
})(window);
