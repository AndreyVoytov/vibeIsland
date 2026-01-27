/* scenario-objects-config.js */
(function (global) {
  const objects = [
    {
      id: 'plane-wing',
      titleRu: 'Обломок крыла',
      distanceCells: 3,
      direction: 'east',
      assetUrl: './images/scenario/plane-wing.png',
      fallbackUrl: './images/scenario/plane-wing-fallback.svg',
      widthPx: 90,
      heightPx: 48,
      colliderRadius: 1,
      triggerRadiusCells: 3,
      dialog: [
        'Крыло… значит, самолёт точно упал здесь.',
        'Нужно собраться. Я один, но остров живой.',
      ],
    },
    {
      id: 'suitcase',
      titleRu: 'Чемодан',
      distanceCells: 3,
      direction: 'southEast',
      assetUrl: './images/scenario/suitcase.png',
      fallbackUrl: './images/scenario/suitcase-fallback.svg',
      widthPx: 72,
      heightPx: 54,
      colliderRadius: 1,
      triggerRadiusCells: 3,
      dialog: [
        'Чемодан уцелел. Внутри — немного сухих вещей.',
        'Если найду ещё обломки, может быть, соберу укрытие.',
      ],
    },
    {
      id: 'wood-crate',
      titleRu: 'Деревянный ящик',
      distanceCells: 5,
      direction: 'south',
      assetUrl: './images/scenario/wood-crate.png',
      fallbackUrl: './images/scenario/wood-crate-fallback.svg',
      widthPx: 70,
      heightPx: 50,
      colliderRadius: 1,
      triggerRadiusCells: 3,
      dialog: [
        'Ящик с припасами… или это всё, что осталось от груза.',
        'Придётся собирать всё полезное по крупицам.',
      ],
    },
    {
      id: 'lifebuoy',
      titleRu: 'Спасательный круг',
      distanceCells: 7,
      direction: 'west',
      assetUrl: './images/scenario/lifebuoy.png',
      fallbackUrl: './images/scenario/lifebuoy-fallback.svg',
      widthPx: 70,
      heightPx: 70,
      colliderRadius: 1,
      triggerRadiusCells: 3,
      dialog: [
        'Круг уцелел. Значит, кого-то ещё могло вынести на берег.',
        'Надо осмотреть остров.',
      ],
    },
    {
      id: 'message-bottle',
      titleRu: 'Бутылка',
      distanceCells: 10,
      direction: 'northWest',
      assetUrl: './images/scenario/message-bottle.png',
      fallbackUrl: './images/scenario/message-bottle-fallback.svg',
      widthPx: 68,
      heightPx: 46,
      colliderRadius: 1,
      triggerRadiusCells: 3,
      dialog: [
        'В бутылке старые записи. Этот остров уже видел выживших…',
        'Значит, есть шанс найти следы помощи.',
      ],
    },
    {
      id: 'lighthouse',
      titleRu: 'Старый маяк',
      distanceCells: 14,
      direction: 'north',
      assetUrl: './images/scenario/lighthouse-off.png',
      fallbackUrl: './images/scenario/lighthouse-off-fallback.svg',
      transformOnApproach: {
        assetUrl: './images/scenario/lighthouse-on.png',
        fallbackUrl: './images/scenario/lighthouse-on-fallback.svg',
      },
      widthPx: 90,
      heightPx: 140,
      colliderRadius: 1,
      triggerRadiusCells: 4,
      dialog: [
        'Старый маяк… Если бы он горел, меня бы заметили.',
        'Попробую оживить свет — вдруг кто-то увидит сигнал.',
      ],
    },
  ];

  global.ScenarioObjectsConfig = {
    objects,
  };
})(window);
