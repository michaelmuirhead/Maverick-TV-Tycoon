'use client';
import React from 'react';

interface RangeSliderProps {
  label: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (val: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  color?: string;
}

export default function RangeSlider({
  label,
  min = 1,
  max = 10,
  value,
  onChange,
  leftLabel,
  rightLabel,
  color = 'amber',
}: RangeSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  const trackColor = {
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
  }[color] ?? 'bg-amber-500';

  const thumbColor = {
    amber: 'accent-amber-500',
    purple: 'accent-purple-500',
    emerald: 'accent-emerald-500',
    blue: 'accent-blue-500',
    rose: 'accent-rose-500',
    indigo: 'accent-indigo-500',
  }[color] ?? 'accent-amber-500';

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${trackColor.replace('bg-', 'text-')}`}>{value}</span>
      </div>
      <div className="relative">
        <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${trackColor}`} style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`absolute inset-0 w-full opacity-0 cursor-pointer h-1.5 ${thumbColor}`}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-1">
          {leftLabel && <span className="text-xs text-zinc-500">{leftLabel}</span>}
          {rightLabel && <span className="text-xs text-zinc-500">{rightLabel}</span>}
        </div>
      )}
    </div>
  );
}
