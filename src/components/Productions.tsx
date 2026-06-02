'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ActiveProduction, AiredShow, RenewalOffer } from '@/types/game';
import { formatMoney } from '@/lib/gameLogic';
import QualityMeter from '@/components/ui/QualityMeter';
import { GENRE_PROFILES } from '@/data/genres';
import { NETWORKS } from '@/data/networks';

function RatingsChart({ ratings, baseRating }: { ratings: number[]; baseRating?: number }) {
  const max = Math.max(...ratings, 1, baseRating ?? 0);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {ratings.map((r, i) => {
        const h = Math.max(3, (r / max) * 40);
        const color = r >= (baseRating ?? 3) * 1.1 ? 'bg-emerald-500' : r >= (baseRating ?? 3) * 0.8 ? 'bg-amber-500' : 'bg-rose-500';
        return <div key={i} title={`Ep ${i + 1}: ${r}M`} className={`flex-1 rounded-sm ${color}`} style={{ height: `${h}px` }} />;
      })}
    </div>
  );
}

function ActiveProductionCard({ prod }: { prod: ActiveProduction }) {
  const genre = GENRE_PROFILES[prod.draft.genre];
  const network = NETWORKS.find(n => n.id === prod.deal.networkId);
  const pct = prod.totalEpisodes > 0 ? (prod.currentEpisode / prod.totalEpisodes) * 100 : 0;
  const avgRating = prod.episodeResults.length
    ? prod.episodeResults.reduce((s, e) => s + e.rating, 0) / prod.episodeResults.length
    : null;
  const latestRating = prod.episodeResults.at(-1)?.rating;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        <QualityMeter score={prod.quality} size="sm" showLabel={false} />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white">{prod.draft.title}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {genre.emoji} {genre.label} · S{prod.seasonNumber} · {network?.logo} {network?.name}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
              prod.status === 'airing' ? 'bg-green-900/40 text-green-400 border-green-800' :
              prod.status === 'in-production' ? 'bg-blue-900/40 text-blue-400 border-blue-800' :
              'bg-amber-900/40 text-amber-400 border-amber-800'
            }`}>
              {prod.status === 'in-production' ? `In Production (${prod.productionWeeks}w)` : prod.status}
            </span>
          </div>

          {/* Episode progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Episode {prod.currentEpisode} / {prod.totalEpisodes}</span>
              {latestRating && <span className="text-amber-400">{latestRating}M viewers (latest)</span>}
            </div>
            <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Ratings chart */}
          {prod.episodeResults.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-zinc-600 mb-1">Episode ratings</div>
              <RatingsChart ratings={prod.episodeResults.map(e => e.rating)} baseRating={prod.baseRating} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
        <div className="text-center">
          <div className="text-xs text-zinc-600">Quality</div>
          <div className="text-sm font-bold text-amber-400">{prod.quality}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-zinc-600">Avg Rating</div>
          <div className="text-sm font-bold text-white tabular-nums">{avgRating ? `${avgRating.toFixed(1)}M` : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-zinc-600">Per Episode</div>
          <div className="text-sm font-bold text-emerald-400 tabular-nums">{formatMoney(prod.deal.payPerEpisode)}</div>
        </div>
      </div>
    </div>
  );
}

function RenewalCard({ offer }: { offer: RenewalOffer }) {
  const acceptRenewal = useGameStore(s => s.acceptRenewal);
  const declineRenewal = useGameStore(s => s.declineRenewal);
  const network = NETWORKS.find(n => n.id === offer.networkId);
  const genre = GENRE_PROFILES[offer.genre];
  return (
    <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">📋</span>
        <div>
          <h3 className="font-bold text-emerald-300">{offer.showTitle} — Season {offer.proposedSeason}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{genre.emoji} {genre.label} · {network?.logo} {network?.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-zinc-900/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Episodes</div>
          <div className="font-bold text-white">{offer.episodesOffered}</div>
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Per Episode</div>
          <div className="font-bold text-emerald-400 tabular-nums">{formatMoney(offer.payPerEpisode)}</div>
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Expires</div>
          <div className="font-bold text-amber-400">W{offer.expiresWeek}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => acceptRenewal(offer.id)}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all"
        >
          ✓ Accept & Develop S{offer.proposedSeason}
        </button>
        <button
          onClick={() => declineRenewal(offer.id)}
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-semibold text-sm rounded-xl transition-all"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function AiredShowRow({ show }: { show: AiredShow }) {
  const [expanded, setExpanded] = useState(false);
  const network = NETWORKS.find(n => n.id === show.deal.networkId);
  const genre = GENRE_PROFILES[show.draft.genre];
  const statusColors: Record<string, string> = {
    completed: 'text-blue-400 bg-blue-900/30 border-blue-800',
    cancelled: 'text-rose-400 bg-rose-900/30 border-rose-800',
    renewed: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
  };
  const profitColor = show.profit >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div onClick={() => setExpanded(!expanded)} className="p-4 cursor-pointer hover:bg-zinc-800/40 transition-colors">
        <div className="flex items-center gap-4">
          <QualityMeter score={show.quality} size="sm" showLabel={false} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-white">{show.draft.title}</div>
                <div className="text-xs text-zinc-500">{genre.emoji} {genre.label} · S{show.seasonNumber} · {network?.logo} {network?.name} · {show.ratings.length} eps</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`text-sm font-bold tabular-nums ${profitColor}`}>{show.profit >= 0 ? '+' : ''}{formatMoney(show.profit)}</div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[show.status]}`}>{show.status}</span>
              </div>
            </div>
            <div className="mt-2">
              <RatingsChart ratings={show.ratings} />
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-900/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {[
              { label: 'Avg Rating', val: `${show.avgRating}M` },
              { label: 'Revenue', val: formatMoney(show.revenue) },
              { label: 'Cost', val: formatMoney(show.cost) },
              { label: 'Profit', val: `${show.profit >= 0 ? '+' : ''}${formatMoney(show.profit)}` },
            ].map(r => (
              <div key={r.label} className="bg-zinc-800 rounded-lg p-2 text-center">
                <div className="text-zinc-500">{r.label}</div>
                <div className="font-bold text-zinc-200 mt-0.5 tabular-nums">{r.val}</div>
              </div>
            ))}
          </div>
          {show.awardsNominations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {show.awardsWins.map(w => <span key={w} className="text-xs bg-amber-900/40 border border-amber-700 text-amber-300 px-2 py-0.5 rounded-full">🏆 {w}</span>)}
              {show.awardsNominations.filter(n => !show.awardsWins.includes(n)).map(n => <span key={n} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">📜 {n}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Productions() {
  const studio = useGameStore((s) => s.studio);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetDraft = useGameStore((s) => s.resetDraft);

  if (!studio) return null;

  const airedSorted = [...studio.airedShows].reverse();
  const totalRevenue = studio.airedShows.reduce((s, sh) => s + sh.revenue, 0);
  const totalProfit = studio.airedShows.reduce((s, sh) => s + sh.profit, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm">← Dashboard</button>
            <span className="text-zinc-700">|</span>
            <h1 className="font-bold text-base text-white">Productions</h1>
          </div>
          <button onClick={() => { resetDraft(); setScreen('show-creator'); }} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all">
            + New Show
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Summary */}
        {studio.airedShows.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '📺 Total Shows', val: studio.totalShows, color: 'text-blue-400' },
              { label: '🏆 Awards Won', val: studio.awardsWon, color: 'text-amber-400' },
              { label: '💵 Total Revenue', val: formatMoney(totalRevenue), color: 'text-emerald-400' },
              { label: '💰 Total Profit', val: formatMoney(totalProfit), color: totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Renewal Offers */}
        {studio.renewalOffers.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-white mb-3">📋 Renewal Offers</h2>
            <div className="space-y-3">
              {studio.renewalOffers.map(o => <RenewalCard key={o.id} offer={o} />)}
            </div>
          </div>
        )}

        {/* Active Productions */}
        {studio.activeProductions.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-white mb-3">🎬 Active Productions</h2>
            <div className="space-y-4">
              {studio.activeProductions.map(p => <ActiveProductionCard key={p.id} prod={p} />)}
            </div>
          </div>
        )}

        {/* Aired Shows */}
        {airedSorted.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-white mb-3">📚 Show History</h2>
            <div className="space-y-3">
              {airedSorted.map(s => <AiredShowRow key={s.id} show={s} />)}
            </div>
          </div>
        )}

        {studio.activeProductions.length === 0 && studio.airedShows.length === 0 && studio.renewalOffers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎥</div>
            <p className="text-zinc-500">No shows yet. Create your first show!</p>
            <button onClick={() => { resetDraft(); setScreen('show-creator'); }} className="mt-4 px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm">
              Create First Show
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
