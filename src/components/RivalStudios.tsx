'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { RivalStudio } from '@/types/game';
import { GENRE_PROFILES } from '@/data/genres';
import { NETWORKS } from '@/data/networks';

function RivalCard({ rival }: { rival: RivalStudio }) {
  const airing = rival.activeShows.filter(s => s.status === 'airing');
  const repColor = rival.reputation >= 70 ? 'text-rose-400' : rival.reputation >= 50 ? 'text-amber-400' : 'text-zinc-400';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{rival.logo}</span>
          <div>
            <h3 className="font-bold text-white text-base">{rival.name}</h3>
            <p className="text-xs text-zinc-500 italic">{rival.tagline}</p>
          </div>
        </div>
        <div className={`text-right`}>
          <div className={`text-lg font-bold tabular-nums ${repColor}`}>{rival.reputation}</div>
          <div className="text-xs text-zinc-600">reputation</div>
        </div>
      </div>

      {/* Rep bar */}
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${rival.reputation}%` }} />
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {rival.specialty.map(g => {
          const profile = GENRE_PROFILES[g];
          return <span key={g} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{profile?.emoji} {profile?.label ?? g}</span>;
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Total Shows', val: rival.totalShows },
          { label: 'Awards', val: rival.awardsWon },
          { label: 'On Air', val: airing.length },
        ].map(s => (
          <div key={s.label} className="bg-zinc-800/60 rounded-lg p-2">
            <div className="text-lg font-bold text-white">{s.val}</div>
            <div className="text-xs text-zinc-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active shows */}
      {airing.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Current Shows</div>
          <div className="space-y-1.5">
            {airing.map(show => {
              const network = NETWORKS.find(n => n.id === show.networkId);
              const g = GENRE_PROFILES[show.genre];
              return (
                <div key={show.id} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{g?.emoji}</span>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{show.title}</div>
                      <div className="text-xs text-zinc-500">S{show.seasonNumber} · {network?.logo} {network?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400 tabular-nums">{show.avgRating.toFixed(1)}M</div>
                    <div className="text-xs text-zinc-600">Q: {show.quality}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RivalStudios() {
  const studio = useGameStore(s => s.studio);
  const setScreen = useGameStore(s => s.setScreen);

  if (!studio) return null;

  const sorted = [...studio.rivalStudios].sort((a, b) => b.reputation - a.reputation);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center">
          <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm mr-3">← Dashboard</button>
          <span className="text-zinc-700 mr-3">|</span>
          <h1 className="font-bold text-base text-white">🏢 Rival Studios</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5 md:space-y-6">
        {/* Your position */}
        <div className="bg-zinc-900 border border-amber-800/40 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Your Studio</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎬</span>
              <div>
                <div className="font-bold text-white text-base">{studio.name}</div>
                <div className="text-xs text-zinc-500">
                  {GENRE_PROFILES[studio.specialty]?.emoji} {GENRE_PROFILES[studio.specialty]?.label} Specialist
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-400">{studio.reputation}</div>
              <div className="text-xs text-zinc-600">reputation</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${studio.reputation}%` }} />
          </div>
        </div>

        <h2 className="text-base font-bold text-white">Competition</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(rival => <RivalCard key={rival.id} rival={rival} />)}
        </div>
      </div>
    </div>
  );
}
