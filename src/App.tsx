import { useState, useEffect } from 'react';
import type { TournamentState, Matchup, Round2Pairing, PairingSlot } from './types';
import {
  createRound1Matches,
  setRound1Winner,
  allRound1Complete,
  getRound1Winners,
  buildBracketFromPairings,
  setWinner,
} from './bracket';
import { SetupView } from './components/SetupView';
import { PairingView } from './components/PairingView';
import { BracketView } from './components/BracketView';
import { MatchCard } from './components/MatchCard';
import './App.css';

const STORAGE_KEY = 'wxw-tournament';

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

function App() {
  const [state, setState] = useState<TournamentState | null>(loadState);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const handleSetup = (matchups: Matchup[]) => {
    setState({
      phase: 'round1',
      round1Matches: createRound1Matches(matchups),
    });
  };

  const handleRound1Pick = (matchId: string, winner: string) => {
    setState((prev) => (prev ? setRound1Winner(prev, matchId, winner) : prev));
  };

  const emptySlots: PairingSlot[] = [
    { winner1: null, winner2: null },
    { winner1: null, winner2: null },
    { winner1: null, winner2: null },
    { winner1: null, winner2: null },
  ];

  const handleGoToPairing = () => {
    setState((prev) => (prev ? { ...prev, phase: 'pairing', pairingSlots: prev.pairingSlots ?? emptySlots } : prev));
  };

  const handleSlotsChange = (slots: PairingSlot[]) => {
    setState((prev) => (prev ? { ...prev, pairingSlots: slots } : prev));
  };

  const handlePairingsConfirmed = (pairings: Round2Pairing[]) => {
    setState((prev) => {
      if (!prev) return prev;
      const bracket = buildBracketFromPairings(prev.round1Matches, pairings);
      return {
        ...prev,
        phase: 'bracket',
        round2Pairings: pairings,
        bracket,
      };
    });
  };

  const handleBracketPick = (matchId: string, winner: string) => {
    setState((prev) => {
      if (!prev?.bracket) return prev;
      return { ...prev, bracket: setWinner(prev.bracket, matchId, winner) };
    });
  };

  const handleBack = () => {
    setState((prev) => {
      if (!prev) return prev;
      if (prev.phase === 'pairing') return { ...prev, phase: 'round1' };
      if (prev.phase === 'bracket') return { ...prev, phase: 'pairing' };
      return prev;
    });
  };

  const handleReset = () => {
    if (confirm('Reset the entire tournament? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setState(null);
    }
  };

  // No state yet — show setup
  if (!state) {
    return <SetupView onStart={handleSetup} />;
  }

  // Phase 1: Night 1 — flat round 1 matches
  if (state.phase === 'round1') {
    const r1Done = allRound1Complete(state.round1Matches);
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">wXw 16 Carat Gold 2026</h1>
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </header>
        <p className="phase-subtitle">Pick the winner of each match</p>

        <div className="round1-grid">
          {state.round1Matches.map((match) => (
            <MatchCard key={match.id} match={match} onPickWinner={handleRound1Pick} />
          ))}
        </div>

        {r1Done && (
          <button className="start-btn proceed-btn" onClick={handleGoToPairing}>
            All matches decided — Set Night 2 Pairings
          </button>
        )}
      </div>
    );
  }

  // Phase 2: Pairing screen
  if (state.phase === 'pairing') {
    const winners = getRound1Winners(state.round1Matches);
    return (
      <div className="app">
        <header className="app-header">
          <button className="back-btn" onClick={handleBack}>Back</button>
          <h1 className="app-title">wXw 16 Carat Gold 2026</h1>
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </header>
        <PairingView
          winners={winners}
          slots={state.pairingSlots ?? emptySlots}
          onSlotsChange={handleSlotsChange}
          onConfirm={handlePairingsConfirmed}
        />
      </div>
    );
  }

  // Phase 3: Full bracket view
  const bracket = state.bracket!;
  return (
    <div className="app">
      <header className="app-header">
        <button className="back-btn" onClick={handleBack}>Back</button>
        <h1 className="app-title">wXw 16 Carat Gold 2026</h1>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </header>

      <BracketView label="Left Bracket" rounds={bracket.left} onPickWinner={handleBracketPick} />
      <BracketView label="Right Bracket" rounds={bracket.right} onPickWinner={handleBracketPick} />

      <div className="final-section">
        <h2 className="final-label">Championship Final</h2>
        <MatchCard match={bracket.final} onPickWinner={handleBracketPick} />
        {bracket.final.winner && (
          <div className="champion-banner">
            {bracket.final.winner}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
