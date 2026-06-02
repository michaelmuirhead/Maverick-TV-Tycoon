'use client';
import React, { useState } from 'react';
import { ShowDraft, CastMember, CrewMember, Genre } from '@/types/game';
import { CAST_POOL, CREW_POOL } from '@/data/castPool';
import { useGameStore } from '@/store/gameStore';

const PHASE_DOT: Record<string, string> = {
  rising: 'text-emerald-400',
  peak: 'text-amber-400',
  declining: 'text-zinc-500',
};
import { formatMoney } from '@/lib/gameLogic';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

type Tab = 'main' | 'supporting' | 'crew' | 'extras';

function StarRating({ level }: { level: number }) {
  return (
    <span className="text-xs">
      {'⭐'.repeat(level)}
    </span>
  );
}

function CastCard({
  member, hired, onToggle, contracted, rivalContracted,
}: {
  member: CastMember; hired: boolean; onToggle: () => void;
  contracted?: boolean; rivalContracted?: boolean;
}) {
  const isDisabled = contracted || rivalContracted;
  return (
    <div
      onClick={isDisabled ? undefined : onToggle}
      className={`p-3 rounded-xl border transition-all duration-150 ${
        isDisabled
          ? 'bg-zinc-900/40 border-zinc-800 opacity-50 cursor-not-allowed'
          : hired
          ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 cursor-pointer'
          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{member.name}</div>
          <StarRating level={member.starLevel} />
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xs font-bold tabular-nums ${hired ? 'text-amber-400' : 'text-zinc-500'}`}>
            {formatMoney(member.weeklyFee)}/ep
          </div>
          {contracted && <span className="text-xs text-rose-400 font-semibold block mt-0.5">On Show</span>}
          {rivalContracted && <span className="text-xs text-purple-400 font-semibold block mt-0.5">Rival Studio</span>}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1 items-center">
        {member.careerPhase && (
          <span className={`text-xs ${PHASE_DOT[member.careerPhase] ?? ''}`}>
            {member.careerPhase === 'rising' ? '📈' : member.careerPhase === 'declining' ? '📉' : '⭐'}
            {member.age !== undefined ? ` ${member.age}` : ''}
          </span>
        )}
        {member.genre.slice(0, 3).map((g) => (
          <span key={g} className="text-xs bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded">{g}</span>
        ))}
      </div>
    </div>
  );
}

function CrewCard({ member, hired, onHire, draftGenre }: { member: CrewMember; hired: boolean; onHire: () => void; draftGenre?: Genre }) {
  const isSpecialist = draftGenre && member.genreStrengths?.includes(draftGenre);
  const isWeak = draftGenre && member.genreWeaknesses?.includes(draftGenre);
  return (
    <div
      onClick={onHire}
      className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
        hired
          ? 'bg-blue-500/15 border-blue-500/60 text-blue-200'
          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">{member.name}</span>
            {isSpecialist && <span className="text-xs bg-emerald-900/50 border border-emerald-700/60 text-emerald-300 px-1.5 py-0.5 rounded-full flex-shrink-0">🎯 Specialist</span>}
            {isWeak && <span className="text-xs bg-amber-900/50 border border-amber-700/60 text-amber-300 px-1.5 py-0.5 rounded-full flex-shrink-0">⚠️ Weak Match</span>}
          </div>
          <span className="text-xs">{'⭐'.repeat(member.level)}</span>
        </div>
        <div className={`text-xs font-bold tabular-nums flex-shrink-0 ${hired ? 'text-blue-400' : 'text-zinc-500'}`}>
          {formatMoney(member.episodeFee)}/ep
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <span className="text-xs bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded capitalize">{member.role}</span>
        {member.genreStrengths?.slice(0, 2).map((g) => (
          <span key={g} className="text-xs bg-emerald-950/60 text-emerald-500 px-1.5 py-0.5 rounded">✓ {g}</span>
        ))}
        {member.genreWeaknesses?.slice(0, 2).map((g) => (
          <span key={g} className="text-xs bg-rose-950/60 text-rose-500 px-1.5 py-0.5 rounded">✗ {g}</span>
        ))}
      </div>
    </div>
  );
}

export default function CastCrew({ draft, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('main');

  const activeProductions = useGameStore((s) => s.studio?.activeProductions ?? []);
  const liveCast = useGameStore((s) => s.studio?.talentPool?.cast ?? CAST_POOL);
  const liveCrew = useGameStore((s) => s.studio?.talentPool?.crew ?? CREW_POOL);

  // IDs of actors locked into other active productions
  const contractedIds = new Set(
    activeProductions.flatMap((p) => [
      ...p.draft.mainCast.map((c) => c.id),
      ...p.draft.supportingCast.map((c) => c.id),
    ])
  );

  const mainCastIds = new Set(draft.mainCast.map((c) => c.id));
  const supportingIds = new Set(draft.supportingCast.map((c) => c.id));

  const toggleMain = (m: CastMember) => {
    if (mainCastIds.has(m.id)) {
      onUpdate({ mainCast: draft.mainCast.filter((c) => c.id !== m.id) });
    } else if (draft.mainCast.length < 5) {
      onUpdate({ mainCast: [...draft.mainCast, m] });
    }
  };

  const toggleSupporting = (m: CastMember) => {
    if (supportingIds.has(m.id)) {
      onUpdate({ supportingCast: draft.supportingCast.filter((c) => c.id !== m.id) });
    } else if (draft.supportingCast.length < 10) {
      onUpdate({ supportingCast: [...draft.supportingCast, m] });
    }
  };

  const castEpCost = [...draft.mainCast, ...draft.supportingCast].reduce((s, c) => s + c.weeklyFee, 0);
  const dirCost = draft.director?.episodeFee ?? 0;
  const writerCost = draft.writer?.episodeFee ?? 0;

  // Filter out fully unavailable; show rival-contracted and on-show as disabled
  const availableMain = liveCast.filter(
    (c) => c.role === 'main' && c.status !== 'unavailable' && !supportingIds.has(c.id)
  );
  const availableSupporting = liveCast.filter(
    (c) => c.role === 'supporting' && c.status !== 'unavailable' && !mainCastIds.has(c.id)
  );
  const directors = liveCrew.filter((c) => c.role === 'director');
  const writers = liveCrew.filter((c) => c.role === 'writer');

  const TABS: { id: Tab; label: string; shortLabel: string }[] = [
    { id: 'main', label: `Main (${draft.mainCast.length}/5)`, shortLabel: `Main ${draft.mainCast.length}/5` },
    { id: 'supporting', label: `Supp. (${draft.supportingCast.length}/10)`, shortLabel: `Supp ${draft.supportingCast.length}/10` },
    { id: 'crew', label: 'Key Crew', shortLabel: 'Crew' },
    { id: 'extras', label: 'Budget', shortLabel: '$$$' },
  ];

  return (
    <div className="space-y-5">
      {/* Cost Summary Bar */}
      <div className="bg-zinc-800/60 rounded-xl p-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Cast & Crew cost per episode</span>
        <span className="text-amber-400 font-bold tabular-nums">{formatMoney(castEpCost + dirCost + writerCost)}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === t.id ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Main Cast */}
      {tab === 'main' && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Select up to 5 lead actors. Higher star level = better quality boost.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
            {availableMain.map((m) => (
              <CastCard
                key={m.id}
                member={m}
                hired={mainCastIds.has(m.id)}
                onToggle={() => toggleMain(m)}
                contracted={contractedIds.has(m.id) && !mainCastIds.has(m.id)}
                rivalContracted={m.status === 'rival-contracted'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Supporting Cast */}
      {tab === 'supporting' && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Select up to 10 supporting actors.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
            {availableSupporting.map((m) => (
              <CastCard
                key={m.id}
                member={m}
                hired={supportingIds.has(m.id)}
                onToggle={() => toggleSupporting(m)}
                contracted={contractedIds.has(m.id) && !supportingIds.has(m.id)}
                rivalContracted={m.status === 'rival-contracted'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Key Crew */}
      {tab === 'crew' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Director {draft.director ? `— ${draft.director.name}` : ''}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {directors.map((d) => (
                <CrewCard
                  key={d.id} member={d}
                  hired={draft.director?.id === d.id}
                  onHire={() => onUpdate({ director: draft.director?.id === d.id ? null : d })}
                  draftGenre={draft.genre}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Scriptwriter {draft.writer ? `— ${draft.writer.name}` : ''}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {writers.map((w) => (
                <CrewCard
                  key={w.id} member={w}
                  hired={draft.writer?.id === w.id}
                  onHire={() => onUpdate({ writer: draft.writer?.id === w.id ? null : w })}
                  draftGenre={draft.genre}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Lines */}
      {tab === 'extras' && (
        <div className="space-y-6">
          {[
            { key: 'guestStarBudget', label: 'Guest Stars', max: 1000000, step: 25000, sublabel: 'Per-episode guest appearance budget' },
            { key: 'extrasBudget', label: 'Extras & Background', max: 100000, step: 5000, sublabel: 'Background actors per episode' },
            { key: 'stuntBudget', label: 'Stunt Artists', max: 300000, step: 10000, sublabel: 'Stunt performers and coordinators' },
          ].map((item) => {
            const val = draft[item.key as keyof ShowDraft] as number;
            const pct = (val / item.max) * 100;
            return (
              <div key={item.key}>
                <div className="flex justify-between mb-1.5">
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{item.label}</div>
                    <div className="text-xs text-zinc-500">{item.sublabel}</div>
                  </div>
                  <span className="text-amber-400 font-bold tabular-nums text-sm">{formatMoney(val)}</span>
                </div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute inset-x-0 h-2 rounded-full bg-zinc-700 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <input
                    type="range" min={0} max={item.max} step={item.step} value={val}
                    onChange={(e) => onUpdate({ [item.key]: Number(e.target.value) } as Partial<ShowDraft>)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
                  <span>$0</span><span>{formatMoney(item.max)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
