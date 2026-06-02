import { CastMember, CrewMember, Genre } from '@/types/game';

export const CAST_POOL: CastMember[] = [
  // ⭐⭐⭐⭐⭐ A-List
  { id: 'c1', name: 'Alexandra Vane', role: 'main', starLevel: 5, weeklyFee: 450000, genre: ['drama', 'crime'] },
  { id: 'c2', name: 'Marcus Holden', role: 'main', starLevel: 5, weeklyFee: 480000, genre: ['action', 'crime', 'drama'] },
  { id: 'c3', name: 'Sophia Krane', role: 'main', starLevel: 5, weeklyFee: 420000, genre: ['drama', 'fantasy', 'sci-fi'] },
  { id: 'c4', name: 'Diego Ferreira', role: 'main', starLevel: 5, weeklyFee: 460000, genre: ['crime', 'drama', 'action'] },
  { id: 'c5', name: 'Nadia Cross', role: 'main', starLevel: 5, weeklyFee: 390000, genre: ['comedy', 'drama'] },

  // ⭐⭐⭐⭐ B-List
  { id: 'c6', name: 'James Okafor', role: 'main', starLevel: 4, weeklyFee: 200000, genre: ['drama', 'procedural', 'crime'] },
  { id: 'c7', name: 'Luna Martinez', role: 'main', starLevel: 4, weeklyFee: 180000, genre: ['comedy', 'drama', 'reality'] },
  { id: 'c8', name: 'Ryan Beckett', role: 'main', starLevel: 4, weeklyFee: 220000, genre: ['action', 'sci-fi', 'fantasy'] },
  { id: 'c9', name: 'Priya Sharma', role: 'main', starLevel: 4, weeklyFee: 175000, genre: ['drama', 'crime', 'horror'] },
  { id: 'c10', name: 'Tyler Knox', role: 'main', starLevel: 4, weeklyFee: 195000, genre: ['action', 'crime', 'procedural'] },
  { id: 'c11', name: 'Chloe Webb', role: 'main', starLevel: 4, weeklyFee: 165000, genre: ['comedy', 'drama'] },
  { id: 'c12', name: 'Ezra Stone', role: 'main', starLevel: 4, weeklyFee: 185000, genre: ['fantasy', 'sci-fi', 'drama'] },

  // ⭐⭐⭐ Rising Stars
  { id: 'c13', name: 'Asha Ndidi', role: 'main', starLevel: 3, weeklyFee: 75000, genre: ['drama', 'crime'] },
  { id: 'c14', name: 'Connor Walsh', role: 'main', starLevel: 3, weeklyFee: 70000, genre: ['action', 'procedural'] },
  { id: 'c15', name: 'Mia Tanaka', role: 'main', starLevel: 3, weeklyFee: 65000, genre: ['comedy', 'drama', 'reality'] },
  { id: 'c16', name: 'Omar Hayes', role: 'main', starLevel: 3, weeklyFee: 72000, genre: ['sci-fi', 'fantasy', 'action'] },
  { id: 'c17', name: 'Elena Voss', role: 'main', starLevel: 3, weeklyFee: 68000, genre: ['horror', 'drama', 'crime'] },
  { id: 'c18', name: 'Finn Calloway', role: 'main', starLevel: 3, weeklyFee: 60000, genre: ['comedy', 'drama'] },

  // ⭐⭐ Supporting / Character Actors
  { id: 'c19', name: 'Vera Santos', role: 'supporting', starLevel: 2, weeklyFee: 25000, genre: ['drama', 'crime', 'procedural'] },
  { id: 'c20', name: 'Kwame Asante', role: 'supporting', starLevel: 2, weeklyFee: 22000, genre: ['action', 'drama'] },
  { id: 'c21', name: 'Iris Chen', role: 'supporting', starLevel: 2, weeklyFee: 20000, genre: ['comedy', 'drama', 'sci-fi'] },
  { id: 'c22', name: 'Sam Riordan', role: 'supporting', starLevel: 2, weeklyFee: 18000, genre: ['crime', 'procedural', 'drama'] },
  { id: 'c23', name: 'Nia Freeman', role: 'supporting', starLevel: 2, weeklyFee: 21000, genre: ['fantasy', 'drama', 'horror'] },
  { id: 'c24', name: 'Drew Larson', role: 'supporting', starLevel: 2, weeklyFee: 19000, genre: ['comedy', 'action', 'drama'] },
  { id: 'c25', name: 'Zoe Park', role: 'supporting', starLevel: 2, weeklyFee: 23000, genre: ['drama', 'sci-fi'] },
  { id: 'c26', name: 'Marcus Bell', role: 'supporting', starLevel: 2, weeklyFee: 17000, genre: ['crime', 'horror', 'drama'] },

  // ⭐ New Faces
  { id: 'c27', name: 'Taylor Mills', role: 'supporting', starLevel: 1, weeklyFee: 8000, genre: ['drama', 'comedy', 'action'] },
  { id: 'c28', name: 'River James', role: 'supporting', starLevel: 1, weeklyFee: 7500, genre: ['sci-fi', 'fantasy'] },
  { id: 'c29', name: 'Casey Morgan', role: 'supporting', starLevel: 1, weeklyFee: 7000, genre: ['horror', 'drama', 'crime'] },
  { id: 'c30', name: 'Jesse Quinn', role: 'supporting', starLevel: 1, weeklyFee: 6500, genre: ['comedy', 'drama'] },
];

export const CREW_POOL: CrewMember[] = [
  // Directors
  { id: 'd1', name: 'Helena Ford', role: 'director', level: 5, episodeFee: 300000 },
  { id: 'd2', name: 'Antoine Dubois', role: 'director', level: 5, episodeFee: 280000 },
  { id: 'd3', name: 'Kenji Nakamura', role: 'director', level: 4, episodeFee: 120000 },
  { id: 'd4', name: 'Sofia Reyes', role: 'director', level: 4, episodeFee: 110000 },
  { id: 'd5', name: 'Marcus Webb', role: 'director', level: 3, episodeFee: 50000 },
  { id: 'd6', name: 'Anya Kowalski', role: 'director', level: 3, episodeFee: 45000 },
  { id: 'd7', name: 'Sam Rivers', role: 'director', level: 2, episodeFee: 20000 },
  { id: 'd8', name: 'Pat Donovan', role: 'director', level: 1, episodeFee: 8000 },

  // Writers
  { id: 'w1', name: 'Rachel Kim', role: 'writer', level: 5, episodeFee: 200000 },
  { id: 'w2', name: 'Oscar Vega', role: 'writer', level: 5, episodeFee: 190000 },
  { id: 'w3', name: 'Isabelle Brown', role: 'writer', level: 4, episodeFee: 80000 },
  { id: 'w4', name: 'Theo Grant', role: 'writer', level: 4, episodeFee: 75000 },
  { id: 'w5', name: 'Maya Singh', role: 'writer', level: 3, episodeFee: 35000 },
  { id: 'w6', name: 'Leo Carver', role: 'writer', level: 3, episodeFee: 30000 },
  { id: 'w7', name: 'Nina Park', role: 'writer', level: 2, episodeFee: 15000 },
  { id: 'w8', name: 'Chris Dale', role: 'writer', level: 1, episodeFee: 6000 },
];
