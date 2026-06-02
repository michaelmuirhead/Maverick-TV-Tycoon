'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AwardNomination } from '@/types/game';
import { AWARD_SHOWS } from '@/lib/weekSimulation';

function groupByShowAndYear(noms: AwardNomination[]): Map<string, Map<number, AwardNomination[]>> {
  const result = new Map<string, Map<number, AwardNomination[]>>();
  for (const n of noms) {
    const showId = n.awardShowId ?? 'keystones';
    if (!result.has(showId)) result.set(showId, new Map());
    const byYear = result.get(showId)!;
    if (!byYear.has(n.year)) byYear.set(n.year, []);
    byYear.get(n.year)!.push(n);
  }
  return result;
}

function prestigeLabel(p: number): string {
  if (p >= 1.4) return 'Pinnacle';
  if (p >= 1.0) return 'Major';
  return 'Notable';
}
function prestigeColor(p: number): string {
  if (p >= 1.4) return 'text-amber-300';
  if (p >= 1.0) return 'text-blue-300';
  return 'text-zinc-400';
}

export default function AwardsCeremony() {
  const studio = useGameStore(s => s.studio);
  const setScreen = useGameStore(s => s.setScreen);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);

  if (!studio) return null;

  const byShowAndYear = groupByShowAndYear(studio.awardNominations);
  const totalNoms = studio.awardNominations.length;
  const totalWins = studio.awardNominations.filter(n => n.isWinner).length;

  // Schedule: what ceremonies are upcoming this year?
  const schedule = AWARD_SHOWS.map(show => {
    const processed = studio.processedAwardCeremonies ?? {};
    const nomDone = (processed[`${show.id}:nom`] ?? 0) >= studio.year;
    const cerDone = (processed[`${show.id}:cer`] ?? 0) >= studio.year;
    const weeksToNom = !nomDone ? (show.nominationsWeek >= studio.week ? show.nominationsWeek - studio.week : 52 - studio.week + show.nominationsWeek) : null;
    const weeksToCer = !cerDone ? (show.ceremonyWeek >= studio.week ? show.ceremonyWeek - studio.week : 52 - studio.week + show.ceremonyWeek) : null;
    return { show, nomDone, cerDone, weeksToNom, weeksToCer };
  }).sort((a, b) => {
    const aNext = a.weeksToNom ?? a.weeksToCer ?? 999;
    const bNext = b.weeksToNom ?? b.weeksToCer ?? 999;
    return aNext - bNext;
  });

  const displayShow = selectedShow ?? (AWARD_SHOWS.find(s => byShowAndYear.has(s.id))?.id ?? AWARD_SHOWS[0].id);
  const showDef = AWARD_SHOWS.find(s => s.id === displayShow)!;
  const byYear = byShowAndYear.get(displayShow);
  const years = byYear ? Array.from(byYear.keys()).sort((a, b) => b - a) : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm">← Dashboard</button>
            <span className="text-zinc-700">|</span>
            <h1 className="font-bold text-base text-white">🏆 Awards</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="text-blue-400 font-bold">{totalNoms} nominated</span>
            <span className="text-amber-400 font-bold">🏆 {totalWins} won</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '🎬 Nominations', val: totalNoms, color: 'text-blue-400' },
            { label: '🏆 Wins', val: totalWins, color: 'text-amber-400' },
            { label: '📊 Win Rate', val: totalNoms > 0 ? `${Math.round((totalWins / totalNoms) * 100)}%` : '—', color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Upcoming schedule */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">📅 This Year&apos;s Award Calendar</h2>
          <div className="space-y-2">
            {schedule.map(({ show, nomDone, cerDone, weeksToNom, weeksToCer }) => (
              <div key={show.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0">
                <span className="text-xl w-8 text-center">{show.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-zinc-200">{show.name}</div>
                  <div className={`text-xs ${prestigeColor(show.prestige)}`}>{prestigeLabel(show.prestige)} ceremony · Wk {show.nominationsWeek} noms · Wk {show.ceremonyWeek} show</div>
                </div>
                <div className="text-right text-xs">
                  {!nomDone && weeksToNom !== null && (
                    <div className="text-zinc-400">Noms in <span className="text-amber-400 font-bold">{weeksToNom}w</span></div>
                  )}
                  {nomDone && !cerDone && weeksToCer !== null && (
                    <div className="text-zinc-400">Ceremony in <span className="text-emerald-400 font-bold">{weeksToCer}w</span></div>
                  )}
                  {nomDone && cerDone && (
                    <div className="text-zinc-600">Completed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ceremony tabs */}
        <div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none mb-4">
            {AWARD_SHOWS.map(show => {
              const hasSome = byShowAndYear.has(show.id);
              return (
                <button
                  key={show.id}
                  onClick={() => setSelectedShow(show.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
                    displayShow === show.id
                      ? 'bg-amber-500 border-amber-500 text-black'
                      : hasSome
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }`}
                >
                  {show.emoji} {show.name}
                </button>
              );
            })}
          </div>

          {/* Selected ceremony content */}
          {years.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="text-4xl mb-3">{showDef.emoji}</div>
              <p className="text-zinc-500 font-semibold">{showDef.name}</p>
              <p className="text-zinc-600 text-sm mt-1">No nominations yet. Eligible shows need quality 60+.</p>
              <p className="text-zinc-700 text-xs mt-2">Nominations: Week {showDef.nominationsWeek} · Ceremony: Week {showDef.ceremonyWeek}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {years.map(year => {
                const noms = byYear!.get(year)!;
                const wins = noms.filter(n => n.isWinner);
                const nonWins = noms.filter(n => !n.isWinner);
                return (
                  <div key={year} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{showDef.emoji}</span>
                        <h2 className="text-base font-bold text-white">{showDef.name} — Year {year}</h2>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-sm text-blue-400">{noms.length} nominated</span>
                        {wins.length > 0 && <span className="text-sm text-amber-400 font-bold">🏆 {wins.length} won</span>}
                      </div>
                    </div>

                    {wins.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Winners</h3>
                        <div className="space-y-2">
                          {wins.map(w => (
                            <div key={w.id} className="flex items-center gap-3 bg-amber-900/20 border border-amber-800/50 rounded-xl p-3">
                              <span className="text-2xl">🏆</span>
                              <div>
                                <div className="font-bold text-amber-300 text-sm">{w.categoryName}</div>
                                <div className="text-xs text-zinc-400">{w.showTitle}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nonWins.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nominations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {nonWins.map(n => (
                            <div key={n.id} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2.5">
                              <span className="text-lg">📜</span>
                              <div>
                                <div className="text-sm text-zinc-300 font-medium">{n.categoryName}</div>
                                <div className="text-xs text-zinc-500">{n.showTitle}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
