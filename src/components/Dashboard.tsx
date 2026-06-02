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
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const markEventsRead = useGameStore((s) => s.markEventsRead);

  if (!studio) return null;

  const genre = GENRE_PROFILES[studio.specialty];
  const profitColor = studio.money >= 5_000_000 ? 'text-emerald-400' : studio.money >= 0 ? 'text-amber-400' : 'text-rose-400';
  const unreadCount = studio.events.filter(e => !e.isRead).length;
  const renewalCount = studio.renewalOffers.length;
  const activeAiringCount = studio.activeProductions.filter(p => p.status === 'airing').length;
  const activeInProdCount = studio.activeProductions.filter(p => p.status === 'in-production').length;

  const eventTypeIcon: Record<string, string> = {
    'ratings-spike': '📈', 'ratings-drop': '📉', 'viral-moment': '🔥',
    'scandal': '💥', 'critical-acclaim': '⭐', 'production-issue': '⚠️',
    'award-nomination': '🎬', 'award-win': '🏆', 'renewal-offer': '📋',
    'cancellation': '❌', 'talent-news': '🎭', 'rival-news': '📡', 'financial': '💰',
  };

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
                {genre.emoji} {genre.label} · Year {studio.year}, Week {studio.week}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className={`text-xl font-bold tabular-nums ${profitColor}`}>{formatMoney(studio.money)}</div>
              <div className="text-xs text-zinc-500">Available Funds</div>
            </div>
            <button
              onClick={() => { advanceWeek(); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>⏭</span> Advance Week
            </button>
            <button onClick={resetGame} className="text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
              New Game
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: '💰 Treasury', val: formatMoney(studio.money), color: profitColor },
            { label: '⭐ Reputation', val: `${studio.reputation}/100`, color: 'text-purple-400' },
            { label: '📺 Shows', val: studio.totalShows, color: 'text-blue-400' },
            { label: '🏆 Awards', val: studio.awardsWon, color: 'text-amber-400' },
            { label: '🎬 On Air', val: activeAiringCount + activeInProdCount, color: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
              <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Reputation bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>Studio Reputation</span><span>{studio.reputation}/100</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
              style={{ width: `${studio.reputation}%` }}
            />
          </div>
        </div>

        {/* Renewal Offers Banner */}
        {renewalCount > 0 && (
          <div
            onClick={() => setScreen('productions')}
            className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <div className="font-bold text-emerald-300">{renewalCount} Renewal Offer{renewalCount > 1 ? 's' : ''} Waiting</div>
                <div className="text-xs text-emerald-600">Networks want to order more episodes</div>
              </div>
            </div>
            <span className="text-emerald-400 text-sm font-bold">View →</span>
          </div>
        )}

        {/* Active Productions Summary */}
        {studio.activeProductions.length > 0 && (
          <div
            onClick={() => setScreen('productions')}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 cursor-pointer transition-colors"
          >
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Currently On Air</h3>
            <div className="space-y-2">
              {studio.activeProductions.slice(0, 3).map(prod => {
                const g = GENRE_PROFILES[prod.draft.genre];
                const progressPct = prod.totalEpisodes > 0 ? (prod.currentEpisode / prod.totalEpisodes) * 100 : 0;
                const latestRating = prod.episodeResults.at(-1)?.rating;
                return (
                  <div key={prod.id} className="flex items-center gap-3">
                    <span className="text-lg">{g.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white truncate">{prod.draft.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {latestRating && <span className="text-xs text-amber-400 tabular-nums">{latestRating}M</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            prod.status === 'airing' ? 'bg-green-900/50 text-green-400' : 'bg-zinc-700 text-zinc-400'
                          }`}>{prod.status === 'in-production' ? `🎥 ${prod.productionWeeks}w` : `Ep ${prod.currentEpisode}/${prod.totalEpisodes}`}</span>
                        </div>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-zinc-700 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div>
          <h2 className="text-base font-bold text-white mb-3">Studio Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { emoji: '🎬', label: 'Create Show', sub: 'Develop new content', screen: 'show-creator' as const, accent: 'amber', action: () => { resetDraft(); setScreen('show-creator'); } },
              { emoji: '📡', label: 'Pitch to Networks', sub: studio.currentDraft?.title ? `Ready: "${studio.currentDraft.title}"` : 'Create a show first', screen: 'network-hub' as const, accent: 'blue', disabled: !studio.currentDraft?.title, action: () => setScreen('network-hub') },
              { emoji: '📊', label: 'Productions', sub: `${studio.activeProductions.length} active`, screen: 'productions' as const, accent: 'emerald', action: () => setScreen('productions') },
              { emoji: '🎭', label: 'Talent Market', sub: 'Hire cast & crew', screen: 'talent-market' as const, accent: 'purple', action: () => setScreen('talent-market') },
              { emoji: '🏆', label: 'Awards', sub: `${studio.awardNominations.length} nominations`, screen: 'awards' as const, accent: 'yellow', action: () => setScreen('awards') },
              { emoji: '🏢', label: 'Rivals', sub: `${studio.rivalStudios.length} competitors`, screen: 'rivals' as const, accent: 'rose', action: () => setScreen('rivals') },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                disabled={item.disabled}
                className={`rounded-xl p-4 text-left transition-all duration-150 group border ${
                  item.disabled
                    ? 'bg-zinc-900/40 border-zinc-800 opacity-50 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 active:scale-95'
                }`}
              >
                <div className="text-2xl mb-2">{item.emoji}</div>
                <div className="font-bold text-sm text-white">{item.label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Events Feed */}
        {studio.events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                📰 Latest News
                {unreadCount > 0 && (
                  <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </h2>
              {unreadCount > 0 && (
                <button onClick={markEventsRead} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="space-y-2">
              {studio.events.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    !event.isRead ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 opacity-70'
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{eventTypeIcon[event.type] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{event.headline}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{event.description}</div>
                    {(event.impact?.money || event.impact?.reputation) && (
                      <div className="flex gap-3 mt-1">
                        {event.impact.money && (
                          <span className={`text-xs font-bold ${event.impact.money > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {event.impact.money > 0 ? '+' : ''}{formatMoney(event.impact.money)}
                          </span>
                        )}
                        {event.impact.reputation && (
                          <span className={`text-xs font-bold ${event.impact.reputation > 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                            {event.impact.reputation > 0 ? '+' : ''}{event.impact.reputation} rep
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 flex-shrink-0">W{event.week}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
