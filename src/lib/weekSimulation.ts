import {
  Studio, ActiveProduction, GameEvent, RenewalOffer, AiredShow,
  AwardNomination, RivalStudio, RivalShow, Genre,
} from '@/types/game';
import { NETWORKS } from '@/data/networks';
import { RIVAL_STUDIOS } from '@/data/rivals';
import { calcEpisodeCost } from '@/lib/gameLogic';

// ─── helpers ────────────────────────────────────────────────────────────────

function rng(): number { return Math.random(); }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function uid(): string { return Math.random().toString(36).slice(2, 10); }

// ─── episode rating ──────────────────────────────────────────────────────────

export function calcBaseRating(quality: number, networkFit: number, reach: number): number {
  return (quality / 100) * (networkFit / 100) * reach * 12;
}

function calcEpisodeRating(prod: ActiveProduction, epIndex: number): number {
  const base = prod.baseRating * (1 + prod.ratingsModifier);

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

function shouldRenew(avgRating: number, networkType: string, quality: number): boolean {
  const thresholds: Record<string, number> = {
    broadcast: 3.5, cable: 1.8, premium: 0.8, streaming: 1.2,
    international: 1.0, specialty: 0.6,
  };
  const threshold = thresholds[networkType] ?? 2;
  // Quality also plays a role: prestige shows get renewed below ratings threshold
  return avgRating >= threshold || (quality >= 82 && avgRating >= threshold * 0.7);
}

function generateRenewalOffer(
  prod: ActiveProduction,
  avgRating: number,
  week: number,
  year: number,
): RenewalOffer {
  const network = NETWORKS.find(n => n.id === prod.deal.networkId);
  const { min, max } = network?.budgetPerEpisode ?? { min: 100000, max: 500000 };
  const ratingsFactor = clamp(avgRating / (prod.baseRating || 1), 0.5, 1.5);
  const qualityFactor = prod.quality / 100;
  const payPerEpisode = Math.round((min + (max - min) * ((ratingsFactor + qualityFactor) / 2)) * 1.05);

  return {
    id: uid(),
    productionId: prod.id,
    showId: prod.draft.id,
    networkId: prod.deal.networkId,
    showTitle: prod.draft.title,
    genre: prod.draft.genre,
    currentSeason: prod.seasonNumber,
    proposedSeason: prod.seasonNumber + 1,
    episodesOffered: Math.min(prod.totalEpisodes + 2, 24),
    payPerEpisode,
    expiresWeek: ((week + 3 - 1) % 52) + 1,
    expiresYear: week + 3 > 52 ? year + 1 : year,
    originalDraft: prod.draft,
  };
}

// ─── production → aired show ─────────────────────────────────────────────────

function productionToAiredShow(prod: ActiveProduction): AiredShow {
  const ratings = prod.episodeResults.map(e => e.rating);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
    : 0;
  const revenue = prod.deal.payPerEpisode * prod.totalEpisodes;
  const cost = calcEpisodeCost(prod.draft) * prod.totalEpisodes;
  return {
    id: prod.id,
    draft: prod.draft,
    deal: prod.deal,
    quality: prod.quality,
    ratings,
    avgRating,
    revenue,
    cost,
    profit: revenue - cost,
    status: prod.status === 'cancelled' ? 'cancelled' : 'completed',
    awardsNominations: [],
    awardsWins: [],
    seasonNumber: prod.seasonNumber,
  };
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

function processRivalAI(rivals: RivalStudio[]): RivalStudio[] {
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

    // Rivals may greenlight a new show (8% chance per week)
    if (rng() < 0.08 && updated.activeShows.filter(s => s.status === 'airing').length < 4) {
      const genre = updated.specialty[Math.floor(rng() * updated.specialty.length)];
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

export function processAwardsCeremony(nominations: AwardNomination[], year: number): AwardNomination[] {
  const thisYear = nominations.filter(n => n.year === year && !n.isWinner);
  const byCategory = new Map<string, AwardNomination[]>();

  for (const nom of thisYear) {
    if (!byCategory.has(nom.categoryId)) byCategory.set(nom.categoryId, []);
    byCategory.get(nom.categoryId)!.push(nom);
  }

  const winnerIds = new Set<string>();

  byCategory.forEach((noms) => {
    if (!noms.length) return;
    // Winner weighted by quality (higher quality = more likely to win)
    const pick = noms[Math.floor(rng() * noms.length)];
    winnerIds.add(pick.id);
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
  let awardsSeasonYear = studio.awardsSeasonYear;

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

    const epNum = prod.currentEpisode + 1;
    const epRating = calcEpisodeRating(prod, epNum);
    const epResult = { episode: epNum, rating: epRating };

    // Deduct per-episode cost
    const epCost = calcEpisodeCost(prod.draft);
    money -= epCost;

    // Revenue comes in per episode
    money += prod.deal.payPerEpisode;

    // Maybe generate event
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

    if (network && shouldRenew(avgRating, network.type, prod.quality)) {
      const offer = generateRenewalOffer(prod, avgRating, newWeek, newYear);
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

  // ── awards season ────────────────────────────────────────────────────────
  let awardNominations = [...studio.awardNominations];

  if (newWeek === 40 && awardsSeasonYear !== newYear) {
    const noms = generateNominations(
      activeProductions,
      [...studio.airedShows, ...newAiredShows],
      newYear,
    );
    if (noms.length) {
      awardNominations = [...awardNominations, ...noms];
      reputation += noms.length;
      newEvents.push({
        id: uid(),
        type: 'award-nomination',
        week: newWeek,
        year: newYear,
        headline: `🎬 Awards season: ${noms.length} nomination(s) received!`,
        description: `Nominated for: ${Array.from(new Set(noms.map(n => n.categoryName))).join(', ')}.`,
        impact: { reputation: noms.length },
        isRead: false,
      });
    }
    awardsSeasonYear = newYear;
  }

  if (newWeek === 48 && awardsSeasonYear === newYear) {
    awardNominations = processAwardsCeremony(awardNominations, newYear);
    const wins = awardNominations.filter(n => n.year === newYear && n.isWinner);
    if (wins.length) {
      const prize = wins.length * 500_000;
      money += prize;
      reputation += wins.length * 5;
      newEvents.push({
        id: uid(),
        type: 'award-win',
        week: newWeek,
        year: newYear,
        headline: `🏆 Won ${wins.length} award${wins.length > 1 ? 's' : ''}!`,
        description: wins.map(w => w.categoryName).join(' · '),
        impact: { money: prize, reputation: wins.length * 5 },
        isRead: false,
      });
    } else {
      newEvents.push({
        id: uid(),
        type: 'award-nomination',
        week: newWeek,
        year: newYear,
        headline: `Awards ceremony concluded`,
        description: `Unfortunately, no wins this year. Keep making great shows!`,
        impact: {},
        isRead: false,
      });
    }
  }

  // ── rival AI ─────────────────────────────────────────────────────────────
  const rivalStudios = processRivalAI(studio.rivalStudios);

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
    networkSlots: {}, // recalculate
  };

  return { studio: updatedStudio, newEvents };
}
