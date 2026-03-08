import { describe, it, expect } from 'vitest';
import type { Matchup, TournamentState, Round2Pairing, PairingSlot } from './types';
import { allRound1Complete, getRound1Winners } from './bracket';
import {
  setupTournament,
  pickRound1Winner,
  goToPairing,
  updatePairingSlots,
  confirmPairings,
  pickBracketWinner,
  goToSfPairing,
  updateSfPairingSlots,
  confirmSfPairings,
  goBack,
  setBackup,
  performSwap,
} from './tournament';

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

const winners = ['A', 'C', 'E', 'G', 'I', 'K', 'M', 'O'];

const pairings: Round2Pairing[] = [
  { winner1: 'A', winner2: 'C' },
  { winner1: 'E', winner2: 'G' },
  { winner1: 'I', winner2: 'K' },
  { winner1: 'M', winner2: 'O' },
];

function makeRound1Complete(): TournamentState {
  let state = setupTournament(matchups);
  for (let i = 0; i < 8; i++) {
    state = pickRound1Winner(state, `r1-m${i}`, winners[i]);
  }
  return state;
}

function makePairingState(): TournamentState {
  return goToPairing(makeRound1Complete());
}

function makeBracketState(): TournamentState {
  return confirmPairings(makePairingState(), pairings);
}

describe('setupTournament', () => {
  it('creates a round1 state with 8 matches', () => {
    const state = setupTournament(matchups);
    expect(state.phase).toBe('round1');
    expect(state.round1Matches).toHaveLength(8);
    expect(state.round1Matches.every((m) => m.winner === null)).toBe(true);
  });
});

describe('pickRound1Winner', () => {
  it('sets the winner for the given match', () => {
    const state = setupTournament(matchups);
    const next = pickRound1Winner(state, 'r1-m0', 'A');
    expect(next.round1Matches[0].winner).toBe('A');
  });

  it('does not mutate the original state', () => {
    const state = setupTournament(matchups);
    pickRound1Winner(state, 'r1-m0', 'A');
    expect(state.round1Matches[0].winner).toBeNull();
  });

  it('can change an existing pick', () => {
    const state = setupTournament(matchups);
    const s1 = pickRound1Winner(state, 'r1-m0', 'A');
    const s2 = pickRound1Winner(s1, 'r1-m0', 'B');
    expect(s2.round1Matches[0].winner).toBe('B');
  });

  it('completing all 8 matches marks round as done', () => {
    const state = makeRound1Complete();
    expect(allRound1Complete(state.round1Matches)).toBe(true);
    expect(getRound1Winners(state.round1Matches)).toEqual(winners);
  });
});

describe('goToPairing', () => {
  it('transitions to pairing phase with empty slots', () => {
    const state = goToPairing(makeRound1Complete());
    expect(state.phase).toBe('pairing');
    expect(state.pairingSlots).toHaveLength(4);
    state.pairingSlots!.forEach((s) => {
      expect(s.winner1).toBeNull();
      expect(s.winner2).toBeNull();
    });
  });

  it('preserves existing pairing slots if present', () => {
    const state = makeRound1Complete();
    const withSlots: TournamentState = {
      ...state,
      pairingSlots: [
        { winner1: 'A', winner2: 'C', winner: null },
        { winner1: null, winner2: null, winner: null },
        { winner1: null, winner2: null, winner: null },
        { winner1: null, winner2: null, winner: null },
      ],
    };
    const pairing = goToPairing(withSlots);
    expect(pairing.pairingSlots![0].winner1).toBe('A');
  });
});

describe('updatePairingSlots', () => {
  it('replaces the pairing slots', () => {
    const state = makePairingState();
    const newSlots: PairingSlot[] = [
      { winner1: 'A', winner2: 'C', winner: null },
      { winner1: 'E', winner2: 'G', winner: null },
      { winner1: 'I', winner2: 'K', winner: null },
      { winner1: 'M', winner2: 'O', winner: null },
    ];
    const next = updatePairingSlots(state, newSlots);
    expect(next.pairingSlots).toEqual(newSlots);
  });

  it('does not mutate the original state', () => {
    const state = makePairingState();
    const original = state.pairingSlots;
    updatePairingSlots(state, [
      { winner1: 'A', winner2: 'C', winner: null },
      { winner1: null, winner2: null, winner: null },
      { winner1: null, winner2: null, winner: null },
      { winner1: null, winner2: null, winner: null },
    ]);
    expect(state.pairingSlots).toBe(original);
  });
});

describe('confirmPairings', () => {
  it('transitions to bracket phase', () => {
    const state = confirmPairings(makePairingState(), pairings);
    expect(state.phase).toBe('bracket');
    expect(state.bracket).toBeDefined();
    expect(state.round2Pairings).toEqual(pairings);
  });

  it('builds correct bracket structure', () => {
    const state = confirmPairings(makePairingState(), pairings);
    const b = state.bracket!;
    expect(b.rounds).toHaveLength(4);
    expect(b.rounds[0]).toHaveLength(8);  // R1
    expect(b.rounds[1]).toHaveLength(4);  // QF
    expect(b.rounds[2]).toHaveLength(2);  // SF
    expect(b.rounds[3]).toHaveLength(1);  // Final
    expect(b.rounds[1][0].wrestler1).toBe('A');
    expect(b.rounds[1][0].wrestler2).toBe('C');
    expect(b.rounds[1][2].wrestler1).toBe('I');
    expect(b.rounds[1][2].wrestler2).toBe('K');
  });

  it('carries pre-picked QF winners into the bracket (without SF propagation)', () => {
    let state = makePairingState();
    state = updatePairingSlots(state, [
      { winner1: 'A', winner2: 'C', winner: 'A' },
      { winner1: 'E', winner2: 'G', winner: 'G' },
      { winner1: 'I', winner2: 'K', winner: null },
      { winner1: 'M', winner2: 'O', winner: null },
    ]);
    const confirmed = confirmPairings(state, pairings);
    const b = confirmed.bracket!;
    expect(b.rounds[1][0].winner).toBe('A');
    expect(b.rounds[1][1].winner).toBe('G');
    // QF winners do NOT auto-propagate to SF — SF stays empty
    expect(b.rounds[2][0].wrestler1).toBeNull();
    expect(b.rounds[2][0].wrestler2).toBeNull();
    expect(b.rounds[1][2].winner).toBeNull();
    expect(b.rounds[1][3].winner).toBeNull();
  });
});

describe('pickBracketWinner', () => {
  it('sets the winner in QF', () => {
    const state = makeBracketState();
    const next = pickBracketWinner(state, 'qf-m0', 'A');
    expect(next.bracket!.rounds[1][0].winner).toBe('A');
  });

  it('propagates through semifinal to final (with SF pairing)', () => {
    let state = makeBracketState();
    state = pickBracketWinner(state, 'qf-m0', 'A');
    state = pickBracketWinner(state, 'qf-m1', 'E');
    state = pickBracketWinner(state, 'qf-m2', 'I');
    state = pickBracketWinner(state, 'qf-m3', 'M');

    // Fill SFs via the sfPairing flow
    state = goToSfPairing(state);
    state = updateSfPairingSlots(state, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    state = confirmSfPairings(state);

    state = pickBracketWinner(state, 'sf-m0', 'A');
    expect(state.bracket!.rounds[3][0].wrestler1).toBe('A');

    state = pickBracketWinner(state, 'sf-m1', 'I');
    expect(state.bracket!.rounds[3][0].wrestler2).toBe('I');

    state = pickBracketWinner(state, 'final', 'A');
    expect(state.bracket!.rounds[3][0].winner).toBe('A');
  });

  it('returns state unchanged if no bracket', () => {
    const state = makePairingState();
    const next = pickBracketWinner(state, 'qf-m0', 'A');
    expect(next).toBe(state);
  });
});

describe('goBack', () => {
  it('from round1 returns null', () => {
    const state = setupTournament(matchups);
    expect(goBack(state)).toBeNull();
  });

  it('from pairing goes to round1', () => {
    const state = makePairingState();
    const back = goBack(state)!;
    expect(back.phase).toBe('round1');
  });

  it('from bracket goes to pairing', () => {
    const state = makeBracketState();
    const back = goBack(state)!;
    expect(back.phase).toBe('pairing');
  });

  it('preserves state data when going back', () => {
    const state = makeBracketState();
    const back = goBack(state)!;
    expect(back.bracket).toBeDefined();
    expect(back.round1Matches).toHaveLength(8);
  });

  it('from sfPairing goes to bracket', () => {
    const state = goToSfPairing(makeBracketState());
    const back = goBack(state)!;
    expect(back.phase).toBe('bracket');
  });

  it('from bracket with sfPairingSlots goes to sfPairing', () => {
    let state = makeBracketState();
    state = goToSfPairing(state);
    state = confirmSfPairings({ ...state, sfPairingSlots: [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]});
    const back = goBack(state)!;
    expect(back.phase).toBe('sfPairing');
  });
});

describe('setBackup', () => {
  it('sets the backup wrestler name', () => {
    const state = setupTournament(matchups);
    const next = setBackup(state, 'Jay Joshua');
    expect(next.backup).toBe('Jay Joshua');
  });

  it('clears backup when given empty string', () => {
    const state = setBackup(setupTournament(matchups), 'Jay Joshua');
    const next = setBackup(state, '');
    expect(next.backup).toBeUndefined();
  });
});

describe('performSwap', () => {
  it('replaces wrestler in round1 matches', () => {
    let state = makeRound1Complete();
    state = setBackup(state, 'Z');
    const swapped = performSwap(state, 'A');
    const m0 = swapped.round1Matches[0];
    expect(m0.wrestler1).toBe('Z');
    expect(m0.winner).toBe('Z');
  });

  it('replaces wrestler in pairing slots', () => {
    let state = makePairingState();
    state = updatePairingSlots(state, [
      { winner1: 'A', winner2: 'C', winner: 'A' },
      { winner1: null, winner2: null, winner: null },
      { winner1: null, winner2: null, winner: null },
      { winner1: null, winner2: null, winner: null },
    ]);
    state = setBackup(state, 'Z');
    const swapped = performSwap(state, 'A');
    expect(swapped.pairingSlots![0].winner1).toBe('Z');
    expect(swapped.pairingSlots![0].winner).toBe('Z');
  });

  it('replaces wrestler in bracket', () => {
    let state = makeBracketState();
    state = setBackup(state, 'Z');
    const swapped = performSwap(state, 'A');
    expect(swapped.bracket!.rounds[1][0].wrestler1).toBe('Z');
    expect(swapped.bracket!.rounds[0][0].wrestler1).toBe('Z');
    expect(swapped.bracket!.rounds[0][0].winner).toBe('Z');
  });

  it('sets backupUsed flag', () => {
    let state = makeRound1Complete();
    state = setBackup(state, 'Z');
    const swapped = performSwap(state, 'A');
    expect(swapped.backupUsed).toBe(true);
  });

  it('returns state unchanged if no backup set', () => {
    const state = makeRound1Complete();
    const result = performSwap(state, 'A');
    expect(result).toBe(state);
  });

  it('does not mutate original state', () => {
    let state = makeRound1Complete();
    state = setBackup(state, 'Z');
    const original = state.round1Matches[0].wrestler1;
    performSwap(state, 'A');
    expect(state.round1Matches[0].wrestler1).toBe(original);
  });

  it('swaps across all bracket positions including final', () => {
    let state = makeBracketState();
    state = setBackup(state, 'Z');
    state = pickBracketWinner(state, 'qf-m0', 'A');
    state = pickBracketWinner(state, 'qf-m1', 'E');
    state = pickBracketWinner(state, 'qf-m2', 'I');
    state = pickBracketWinner(state, 'qf-m3', 'M');
    // Fill SFs via sfPairing flow
    state = goToSfPairing(state);
    state = updateSfPairingSlots(state, [
      { winner1: 'A', winner2: 'E', winner: null },
      { winner1: 'I', winner2: 'M', winner: null },
    ]);
    state = confirmSfPairings(state);
    state = pickBracketWinner(state, 'sf-m0', 'A');
    state = pickBracketWinner(state, 'sf-m1', 'I');
    state = pickBracketWinner(state, 'final', 'A');

    const swapped = performSwap(state, 'A');
    expect(swapped.bracket!.rounds[3][0].wrestler1).toBe('Z');
    expect(swapped.bracket!.rounds[3][0].winner).toBe('Z');
    expect(swapped.bracket!.rounds[2][0].winner).toBe('Z');
  });
});

describe('goToSfPairing', () => {
  it('transitions to sfPairing phase with empty slots', () => {
    const state = goToSfPairing(makeBracketState());
    expect(state.phase).toBe('sfPairing');
    expect(state.sfPairingSlots).toHaveLength(2);
    state.sfPairingSlots!.forEach((s) => {
      expect(s.winner1).toBeNull();
      expect(s.winner2).toBeNull();
      expect(s.winner).toBeNull();
    });
  });
});

describe('confirmSfPairings', () => {
  it('fills SF matches and returns to bracket phase', () => {
    let state = makeBracketState();
    state = pickBracketWinner(state, 'qf-m0', 'A');
    state = pickBracketWinner(state, 'qf-m1', 'E');
    state = pickBracketWinner(state, 'qf-m2', 'I');
    state = pickBracketWinner(state, 'qf-m3', 'M');
    state = goToSfPairing(state);
    state = updateSfPairingSlots(state, [
      { winner1: 'A', winner2: 'I', winner: null },
      { winner1: 'E', winner2: 'M', winner: null },
    ]);
    state = confirmSfPairings(state);
    expect(state.phase).toBe('bracket');
    expect(state.bracket!.rounds[2][0].wrestler1).toBe('A');
    expect(state.bracket!.rounds[2][0].wrestler2).toBe('I');
    expect(state.bracket!.rounds[2][1].wrestler1).toBe('E');
    expect(state.bracket!.rounds[2][1].wrestler2).toBe('M');
  });

  it('carries pre-picked SF winners into bracket', () => {
    let state = makeBracketState();
    state = pickBracketWinner(state, 'qf-m0', 'A');
    state = pickBracketWinner(state, 'qf-m1', 'E');
    state = pickBracketWinner(state, 'qf-m2', 'I');
    state = pickBracketWinner(state, 'qf-m3', 'M');
    state = goToSfPairing(state);
    state = updateSfPairingSlots(state, [
      { winner1: 'A', winner2: 'I', winner: 'A' },
      { winner1: 'E', winner2: 'M', winner: 'E' },
    ]);
    state = confirmSfPairings(state);
    expect(state.bracket!.rounds[2][0].winner).toBe('A');
    expect(state.bracket!.rounds[2][1].winner).toBe('E');
    expect(state.bracket!.rounds[3][0].wrestler1).toBe('A');
    expect(state.bracket!.rounds[3][0].wrestler2).toBe('E');
  });
});
