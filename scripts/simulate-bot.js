#!/usr/bin/env node
const {
  TARGET_DAY_MINUTES,
  REPAIR_COSTS,
  DAY_QUESTS,
  DAY_MODELS,
  DAY2_UPGRADE_ORDER,
} = require('../balancing/balance-data');

function niceTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function valueAt(progress, total, curve = 1) {
  return Math.max(0, total * (Math.max(0, progress) ** curve));
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function maybeBuyDay2Upgrade(state, remainingSeconds, finalGoalCost) {
  const next = DAY2_UPGRADE_ORDER.find((upgrade) => {
    if (state.upgradesBought.has(upgrade.id)) return false;
    if (upgrade.after && !state.upgradesBought.has(upgrade.after)) return false;
    return true;
  });
  if (!next || next.cost >= finalGoalCost || state.money < next.cost) return;
  const incomePerSecond = Math.max(1, state.lastMoneyDelta || state.averageMoneyPerSecond || 1);
  const payoffSeconds = next.cost / (incomePerSecond * Math.max(0.01, next.incomeBonus));
  if (payoffSeconds > remainingSeconds * 0.65) return;
  state.money -= next.cost;
  state.incomeMultiplier *= 1 + next.incomeBonus;
  state.upgradesBought.add(next.id);
  state.events.push({ at: state.time, type: 'upgrade', id: next.id, cost: next.cost });
}

function maybeBuildSawmill(day, state, questCount) {
  const model = DAY_MODELS[day];
  if (!model || !model.sawmillProgress || state.sawmillBuilt) return;
  const questRatio = questCount ? state.questIndex / questCount : 0;
  if (questRatio < model.sawmillProgress) return;
  if (state.money < model.sawmillCost) return;
  state.money -= model.sawmillCost;
  state.woodMultiplier *= 1.65;
  state.sawmillBuilt = true;
  state.events.push({ at: state.time, type: 'sawmill', cost: model.sawmillCost });
}

function questDone(quest, state) {
  if (!quest) return false;
  if (quest.type === 'moneyEarned') return state.moneyEarned >= quest.target;
  if (quest.type === 'itemsCollected') return state.items >= quest.target;
  if (quest.type === 'killEnemy') return (state.kills[quest.stat] || 0) >= quest.target;
  if (quest.type === 'storyAction') return true;
  if (quest.type === 'repairBoat') {
    const cost = REPAIR_COSTS[quest.repair];
    return state.money >= cost.money && state.wood >= cost.wood;
  }
  return false;
}

function advanceQuestLine(day, state, quests) {
  while (state.questIndex < quests.length && questDone(quests[state.questIndex], state)) {
    const quest = quests[state.questIndex];
    state.completions.push({
      id: quest.id,
      at: state.time,
      metric: quest.type,
      moneyEarned: Math.round(state.moneyEarned),
      money: Math.round(state.money),
      items: Math.round(state.items),
      wood: Math.round(state.wood),
    });
    if (quest.type === 'repairBoat') {
      const cost = REPAIR_COSTS[quest.repair];
      state.money -= cost.money;
      state.wood -= cost.wood;
    }
    state.questIndex += 1;
    maybeBuildSawmill(day, state, quests.length);
  }
}

function simulateDay(day, options = {}) {
  const targetMinutes = TARGET_DAY_MINUTES[day];
  const targetSeconds = targetMinutes * 60;
  const model = DAY_MODELS[day];
  const quests = clone(DAY_QUESTS[day] || []);
  const state = {
    day,
    time: 0,
    money: 0,
    moneyEarned: 0,
    items: 0,
    wood: 0,
    kills: {},
    questIndex: 0,
    completions: [],
    events: [],
    incomeMultiplier: 1,
    woodMultiplier: 1,
    upgradesBought: new Set(),
    lastBaseMoney: 0,
    lastBaseItems: 0,
    lastBaseWood: 0,
    lastBaseKills: 0,
    lastMoneyDelta: 0,
    averageMoneyPerSecond: Math.max(1, (model.finalEarned || 1) / targetSeconds),
    sawmillBuilt: false,
  };

  const maxSeconds = Math.ceil(targetSeconds * (options.maxTargetMultiplier || 4));
  const finalRepair = quests.find((quest) => quest.type === 'repairBoat');
  const finalGoalCost = finalRepair ? REPAIR_COSTS[finalRepair.repair].money : Infinity;
  for (let t = 1; t <= maxSeconds && state.questIndex < quests.length; t += 1) {
    state.time = t;
    const progress = t / targetSeconds;
    const baseMoney = valueAt(progress, model.finalEarned || 0, model.moneyCurve || 1);
    const baseItems = valueAt(progress, model.finalItems || 0, model.itemCurve || 1);
    const baseWood = valueAt(progress, model.woodAtTarget || 0, model.itemCurve || 1);
    const baseKills = valueAt(progress, model.finalKills || 0, model.killCurve || 1);

    const moneyDelta = Math.max(0, baseMoney - state.lastBaseMoney) * state.incomeMultiplier;
    const itemsDelta = Math.max(0, baseItems - state.lastBaseItems);
    const woodDelta = Math.max(0, baseWood - state.lastBaseWood) * state.woodMultiplier;
    const killDelta = Math.max(0, baseKills - state.lastBaseKills);
    state.lastBaseMoney = baseMoney;
    state.lastBaseItems = baseItems;
    state.lastBaseWood = baseWood;
    state.lastBaseKills = baseKills;
    state.lastMoneyDelta = moneyDelta;

    state.money += moneyDelta;
    state.moneyEarned += moneyDelta;
    state.items += itemsDelta;
    state.wood += woodDelta;
    if (day === 4) {
      state.kills.wolf = baseKills;
      if (t >= targetSeconds * 0.72) state.kills.wolfBoss = 1;
      if (t >= targetSeconds * 0.88) state.kills.snowZombie = 1;
    }

    maybeBuildSawmill(day, state, quests.length);
    if (day === 2) maybeBuyDay2Upgrade(state, Math.max(0, targetSeconds - t), finalGoalCost);
    advanceQuestLine(day, state, quests);
  }
  return state;
}

function summarizeDay(day, state) {
  const target = TARGET_DAY_MINUTES[day] * 60;
  const lines = [];
  lines.push(`day ${day}: target ${niceTime(target)}, completed ${state.completions.length}/${(DAY_QUESTS[day] || []).length}`);
  state.completions.forEach((completion, index) => {
    const previous = index ? state.completions[index - 1].at : 0;
    lines.push(
      `  ${String(index + 1).padStart(2, '0')}. ${completion.id.padEnd(26)} at ${niceTime(completion.at)} interval ${niceTime(completion.at - previous)}`
    );
  });
  if (state.completions.length) {
    const last = state.completions[state.completions.length - 1].at;
    const drift = ((last - target) / target) * 100;
    lines.push(`  finish drift: ${drift >= 0 ? '+' : ''}${drift.toFixed(1)}%`);
  }
  if (state.events.length) {
    lines.push('  bot events:');
    state.events.forEach((event) => lines.push(`    ${niceTime(event.at)} ${event.type} ${event.id || ''}`.trimEnd()));
  }
  return lines.join('\n');
}

if (require.main === module) {
  const days = process.argv.slice(2).map(Number).filter(Boolean);
  const selectedDays = days.length ? days : [2, 3, 4, 5];
  selectedDays.forEach((day, index) => {
    const state = simulateDay(day);
    if (index) console.log('');
    console.log(summarizeDay(day, state));
  });
}

module.exports = {
  simulateDay,
  summarizeDay,
  niceTime,
};
