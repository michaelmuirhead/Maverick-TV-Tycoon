'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { CastMember, CrewMember } from '@/types/game';
import { CAST_POOL, CREW_POOL } from '@/data/castPool';
import { formatMoney } from '@/lib/gameLogic';

type Tab = 'cast' | 'crew';

function StarRating({ level }: { level: number }) {
  return <span className="text-xs">{'⭐'.repeat(level)}</span>;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800' },
  contracted: { label: 'On Your Show', color: 'text-amber-400 bg-amber-900/30 border-amber-800' },
  'rival-contracted': { label: 'With Rival', color: 'text-rose-400 bg-rose-900/30 border-rose-800' },
  unavailable: { label: 'Unavailable', color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
};

function CastCard({ member }: { member: CastMember }) {
  const badge = STATUS_BADGE[member.status] ?? STATUS_BADGE.available;
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 transition-all ${member.status === 'available' ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-800 opacity-70'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-white text-sm">{member.name}</div>
          <StarRating level={member.starLevel} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {member.genre.slice(0, 3).map(g => (
          <span key={g} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{g}</span>
        ))}
      </div>
      <div className="text-xs text-zinc-500">Fee: <span className="font-bold text-zinc-300 tabular-nums">{formatMoney(member.weeklyFee)}/episode</span></div>
    </div>
  );
}

function CrewCard({ member }: { member: CrewMember }) {
  const badge = STATUS_BADGE[member.status] ?? STATUS_BADGE.available;
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 transition-all ${member.status === 'available' ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-800 opacity-70'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-white text-sm">{member.name}</div>
          <span className="text-xs text-zinc-500 capitalize">{member.role}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
      </div>
      <div className="text-xs mb-1">{'⭐'.repeat(member.level)}</div>
      <div className="text-xs text-zinc-500">Fee: <span className="font-bold text-zinc-300 tabular-nums">{formatMoney(member.episodeFee)}/episode</span></div>
    </div>
  );
}

export default function TalentMarket() {
  const studio = useGameStore(s => s.studio);
  const setScreen = useGameStore(s => s.setScreen);
  const [tab, setTab] = useState<Tab>('cast');
  const [starFilter, setStarFilter] = useState<number | null>(null);

  if (!studio) return null;

  // Get contracted talent from active productions
  const contractedCastIds = new Set(
    studio.activeProductions.flatMap(p => [...p.draft.mainCast, ...p.draft.supportingCast].map(c => c.id))
  );
  const contractedCrewIds = new Set(
    studio.activeProductions.flatMap(p => [p.draft.director?.id, p.draft.writer?.id].filter(Boolean) as string[])
  );

  const castWithStatus: CastMember[] = CAST_POOL.map(c => ({
    ...c,
    status: contractedCastIds.has(c.id) ? 'contracted' : c.status,
  }));
  const crewWithStatus: CrewMember[] = CREW_POOL.map(c => ({
    ...c,
    status: contractedCrewIds.has(c.id) ? 'contracted' : c.status,
  }));

  const filteredCast = castWithStatus.filter(c => starFilter === null || c.starLevel === starFilter);
  const filteredCrew = crewWithStatus.filter(c => starFilter === null || c.level === starFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm">← Dashboard</button>
            <span className="text-zinc-700">|</span>
            <h1 className="font-bold text-base text-white">Talent Market</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
          Browse available talent. Hire cast and crew during <strong className="text-zinc-200">Show Creation</strong> to add them to your productions. Talent contracted to active shows is marked accordingly.
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {(['cast', 'crew'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {t === 'cast' ? `🎭 Cast (${castWithStatus.filter(c => c.status === 'available').length} available)` : `🎬 Crew (${crewWithStatus.filter(c => c.status === 'available').length} available)`}
            </button>
          ))}
        </div>

        {/* Star filter */}
        <div className="flex gap-2">
          <button onClick={() => setStarFilter(null)} className={`px-3 py-1 text-xs rounded-full border transition-all ${starFilter === null ? 'bg-amber-500 border-amber-500 text-black' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>All</button>
          {[5, 4, 3, 2, 1].map(s => (
            <button key={s} onClick={() => setStarFilter(starFilter === s ? null : s)} className={`px-3 py-1 text-xs rounded-full border transition-all ${starFilter === s ? 'bg-amber-500 border-amber-500 text-black' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
              {'⭐'.repeat(s)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tab === 'cast'
            ? filteredCast.map(c => <CastCard key={c.id} member={c} />)
            : filteredCrew.map(c => <CrewCard key={c.id} member={c} />)
          }
        </div>
      </div>
    </div>
  );
}
