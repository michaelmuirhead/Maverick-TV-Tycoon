import { BuildingType, BuildingTier } from '@/types/game';

export interface TierConfig {
  name: string;
  weeklyMaintenance: number;
  buildCost: number;
  upgradeCost: number;
  capacity: number;
  qualityBonus: number;
}

export const BUILDING_CONFIG: Record<BuildingType, Record<BuildingTier, TierConfig>> = {
  'recording-studio': {
    basic: {
      name: 'Basic Recording Studio',
      weeklyMaintenance: 12_000,
      buildCost: 750_000,
      upgradeCost: 1_250_000,
      capacity: 1,
      qualityBonus: 0,
    },
    professional: {
      name: 'Professional Recording Studio',
      weeklyMaintenance: 25_000,
      buildCost: 2_000_000,
      upgradeCost: 3_000_000,
      capacity: 2,
      qualityBonus: 8,
    },
    prestige: {
      name: 'Prestige Recording Studio',
      weeklyMaintenance: 42_000,
      buildCost: 5_000_000,
      upgradeCost: 0,
      capacity: 3,
      qualityBonus: 15,
    },
  },
  'editing-suite': {
    basic: {
      name: 'Basic Editing Suite',
      weeklyMaintenance: 8_000,
      buildCost: 500_000,
      upgradeCost: 1_000_000,
      capacity: 1,
      qualityBonus: 0,
    },
    professional: {
      name: 'Professional Editing Suite',
      weeklyMaintenance: 18_000,
      buildCost: 1_500_000,
      upgradeCost: 2_500_000,
      capacity: 2,
      qualityBonus: 8,
    },
    prestige: {
      name: 'Prestige Editing Suite',
      weeklyMaintenance: 30_000,
      buildCost: 4_000_000,
      upgradeCost: 0,
      capacity: 3,
      qualityBonus: 15,
    },
  },
};

export const TIER_ORDER: BuildingTier[] = ['basic', 'professional', 'prestige'];

export const TIER_LABEL: Record<BuildingTier, string> = {
  basic: 'Basic',
  professional: 'Professional',
  prestige: 'Prestige',
};

export function getNextTier(tier: BuildingTier): BuildingTier | null {
  const idx = TIER_ORDER.indexOf(tier);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

export const DEFAULT_BUILDINGS = [
  { id: 'building-rs-0', type: 'recording-studio' as BuildingType, tier: 'basic' as BuildingTier },
  { id: 'building-es-0', type: 'editing-suite' as BuildingType, tier: 'basic' as BuildingTier },
];
