import { ShowDraft, Network, Genre, StudioBuilding, BuildingTier, CrewMember, AiredShow } from '@/types/game';
import { GENRE_PROFILES } from '@/data/genres';
import { BUILDING_CONFIG, TIER_ORDER } from '@/data/buildings';

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function fitScore(val: number, range: [number, number]): number {
  const [lo, hi] = range;
  if (val >= lo && val <= hi) return 100;
  if (val < lo) return Math.max(0, 100 - (lo - val) * 20);
  return Math.max(0, 100 - (val - hi) * 20);
}

function avgFit(sliders: Record<string, number>, ideals: Record<string, [number, number]>): number {
  const keys = Object.keys(ideals);
  if (!keys.length) return 75;
  const total = keys.reduce((sum, k) => sum + fitScore(sliders[k], ideals[k]), 0);
  return total / keys.length;
}

export function calcCrewGenreMultiplier(member: CrewMember, genre: Genre): number {
  if (member.genreStrengths?.includes(genre)) return 1.5;
  if (member.genreWeaknesses?.includes(genre)) return 0.5;
  return 1.0;
}

/** @deprecated use calcCrewGenreMultiplier */
export const calcWriterGenreMultiplier = calcCrewGenreMultiplier;

export function calcCastQuality(draft: ShowDraft): number {
  const allCast = [...draft.mainCast, ...draft.supportingCast];
  if (!allCast.length) return 0;
  const starAvg = allCast.reduce((s, c) => s + c.starLevel, 0) / allCast.length;
  const mainBonus = draft.mainCast.length > 0
    ? (draft.mainCast.reduce((s, c) => s + c.starLevel, 0) / draft.mainCast.length) * 10
    : 0;
  const directorMult = draft.director ? calcCrewGenreMultiplier(draft.director, draft.genre) : 1;
  const directorBonus = draft.director ? draft.director.level * 8 * directorMult : 0;
  const writerMult = draft.writer ? calcCrewGenreMultiplier(draft.writer, draft.genre) : 1;
  const writerBonus = draft.writer ? draft.writer.level * 6 * writerMult : 0;
  const guestBonus = Math.min(20, (draft.guestStarBudget / 100000) * 3);
  const extras = Math.min(5, (draft.extrasBudget / 50000) * 2);
  const stunt = Math.min(5, (draft.stuntBudget / 100000) * 2);

  return clamp(starAvg * 14 + mainBonus * 0.2 + directorBonus * 0.4 + writerBonus * 0.3 + guestBonus + extras + stunt, 0, 100);
}

export function calcProductionQuality(draft: ShowDraft, tierBonus = 0): number {
  const { crew, recordingStudio, locations, sets } = draft.production;
  const maxCrew = 500000;
  const maxStudio = 300000;
  const maxLoc = 1000000;
  const maxSets = 2000000;

  const score =
    (crew / maxCrew) * 25 +
    (recordingStudio / maxStudio) * 25 +
    (locations / maxLoc) * 25 +
    (sets / maxSets) * 25;

  return clamp(score + tierBonus, 0, 100);
}

export function calcPostProductionQuality(draft: ShowDraft, tierBonus = 0): number {
  const { editing, visualEffects, soundEffects, music } = draft.postProduction;
  const maxEdit = 200000;
  const maxVfx = 5000000;
  const maxSfx = 200000;
  const maxMusic = 500000;

  const genreProfile = GENRE_PROFILES[draft.genre];
  const vfxWeight = genreProfile.vfxMultiplier > 1 ? 0.40 : 0.20;
  const otherWeight = (1 - vfxWeight) / 3;

  const score =
    (editing / maxEdit) * otherWeight * 100 +
    (visualEffects / maxVfx) * vfxWeight * 100 +
    (soundEffects / maxSfx) * otherWeight * 100 +
    (music / maxMusic) * otherWeight * 100;

  return clamp(score + tierBonus, 0, 100);
}

export function calcCreativeGenreFit(draft: ShowDraft): number {
  const profile = GENRE_PROFILES[draft.genre];
  const ciFit = avgFit(
    { tone: draft.creativeIdentity.tone, humorLevel: draft.creativeIdentity.humorLevel, realism: draft.creativeIdentity.realism },
    profile.idealCreativeIdentity
  );
  const prFit = avgFit(
    { pacing: draft.performanceRhythm.pacing, actingStyle: draft.performanceRhythm.actingStyle, musicStyle: draft.performanceRhythm.musicStyle },
    profile.idealPerformance
  );
  const wlFit = avgFit(
    { visualStyle: draft.worldLook.visualStyle, locationStyle: draft.worldLook.locationStyle, setStyle: draft.worldLook.setStyle },
    profile.idealWorldLook
  );
  const stFit = avgFit(
    { structure: draft.storytelling.structure, narrativeDensity: draft.storytelling.narrativeDensity, dialogueStyle: draft.storytelling.dialogueStyle },
    profile.idealStorytelling
  );

  return (ciFit * 0.35 + prFit * 0.25 + wlFit * 0.20 + stFit * 0.20);
}

export function calcShowQuality(
  draft: ShowDraft,
  buildingBonuses?: { production?: number; postProduction?: number }
): number {
  const castQ = calcCastQuality(draft);
  const prodQ = calcProductionQuality(draft, buildingBonuses?.production ?? 0);
  const postQ = calcPostProductionQuality(draft, buildingBonuses?.postProduction ?? 0);
  const creativeQ = calcCreativeGenreFit(draft);

  let quality = castQ * 0.30 + prodQ * 0.22 + postQ * 0.18 + creativeQ * 0.30;

  // Creative genius: exceptional genre fit gives a non-linear bonus (up to +10 pts at perfect fit)
  if (creativeQ >= 80) quality += (creativeQ - 80) * 0.5;

  return Math.round(clamp(quality, 0, 100));
}

export interface HeatMapCell {
  key: string;
  label: string;
  value: number;
  idealLo: number;
  idealHi: number;
  fit: number;
  isPerfect: boolean;
}

export interface HeatMapSection {
  title: string;
  emoji: string;
  avgFit: number;
  cells: HeatMapCell[];
}

export function getCreativeFitHeatMap(draft: ShowDraft): HeatMapSection[] {
  const profile = GENRE_PROFILES[draft.genre];

  function cell(key: string, label: string, value: number, range: [number, number]): HeatMapCell {
    const f = fitScore(value, range);
    return { key, label, value, idealLo: range[0], idealHi: range[1], fit: Math.round(f), isPerfect: f >= 95 };
  }

  function sectionAvg(cells: HeatMapCell[]) {
    return Math.round(cells.reduce((s, c) => s + c.fit, 0) / cells.length);
  }

  const sections: Omit<HeatMapSection, 'avgFit'>[] = [
    {
      title: 'Creative Identity', emoji: '🎭',
      cells: [
        cell('tone', 'Tone', draft.creativeIdentity.tone, profile.idealCreativeIdentity.tone),
        cell('humor', 'Humor', draft.creativeIdentity.humorLevel, profile.idealCreativeIdentity.humorLevel),
        cell('realism', 'Realism', draft.creativeIdentity.realism, profile.idealCreativeIdentity.realism),
      ],
    },
    {
      title: 'Performance', emoji: '🎬',
      cells: [
        cell('pacing', 'Pacing', draft.performanceRhythm.pacing, profile.idealPerformance.pacing),
        cell('acting', 'Acting', draft.performanceRhythm.actingStyle, profile.idealPerformance.actingStyle),
        cell('music', 'Music', draft.performanceRhythm.musicStyle, profile.idealPerformance.musicStyle),
      ],
    },
    {
      title: 'World & Look', emoji: '🌍',
      cells: [
        cell('visual', 'Visual', draft.worldLook.visualStyle, profile.idealWorldLook.visualStyle),
        cell('location', 'Location', draft.worldLook.locationStyle, profile.idealWorldLook.locationStyle),
        cell('sets', 'Sets', draft.worldLook.setStyle, profile.idealWorldLook.setStyle),
      ],
    },
    {
      title: 'Storytelling', emoji: '📖',
      cells: [
        cell('structure', 'Structure', draft.storytelling.structure, profile.idealStorytelling.structure),
        cell('density', 'Density', draft.storytelling.narrativeDensity, profile.idealStorytelling.narrativeDensity),
        cell('dialogue', 'Dialogue', draft.storytelling.dialogueStyle, profile.idealStorytelling.dialogueStyle),
      ],
    },
  ];

  return sections.map(s => ({ ...s, avgFit: sectionAvg(s.cells) }));
}

export function getBuildingQualityBonuses(buildings: StudioBuilding[]): { production: number; postProduction: number } {
  const rsBuildings = buildings.filter(b => b.type === 'recording-studio');
  const esBuildings = buildings.filter(b => b.type === 'editing-suite');

  const bestTier = (blds: StudioBuilding[]): BuildingTier =>
    blds.reduce((best, b) =>
      TIER_ORDER.indexOf(b.tier) > TIER_ORDER.indexOf(best) ? b.tier : best,
      'basic' as BuildingTier
    );

  return {
    production: rsBuildings.length ? BUILDING_CONFIG['recording-studio'][bestTier(rsBuildings)].qualityBonus : 0,
    postProduction: esBuildings.length ? BUILDING_CONFIG['editing-suite'][bestTier(esBuildings)].qualityBonus : 0,
  };
}

export function getBuildingCapacity(buildings: StudioBuilding[], type: 'recording-studio' | 'editing-suite'): number {
  return buildings.filter(b => b.type === type).reduce((sum, b) => sum + BUILDING_CONFIG[type][b.tier].capacity, 0);
}

export function calcEpisodeCost(draft: ShowDraft): number {
  const castCost = [...draft.mainCast, ...draft.supportingCast].reduce((s, c) => s + c.weeklyFee, 0);
  const crewCost =
    (draft.director?.episodeFee ?? 0) +
    (draft.writer?.episodeFee ?? 0) +
    draft.guestStarBudget +
    draft.extrasBudget +
    draft.stuntBudget;
  const prodCost = Object.values(draft.production).reduce((s, v) => s + v, 0);
  const postCost = Object.values(draft.postProduction).reduce((s, v) => s + v, 0);
  return castCost + crewCost + prodCost + postCost;
}

export function calcNetworkFit(draft: ShowDraft, network: Network): number {
  if (!network.preferredGenres.includes(draft.genre)) return 25;

  const genreBonus = 40;
  const styleSliders: Record<string, number> = {
    tone: draft.creativeIdentity.tone,
    humorLevel: draft.creativeIdentity.humorLevel,
    realism: draft.creativeIdentity.realism,
    structure: draft.storytelling.structure,
    narrativeDensity: draft.storytelling.narrativeDensity,
    visualStyle: draft.worldLook.visualStyle,
  };

  const prefKeys = Object.keys(network.preferredStyle) as Array<keyof typeof network.preferredStyle>;
  let styleFit = 60;
  if (prefKeys.length > 0) {
    const fitScores = prefKeys.map(k => {
      const range = network.preferredStyle[k];
      const val = styleSliders[k];
      if (!range || val === undefined) return 75;
      return fitScore(val, range as [number, number]);
    });
    styleFit = fitScores.reduce((a, b) => a + b, 0) / fitScores.length;
  }

  return clamp(genreBonus + styleFit * 0.6, 0, 100);
}

export function calcNetworkOffer(quality: number, networkFit: number, network: Network, episodeCount: number): number {
  const fitMultiplier = networkFit / 100;
  const qualityMultiplier = quality / 100;
  const combined = fitMultiplier * 0.6 + qualityMultiplier * 0.4;
  const { min, max } = network.budgetPerEpisode;
  const perEpisode = min + (max - min) * combined;
  return Math.round(perEpisode * episodeCount);
}

export function simulateRatings(quality: number, networkFit: number, network: Network, episodeCount: number): number[] {
  const baseRating = (quality / 100) * (networkFit / 100) * network.reach * 12;
  const ratings: number[] = [];
  let trend = 0;

  for (let i = 0; i < episodeCount; i++) {
    const variance = (Math.random() - 0.5) * 1.5;
    const episodeRating = Math.max(0.1, baseRating + trend + variance);
    ratings.push(Math.round(episodeRating * 10) / 10);
    trend += (Math.random() - 0.45) * 0.1;
    trend = clamp(trend, -2, 2);
  }

  return ratings;
}

export function getQualityLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Masterpiece', color: 'text-purple-400' };
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
  if (score >= 70) return { label: 'Great', color: 'text-green-400' };
  if (score >= 60) return { label: 'Good', color: 'text-lime-400' };
  if (score >= 50) return { label: 'Decent', color: 'text-yellow-400' };
  if (score >= 40) return { label: 'Average', color: 'text-amber-500' };
  if (score >= 30) return { label: 'Below Average', color: 'text-orange-500' };
  return { label: 'Poor', color: 'text-red-500' };
}

export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

export function calcParentBoost(draft: ShowDraft, airedShows: AiredShow[]): number {
  if (!draft.parentShowId || !draft.showType) return 0;
  const parent = airedShows.find((s) => s.id === draft.parentShowId);
  if (!parent) return 0;
  if (draft.showType === 'spinoff') {
    return 0.05 + (parent.quality / 100) * 0.15;
  }
  if (draft.showType === 'reboot') {
    const nostalgia = parent.status === 'completed' ? 0.05 : 0;
    return nostalgia + (parent.quality / 100) * 0.20;
  }
  return 0;
}

export function createDefaultDraft(): ShowDraft {
  return {
    id: crypto.randomUUID(),
    title: '',
    genre: 'drama',
    episodeLength: 44,
    episodeCount: 10,
    logline: '',
    seasonNumber: 1,
    mainCast: [],
    supportingCast: [],
    director: null,
    writer: null,
    guestStarBudget: 0,
    extrasBudget: 10000,
    stuntBudget: 0,
    production: { crew: 50000, recordingStudio: 50000, locations: 100000, sets: 200000 },
    postProduction: { editing: 30000, visualEffects: 50000, soundEffects: 20000, music: 30000 },
    creativeIdentity: { tone: 5, humorLevel: 5, realism: 5 },
    performanceRhythm: { pacing: 5, actingStyle: 5, musicStyle: 5 },
    worldLook: { visualStyle: 5, locationStyle: 5, setStyle: 5 },
    storytelling: { structure: 5, narrativeDensity: 5, dialogueStyle: 5 },
  };
}
