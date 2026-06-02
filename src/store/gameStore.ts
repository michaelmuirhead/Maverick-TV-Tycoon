import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Studio,
  ShowDraft,
  NetworkDeal,
  AiredShow,
  GameScreen,
  Genre,
} from '@/types/game';
import {
  createDefaultDraft,
  calcShowQuality,
  calcEpisodeCost,
  calcNetworkFit,
  calcNetworkOffer,
  simulateRatings,
} from '@/lib/gameLogic';
import { NETWORKS } from '@/data/networks';

interface GameState {
  screen: GameScreen;
  studio: Studio | null;
  showCreatorStep: number;

  // Actions
  startGame: (studioName: string, specialty: Genre) => void;
  setScreen: (screen: GameScreen) => void;
  setShowCreatorStep: (step: number) => void;
  updateDraft: (updates: Partial<ShowDraft>) => void;
  resetDraft: () => void;
  pitchShow: (networkId: string) => void;
  advanceWeek: () => void;
  resetGame: () => void;
}

const STARTING_MONEY = 10_000_000;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'welcome',
      studio: null,
      showCreatorStep: 0,

      startGame: (studioName, specialty) => {
        set({
          screen: 'dashboard',
          showCreatorStep: 0,
          studio: {
            name: studioName,
            specialty,
            money: STARTING_MONEY,
            reputation: 20,
            week: 1,
            year: 2024,
            totalShows: 0,
            awardsWon: 0,
            activeDeals: [],
            airedShows: [],
            currentDraft: createDefaultDraft(),
          },
        });
      },

      setScreen: (screen) => set({ screen }),

      setShowCreatorStep: (step) => set({ showCreatorStep: step }),

      updateDraft: (updates) =>
        set((state) => ({
          studio: state.studio
            ? { ...state.studio, currentDraft: { ...state.studio.currentDraft!, ...updates } }
            : null,
        })),

      resetDraft: () =>
        set((state) => ({
          studio: state.studio ? { ...state.studio, currentDraft: createDefaultDraft() } : null,
          showCreatorStep: 0,
        })),

      pitchShow: (networkId) => {
        const { studio } = get();
        if (!studio?.currentDraft) return;

        const network = NETWORKS.find((n) => n.id === networkId);
        if (!network) return;

        const draft = studio.currentDraft;
        const quality = calcShowQuality(draft);
        const networkFit = calcNetworkFit(draft, network);
        const totalOffer = calcNetworkOffer(quality, networkFit, network, draft.episodeCount);
        const payPerEpisode = Math.round(totalOffer / draft.episodeCount);

        const deal: NetworkDeal = {
          networkId,
          showId: draft.id,
          episodesOrdered: draft.episodeCount,
          payPerEpisode,
          marketingBudget: Math.round(totalOffer * 0.1),
          seasonNumber: 1,
        };

        const ratings = simulateRatings(quality, networkFit, network, draft.episodeCount);
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const revenue = payPerEpisode * draft.episodeCount;
        const cost = calcEpisodeCost(draft) * draft.episodeCount;
        const profit = revenue - cost;

        const renewalThreshold = network.type === 'broadcast' ? 4.0 : network.type === 'cable' ? 2.5 : network.type === 'premium' ? 1.5 : 2.0;
        const status = avgRating >= renewalThreshold ? 'renewed' : avgRating >= renewalThreshold * 0.7 ? 'completed' : 'cancelled';

        const repGain = quality >= 80 ? 8 : quality >= 65 ? 5 : quality >= 50 ? 2 : -2;

        const airedShow: AiredShow = {
          id: draft.id,
          draft,
          deal,
          quality,
          ratings,
          avgRating: Math.round(avgRating * 10) / 10,
          revenue,
          cost,
          profit,
          status,
          awardsNominations: quality >= 75 ? ['Best Drama Series', 'Best Lead Actor'] : [],
          awardsWins: quality >= 85 ? ['Best Drama Series'] : [],
        };

        set((state) => ({
          screen: 'productions',
          studio: state.studio
            ? {
                ...state.studio,
                money: state.studio.money + profit,
                reputation: Math.min(100, Math.max(0, state.studio.reputation + repGain)),
                totalShows: state.studio.totalShows + 1,
                awardsWon: state.studio.awardsWon + airedShow.awardsWins.length,
                activeDeals: [...state.studio.activeDeals, deal],
                airedShows: [...state.studio.airedShows, airedShow],
                currentDraft: createDefaultDraft(),
              }
            : null,
          showCreatorStep: 0,
        }));
      },

      advanceWeek: () =>
        set((state) => {
          if (!state.studio) return state;
          const newWeek = state.studio.week + 1;
          const newYear = newWeek > 52 ? state.studio.year + 1 : state.studio.year;
          return {
            studio: {
              ...state.studio,
              week: newWeek > 52 ? 1 : newWeek,
              year: newYear,
            },
          };
        }),

      resetGame: () => set({ screen: 'welcome', studio: null, showCreatorStep: 0 }),
    }),
    { name: 'maverick-tv-tycoon' }
  )
);
