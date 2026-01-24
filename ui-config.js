/* ui-config.js */
(function (global) {
  const svgDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const uiAssets = {
    coin: {
      url: './img/ui/coin.png',
      fallback: svgDataUri(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
          "<defs><radialGradient id='g' cx='0.3' cy='0.3'>" +
          "<stop offset='0' stop-color='#ffe88a'/>" +
          "<stop offset='1' stop-color='#f2b312'/>" +
          '</radialGradient></defs>' +
          "<circle cx='32' cy='32' r='28' fill='url(#g)' stroke='#c48900' stroke-width='4'/>" +
          "<circle cx='32' cy='32' r='16' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='4'/>" +
          '</svg>'
      ),
    },
    cart: {
      url: './img/ui/cart.png',
      fallback: svgDataUri(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
          "<rect x='8' y='18' width='40' height='24' rx='6' fill='#ffffff' stroke='#222' stroke-width='4'/>" +
          "<path d='M6 12h10l6 28h30' fill='none' stroke='#222' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/>" +
          "<circle cx='24' cy='50' r='5' fill='#222'/>" +
          "<circle cx='46' cy='50' r='5' fill='#222'/>" +
          '</svg>'
      ),
    },
    check: {
      url: './img/ui/check.png',
      fallback: svgDataUri(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
          "<circle cx='32' cy='32' r='30' fill='#28b463'/>" +
          "<path d='M18 34l9 9 20-22' fill='none' stroke='#fff' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/>" +
          '</svg>'
      ),
    },
    arrowUp: {
      url: './img/ui/arrow-up.png',
      fallback: svgDataUri(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
          "<circle cx='32' cy='32' r='28' fill='#1ec971'/>" +
          "<path d='M32 14l16 18h-10v18h-12V32H16z' fill='#ffffff'/>" +
          '</svg>'
      ),
    },
  };

  const resourceEconomy = [
    { id: 'strawberry', profit: 1, unlockCost: 0 },
    { id: 'blueberry', profit: 2, unlockCost: 10 },
    { id: 'raspberry', profit: 3, unlockCost: 50 },
    { id: 'champignon', profit: 4, unlockCost: 250 },
    { id: 'beet', profit: 5, unlockCost: 1250 },
  ];

  global.UIConfig = {
    uiAssets,
    resourceEconomy,
  };
})(window);
