'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AiredShow } from '@/types/game';
import { formatMoney } from '@/lib/gameLogic';
import QualityMeter from '@/components/ui/QualityMeter';
import { GENRE_PROFILES } from '@/data/genres';
import { NETWORKS } from '@/data/networks';

function RatingsChart({ ratings }: { ratings: number[] }) {
  const max = Math.max(...ratings, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {ratings.map((r, i) => {
        const h = Math.max(4, (r / max) * 40);
        const color = r >= 6 ? 'bg-emerald-500' : r >= 3 ? 'bg-amber-500' : r >= 1.5 ? 'bg-orange-500' : 'bg-rose-500';
        return (
          <div key={i} title={`Ep ${i + 1}: ${r}M`} className={`flex-1 rounded-sm ${color}`} style={{ height: `${h}px` }} />
        );
      })}
    </div>
  );
}

function ShowRow({ show }: { show: AiredShow }) {
  const [expanded, setExpanded] = useState(false);
  const network = NETWORKS.find((n) => n.id === show.deal.networkId);
  const genre = GENRE_PROFILES[show.draft.genre];

  const statusStyles: Record<string, string> = {
    renewed: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
    completed: 'text-blue-400 bg-blue-900/30 border-blue-800',
    cancelled: 'text-rose-400 bg-rose-900/30 border-rose-800',
    airing: 'text-amber-400 bg-amber-900/30 border-amber-800',
  };

  const profitColor = show.profit >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const profitSign = show.profit >= 0 ? '+' : '';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-start gap-4">
          <QualityMeter score={show.quality} size="sm" showLabel={false} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-base">{show.draft.title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {genre.emoji} {genre.label} &bull; {network?.logo} {network?.name} &bull; {show.draft.episodeCount} eps
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${statusStyles[show.status]}`}>
                  {show.status}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-zinc-600">Avg Rating</div>
                <div className="text-sm font-bold text-white tabular-nums">{show.avgRating}M</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">Revenue</div>
                <div className="text-sm font-bold text-emerald-400 tabular-nums">{formatMoney(show.revenue)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">Profit/Loss</div>
                <div className={`text-sm font-bold tabular-nums ${profitColor}`}>{profitSign}{formatMoney(show.profit)}</div>
              </div>
            </div>

            <div className="mt-3">
              <RatingsChart ratings={show.ratings} />
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 p-5 space-y-5 bg-zinc-900/50">
          {/* Financial Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Financials</h4>
              {[
                { label: 'Revenue', val: show.revenue, color: 'text-emerald-400' },
                { label: 'Production Cost', val: -show.cost, color: 'text-rose-400' },
                { label: 'Net Profit', val: show.profit, color: show.profit >= 0 ? 'text-emerald-400' : 'text-rose-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-zinc-500">{label}</span>
                  <span className={`font-bold tabular-nums ${color}`}>
                    {val >= 0 ? '+' : ''}{formatMoney(val)}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deal Terms</h4>
              {[
                { label: 'Pay/Episode', val: formatMoney(show.deal.payPerEpisode) },
                { label: 'Episodes Ordered', val: `${show.deal.episodesOrdered}` },
                { label: 'Marketing Budget', val: formatMoney(show.deal.marketingBudget) },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-200 font-medium tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cast */}
          {show.draft.mainCast.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Main Cast</h4>
              <div className="flex flex-wrap gap-2">
                {show.draft.mainCast.map((c) => (
                  <div key={c.id} className="bg-zinc-800 rounded-lg px-2.5 py-1.5 text-xs">
                    <span className="text-zinc-200 font-medium">{c.name}</span>
                    <span className="text-zinc-600 ml-1">{'⭐'.repeat(c.starLevel)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {show.awardsNominations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Awards</h4>
              <div className="flex flex-wrap gap-2">
                {show.awardsWins.map((a) => (
                  <span key={a} className="bg-amber-900/40 border border-amber-700 text-amber-300 text-xs px-2.5 py-1 rounded-full">
                    🏆 {a}
                  </span>
                ))}
                {show.awardsNominations.filter((a) => !show.awardsWins.includes(a)).map((a) => (
                  <span key={a} className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-2.5 py-1 rounded-full">
                    📜 {a} (nom.)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Episode Ratings */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Episode Ratings (millions)</h4>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
              {show.ratings.map((r, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg p-1.5 text-center">
                  <div className="text-xs text-zinc-600">Ep {i + 1}</div>
                  <div className={`text-xs font-bold tabular-nums ${r >= 5 ? 'text-emerald-400' : r >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>{r}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Productions() {
  const studio = useGameStore((s) => s.studio);
  const setScreen = useGameStore((s) => s.setScreen);

  if (!studio) return null;

  const shows = [...studio.airedShows].reverse();
  const totalRevenue = studio.airedShows.reduce((s, sh) => s + sh.revenue, 0);
  const totalProfit = studio.airedShows.reduce((s, sh) => s + sh.profit, 0);
  const avgRating = studio.airedShows.length
    ? studio.airedShows.reduce((s, sh) => s + sh.avgRating, 0) / studio.airedShows.length
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              ← Dashboard
            </button>
            <span className="text-zinc-700">|</span>
            <h1 className="font-bold text-base text-white">Productions</h1>
          </div>
          <button
            onClick={() => { setScreen('show-creator'); }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all"
          >
            + New Show
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Stats */}
        {studio.airedShows.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '📺 Total Shows', val: studio.totalShows, color: 'text-blue-400' },
              { label: '📈 Avg Rating', val: `${Math.round(avgRating * 10) / 10}M`, color: 'text-amber-400' },
              { label: '💵 Total Revenue', val: formatMoney(totalRevenue), color: 'text-emerald-400' },
              { label: '💰 Total Profit', val: formatMoney(totalProfit), color: totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400' },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Show List */}
        {shows.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-zinc-500 text-base">No shows yet. Create your first show!</p>
            <button
              onClick={() => setScreen('show-creator')}
              className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all"
            >
              Create First Show
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {shows.map((show) => (
              <ShowRow key={show.id} show={show} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
