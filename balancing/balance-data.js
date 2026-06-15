const TARGET_DAY_MINUTES = {
  2: 10,
  3: 30,
  4: 60,
  5: 120,
};

const REPAIR_COSTS = {
  boat: { money: 2000000, wood: 0 },
  raft: { money: 2400000, wood: 18000 },
  fishingBoat: { money: 6000000, wood: 35000 },
};

const DAY_QUESTS = {
  2: [
    { id: 'day-2-earn-50k', type: 'moneyEarned', target: 50000 },
    { id: 'day-2-collect-160', type: 'itemsCollected', target: 160 },
    { id: 'day-2-earn-320k', type: 'moneyEarned', target: 320000 },
    { id: 'day-2-collect-350', type: 'itemsCollected', target: 350 },
    { id: 'day-2-earn-700k', type: 'moneyEarned', target: 700000 },
    { id: 'day-2-collect-550', type: 'itemsCollected', target: 550 },
    { id: 'day-2-earn-1-15m', type: 'moneyEarned', target: 1150000 },
    { id: 'day-2-collect-800', type: 'itemsCollected', target: 800 },
    { id: 'day-2-earn-1-65m', type: 'moneyEarned', target: 1650000 },
    { id: 'day-2-repair-boat', type: 'repairBoat', repair: 'boat' },
  ],
  3: [
    { id: 'day-3-earn-150k', type: 'moneyEarned', target: 150000 },
    { id: 'day-3-collect-2200', type: 'itemsCollected', target: 2200 },
    { id: 'day-3-earn-600k', type: 'moneyEarned', target: 600000 },
    { id: 'day-3-collect-4800', type: 'itemsCollected', target: 4800 },
    { id: 'day-3-earn-1-2m', type: 'moneyEarned', target: 1200000 },
    { id: 'day-3-collect-7200', type: 'itemsCollected', target: 7200 },
    { id: 'day-3-earn-1-9m', type: 'moneyEarned', target: 1900000 },
    { id: 'day-3-collect-10000', type: 'itemsCollected', target: 10000 },
    { id: 'day-3-build-raft', type: 'repairBoat', repair: 'raft' },
  ],
  4: [
    { id: 'day-4-kill-wolves', type: 'killEnemy', target: 450, stat: 'wolf' },
    { id: 'day-4-kill-wolf-boss', type: 'killEnemy', target: 1, stat: 'wolfBoss' },
    { id: 'day-4-kill-snow-zombie', type: 'killEnemy', target: 1, stat: 'snowZombie' },
    { id: 'day-4-reveal-hatch', type: 'storyAction' },
  ],
  5: [
    { id: 'day-5-repair-fishing-boat', type: 'repairBoat', repair: 'fishingBoat' },
  ],
};

const DAY_MODELS = {
  2: {
    finalEarned: 1550000,
    finalItems: 1050,
    moneyCurve: 1.48,
    itemCurve: 1.18,
    woodAtTarget: 0,
  },
  3: {
    finalEarned: 2700000,
    finalItems: 11200,
    moneyCurve: 1.35,
    itemCurve: 1.08,
    woodAtTarget: 21000,
    sawmillProgress: 0.5,
    sawmillCost: 50000,
  },
  4: {
    finalKills: 930,
    killCurve: 1.08,
    finalEarned: 900000,
    finalItems: 3200,
  },
  5: {
    finalEarned: 6600000,
    finalItems: 18000,
    moneyCurve: 1.16,
    itemCurve: 1.05,
    woodAtTarget: 39000,
  },
};

const DAY2_UPGRADE_ORDER = [
  { id: 'blueberry', cost: 3000, kind: 'resource', incomeBonus: 0.05 },
  { id: 'raspberry', cost: 30000, kind: 'resource', incomeBonus: 0.08 },
  { id: 'expand-1', cost: 80000, kind: 'expansion', incomeBonus: 0.10 },
  { id: 'champignon', cost: 140000, kind: 'resource', incomeBonus: 0.11 },
  { id: 'upgrade-mushroom-sense', cost: 180000, kind: 'profitUpgrade', after: 'champignon', incomeBonus: 0.08 },
  { id: 'campfire-upgrade-2', cost: 220000, kind: 'campfire', incomeBonus: 0.10 },
  { id: 'beet', cost: 240000, kind: 'resource', incomeBonus: 0.09 },
  { id: 'expand-2', cost: 240000, kind: 'expansion', incomeBonus: 0.10 },
  { id: 'radish', cost: 380000, kind: 'resource', incomeBonus: 0.08 },
  { id: 'expand-3', cost: 400000, kind: 'expansion', incomeBonus: 0.10 },
  { id: 'upgrade-root-care', cost: 440000, kind: 'profitUpgrade', incomeBonus: 0.07 },
  { id: 'potato', cost: 500000, kind: 'resource', incomeBonus: 0.08 },
  { id: 'campfire-upgrade-3', cost: 520000, kind: 'campfire', incomeBonus: 0.10 },
  { id: 'upgrade-digging-technique', cost: 560000, kind: 'profitUpgrade', after: 'potato', incomeBonus: 0.07 },
  { id: 'expand-4', cost: 560000, kind: 'expansion', incomeBonus: 0.10 },
  { id: 'tomato', cost: 670000, kind: 'resource', incomeBonus: 0.08 },
  { id: 'upgrade-tomato-watering', cost: 720000, kind: 'profitUpgrade', after: 'tomato', incomeBonus: 0.06 },
];

const UPGRADE_RULES = [
  'final-goal-cost-must-be-highest',
  'expansion-costs-use-even-spacing',
  'campfire-upgrades-use-even-spacing',
  'resource-specific-profit-upgrade-follows-the-resource',
  'mushroom-sense-stays-near-champignon',
  'tomato-unlocks-before-tomato-watering',
  'prices-and-targets-are-rounded-readable-values',
];

module.exports = {
  TARGET_DAY_MINUTES,
  REPAIR_COSTS,
  DAY_QUESTS,
  DAY_MODELS,
  DAY2_UPGRADE_ORDER,
  UPGRADE_RULES,
};
