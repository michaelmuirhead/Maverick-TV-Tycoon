import {
  Studio, ActiveProduction, GameEvent, RenewalOffer, AiredShow,
  AwardNomination, RivalStudio, RivalShow, Genre,
} from '@/types/game';
import { NETWORKS } from '@/data/networks';
import { RIVAL_STUDIOS } from '@/data/rivals';
import { calcEpisodeCost } from '@/lib/gameLogic';
import { BUILDING_CONFIG } from '@/data/buildings';

// ─── helpers ────────────────────────────────────────────────────────────────

function rng(): number { return Math.random(); }

export interface AwardShowDef {
  id: string;
  name: string;
  emoji: string;
  prestige: number;
  nominationsWeek: number;
  ceremonyWeek: number;
  categories: { id: string; name: string; genres: Genre[] }[];
}

export const AWARD_SHOWS: AwardShowDef[] = [
  {
    id: 'emmys', name: 'Emmy Awards', emoji: '📺', prestige: 1.5,
    nominationsWeek: 36, ceremonyWeek: 42,
    categories: [
      { id: 'em-drama', name: 'Outstanding Drama Series', genres: ['drama', 'crime'] as Genre[] },
      { id: 'em-comedy', name: 'Outstanding Comedy Series', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
      { id: 'em-limited', name: 'Outstanding Limited or Anthology Series', genres: ['limited-series', 'anthology', 'documentary'] as Genre[] },
      { id: 'em-genre', name: 'Outstanding Genre Series', genres: ['sci-fi', 'fantasy', 'horror', 'action'] as Genre[] },
      { id: 'em-reality', name: 'Outstanding Reality Competition', genres: ['reality'] as Genre[] },
      { id: 'em-variety', name: 'Outstanding Variety Series', genres: ['talk-show', 'late-night'] as Genre[] },
      { id: 'em-writing', name: 'Outstanding Writing for a Drama', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
      { id: 'em-directing', name: 'Outstanding Directing for a Drama', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
      { id: 'em-actor-drama', name: 'Outstanding Lead Actor — Drama', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
      { id: 'em-actor-comedy', name: 'Outstanding Lead Actor — Comedy', genres: ['comedy', 'talk-show'] as Genre[] },
    ],
  },
  {
    id: 'golden-globes', name: 'Golden Globe Awards', emoji: '🌟', prestige: 1.2,
    nominationsWeek: 4, ceremonyWeek: 7,
    categories: [
      { id: 'gg-drama', name: 'Best Television Series — Drama', genres: ['drama', 'crime'] as Genre[] },
      { id: 'gg-comedy', name: 'Best Television Series — Comedy or Musical', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
      { id: 'gg-limited', name: 'Best Limited or Anthology Series', genres: ['limited-series', 'anthology'] as Genre[] },
      { id: 'gg-any', name: 'Best Television Series', genres: [] as Genre[] },
      { id: 'gg-actor-drama', name: 'Best Performance by an Actor — Drama', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
      { id: 'gg-actor-comedy', name: 'Best Performance by an Actor — Comedy', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
    ],
  },
  {
    id: 'bafta', name: 'BAFTA Television Awards', emoji: '🎭', prestige: 1.1,
    nominationsWeek: 14, ceremonyWeek: 19,
    categories: [
      { id: 'ba-drama', name: 'Best Drama Series', genres: ['drama', 'crime'] as Genre[] },
      { id: 'ba-comedy', name: 'Best Comedy Series', genres: ['comedy', 'late-night'] as Genre[] },
      { id: 'ba-limited', name: 'Best Mini-Series', genres: ['limited-series', 'anthology'] as Genre[] },
      { id: 'ba-doc', name: 'Best Documentary', genres: ['documentary'] as Genre[] },
      { id: 'ba-craft', name: 'Best Craft Achievement', genres: [] as Genre[] },
    ],
  },
  {
    id: 'sag-awards', name: 'SAG Awards', emoji: '🎬', prestige: 1.0,
    nominationsWeek: 3, ceremonyWeek: 8,
    categories: [
      { id: 'sag-ensemble-drama', name: 'Outstanding Ensemble — Drama Series', genres: ['drama', 'crime'] as Genre[] },
      { id: 'sag-ensemble-comedy', name: 'Outstanding Ensemble — Comedy Series', genres: ['comedy'] as Genre[] },
      { id: 'sag-actor-drama', name: 'Outstanding Actor — Drama Series', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
      { id: 'sag-actor-comedy', name: 'Outstanding Actor — Comedy Series', genres: ['comedy', 'talk-show'] as Genre[] },
    ],
  },
  {
    id: 'critics-choice', name: "Critics' Choice Awards", emoji: '🖊️', prestige: 0.8,
    nominationsWeek: 1, ceremonyWeek: 5,
    categories: [
      { id: 'cc-best', name: 'Best Drama Series', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
      { id: 'cc-comedy', name: 'Best Comedy Series', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
      { id: 'cc-limited', name: 'Best Limited Series', genres: ['limited-series', 'anthology', 'documentary'] as Genre[] },
      { id: 'cc-new', name: 'Best New Series', genres: [] as Genre[] },
    ],
  },
  {
    id: 'peoples-choice', name: "People's Choice Awards", emoji: '🌟', prestige: 0.6,
    nominationsWeek: 46, ceremonyWeek: 50,
    categories: [
      { id: 'pc-drama', name: 'Favourite Drama Show', genres: ['drama', 'crime', 'action'] as Genre[] },
      { id: 'pc-comedy', name: 'Favourite Comedy Show', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
      { id: 'pc-sci-fi', name: 'Favourite Sci-Fi / Fantasy Show', genres: ['sci-fi', 'fantasy', 'horror'] as Genre[] },
      { id: 'pc-reality', name: 'Favourite Reality TV Show', genres: ['reality', 'talk-show'] as Genre[] },
      { id: 'pc-streaming', name: 'Favourite Streaming Series', genres: [] as Genre[] },
    ],
  },
];

// ─── critic & audience score helpers ────────────────────────────────────────

// How much critics value each genre by default (prestige bias)
const CRITIC_PRESTIGE: Partial<Record<Genre, number>> = {
  documentary: 12, 'limited-series': 10, anthology: 9,
  drama: 5, crime: 4, 'sci-fi': 3, horror: 3, fantasy: 1,
  comedy: 0, action: -3, procedural: -2,
  'talk-show': -8, 'late-night': -10, 'soap-opera': -20, reality: -22,
};

// Entertainment pull per genre for audience scores
const AUDIENCE_ENTERTAIN: Partial<Record<Genre, number>> = {
  comedy: 10, action: 9, reality: 8, 'soap-opera': 7, horror: 7,
  'talk-show': 5, 'late-night': 5, crime: 6, fantasy: 6,
  drama: 4, 'sci-fi': 4, procedural: 3,
  'limited-series': 2, anthology: 1, documentary: -4,
};

function calcEpisodeCriticScore(prod: ActiveProduction, epNum: number): number {
  const { draft, quality } = prod;
  const prestige  = CRITIC_PRESTIGE[draft.genre] ?? 0;
  const narrative = ((draft.storytelling.narrativeDensity - 5) / 5) * 8;
  const writer    = draft.writer ? (draft.writer.level - 1) * 2 : 0;
  const position  = epNum === 1 ? 3 : epNum === prod.totalEpisodes ? 8 : 0;
  const base      = quality * 0.62 + prestige + narrative + writer + position;
  const variance  = (rng() - 0.5) * 22;
  return clamp(Math.round(base + variance), 0, 100);
}

function calcEpisodeAudienceScore(
  prod: ActiveProduction, epNum: number, genrePopularity: Record<string, number>
): number {
  const { draft, quality, networkFit } = prod;
  const entertain  = AUDIENCE_ENTERTAIN[draft.genre] ?? 0;
  const popularity = ((genrePopularity[draft.genre] ?? 50) - 50) / 50 * 8;
  const fit        = (networkFit / 100) * 10;
  const finale     = epNum === prod.totalEpisodes ? 5 : 0;
  const base       = quality * 0.46 + entertain + popularity + fit + finale;
  const variance   = (rng() - 0.5) * 14;
  return clamp(Math.round(base + variance), 0, 100);
}
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function uid(): string { return Math.random().toString(36).slice(2, 10); }

// ─── episode rating ──────────────────────────────────────────────────────────

export function calcBaseRating(quality: number, networkFit: number, reach: number): number {
  return (quality / 100) * (networkFit / 100) * reach * 12;
}

export function getEffectiveReach(networkId: string, baseReach: number, modifiers: Record<string, number> = {}): number {
  const mod = modifiers[networkId] ?? 0;
  return Math.min(1.0, Math.max(0.1, baseReach + mod));
}

function calcReachImpact(avgRating: number, baseRating: number, networkType: string): number {
  const mult = networkType === 'streaming' ? 1.2 : networkType === 'premium' ? 0.8 : 0.4;
  if (baseRating <= 0) return 0;
  const ratio = avgRating / baseRating;
  return Math.max(-0.02, Math.min(0.05, (ratio - 1.0) * 0.04 * mult));
}

function calcEpisodeRating(prod: ActiveProduction, epIndex: number): number {
  // Hype decays across the season — strongest at premiere, gone by finale
  const hypeDecay = Math.max(0, 1 - epIndex / (prod.totalEpisodes + 1));
  const hypeBoost = ((prod.hypeLevel ?? 0) / 100) * 0.25 * hypeDecay;

  const base = prod.baseRating * (1 + prod.ratingsModifier) * (1 + hypeBoost);

  // Series build factor: quality shows build audience, weak shows drop off
  const fraction = epIndex / prod.totalEpisodes;
  const buildFactor = prod.quality >= 70 ? 0.06 * fraction : -0.05 * fraction;

  // Season 2+ gets established-audience bonus
  const seasonBonus = (prod.seasonNumber - 1) * 0.12;

  const variance = (rng() - 0.5) * (base * 0.3);

  return Math.max(0.1, Math.round((base * (1 + buildFactor + seasonBonus) + variance) * 10) / 10);
}

// ─── random events ───────────────────────────────────────────────────────────

interface EventTemplate {
  type: GameEvent['type'];
  headline: (title: string, ep: number, rating: number) => string;
  description: (title: string, ep: number, rating: number) => string;
  moneyImpact?: number;
  repImpact?: number;
  ratingsMod?: number;
  condition?: (prod: ActiveProduction, avgRating: number) => boolean;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    type: 'viral-moment',
    headline: (t) => `"${t}" goes viral`,
    description: (t, ep) => `Episode ${ep} of "${t}" is dominating social media. Memes are everywhere.`,
    repImpact: 3, ratingsMod: 0.18,
    condition: (p, avg) => avg > p.baseRating * 1.1,
  },
  {
    type: 'critical-acclaim',
    headline: (t) => `Critics rave about "${t}"`,
    description: (t) => `"${t}" is being called one of the best shows on television right now.`,
    repImpact: 4, ratingsMod: 0.12,
    condition: (p) => p.quality >= 78,
  },
  {
    type: 'scandal',
    headline: (t) => `Controversy surrounds "${t}"`,
    description: (t) => `Off-set drama and reports of tension are making headlines around "${t}".`,
    repImpact: -3, ratingsMod: -0.12,
  },
  {
    type: 'production-issue',
    headline: (t) => `Production problems hit "${t}"`,
    description: (t) => `"${t}" reportedly faced major production setbacks this week, impacting quality.`,
    moneyImpact: -200000, repImpact: -1, ratingsMod: -0.08,
  },
  {
    type: 'ratings-spike',
    headline: (t, ep, r) => `"${t}" surges to ${r.toFixed(1)}M viewers`,
    description: (t, ep) => `Episode ${ep} was a breakout episode, drawing the biggest audience yet.`,
    ratingsMod: 0.1,
    condition: (p, avg) => avg > p.baseRating,
  },
  {
    type: 'ratings-drop',
    headline: (t, ep, r) => `"${t}" drops to ${r.toFixed(1)}M`,
    description: (t, ep) => `Episode ${ep} saw a significant viewership decline, raising network concerns.`,
    ratingsMod: -0.1,
    condition: (p, avg) => avg < p.baseRating * 0.9,
  },
  {
    type: 'financial',
    headline: (t) => `Syndication deal for "${t}"`,
    description: (t) => `A secondary market deal for "${t}" has brought in additional revenue.`,
    moneyImpact: 500000,
    condition: (p) => p.quality >= 65 && p.currentEpisode > 3,
  },
];

function maybeGenerateEvent(
  prod: ActiveProduction,
  epNum: number,
  epRating: number,
  week: number,
  year: number,
): GameEvent | null {
  if (rng() > 0.18) return null;

  const avgRating = prod.episodeResults.length > 0
    ? prod.episodeResults.reduce((s, e) => s + e.rating, 0) / prod.episodeResults.length
    : prod.baseRating;

  const eligible = EVENT_TEMPLATES.filter(t =>
    !t.condition || t.condition(prod, avgRating)
  );
  if (!eligible.length) return null;

  const tmpl = eligible[Math.floor(rng() * eligible.length)];

  return {
    id: uid(),
    type: tmpl.type,
    week,
    year,
    headline: tmpl.headline(prod.draft.title, epNum, epRating),
    description: tmpl.description(prod.draft.title, epNum, epRating),
    showId: prod.id,
    showTitle: prod.draft.title,
    impact: {
      money: tmpl.moneyImpact,
      reputation: tmpl.repImpact,
    },
    isRead: false,
  };
}

// ─── renewal logic ───────────────────────────────────────────────────────────

const RENEWAL_THRESHOLDS: Record<string, number> = {
  broadcast: 3.5, cable: 1.8, premium: 0.8, streaming: 1.2,
  international: 1.0, specialty: 0.6,
};

export function calcNetworkRenewalScore(
  avgRating: number,
  network: { type: string; preferredGenres: string[]; budgetPerEpisode: { min: number; max: number } },
  prod: { quality: number; networkFit: number; seasonNumber: number; draft: { genre: string } },
): number {
  const threshold = RENEWAL_THRESHOLDS[network.type] ?? 2;
  // Ratings vs threshold (0-40 pts)
  const ratingScore = clamp((avgRating / threshold) * 30, 0, 40);
  // Quality prestige (0-25 pts)
  const qualityScore = (prod.quality / 100) * 25;
  // Genre alignment (0-20 pts)
  const genreScore = network.preferredGenres.includes(prod.draft.genre) ? 20 : 5;
  // Network fit (0-10 pts)
  const fitScore = (prod.networkFit / 100) * 10;
  // Longevity fatigue — shows running too long become less attractive to networks
  const longevityPenalty = Math.max(0, (prod.seasonNumber - 3) * 4);
  return clamp(Math.round(ratingScore + qualityScore + genreScore + fitScore - longevityPenalty), 0, 100);
}

function shouldRenew(score: number): boolean {
  return score >= 42;
}

function generateRenewalOffer(
  prod: ActiveProduction,
  avgRating: number,
  week: number,
  year: number,
  score: number,
): RenewalOffer {
  const network = NETWORKS.find(n => n.id === prod.deal.networkId);
  const { min, max } = network?.budgetPerEpisode ?? { min: 100000, max: 500000 };
  const ratingsFactor = clamp(avgRating / (prod.baseRating || 1), 0.5, 1.5);
  const qualityFactor = prod.quality / 100;

  // Planned ending when score is low (42-57) or show has run many seasons
  const plannedEnding = score < 58 || prod.seasonNumber >= 4;

  // Planned endings: fewer episodes, higher per-ep pay (wrapping up is premium)
  const baseEpisodes = Math.min(prod.totalEpisodes + 2, 24);
  const episodesOffered = plannedEnding
    ? Math.max(4, Math.round(baseEpisodes * 0.65))
    : baseEpisodes;

  const payMultiplier = plannedEnding ? 1.12 : score >= 75 ? 1.06 : 1.02;
  const payPerEpisode = Math.round(
    (min + (max - min) * ((ratingsFactor + qualityFactor) / 2)) * payMultiplier
  );

  // Special episode options — network's creative suggestion
  const includeFlashback = episodesOffered >= 4 && rng() < (score >= 60 ? 0.55 : 0.35);
  const includeTwoPartFinale = score >= 55 && rng() < 0.60;
  const flashbackEpisodeNum = includeFlashback
    ? Math.max(1, Math.ceil(episodesOffered * 0.70))
    : undefined;

  return {
    id: uid(),
    productionId: prod.id,
    showId: prod.draft.id,
    networkId: prod.deal.networkId,
    showTitle: prod.draft.title,
    genre: prod.draft.genre,
    currentSeason: prod.seasonNumber,
    proposedSeason: prod.seasonNumber + 1,
    episodesOffered,
    payPerEpisode,
    expiresWeek: ((week + 3 - 1) % 52) + 1,
    expiresYear: week + 3 > 52 ? year + 1 : year,
    originalDraft: prod.draft,
    networkRenewalScore: score,
    plannedEnding,
    includeFlashback,
    includeTwoPartFinale,
    flashbackEpisodeNum,
  };
}

// ─── production → aired show ─────────────────────────────────────────────────

function avg(nums: number[]): number | undefined {
  if (!nums.length) return undefined;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

function productionToAiredShow(prod: ActiveProduction): AiredShow {
  const ratings = prod.episodeResults.map(e => e.rating);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
    : 0;
  const criticScores  = prod.episodeResults.map(e => e.criticScore).filter((s): s is number => s !== undefined);
  const audienceScores = prod.episodeResults.map(e => e.audienceScore).filter((s): s is number => s !== undefined);
  const revenue = prod.deal.payPerEpisode * prod.totalEpisodes;
  const cost = calcEpisodeCost(prod.draft) * prod.totalEpisodes;
  return {
    id: prod.id,
    draft: prod.draft,
    deal: prod.deal,
    quality: prod.quality,
    ratings,
    avgRating,
    avgCriticScore: avg(criticScores),
    avgAudienceScore: avg(audienceScores),
    revenue,
    cost,
    profit: revenue - cost,
    status: prod.status === 'cancelled' ? 'cancelled' : 'completed',
    awardsNominations: [],
    awardsWins: [],
    seasonNumber: prod.seasonNumber,
  };
}

// ─── genre popularity ────────────────────────────────────────────────────────

function updateGenrePopularity(
  current: Record<string, number>,
  activeProductions: ActiveProduction[],
  rivalStudios: RivalStudio[],
): Record<string, number> {
  // Tally airing shows and quality per genre (player + rivals)
  const genreCount: Record<string, number> = {};
  const genreQuality: Record<string, number[]> = {};

  for (const prod of activeProductions) {
    if (prod.status === 'airing') {
      const g = prod.draft.genre;
      genreCount[g] = (genreCount[g] ?? 0) + 1;
      (genreQuality[g] = genreQuality[g] ?? []).push(prod.quality);
    }
  }
  for (const rival of rivalStudios) {
    for (const show of rival.activeShows) {
      if (show.status === 'airing') {
        genreCount[show.genre] = (genreCount[show.genre] ?? 0) + 1;
        (genreQuality[show.genre] = genreQuality[show.genre] ?? []).push(show.quality);
      }
    }
  }

  const updated: Record<string, number> = {};
  for (const genre of Object.keys(current)) {
    let pop = current[genre] ?? 50;

    // 1. Random market drift
    pop += (rng() - 0.5) * 8;

    // 2. Quality influence — great shows elevate the genre; mediocre ones drag it
    const qualities = genreQuality[genre];
    if (qualities && qualities.length > 0) {
      const avgQ = qualities.reduce((s, q) => s + q, 0) / qualities.length;
      pop += (avgQ - 58) * 0.12;
    }

    // 3. Saturation penalty — beyond 3 simultaneous shows, audience fatigues
    const count = genreCount[genre] ?? 0;
    if (count > 3) pop -= (count - 3) * 3;

    // 4. Gentle mean-reversion so no genre stays pegged at 0 or 100 forever
    pop += (50 - pop) * 0.04;

    updated[genre] = clamp(Math.round(pop), 5, 100);
  }
  return updated;
}

// ─── rival AI ────────────────────────────────────────────────────────────────

const SHOW_TITLE_WORDS = [
  ['The', 'Last', 'Dark', 'Prime', 'Edge', 'Iron', 'Silent', 'Hidden', 'Lost', 'Black'],
  ['City', 'Crown', 'Hour', 'Signal', 'Gate', 'Storm', 'Line', 'Code', 'World', 'Ridge'],
];

function randomTitle(): string {
  const a = SHOW_TITLE_WORDS[0][Math.floor(rng() * 10)];
  const b = SHOW_TITLE_WORDS[1][Math.floor(rng() * 10)];
  return `${a} ${b}`;
}

function processRivalAI(rivals: RivalStudio[], genrePopularity: Record<string, number>): RivalStudio[] {
  return rivals.map(rival => {
    let updated = { ...rival, activeShows: [...rival.activeShows] };

    // Rivals complete/cancel shows each week
    updated.activeShows = updated.activeShows.map(show => {
      if (show.status === 'airing' && rng() > 0.92) {
        const completed: RivalShow = { ...show, status: rng() > 0.4 ? 'completed' : 'cancelled' };
        if (completed.status === 'completed') {
          updated = { ...updated, completedShows: updated.completedShows + 1, totalShows: updated.totalShows };
        }
        return completed;
      }
      return show;
    });

    // Rivals may greenlight a new show (base 8%; hot genres pull rivals in)
    if (rng() < 0.08 && updated.activeShows.filter(s => s.status === 'airing').length < 4) {
      // Weighted genre pick — bias toward high-popularity genres
      const weightedSpecialty = updated.specialty.flatMap(g => {
        const pop = genrePopularity[g] ?? 50;
        return pop >= 70 ? [g, g] : [g]; // hot genres appear twice → higher pick chance
      });
      const genre = weightedSpecialty[Math.floor(rng() * weightedSpecialty.length)];
      const availableNetwork = NETWORKS.find(n => n.preferredGenres.includes(genre));
      if (availableNetwork) {
        const quality = clamp(Math.round(rival.reputation * 0.7 + rng() * 30), 30, 95);
        const newShow: RivalShow = {
          id: uid(),
          title: randomTitle(),
          genre,
          quality,
          networkId: availableNetwork.id,
          avgRating: calcBaseRating(quality, 65, availableNetwork.reach),
          status: 'airing',
          seasonNumber: 1,
        };
        updated.activeShows = [...updated.activeShows, newShow];
        updated.totalShows += 1;
      }
    }

    // Rivals' reputation drifts slowly toward 50
    updated.reputation = clamp(rival.reputation + (rng() - 0.52) * 2, 20, 95);

    return updated;
  });
}

// ─── awards ──────────────────────────────────────────────────────────────────

const AWARD_CATEGORIES = [
  { id: 'best-drama', name: 'Best Drama Series', genres: ['drama', 'crime', 'thriller'] as Genre[] },
  { id: 'best-comedy', name: 'Best Comedy Series', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
  { id: 'best-limited', name: 'Best Limited Series', genres: ['limited-series', 'anthology', 'documentary'] as Genre[] },
  { id: 'best-genre', name: 'Best Genre Series', genres: ['sci-fi', 'fantasy', 'horror', 'action'] as Genre[] },
  { id: 'best-reality', name: 'Best Reality / Unscripted', genres: ['reality', 'talk-show'] as Genre[] },
  { id: 'best-writing', name: 'Outstanding Writing', genres: [] as Genre[] },
  { id: 'best-direction', name: 'Outstanding Direction', genres: [] as Genre[] },
  { id: 'best-actor-drama', name: 'Best Lead Performance (Drama)', genres: ['drama', 'crime', 'limited-series'] as Genre[] },
  { id: 'best-actor-comedy', name: 'Best Lead Performance (Comedy)', genres: ['comedy', 'talk-show', 'late-night'] as Genre[] },
];

export function generateNominationsForShow(
  awardShow: AwardShowDef,
  activeProds: ActiveProduction[],
  airedShows: AiredShow[],
  year: number,
): AwardNomination[] {
  const nominations: AwardNomination[] = [];
  const minQuality = awardShow.prestige >= 1.3 ? 65 : 60;

  const eligibleProds = activeProds.filter(
    p => (p.status === 'airing' || p.status === 'completed') && p.quality >= minQuality && p.startYear === year,
  );
  const eligibleAired = airedShows.filter(s => s.quality >= minQuality);

  const allShows = [
    ...eligibleProds.map(p => ({ id: p.id, title: p.draft.title, genre: p.draft.genre, quality: p.quality })),
    ...eligibleAired.slice(-5).map(s => ({ id: s.id, title: s.draft.title, genre: s.draft.genre, quality: s.quality })),
  ];

  for (const cat of awardShow.categories) {
    const candidates = cat.genres.length
      ? allShows.filter(s => (cat.genres as string[]).includes(s.genre))
      : allShows;

    if (!candidates.length) continue;

    const count = Math.min(candidates.length, 1 + Math.floor(rng() * 2));
    const sorted = [...candidates].sort((a, b) => b.quality - a.quality).slice(0, count);

    for (const show of sorted) {
      const threshold = awardShow.prestige >= 1.3 ? 0.85 : awardShow.prestige >= 1.0 ? 0.75 : 0.65;
      if (rng() < (show.quality / 100) * threshold) {
        nominations.push({
          id: uid(),
          categoryId: cat.id,
          categoryName: cat.name,
          showId: show.id,
          showTitle: show.title,
          year,
          isWinner: false,
          awardShowId: awardShow.id,
          awardShowName: awardShow.name,
        });
      }
    }
  }

  return nominations;
}

export function generateNominations(
  activeProds: ActiveProduction[],
  airedShows: AiredShow[],
  year: number,
): AwardNomination[] {
  const nominations: AwardNomination[] = [];

  // Eligible: shows that aired this year with quality >= 65
  const eligibleProds = activeProds.filter(
    p => (p.status === 'airing' || p.status === 'completed') && p.quality >= 65 && p.startYear === year,
  );
  const eligibleAired = airedShows.filter(s => s.quality >= 65);

  const allShows = [
    ...eligibleProds.map(p => ({ id: p.id, title: p.draft.title, genre: p.draft.genre, quality: p.quality })),
    ...eligibleAired.slice(-5).map(s => ({ id: s.id, title: s.draft.title, genre: s.draft.genre, quality: s.quality })),
  ];

  for (const cat of AWARD_CATEGORIES) {
    const candidates = cat.genres.length
      ? allShows.filter(s => cat.genres.includes(s.genre))
      : allShows;

    if (!candidates.length) continue;

    // Pick 1-3 nominations
    const count = Math.min(candidates.length, 1 + Math.floor(rng() * 2));
    const sorted = [...candidates].sort((a, b) => b.quality - a.quality).slice(0, count);

    for (const show of sorted) {
      if (rng() < (show.quality / 100) * 0.8) {
        nominations.push({
          id: uid(),
          categoryId: cat.id,
          categoryName: cat.name,
          showId: show.id,
          showTitle: show.title,
          year,
          isWinner: false,
        });
      }
    }
  }

  return nominations;
}

export function processAwardsCeremony(nominations: AwardNomination[], year: number, awardShowId?: string): AwardNomination[] {
  const thisYear = nominations.filter(n =>
    n.year === year && !n.isWinner &&
    (awardShowId ? (n.awardShowId ?? 'keystones') === awardShowId : true)
  );
  const byCategory = new Map<string, AwardNomination[]>();

  for (const nom of thisYear) {
    const key = `${nom.awardShowId ?? ''}:${nom.categoryId}`;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(nom);
  }

  const winnerIds = new Set<string>();
  byCategory.forEach((noms) => {
    if (!noms.length) return;
    winnerIds.add(noms[Math.floor(rng() * noms.length)].id);
  });

  return nominations.map(n => winnerIds.has(n.id) ? { ...n, isWinner: true } : n);
}

// ─── main advance-week function ───────────────────────────────────────────────

export interface WeekResult {
  studio: Studio;
  newEvents: GameEvent[];
}

export function advanceWeek(studio: Studio): WeekResult {
  const newWeek = studio.week >= 52 ? 1 : studio.week + 1;
  const newYear = studio.week >= 52 ? studio.year + 1 : studio.year;

  const newEvents: GameEvent[] = [];
  let money = studio.money;
  let reputation = studio.reputation;

  // Deduct building maintenance
  const buildingMaintenance = (studio.buildings ?? []).reduce(
    (sum, b) => sum + BUILDING_CONFIG[b.type][b.tier].weeklyMaintenance, 0
  );
  money -= buildingMaintenance;
  let awardsSeasonYear = studio.awardsSeasonYear;
  let processedAwardCeremonies = { ...(studio.processedAwardCeremonies ?? {}) };
  let networkReachModifiers = { ...(studio.networkReachModifiers ?? {}) };

  // Decay reach modifiers 20% at the start of each year
  if (newWeek === 1) {
    for (const nid of Object.keys(networkReachModifiers)) {
      networkReachModifiers[nid] *= 0.8;
      if (Math.abs(networkReachModifiers[nid]) < 0.005) delete networkReachModifiers[nid];
    }
  }

  // ── process productions ─────────────────────────────────────────────────
  let activeProductions = studio.activeProductions.map(prod => {
    if (prod.status === 'in-production') {
      if (prod.productionWeeks <= 1) return { ...prod, productionWeeks: 0, status: 'airing' as const };
      return { ...prod, productionWeeks: prod.productionWeeks - 1 };
    }
    return prod;
  });

  activeProductions = activeProductions.map(prod => {
    if (prod.status !== 'airing') return prod;

    // Binge drop: air all remaining episodes at once with a premiere-buzz boost
    if (prod.deal.releaseStrategy === 'all-at-once') {
      const buzzBoost = 1.10;
      const genrePop = studio.genrePopularity?.[prod.draft.genre] ?? 50;
      const popularityMult = 0.6 + (genrePop / 100) * 0.9;
      const updatedResults = [...prod.episodeResults];
      const boostedProd = { ...prod, baseRating: prod.baseRating * buzzBoost };

      for (let i = prod.currentEpisode; i < prod.totalEpisodes; i++) {
        const epNum = i + 1;
        const isFlashback = !!(prod.includeFlashback && prod.flashbackEpisodeNum === epNum);
        const isTwoPartFinale = !!(prod.includeTwoPartFinale && epNum > prod.totalEpisodes - 2);
        const baseR = Math.round(calcEpisodeRating(boostedProd, i) * popularityMult * 10) / 10;
        const epRating = Math.round(baseR * (isFlashback ? 1.10 : isTwoPartFinale ? 1.22 : 1.0) * 10) / 10;
        const criticScore = clamp(calcEpisodeCriticScore(boostedProd, epNum) + (isFlashback ? -8 : 0) + (isTwoPartFinale ? 12 : 0), 0, 100);
        const audienceScore = clamp(calcEpisodeAudienceScore(boostedProd, epNum, studio.genrePopularity ?? {}) + (isFlashback ? 15 : 0) + (isTwoPartFinale ? 10 : 0), 0, 100);
        money -= calcEpisodeCost(prod.draft);
        money += prod.deal.payPerEpisode;
        updatedResults.push({ episode: epNum, rating: epRating, criticScore, audienceScore });
      }

      const dropRating = updatedResults.at(-1)?.rating ?? prod.baseRating;
      const event = maybeGenerateEvent(prod, prod.totalEpisodes, dropRating, newWeek, newYear);
      if (event) {
        newEvents.push(event);
        if (event.impact?.money) money += event.impact.money;
        if (event.impact?.reputation) reputation += event.impact.reputation;
      }

      return { ...prod, currentEpisode: prod.totalEpisodes, episodeResults: updatedResults, status: 'completed' as const, ratingsModifier: 0 };
    }

    // Weekly release: one episode per advance-week
    const genrePop = studio.genrePopularity?.[prod.draft.genre] ?? 50;
    const popularityMult = 0.6 + (genrePop / 100) * 0.9;
    const epNum = prod.currentEpisode + 1;
    const isFlashback = !!(prod.includeFlashback && prod.flashbackEpisodeNum === epNum);
    const isTwoPartFinale = !!(prod.includeTwoPartFinale && epNum > prod.totalEpisodes - 2);
    const baseRating = Math.round(calcEpisodeRating(prod, epNum) * popularityMult * 10) / 10;
    const epRating = Math.round(baseRating * (isFlashback ? 1.10 : isTwoPartFinale ? 1.22 : 1.0) * 10) / 10;
    const criticScore = clamp(calcEpisodeCriticScore(prod, epNum) + (isFlashback ? -8 : 0) + (isTwoPartFinale ? 12 : 0), 0, 100);
    const audienceScore = clamp(calcEpisodeAudienceScore(prod, epNum, studio.genrePopularity ?? {}) + (isFlashback ? 15 : 0) + (isTwoPartFinale ? 10 : 0), 0, 100);
    const epResult = { episode: epNum, rating: epRating, criticScore, audienceScore };

    const epCost = calcEpisodeCost(prod.draft);
    money -= epCost;
    money += prod.deal.payPerEpisode;

    const event = maybeGenerateEvent(prod, epNum, epRating, newWeek, newYear);
    if (event) {
      newEvents.push(event);
      (epResult as typeof epResult & { eventId?: string }).eventId = event.id;
      if (event.impact?.money) money += event.impact.money;
      if (event.impact?.reputation) reputation += event.impact.reputation;
    }

    const updatedResults = [...prod.episodeResults, epResult];
    const newRatingsMod = clamp(prod.ratingsModifier * 0.85, -0.4, 0.4) + (event ? (event.impact?.reputation ?? 0) * 0.01 : 0);

    if (epNum >= prod.totalEpisodes) {
      return { ...prod, currentEpisode: epNum, episodeResults: updatedResults, status: 'completed' as const, ratingsModifier: newRatingsMod };
    }
    return { ...prod, currentEpisode: epNum, episodeResults: updatedResults, ratingsModifier: newRatingsMod };
  });

  // ── generate renewal offers for completed shows ──────────────────────────
  let renewalOffers = [...studio.renewalOffers];

  // Expire old offers
  renewalOffers = renewalOffers.filter(o =>
    !(o.expiresYear < newYear || (o.expiresYear === newYear && o.expiresWeek < newWeek))
  );

  activeProductions.forEach(prod => {
    if (prod.status !== 'completed') return;
    const alreadyHasOffer = renewalOffers.some(o => o.productionId === prod.id);
    if (alreadyHasOffer) return;

    const avgRating = prod.episodeResults.length
      ? prod.episodeResults.reduce((s, e) => s + e.rating, 0) / prod.episodeResults.length
      : 0;
    const network = NETWORKS.find(n => n.id === prod.deal.networkId);

    const renewalScore = network ? calcNetworkRenewalScore(avgRating, network, prod) : 0;
    if (network && shouldRenew(renewalScore)) {
      const offer = generateRenewalOffer(prod, avgRating, newWeek, newYear, renewalScore);
      renewalOffers.push(offer);
      newEvents.push({
        id: uid(),
        type: 'renewal-offer',
        week: newWeek,
        year: newYear,
        headline: `${network.name} offers renewal for "${prod.draft.title}"`,
        description: `Season ${offer.proposedSeason} — ${offer.episodesOffered} episodes at ${Math.round(offer.payPerEpisode / 1000)}K/ep.`,
        showId: prod.id,
        showTitle: prod.draft.title,
        impact: {},
        isRead: false,
      });
    } else if (network) {
      newEvents.push({
        id: uid(),
        type: 'cancellation',
        week: newWeek,
        year: newYear,
        headline: `"${prod.draft.title}" cancelled by ${network.name}`,
        description: `The show didn't meet viewership targets. Better luck next time.`,
        showId: prod.id,
        showTitle: prod.draft.title,
        impact: { reputation: -2 },
        isRead: false,
      });
      reputation -= 2;
    }
  });

  // ── move completed → aired shows ─────────────────────────────────────────
  const completedNow = activeProductions.filter(p => p.status === 'completed');
  const stillRunning = activeProductions.filter(p => p.status !== 'completed');
  const newAiredShows = completedNow.map(productionToAiredShow);

  // Apply reach impact from completed productions
  for (const prod of completedNow) {
    const network = NETWORKS.find(n => n.id === prod.deal.networkId);
    if (!network) continue;
    const avgR = prod.episodeResults.length
      ? prod.episodeResults.reduce((s, e) => s + e.rating, 0) / prod.episodeResults.length
      : 0;
    const impact = calcReachImpact(avgR, prod.baseRating, network.type);
    if (Math.abs(impact) > 0.001) {
      const current = networkReachModifiers[network.id] ?? 0;
      networkReachModifiers[network.id] = Math.max(-0.10, Math.min(0.20, current + impact));
    }
  }

  // Track the most recently successful show's draft for "Last Known Values" heat map
  const successfulCompleted = completedNow.find(p => {
    if (!p.episodeResults.length) return false;
    const avgR = p.episodeResults.reduce((s, e) => s + e.rating, 0) / p.episodeResults.length;
    return avgR >= p.baseRating * 0.95 && p.quality >= 65;
  });
  const lastSuccessfulDraft = successfulCompleted?.draft ?? studio.lastSuccessfulDraft;

  // ── awards season (multiple named ceremonies) ─────────────────────────────
  let awardNominations = [...studio.awardNominations];

  // First pass: generate nominations for shows whose nomination week is now
  for (const awardShow of AWARD_SHOWS) {
    const nomKey = `${awardShow.id}:nom`;
    if (newWeek === awardShow.nominationsWeek && (processedAwardCeremonies[nomKey] ?? 0) < newYear) {
      const noms = generateNominationsForShow(
        awardShow,
        activeProductions,
        [...studio.airedShows, ...newAiredShows],
        newYear,
      );
      if (noms.length) {
        awardNominations = [...awardNominations, ...noms];
        const repGain = Math.round(noms.length * awardShow.prestige);
        reputation += repGain;
        newEvents.push({
          id: uid(),
          type: 'award-nomination',
          week: newWeek,
          year: newYear,
          headline: `${awardShow.emoji} ${awardShow.name}: ${noms.length} nomination${noms.length > 1 ? 's' : ''}!`,
          description: `Nominated for: ${Array.from(new Set(noms.map(n => n.categoryName))).join(', ')}.`,
          impact: { reputation: repGain },
          isRead: false,
        });
      }
      processedAwardCeremonies = { ...processedAwardCeremonies, [nomKey]: newYear };
    }
  }

  // Second pass: process ceremonies for shows whose ceremony week is now
  for (const awardShow of AWARD_SHOWS) {
    const nomKey = `${awardShow.id}:nom`;
    const cerKey = `${awardShow.id}:cer`;
    if (newWeek === awardShow.ceremonyWeek && (processedAwardCeremonies[cerKey] ?? 0) < newYear) {
      const hasNoms = (processedAwardCeremonies[nomKey] ?? 0) >= newYear ||
        awardNominations.some(n => n.year === newYear && n.awardShowId === awardShow.id);
      if (!hasNoms) continue;

      awardNominations = processAwardsCeremony(awardNominations, newYear, awardShow.id);
      const wins = awardNominations.filter(n => n.year === newYear && n.isWinner && n.awardShowId === awardShow.id);

      if (wins.length) {
        const prize = Math.round(wins.length * 500_000 * awardShow.prestige);
        const repGain = Math.round(wins.length * 5 * awardShow.prestige);
        money += prize;
        reputation += repGain;
        newEvents.push({
          id: uid(),
          type: 'award-win',
          week: newWeek,
          year: newYear,
          headline: `${awardShow.emoji} ${awardShow.name}: Won ${wins.length} award${wins.length > 1 ? 's' : ''}!`,
          description: wins.map(w => w.categoryName).join(' · '),
          impact: { money: prize, reputation: repGain },
          isRead: false,
        });
      } else {
        const ourNoms = awardNominations.filter(n => n.year === newYear && n.awardShowId === awardShow.id);
        if (ourNoms.length) {
          newEvents.push({
            id: uid(),
            type: 'award-nomination',
            week: newWeek,
            year: newYear,
            headline: `${awardShow.emoji} ${awardShow.name} ceremony concluded`,
            description: `No wins this year. Keep making great shows!`,
            impact: {},
            isRead: false,
          });
        }
      }
      processedAwardCeremonies = { ...processedAwardCeremonies, [cerKey]: newYear };
    }
  }

  // ── rival AI ─────────────────────────────────────────────────────────────
  const rivalStudios = processRivalAI(studio.rivalStudios, studio.genrePopularity ?? {});

  // ── genre popularity ─────────────────────────────────────────────────────
  const genrePopularity = updateGenrePopularity(
    studio.genrePopularity ?? {},
    activeProductions,
    rivalStudios,
  );

  // Genre trend events (hot / cold genre notifications)
  if (rng() < 0.15) {
    const entries = Object.entries(genrePopularity);
    const hot = entries.filter(([, v]) => v >= 80);
    const cold = entries.filter(([, v]) => v <= 25);
    const target = rng() < 0.5 ? hot[Math.floor(rng() * hot.length)] : cold[Math.floor(rng() * cold.length)];
    if (target) {
      const [genreName, pop] = target;
      const isHot = pop >= 80;
      newEvents.push({
        id: uid(),
        type: 'rival-news',
        week: newWeek,
        year: newYear,
        headline: isHot ? `${genreName} is dominating the market` : `${genreName} audience is shrinking`,
        description: isHot
          ? `Audiences can't get enough ${genreName}. Shows in this genre are pulling big numbers.`
          : `${genreName} content is oversaturated. Viewers are tuning out.`,
        impact: {},
        isRead: false,
      });
    }
  }

  // ── rival news event (occasional) ────────────────────────────────────────
  if (rng() < 0.1) {
    const rival = rivalStudios[Math.floor(rng() * rivalStudios.length)];
    const hit = rival?.activeShows.find(s => s.status === 'airing' && s.avgRating > 4);
    if (hit) {
      newEvents.push({
        id: uid(),
        type: 'rival-news',
        week: newWeek,
        year: newYear,
        headline: `${rival.name} scores a hit with "${hit.title}"`,
        description: `The rival studio's ${hit.genre} series is drawing strong numbers.`,
        impact: {},
        isRead: false,
      });
    }
  }

  const updatedStudio: Studio = {
    ...studio,
    week: newWeek,
    year: newYear,
    money: Math.round(money),
    reputation: clamp(Math.round(reputation), 0, 100),
    totalShows: studio.totalShows + newAiredShows.length,
    awardsWon: studio.awardsWon + awardNominations.filter(n => n.year === newYear && n.isWinner).length,
    activeProductions: stillRunning,
    airedShows: [...studio.airedShows, ...newAiredShows],
    renewalOffers,
    awardNominations,
    events: [...newEvents, ...studio.events].slice(0, 80),
    rivalStudios,
    awardsSeasonYear,
    networkSlots: {},
    genrePopularity,
    lastSuccessfulDraft,
    processedAwardCeremonies,
    networkReachModifiers,
  };

  return { studio: updatedStudio, newEvents };
}
