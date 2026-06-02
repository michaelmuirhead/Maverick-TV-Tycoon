'use client';
import React from 'react';
import { ShowDraft, AiredShow } from '@/types/game';
import {
  calcShowQuality, calcEpisodeCost, calcCastQuality,
  calcProductionQuality, calcPostProductionQuality, calcCreativeGenreFit,
  formatMoney, getQualityLabel, calcParentBoost, calcRevivalBoost,
} from '@/lib/gameLogic';
import QualityMeter from '@/components/ui/QualityMeter';
import { GENRE_PROFILES } from '@/data/genres';

interface Props {
  draft: ShowDraft;
  studioMoney: number;
  buildingBonuses?: { production?: number; postProduction?: number };
  airedShows?: AiredShow[];
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', purple: 'bg-purple-500',
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="font-bold text-zinc-200 tabular-nums">{Math.round(score)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
        <div className={`h-full rounded-full ${colors[color] ?? 'bg-amber-500'} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function ReviewStep({ draft, studioMoney, buildingBonuses, airedShows }: Props) {
  const quality = calcShowQuality(draft, buildingBonuses);
  const epCost = calcEpisodeCost(draft);
  const seasonCost = epCost * draft.episodeCount;
  const canAfford = studioMoney >= seasonCost;
  const genre = GENRE_PROFILES[draft.genre];

  const castQ = calcCastQuality(draft);
  const prodQ = calcProductionQuality(draft, buildingBonuses?.production ?? 0);
  const postQ = calcPostProductionQuality(draft, buildingBonuses?.postProduction ?? 0);
  const creativeQ = calcCreativeGenreFit(draft);

  const { color } = getQualityLabel(quality);
  const parentBoost = airedShows ? calcParentBoost(draft, airedShows) : 0;
  const parentShow = parentBoost > 0 && draft.parentShowId ? airedShows?.find(s => s.id === draft.parentShowId) : null;
  const revivalBoost = airedShows ? calcRevivalBoost(draft, airedShows) : 0;
  const revivalParent = revivalBoost > 0 && draft.revivedFromShowId ? airedShows?.find(s => s.id === draft.revivedFromShowId) : null;

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:block">
            <QualityMeter score={quality} size="lg" />
            <div className="sm:hidden">
              <h3 className="text-lg font-bold text-white">{draft.title || 'Untitled Show'}</h3>
              <p className="text-xs text-zinc-500">{genre.emoji} {genre.label} · {draft.episodeCount} × {draft.episodeLength}min</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-xl font-bold text-white hidden sm:block">{draft.title || 'Untitled Show'}</h3>
            <p className="text-sm text-zinc-500 mt-0.5 hidden sm:block">{genre.emoji} {genre.label} &bull; {draft.episodeCount} × {draft.episodeLength}min</p>
            {draft.logline && <p className="text-sm text-zinc-400 mt-2 italic">"{draft.logline}"</p>}

            <div className="mt-4 space-y-2">
              <ScoreBar label="Cast & Direction" score={castQ} color="amber" />
              <ScoreBar
                label={`Production Value${(buildingBonuses?.production ?? 0) > 0 ? ` (+${buildingBonuses!.production} studio)` : ''}`}
                score={prodQ} color="blue"
              />
              <ScoreBar
                label={`Post-Production${(buildingBonuses?.postProduction ?? 0) > 0 ? ` (+${buildingBonuses!.postProduction} suite)` : ''}`}
                score={postQ} color="purple"
              />
              <ScoreBar label="Creative Genre Fit" score={creativeQ} color="emerald" />
            </div>
          </div>
        </div>
      </div>

      {/* Parent Boost */}
      {parentShow && (
        <div className={`rounded-2xl p-4 border flex items-center gap-4 ${draft.showType === 'spinoff' ? 'bg-blue-950/30 border-blue-800/50' : 'bg-purple-950/30 border-purple-800/50'}`}>
          <span className="text-3xl flex-shrink-0">{draft.showType === 'spinoff' ? '🔀' : '🔄'}</span>
          <div className="flex-1">
            <div className={`font-bold text-sm ${draft.showType === 'spinoff' ? 'text-blue-300' : 'text-purple-300'}`}>
              {draft.showType === 'spinoff' ? 'Spin-off' : 'Reboot'} Bonus
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Based on &quot;{parentShow.draft.title}&quot; (Q{parentShow.quality} · {parentShow.avgRating}M avg)
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-xl font-black tabular-nums ${draft.showType === 'spinoff' ? 'text-blue-400' : 'text-purple-400'}`}>
              +{Math.round(parentBoost * 100)}%
            </div>
            <div className="text-xs text-zinc-500">base rating</div>
          </div>
        </div>
      )}

      {/* Revival Boost */}
      {revivalParent && (
        <div className="rounded-2xl p-4 border bg-amber-950/30 border-amber-800/50 flex items-center gap-4">
          <span className="text-3xl flex-shrink-0">📡</span>
          <div className="flex-1">
            <div className="font-bold text-sm text-amber-300">Revival Bonus</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Continuing &quot;{revivalParent.draft.title}&quot; (Q{revivalParent.quality} · {revivalParent.avgRating}M avg) on a new network
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black tabular-nums text-amber-400">+{Math.round(revivalBoost * 100)}%</div>
            <div className="text-xs text-zinc-500">base rating</div>
          </div>
        </div>
      )}

      {/* Special Episodes */}
      {(draft.flashbackEpisode || draft.twoPartFinale || draft.plannedEnding) && (
        <div className="rounded-2xl p-4 border bg-zinc-900 border-zinc-800 space-y-2">
          <div className="text-xs font-semibold text-zinc-400 mb-2">✨ Special Episode Features</div>
          {draft.plannedEnding && (
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">📖</span>
              <div>
                <div className="text-sm font-semibold text-amber-300">Planned Series Finale</div>
                <div className="text-xs text-zinc-500">This is the final season — gives the show a proper ending</div>
              </div>
            </div>
          )}
          {draft.flashbackEpisode && (
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">📼</span>
              <div>
                <div className="text-sm font-semibold text-zinc-200">
                  Flashback Episode {draft.flashbackEpisodeNum ? `(Ep ${draft.flashbackEpisodeNum})` : ''}
                </div>
                <div className="text-xs text-zinc-500">+10% ratings · audience +15 · critics −8</div>
              </div>
            </div>
          )}
          {draft.twoPartFinale && (
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">🎬</span>
              <div>
                <div className="text-sm font-semibold text-zinc-200">
                  Two-Part Finale (Eps {draft.episodeCount - 1}–{draft.episodeCount})
                </div>
                <div className="text-xs text-zinc-500">+22% finale ratings · critics +12 · audience +10</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="font-bold text-zinc-200 mb-4">Budget Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Cast (per episode)', val: [...draft.mainCast, ...draft.supportingCast].reduce((s, c) => s + c.weeklyFee, 0) },
            { label: 'Key Crew (per episode)', val: (draft.director?.episodeFee ?? 0) + (draft.writer?.episodeFee ?? 0) },
            { label: 'Guest Stars / Extras / Stunts', val: draft.guestStarBudget + draft.extrasBudget + draft.stuntBudget },
            { label: 'Production (per episode)', val: Object.values(draft.production).reduce((s, v) => s + v, 0) },
            { label: 'Post-Production (per episode)', val: Object.values(draft.postProduction).reduce((s, v) => s + v, 0) },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-zinc-400">
              <span>{row.label}</span>
              <span className="tabular-nums font-medium text-zinc-200">{formatMoney(row.val)}</span>
            </div>
          ))}
          <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
            <span className="text-zinc-300">Per Episode Total</span>
            <span className="text-amber-400 tabular-nums">{formatMoney(epCost)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-zinc-300">Full Season ({draft.episodeCount} eps)</span>
            <span className={`tabular-nums ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>{formatMoney(seasonCost)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Available Funds</span>
            <span className={`tabular-nums ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>{formatMoney(studioMoney)}</span>
          </div>
        </div>
        {!canAfford && (
          <div className="mt-3 bg-rose-900/30 border border-rose-800 rounded-lg p-2 text-xs text-rose-300">
            ⚠️ Season production cost exceeds available funds. Reduce budgets or cast to proceed.
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500">
        After reviewing, go to <strong className="text-zinc-300">Network Hub</strong> to pitch your show and secure a distribution deal.
      </div>
    </div>
  );
}
