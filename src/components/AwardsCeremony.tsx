'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { AwardNomination } from '@/types/game';

function groupByYear(noms: AwardNomination[]): Record<number, AwardNomination[]> {
  return noms.reduce((acc, n) => {
    if (!acc[n.year]) acc[n.year] = [];
    acc[n.year].push(n);
    return acc;
  }, {} as Record<number, AwardNomination[]>);
}

export default function AwardsCeremony() {
  const studio = useGameStore(s => s.studio);
  const setScreen = useGameStore(s => s.setScreen);

  if (!studio) return null;

  const byYear = groupByYear(studio.awardNominations);
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  const totalNoms = studio.awardNominations.length;
  const totalWins = studio.awardNominations.filter(n => n.isWinner).length;

  const isAwardsSeason = studio.week >= 38 && studio.week <= 48;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm">← Dashboard</button>
            <span className="text-zinc-700">|</span>
            <h1 className="font-bold text-base text-white">🏆 Awards</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Season Banner */}
        {isAwardsSeason && (
          <div className="bg-amber-900/30 border border-amber-700 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🎬</div>
            <div className="font-bold text-amber-300 text-lg">Awards Season is Active!</div>
            <div className="text-sm text-amber-600 mt-1">
              {studio.week < 40 ? `Nominations announced in Week 40 (${40 - studio.week} weeks away)` :
               studio.week < 48 ? `Ceremony in Week 48 (${48 - studio.week} weeks away)` :
               'Ceremony has concluded. Results are in!'}
            </div>
          </div>
        )}

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

        {/* Awards by year */}
        {years.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-zinc-500">No awards yet. Create high-quality shows (65+) to get nominated.</p>
            <p className="text-zinc-600 text-sm mt-2">Nominations happen at Week 40. Ceremony at Week 48.</p>
          </div>
        ) : (
          years.map(year => {
            const noms = byYear[year];
            const wins = noms.filter(n => n.isWinner);
            const nonWins = noms.filter(n => !n.isWinner);
            return (
              <div key={year} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">{year} Awards</h2>
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
          })
        )}
      </div>
    </div>
  );
}
