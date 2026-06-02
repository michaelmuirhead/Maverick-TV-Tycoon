'use client';
import React from 'react';
import { ShowDraft, ProductionBudget } from '@/types/game';
import BudgetSlider from '@/components/ui/BudgetSlider';
import { formatMoney } from '@/lib/gameLogic';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

const SLIDERS = [
  { key: 'crew', label: 'Production Crew', sublabel: 'Camera operators, lighting, sound on set', min: 10000, max: 500000, step: 10000, color: 'amber' },
  { key: 'recordingStudio', label: 'Recording Studio', sublabel: 'Studio space, equipment hire, facilities', min: 5000, max: 300000, step: 5000, color: 'blue' },
  { key: 'locations', label: 'Locations', sublabel: 'On-location shoots, permits, travel', min: 0, max: 1000000, step: 25000, color: 'emerald' },
  { key: 'sets', label: 'Sets & Production Design', sublabel: 'Set construction, dressing, art department', min: 0, max: 2000000, step: 50000, color: 'purple' },
] as const;

export default function ProductionBudgetStep({ draft, onUpdate }: Props) {
  const total = Object.values(draft.production).reduce((s, v) => s + v, 0);

  const updateField = (key: keyof ProductionBudget, val: number) => {
    onUpdate({ production: { ...draft.production, [key]: val } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-800/60 rounded-xl p-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Total production cost per episode</span>
        <span className="text-amber-400 font-bold tabular-nums">{formatMoney(total)}</span>
      </div>

      <div className="space-y-6">
        {SLIDERS.map((s) => (
          <BudgetSlider
            key={s.key}
            label={s.label}
            sublabel={s.sublabel}
            min={s.min}
            max={s.max}
            step={s.step}
            value={draft.production[s.key]}
            onChange={(v) => updateField(s.key, v)}
            color={s.color}
          />
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500 space-y-1">
        <p>💡 Higher production spend improves visual quality and perceived production value.</p>
        <p>💡 Genre matters — Fantasy and Sci-Fi benefit more from sets; Documentaries need great locations.</p>
      </div>
    </div>
  );
}
