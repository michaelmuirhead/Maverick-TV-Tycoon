import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Studio, ShowDraft, NetworkDeal, GameScreen, Genre,
  ActiveProduction,
} from '@/types/game';
import {
  createDefaultDraft, calcShowQuality,
  calcNetworkFit, calcNetworkOffer,
} from '@/lib/gameLogic';
import { advanceWeek as simulateWeek, calcBaseRating } from '@/lib/weekSimulation';
import { NETWORKS } from '@/data/networks';
import { RIVAL_STUDIOS } from '@/data/rivals';
import { GENRE_PROFILES } from '@/data/genres';

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

        const quality = calcShowQuality(draft);
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

        const baseRating = calcBaseRating(quality, networkFit, network.reach);

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
        set({ studio: updated });
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

      resetGame: () => set({ screen: 'welcome', studio: null, showCreatorStep: 0 }),
    }),
    { name: 'maverick-tv-tycoon-v2' }
  )
);
