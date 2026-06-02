'use client';
import React, { useState } from 'react';
import { ShowDraft } from '@/types/game';
import { GENRES, GENRE_PROFILES } from '@/data/genres';
import { useGameStore } from '@/store/gameStore';
import { LOGLINE_IDEAS } from '@/data/loglines';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

const EP_LENGTHS = [
  { value: 22, label: '22 min', sublabel: 'Half-hour' },
  { value: 44, label: '44 min', sublabel: 'One-hour' },
  { value: 60, label: '60 min', sublabel: 'Feature-length' },
] as const;

// Scheduling hints for high-frequency genres
const SCHEDULE_HINTS: Partial<Record<string, string>> = {
  'talk-show': '26 = weekly · 130 = 2.5×/wk · 260 = daily M–F',
  'late-night': '26 = weekly · 130 = 2.5×/wk · 260 = nightly M–F',
  'soap-opera': '52 = once/wk · 130 = 2.5×/wk · 260 = daily M–F',
};

function epCountStep(max: number) {
  if (max <= 26) return 1;
  if (max <= 60) return 2;
  return 5;
}

function genrePopBadge(pop: number): string {
  if (pop >= 72) return '🔥';
  if (pop <= 30) return '📉';
  return '';
}

function LoglineIdeasButton({ genre, onSelect }: { genre: string; onSelect: (idea: { title: string; logline: string }) => void }) {
  const [open, setOpen] = useState(false);
  const ideas = LOGLINE_IDEAS[genre] ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${open ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'}`}
      >
        💡 {open ? 'Hide Ideas' : 'Get Ideas'}
      </button>
      {open && ideas.length > 0 && (
        <div className="absolute right-0 top-9 z-20 w-[360px] sm:w-[480px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Ready-made ideas · click to use</span>
            <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-zinc-300 text-xs">✕</button>
          </div>
          <div className="overflow-y-auto max-h-80 divide-y divide-zinc-800/60">
            {ideas.map((idea, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onSelect(idea); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-200 mb-0.5">{idea.title}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed">{idea.logline}</div>
                  </div>
                  <span className="text-xs text-amber-500 font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">Use →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BasicInfo({ draft, onUpdate }: Props) {
  const genrePopularity = useGameStore(s => s.studio?.genrePopularity ?? {});
  const genreProfile = GENRE_PROFILES[draft.genre];
  const [epMin, epMax] = genreProfile.typicalEpisodeCount;
  const step = epCountStep(epMax);

  const handleGenreChange = (genreId: typeof draft.genre) => {
    const newProfile = GENRE_PROFILES[genreId];
    const [newMin, newMax] = newProfile.typicalEpisodeCount;
    const defaultCount = Math.round((newMin + newMax) / 2 / step) * step;
    const clampedCount = Math.max(newMin, Math.min(newMax, draft.episodeCount));
    // If current count is way outside the new genre's range, reset to midpoint
    const newCount = (draft.episodeCount < newMin || draft.episodeCount > newMax) ? defaultCount : clampedCount;
    onUpdate({ genre: genreId, episodeCount: newCount });
  };

  const progressPct = epMax > epMin ? ((draft.episodeCount - epMin) / (epMax - epMin)) * 100 : 50;
  const scheduleHint = SCHEDULE_HINTS[draft.genre];

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
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-zinc-300">Logline</label>
          <LoglineIdeasButton genre={draft.genre} onSelect={(idea) => onUpdate({ title: draft.title || idea.title, logline: idea.logline })} />
        </div>
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
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGenreChange(g.id)}
              className={`relative flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-xl border text-xs font-medium transition-all duration-150 ${
                draft.genre === g.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {genrePopBadge(genrePopularity[g.id] ?? 50) && (
                <span className="absolute top-1 right-1.5 text-xs leading-none">
                  {genrePopBadge(genrePopularity[g.id] ?? 50)}
                </span>
              )}
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
        <div className="relative h-8 flex items-center">
          <div className="absolute inset-x-0 h-2 rounded-full bg-zinc-700 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(1, progressPct)}%` }} />
          </div>
          <input
            type="range"
            min={epMin}
            max={epMax}
            step={step}
            value={draft.episodeCount}
            onChange={(e) => onUpdate({ episodeCount: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>{epMin} eps</span>
          {scheduleHint && <span className="text-zinc-600 text-center hidden md:block">{scheduleHint}</span>}
          <span>{epMax} eps</span>
        </div>
        {scheduleHint && (
          <p className="text-xs text-zinc-600 mt-1 md:hidden">{scheduleHint}</p>
        )}
      </div>
    </div>
  );
}
