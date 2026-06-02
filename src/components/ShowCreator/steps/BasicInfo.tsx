'use client';
import React from 'react';
import { ShowDraft } from '@/types/game';
import { GENRES } from '@/data/genres';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

const EP_LENGTHS = [
  { value: 22, label: '22 min', sublabel: 'Half-hour' },
  { value: 44, label: '44 min', sublabel: 'One-hour' },
  { value: 60, label: '60 min', sublabel: 'Feature-length' },
] as const;

export default function BasicInfo({ draft, onUpdate }: Props) {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">Show Title</label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter show title..."
          maxLength={60}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-lg font-medium focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Logline */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">Logline</label>
        <textarea
          value={draft.logline}
          onChange={(e) => onUpdate({ logline: e.target.value })}
          placeholder="One sentence that sells your show..."
          maxLength={200}
          rows={2}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm resize-none focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Genre */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-3">Genre</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => onUpdate({ genre: g.id })}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all duration-150 ${
                draft.genre === g.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">{GENRES.find((g) => g.id === draft.genre)?.description}</p>
      </div>

      {/* Episode Length */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-3">Episode Length</label>
        <div className="grid grid-cols-3 gap-3">
          {EP_LENGTHS.map((ep) => (
            <button
              key={ep.value}
              onClick={() => onUpdate({ episodeLength: ep.value })}
              className={`p-4 rounded-xl border text-center transition-all duration-150 ${
                draft.episodeLength === ep.value
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              <div className="font-bold text-lg">{ep.label}</div>
              <div className="text-xs mt-0.5">{ep.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Episode Count */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-zinc-300">Season Episodes</label>
          <span className="text-amber-400 font-bold tabular-nums">{draft.episodeCount} episodes</span>
        </div>
        <div className="relative">
          <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((draft.episodeCount - 4) / 22) * 100}%` }} />
          </div>
          <input
            type="range" min={4} max={26} step={1} value={draft.episodeCount}
            onChange={(e) => onUpdate({ episodeCount: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>4 eps (Mini-series)</span>
          <span>26 eps (Full season)</span>
        </div>
      </div>
    </div>
  );
}
