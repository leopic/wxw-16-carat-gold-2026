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
 * Build the full bracket from R1 results + R2 pairings.
 *
 * R2 pairings are 4 matches: first 2 go to the left bracket, last 2 go to the right.
 * For each R2 pairing, we find the original R1 match for each wrestler and slot it
 * into the correct position so the bracket tree is coherent.
 */
export function buildBracketFromPairings(
  round1Matches: Match[],
  pairings: Round2Pairing[]
): Bracket {
  const r1ByWinner = new Map<string, Match>();
  for (const m of round1Matches) {
    if (m.winner) r1ByWinner.set(m.winner, m);
  }

  const buildSide = (sidePairings: Round2Pairing[], sideLabel: string): Match[][] => {
    const r1: Match[] = [];
    const r2: Match[] = [];

    sidePairings.forEach((pairing, pairingIdx) => {
      const m1 = r1ByWinner.get(pairing.winner1)!;
      const m2 = r1ByWinner.get(pairing.winner2)!;

      // Re-id the R1 matches to their bracket position
      r1.push(
        { ...m1, id: `${sideLabel}-r1-m${pairingIdx * 2}` },
        { ...m2, id: `${sideLabel}-r1-m${pairingIdx * 2 + 1}` },
      );

      r2.push({
        id: `${sideLabel}-r2-m${pairingIdx}`,
        wrestler1: pairing.winner1,
        wrestler2: pairing.winner2,
        winner: null,
      });
    });

    const semi: Match[] = [{
      id: `${sideLabel}-r3-m0`,
      wrestler1: null,
      wrestler2: null,
      winner: null,
    }];

    return [r1, r2, semi];
  };

  return {
    left: buildSide(pairings.slice(0, 2), 'L'),
    right: buildSide(pairings.slice(2, 4), 'R'),
    final: {
      id: 'final',
      wrestler1: null,
      wrestler2: null,
      winner: null,
    },
  };
}

export function setWinner(bracket: Bracket, matchId: string, winner: string): Bracket {
  const newBracket = deepClone(bracket);

  for (const side of ['left', 'right'] as const) {
    for (let roundIdx = 0; roundIdx < newBracket[side].length; roundIdx++) {
      const round = newBracket[side][roundIdx];
      for (let matchIdx = 0; matchIdx < round.length; matchIdx++) {
        if (round[matchIdx].id === matchId) {
          // R1 matches in the bracket view are already decided — skip propagation
          // Only R2+ matches propagate
          if (roundIdx === 0) return newBracket;
          round[matchIdx].winner = winner;
          propagateWinner(newBracket, side, roundIdx, matchIdx);
          return newBracket;
        }
      }
    }
  }

  if (newBracket.final.id === matchId) {
    newBracket.final.winner = winner;
  }

  return newBracket;
}

function propagateWinner(bracket: Bracket, side: 'left' | 'right', roundIdx: number, matchIdx: number) {
  const rounds = bracket[side];
  const match = rounds[roundIdx][matchIdx];
  const winner = match.winner;

  if (roundIdx < rounds.length - 1) {
    const nextRound = rounds[roundIdx + 1];
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const nextMatch = nextRound[nextMatchIdx];
    const slot = matchIdx % 2 === 0 ? 'wrestler1' : 'wrestler2';

    const oldValue = nextMatch[slot];
    nextMatch[slot] = winner;

    if (oldValue !== winner) {
      clearDownstream(bracket, side, roundIdx + 1, nextMatchIdx);
    }
  } else {
    const slot = side === 'left' ? 'wrestler1' : 'wrestler2';
    const oldValue = bracket.final[slot];
    bracket.final[slot] = winner;

    if (oldValue !== winner) {
      bracket.final.winner = null;
    }
  }
}

function clearDownstream(bracket: Bracket, side: 'left' | 'right', roundIdx: number, matchIdx: number) {
  const rounds = bracket[side];
  const match = rounds[roundIdx][matchIdx];

  if (match.winner !== null) {
    match.winner = null;

    if (roundIdx < rounds.length - 1) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const slot = matchIdx % 2 === 0 ? 'wrestler1' : 'wrestler2';
      rounds[roundIdx + 1][nextMatchIdx][slot] = null;
      clearDownstream(bracket, side, roundIdx + 1, nextMatchIdx);
    } else {
      const slot = side === 'left' ? 'wrestler1' : 'wrestler2';
      bracket.final[slot] = null;
      bracket.final.winner = null;
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

  for (const side of ['left', 'right'] as const) {
    for (const round of b[side]) {
      for (const match of round) {
        swapMatch(match);
      }
    }
  }
  swapMatch(b.final);

  return b;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
