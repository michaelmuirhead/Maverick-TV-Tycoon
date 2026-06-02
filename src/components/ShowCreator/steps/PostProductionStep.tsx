'use client';
import React from 'react';
import { ShowDraft, PostProductionBudget } from '@/types/game';
import BudgetSlider from '@/components/ui/BudgetSlider';
import { formatMoney } from '@/lib/gameLogic';
import { GENRE_PROFILES } from '@/data/genres';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

const SLIDERS = [
  { key: 'editing', label: 'Editing', sublabel: 'Picture editing, color grading, pacing', min: 10000, max: 200000, step: 5000, color: 'amber' },
  { key: 'visualEffects', label: 'Visual Effects (VFX)', sublabel: 'CGI, compositing, digital environments', min: 0, max: 5000000, step: 50000, color: 'purple' },
  { key: 'soundEffects', label: 'Sound Design & SFX', sublabel: 'Foley, sound design, audio post', min: 0, max: 200000, step: 5000, color: 'blue' },
  { key: 'music', label: 'Score & Music', sublabel: 'Original score, licensing, music supervision', min: 5000, max: 500000, step: 10000, color: 'emerald' },
] as const;

export default function PostProductionStep({ draft, onUpdate }: Props) {
  const total = Object.values(draft.postProduction).reduce((s, v) => s + v, 0);
  const genreProfile = GENRE_PROFILES[draft.genre];
  const isVfxGenre = genreProfile.vfxMultiplier > 1.5;

  const updateField = (key: keyof PostProductionBudget, val: number) => {
    onUpdate({ postProduction: { ...draft.postProduction, [key]: val } });
  };

  return (
    <div className="space-y-6">
      {isVfxGenre && (
        <div className="bg-purple-900/20 border border-purple-800/40 rounded-xl p-3 text-xs text-purple-300">
          ⚡ <span className="font-semibold">{genreProfile.label}</span> shows get a major quality boost from VFX investment.
        </div>
      )}

      <div className="bg-zinc-800/60 rounded-xl p-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Total post-production cost per episode</span>
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
            value={draft.postProduction[s.key]}
            onChange={(v) => updateField(s.key, v)}
            color={s.color}
          />
        ))}
      </div>
    </div>
  );
}
