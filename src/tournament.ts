import type { TournamentState, Matchup, Round2Pairing, PairingSlot } from './types';
import {
  createRound1Matches,
  setRound1Winner as bracketSetRound1Winner,
  buildBracketFromPairings,
  setWinner as bracketSetWinner,
  swapWrestler,
} from './bracket';

const EMPTY_SLOTS: PairingSlot[] = [
  { winner1: null, winner2: null },
  { winner1: null, winner2: null },
  { winner1: null, winner2: null },
  { winner1: null, winner2: null },
];

export function setupTournament(matchups: Matchup[]): TournamentState {
  return {
    phase: 'round1',
    round1Matches: createRound1Matches(matchups),
  };
}

export function pickRound1Winner(state: TournamentState, matchId: string, winner: string): TournamentState {
  return bracketSetRound1Winner(state, matchId, winner);
}

export function goToPairing(state: TournamentState): TournamentState {
  return { ...state, phase: 'pairing', pairingSlots: state.pairingSlots ?? EMPTY_SLOTS };
}

export function updatePairingSlots(state: TournamentState, slots: PairingSlot[]): TournamentState {
  return { ...state, pairingSlots: slots };
}

export function confirmPairings(state: TournamentState, pairings: Round2Pairing[]): TournamentState {
  const bracket = buildBracketFromPairings(state.round1Matches, pairings);
  return {
    ...state,
    phase: 'bracket',
    round2Pairings: pairings,
    bracket,
  };
}

export function pickBracketWinner(state: TournamentState, matchId: string, winner: string): TournamentState {
  if (!state.bracket) return state;
  return { ...state, bracket: bracketSetWinner(state.bracket, matchId, winner) };
}

export function goBack(state: TournamentState): TournamentState | null {
  if (state.phase === 'round1') return null;
  if (state.phase === 'pairing') return { ...state, phase: 'round1' };
  if (state.phase === 'bracket') return { ...state, phase: 'pairing' };
  return state;
}

export function setBackup(state: TournamentState, name: string): TournamentState {
  return { ...state, backup: name || undefined };
}

export function performSwap(state: TournamentState, target: string): TournamentState {
  if (!state.backup) return state;
  const replacement = state.backup;

  const round1Matches = state.round1Matches.map((m) => ({
    ...m,
    wrestler1: m.wrestler1 === target ? replacement : m.wrestler1,
    wrestler2: m.wrestler2 === target ? replacement : m.wrestler2,
    winner: m.winner === target ? replacement : m.winner,
  }));

  const pairingSlots = state.pairingSlots?.map((s) => ({
    winner1: s.winner1 === target ? replacement : s.winner1,
    winner2: s.winner2 === target ? replacement : s.winner2,
  }));

  const bracket = state.bracket
    ? swapWrestler(state.bracket, target, replacement)
    : state.bracket;

  return { ...state, round1Matches, pairingSlots, bracket, backupUsed: true };
}
