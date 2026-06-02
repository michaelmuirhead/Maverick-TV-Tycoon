export type Genre = 'drama' | 'comedy' | 'crime' | 'sci-fi' | 'fantasy' | 'reality' | 'documentary' | 'horror' | 'procedural' | 'action';

export type NetworkType = 'broadcast' | 'cable' | 'premium' | 'streaming';

export type GameScreen = 'welcome' | 'dashboard' | 'show-creator' | 'network-hub' | 'productions' | 'season-results';

export interface CastMember {
  id: string;
  name: string;
  role: 'main' | 'supporting' | 'guest';
  starLevel: 1 | 2 | 3 | 4 | 5;
  weeklyFee: number; // per episode cost
  genre: Genre[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'director' | 'writer' | 'stunt';
  level: 1 | 2 | 3 | 4 | 5;
  episodeFee: number;
}

export interface ProductionBudget {
  crew: number;
  recordingStudio: number;
  locations: number;
  sets: number;
}

export interface PostProductionBudget {
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
}

export interface AiredShow {
  id: string;
  draft: ShowDraft;
  deal: NetworkDeal;
  quality: number;
  ratings: number[];     // one per aired episode
  avgRating: number;
  revenue: number;
  cost: number;
  profit: number;
  status: 'airing' | 'completed' | 'cancelled' | 'renewed';
  awardsNominations: string[];
  awardsWins: string[];
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  logo: string;
  tagline: string;
  reach: number;          // 0-1 multiplier for audience size
  minQuality: number;     // minimum quality score to accept pitch
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
}

export interface Studio {
  name: string;
  specialty: Genre;
  money: number;
  reputation: number; // 0-100
  week: number;
  year: number;
  totalShows: number;
  awardsWon: number;
  activeDeals: NetworkDeal[];
  airedShows: AiredShow[];
  currentDraft: ShowDraft | null;
}
