import { CastMember, CrewMember, Genre } from '@/types/game';

// ─── fee baselines per level ──────────────────────────────────────────────────
// Used when a character gains or loses a level so their fee adjusts accordingly.

const ACTOR_FEE: Record<number, number>    = { 1: 9_500,  2: 30_000,  3: 72_000,  4: 195_000, 5: 460_000 };
const DIRECTOR_FEE: Record<number, number> = { 1: 8_500,  2: 21_000,  3: 52_000,  4: 118_000, 5: 305_000 };
const WRITER_FEE: Record<number, number>   = { 1: 7_000,  2: 14_000,  3: 35_000,  4: 78_000,  5: 187_000 };

function feeBase(role: string, level: number): number {
  if (role === 'director') return DIRECTOR_FEE[level] ?? 8_500;
  if (role === 'writer')   return WRITER_FEE[level]   ?? 7_000;
  return ACTOR_FEE[level] ?? 9_500;
}

function scaledFee(role: string, level: number, rand: () => number): number {
  return Math.round(feeBase(role, level) * (0.85 + rand() * 0.30)); // ±15% variance
}

// ─── seeding helpers ──────────────────────────────────────────────────────────

function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (((h << 5) + h) ^ id.charCodeAt(i)) >>> 0;
  return h;
}

function initAge(level: number, isCrew: boolean, hash: number): number {
  const ranges: Record<number, [number, number]> = isCrew
    ? { 1: [22, 28], 2: [25, 36], 3: [28, 44], 4: [32, 52], 5: [38, 58] }
    : { 1: [18, 24], 2: [21, 32], 3: [25, 38], 4: [28, 44], 5: [32, 50] };
  const [lo, hi] = ranges[level] ?? [25, 40];
  return lo + (hash % (hi - lo + 1));
}

function derivePhase(age: number, isCrew: boolean, level: number): NonNullable<CastMember['careerPhase']> {
  const risingMax = isCrew ? 35 : 30;
  const peakMax   = isCrew ? 55 : 50;
  if (age >= peakMax)               return 'declining';
  if (age < risingMax && level <= 3) return 'rising';
  return 'peak';
}

/** Assigns age and careerPhase to every pool member that doesn't already have one. */
export function seedTalentPool(
  cast: CastMember[],
  crew: CrewMember[],
): { cast: CastMember[]; crew: CrewMember[] } {
  return {
    cast: cast.map(c => {
      if (c.age !== undefined) return c;
      const age = initAge(c.starLevel, false, hashId(c.id));
      return { ...c, age, careerPhase: derivePhase(age, false, c.starLevel) };
    }),
    crew: crew.map(c => {
      if (c.age !== undefined) return c;
      const age = initAge(c.level, true, hashId(c.id));
      return { ...c, age, careerPhase: derivePhase(age, true, c.level) };
    }),
  };
}

// ─── fresh-talent generation ──────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alex','Avery','Blake','Cameron','Casey','Chris','Dana','Devon','Drew','Eli',
  'Emery','Finn','Harper','Hunter','Jamie','Jordan','Jules','Kai','Lane','Logan',
  'Luca','Morgan','Nash','Parker','Quinn','Remy','Riley','Rowan','Sam','Skylar',
  'Spencer','Taylor','Theo','Tyler','Wade','Amber','Aria','Bianca','Carmen','Clara',
  'Diana','Fiona','Grace','Hana','Isla','Jade','Keely','Luna','Maya','Nadia',
  'Olive','Paige','Rosa','Serena','Tara','Vera','Wren','Yara','Zoe','Demi',
];
const LAST_NAMES = [
  'Abbott','Adams','Banks','Bell','Blake','Brooks','Burns','Carter','Chen','Clark',
  'Cole','Cross','Davis','Drake','Ellis','Evans','Flynn','Ford','Foster','Fox',
  'Grant','Gray','Green','Hall','Hart','Hayes','Hill','Irving','James','Jones',
  'Kane','King','Knox','Lane','Lee','Lowe','Marsh','Moore','Nash','Noble',
  'Okafor','Owens','Park','Pierce','Price','Reed','Reeves','Rivera','Ross','Scott',
  'Shaw','Silva','Stone','Torres','Tran','Turner','Vega','Walsh','West','White',
];

const ALL_GENRES: Genre[] = [
  'drama','comedy','crime','sci-fi','fantasy','reality','documentary',
  'horror','procedural','action','limited-series','anthology','talk-show','late-night','soap-opera',
];

function pick<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }

function pickGenres(count: number, exclude: Genre[], rand: () => number): Genre[] {
  const pool = ALL_GENRES.filter(g => !exclude.includes(g));
  const result: Genre[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(...pool.splice(idx, 1));
  }
  return result;
}

let _seq = 0;
function genId(prefix: string): string { return `${prefix}-gen-${Date.now()}-${++_seq}`; }

export function generateFreshActor(rand: () => number): CastMember {
  const name  = `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`;
  const role  = rand() < 0.55 ? 'main' : 'supporting';
  const genres = pickGenres(Math.floor(rand() * 2) + 1, [], rand);
  const age   = Math.floor(rand() * 6) + 18;
  return {
    id: genId('c'),
    name,
    role: role as CastMember['role'],
    starLevel: 1,
    weeklyFee: scaledFee(role, 1, rand),
    genre: genres,
    status: 'available',
    age,
    careerPhase: 'rising',
  };
}

export function generateFreshCrew(role: 'director' | 'writer', rand: () => number): CrewMember {
  const name      = `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`;
  const strengths  = pickGenres(Math.floor(rand() * 2) + 1, [], rand);
  const weaknesses = pickGenres(Math.floor(rand() * 2) + 1, strengths, rand);
  const age       = Math.floor(rand() * 6) + 22;
  return {
    id: genId(role === 'director' ? 'd' : 'w'),
    name,
    role,
    level: 1,
    episodeFee: scaledFee(role, 1, rand),
    status: 'available',
    genreStrengths: strengths,
    genreWeaknesses: weaknesses,
    age,
    careerPhase: 'rising',
  };
}

// ─── annual lifecycle cycle ───────────────────────────────────────────────────

export interface TalentCycleResult {
  cast: CastMember[];
  crew: CrewMember[];
  retirements: Array<{ name: string; role: string; level: number }>;
  levelUps:    Array<{ name: string; role: string; newLevel: number }>;
}

export function runAnnualTalentCycle(
  pool: { cast: CastMember[]; crew: CrewMember[] },
  rand: () => number = Math.random,
): TalentCycleResult {
  const retirements: TalentCycleResult['retirements'] = [];
  const levelUps:    TalentCycleResult['levelUps']    = [];
  const retiredActorRoles: CastMember['role'][]         = [];
  const retiredCrewRoles:  ('director' | 'writer')[]    = [];

  const newCast: CastMember[] = [];
  for (const c of pool.cast) {
    const age   = (c.age ?? 28) + 1;
    const phase = derivePhase(age, false, c.starLevel);
    let level: 1|2|3|4|5 = c.starLevel;

    if (phase === 'rising' && level < 4 && rand() < 0.18) {
      level = (level + 1) as typeof level;
      levelUps.push({ name: c.name, role: c.role, newLevel: level });
    } else if (phase === 'peak') {
      if (level < 5 && rand() < 0.06) {
        level = (level + 1) as typeof level;
        levelUps.push({ name: c.name, role: c.role, newLevel: level });
      } else if (level > 1 && rand() < 0.08) {
        level = (level - 1) as typeof level;
      }
    } else if (phase === 'declining' && level > 1 && rand() < 0.22) {
      level = (level - 1) as typeof level;
    }

    const retireP = age >= 65 ? 0.65 : age >= 60 ? 0.35 : phase === 'declining' && age >= 55 ? 0.15 : 0;
    if (retireP > 0 && rand() < retireP) {
      if (c.starLevel >= 4) retirements.push({ name: c.name, role: c.role, level: c.starLevel });
      retiredActorRoles.push(c.role);
      continue;
    }

    newCast.push({
      ...c,
      age,
      careerPhase: phase,
      starLevel: level,
      weeklyFee: level !== c.starLevel ? scaledFee(c.role, level, rand) : c.weeklyFee,
    });
  }

  const newCrew: CrewMember[] = [];
  for (const c of pool.crew) {
    const age   = (c.age ?? 35) + 1;
    const phase = derivePhase(age, true, c.level);
    let level: 1|2|3|4|5 = c.level;

    if (phase === 'rising' && level < 4 && rand() < 0.18) {
      level = (level + 1) as typeof level;
      levelUps.push({ name: c.name, role: c.role, newLevel: level });
    } else if (phase === 'peak') {
      if (level < 5 && rand() < 0.06) {
        level = (level + 1) as typeof level;
        levelUps.push({ name: c.name, role: c.role, newLevel: level });
      } else if (level > 1 && rand() < 0.08) {
        level = (level - 1) as typeof level;
      }
    } else if (phase === 'declining' && level > 1 && rand() < 0.22) {
      level = (level - 1) as typeof level;
    }

    const retireP = age >= 65 ? 0.65 : age >= 60 ? 0.35 : phase === 'declining' && age >= 55 ? 0.15 : 0;
    if (retireP > 0 && rand() < retireP) {
      if (c.level >= 4) retirements.push({ name: c.name, role: c.role, level: c.level });
      retiredCrewRoles.push(c.role as 'director' | 'writer');
      continue;
    }

    newCrew.push({
      ...c,
      age,
      careerPhase: phase,
      level,
      episodeFee: level !== c.level ? scaledFee(c.role, level, rand) : c.episodeFee,
    });
  }

  // Replenish with fresh rookies matching the role of each retiree
  for (const role of retiredActorRoles) {
    const fresh = generateFreshActor(rand);
    newCast.push({ ...fresh, role });
  }
  for (const role of retiredCrewRoles) {
    newCrew.push(generateFreshCrew(role, rand));
  }

  return { cast: newCast, crew: newCrew, retirements, levelUps };
}
