'use client';
import React from 'react';
import { Network } from '@/types/game';
import { formatMoney } from '@/lib/gameLogic';

interface NetworkCardProps {
  network: Network;
  quality: number;
  networkFit: number;
  offer: number;
  onPitch: () => void;
  pitchDisabled?: boolean;
  reachModifier?: number;
  pitchBonus?: number;
}

const TYPE_BADGE: Record<string, string> = {
  broadcast: 'bg-blue-900/60 text-blue-300 border-blue-800',
  cable: 'bg-amber-900/60 text-amber-300 border-amber-800',
  premium: 'bg-purple-900/60 text-purple-300 border-purple-800',
  streaming: 'bg-emerald-900/60 text-emerald-300 border-emerald-800',
};

const TYPE_LABEL: Record<string, string> = {
  broadcast: 'Broadcast',
  cable: 'Cable',
  premium: 'Premium Cable',
  streaming: 'Streaming',
};

export default function NetworkCard({ network, quality, networkFit, offer, onPitch, pitchDisabled, reachModifier = 0, pitchBonus = 0 }: NetworkCardProps) {
  const effectiveQuality = quality + pitchBonus;
  const canPitch = effectiveQuality >= network.minQuality && !pitchDisabled;
  const fitColor = networkFit >= 75 ? 'text-emerald-400' : networkFit >= 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 ${
      canPitch ? 'border-zinc-700 hover:border-zinc-500' : 'border-zinc-800 opacity-60'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{network.logo}</div>
          <div>
            <div className="font-bold text-white text-base">{network.name}</div>
            <div className="text-xs text-zinc-500 italic">{network.tagline}</div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${TYPE_BADGE[network.type]}`}>
          {TYPE_LABEL[network.type]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500 mb-0.5">Reach</div>
          <div className="text-sm font-bold text-blue-400">{Math.round(Math.min(1.0, Math.max(0.1, network.reach + reachModifier)) * 100)}%</div>
          {Math.abs(reachModifier) >= 0.01 && (
            <div className={`text-xs font-semibold ${reachModifier > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {reachModifier > 0 ? '📈' : '📉'} {reachModifier > 0 ? '+' : ''}{Math.round(reachModifier * 100)}%
            </div>
          )}
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500 mb-0.5">Fit Score</div>
          <div className={`text-sm font-bold ${fitColor}`}>{Math.round(networkFit)}%</div>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500 mb-0.5">Total Offer</div>
          <div className="text-sm font-bold text-amber-400">{formatMoney(offer)}</div>
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Preferred: {network.preferredGenres.join(', ')} &bull; Min Quality: {network.minQuality}
      </div>

      <button
        onClick={onPitch}
        disabled={!canPitch}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
          canPitch
            ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        {pitchDisabled ? 'No Studio Capacity' : canPitch ? 'Pitch This Show' : `Quality too low (need ${network.minQuality}${pitchBonus !== 0 ? `, effective ${effectiveQuality}` : ''})`}
      </button>
    </div>
  );
}
