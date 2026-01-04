/**
 * Constants for game balance
 */
export const GAME_CONSTANTS = {
  BASE_MAX_ENERGY: 100,
  BASE_ENERGY_PER_CLICK: 1,
  REGEN_PER_SECOND: 1,
  BASE_TIMBITAS_PER_CLICK: 1,
};

export const UPGRADES = {
  multitap: {
    id: 'multitap',
    name: 'Multitap',
    basePrice: 50,
    basePower: 1, // +1 per click per level
    priceCoef: 2.0, // Price doubles each level
    description: 'Increases Timbitas per click (+1)'
  },
  energyTank: {
    id: 'energyTank',
    name: 'Energy Tank',
    basePrice: 100,
    basePower: 100, // +100 Max Energy per level
    priceCoef: 1.5,
    description: 'Increases Max Energy (+100)'
  },
  fullRefill: {
    id: 'fullRefill',
    name: 'Full Refill',
    basePrice: 200,
    type: 'consumable',
    description: 'Instantly restores full energy'
  }
};

/**
 * Calculates current Max Energy based on upgrades
 */
export function getMaxEnergy(upgrades) {
  const tankLevel = (upgrades?.energyTank || 0);
  return GAME_CONSTANTS.BASE_MAX_ENERGY + (tankLevel * UPGRADES.energyTank.basePower);
}

/**
 * Calculates Timbitas per Clicks based on upgrades
 */
export function getClickValue(upgrades) {
  const multitapLevel = (upgrades?.multitap || 0);
  return GAME_CONSTANTS.BASE_TIMBITAS_PER_CLICK + (multitapLevel * UPGRADES.multitap.basePower);
}

/**
 * Calculates cost of next level
 */
export function getUpgradeCost(id, currentLevel) {
  const upgrade = UPGRADES[id];
  if (!upgrade) return 999999999;
  if (upgrade.type === 'consumable') return upgrade.basePrice;

  // Exponential growth: Base * (Coef ^ Level)
  return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceCoef, currentLevel));
}

/**
 * Calculates the result of a single click.
 * @param {Object} state - { energy, balance, upgrades }
 */
export function calculateClick(state) {
  const { energy, balance, upgrades } = state;
  const clickCost = GAME_CONSTANTS.BASE_ENERGY_PER_CLICK;
  const clickValue = getClickValue(upgrades);

  if (energy < clickCost) {
    return {
      success: false,
      newEnergy: energy,
      newBalance: balance,
      error: 'Not enough energy',
    };
  }

  return {
    success: true,
    newEnergy: energy - clickCost,
    newBalance: balance + clickValue,
    error: null,
  };
}

/**
 * Handles upgrade purchase
 * @param {Object} state - { balance, energy, upgrades }
 * @param {string} upgradeId 
 */
export function buyUpgrade(state, upgradeId) {
  const { balance, energy, upgrades = {} } = state;
  const upgrade = UPGRADES[upgradeId];

  if (!upgrade) return { success: false, error: 'Invalid upgrade' };

  const currentLevel = upgrades[upgradeId] || 0;
  const cost = getUpgradeCost(upgradeId, currentLevel);

  if (balance < cost) {
    return { success: false, error: 'Not enough Timbitas' };
  }

  const newBalance = balance - cost;
  let newUpgrades = { ...upgrades };
  let newEnergy = energy;

  // Handle Logic
  if (upgrade.type === 'consumable') {
    if (upgradeId === 'fullRefill') {
      const maxEnergy = getMaxEnergy(upgrades);
      newEnergy = maxEnergy;
    }
  } else {
    newUpgrades[upgradeId] = currentLevel + 1;
    // Special case: If buying tank, should we fill the new capacity? 
    // For now, let's just keep current energy but validation will now allow higher max.
    // Or maybe give a little boost? 
    // Let's stick to simple: current energy unchanged, but cap increases.
  }

  return {
    success: true,
    newBalance,
    newUpgrades,
    newEnergy // Only changed for refill
  };
}

/**
 * Calculates energy regeneration
 * @param {number} currentEnergy 
 * @param {number} elapsedSeconds 
 * @param {Object} upgrades 
 */
export function calculateRegen(currentEnergy, elapsedSeconds, upgrades) {
  if (elapsedSeconds <= 0) return currentEnergy;

  const maxEnergy = getMaxEnergy(upgrades);
  const regenAmount = Math.floor(elapsedSeconds * GAME_CONSTANTS.REGEN_PER_SECOND);
  const totalEnergy = currentEnergy + regenAmount;

  return Math.min(totalEnergy, maxEnergy);
}
