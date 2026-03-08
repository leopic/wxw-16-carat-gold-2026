import { describe, it, expect } from 'vitest';
import {
  createRound1Matches,
  setRound1Winner,
  getRound1Winners,
  allRound1Complete,
  buildBracketFromPairings,
  setWinner,
  fillSemifinals,
  swapWrestler,
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
    { winner1: 'A', winner2: 'C' }, // QF 1
    { winner1: 'E', winner2: 'G' }, // QF 2
    { winner1: 'I', winner2: 'K' }, // QF 3
    { winner1: 'M', winner2: 'O' }, // QF 4
  ];
  return { r1, pairings, bracket: buildBracketFromPairings(r1, pairings) };
}

describe('buildBracketFromPairings', () => {
  it('builds correct waterfall bracket structure', () => {
    const { bracket } = makeBracket();
    expect(bracket.rounds).toHaveLength(4);
    // R1: 8, QF: 4, SF: 2, Final: 1
    expect(bracket.rounds[0]).toHaveLength(8);
    expect(bracket.rounds[1]).toHaveLength(4);
    expect(bracket.rounds[2]).toHaveLength(2);
    expect(bracket.rounds[3]).toHaveLength(1);
  });

  it('re-IDs R1 matches with bracket prefix', () => {
    const { bracket } = makeBracket();
    expect(bracket.rounds[0][0].id).toBe('r1-b0');
    expect(bracket.rounds[0][7].id).toBe('r1-b7');
  });

  it('creates QF matches with correct wrestlers', () => {
    const { bracket } = makeBracket();
    expect(bracket.rounds[1][0].wrestler1).toBe('A');
    expect(bracket.rounds[1][0].wrestler2).toBe('C');
    expect(bracket.rounds[1][3].wrestler1).toBe('M');
    expect(bracket.rounds[1][3].wrestler2).toBe('O');
  });

  it('creates empty semifinal and final slots', () => {
    const { bracket } = makeBracket();
    expect(bracket.rounds[2][0].wrestler1).toBeNull();
    expect(bracket.rounds[2][1].wrestler1).toBeNull();
    expect(bracket.rounds[3][0].wrestler1).toBeNull();
    expect(bracket.rounds[3][0].winner).toBeNull();
  });
});

describe('setWinner', () => {
  it('R1 match returns without propagating', () => {
    const { bracket } = makeBracket();
    const result = setWinner(bracket, 'r1-b0', 'A');
    expect(result.rounds[1][0].winner).toBeNull();
  });

  it('QF winner does NOT auto-propagate to semifinal', () => {
    const { bracket } = makeBracket();
    const b1 = setWinner(bracket, 'qf-m0', 'A');
    // SF slots stay empty — they're set via sfPairing phase
    expect(b1.rounds[2][0].wrestler1).toBeNull();
  });

  it('semifinal winner propagates to final', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'qf-m0', 'A');
    b = setWinner(b, 'qf-m1', 'E');
    // Manually fill SF (as sfPairing phase would)
    b = fillSemifinals(b, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    b = setWinner(b, 'sf-m0', 'A');
    expect(b.rounds[3][0].wrestler1).toBe('A');

    b = setWinner(b, 'qf-m2', 'I');
    b = setWinner(b, 'qf-m3', 'M');
    b = setWinner(b, 'sf-m1', 'I');
    expect(b.rounds[3][0].wrestler2).toBe('I');
  });

  it('setting final winner', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'qf-m0', 'A');
    b = setWinner(b, 'qf-m1', 'E');
    b = setWinner(b, 'qf-m2', 'I');
    b = setWinner(b, 'qf-m3', 'M');
    b = fillSemifinals(b, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    b = setWinner(b, 'sf-m0', 'A');
    b = setWinner(b, 'sf-m1', 'I');
    b = setWinner(b, 'final', 'A');
    expect(b.rounds[3][0].winner).toBe('A');
  });

  it('changing QF winner does not affect SF', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'qf-m0', 'A');
    b = setWinner(b, 'qf-m1', 'E');
    // Change QF pick — SF should remain untouched
    b = setWinner(b, 'qf-m0', 'C');
    expect(b.rounds[1][0].winner).toBe('C');
    expect(b.rounds[2][0].wrestler1).toBeNull();
    expect(b.rounds[2][0].wrestler2).toBeNull();
  });
});

describe('swapWrestler', () => {
  it('replaces wrestler in R1 matches', () => {
    const { bracket } = makeBracket();
    const b = swapWrestler(bracket, 'A', 'Z');
    expect(b.rounds[0][0].wrestler1).toBe('Z');
    expect(b.rounds[0][0].winner).toBe('Z');
  });

  it('replaces wrestler in QF matches', () => {
    const { bracket } = makeBracket();
    const b = swapWrestler(bracket, 'A', 'Z');
    expect(b.rounds[1][0].wrestler1).toBe('Z');
  });

  it('replaces wrestler in semifinal and final', () => {
    const { bracket } = makeBracket();
    let b = setWinner(bracket, 'qf-m0', 'A');
    b = setWinner(b, 'qf-m1', 'E');
    b = setWinner(b, 'qf-m2', 'I');
    b = setWinner(b, 'qf-m3', 'M');
    b = fillSemifinals(b, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    b = setWinner(b, 'sf-m0', 'A');
    b = setWinner(b, 'sf-m1', 'I');
    b = setWinner(b, 'final', 'A');

    const swapped = swapWrestler(b, 'A', 'Z');
    expect(swapped.rounds[2][0].wrestler1).toBe('Z');
    expect(swapped.rounds[2][0].winner).toBe('Z');
    expect(swapped.rounds[3][0].wrestler1).toBe('Z');
    expect(swapped.rounds[3][0].winner).toBe('Z');
  });

  it('does not modify original bracket', () => {
    const { bracket } = makeBracket();
    swapWrestler(bracket, 'A', 'Z');
    expect(bracket.rounds[0][0].wrestler1).toBe('A');
  });

  it('handles wrestler not in bracket (no-op)', () => {
    const { bracket } = makeBracket();
    const b = swapWrestler(bracket, 'NOBODY', 'Z');
    expect(b.rounds[0][0].wrestler1).toBe('A');
    expect(b.rounds[0][4].wrestler1).toBe('I');
  });
});

describe('fillSemifinals', () => {
  it('sets SF wrestlers from slots', () => {
    const { bracket } = makeBracket();
    const b = fillSemifinals(bracket, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    expect(b.rounds[2][0].wrestler1).toBe('A');
    expect(b.rounds[2][0].wrestler2).toBe('E');
    expect(b.rounds[2][1].wrestler1).toBe('I');
    expect(b.rounds[2][1].wrestler2).toBe('M');
    expect(b.rounds[2][0].winner).toBeNull();
  });

  it('applies pre-picked SF winners and propagates to final', () => {
    const { bracket } = makeBracket();
    const b = fillSemifinals(bracket, [
      { winner1: 'A', winner2: 'E', winner: 'A' },
      { winner1: 'I', winner2: 'M', winner: 'I' },
    ]);
    expect(b.rounds[2][0].winner).toBe('A');
    expect(b.rounds[2][1].winner).toBe('I');
    expect(b.rounds[3][0].wrestler1).toBe('A');
    expect(b.rounds[3][0].wrestler2).toBe('I');
  });

  it('does not modify original bracket', () => {
    const { bracket } = makeBracket();
    fillSemifinals(bracket, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    expect(bracket.rounds[2][0].wrestler1).toBeNull();
  });
});
