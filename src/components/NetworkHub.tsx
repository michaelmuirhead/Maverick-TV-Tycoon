'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { calcShowQuality, calcNetworkFit, calcNetworkOffer, formatMoney } from '@/lib/gameLogic';
import NetworkCard from '@/components/ui/NetworkCard';
import QualityMeter from '@/components/ui/QualityMeter';
import { NETWORKS } from '@/data/networks';
import { GENRE_PROFILES } from '@/data/genres';

const TYPE_LABELS: Record<string, string> = {
  all: 'All Networks',
  broadcast: 'Broadcast',
  cable: 'Cable',
  premium: 'Premium Cable',
  streaming: 'Streaming',
  international: 'International',
  specialty: 'Specialty',
};

export default function NetworkHub() {
  const studio = useGameStore((s) => s.studio);
  const setScreen = useGameStore((s) => s.setScreen);
  const pitchShow = useGameStore((s) => s.pitchShow);
  const [filter, setFilter] = useState<string>('all');
  const [pitching, setPitching] = useState<string | null>(null);
  const [releaseStrategies, setReleaseStrategies] = useState<Record<string, 'weekly' | 'all-at-once'>>({});

  const getStrategy = (networkId: string) => releaseStrategies[networkId] ?? 'weekly';

  if (!studio?.currentDraft) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-zinc-400 mb-4">No show ready to pitch.</p>
          <button onClick={() => setScreen('dashboard')} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const draft = studio.currentDraft;
  const quality = calcShowQuality(draft);
  const genre = GENRE_PROFILES[draft.genre];

  const filtered = filter === 'all' ? NETWORKS : NETWORKS.filter((n) => n.type === filter);

  const handlePitch = (networkId: string) => {
    const strategy = getStrategy(networkId);
    setPitching(networkId);
    setTimeout(() => {
      pitchShow(networkId, strategy);
      setPitching(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('show-creator')}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              ← Edit Show
            </button>
            <span className="text-zinc-700">|</span>
            <div>
              <h1 className="font-bold text-base text-white">Network Hub</h1>
              <p className="text-xs text-zinc-500">Pitch "{draft.title}" to a network</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs text-zinc-500">{genre.emoji} {genre.label} &bull; {draft.episodeCount} eps</div>
              <div className="text-xs text-zinc-400">{formatMoney(studio.money)} available</div>
            </div>
            <QualityMeter score={quality} size="sm" />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5 md:space-y-6">
        {/* Show Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Your Show</h2>
          <div className="flex items-start gap-5">
            <QualityMeter score={quality} size="md" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{draft.title}</h3>
              <p className="text-sm text-zinc-500 mt-0.5">
                {genre.emoji} {genre.label} &bull; {draft.episodeCount} × {draft.episodeLength}min
              </p>
              {draft.logline && (
                <p className="text-sm text-zinc-400 mt-2 italic">"{draft.logline}"</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-zinc-500">
                <span>👥 {draft.mainCast.length} leads, {draft.supportingCast.length} supporting</span>
                {draft.director && <span>🎬 {draft.director.name}</span>}
                {draft.writer && <span>✍️ {draft.writer.name}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? 'bg-amber-500 border-amber-500 text-black'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Network Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((network) => {
            const fit = calcNetworkFit(draft, network);
            const offer = calcNetworkOffer(quality, fit, network, draft.episodeCount);
            const isPlayerChoice = network.releaseStrategy === 'player-choice';
            const strategy = getStrategy(network.id);
            return (
              <div key={network.id} className={`flex flex-col gap-2 transition-all duration-300 ${pitching === network.id ? 'scale-95 opacity-70' : ''}`}>
                <NetworkCard
                  network={network}
                  quality={quality}
                  networkFit={fit}
                  offer={offer}
                  onPitch={() => handlePitch(network.id)}
                />
                {isPlayerChoice && (
                  <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    {(['weekly', 'all-at-once'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setReleaseStrategies(prev => ({ ...prev, [network.id]: s }))}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          strategy === s
                            ? 'bg-emerald-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {s === 'weekly' ? '📅 Weekly' : '💥 Binge Drop'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
