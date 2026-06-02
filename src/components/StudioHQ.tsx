'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/lib/gameLogic';
import { BUILDING_CONFIG, TIER_LABEL, getNextTier } from '@/data/buildings';
import { StudioBuilding, BuildingType, BuildingTier } from '@/types/game';

const BUILDING_META: Record<BuildingType, {
  emoji: string; label: string; description: string; qualityLabel: string;
}> = {
  'recording-studio': {
    emoji: '🎙️',
    label: 'Recording Studio',
    description: 'Required for each concurrent show. Higher tier boosts production quality.',
    qualityLabel: 'Prod. Quality',
  },
  'editing-suite': {
    emoji: '🖥️',
    label: 'Editing Suite',
    description: 'Required for each concurrent show. Higher tier boosts post-production quality.',
    qualityLabel: 'Post Quality',
  },
};

const TIER_STYLE: Record<BuildingTier, { badge: string; border: string }> = {
  basic:        { badge: 'text-zinc-400 bg-zinc-700/60',       border: 'border-zinc-700' },
  professional: { badge: 'text-blue-300 bg-blue-900/40',       border: 'border-blue-800/60' },
  prestige:     { badge: 'text-amber-300 bg-amber-900/30',     border: 'border-amber-700/50' },
};

function BuildingCard({
  building, money, onUpgrade,
}: {
  building: StudioBuilding; money: number; onUpgrade: () => void;
}) {
  const config = BUILDING_CONFIG[building.type][building.tier];
  const meta = BUILDING_META[building.type];
  const nextTier = getNextTier(building.tier);
  const style = TIER_STYLE[building.tier];
  const canAffordUpgrade = nextTier ? money >= config.upgradeCost : false;

  return (
    <div className={`bg-zinc-900 border ${style.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <div className="font-semibold text-sm text-white">{config.name}</div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              {TIER_LABEL[building.tier]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="bg-zinc-800/60 rounded-lg p-2 text-center">
          <div className="text-zinc-500 mb-0.5">Capacity</div>
          <div className="font-bold text-white">{config.capacity} show{config.capacity !== 1 ? 's' : ''}</div>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-2 text-center">
          <div className="text-zinc-500 mb-0.5">{meta.qualityLabel}</div>
          <div className={`font-bold ${config.qualityBonus > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
            {config.qualityBonus > 0 ? `+${config.qualityBonus}` : '—'}
          </div>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-2 text-center">
          <div className="text-zinc-500 mb-0.5">Maintenance</div>
          <div className="font-bold text-rose-300 tabular-nums">{formatMoney(config.weeklyMaintenance)}/wk</div>
        </div>
      </div>

      {nextTier ? (
        <button
          onClick={onUpgrade}
          disabled={!canAffordUpgrade}
          className={`w-full py-2 text-xs font-bold rounded-lg transition-all ${
            canAffordUpgrade
              ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          Upgrade to {TIER_LABEL[nextTier]} — {formatMoney(config.upgradeCost)}
        </button>
      ) : (
        <div className="text-center text-xs text-amber-400 font-semibold py-1.5">
          ✨ Maximum Tier
        </div>
      )}
    </div>
  );
}

function BuildingSection({
  type, buildings, activeCount, money, onBuild, onUpgrade,
}: {
  type: BuildingType;
  buildings: StudioBuilding[];
  activeCount: number;
  money: number;
  onBuild: () => void;
  onUpgrade: (id: string) => void;
}) {
  const meta = BUILDING_META[type];
  const buildCost = BUILDING_CONFIG[type]['basic'].buildCost;
  const canAffordBuild = money >= buildCost;
  const totalCapacity = buildings.reduce((sum, b) => sum + BUILDING_CONFIG[type][b.tier].capacity, 0);
  const occupied = Math.min(activeCount, totalCapacity);
  const atCapacity = occupied >= totalCapacity && buildings.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2">
            <span>{meta.emoji}</span> {meta.label}s
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">{meta.description}</p>
        </div>
        <div className="text-right text-xs flex-shrink-0 ml-4">
          <span className={`font-bold tabular-nums ${atCapacity ? 'text-rose-400' : 'text-emerald-400'}`}>
            {occupied}
          </span>
          <span className="text-zinc-500">/{totalCapacity} in use</span>
        </div>
      </div>

      <div className="space-y-3">
        {buildings.map((b) => (
          <BuildingCard key={b.id} building={b} money={money} onUpgrade={() => onUpgrade(b.id)} />
        ))}

        <button
          onClick={onBuild}
          disabled={!canAffordBuild}
          className={`w-full py-3 rounded-xl border-2 border-dashed text-sm font-bold transition-all ${
            canAffordBuild
              ? 'border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-zinc-200 active:scale-95'
              : 'border-zinc-800 text-zinc-700 cursor-not-allowed'
          }`}
        >
          + Build New Basic {meta.label} — {formatMoney(buildCost)}
        </button>
      </div>
    </div>
  );
}

export default function StudioHQ() {
  const studio = useGameStore((s) => s.studio);
  const setScreen = useGameStore((s) => s.setScreen);
  const buildBuilding = useGameStore((s) => s.buildBuilding);
  const upgradeBuilding = useGameStore((s) => s.upgradeBuilding);

  if (!studio) return null;

  const buildings = studio.buildings ?? [];
  const activeCount = studio.activeProductions.filter(p => p.status !== 'completed').length;

  const rsBuildings = buildings.filter(b => b.type === 'recording-studio');
  const esBuildings = buildings.filter(b => b.type === 'editing-suite');

  const rsCapacity = rsBuildings.reduce((sum, b) => sum + BUILDING_CONFIG['recording-studio'][b.tier].capacity, 0);
  const esCapacity = esBuildings.reduce((sum, b) => sum + BUILDING_CONFIG['editing-suite'][b.tier].capacity, 0);
  const effectiveCapacity = Math.min(rsCapacity, esCapacity);

  const totalMaintenance = buildings.reduce(
    (sum, b) => sum + BUILDING_CONFIG[b.type][b.tier].weeklyMaintenance, 0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('dashboard')}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              ← Dashboard
            </button>
            <span className="text-zinc-700">|</span>
            <div>
              <h1 className="font-bold text-base text-white">🏢 Studio HQ</h1>
              <p className="text-xs text-zinc-500">Production facilities</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-zinc-500">Weekly Overhead</div>
            <div className="text-sm font-bold text-rose-400 tabular-nums">{formatMoney(totalMaintenance)}/wk</div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Capacity overview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Studio Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500 mb-1">Active Shows</div>
              <div className="text-2xl font-black text-white">{activeCount}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500 mb-1">Max Concurrent</div>
              <div className="text-2xl font-black text-emerald-400">{effectiveCapacity}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500 mb-1">Available Funds</div>
              <div className="text-lg font-black text-amber-400 tabular-nums">{formatMoney(studio.money)}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500 mb-1">Overhead/wk</div>
              <div className="text-lg font-black text-rose-400 tabular-nums">{formatMoney(totalMaintenance)}</div>
            </div>
          </div>
          {activeCount >= effectiveCapacity && effectiveCapacity > 0 && (
            <div className="mt-3 bg-rose-900/30 border border-rose-800 rounded-lg p-2 text-xs text-rose-300">
              ⚠️ All production slots occupied. Build or upgrade to run more shows simultaneously.
            </div>
          )}
        </div>

        <BuildingSection
          type="recording-studio"
          buildings={rsBuildings}
          activeCount={activeCount}
          money={studio.money}
          onBuild={() => buildBuilding('recording-studio')}
          onUpgrade={(id) => upgradeBuilding(id)}
        />

        <BuildingSection
          type="editing-suite"
          buildings={esBuildings}
          activeCount={activeCount}
          money={studio.money}
          onBuild={() => buildBuilding('editing-suite')}
          onUpgrade={(id) => upgradeBuilding(id)}
        />

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500 space-y-1.5">
          <p>💡 Both a <strong className="text-zinc-300">Recording Studio</strong> and <strong className="text-zinc-300">Editing Suite</strong> are required for each show you run simultaneously.</p>
          <p>💡 Upgrading to Professional or Prestige adds a permanent <strong className="text-zinc-300">quality bonus</strong> to all shows — the best tier you own applies.</p>
          <p>💡 Maintenance is deducted every week regardless of whether your facilities are in use.</p>
        </div>
      </div>
    </div>
  );
}
