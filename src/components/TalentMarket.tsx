'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { CastMember, CrewMember } from '@/types/game';
import { CAST_POOL, CREW_POOL } from '@/data/castPool';
import { formatMoney } from '@/lib/gameLogic';
import TalentProfileModal, { Talent } from '@/components/TalentProfileModal';

type Tab = 'cast' | 'crew';

const DEV_SIGNUP_FEE = 50_000;

function StarRating({ level }: { level: number }) {
  return <span className="text-xs">{'⭐'.repeat(level)}</span>;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  available:         { label: 'Available',    color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800' },
  contracted:        { label: 'On Your Show', color: 'text-amber-400 bg-amber-900/30 border-amber-800' },
  'rival-contracted':{ label: 'With Rival',   color: 'text-rose-400 bg-rose-900/30 border-rose-800' },
  unavailable:       { label: 'Unavailable',  color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
};

const PHASE_BADGE: Record<string, { label: string; color: string }> = {
  rising:   { label: '📈 Rising',      color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50' },
  peak:     { label: '⭐ Prime',       color: 'text-amber-300 bg-amber-950/60 border-amber-800/50' },
  declining:{ label: '📉 Late Career', color: 'text-zinc-400 bg-zinc-800/60 border-zinc-700' },
};

function CareerBadge({ phase, age }: { phase?: string; age?: number }) {
  if (!phase) return null;
  const b = PHASE_BADGE[phase];
  if (!b) return null;
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${b.color}`}>
      {b.label}{age !== undefined ? ` · ${age}` : ''}
    </span>
  );
}

function CastCard({ member, onDevelop, canDevelop, onProfile }: { member: CastMember; onDevelop?: () => void; canDevelop?: boolean; onProfile: () => void }) {
  const badge = STATUS_BADGE[member.status] ?? STATUS_BADGE.available;
  const showDevelopBtn = member.status === 'available' && member.starLevel <= 2 && onDevelop;
  return (
    <div
      onClick={onProfile}
      className={`bg-zinc-900 border rounded-xl p-4 transition-all cursor-pointer ${member.status === 'available' ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-800 opacity-70 hover:opacity-100'}`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm truncate">{member.name}</span>
            <span className="text-xs text-zinc-600 flex-shrink-0">👤</span>
          </div>
          <StarRating level={member.starLevel} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.color}`}>{badge.label}</span>
      </div>
      <div className="mb-2">
        <CareerBadge phase={member.careerPhase} age={member.age} />
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {member.genre.slice(0, 3).map(g => (
          <span key={g} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{g}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">Fee: <span className="font-bold text-zinc-300 tabular-nums">{formatMoney(member.weeklyFee)}/episode</span></div>
        {showDevelopBtn && (
          <button
            onClick={e => { e.stopPropagation(); onDevelop!(); }}
            disabled={!canDevelop}
            className="text-xs px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/60 text-emerald-300 font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Sign to development for ${formatMoney(DEV_SIGNUP_FEE)}`}
          >
            🌱 Develop
          </button>
        )}
      </div>
    </div>
  );
}

function CrewCard({ member, onProfile }: { member: CrewMember; onProfile: () => void }) {
  const badge = STATUS_BADGE[member.status] ?? STATUS_BADGE.available;
  return (
    <div
      onClick={onProfile}
      className={`bg-zinc-900 border rounded-xl p-4 transition-all cursor-pointer ${member.status === 'available' ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-800 opacity-70 hover:opacity-100'}`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm truncate">{member.name}</span>
            <span className="text-xs text-zinc-600 flex-shrink-0">👤</span>
          </div>
          <span className="text-xs text-zinc-500 capitalize">{member.role}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.color}`}>{badge.label}</span>
      </div>
      <div className="mb-1.5">
        <CareerBadge phase={member.careerPhase} age={member.age} />
      </div>
      <div className="text-xs mb-1.5">{'⭐'.repeat(member.level)}</div>
      {(member.genreStrengths?.length || member.genreWeaknesses?.length) ? (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {member.genreStrengths?.slice(0, 2).map(g => (
            <span key={g} className="text-xs bg-emerald-950/60 text-emerald-500 px-1.5 py-0.5 rounded">✓ {g}</span>
          ))}
          {member.genreWeaknesses?.slice(0, 2).map(g => (
            <span key={g} className="text-xs bg-rose-950/60 text-rose-500 px-1.5 py-0.5 rounded">✗ {g}</span>
          ))}
        </div>
      ) : null}
      <div className="text-xs text-zinc-500">Fee: <span className="font-bold text-zinc-300 tabular-nums">{formatMoney(member.episodeFee)}/episode</span></div>
    </div>
  );
}

export default function TalentMarket() {
  const studio = useGameStore(s => s.studio);
  const setScreen = useGameStore(s => s.setScreen);
  const signToDevelopment = useGameStore(s => s.signToDevelopment);
  const releaseDevelopmentActor = useGameStore(s => s.releaseDevelopmentActor);
  const spendMoney = useGameStore(s => s.spendMoney);
  const [tab, setTab] = useState<Tab>('cast');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [profileTalent, setProfileTalent] = useState<Talent | null>(null);

  if (!studio) return null;

  // Get contracted talent from active productions
  const contractedCastIds = new Set(
    studio.activeProductions.flatMap(p => [...p.draft.mainCast, ...p.draft.supportingCast].map(c => c.id))
  );
  const contractedCrewIds = new Set(
    studio.activeProductions.flatMap(p => [p.draft.director?.id, p.draft.writer?.id].filter(Boolean) as string[])
  );

  const liveCast = studio.talentPool?.cast ?? CAST_POOL;
  const liveCrew = studio.talentPool?.crew ?? CREW_POOL;

  const castWithStatus: CastMember[] = liveCast.filter(c => c.status !== 'unavailable').map(c => ({
    ...c,
    status: contractedCastIds.has(c.id) ? 'contracted' : c.status,
  }));
  const crewWithStatus: CrewMember[] = liveCrew.map(c => ({
    ...c,
    status: contractedCrewIds.has(c.id) ? 'contracted' : c.status,
  }));

  const filteredCast = castWithStatus.filter(c => starFilter === null || c.starLevel === starFilter);
  const filteredCrew = crewWithStatus.filter(c => starFilter === null || c.level === starFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {profileTalent && <TalentProfileModal talent={profileTalent} onClose={() => setProfileTalent(null)} />}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm">← Dashboard</button>
            <span className="text-zinc-700">|</span>
            <h1 className="font-bold text-base text-white">Talent Market</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5 md:space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
          Browse available talent. Hire cast and crew during <strong className="text-zinc-200">Show Creation</strong> to add them to your productions. Sign rising actors to <strong className="text-zinc-200">development</strong> to grow their star level over time.
        </div>

        {/* Development Roster */}
        {(studio.developmentRoster ?? []).length > 0 && (
          <div className="bg-zinc-900 border border-emerald-800/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-emerald-300">🌱 Development Roster</h2>
              <span className="text-xs text-zinc-500">{formatMoney(3_000)}/week per actor</span>
            </div>
            <div className="space-y-2">
              {(studio.developmentRoster ?? []).map(actor => (
                <div key={actor.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{actor.name}</span>
                      <span className="text-xs">{'⭐'.repeat(actor.starLevel)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500">Week {actor.developmentWeeks ?? 0} in dev</span>
                      <span className="text-xs text-emerald-500">Chance to improve each week</span>
                    </div>
                  </div>
                  <button
                    onClick={() => releaseDevelopmentActor(actor.id)}
                    className="text-xs px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-zinc-300 rounded-lg transition-all flex-shrink-0"
                  >
                    Release
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
            ? filteredCast.map(c => (
                <CastCard
                  key={c.id}
                  member={c}
                  onProfile={() => setProfileTalent(c)}
                  onDevelop={c.status === 'available' && c.starLevel <= 2 ? () => {
                    spendMoney(DEV_SIGNUP_FEE);
                    signToDevelopment(c.id);
                  } : undefined}
                  canDevelop={studio.money >= DEV_SIGNUP_FEE}
                />
              ))
            : filteredCrew.map(c => <CrewCard key={c.id} member={c} onProfile={() => setProfileTalent(c)} />)
          }
        </div>
      </div>
    </div>
  );
}
