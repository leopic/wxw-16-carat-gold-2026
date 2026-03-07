import { useState, useEffect } from 'react';
import type { TournamentState, Matchup, Round2Pairing, PairingSlot } from './types';
import {
  createRound1Matches,
  setRound1Winner,
  allRound1Complete,
  getRound1Winners,
  buildBracketFromPairings,
  setWinner,
  swapWrestler,
} from './bracket';
import { t } from './i18n';
import { SetupView } from './components/SetupView';
import { PairingView } from './components/PairingView';
import { BracketView } from './components/BracketView';
import { MatchCard } from './components/MatchCard';
import { ChampionAlert } from './components/ChampionAlert';
import { AppMenu } from './components/AppMenu';
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
  const [swapMode, setSwapMode] = useState(false);

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
      if (prev.phase === 'round1') {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      if (prev.phase === 'pairing') return { ...prev, phase: 'round1' };
      if (prev.phase === 'bracket') return { ...prev, phase: 'pairing' };
      return prev;
    });
  };

  const handleReset = () => {
    if (confirm(t('resetConfirm'))) {
      localStorage.removeItem(STORAGE_KEY);
      setState(null);
    }
  };

  const handleBackupChange = (name: string) => {
    setState((prev) => (prev ? { ...prev, backup: name || undefined } : prev));
  };

  const handleSwap = (target: string) => {
    if (!state?.backup) return;
    const replacement = state.backup;

    setState((prev) => {
      if (!prev?.backup) return prev;

      // Replace in round1 match winners
      const round1Matches = prev.round1Matches.map((m) => ({
        ...m,
        wrestler1: m.wrestler1 === target ? replacement : m.wrestler1,
        wrestler2: m.wrestler2 === target ? replacement : m.wrestler2,
        winner: m.winner === target ? replacement : m.winner,
      }));

      // Replace in pairing slots
      const pairingSlots = prev.pairingSlots?.map((s) => ({
        winner1: s.winner1 === target ? replacement : s.winner1,
        winner2: s.winner2 === target ? replacement : s.winner2,
      }));

      // Replace in bracket if it exists
      const bracket = prev.bracket
        ? swapWrestler(prev.bracket, target, replacement)
        : prev.bracket;

      return { ...prev, round1Matches, pairingSlots, bracket, backupUsed: true };
    });
    setSwapMode(false);
  };

  const hasBackup = !!state?.backup;

  const header = (
    <header className="app-header">
      <button className="back-btn" onClick={handleBack}>{t('back')}</button>
      <h1 className="app-title">{t('appTitle')}</h1>
      <AppMenu hasBackup={hasBackup} backupUsed={state?.backupUsed} onInjurySub={() => setSwapMode(true)} onReset={handleReset} />
    </header>
  );

  const swapBar = state?.backup && swapMode ? (
    <div className="swap-bar">
      <span className="swap-instruction">{t('swapInstruction').replace('{name}', state.backup)}</span>
      <button className="swap-cancel-btn" onClick={() => setSwapMode(false)}>{t('swapCancel')}</button>
    </div>
  ) : null;

  // No state yet — show setup
  if (!state) {
    return <SetupView onStart={handleSetup} />;
  }

  // Phase 1: Night 1 — flat round 1 matches
  if (state.phase === 'round1') {
    const r1Done = allRound1Complete(state.round1Matches);
    return (
      <div className="app">
        {header}
        <p className="phase-subtitle">{t('pickWinner')}</p>

        <div className="round1-grid">
          {state.round1Matches.map((match) => (
            <MatchCard key={match.id} match={match} onPickWinner={handleRound1Pick} />
          ))}
        </div>

        <div className="backup-section">
          <label className="backup-label" htmlFor="backup-input">{t('backupLabel')}</label>
          <input
            id="backup-input"
            className="backup-input"
            type="text"
            placeholder={t('backupPlaceholder')}
            value={state.backup ?? ''}
            onChange={(e) => handleBackupChange(e.target.value)}
          />
        </div>

        {r1Done && (
          <button className="start-btn proceed-btn" onClick={handleGoToPairing}>
            {t('allDecided')}
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
        {header}
        {swapBar}
        <PairingView
          winners={winners}
          slots={state.pairingSlots ?? emptySlots}
          onSlotsChange={handleSlotsChange}
          onConfirm={handlePairingsConfirmed}
          swapMode={swapMode}
          onSwap={handleSwap}
        />
      </div>
    );
  }

  // Phase 3: Full bracket view
  const bracket = state.bracket!;
  return (
    <div className="app">
      {header}
      {swapBar}

      <div className="final-section">
        <h2 className="final-label">{t('championshipFinal')}</h2>
        <MatchCard match={bracket.final} onPickWinner={handleBracketPick} swapMode={swapMode} onSwap={handleSwap} />
        <ChampionAlert winner={bracket.final.winner} />
      </div>

      <BracketView label={t('leftBracket')} rounds={bracket.left} onPickWinner={handleBracketPick} swapMode={swapMode} onSwap={handleSwap} />
      <BracketView label={t('rightBracket')} rounds={bracket.right} onPickWinner={handleBracketPick} swapMode={swapMode} onSwap={handleSwap} />
    </div>
  );
}

export default App;
