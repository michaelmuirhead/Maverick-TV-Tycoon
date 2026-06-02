'use client';
import React from 'react';
import { ShowDraft } from '@/types/game';
import SliderSection from '@/components/ui/SliderSection';
import { useGameStore } from '@/store/gameStore';
import { GENRE_PROFILES } from '@/data/genres';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

export default function CreativeSliders({ draft, onUpdate }: Props) {
  const lastSuccessfulDraft = useGameStore(s => s.studio?.lastSuccessfulDraft);
  const genrePopularity = useGameStore(s => s.studio?.genrePopularity ?? {});
  const genrePop = genrePopularity[draft.genre] ?? 50;
  const genre = GENRE_PROFILES[draft.genre];

  const canLoadLastKnown = lastSuccessfulDraft && lastSuccessfulDraft.genre === draft.genre;

  const loadLastKnown = () => {
    if (!lastSuccessfulDraft) return;
    onUpdate({
      creativeIdentity: { ...lastSuccessfulDraft.creativeIdentity },
      performanceRhythm: { ...lastSuccessfulDraft.performanceRhythm },
      worldLook: { ...lastSuccessfulDraft.worldLook },
      storytelling: { ...lastSuccessfulDraft.storytelling },
    });
  };

  return (
    <div className="space-y-6">
      {/* Genre popularity + Last Known Values toolbar */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500">{genre.emoji} {genre.label} market:</span>
          <span className={`font-bold tabular-nums ${genrePop >= 70 ? 'text-emerald-400' : genrePop >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
            {genrePop >= 80 ? '🔥' : genrePop >= 60 ? '📈' : genrePop <= 25 ? '❄️' : '📊'} {genrePop}/100
          </span>
        </div>
        {canLoadLastKnown && (
          <button
            onClick={loadLastKnown}
            className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium rounded-lg transition-all"
            title={`Load creative settings from your last successful ${draft.genre} show`}
          >
            📋 Last Known Values
          </button>
        )}
      </div>

      <SliderSection
        title="Creative Identity"
        description="Define the tone and feel of your show."
        emoji="🎭"
        color="amber"
        sliders={[
          { key: 'tone', label: 'Tone', leftLabel: 'Light & Fun', rightLabel: 'Dark & Gritty' },
          { key: 'humorLevel', label: 'Humor Level', leftLabel: 'Dead Serious', rightLabel: 'Pure Comedy' },
          { key: 'realism', label: 'Realism', leftLabel: 'Grounded & Real', rightLabel: 'Fantastical' },
        ]}
        values={draft.creativeIdentity}
        onChange={(key, val) => onUpdate({ creativeIdentity: { ...draft.creativeIdentity, [key]: val } })}
      />

      <SliderSection
        title="Performance & Rhythm"
        description="How the show moves and how its performances land."
        emoji="🎬"
        color="blue"
        sliders={[
          { key: 'pacing', label: 'Pacing', leftLabel: 'Slow-Burn', rightLabel: 'Fast-Cut' },
          { key: 'actingStyle', label: 'Acting Style', leftLabel: 'Subtle & Naturalistic', rightLabel: 'Theatrical & Big' },
          { key: 'musicStyle', label: 'Music Style', leftLabel: 'Understated', rightLabel: 'Grand & Dramatic' },
        ]}
        values={draft.performanceRhythm}
        onChange={(key, val) => onUpdate({ performanceRhythm: { ...draft.performanceRhythm, [key]: val } })}
      />

      <SliderSection
        title="World & Look"
        description="The visual identity and production design."
        emoji="🌍"
        color="emerald"
        sliders={[
          { key: 'visualStyle', label: 'Visual Style', leftLabel: 'Minimalist', rightLabel: 'Spectacle' },
          { key: 'locationStyle', label: 'Location Style', leftLabel: 'Natural Locations', rightLabel: 'Built Sets' },
          { key: 'setStyle', label: 'Set Design', leftLabel: 'Sparse & Simple', rightLabel: 'Rich & Detailed' },
        ]}
        values={draft.worldLook}
        onChange={(key, val) => onUpdate({ worldLook: { ...draft.worldLook, [key]: val } })}
      />

      <SliderSection
        title="Storytelling"
        description="How your show tells its stories across episodes."
        emoji="📖"
        color="purple"
        sliders={[
          { key: 'structure', label: 'Episode Structure', leftLabel: 'Episodic (COTW)', rightLabel: 'Fully Serialized' },
          { key: 'narrativeDensity', label: 'Narrative Density', leftLabel: 'Simple & Accessible', rightLabel: 'Dense & Complex' },
          { key: 'dialogueStyle', label: 'Dialogue Style', leftLabel: 'Casual & Natural', rightLabel: 'Stylized & Witty' },
        ]}
        values={draft.storytelling}
        onChange={(key, val) => onUpdate({ storytelling: { ...draft.storytelling, [key]: val } })}
      />
    </div>
  );
}
