import { useState, useEffect } from 'react';
import type { TournamentState, Matchup, Round2Pairing, PairingSlot } from '../types';
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
} from '../tournament';
import { allRound1Complete, getRound1Winners, allQFsDecided, getQFWinners, createRound1Matches, buildBracketFromPairings, setWinner } from '../bracket';

const STORAGE_KEY = 'wxw-tournament';

const NIGHT1_R1_MATCHES = [
  { wrestler1: 'YAMATO', wrestler2: 'Axel Tischer' },
  { wrestler1: 'Peter Tihanyi', wrestler2: 'Arez' },
  { wrestler1: 'Chihiro Hashimoto', wrestler2: 'Thomas Shire' },
  { wrestler1: 'Ahura', wrestler2: "Dennis 'Cash' Dullnig" },
  { wrestler1: 'Dieter Schwartz', wrestler2: 'Tetsuya Naito' },
  { wrestler1: 'Bobby Gunns', wrestler2: 'Erick Stevens' },
  { wrestler1: 'Alan Angels', wrestler2: 'Titus Alexander' },
  { wrestler1: 'Zoltan', wrestler2: 'Bushi' },
];

const NIGHT1_R1_WINNERS = [
  'YAMATO', 'Peter Tihanyi', 'Thomas Shire', 'Ahura',
  'Tetsuya Naito', 'Erick Stevens', 'Alan Angels', 'Zoltan',
];

const NIGHT2_R1_MATCHES = NIGHT1_R1_MATCHES.map((m, i) => ({
  id: `r1-m${i}`,
  ...m,
  winner: NIGHT1_R1_WINNERS[i],
}));

const NIGHT2_QF_PAIRINGS: Round2Pairing[] = [
  { winner1: 'YAMATO', winner2: 'Erick Stevens' },
  { winner1: 'Thomas Shire', winner2: 'Zoltan' },
  { winner1: 'Peter Tihanyi', winner2: 'Alan Angels' },
  { winner1: 'Ahura', winner2: 'Tetsuya Naito' },
];

const NIGHT2_QF_WINNERS = ['YAMATO', 'Thomas Shire', 'Peter Tihanyi', 'Ahura'];

const NIGHT1_DEFAULT: TournamentState = {
  phase: 'round1',
  round1Matches: createRound1Matches(NIGHT1_R1_MATCHES),
};

const NIGHT2_DEFAULT: TournamentState = {
  phase: 'pairing',
  round1Matches: NIGHT2_R1_MATCHES,
  pairingSlots: NIGHT2_QF_PAIRINGS.map((p, i) => ({
    winner1: p.winner1,
    winner2: p.winner2,
    winner: NIGHT2_QF_WINNERS[i],
  })),
  backup: 'Jay Joshua',
};

function buildNight3Default(): TournamentState {
  let bracket = buildBracketFromPairings(NIGHT2_R1_MATCHES, NIGHT2_QF_PAIRINGS);
  NIGHT2_QF_WINNERS.forEach((w, i) => {
    bracket = setWinner(bracket, `qf-m${i}`, w);
  });
  return {
    phase: 'sfPairing',
    round1Matches: NIGHT2_R1_MATCHES,
    round2Pairings: NIGHT2_QF_PAIRINGS,
    bracket,
    backup: 'Jay Joshua',
  };
}

const NIGHT3_DEFAULT = buildNight3Default();

function loadState(): TournamentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Discard state saved with the old left/right bracket format
    if (parsed.bracket && !Array.isArray(parsed.bracket.rounds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: TournamentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useTournament() {
  const [state, setState] = useState<TournamentState | null>(() => loadState() ?? NIGHT2_DEFAULT);
  const [swapMode, setSwapMode] = useState(false);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const handleSetup = (matchups: Matchup[]) => {
    setState(setupTournament(matchups));
  };

  const handleRound1Pick = (matchId: string, winner: string) => {
    setState((prev) => (prev ? pickRound1Winner(prev, matchId, winner) : prev));
  };

  const handleGoToPairing = () => {
    setState((prev) => (prev ? goToPairing(prev) : prev));
  };

  const handleSlotsChange = (slots: PairingSlot[]) => {
    setState((prev) => (prev ? updatePairingSlots(prev, slots) : prev));
  };

  const handlePairingsConfirmed = (pairings: Round2Pairing[]) => {
    setState((prev) => (prev ? confirmPairings(prev, pairings) : prev));
  };

  const handleBracketPick = (matchId: string, winner: string) => {
    setState((prev) => (prev ? pickBracketWinner(prev, matchId, winner) : prev));
  };

  const handleGoToSfPairing = () => {
    setState((prev) => (prev ? goToSfPairing(prev) : prev));
  };

  const handleSfSlotsChange = (slots: PairingSlot[]) => {
    setState((prev) => (prev ? updateSfPairingSlots(prev, slots) : prev));
  };

  const handleSfPairingsConfirmed = (_pairings: Round2Pairing[]) => {
    setState((prev) => (prev ? confirmSfPairings(prev) : prev));
  };

  const handleBack = () => {
    setState((prev) => (prev ? goBack(prev) : prev));
  };

  const handleResetNight1 = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(NIGHT1_DEFAULT);
  };

  const handleResetNight2 = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(NIGHT2_DEFAULT);
  };

  const handleResetNight3 = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(NIGHT3_DEFAULT);
  };

  const handleBackupChange = (name: string) => {
    setState((prev) => (prev ? setBackup(prev, name) : prev));
  };

  const handleSwap = (target: string) => {
    setState((prev) => (prev?.backup ? performSwap(prev, target) : prev));
    setSwapMode(false);
  };

  const r1Done = state?.phase === 'round1' ? allRound1Complete(state.round1Matches) : false;
  const round1Winners = state ? getRound1Winners(state.round1Matches) : [];
  const allQFsDone = state?.bracket ? allQFsDecided(state.bracket) : false;
  const qfWinners = state?.bracket ? getQFWinners(state.bracket) : [];
  const sfNotYetSet = state?.bracket ? state.bracket.rounds[2][0].wrestler1 === null : true;

  return {
    state,
    swapMode,
    setSwapMode,
    r1Done,
    round1Winners,
    allQFsDone,
    qfWinners,
    sfNotYetSet,
    handleSetup,
    handleRound1Pick,
    handleGoToPairing,
    handleSlotsChange,
    handlePairingsConfirmed,
    handleBracketPick,
    handleGoToSfPairing,
    handleSfSlotsChange,
    handleSfPairingsConfirmed,
    handleBack,
    handleResetNight1,
    handleResetNight2,
    handleResetNight3,
    handleBackupChange,
    handleSwap,
  };
}
