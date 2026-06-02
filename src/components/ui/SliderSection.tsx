'use client';
import React from 'react';
import RangeSlider from './RangeSlider';

export interface SliderDef {
  key: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  color?: string;
}

interface SliderSectionProps {
  title: string;
  description?: string;
  emoji?: string;
  sliders: SliderDef[];
  values: { [key: string]: number };
  onChange: (key: string, val: number) => void;
  color?: string;
}

export default function SliderSection({
  title,
  description,
  emoji,
  sliders,
  values,
  onChange,
  color = 'amber',
}: SliderSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {title}
        </h3>
        {description && <p className="text-sm text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-6">
        {sliders.map((slider) => (
          <RangeSlider
            key={slider.key}
            label={slider.label}
            value={values[slider.key] ?? 5}
            onChange={(v) => onChange(slider.key, v)}
            leftLabel={slider.leftLabel}
            rightLabel={slider.rightLabel}
            color={slider.color ?? color}
          />
        ))}
      </div>
    </div>
  );
}
