import { useState, useEffect } from 'react';
import type { TournamentState, Matchup, Round2Pairing, PairingSlot } from '../types';
import {
  setupTournament,
  pickRound1Winner,
  goToPairing,
  updatePairingSlots,
  confirmPairings,
  pickBracketWinner,
  goBack,
  setBackup,
  performSwap,
} from '../tournament';
import { allRound1Complete, getRound1Winners } from '../bracket';

const STORAGE_KEY = 'wxw-tournament';

const NIGHT2_DEFAULT: TournamentState = {
  phase: 'pairing',
  round1Matches: [
    { id: 'r1-m0', wrestler1: 'YAMATO', wrestler2: 'Axel Tischer', winner: 'YAMATO' },
    { id: 'r1-m1', wrestler1: 'Peter Tihanyi', wrestler2: 'Arez', winner: 'Peter Tihanyi' },
    { id: 'r1-m2', wrestler1: 'Chihiro Hashimoto', wrestler2: 'Thomas Shire', winner: 'Thomas Shire' },
    { id: 'r1-m3', wrestler1: 'Ahura', wrestler2: "Dennis 'Cash' Dullnig", winner: 'Ahura' },
    { id: 'r1-m4', wrestler1: 'Dieter Schwartz', wrestler2: 'Tetsuya Naito', winner: 'Tetsuya Naito' },
    { id: 'r1-m5', wrestler1: 'Bobby Gunns', wrestler2: 'Erick Stevens', winner: 'Erick Stevens' },
    { id: 'r1-m6', wrestler1: 'Alan Angels', wrestler2: 'Titus Alexander', winner: 'Alan Angels' },
    { id: 'r1-m7', wrestler1: 'Zoltan', wrestler2: 'Bushi', winner: 'Zoltan' },
  ],
  pairingSlots: [
    { winner1: null, winner2: null },
    { winner1: null, winner2: null },
    { winner1: null, winner2: null },
    { winner1: null, winner2: null },
  ],
  backup: 'Jay Joshua',
};

function loadState(): TournamentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
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

  const handleBack = () => {
    setState((prev) => (prev ? goBack(prev) : prev));
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(null);
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

  return {
    state,
    swapMode,
    setSwapMode,
    r1Done,
    round1Winners,
    handleSetup,
    handleRound1Pick,
    handleGoToPairing,
    handleSlotsChange,
    handlePairingsConfirmed,
    handleBracketPick,
    handleBack,
    handleReset,
    handleBackupChange,
    handleSwap,
  };
}
