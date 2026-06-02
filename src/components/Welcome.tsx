'use client';
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Genre } from '@/types/game';
import { GENRES } from '@/data/genres';

export default function Welcome() {
  const startGame = useGameStore((s) => s.startGame);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState<Genre>('drama');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!name.trim()) { setError('Give your studio a name.'); return; }
    startGame(name.trim(), specialty);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">🎬</div>
        <h1 className="text-5xl font-black text-white tracking-tight">Maverick TV</h1>
        <p className="text-amber-500 font-bold text-xl tracking-widest uppercase mt-1">Tycoon</p>
        <p className="text-zinc-500 mt-3 text-base max-w-md">Build your production studio. Greenlight hit shows. Rule the airwaves.</p>
      </div>

      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        {/* Studio Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Studio Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. Maverick Pictures"
            maxLength={40}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-base focus:outline-none focus:border-amber-500 transition-colors"
          />
          {error && <p className="text-rose-400 text-sm mt-1.5">{error}</p>}
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3">Studio Specialty</label>
          <div className="grid grid-cols-2 gap-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSpecialty(g.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 text-left ${
                  specialty === g.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                <span className="text-lg">{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            {GENRES.find((g) => g.id === specialty)?.description}
          </p>
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
