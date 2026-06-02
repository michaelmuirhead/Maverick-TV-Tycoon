'use client';
import React from 'react';
import { ShowDraft } from '@/types/game';
import {
  calcShowQuality, calcEpisodeCost, calcCastQuality,
  calcProductionQuality, calcPostProductionQuality, calcCreativeGenreFit,
  formatMoney, getQualityLabel,
} from '@/lib/gameLogic';
import QualityMeter from '@/components/ui/QualityMeter';
import { GENRE_PROFILES } from '@/data/genres';

interface Props {
  draft: ShowDraft;
  studioMoney: number;
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

export default function ReviewStep({ draft, studioMoney }: Props) {
  const quality = calcShowQuality(draft);
  const epCost = calcEpisodeCost(draft);
  const seasonCost = epCost * draft.episodeCount;
  const canAfford = studioMoney >= seasonCost;
  const genre = GENRE_PROFILES[draft.genre];

  const castQ = calcCastQuality(draft);
  const prodQ = calcProductionQuality(draft);
  const postQ = calcPostProductionQuality(draft);
  const creativeQ = calcCreativeGenreFit(draft);

  const { color } = getQualityLabel(quality);

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start gap-6">
          <QualityMeter score={quality} size="lg" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{draft.title || 'Untitled Show'}</h3>
            <p className="text-sm text-zinc-500 mt-0.5">{genre.emoji} {genre.label} &bull; {draft.episodeCount} × {draft.episodeLength}min</p>
            {draft.logline && <p className="text-sm text-zinc-400 mt-2 italic">"{draft.logline}"</p>}

            <div className="mt-4 space-y-2">
              <ScoreBar label="Cast & Direction" score={castQ} color="amber" />
              <ScoreBar label="Production Value" score={prodQ} color="blue" />
              <ScoreBar label="Post-Production" score={postQ} color="purple" />
              <ScoreBar label="Creative Genre Fit" score={creativeQ} color="emerald" />
            </div>
          </div>
        </div>
      </div>

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
