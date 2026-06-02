import { CastMember, CrewMember } from '@/types/game';

export const CAST_POOL: CastMember[] = [
  // ⭐⭐⭐⭐⭐ A-List
  { id: 'c1', name: 'Alexandra Vane', role: 'main', starLevel: 5, weeklyFee: 450000, genre: ['drama', 'crime'], status: 'available' },
  { id: 'c2', name: 'Marcus Holden', role: 'main', starLevel: 5, weeklyFee: 480000, genre: ['action', 'crime', 'drama'], status: 'available' },
  { id: 'c3', name: 'Sophia Krane', role: 'main', starLevel: 5, weeklyFee: 420000, genre: ['drama', 'fantasy', 'sci-fi'], status: 'available' },
  { id: 'c4', name: 'Diego Ferreira', role: 'main', starLevel: 5, weeklyFee: 460000, genre: ['crime', 'drama', 'action'], status: 'available' },
  { id: 'c5', name: 'Nadia Cross', role: 'main', starLevel: 5, weeklyFee: 390000, genre: ['comedy', 'drama'], status: 'available' },

  // ⭐⭐⭐⭐ B-List
  { id: 'c6', name: 'James Okafor', role: 'main', starLevel: 4, weeklyFee: 200000, genre: ['drama', 'procedural', 'crime'], status: 'available' },
  { id: 'c7', name: 'Luna Martinez', role: 'main', starLevel: 4, weeklyFee: 180000, genre: ['comedy', 'drama', 'reality'], status: 'available' },
  { id: 'c8', name: 'Ryan Beckett', role: 'main', starLevel: 4, weeklyFee: 220000, genre: ['action', 'sci-fi', 'fantasy'], status: 'available' },
  { id: 'c9', name: 'Priya Sharma', role: 'main', starLevel: 4, weeklyFee: 175000, genre: ['drama', 'crime', 'horror'], status: 'available' },
  { id: 'c10', name: 'Tyler Knox', role: 'main', starLevel: 4, weeklyFee: 195000, genre: ['action', 'crime', 'procedural'], status: 'available' },
  { id: 'c11', name: 'Chloe Webb', role: 'main', starLevel: 4, weeklyFee: 165000, genre: ['comedy', 'drama', 'talk-show'], status: 'available' },
  { id: 'c12', name: 'Ezra Stone', role: 'main', starLevel: 4, weeklyFee: 185000, genre: ['fantasy', 'sci-fi', 'drama'], status: 'available' },
  { id: 'c13', name: 'Bianca Wells', role: 'main', starLevel: 4, weeklyFee: 170000, genre: ['limited-series', 'drama', 'anthology'], status: 'available' },
  { id: 'c14', name: 'Omar Hayes', role: 'main', starLevel: 4, weeklyFee: 190000, genre: ['sci-fi', 'fantasy', 'action'], status: 'available' },

  // ⭐⭐⭐ Rising Stars
  { id: 'c15', name: 'Asha Ndidi', role: 'main', starLevel: 3, weeklyFee: 75000, genre: ['drama', 'crime', 'limited-series'], status: 'available' },
  { id: 'c16', name: 'Connor Walsh', role: 'main', starLevel: 3, weeklyFee: 70000, genre: ['action', 'procedural', 'sci-fi'], status: 'available' },
  { id: 'c17', name: 'Mia Tanaka', role: 'main', starLevel: 3, weeklyFee: 65000, genre: ['comedy', 'drama', 'reality', 'talk-show'], status: 'available' },
  { id: 'c18', name: 'Elena Voss', role: 'main', starLevel: 3, weeklyFee: 68000, genre: ['horror', 'drama', 'crime'], status: 'available' },
  { id: 'c19', name: 'Finn Calloway', role: 'main', starLevel: 3, weeklyFee: 60000, genre: ['comedy', 'drama', 'late-night'], status: 'available' },
  { id: 'c20', name: 'Zara Osei', role: 'main', starLevel: 3, weeklyFee: 72000, genre: ['fantasy', 'horror', 'anthology'], status: 'available' },
  { id: 'c21', name: 'Leo Park', role: 'main', starLevel: 3, weeklyFee: 66000, genre: ['soap-opera', 'drama', 'reality'], status: 'available' },

  // ⭐⭐ Supporting / Character Actors
  { id: 'c22', name: 'Vera Santos', role: 'supporting', starLevel: 2, weeklyFee: 25000, genre: ['drama', 'crime', 'procedural'], status: 'available' },
  { id: 'c23', name: 'Kwame Asante', role: 'supporting', starLevel: 2, weeklyFee: 22000, genre: ['action', 'drama', 'sci-fi'], status: 'available' },
  { id: 'c24', name: 'Iris Chen', role: 'supporting', starLevel: 2, weeklyFee: 20000, genre: ['comedy', 'drama', 'sci-fi'], status: 'available' },
  { id: 'c25', name: 'Sam Riordan', role: 'supporting', starLevel: 2, weeklyFee: 18000, genre: ['crime', 'procedural', 'drama'], status: 'available' },
  { id: 'c26', name: 'Nia Freeman', role: 'supporting', starLevel: 2, weeklyFee: 21000, genre: ['fantasy', 'drama', 'horror', 'anthology'], status: 'available' },
  { id: 'c27', name: 'Drew Larson', role: 'supporting', starLevel: 2, weeklyFee: 19000, genre: ['comedy', 'action', 'drama', 'late-night'], status: 'available' },
  { id: 'c28', name: 'Zoe Park', role: 'supporting', starLevel: 2, weeklyFee: 23000, genre: ['drama', 'sci-fi', 'limited-series'], status: 'available' },
  { id: 'c29', name: 'Marcus Bell', role: 'supporting', starLevel: 2, weeklyFee: 17000, genre: ['crime', 'horror', 'drama'], status: 'available' },
  { id: 'c30', name: 'Fatima Al-Rashid', role: 'supporting', starLevel: 2, weeklyFee: 24000, genre: ['drama', 'crime', 'talk-show', 'soap-opera'], status: 'available' },
  { id: 'c31', name: 'Jake Oduya', role: 'supporting', starLevel: 2, weeklyFee: 20000, genre: ['comedy', 'reality', 'late-night'], status: 'available' },

  // ⭐ New Faces
  { id: 'c32', name: 'Taylor Mills', role: 'supporting', starLevel: 1, weeklyFee: 8000, genre: ['drama', 'comedy', 'action'], status: 'available' },
  { id: 'c33', name: 'River James', role: 'supporting', starLevel: 1, weeklyFee: 7500, genre: ['sci-fi', 'fantasy', 'horror'], status: 'available' },
  { id: 'c34', name: 'Casey Morgan', role: 'supporting', starLevel: 1, weeklyFee: 7000, genre: ['horror', 'drama', 'crime'], status: 'available' },
  { id: 'c35', name: 'Jesse Quinn', role: 'supporting', starLevel: 1, weeklyFee: 6500, genre: ['comedy', 'drama', 'soap-opera'], status: 'available' },
  { id: 'c36', name: 'Amara Diallo', role: 'supporting', starLevel: 1, weeklyFee: 7200, genre: ['drama', 'limited-series', 'anthology'], status: 'available' },
];

export const CREW_POOL: CrewMember[] = [
  // Directors
  { id: 'd1', name: 'Helena Ford', role: 'director', level: 5, episodeFee: 300000, status: 'available' },
  { id: 'd2', name: 'Antoine Dubois', role: 'director', level: 5, episodeFee: 280000, status: 'available' },
  { id: 'd3', name: 'Kenji Nakamura', role: 'director', level: 4, episodeFee: 120000, status: 'available' },
  { id: 'd4', name: 'Sofia Reyes', role: 'director', level: 4, episodeFee: 110000, status: 'available' },
  { id: 'd5', name: 'Marcus Webb', role: 'director', level: 3, episodeFee: 50000, status: 'available' },
  { id: 'd6', name: 'Anya Kowalski', role: 'director', level: 3, episodeFee: 45000, status: 'available' },
  { id: 'd7', name: 'Sam Rivers', role: 'director', level: 2, episodeFee: 20000, status: 'available' },
  { id: 'd8', name: 'Pat Donovan', role: 'director', level: 1, episodeFee: 8000, status: 'available' },
  { id: 'd9', name: 'Yuki Tanaka', role: 'director', level: 4, episodeFee: 130000, status: 'available' },
  { id: 'd10', name: 'Rosa Ibáñez', role: 'director', level: 3, episodeFee: 55000, status: 'available' },

  // Writers
  { id: 'w1', name: 'Rachel Kim', role: 'writer', level: 5, episodeFee: 200000, status: 'available' },
  { id: 'w2', name: 'Oscar Vega', role: 'writer', level: 5, episodeFee: 190000, status: 'available' },
  { id: 'w3', name: 'Isabelle Brown', role: 'writer', level: 4, episodeFee: 80000, status: 'available' },
  { id: 'w4', name: 'Theo Grant', role: 'writer', level: 4, episodeFee: 75000, status: 'available' },
  { id: 'w5', name: 'Maya Singh', role: 'writer', level: 3, episodeFee: 35000, status: 'available' },
  { id: 'w6', name: 'Leo Carver', role: 'writer', level: 3, episodeFee: 30000, status: 'available' },
  { id: 'w7', name: 'Nina Park', role: 'writer', level: 2, episodeFee: 15000, status: 'available' },
  { id: 'w8', name: 'Chris Dale', role: 'writer', level: 1, episodeFee: 6000, status: 'available' },
  { id: 'w9', name: 'Aiko Matsuda', role: 'writer', level: 4, episodeFee: 85000, status: 'available' },
  { id: 'w10', name: 'Damian Obi', role: 'writer', level: 3, episodeFee: 38000, status: 'available' },
];
