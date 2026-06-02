'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function Welcome() {
  const startGame = useGameStore((s) => s.startGame);
  const [playerName, setPlayerName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!playerName.trim()) { setError('Enter your name to get started.'); return; }
    if (!studioName.trim()) { setError('Give your studio a name.'); return; }
    startGame(studioName.trim(), 'drama', playerName.trim());
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-8 sm:p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🎬</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Maverick TV</h1>
        <p className="text-amber-500 font-bold text-lg sm:text-xl tracking-widest uppercase mt-1">Tycoon</p>
        <p className="text-zinc-500 mt-3 text-sm sm:text-base max-w-sm mx-auto">
          Build your production studio. Greenlight hit shows. Rule the airwaves.
        </p>
      </div>

      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-8 space-y-6 sm:space-y-8">
        {/* Player Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. Alex Morgan"
            maxLength={40}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-base focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Studio Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Studio Name</label>
          <input
            type="text"
            value={studioName}
            onChange={(e) => { setStudioName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. Maverick Pictures"
            maxLength={40}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-base focus:outline-none focus:border-amber-500 transition-colors"
          />
          {error && <p className="text-rose-400 text-sm mt-1.5">{error}</p>}
        </div>

        {/* Starting Info */}
        <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-zinc-400">Starting Budget</div>
          <div className="text-lg font-bold text-amber-400">$10,000,000</div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded-xl transition-all duration-200 active:scale-95"
        >
          Start Your Studio →
        </button>
      </div>
    </div>
  );
}

