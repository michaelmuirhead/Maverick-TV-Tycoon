'use client';
import React from 'react';
import { CastMember, CrewMember, AiredShow, ActiveProduction } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { NETWORKS } from '@/data/networks';
import { GENRE_PROFILES } from '@/data/genres';
import { formatMoney } from '@/lib/gameLogic';

export type Talent = CastMember | CrewMember;

export function isCast(t: Talent): t is CastMember {
  return 'starLevel' in t;
}

interface ShowEntry {
  id: string;
  title: string;
  season: number;
  networkName: string;
  networkLogo: string;
  genre: string;
  episodes: number;
  avgRating: number | null;
  quality: number;
  status: string;
  role: string;
  earnings: number;
  criticScore?: number;
  audienceScore?: number;
  wins: string[];
}

function deriveHistory(talent: Talent, airedShows: AiredShow[], activeProductions: ActiveProduction[]): ShowEntry[] {
  const entries: ShowEntry[] = [];

  const matchRoles = (draft: AiredShow['draft']) => {
    const isMain = draft.mainCast.some(c => c.id === talent.id);
    const isSupp = draft.supportingCast.some(c => c.id === talent.id);
    const isDir  = draft.director?.id === talent.id;
    const isWrit = draft.writer?.id === talent.id;
    const isSR   = draft.showrunner?.id === talent.id;
    return { isMain, isSupp, isDir, isWrit, isSR };
  };

  for (const show of airedShows) {
    const { isMain, isSupp, isDir, isWrit, isSR } = matchRoles(show.draft);
    if (!isMain && !isSupp && !isDir && !isWrit && !isSR) continue;

    const network = NETWORKS.find(n => n.id === show.deal.networkId);
    let fee = 0;
    let role = '';
    if (isCast(talent)) {
      const c = isMain ? show.draft.mainCast.find(m => m.id === talent.id) : show.draft.supportingCast.find(m => m.id === talent.id);
      fee = c?.weeklyFee ?? talent.weeklyFee;
      role = isMain ? 'Main Cast' : 'Supporting';
    } else {
      const cr = isDir ? show.draft.director : isWrit ? show.draft.writer : show.draft.showrunner;
      fee = cr?.episodeFee ?? (talent as CrewMember).episodeFee;
      role = isDir ? 'Director' : isWrit ? 'Writer' : 'Showrunner';
    }

    entries.push({
      id: show.id,
      title: show.draft.title,
      season: show.seasonNumber,
      networkName: network?.name ?? 'Unknown',
      networkLogo: network?.logo ?? '📺',
      genre: show.draft.genre,
      episodes: show.ratings.length,
      avgRating: show.avgRating,
      quality: show.quality,
      status: show.status,
      role,
      earnings: fee * show.ratings.length,
      criticScore: show.avgCriticScore,
      audienceScore: show.avgAudienceScore,
      wins: show.awardsWins,
    });
  }

  for (const prod of activeProductions) {
    const { isMain, isSupp, isDir, isWrit, isSR } = matchRoles(prod.draft);
    if (!isMain && !isSupp && !isDir && !isWrit && !isSR) continue;

    const network = NETWORKS.find(n => n.id === prod.deal.networkId);
    let fee = 0;
    let role = '';
    if (isCast(talent)) {
      const c = isMain ? prod.draft.mainCast.find(m => m.id === talent.id) : prod.draft.supportingCast.find(m => m.id === talent.id);
      fee = c?.weeklyFee ?? talent.weeklyFee;
      role = isMain ? 'Main Cast' : 'Supporting';
    } else {
      const cr = isDir ? prod.draft.director : isWrit ? prod.draft.writer : prod.draft.showrunner;
      fee = cr?.episodeFee ?? (talent as CrewMember).episodeFee;
      role = isDir ? 'Director' : isWrit ? 'Writer' : 'Showrunner';
    }

    const aired = prod.episodeResults.map(e => e.rating);
    const avgRating = aired.length > 0 ? Math.round((aired.reduce((a, b) => a + b, 0) / aired.length) * 10) / 10 : null;

    entries.push({
      id: prod.id,
      title: prod.draft.title,
      season: prod.seasonNumber,
      networkName: network?.name ?? 'Unknown',
      networkLogo: network?.logo ?? '📺',
      genre: prod.draft.genre,
      episodes: prod.currentEpisode,
      avgRating,
      quality: prod.quality,
      status: prod.status,
      role,
      earnings: fee * prod.currentEpisode,
      wins: [],
    });
  }

  const order: Record<string, number> = { airing: 0, 'in-production': 1, completed: 2, cancelled: 3 };
  return entries.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
}

const ROLE_EMOJI: Record<string, string> = {
  main: '🎭', supporting: '🎭', director: '🎬', writer: '✍️', showrunner: '🎙️',
};

const PHASE_LABEL: Record<string, string> = {
  rising: '📈 Rising', peak: '⭐ Prime', declining: '📉 Late Career',
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  available:          { label: 'Available',     color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800' },
  contracted:         { label: 'On Your Show',  color: 'text-amber-400 bg-amber-900/30 border-amber-800' },
  'rival-contracted': { label: 'With Rival',    color: 'text-rose-400 bg-rose-900/30 border-rose-800' },
  unavailable:        { label: 'Unavailable',   color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
};

const SHOW_STATUS_COLORS: Record<string, string> = {
  completed:       'text-blue-400 bg-blue-900/30 border-blue-800',
  cancelled:       'text-rose-400 bg-rose-900/30 border-rose-800',
  airing:          'text-emerald-400 bg-emerald-900/30 border-emerald-800',
  'in-production': 'text-zinc-400 bg-zinc-800/60 border-zinc-700',
};

interface Props {
  talent: Talent;
  onClose: () => void;
}

export default function TalentProfileModal({ talent, onClose }: Props) {
  const studio = useGameStore(s => s.studio);
  if (!studio) return null;

  const cast = isCast(talent);
  const devEntry = (studio.developmentRoster ?? []).find(a => a.id === talent.id);
  const shows = deriveHistory(talent, studio.airedShows, studio.activeProductions);

  const totalEpisodes = shows.reduce((s, sh) => s + sh.episodes, 0);
  const totalEarnings = shows.reduce((s, sh) => s + sh.earnings, 0);
  const totalWins    = shows.reduce((s, sh) => s + sh.wins.length, 0);
  const ratedShows   = shows.filter(sh => sh.avgRating !== null);
  const avgRating    = ratedShows.length > 0
    ? Math.round(ratedShows.reduce((s, sh) => s + (sh.avgRating ?? 0), 0) / ratedShows.length * 10) / 10
    : null;

  const genreCount: Record<string, number> = {};
  for (const sh of shows) genreCount[sh.genre] = (genreCount[sh.genre] ?? 0) + 1;
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const level  = cast ? talent.starLevel : talent.level;
  const fee    = cast ? talent.weeklyFee : talent.episodeFee;
  const role   = cast ? (talent as CastMember).role : (talent as CrewMember).role;
  const badge  = STATUS_BADGE[talent.status] ?? STATUS_BADGE.available;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-5 py-3 flex items-center gap-3 rounded-t-2xl">
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors flex-shrink-0">← Back</button>
          <span className="text-zinc-700 flex-shrink-0">|</span>
          <h2 className="font-bold text-white text-sm flex-1 truncate">{talent.name}</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 text-xl leading-none flex-shrink-0">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Bio */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl flex-shrink-0">
              {ROLE_EMOJI[role] ?? '🎭'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-xl text-white leading-tight">{talent.name}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm">{'⭐'.repeat(level)}</span>
                {talent.careerPhase && <span className="text-xs text-zinc-400">{PHASE_LABEL[talent.careerPhase]}</span>}
                {talent.age !== undefined && <span className="text-xs text-zinc-500">Age {talent.age}</span>}
              </div>
              {!cast && <div className="text-xs text-zinc-500 mt-0.5 capitalize">{(talent as CrewMember).role}</div>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
                {devEntry && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-emerald-900/30 border-emerald-800 text-emerald-400">
                    🌱 Wk {devEntry.developmentWeeks ?? 0} in Dev
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-black text-amber-400 tabular-nums">{formatMoney(fee)}</div>
              <div className="text-xs text-zinc-500">/episode</div>
            </div>
          </div>

          {/* Genre / strength tags */}
          {cast ? (
            <div className="flex flex-wrap gap-1.5">
              {(talent as CastMember).genre.map(g => {
                const gp = GENRE_PROFILES[g as keyof typeof GENRE_PROFILES];
                return <span key={g} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{gp?.emoji} {gp?.label ?? g}</span>;
              })}
            </div>
          ) : (
            ((talent as CrewMember).genreStrengths?.length || (talent as CrewMember).genreWeaknesses?.length) ? (
              <div className="flex flex-wrap gap-1.5">
                {(talent as CrewMember).genreStrengths?.map(g => (
                  <span key={g} className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">✓ {g}</span>
                ))}
                {(talent as CrewMember).genreWeaknesses?.map(g => (
                  <span key={g} className="text-xs bg-rose-950/60 text-rose-400 border border-rose-800/50 px-2 py-0.5 rounded-full">✗ {g}</span>
                ))}
              </div>
            ) : null
          )}

          {/* Career stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Shows', val: shows.length.toString(), color: 'text-blue-400' },
              { label: 'Episodes', val: totalEpisodes.toString(), color: 'text-zinc-200' },
              { label: 'Avg Rating', val: avgRating ? `${avgRating}M` : '—', color: 'text-amber-400' },
              { label: 'Earned', val: totalEarnings > 0 ? formatMoney(totalEarnings) : '—', color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-center">
                <div className={`text-base font-black tabular-nums ${s.color}`}>{s.val}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Awards */}
          {totalWins > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2.5">
              <span className="text-xl">🏆</span>
              <div>
                <div className="text-sm font-bold text-amber-300">{totalWins} Award Win{totalWins > 1 ? 's' : ''}</div>
                <div className="text-xs text-amber-600">
                  {shows.flatMap(sh => sh.wins).slice(0, 3).join(' · ')}
                </div>
              </div>
            </div>
          )}

          {/* Development progress */}
          {devEntry && (
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4">
              <div className="text-xs font-bold text-emerald-300 mb-2">🌱 Development Program</div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Week {devEntry.developmentWeeks ?? 0}</span>
                <span>4% level-up chance / week</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((devEntry.developmentWeeks ?? 0) / 26) * 100)}%` }} />
              </div>
              <div className="text-xs text-zinc-600 mt-1.5">{formatMoney(3_000)}/week · Max: ⭐⭐⭐</div>
            </div>
          )}

          {/* Genre breakdown */}
          {topGenres.length >= 2 && (
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Genre Breakdown</div>
              <div className="space-y-1.5">
                {topGenres.map(([genre, count]) => {
                  const gp = GENRE_PROFILES[genre as keyof typeof GENRE_PROFILES];
                  return (
                    <div key={genre} className="flex items-center gap-2">
                      <span className="text-sm w-5 flex-shrink-0">{gp?.emoji}</span>
                      <span className="text-xs text-zinc-400 w-20 flex-shrink-0 truncate">{gp?.label ?? genre}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${Math.round((count / shows.length) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500 tabular-nums w-5 text-right">{count}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filmography */}
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Filmography</div>
            {shows.length > 0 ? (
              <div className="space-y-2">
                {shows.map((sh, i) => {
                  const gp = GENRE_PROFILES[sh.genre as keyof typeof GENRE_PROFILES];
                  return (
                    <div key={sh.id + i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base flex-shrink-0">{gp?.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-white truncate">{sh.title}</div>
                            <div className="text-xs text-zinc-500">S{sh.season} · {sh.networkLogo} {sh.networkName} · {sh.role}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 capitalize ${SHOW_STATUS_COLORS[sh.status] ?? SHOW_STATUS_COLORS.completed}`}>
                          {sh.status === 'in-production' ? 'In Prod.' : sh.status}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center">
                        <div>
                          <div className="font-bold text-amber-400">{sh.avgRating ? `${sh.avgRating}M` : '—'}</div>
                          <div className="text-zinc-600">Avg Rating</div>
                        </div>
                        <div>
                          <div className="font-bold text-zinc-300">{sh.episodes} eps</div>
                          <div className="text-zinc-600">Episodes</div>
                        </div>
                        <div>
                          <div className="font-bold text-emerald-400 tabular-nums">{sh.earnings > 0 ? formatMoney(sh.earnings) : '—'}</div>
                          <div className="text-zinc-600">Earnings</div>
                        </div>
                      </div>

                      {(sh.criticScore !== undefined || sh.audienceScore !== undefined) && (
                        <div className="mt-2 flex gap-4 text-xs">
                          {sh.criticScore !== undefined && (
                            <span className="text-zinc-500">🎬 Critics <span className="text-zinc-300 font-bold">{sh.criticScore}</span></span>
                          )}
                          {sh.audienceScore !== undefined && (
                            <span className="text-zinc-500">🍿 Audience <span className="text-zinc-300 font-bold">{sh.audienceScore}</span></span>
                          )}
                          <span className="text-zinc-500">Q <span className="text-zinc-300 font-bold">{sh.quality}</span></span>
                        </div>
                      )}

                      {sh.wins.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sh.wins.map(w => (
                            <span key={w} className="text-xs bg-amber-900/40 border border-amber-700 text-amber-300 px-1.5 py-0.5 rounded-full">🏆 {w}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-600">
                <div className="text-3xl mb-2">🎬</div>
                <div className="text-sm">No shows with your studio yet.</div>
                {talent.status === 'rival-contracted' && (
                  <div className="text-xs mt-1">Currently working with a rival studio.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
