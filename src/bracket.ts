import type { Match, Bracket, Matchup, TournamentState, Round2Pairing } from './types';

export function createRound1Matches(matchups: Matchup[]): Match[] {
  return matchups.map((m, i) => ({
    id: `r1-m${i}`,
    wrestler1: m.wrestler1,
    wrestler2: m.wrestler2,
    winner: null,
  }));
}

export function setRound1Winner(state: TournamentState, matchId: string, winner: string): TournamentState {
  return {
    ...state,
    round1Matches: state.round1Matches.map((m) =>
      m.id === matchId ? { ...m, winner } : m
    ),
  };
}

export function getRound1Winners(matches: Match[]): string[] {
  return matches
    .filter((m) => m.winner !== null)
    .map((m) => m.winner!);
}

export function allRound1Complete(matches: Match[]): boolean {
  return matches.every((m) => m.winner !== null);
}

/**
 * Build a single waterfall bracket from R1 results + R2 pairings.
 *
 * R2 pairings are 4 quarterfinal matches. The bracket flows:
 *   Round 1 (8 matches) → Quarterfinals (4) → Semifinals (2) → Final (1)
 */
export function buildBracketFromPairings(
  round1Matches: Match[],
  pairings: Round2Pairing[]
): Bracket {
  const r1ByWinner = new Map<string, Match>();
  for (const m of round1Matches) {
    if (m.winner) r1ByWinner.set(m.winner, m);
  }

  // Round 1: re-slot R1 matches into bracket order based on pairings
  const r1: Match[] = [];
  const qf: Match[] = [];

  pairings.forEach((pairing, i) => {
    const m1 = r1ByWinner.get(pairing.winner1)!;
    const m2 = r1ByWinner.get(pairing.winner2)!;

    r1.push(
      { ...m1, id: `r1-b${i * 2}` },
      { ...m2, id: `r1-b${i * 2 + 1}` },
    );

    qf.push({
      id: `qf-m${i}`,
      wrestler1: pairing.winner1,
      wrestler2: pairing.winner2,
      winner: null,
    });
  });

  const semis: Match[] = [
    { id: 'sf-m0', wrestler1: null, wrestler2: null, winner: null },
    { id: 'sf-m1', wrestler1: null, wrestler2: null, winner: null },
  ];

  const final: Match[] = [
    { id: 'final', wrestler1: null, wrestler2: null, winner: null },
  ];

  return { rounds: [r1, qf, semis, final] };
}

export function setWinner(bracket: Bracket, matchId: string, winner: string): Bracket {
  const newBracket = deepClone(bracket);
  const { rounds } = newBracket;

  for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
    for (let matchIdx = 0; matchIdx < rounds[roundIdx].length; matchIdx++) {
      if (rounds[roundIdx][matchIdx].id === matchId) {
        // R1 matches are already decided — skip
        if (roundIdx === 0) return newBracket;

        rounds[roundIdx][matchIdx].winner = winner;
        propagateWinner(newBracket, roundIdx, matchIdx);
        return newBracket;
      }
    }
  }

  return newBracket;
}

function propagateWinner(bracket: Bracket, roundIdx: number, matchIdx: number) {
  const { rounds } = bracket;
  const winner = rounds[roundIdx][matchIdx].winner;

  if (roundIdx < rounds.length - 1) {
    const nextRound = rounds[roundIdx + 1];
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const nextMatch = nextRound[nextMatchIdx];
    const slot = matchIdx % 2 === 0 ? 'wrestler1' : 'wrestler2';

    const oldValue = nextMatch[slot];
    nextMatch[slot] = winner;

    if (oldValue !== winner) {
      clearDownstream(bracket, roundIdx + 1, nextMatchIdx);
    }
  }
}

function clearDownstream(bracket: Bracket, roundIdx: number, matchIdx: number) {
  const { rounds } = bracket;
  const match = rounds[roundIdx][matchIdx];

  if (match.winner !== null) {
    match.winner = null;

    if (roundIdx < rounds.length - 1) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const slot = matchIdx % 2 === 0 ? 'wrestler1' : 'wrestler2';
      rounds[roundIdx + 1][nextMatchIdx][slot] = null;
      clearDownstream(bracket, roundIdx + 1, nextMatchIdx);
    }
  }
}

export function swapWrestler(bracket: Bracket, target: string, replacement: string): Bracket {
  const b = deepClone(bracket);

  const swapMatch = (m: Match) => {
    if (m.wrestler1 === target) m.wrestler1 = replacement;
    if (m.wrestler2 === target) m.wrestler2 = replacement;
    if (m.winner === target) m.winner = replacement;
  };

  for (const round of b.rounds) {
    for (const match of round) {
      swapMatch(match);
    }
  }

  return b;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
