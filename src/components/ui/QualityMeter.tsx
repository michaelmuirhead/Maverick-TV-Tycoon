'use client';
import React from 'react';
import { getQualityLabel } from '@/lib/gameLogic';

interface QualityMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function QualityMeter({ score, size = 'md', showLabel = true }: QualityMeterProps) {
  const { label, color } = getQualityLabel(score);

  const ringSize = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-28 h-28' }[size];
  const textSize = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }[size];
  const labelSize = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' }[size];

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    score >= 90 ? '#a855f7' :
    score >= 80 ? '#10b981' :
    score >= 70 ? '#22c55e' :
    score >= 60 ? '#84cc16' :
    score >= 50 ? '#eab308' :
    score >= 40 ? '#f59e0b' :
    score >= 30 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${ringSize}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#27272a" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-bold tabular-nums text-white`}>{score}</span>
        </div>
      </div>
      {showLabel && <span className={`${labelSize} font-semibold ${color}`}>{label}</span>}
    </div>
  );
}
