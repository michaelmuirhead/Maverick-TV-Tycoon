'use client';
import React from 'react';
import { ShowDraft } from '@/types/game';
import SliderSection from '@/components/ui/SliderSection';

interface Props {
  draft: ShowDraft;
  onUpdate: (updates: Partial<ShowDraft>) => void;
}

export default function CreativeSliders({ draft, onUpdate }: Props) {
  return (
    <div className="space-y-6">
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
