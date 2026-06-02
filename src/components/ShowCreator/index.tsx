'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { calcShowQuality, calcEpisodeCost, getBuildingQualityBonuses } from '@/lib/gameLogic';
import QualityMeter from '@/components/ui/QualityMeter';
import BasicInfo from './steps/BasicInfo';
import CastCrew from './steps/CastCrew';
import ProductionBudgetStep from './steps/ProductionBudget';
import PostProductionStep from './steps/PostProductionStep';
import CreativeSliders from './steps/CreativeSliders';
import ReviewStep from './steps/ReviewStep';
import { formatMoney } from '@/lib/gameLogic';

const STEPS = [
  { id: 0, label: 'Basic Info', emoji: '📋' },
  { id: 1, label: 'Cast & Crew', emoji: '🎭' },
  { id: 2, label: 'Production', emoji: '🎥' },
  { id: 3, label: 'Post-Production', emoji: '✂️' },
  { id: 4, label: 'Creative Identity', emoji: '🎨' },
  { id: 5, label: 'Review', emoji: '✅' },
];

export default function ShowCreator() {
  const studio = useGameStore((s) => s.studio);
  const step = useGameStore((s) => s.showCreatorStep);
  const setStep = useGameStore((s) => s.setShowCreatorStep);
  const updateDraft = useGameStore((s) => s.updateDraft);
  const setScreen = useGameStore((s) => s.setScreen);

  if (!studio?.currentDraft) return null;
  const draft = studio.currentDraft;

  const buildingBonuses = getBuildingQualityBonuses(studio.buildings ?? []);
  const quality = calcShowQuality(draft, buildingBonuses);
  const epCost = calcEpisodeCost(draft);

  const canProceed = () => {
    if (step === 0) return draft.title.trim().length >= 2;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setScreen('network-hub');
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else setScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base text-white">Show Creator</h1>
            <p className="text-xs text-zinc-500">
              {draft.title || 'New Show'} &bull; Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs text-zinc-500">Est. cost/ep</div>
              <div className="text-sm font-bold text-amber-400 tabular-nums">{formatMoney(epCost)}</div>
            </div>
            <QualityMeter score={quality} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Step Progress */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex gap-1">
            {STEPS.map((s) => (
              <div
                key={s.id}
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  s.id < step ? 'bg-amber-500 cursor-pointer' : s.id === step ? 'bg-amber-500/60' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s) => (
              <div key={s.id} className={`text-xs transition-colors ${s.id === step ? 'text-amber-400 font-semibold' : s.id < step ? 'text-zinc-500' : 'text-zinc-700'}`}>
                <span className="hidden md:inline">{s.emoji} {s.label}</span>
                <span className="md:hidden">{s.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 0 && <BasicInfo draft={draft} onUpdate={updateDraft} />}
        {step === 1 && <CastCrew draft={draft} onUpdate={updateDraft} />}
        {step === 2 && <ProductionBudgetStep draft={draft} onUpdate={updateDraft} />}
        {step === 3 && <PostProductionStep draft={draft} onUpdate={updateDraft} />}
        {step === 4 && <CreativeSliders draft={draft} onUpdate={updateDraft} />}
        {step === 5 && <ReviewStep draft={draft} studioMoney={studio.money} buildingBonuses={buildingBonuses} />}
      </div>

      {/* Footer Nav */}
      <footer className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="px-4 sm:px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-all text-sm"
          >
            ← <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`text-xs sm:text-sm font-semibold ${quality >= 60 ? 'text-emerald-400' : quality >= 40 ? 'text-amber-400' : 'text-zinc-500'}`}>
              Q: {quality}
            </div>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-4 sm:px-6 py-2.5 font-bold rounded-xl text-sm transition-all ${
                canProceed()
                  ? step === STEPS.length - 1
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {step === STEPS.length - 1
                ? <><span className="hidden sm:inline">Pitch to Networks</span><span className="sm:hidden">Pitch</span> →</>
                : 'Next →'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
