export type Genre =
  | 'drama' | 'comedy' | 'crime' | 'sci-fi' | 'fantasy'
  | 'reality' | 'documentary' | 'horror' | 'procedural' | 'action'
  | 'limited-series' | 'anthology' | 'talk-show' | 'late-night' | 'soap-opera';

export type NetworkType = 'broadcast' | 'cable' | 'premium' | 'streaming' | 'international' | 'specialty';

export type GameScreen =
  | 'welcome' | 'dashboard' | 'show-creator' | 'network-hub'
  | 'productions' | 'talent-market' | 'awards' | 'rivals' | 'studio-hq';

export type BuildingType = 'recording-studio' | 'editing-suite';
export type BuildingTier = 'basic' | 'professional' | 'prestige';

export interface StudioBuilding {
  id: string;
  type: BuildingType;
  tier: BuildingTier;
}

export type GameEventType =
  | 'ratings-spike' | 'ratings-drop' | 'viral-moment' | 'scandal'
  | 'critical-acclaim' | 'production-issue' | 'award-nomination' | 'award-win'
  | 'renewal-offer' | 'cancellation' | 'talent-news' | 'rival-news' | 'financial';

export interface GameEvent {
  id: string;
  type: GameEventType;
  week: number;
  year: number;
  headline: string;
  description: string;
  showId?: string;
  showTitle?: string;
  impact?: { money?: number; reputation?: number };
  isRead: boolean;
}

export interface CastMember {
  id: string;
  name: string;
  role: 'main' | 'supporting' | 'guest';
  starLevel: 1 | 2 | 3 | 4 | 5;
  weeklyFee: number;
  genre: Genre[];
  status: 'available' | 'contracted' | 'rival-contracted' | 'unavailable';
  age?: number;
  careerPhase?: 'rising' | 'peak' | 'declining';
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'director' | 'writer' | 'stunt';
  level: 1 | 2 | 3 | 4 | 5;
  episodeFee: number;
  status: 'available' | 'contracted' | 'rival-contracted';
  genreStrengths?: Genre[];
  genreWeaknesses?: Genre[];
  age?: number;
  careerPhase?: 'rising' | 'peak' | 'declining';
}

export interface ProductionBudget {
  [key: string]: number;
  crew: number;
  recordingStudio: number;
  locations: number;
  sets: number;
}

export interface PostProductionBudget {
  [key: string]: number;
  editing: number;
  visualEffects: number;
  soundEffects: number;
  music: number;
}

export interface CreativeIdentity {
  [key: string]: number;
  tone: number;
  humorLevel: number;
  realism: number;
}

export interface PerformanceRhythm {
  [key: string]: number;
  pacing: number;
  actingStyle: number;
  musicStyle: number;
}

export interface WorldLook {
  [key: string]: number;
  visualStyle: number;
  locationStyle: number;
  setStyle: number;
}

export interface Storytelling {
  [key: string]: number;
  structure: number;
  narrativeDensity: number;
  dialogueStyle: number;
}

export interface ShowDraft {
  id: string;
  title: string;
  genre: Genre;
  episodeLength: 22 | 44 | 60;
  episodeCount: number;
  logline: string;
  seasonNumber: number;
  parentShowId?: string;
  showType?: 'spinoff' | 'reboot';
  isRevival?: boolean;
  revivedFromShowId?: string;
  originalNetworkId?: string;
  plannedEnding?: boolean;
  flashbackEpisode?: boolean;
  flashbackEpisodeNum?: number;
  twoPartFinale?: boolean;
  mainCast: CastMember[];
  supportingCast: CastMember[];
  director: CrewMember | null;
  writer: CrewMember | null;
  guestStarBudget: number;
  extrasBudget: number;
  stuntBudget: number;
  production: ProductionBudget;
  postProduction: PostProductionBudget;
  creativeIdentity: CreativeIdentity;
  performanceRhythm: PerformanceRhythm;
  worldLook: WorldLook;
  storytelling: Storytelling;
}

export interface NetworkDeal {
  networkId: string;
  showId: string;
  episodesOrdered: number;
  payPerEpisode: number;
  marketingBudget: number;
  seasonNumber: number;
  releaseStrategy?: 'weekly' | 'all-at-once';
}

export interface EpisodeResult {
  episode: number;
  rating: number;
  criticScore?: number;
  audienceScore?: number;
  eventId?: string;
  wasReshot?: boolean;
}

export interface ActiveProduction {
  id: string;
  draft: ShowDraft;
  deal: NetworkDeal;
  quality: number;
  networkFit: number;
  seasonNumber: number;
  currentEpisode: number;
  totalEpisodes: number;
  episodeResults: EpisodeResult[];
  productionWeeks: number;
  status: 'in-production' | 'airing' | 'completed' | 'cancelled';
  ratingsModifier: number;
  baseRating: number;
  startWeek: number;
  startYear: number;
  hypeLevel?: number;
  marketingSpend?: number;
  wasReshot?: boolean;
  plannedEnding?: boolean;
  includeFlashback?: boolean;
  flashbackEpisodeNum?: number;
  includeTwoPartFinale?: boolean;
}

export interface RenewalOffer {
  id: string;
  productionId: string;
  showId: string;
  networkId: string;
  showTitle: string;
  genre: Genre;
  currentSeason: number;
  proposedSeason: number;
  episodesOffered: number;
  payPerEpisode: number;
  expiresWeek: number;
  expiresYear: number;
  originalDraft: ShowDraft;
  negotiationState?: 'counter-accepted' | 'counter-rejected';
  counterPayPerEpisode?: number;
  networkRenewalScore?: number;
  plannedEnding?: boolean;
  includeFlashback?: boolean;
  flashbackEpisodeNum?: number;
  includeTwoPartFinale?: boolean;
}

export interface AiredShow {
  id: string;
  draft: ShowDraft;
  deal: NetworkDeal;
  quality: number;
  ratings: number[];
  avgRating: number;
  avgCriticScore?: number;
  avgAudienceScore?: number;
  revenue: number;
  cost: number;
  profit: number;
  status: 'completed' | 'cancelled' | 'renewed';
  awardsNominations: string[];
  awardsWins: string[];
  seasonNumber: number;
}

export interface AwardNomination {
  id: string;
  categoryId: string;
  categoryName: string;
  showId: string;
  showTitle: string;
  year: number;
  isWinner: boolean;
  awardShowId?: string;
  awardShowName?: string;
}

export interface RivalShow {
  id: string;
  title: string;
  genre: Genre;
  quality: number;
  networkId: string;
  avgRating: number;
  status: 'airing' | 'completed' | 'cancelled';
  seasonNumber: number;
}

export interface RivalStudio {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  specialty: Genre[];
  reputation: number;
  activeShows: RivalShow[];
  completedShows: number;
  awardsWon: number;
  totalShows: number;
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  logo: string;
  tagline: string;
  reach: number;
  minQuality: number;
  budgetPerEpisode: { min: number; max: number };
  preferredGenres: Genre[];
  preferredStyle: {
    tone?: [number, number];
    humorLevel?: [number, number];
    realism?: [number, number];
    structure?: [number, number];
    narrativeDensity?: [number, number];
    visualStyle?: [number, number];
  };
  dealType: 'per-episode' | 'season-bulk';
  releaseStrategy?: 'weekly' | 'all-at-once' | 'player-choice';
  maxActiveShows: number;
  country?: string;
}

export interface Studio {
  name: string;
  specialty: Genre;
  money: number;
  reputation: number;
  week: number;
  year: number;
  totalShows: number;
  awardsWon: number;
  activeDeals: NetworkDeal[];
  airedShows: AiredShow[];
  currentDraft: ShowDraft | null;
  activeProductions: ActiveProduction[];
  renewalOffers: RenewalOffer[];
  awardNominations: AwardNomination[];
  events: GameEvent[];
  rivalStudios: RivalStudio[];
  awardsSeasonYear: number;
  processedAwardCeremonies?: Record<string, number>;
  networkReachModifiers?: Record<string, number>;
  networkSlots: Record<string, number>;
  genrePopularity: Record<string, number>;
  buildings?: StudioBuilding[];
  talentPool?: { cast: CastMember[]; crew: CrewMember[] };
  lastSuccessfulDraft?: ShowDraft;
}
