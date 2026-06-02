'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/lib/gameLogic';
import { GENRE_PROFILES } from '@/data/genres';

export default function Dashboard() {
  const studio = useGameStore((s) => s.studio);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetDraft = useGameStore((s) => s.resetDraft);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!studio) return null;

  const genre = GENRE_PROFILES[studio.specialty];
  const profitColor = studio.money >= 10_000_000 ? 'text-emerald-400' : studio.money >= 5_000_000 ? 'text-amber-400' : studio.money < 0 ? 'text-rose-400' : 'text-zinc-300';

  const repBar = Math.min(100, Math.max(0, studio.reputation));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="font-black text-lg text-white">{studio.name}</h1>
              <p className="text-xs text-zinc-500">
                {genre.emoji} {genre.label} Studio &bull; Year {studio.year}, Week {studio.week}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-xl font-bold tabular-nums ${profitColor}`}>{formatMoney(studio.money)}</div>
              <div className="text-xs text-zinc-500">Available Funds</div>
            </div>
            <button
              onClick={resetGame}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              New Game
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">💰 Treasury</div>
            <div className={`text-2xl font-bold tabular-nums ${profitColor}`}>{formatMoney(studio.money)}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">⭐ Reputation</div>
            <div className="text-2xl font-bold text-purple-400">{studio.reputation}</div>
            <div className="mt-2 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${repBar}%` }} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">📺 Shows Made</div>
            <div className="text-2xl font-bold text-blue-400">{studio.totalShows}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">🏆 Awards Won</div>
            <div className="text-2xl font-bold text-amber-400">{studio.awardsWon}</div>
          </div>
        </div>

        {/* Action Cards */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">What do you want to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => { resetDraft(); setScreen('show-creator'); }}
              className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-700/50 hover:border-amber-500 rounded-2xl p-6 text-left transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">🎬</div>
              <div className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors">Create New Show</div>
              <div className="text-sm text-zinc-500 mt-1">Develop your next production from scratch</div>
            </button>

            <button
              onClick={() => setScreen('network-hub')}
              disabled={!studio.currentDraft?.title}
              className={`rounded-2xl p-6 text-left transition-all duration-200 group border ${
                studio.currentDraft?.title
                  ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/50 hover:border-blue-500'
                  : 'bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-3xl mb-3">📡</div>
              <div className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">Pitch to Networks</div>
              <div className="text-sm text-zinc-500 mt-1">
                {studio.currentDraft?.title
                  ? `Ready: "${studio.currentDraft.title}"`
                  : 'Create a show first'}
              </div>
            </button>

            <button
              onClick={() => setScreen('productions')}
              className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/50 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">Productions</div>
              <div className="text-sm text-zinc-500 mt-1">
                {studio.airedShows.length > 0 ? `${studio.airedShows.length} show${studio.airedShows.length > 1 ? 's' : ''} in the books` : 'No shows yet'}
              </div>
            </button>
          </div>
        </div>

        {/* Recent Shows */}
        {studio.airedShows.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Recent Shows</h2>
            <div className="space-y-3">
              {[...studio.airedShows].reverse().slice(0, 3).map((show) => {
                const statusColor = {
                  renewed: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
                  completed: 'text-blue-400 bg-blue-900/30 border-blue-800',
                  cancelled: 'text-rose-400 bg-rose-900/30 border-rose-800',
                  airing: 'text-amber-400 bg-amber-900/30 border-amber-800',
                }[show.status];
                const profitSign = show.profit >= 0 ? '+' : '';
                const pColor = show.profit >= 0 ? 'text-emerald-400' : 'text-rose-400';
                return (
                  <div key={show.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{GENRE_PROFILES[show.draft.genre].emoji}</span>
                      <div>
                        <div className="font-semibold text-white">{show.draft.title}</div>
                        <div className="text-xs text-zinc-500">
                          {GENRE_PROFILES[show.draft.genre].label} &bull; {show.draft.episodeCount} eps &bull; Avg Rating: {show.avgRating}M
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-sm font-bold ${pColor}`}>{profitSign}{formatMoney(show.profit)}</div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${statusColor}`}>{show.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {studio.airedShows.length === 0 && studio.totalShows === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <div className="text-4xl mb-3">🎥</div>
            <p className="text-base font-medium text-zinc-500">Your studio is empty. Create your first show!</p>
          </div>
        )}
      </div>
    </div>
  );
}
