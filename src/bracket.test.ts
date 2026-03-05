import { describe, it, expect } from 'vitest';
import {
  createRound1Matches,
  setRound1Winner,
  getRound1Winners,
  allRound1Complete,
  buildBracketFromPairings,
  setWinner,
} from './bracket';
import type { Matchup, TournamentState, Round2Pairing } from './types';

const matchups: Matchup[] = [
  { wrestler1: 'A', wrestler2: 'B' },
  { wrestler1: 'C', wrestler2: 'D' },
  { wrestler1: 'E', wrestler2: 'F' },
  { wrestler1: 'G', wrestler2: 'H' },
  { wrestler1: 'I', wrestler2: 'J' },
  { wrestler1: 'K', wrestler2: 'L' },
  { wrestler1: 'M', wrestler2: 'N' },
  { wrestler1: 'O', wrestler2: 'P' },
];

describe('createRound1Matches', () => {
  it('creates 8 matches with correct IDs and null winners', () => {
    const matches = createRound1Matches(matchups);
    expect(matches).toHaveLength(8);
    matches.forEach((m, i) => {
      expect(m.id).toBe(`r1-m${i}`);
      expect(m.winner).toBeNull();
    });
  });

  it('assigns correct wrestler names', () => {
    const matches = createRound1Matches(matchups);
    expect(matches[0].wrestler1).toBe('A');
    expect(matches[0].wrestler2).toBe('B');
    expect(matches[7].wrestler1).toBe('O');
    expect(matches[7].wrestler2).toBe('P');
  });
});

describe('setRound1Winner', () => {
  it('sets the winner and returns a new state object', () => {
    const state: TournamentState = {
      phase: 'round1',
      round1Matches: createRound1Matches(matchups),
    };
    const next = setRound1Winner(state, 'r1-m0', 'A');
    expect(next).not.toBe(state);
    expect(next.round1Matches[0].winner).toBe('A');
    expect(state.round1Matches[0].winner).toBeNull();
  });
});

describe('getRound1Winners / allRound1Complete', () => {
  it('returns empty array when no winners', () => {
    const matches = createRound1Matches(matchups);
    expect(getRound1Winners(matches)).toEqual([]);
    expect(allRound1Complete(matches)).toBe(false);
  });

  it('returns all winners when complete', () => {
    const winners = ['A', 'C', 'E', 'G', 'I', 'K', 'M', 'O'];
    const matches = createRound1Matches(matchups).map((m, i) => ({
      ...m,
      winner: winners[i],
    }));
    expect(getRound1Winners(matches)).toEqual(winners);
    expect(allRound1Complete(matches)).toBe(true);
  });
});

// Helper: build a fully decided R1 + pairings for bracket tests
function makeBracket() {
  const winners = ['A', 'C', 'E', 'G', 'I', 'K', 'M', 'O'];
  const r1 = createRound1Matches(matchups).map((m, i) => ({
    ...m,
    winner: winners[i],
  }));
  const pairings: Round2Pairing[] = [
    { winner1: 'A', winner2: 'C' }, // left QF 1
    { winner1: 'E', winner2: 'G' }, // left QF 2
    { winner1: 'I', winner2: 'K' }, // right QF 1
    { winner1: 'M', winner2: 'O' }, // right QF 2
  ];
  return { r1, pairings, bracket: buildBracketFromPairings(r1, pairings) };
}

describe('buildBracketFromPairings', () => {
  it('builds correct bracket structure', () => {
    const { bracket } = makeBracket();
    // Each side has 3 rounds
    expect(bracket.left).toHaveLength(3);
    expect(bracket.right).toHaveLength(3);
    // R1: 4 matches, R2: 2, Semi: 1
    expect(bracket.left[0]).toHaveLength(4);
    expect(bracket.left[1]).toHaveLength(2);
    expect(bracket.left[2]).toHaveLength(1);
  });

  it('re-IDs R1 matches with side prefix', () => {
    const { bracket } = makeBracket();
    expect(bracket.left[0][0].id).toBe('L-r1-m0');
    expect(bracket.left[0][3].id).toBe('L-r1-m3');
    expect(bracket.right[0][0].id).toBe('R-r1-m0');
  });

  it('creates R2 matches with correct wrestlers', () => {
    const { bracket } = makeBracket();
    expect(bracket.left[1][0].wrestler1).toBe('A');
    expect(bracket.left[1][0].wrestler2).toBe('C');
    expect(bracket.right[1][1].wrestler1).toBe('M');
    expect(bracket.right[1][1].wrestler2).toBe('O');
  });

  it('creates empty semifinal and final slots', () => {
    const { bracket } = makeBracket();
    expect(bracket.left[2][0].wrestler1).toBeNull();
    expect(bracket.left[2][0].wrestler2).toBeNull();
    expect(bracket.final.wrestler1).toBeNull();
    expect(bracket.final.wrestler2).toBeNull();
    expect(bracket.final.winner).toBeNull();
  });
});

describe('setWinner', () => {
  it('R1 match returns without propagating', () => {
    const { bracket } = makeBracket();
    const result = setWinner(bracket, 'L-r1-m0', 'A');
    // Should be a clone but no changes propagate
    expect(result.left[1][0].winner).toBeNull();
  });

  it('R2 winner propagates to semifinal slot', () => {
    const { bracket } = makeBracket();
    const b1 = setWinner(bracket, 'L-r2-m0', 'A');
    expect(b1.left[2][0].wrestler1).toBe('A');

    const b2 = setWinner(b1, 'L-r2-m1', 'E');
    expect(b2.left[2][0].wrestler2).toBe('E');
  });

  it('semifinal winner propagates to final', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'L-r2-m0', 'A');
    b = setWinner(b, 'L-r2-m1', 'E');
    b = setWinner(b, 'L-r3-m0', 'A');
    expect(b.final.wrestler1).toBe('A');

    b = setWinner(b, 'R-r2-m0', 'I');
    b = setWinner(b, 'R-r2-m1', 'M');
    b = setWinner(b, 'R-r3-m0', 'I');
    expect(b.final.wrestler2).toBe('I');
  });

  it('setting final winner', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'L-r2-m0', 'A');
    b = setWinner(b, 'L-r2-m1', 'E');
    b = setWinner(b, 'L-r3-m0', 'A');
    b = setWinner(b, 'R-r2-m0', 'I');
    b = setWinner(b, 'R-r2-m1', 'M');
    b = setWinner(b, 'R-r3-m0', 'I');
    b = setWinner(b, 'final', 'A');
    expect(b.final.winner).toBe('A');
  });

  it('changing R2 winner clears downstream', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'L-r2-m0', 'A');
    b = setWinner(b, 'L-r2-m1', 'E');
    b = setWinner(b, 'L-r3-m0', 'A');
    expect(b.final.wrestler1).toBe('A');

    // Change R2 pick — should clear semifinal winner and final slot
    b = setWinner(b, 'L-r2-m0', 'C');
    expect(b.left[2][0].wrestler1).toBe('C');
    expect(b.left[2][0].winner).toBeNull();
    expect(b.final.wrestler1).toBeNull();
  });
});
