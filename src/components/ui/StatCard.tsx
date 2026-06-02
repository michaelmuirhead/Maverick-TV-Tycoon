import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

export default function StatCard({ icon, label, value, subValue, color = 'amber' }: StatCardProps) {
  const textColor = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400',
    zinc: 'text-zinc-400',
  }[color] ?? 'text-amber-400';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold tabular-nums ${textColor}`}>{value}</div>
      {subValue && <div className="text-xs text-zinc-500">{subValue}</div>}
    </div>
  );
}
