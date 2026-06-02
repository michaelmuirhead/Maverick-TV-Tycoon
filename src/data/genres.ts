import { Genre } from '@/types/game';

export interface GenreProfile {
  id: Genre;
  label: string;
  emoji: string;
  description: string;
  idealCreativeIdentity: { tone: [number, number]; humorLevel: [number, number]; realism: [number, number] };
  idealPerformance: { pacing: [number, number]; actingStyle: [number, number]; musicStyle: [number, number] };
  idealWorldLook: { visualStyle: [number, number]; locationStyle: [number, number]; setStyle: [number, number] };
  idealStorytelling: { structure: [number, number]; narrativeDensity: [number, number]; dialogueStyle: [number, number] };
  baseEpisodeCost: number;
  vfxMultiplier: number;
}

export const GENRE_PROFILES: Record<Genre, GenreProfile> = {
  drama: {
    id: 'drama', label: 'Drama', emoji: '🎭',
    description: 'Compelling character studies and emotional storytelling.',
    idealCreativeIdentity: { tone: [6, 10], humorLevel: [1, 4], realism: [3, 7] },
    idealPerformance: { pacing: [3, 6], actingStyle: [3, 7], musicStyle: [5, 9] },
    idealWorldLook: { visualStyle: [4, 8], locationStyle: [3, 7], setStyle: [5, 9] },
    idealStorytelling: { structure: [5, 10], narrativeDensity: [5, 9], dialogueStyle: [5, 9] },
    baseEpisodeCost: 300000, vfxMultiplier: 0.5,
  },
  comedy: {
    id: 'comedy', label: 'Comedy', emoji: '😂',
    description: 'Laughter, heart, and memorable characters.',
    idealCreativeIdentity: { tone: [1, 4], humorLevel: [7, 10], realism: [2, 6] },
    idealPerformance: { pacing: [6, 9], actingStyle: [6, 9], musicStyle: [3, 7] },
    idealWorldLook: { visualStyle: [2, 6], locationStyle: [3, 7], setStyle: [3, 7] },
    idealStorytelling: { structure: [1, 5], narrativeDensity: [1, 5], dialogueStyle: [5, 9] },
    baseEpisodeCost: 150000, vfxMultiplier: 0.2,
  },
  crime: {
    id: 'crime', label: 'Crime / Thriller', emoji: '🔍',
    description: 'Gripping investigations and moral complexity.',
    idealCreativeIdentity: { tone: [6, 10], humorLevel: [1, 4], realism: [2, 6] },
    idealPerformance: { pacing: [5, 8], actingStyle: [3, 7], musicStyle: [5, 8] },
    idealWorldLook: { visualStyle: [4, 8], locationStyle: [2, 6], setStyle: [4, 8] },
    idealStorytelling: { structure: [4, 9], narrativeDensity: [5, 9], dialogueStyle: [4, 8] },
    baseEpisodeCost: 280000, vfxMultiplier: 0.4,
  },
  'sci-fi': {
    id: 'sci-fi', label: 'Sci-Fi', emoji: '🚀',
    description: 'Ideas that push humanity beyond its limits.',
    idealCreativeIdentity: { tone: [4, 9], humorLevel: [2, 6], realism: [6, 10] },
    idealPerformance: { pacing: [4, 8], actingStyle: [4, 8], musicStyle: [5, 9] },
    idealWorldLook: { visualStyle: [7, 10], locationStyle: [5, 10], setStyle: [6, 10] },
    idealStorytelling: { structure: [4, 10], narrativeDensity: [5, 10], dialogueStyle: [4, 9] },
    baseEpisodeCost: 600000, vfxMultiplier: 2.5,
  },
  fantasy: {
    id: 'fantasy', label: 'Fantasy', emoji: '🐉',
    description: 'Epic worlds, mythic stakes, incredible spectacle.',
    idealCreativeIdentity: { tone: [4, 9], humorLevel: [2, 6], realism: [7, 10] },
    idealPerformance: { pacing: [4, 8], actingStyle: [5, 9], musicStyle: [7, 10] },
    idealWorldLook: { visualStyle: [8, 10], locationStyle: [5, 10], setStyle: [7, 10] },
    idealStorytelling: { structure: [5, 10], narrativeDensity: [5, 10], dialogueStyle: [4, 8] },
    baseEpisodeCost: 800000, vfxMultiplier: 3.0,
  },
  reality: {
    id: 'reality', label: 'Reality TV', emoji: '📹',
    description: 'Unscripted drama that keeps audiences hooked.',
    idealCreativeIdentity: { tone: [3, 7], humorLevel: [4, 8], realism: [1, 3] },
    idealPerformance: { pacing: [7, 10], actingStyle: [5, 9], musicStyle: [4, 8] },
    idealWorldLook: { visualStyle: [3, 7], locationStyle: [1, 5], setStyle: [2, 6] },
    idealStorytelling: { structure: [1, 4], narrativeDensity: [1, 4], dialogueStyle: [3, 7] },
    baseEpisodeCost: 100000, vfxMultiplier: 0.1,
  },
  documentary: {
    id: 'documentary', label: 'Documentary', emoji: '🎬',
    description: 'Truth told with cinematic power.',
    idealCreativeIdentity: { tone: [5, 9], humorLevel: [1, 5], realism: [1, 2] },
    idealPerformance: { pacing: [3, 7], actingStyle: [1, 3], musicStyle: [4, 8] },
    idealWorldLook: { visualStyle: [3, 7], locationStyle: [1, 4], setStyle: [1, 3] },
    idealStorytelling: { structure: [1, 5], narrativeDensity: [3, 7], dialogueStyle: [3, 7] },
    baseEpisodeCost: 80000, vfxMultiplier: 0.3,
  },
  horror: {
    id: 'horror', label: 'Horror', emoji: '👻',
    description: 'Fear, dread, and creatures from beyond.',
    idealCreativeIdentity: { tone: [8, 10], humorLevel: [1, 3], realism: [3, 8] },
    idealPerformance: { pacing: [3, 7], actingStyle: [4, 8], musicStyle: [6, 10] },
    idealWorldLook: { visualStyle: [5, 9], locationStyle: [2, 7], setStyle: [5, 9] },
    idealStorytelling: { structure: [4, 9], narrativeDensity: [4, 8], dialogueStyle: [3, 7] },
    baseEpisodeCost: 350000, vfxMultiplier: 1.5,
  },
  procedural: {
    id: 'procedural', label: 'Procedural', emoji: '⚖️',
    description: 'Case-of-the-week with recurring heroes.',
    idealCreativeIdentity: { tone: [4, 8], humorLevel: [2, 6], realism: [2, 5] },
    idealPerformance: { pacing: [5, 8], actingStyle: [3, 7], musicStyle: [4, 7] },
    idealWorldLook: { visualStyle: [3, 7], locationStyle: [2, 6], setStyle: [4, 7] },
    idealStorytelling: { structure: [1, 4], narrativeDensity: [2, 5], dialogueStyle: [4, 7] },
    baseEpisodeCost: 220000, vfxMultiplier: 0.6,
  },
  action: {
    id: 'action', label: 'Action / Adventure', emoji: '💥',
    description: 'High-octane thrills and spectacular set pieces.',
    idealCreativeIdentity: { tone: [5, 8], humorLevel: [2, 5], realism: [2, 7] },
    idealPerformance: { pacing: [7, 10], actingStyle: [5, 9], musicStyle: [7, 10] },
    idealWorldLook: { visualStyle: [7, 10], locationStyle: [3, 8], setStyle: [5, 9] },
    idealStorytelling: { structure: [3, 7], narrativeDensity: [2, 6], dialogueStyle: [2, 6] },
    baseEpisodeCost: 500000, vfxMultiplier: 2.0,
  },
};

export const GENRES = Object.values(GENRE_PROFILES);
