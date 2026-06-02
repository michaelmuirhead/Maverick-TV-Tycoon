import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Studio, ShowDraft, NetworkDeal, GameScreen, Genre,
  ActiveProduction, StudioBuilding, BuildingType, GameEvent, CastMember,
} from '@/types/game';
import {
  createDefaultDraft, calcShowQuality,
  calcNetworkFit, calcNetworkOffer,
  getBuildingQualityBonuses, getBuildingCapacity,
  calcParentBoost,
} from '@/lib/gameLogic';
import { advanceWeek as simulateWeek, calcBaseRating } from '@/lib/weekSimulation';
import { NETWORKS } from '@/data/networks';
import { RIVAL_STUDIOS } from '@/data/rivals';
import { GENRE_PROFILES } from '@/data/genres';
import { BUILDING_CONFIG, DEFAULT_BUILDINGS, getNextTier } from '@/data/buildings';
import { CAST_POOL, CREW_POOL } from '@/data/castPool';
import { seedTalentPool, runAnnualTalentCycle } from '@/lib/talentLifecycle';

interface GameState {
  screen: GameScreen;
  studio: Studio | null;
  showCreatorStep: number;

  startGame: (studioName: string, specialty: Genre) => void;
  setScreen: (screen: GameScreen) => void;
  setShowCreatorStep: (step: number) => void;
  updateDraft: (updates: Partial<ShowDraft>) => void;
  resetDraft: () => void;
  pitchShow: (networkId: string, releaseStrategy?: 'weekly' | 'all-at-once') => void;
  advanceWeek: () => void;
  buildBuilding: (type: BuildingType) => void;
  upgradeBuilding: (buildingId: string) => void;
  startSpinoff: (airedShowId: string) => void;
  startReboot: (airedShowId: string) => void;
  addMarketing: (productionId: string, spend: number, hypeGain: number) => void;
  reshootEpisode: (productionId: string, episodeIndex: number) => void;
  negotiateRenewal: (offerId: string, proposedPayPerEpisode: number) => void;
  acceptRenewal: (offerId: string) => void;
  declineRenewal: (offerId: string) => void;
  markEventsRead: () => void;
  resetGame: () => void;
}

const STARTING_MONEY = 10_000_000;
const PRODUCTION_WEEKS = 2;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'welcome',
      studio: null,
      showCreatorStep: 0,

      startGame: (studioName, specialty) => {
        const initialPopularity = Object.fromEntries(
          Object.keys(GENRE_PROFILES).map(g => [g, 50 + Math.round((Math.random() - 0.5) * 20)])
        );
        set({
          screen: 'dashboard',
          showCreatorStep: 0,
          studio: {
            name: studioName,
            specialty,
            money: STARTING_MONEY,
            reputation: 20,
            week: 1,
            year: 1,
            totalShows: 0,
            awardsWon: 0,
            activeDeals: [],
            airedShows: [],
            currentDraft: createDefaultDraft(),
            activeProductions: [],
            renewalOffers: [],
            awardNominations: [],
            events: [],
            rivalStudios: RIVAL_STUDIOS,
            awardsSeasonYear: 0,
            networkSlots: {},
            genrePopularity: initialPopularity,
            buildings: [...DEFAULT_BUILDINGS],
            talentPool: seedTalentPool(CAST_POOL, CREW_POOL),
          },
        });
      },

      setScreen: (screen) => set({ screen }),
      setShowCreatorStep: (step) => set({ showCreatorStep: step }),

      updateDraft: (updates) =>
        set((s) => ({
          studio: s.studio
            ? { ...s.studio, currentDraft: { ...s.studio.currentDraft!, ...updates } }
            : null,
        })),

      resetDraft: () =>
        set((s) => ({
          studio: s.studio ? { ...s.studio, currentDraft: createDefaultDraft() } : null,
          showCreatorStep: 0,
        })),

      pitchShow: (networkId, releaseStrategy = 'weekly') => {
        const { studio } = get();
        if (!studio?.currentDraft) return;

        const draft = studio.currentDraft;
        const network = NETWORKS.find((n) => n.id === networkId);
        if (!network) return;

        // Capacity check — only enforced for new games with buildings data
        if (studio.buildings !== undefined) {
          const activeCount = studio.activeProductions.filter(p => p.status !== 'completed').length;
          const rsCapacity = getBuildingCapacity(studio.buildings, 'recording-studio');
          const esCapacity = getBuildingCapacity(studio.buildings, 'editing-suite');
          if (rsCapacity <= activeCount || esCapacity <= activeCount) return;
        }

        const buildingBonuses = getBuildingQualityBonuses(studio.buildings ?? []);
        const quality = calcShowQuality(draft, buildingBonuses);
        const networkFit = calcNetworkFit(draft, network);
        const totalOffer = calcNetworkOffer(quality, networkFit, network, draft.episodeCount);
        const payPerEpisode = Math.round(totalOffer / draft.episodeCount);

        const deal: NetworkDeal = {
          networkId,
          showId: draft.id,
          episodesOrdered: draft.episodeCount,
          payPerEpisode,
          marketingBudget: Math.round(totalOffer * 0.08),
          seasonNumber: draft.seasonNumber,
          releaseStrategy,
        };

        const parentBoost = calcParentBoost(draft, studio.airedShows);
        const baseRating = calcBaseRating(quality, networkFit, network.reach) * (1 + parentBoost);

        const production: ActiveProduction = {
          id: draft.id,
          draft,
          deal,
          quality,
          networkFit,
          seasonNumber: draft.seasonNumber,
          currentEpisode: 0,
          totalEpisodes: draft.episodeCount,
          episodeResults: [],
          productionWeeks: PRODUCTION_WEEKS,
          status: 'in-production',
          ratingsModifier: 0,
          baseRating,
          startWeek: studio.week,
          startYear: studio.year,
        };

        const repGain = quality >= 75 ? 4 : quality >= 60 ? 2 : 0;
        const slots = { ...studio.networkSlots };
        slots[networkId] = (slots[networkId] ?? 0) + 1;

        const pitchEvent = {
          id: Math.random().toString(36).slice(2),
          type: 'financial' as const,
          week: studio.week,
          year: studio.year,
          headline: `"${draft.title}" greenlit by ${network.name}`,
          description: `${draft.episodeCount} episodes ordered at ${Math.round(payPerEpisode / 1000)}K/ep. Production begins.`,
          showId: draft.id,
          showTitle: draft.title,
          impact: {},
          isRead: false,
        };

        set((s) => ({
          screen: 'productions',
          studio: s.studio
            ? {
                ...s.studio,
                reputation: Math.min(100, s.studio.reputation + repGain),
                activeProductions: [...s.studio.activeProductions, production],
                activeDeals: [...s.studio.activeDeals, deal],
                currentDraft: createDefaultDraft(),
                events: [pitchEvent, ...s.studio.events].slice(0, 80),
                networkSlots: slots,
              }
            : null,
          showCreatorStep: 0,
        }));
      },

      advanceWeek: () => {
        const { studio } = get();
        if (!studio) return;
        const { studio: updated } = simulateWeek(studio);

        // Run the talent lifecycle once per year (when week just rolled over to 1)
        const yearJustChanged = studio.week === 52;
        if (yearJustChanged && updated.talentPool) {
          const { cast, crew, retirements, levelUps } = runAnnualTalentCycle(updated.talentPool);

          const talentEvents: GameEvent[] = [
            ...retirements.map(r => ({
              id: Math.random().toString(36).slice(2),
              type: 'talent-news' as const,
              week: updated.week,
              year: updated.year,
              headline: `${r.name} announces retirement`,
              description: `The ${r.level >= 5 ? 'legendary' : 'acclaimed'} ${r.role} has hung up their ${r.role === 'director' ? 'megaphone' : r.role === 'writer' ? 'pen' : 'script'} after a storied career.`,
              impact: {},
              isRead: false,
            })),
            ...levelUps
              .filter(lu => lu.newLevel >= 4)
              .map(lu => ({
                id: Math.random().toString(36).slice(2),
                type: 'talent-news' as const,
                week: updated.week,
                year: updated.year,
                headline: `${lu.name} has a career-defining year`,
                description: `The ${lu.role} is turning heads industry-wide, now considered ${lu.newLevel >= 5 ? 'a top-tier A-lister' : 'a major player'}.`,
                impact: {},
                isRead: false,
              })),
          ];

          set({
            studio: {
              ...updated,
              talentPool: { cast, crew },
              events: [...talentEvents, ...updated.events].slice(0, 80),
            },
          });
          return;
        }

        set({ studio: updated });
      },

      startSpinoff: (airedShowId) => {
        const { studio } = get();
        if (!studio) return;
        const parent = studio.airedShows.find((s) => s.id === airedShowId);
        if (!parent) return;
        const spinoffDraft: ShowDraft = {
          ...createDefaultDraft(),
          genre: parent.draft.genre,
          episodeLength: parent.draft.episodeLength,
          creativeIdentity: { ...parent.draft.creativeIdentity },
          performanceRhythm: { ...parent.draft.performanceRhythm },
          worldLook: { ...parent.draft.worldLook },
          storytelling: { ...parent.draft.storytelling },
          showType: 'spinoff',
          parentShowId: airedShowId,
          seasonNumber: 1,
        };
        set((s) => ({
          screen: 'show-creator',
          showCreatorStep: 0,
          studio: s.studio ? { ...s.studio, currentDraft: spinoffDraft } : null,
        }));
      },

      startReboot: (airedShowId) => {
        const { studio } = get();
        if (!studio) return;
        const parent = studio.airedShows.find((s) => s.id === airedShowId);
        if (!parent) return;
        const talentPool = studio.talentPool ?? { cast: CAST_POOL, crew: CREW_POOL };
        const returningMain = parent.draft.mainCast
          .map((c) => talentPool.cast.find((lc) => lc.id === c.id && lc.status === 'available'))
          .filter(Boolean) as CastMember[];
        const returningSupporting = parent.draft.supportingCast
          .map((c) => talentPool.cast.find((lc) => lc.id === c.id && lc.status === 'available'))
          .filter(Boolean) as CastMember[];
        const returningDirector = parent.draft.director
          ? (talentPool.crew.find((c) => c.id === parent.draft.director?.id && c.status === 'available') ?? null)
          : null;
        const returningWriter = parent.draft.writer
          ? (talentPool.crew.find((c) => c.id === parent.draft.writer?.id && c.status === 'available') ?? null)
          : null;
        const rebootDraft: ShowDraft = {
          ...parent.draft,
          id: crypto.randomUUID(),
          seasonNumber: 1,
          showType: 'reboot',
          parentShowId: airedShowId,
          mainCast: returningMain.slice(0, 5),
          supportingCast: returningSupporting.slice(0, 10),
          director: returningDirector,
          writer: returningWriter,
        };
        set((s) => ({
          screen: 'show-creator',
          showCreatorStep: 0,
          studio: s.studio ? { ...s.studio, currentDraft: rebootDraft } : null,
        }));
      },

      addMarketing: (productionId, spend, hypeGain) => {
        const { studio } = get();
        if (!studio || studio.money < spend) return;
        set((s) => ({
          studio: s.studio ? {
            ...s.studio,
            money: s.studio.money - spend,
            activeProductions: s.studio.activeProductions.map(p =>
              p.id === productionId
                ? { ...p, hypeLevel: Math.min(100, (p.hypeLevel ?? 0) + hypeGain), marketingSpend: (p.marketingSpend ?? 0) + spend }
                : p
            ),
          } : null,
        }));
      },

      reshootEpisode: (productionId, episodeIndex) => {
        const { studio } = get();
        if (!studio) return;
        const prod = studio.activeProductions.find(p => p.id === productionId);
        if (!prod) return;
        const reshootCost = Math.round(
          ([...prod.draft.mainCast, ...prod.draft.supportingCast].reduce((s, c) => s + c.weeklyFee, 0) +
           (prod.draft.director?.episodeFee ?? 0) + (prod.draft.writer?.episodeFee ?? 0) +
           Object.values(prod.draft.production).reduce((s, v) => s + v, 0)) * 0.4
        );
        if (studio.money < reshootCost) return;
        set((s) => ({
          studio: s.studio ? {
            ...s.studio,
            money: s.studio.money - reshootCost,
            activeProductions: s.studio.activeProductions.map(p => {
              if (p.id !== productionId) return p;
              const results = p.episodeResults.map((ep, idx) => {
                if (idx !== episodeIndex) return ep;
                return {
                  ...ep,
                  wasReshot: true,
                  criticScore: ep.criticScore !== undefined ? Math.min(100, ep.criticScore + 10 + Math.round(Math.random() * 12)) : ep.criticScore,
                  audienceScore: ep.audienceScore !== undefined ? Math.min(100, ep.audienceScore + 8 + Math.round(Math.random() * 10)) : ep.audienceScore,
                };
              });
              return { ...p, episodeResults: results, ratingsModifier: Math.min(0.4, p.ratingsModifier + 0.07) };
            }),
          } : null,
        }));
      },

      negotiateRenewal: (offerId, proposedPay) => {
        const { studio } = get();
        if (!studio) return;
        const offer = studio.renewalOffers.find(o => o.id === offerId);
        if (!offer) return;
        const increase = (proposedPay - offer.payPerEpisode) / offer.payPerEpisode;
        const repBonus = (studio.reputation - 50) / 500;
        const base = increase <= 0.10 ? 0.82 : increase <= 0.20 ? 0.55 : increase <= 0.30 ? 0.32 : 0.12;
        const accepted = Math.random() < Math.min(0.95, Math.max(0.05, base + repBonus));
        if (accepted) {
          set((s) => ({
            studio: s.studio ? {
              ...s.studio,
              renewalOffers: s.studio.renewalOffers.map(o =>
                o.id === offerId
                  ? { ...o, payPerEpisode: proposedPay, negotiationState: 'counter-accepted' as const, counterPayPerEpisode: proposedPay }
                  : o
              ),
              events: [{
                id: Math.random().toString(36).slice(2),
                type: 'financial' as const,
                week: s.studio.week,
                year: s.studio.year,
                headline: `${offer.networkId} accepts counter-offer for "${offer.showTitle}"`,
                description: `S${offer.proposedSeason} renegotiated to ${Math.round(proposedPay / 1000)}K/ep — a ${Math.round(increase * 100)}% raise.`,
                impact: {},
                isRead: false,
              }, ...s.studio!.events].slice(0, 80),
            } : null,
          }));
        } else {
          set((s) => ({
            studio: s.studio ? {
              ...s.studio,
              renewalOffers: s.studio.renewalOffers.filter(o => o.id !== offerId),
              events: [{
                id: Math.random().toString(36).slice(2),
                type: 'cancellation' as const,
                week: s.studio.week,
                year: s.studio.year,
                headline: `${offer.networkId} rejects counter-offer for "${offer.showTitle}"`,
                description: `The network has walked away from the renewal. The original offer is no longer on the table.`,
                impact: { reputation: -1 },
                isRead: false,
              }, ...s.studio!.events].slice(0, 80),
              reputation: Math.max(0, s.studio.reputation - 1),
            } : null,
          }));
        }
      },

      acceptRenewal: (offerId) => {
        const { studio } = get();
        if (!studio) return;
        const offer = studio.renewalOffers.find(o => o.id === offerId);
        if (!offer) return;

        const renewDraft: ShowDraft = {
          ...offer.originalDraft,
          id: Math.random().toString(36).slice(2),
          seasonNumber: offer.proposedSeason,
          parentShowId: offer.showId,
          episodeCount: offer.episodesOffered,
        };

        set((s) => ({
          screen: 'show-creator',
          showCreatorStep: 0,
          studio: s.studio
            ? {
                ...s.studio,
                currentDraft: renewDraft,
                renewalOffers: s.studio.renewalOffers.filter(o => o.id !== offerId),
              }
            : null,
        }));
      },

      declineRenewal: (offerId) =>
        set((s) => ({
          studio: s.studio
            ? { ...s.studio, renewalOffers: s.studio.renewalOffers.filter(o => o.id !== offerId) }
            : null,
        })),

      markEventsRead: () =>
        set((s) => ({
          studio: s.studio
            ? { ...s.studio, events: s.studio.events.map(e => ({ ...e, isRead: true })) }
            : null,
        })),

      buildBuilding: (type) => {
        const { studio } = get();
        if (!studio) return;
        const config = BUILDING_CONFIG[type]['basic'];
        if (studio.money < config.buildCost) return;
        const newBuilding: StudioBuilding = {
          id: `building-${type}-${Date.now()}`,
          type,
          tier: 'basic',
        };
        set((s) => ({
          studio: s.studio ? {
            ...s.studio,
            money: s.studio.money - config.buildCost,
            buildings: [...(s.studio.buildings ?? DEFAULT_BUILDINGS), newBuilding],
          } : null,
        }));
      },

      upgradeBuilding: (buildingId) => {
        const { studio } = get();
        if (!studio) return;
        const buildings = studio.buildings ?? DEFAULT_BUILDINGS;
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return;
        const nextTier = getNextTier(building.tier);
        if (!nextTier) return;
        const upgradeCost = BUILDING_CONFIG[building.type][building.tier].upgradeCost;
        if (studio.money < upgradeCost) return;
        set((s) => ({
          studio: s.studio ? {
            ...s.studio,
            money: s.studio.money - upgradeCost,
            buildings: (s.studio.buildings ?? DEFAULT_BUILDINGS).map(b =>
              b.id === buildingId ? { ...b, tier: nextTier } : b
            ),
          } : null,
        }));
      },

      resetGame: () => set({ screen: 'welcome', studio: null, showCreatorStep: 0 }),
    }),
    { name: 'maverick-tv-tycoon-v2' }
  )
);
