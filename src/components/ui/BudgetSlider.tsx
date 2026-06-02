'use client';
import React from 'react';
import { formatMoney } from '@/lib/gameLogic';

interface BudgetSliderProps {
  label: string;
  sublabel?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  color?: string;
}

export default function BudgetSlider({
  label,
  sublabel,
  min,
  max,
  step,
  value,
  onChange,
  color = 'amber',
}: BudgetSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  const trackColor = {
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
  }[color] ?? 'bg-amber-500';

  const textColor = trackColor.replace('bg-', 'text-');

  return (
    <div>
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <span className="text-sm font-medium text-zinc-200">{label}</span>
          {sublabel && <p className="text-xs text-zinc-500">{sublabel}</p>}
        </div>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>{formatMoney(value)}</span>
      </div>
      <div className="relative">
        <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${trackColor}`} style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-zinc-600">{formatMoney(min)}</span>
        <span className="text-xs text-zinc-600">{formatMoney(max)}</span>
      </div>
    </div>
  );
}
