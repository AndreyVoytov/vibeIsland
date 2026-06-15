#!/usr/bin/env node
const {
  TARGET_DAY_MINUTES,
  REPAIR_COSTS,
  DAY_QUESTS,
  DAY_MODELS,
  DAY2_UPGRADE_ORDER,
  UPGRADE_RULES,
} = require('../balancing/balance-data');
const { simulateDay, summarizeDay } = require('./simulate-bot');

const MAX_ITERATIONS = 50;
const MAX_FINISH_DRIFT = 0.15;

function roundNice(value) {
  if (value <= 20) return Math.max(1, Math.round(value));
  if (value < 200) return Math.round(value / 10) * 10;
  if (value < 1000) return Math.round(value / 50) * 50;
  if (value < 10000) return Math.round(value / 100) * 100;
  if (value < 100000) return Math.round(value / 5000) * 5000;
  if (value < 1000000) return Math.round(value / 10000) * 10000;
  return Math.round(value / 50000) * 50000;
}

function isAdjustableQuest(quest) {
  return quest.type === 'moneyEarned' || quest.type === 'itemsCollected' || (quest.type === 'killEnemy' && quest.target > 1);
}

function completionMap(state) {
  return new Map(state.completions.map((completion) => [completion.id, completion]));
}

function getCompletionTolerance(day, adjustableCount) {
  const targetSeconds = TARGET_DAY_MINUTES[day] * 60;
  return Math.max(45, targetSeconds * 0.04, targetSeconds / Math.max(18, adjustableCount * 4));
}

function suggestTargetFromRun(day, quest, desiredTime, completion) {
  if (!completion || !completion.at || !quest.target) return quest.target;
  const curve = DAY_MODELS[day]?.[quest.type === 'moneyEarned' ? 'moneyCurve' : quest.type === 'killEnemy' ? 'killCurve' : 'itemCurve'] || 1;
  const scale = (desiredTime / completion.at) ** curve;
  return roundNice((quest.target || 1) * scale);
}

function rebalanceQuestTargets(day) {
  const quests = DAY_QUESTS[day] || [];
  if (!quests.length) return { day, iterations: 0, changed: false };
  let changed = false;
  let iterations = 0;
  const targetSeconds = TARGET_DAY_MINUTES[day] * 60;
  for (; iterations < MAX_ITERATIONS; iterations += 1) {
    let iterationChanged = false;
    const adjustable = quests.filter(isAdjustableQuest);
    const state = simulateDay(day);
    const completions = completionMap(state);
    const tolerance = getCompletionTolerance(day, adjustable.length);
    adjustable.forEach((quest, adjustableIndex) => {
      const desiredTime = targetSeconds * ((adjustableIndex + 1) / (adjustable.length + 1));
      const completion = completions.get(quest.id);
      if (!completion || Math.abs(completion.at - desiredTime) <= tolerance) return;
      const nextTarget = suggestTargetFromRun(day, quest, desiredTime, completion);
      if (nextTarget > 0 && Math.abs((quest.target || 0) - nextTarget) > Math.max(5, nextTarget * 0.03)) {
        quest.target = nextTarget;
        iterationChanged = true;
      }
    });
    changed = changed || iterationChanged;
    if (!iterationChanged) break;
  }
  const finalState = simulateDay(day);
  const lastCompletion = finalState.completions[finalState.completions.length - 1];
  const finishDrift = lastCompletion ? (lastCompletion.at - targetSeconds) / targetSeconds : Infinity;
  return { day, iterations: iterations + 1, changed, finishDrift, durationOk: Math.abs(finishDrift) <= MAX_FINISH_DRIFT };
}

function validateUpgradeRules() {
  const issues = [];
  const finalCost = REPAIR_COSTS.boat.money;
  const maxUpgrade = Math.max(...DAY2_UPGRADE_ORDER.map((upgrade) => upgrade.cost));
  if (maxUpgrade >= finalCost) issues.push(`final goal must be highest: max upgrade ${maxUpgrade}, boat ${finalCost}`);

  const expansions = DAY2_UPGRADE_ORDER.filter((upgrade) => upgrade.kind === 'expansion');
  const expansionSteps = expansions.slice(1).map((upgrade, index) => upgrade.cost - expansions[index].cost);
  if (new Set(expansionSteps).size > 1) issues.push(`expansion costs are not evenly spaced: ${expansionSteps.join(', ')}`);

  const campfires = DAY2_UPGRADE_ORDER.filter((upgrade) => upgrade.kind === 'campfire');
  if (campfires.length > 2) {
    const campfireSteps = campfires.slice(1).map((upgrade, index) => upgrade.cost - campfires[index].cost);
    if (new Set(campfireSteps).size > 1) issues.push(`campfire costs are not evenly spaced: ${campfireSteps.join(', ')}`);
  }

  const position = new Map(DAY2_UPGRADE_ORDER.map((upgrade, index) => [upgrade.id, index]));
  ['upgrade-mushroom-sense', 'upgrade-digging-technique', 'upgrade-tomato-watering'].forEach((id) => {
    const upgrade = DAY2_UPGRADE_ORDER.find((item) => item.id === id);
    if (!upgrade || !upgrade.after) return;
    if ((position.get(upgrade.after) ?? Infinity) > (position.get(id) ?? -1)) {
      issues.push(`${id} must appear after ${upgrade.after}`);
    }
  });
  const mushroomGap = Math.abs((position.get('upgrade-mushroom-sense') || 0) - (position.get('champignon') || 0));
  if (mushroomGap > 2) issues.push(`mushroom sense is too far from champignon: gap ${mushroomGap}`);

  return issues;
}

if (require.main === module) {
  console.log(`upgrade rules: ${UPGRADE_RULES.join(', ')}`);
  const upgradeIssues = validateUpgradeRules();
  if (upgradeIssues.length) {
    console.log('upgrade rule issues:');
    upgradeIssues.forEach((issue) => console.log(`  - ${issue}`));
  } else {
    console.log('upgrade rule issues: none');
  }

  [2, 3, 4, 5].forEach((day) => {
    const result = rebalanceQuestTargets(day);
    const state = simulateDay(day);
    console.log('');
    console.log(`day ${day} rebalance iterations: ${Math.min(result.iterations, MAX_ITERATIONS)} changed=${result.changed}`);
    console.log(`duration status: ${result.durationOk ? 'ok' : 'needs review'} (${(result.finishDrift * 100).toFixed(1)}%)`);
    console.log('targets:');
    (DAY_QUESTS[day] || []).forEach((quest) => {
      if (typeof quest.target === 'number') console.log(`  ${quest.id}: ${quest.target}`);
    });
    console.log(summarizeDay(day, state));
  });
}

module.exports = {
  MAX_ITERATIONS,
  rebalanceQuestTargets,
  validateUpgradeRules,
};
