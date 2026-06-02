'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '@/types/game';
import { formatMoney } from '@/lib/gameLogic';

type Tier5<T extends string> = { value: T; label: string; desc: string };

function SettingSelector<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: Tier5<T>[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-zinc-400">{label}</div>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            title={opt.desc}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              value === opt.value
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-zinc-600 italic">{options.find(o => o.value === value)?.desc}</div>
    </div>
  );
}

const EPISODE_BUDGET_OPTIONS: Tier5<GameSettings['episodeBudgets']>[] = [
  { value: 'stingy',   label: 'Stingy',    desc: 'Networks pay 45% of normal rates' },
  { value: 'cautious', label: 'Cautious',  desc: 'Networks pay 70% of normal rates' },
  { value: 'fair',     label: 'Fair',      desc: 'Normal network budgets (default)' },
  { value: 'trusting', label: 'Trusting',  desc: 'Networks pay 135% of normal rates' },
  { value: 'generous', label: 'Generous',  desc: 'Networks pay 175% — very lucrative' },
];

const AI_EFFICIENCY_OPTIONS: Tier5<GameSettings['aiEfficiency']>[] = [
  { value: 'terrible', label: 'Terrible', desc: 'Rival studios barely function — weak, slow, infrequent' },
  { value: 'poor',     label: 'Poor',     desc: 'Rivals underperform and release shows slowly' },
  { value: 'average',  label: 'Average',  desc: 'Standard rival competition (default)' },
  { value: 'high',     label: 'High',     desc: 'Rivals are sharper and release shows more often' },
  { value: 'super',    label: 'Super',    desc: 'Elite rivals — dominant quality, rapid releases' },
];

const PRODUCTION_COST_OPTIONS: Tier5<GameSettings['productionCosts']>[] = [
  { value: 'bargain',    label: 'Bargain',    desc: 'Production costs at 40% of normal' },
  { value: 'cheap',      label: 'Cheap',      desc: 'Production costs at 65% of normal' },
  { value: 'affordable', label: 'Affordable', desc: 'Normal production costs (default)' },
  { value: 'expensive',  label: 'Expensive',  desc: 'Production costs at 145% of normal' },
  { value: 'lavish',     label: 'Lavish',     desc: 'Hollywood extravagance — 185% costs' },
];

const PITCHING_OPTIONS: Tier5<GameSettings['pitchingChances']>[] = [
  { value: 'nearly-impossible', label: 'Brutal',   desc: 'Very hard to land deals or renewals' },
  { value: 'slim',              label: 'Slim',     desc: 'Below average pickup and renewal odds' },
  { value: 'fair',              label: 'Fair',     desc: 'Standard industry odds (default)' },
  { value: 'good',              label: 'Good',     desc: 'Above average pickup and renewal odds' },
  { value: 'slapping',          label: 'Slapping', desc: 'Networks love everything — easy deals' },
];

const VIEWERSHIP_OPTIONS: Tier5<GameSettings['viewership']>[] = [
  { value: 'meagre',   label: 'Meagre',   desc: 'Ratings at 45% — tiny audiences' },
  { value: 'modest',   label: 'Modest',   desc: 'Ratings at 70% of normal' },
  { value: 'normal',   label: 'Normal',   desc: 'Standard viewership (default)' },
  { value: 'ample',    label: 'Ample',    desc: 'Ratings at 135% of normal' },
  { value: 'abundant', label: 'Abundant', desc: 'Ratings at 175% — massive audiences' },
];

export default function Welcome() {
  const startGame = useGameStore((s) => s.startGame);
  const [playerName, setPlayerName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({ ...DEFAULT_GAME_SETTINGS });

  const update = <K extends keyof GameSettings>(key: K, val: GameSettings[K]) =>
    setSettings(s => ({ ...s, [key]: val }));

  const handleStart = () => {
    if (!playerName.trim()) { setError('Enter your name to get started.'); return; }
    if (!studioName.trim()) { setError('Give your studio a name.'); return; }
    startGame(studioName.trim(), 'drama', playerName.trim(), settings);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start px-4 py-8 sm:py-10">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="text-5xl mb-3">🎬</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Maverick TV</h1>
        <p className="text-amber-500 font-bold text-lg sm:text-xl tracking-widest uppercase mt-1">Tycoon</p>
        <p className="text-zinc-500 mt-3 text-sm sm:text-base max-w-sm mx-auto">
          Build your production studio. Greenlight hit shows. Rule the airwaves.
        </p>
      </div>

      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-8 space-y-5">
        {/* Player Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. Alex Morgan"
            maxLength={40}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-base focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Studio Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Studio Name</label>
          <input
            type="text"
            value={studioName}
            onChange={(e) => { setStudioName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. Maverick Pictures"
            maxLength={40}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-base focus:outline-none focus:border-amber-500 transition-colors"
          />
          {error && <p className="text-rose-400 text-sm mt-1.5">{error}</p>}
        </div>

        {/* Game Settings (collapsible) */}
        <div className="border border-zinc-700 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSettings(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <span>⚙️ Game Settings</span>
            <span className="text-zinc-500 text-xs">{showSettings ? '▲ Hide' : '▼ Customize'}</span>
          </button>

          {showSettings && (
            <div className="border-t border-zinc-700 px-4 pb-4 pt-4 space-y-6">

              {/* Money */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">💰 Money</div>

                {/* Starting Capital */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-zinc-400">Starting Capital</span>
                    <span className="text-xs font-bold text-amber-400 tabular-nums">{formatMoney(settings.startingCapital)}</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute inset-x-0 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((settings.startingCapital - 2_500_000) / (100_000_000 - 2_500_000)) * 100}%` }} />
                    </div>
                    <input type="range" min={2_500_000} max={100_000_000} step={2_500_000} value={settings.startingCapital}
                      onChange={e => update('startingCapital', Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-700"><span>$2.5M</span><span>$100M</span></div>
                </div>

                {/* Bankruptcy Threshold */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-zinc-400">Bankruptcy Threshold</span>
                    <span className="text-xs font-bold text-rose-400 tabular-nums">{settings.bankruptcyThreshold === 0 ? 'OFF' : formatMoney(settings.bankruptcyThreshold)}</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute inset-x-0 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: `${(settings.bankruptcyThreshold / 50_000_000) * 100}%` }} />
                    </div>
                    <input type="range" min={0} max={50_000_000} step={1_000_000} value={settings.bankruptcyThreshold}
                      onChange={e => update('bankruptcyThreshold', Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-700"><span>Off</span><span>$50M</span></div>
                  <div className="text-xs text-zinc-600 italic">
                    {settings.bankruptcyThreshold === 0 ? 'Funds can go negative with no warning' : `Warning event fires when funds drop below ${formatMoney(settings.bankruptcyThreshold)}`}
                  </div>
                </div>

                {/* Unlimited Money toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => update('unlimitedMoney', !settings.unlimitedMoney)}
                    className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${settings.unlimitedMoney ? 'bg-amber-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.unlimitedMoney ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-300">Unlimited Money</span>
                    <span className="text-xs text-zinc-600 ml-2">No production cost deductions ever</span>
                  </div>
                </label>
              </div>

              {/* Economy */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">📺 Economy</div>
                <SettingSelector label="Episode Budgets (network pay per episode)" value={settings.episodeBudgets} onChange={v => update('episodeBudgets', v)} options={EPISODE_BUDGET_OPTIONS} />
                <SettingSelector label="Production Costs" value={settings.productionCosts} onChange={v => update('productionCosts', v)} options={PRODUCTION_COST_OPTIONS} />
              </div>

              {/* Industry */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">🏭 Industry</div>
                <SettingSelector label="Pitching & Renewal Chances" value={settings.pitchingChances} onChange={v => update('pitchingChances', v)} options={PITCHING_OPTIONS} />
                <SettingSelector label="Viewership" value={settings.viewership} onChange={v => update('viewership', v)} options={VIEWERSHIP_OPTIONS} />
              </div>

              {/* Competition */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">⚔️ Competition</div>
                <SettingSelector label="AI Studio Efficiency" value={settings.aiEfficiency} onChange={v => update('aiEfficiency', v)} options={AI_EFFICIENCY_OPTIONS} />
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...DEFAULT_GAME_SETTINGS })}
                className="w-full text-xs text-zinc-600 hover:text-zinc-400 py-1.5 transition-colors border border-zinc-800 rounded-lg"
              >
                ↺ Reset to Defaults
              </button>
            </div>
          )}
        </div>

        {/* Starting Budget display */}
        <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-zinc-400">Starting Budget</div>
          <div className={`text-lg font-bold ${settings.unlimitedMoney ? 'text-emerald-400' : 'text-amber-400'}`}>
            {settings.unlimitedMoney ? '∞ Unlimited' : formatMoney(settings.startingCapital)}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded-xl transition-all duration-200 active:scale-95"
        >
          Start Your Studio →
        </button>
      </div>
    </div>
  );
}
