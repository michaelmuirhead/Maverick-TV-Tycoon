'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ActiveProduction, AiredShow, RenewalOffer } from '@/types/game';
import { formatMoney, getCreativeFitHeatMap } from '@/lib/gameLogic';
import QualityMeter from '@/components/ui/QualityMeter';
import { GENRE_PROFILES } from '@/data/genres';
import { NETWORKS } from '@/data/networks';

function scoreColor(s: number): string {
  if (s >= 80) return 'text-emerald-400';
  if (s >= 65) return 'text-amber-400';
  if (s >= 50) return 'text-orange-400';
  return 'text-rose-500';
}

function fitColor(fit: number): string {
  if (fit >= 95) return 'bg-emerald-500 text-black';
  if (fit >= 75) return 'bg-emerald-700/70 text-emerald-200';
  if (fit >= 55) return 'bg-amber-700/70 text-amber-200';
  if (fit >= 35) return 'bg-orange-800/70 text-orange-200';
  return 'bg-rose-900/80 text-rose-300';
}

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

function HeatMapDisplay({ draft }: { draft: AiredShow['draft'] }) {
  const sections = getCreativeFitHeatMap(draft);
  const overallFit = Math.round(sections.reduce((s, sec) => s + sec.avgFit, 0) / sections.length);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">🗺️ Creative Fit Heat Map</span>
        <span className={`text-xs font-bold tabular-nums ${overallFit >= 80 ? 'text-emerald-400' : overallFit >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
          Overall {overallFit}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sections.map(sec => (
          <div key={sec.title} className="bg-zinc-800/60 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">{sec.emoji} {sec.title}</span>
              <span className={`text-xs font-bold ${sec.avgFit >= 80 ? 'text-emerald-400' : sec.avgFit >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{sec.avgFit}%</span>
            </div>
            <div className="flex gap-1">
              {sec.cells.map(cell => (
                <div key={cell.key} className={`flex-1 rounded-lg p-1.5 text-center ${fitColor(cell.fit)}`} title={`${cell.label}: ${cell.value} (ideal ${cell.idealLo}–${cell.idealHi})`}>
                  <div className="text-xs font-bold leading-none">{cell.isPerfect ? '⭐' : cell.fit}</div>
                  <div className="text-xs opacity-70 mt-0.5 truncate">{cell.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-600">⭐ = perfect match · values show % fit to genre ideal</p>
    </div>
  );
}

const MARKETING_TIERS = [
  { label: '📱 Social Buzz', spend: 100_000, hypeGain: 10, desc: '+10 hype' },
  { label: '📰 PR Campaign', spend: 300_000, hypeGain: 20, desc: '+20 hype' },
  { label: '📺 TV Spots', spend: 700_000, hypeGain: 30, desc: '+30 hype' },
  { label: '🎬 Premiere Gala', spend: 1_500_000, hypeGain: 50, desc: '+50 hype' },
];

function ActiveProductionCard({ prod }: { prod: ActiveProduction }) {
  const addMarketing = useGameStore(s => s.addMarketing);
  const reshootProduction = useGameStore(s => s.reshootProduction);
  const studio = useGameStore(s => s.studio);
  const genre = GENRE_PROFILES[prod.draft.genre];
  const network = NETWORKS.find(n => n.id === prod.deal.networkId);
  const pct = prod.totalEpisodes > 0 ? (prod.currentEpisode / prod.totalEpisodes) * 100 : 0;
  const avgRating = prod.episodeResults.length
    ? prod.episodeResults.reduce((s, e) => s + e.rating, 0) / prod.episodeResults.length
    : null;
  const latestRating = prod.episodeResults.at(-1)?.rating;

  const episodesWithScores = prod.episodeResults.filter(e => e.criticScore !== undefined);
  const runningCritic = episodesWithScores.length
    ? Math.round(episodesWithScores.reduce((s, e) => s + (e.criticScore ?? 0), 0) / episodesWithScores.length)
    : null;
  const runningAudience = episodesWithScores.length
    ? Math.round(episodesWithScores.reduce((s, e) => s + (e.audienceScore ?? 0), 0) / episodesWithScores.length)
    : null;

  const reshootable = prod.status === 'in-production' && !prod.wasReshot;
  const reshootCost = Math.round(
    ([...prod.draft.mainCast, ...prod.draft.supportingCast].reduce((s, c) => s + c.weeklyFee, 0) +
     (prod.draft.director?.episodeFee ?? 0) + (prod.draft.writer?.episodeFee ?? 0) +
     Object.values(prod.draft.production).reduce((s, v) => s + v, 0)) * 0.5
  );

  const hype = prod.hypeLevel ?? 0;

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
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                prod.status === 'airing' ? 'bg-green-900/40 text-green-400 border-green-800' :
                prod.status === 'in-production' ? 'bg-blue-900/40 text-blue-400 border-blue-800' :
                'bg-amber-900/40 text-amber-400 border-amber-800'
              }`}>
                {prod.status === 'in-production' ? `In Production (${prod.productionWeeks}w)` : prod.status}
              </span>
              {prod.deal.releaseStrategy === 'all-at-once' && (
                <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">💥 Binge Drop</span>
              )}
              {hype > 0 && (
                <span className="text-xs bg-pink-900/40 text-pink-400 border border-pink-800 px-2 py-0.5 rounded-full">🔥 Hype {hype}</span>
              )}
            </div>
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

          {prod.episodeResults.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-zinc-600 mb-1">Episode ratings</div>
              <RatingsChart ratings={prod.episodeResults.map(e => e.rating)} baseRating={prod.baseRating} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-zinc-800">
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
        <div className="text-center">
          <div className="text-xs text-zinc-600">🎬 Critics</div>
          <div className={`text-sm font-bold tabular-nums ${runningCritic !== null ? scoreColor(runningCritic) : 'text-zinc-600'}`}>
            {runningCritic !== null ? `${runningCritic}` : '—'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-zinc-600">🍿 Audience</div>
          <div className={`text-sm font-bold tabular-nums ${runningAudience !== null ? scoreColor(runningAudience) : 'text-zinc-600'}`}>
            {runningAudience !== null ? `${runningAudience}` : '—'}
          </div>
        </div>
      </div>

      {/* Build Hype — only when in production */}
      {prod.status === 'in-production' && (
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-300">🔥 Build Hype</span>
            <span className="text-xs text-zinc-500">Hype boosts premiere-week ratings by up to +25%</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${hype}%` }} />
            </div>
            <span className="text-xs font-bold text-pink-400 tabular-nums w-8 text-right">{hype}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {MARKETING_TIERS.map(t => (
              <button
                key={t.label}
                disabled={!studio || studio.money < t.spend || hype >= 100}
                onClick={() => addMarketing(prod.id, t.spend, t.hypeGain)}
                className="text-left px-2.5 py-1.5 bg-zinc-800 hover:bg-pink-900/30 border border-zinc-700 hover:border-pink-800/60 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="text-xs font-semibold text-zinc-200">{t.label}</div>
                <div className="text-xs text-zinc-500">{formatMoney(t.spend)} · {t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reshoot — only available before the season airs */}
      {reshootable && (
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-300">🎞️ Order Reshoots</div>
              <div className="text-xs text-zinc-500 mt-0.5">Fix weak scenes before the season airs. +5 quality · one-time.</div>
            </div>
            <button
              disabled={!studio || studio.money < reshootCost}
              onClick={() => reshootProduction(prod.id)}
              className="ml-3 px-3 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-800/60 text-amber-300 font-semibold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              Reshoot · {formatMoney(reshootCost)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RenewalCard({ offer }: { offer: RenewalOffer }) {
  const acceptRenewal = useGameStore(s => s.acceptRenewal);
  const declineRenewal = useGameStore(s => s.declineRenewal);
  const negotiateRenewal = useGameStore(s => s.negotiateRenewal);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [useFlashback, setUseFlashback] = useState(!!offer.includeFlashback);
  const [useTwoPartFinale, setUseTwoPartFinale] = useState(!!offer.includeTwoPartFinale);
  const network = NETWORKS.find(n => n.id === offer.networkId);
  const genre = GENRE_PROFILES[offer.genre];
  const score = offer.networkRenewalScore ?? 60;
  const isAccepted = offer.negotiationState === 'counter-accepted';

  const scoreLabel = score >= 80 ? 'Enthusiastic' : score >= 65 ? 'Interested' : score >= 50 ? 'Cautious' : 'Reluctant';
  const scoreBg = score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : score >= 50 ? 'text-orange-400' : 'text-rose-400';

  const negotiateTiers = [
    { label: `+10%`, pay: Math.round(offer.payPerEpisode * 1.10), prob: 'High chance' },
    { label: `+20%`, pay: Math.round(offer.payPerEpisode * 1.20), prob: 'Good chance' },
    { label: `+30%`, pay: Math.round(offer.payPerEpisode * 1.30), prob: 'Risk it' },
  ];

  return (
    <div className={`rounded-2xl p-5 border ${isAccepted ? 'bg-emerald-950/50 border-emerald-700/60' : 'bg-emerald-950/40 border-emerald-800/60'}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">📋</span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-emerald-300">{offer.showTitle} — Season {offer.proposedSeason}</h3>
            {offer.plannedEnding && (
              <span className="text-xs bg-amber-900/40 border border-amber-700/60 text-amber-300 px-2 py-0.5 rounded-full flex-shrink-0">📖 Final Season</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{genre.emoji} {genre.label} · {network?.logo} {network?.name}</p>
        </div>
      </div>

      {/* Network enthusiasm bar */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-zinc-500 w-20 flex-shrink-0">Network interest</span>
        <div className="flex-1 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : score >= 50 ? 'bg-orange-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-xs font-bold tabular-nums w-20 text-right ${scoreBg}`}>{score} — {scoreLabel}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-zinc-900/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Episodes</div>
          <div className="font-bold text-white">{offer.episodesOffered}</div>
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Per Episode</div>
          <div className={`font-bold tabular-nums ${isAccepted ? 'text-emerald-300' : 'text-emerald-400'}`}>{formatMoney(offer.payPerEpisode)}</div>
          {isAccepted && <div className="text-xs text-emerald-500 mt-0.5">↑ negotiated</div>}
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Expires</div>
          <div className="font-bold text-amber-400">W{offer.expiresWeek}</div>
        </div>
      </div>

      {/* Special episode options */}
      {(offer.includeFlashback || offer.includeTwoPartFinale) && (
        <div className="mb-3 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 space-y-2">
          <div className="text-xs font-semibold text-zinc-400 mb-1">✨ Network suggests special episodes:</div>
          {offer.includeFlashback && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useFlashback} onChange={e => setUseFlashback(e.target.checked)} className="rounded" />
              <span className="text-xs text-zinc-300">
                📼 Flashback episode (Ep {offer.flashbackEpisodeNum})
                <span className="text-zinc-500 ml-1">+10% ratings · fans +15 · critics −8</span>
              </span>
            </label>
          )}
          {offer.includeTwoPartFinale && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useTwoPartFinale} onChange={e => setUseTwoPartFinale(e.target.checked)} className="rounded" />
              <span className="text-xs text-zinc-300">
                🎬 Two-part finale (Eps {offer.episodesOffered - 1}–{offer.episodesOffered})
                <span className="text-zinc-500 ml-1">+22% ratings · critics +12 · fans +10</span>
              </span>
            </label>
          )}
        </div>
      )}

      {showNegotiate && !isAccepted && (
        <div className="mb-3 bg-zinc-900/70 rounded-xl p-3 border border-zinc-700">
          <div className="text-xs font-semibold text-zinc-300 mb-2">⚖️ Counter Offer — pick your ask:</div>
          <div className="text-xs text-zinc-500 mb-3">Higher asks earn more but risk losing the deal. Studio reputation influences success.</div>
          <div className="space-y-1.5">
            {negotiateTiers.map(t => (
              <button
                key={t.label}
                onClick={() => { negotiateRenewal(offer.id, t.pay); setShowNegotiate(false); }}
                className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800 hover:bg-emerald-900/30 border border-zinc-700 hover:border-emerald-700/60 rounded-lg transition-all"
              >
                <span className="text-xs font-semibold text-zinc-200">{t.label} → {formatMoney(t.pay)}/ep</span>
                <span className="text-xs text-zinc-500">{t.prob}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowNegotiate(false)} className="mt-2 w-full text-xs text-zinc-600 hover:text-zinc-400 py-1">Cancel</button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => acceptRenewal(offer.id, { includeFlashback: useFlashback, includeTwoPartFinale: useTwoPartFinale })}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all"
        >
          ✓ Accept & Develop S{offer.proposedSeason}
        </button>
        {!isAccepted && (
          <button
            onClick={() => setShowNegotiate(!showNegotiate)}
            className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl transition-all"
            title="Negotiate for better terms"
          >⚖️</button>
        )}
        <button
          onClick={() => declineRenewal(offer.id)}
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-semibold text-sm rounded-xl transition-all"
        >Decline</button>
      </div>
    </div>
  );
}

function AiredShowRow({ show }: { show: AiredShow }) {
  const [expanded, setExpanded] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const startSpinoff = useGameStore(s => s.startSpinoff);
  const startReboot = useGameStore(s => s.startReboot);
  const startRevival = useGameStore(s => s.startRevival);
  const renewalOffers = useGameStore(s => s.studio?.renewalOffers ?? []);
  const network = NETWORKS.find(n => n.id === show.deal.networkId);
  const genre = GENRE_PROFILES[show.draft.genre];
  const genrePopularity = useGameStore(s => s.studio?.genrePopularity ?? {});
  const genrePop = genrePopularity[show.draft.genre] ?? 50;
  const statusColors: Record<string, string> = {
    completed: 'text-blue-400 bg-blue-900/30 border-blue-800',
    cancelled: 'text-rose-400 bg-rose-900/30 border-rose-800',
    renewed: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
  };
  const profitColor = show.profit >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const hasActiveRenewal = renewalOffers.some(o => o.showId === show.draft.id || o.productionId === show.id);
  const isShoppable = (show.status === 'cancelled' || show.status === 'completed') && !hasActiveRenewal;

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
                {show.avgCriticScore !== undefined && (
                  <span className={`text-xs font-bold tabular-nums ${scoreColor(show.avgCriticScore)}`} title="Critic Score">🎬{show.avgCriticScore}</span>
                )}
                {show.avgAudienceScore !== undefined && (
                  <span className={`text-xs font-bold tabular-nums ${scoreColor(show.avgAudienceScore)}`} title="Audience Score">🍿{show.avgAudienceScore}</span>
                )}
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
          {/* Review scores */}
          {(show.avgCriticScore !== undefined || show.avgAudienceScore !== undefined) && (
            <div className="flex gap-3">
              {show.avgCriticScore !== undefined && (
                <div className={`flex-1 bg-zinc-800 rounded-xl p-3 text-center border ${show.avgCriticScore >= 80 ? 'border-emerald-800/50' : show.avgCriticScore >= 65 ? 'border-amber-800/50' : 'border-rose-900/50'}`}>
                  <div className="text-xs text-zinc-500 mb-1">🎬 Critic Score</div>
                  <div className={`text-2xl font-black tabular-nums ${scoreColor(show.avgCriticScore)}`}>{show.avgCriticScore}<span className="text-sm font-normal text-zinc-600">/100</span></div>
                  <div className={`text-xs mt-0.5 ${scoreColor(show.avgCriticScore)}`}>
                    {show.avgCriticScore >= 90 ? 'Universal Acclaim' : show.avgCriticScore >= 80 ? 'Critical Darling' : show.avgCriticScore >= 65 ? 'Generally Favorable' : show.avgCriticScore >= 50 ? 'Mixed Reviews' : 'Generally Unfavorable'}
                  </div>
                </div>
              )}
              {show.avgAudienceScore !== undefined && (
                <div className={`flex-1 bg-zinc-800 rounded-xl p-3 text-center border ${show.avgAudienceScore >= 80 ? 'border-emerald-800/50' : show.avgAudienceScore >= 65 ? 'border-amber-800/50' : 'border-rose-900/50'}`}>
                  <div className="text-xs text-zinc-500 mb-1">🍿 Audience Score</div>
                  <div className={`text-2xl font-black tabular-nums ${scoreColor(show.avgAudienceScore)}`}>{show.avgAudienceScore}<span className="text-sm font-normal text-zinc-600">/100</span></div>
                  <div className={`text-xs mt-0.5 ${scoreColor(show.avgAudienceScore)}`}>
                    {show.avgAudienceScore >= 90 ? 'Fan Favourite' : show.avgAudienceScore >= 80 ? 'Crowd Pleaser' : show.avgAudienceScore >= 65 ? 'Well Received' : show.avgAudienceScore >= 50 ? 'Divisive' : 'Audience Backlash'}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Genre popularity trend */}
          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2 text-xs">
            <span className="text-zinc-400">
              {genre.emoji} {genre.label} popularity now
            </span>
            <span className={`font-bold tabular-nums ${genrePop >= 70 ? 'text-emerald-400' : genrePop >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
              {genrePop >= 80 ? '🔥' : genrePop >= 60 ? '📈' : genrePop <= 25 ? '❄️' : '📊'} {genrePop}/100
            </span>
          </div>

          {show.awardsNominations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {show.awardsWins.map(w => <span key={w} className="text-xs bg-amber-900/40 border border-amber-700 text-amber-300 px-2 py-0.5 rounded-full">🏆 {w}</span>)}
              {show.awardsNominations.filter(n => !show.awardsWins.includes(n)).map(n => <span key={n} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">📜 {n}</span>)}
            </div>
          )}

          {/* Creative Fit Heat Map toggle */}
          <div className="pt-1 border-t border-zinc-800">
            <button
              onClick={() => setShowHeatMap(!showHeatMap)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
            >
              {showHeatMap ? '▲ Hide' : '▼ Show'} Creative Fit Heat Map
            </button>
            {showHeatMap && <HeatMapDisplay draft={show.draft} />}
          </div>

          {/* Shop to other networks */}
          {isShoppable && (
            <div className="pt-1 border-t border-zinc-800">
              <div className="text-xs text-zinc-600 mb-2">
                {show.status === 'cancelled' ? '📡 Cancelled — shop to another network?' : '📡 No renewal yet — explore other networks?'}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); startRevival(show.id); }}
                className="w-full py-2 bg-amber-900/30 hover:bg-amber-800/50 border border-amber-700/60 text-amber-300 font-semibold text-xs rounded-xl transition-all"
              >
                🏪 Shop to Other Networks
              </button>
            </div>
          )}

          {/* Extend universe */}
          <div className="pt-1 border-t border-zinc-800">
            <div className="text-xs text-zinc-600 mb-2">Extend this universe</div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); startSpinoff(show.id); }}
                className="flex-1 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/60 text-blue-300 font-semibold text-xs rounded-xl transition-all"
              >
                🔀 Create Spin-off
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); startReboot(show.id); }}
                className="flex-1 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-800/60 text-purple-300 font-semibold text-xs rounded-xl transition-all"
              >
                🔄 Reboot Series
              </button>
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
  const resetDraft = useGameStore((s) => s.resetDraft);

  if (!studio) return null;

  const airedSorted = [...studio.airedShows].reverse();
  const totalRevenue = studio.airedShows.reduce((s, sh) => s + sh.revenue, 0);
  const totalProfit = studio.airedShows.reduce((s, sh) => s + sh.profit, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
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
