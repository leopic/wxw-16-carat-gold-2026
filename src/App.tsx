import { t } from './i18n';
import { useTournament } from './hooks/useTournament';
import { SetupView } from './components/SetupView';
import { PairingView } from './components/PairingView';
import { BracketView } from './components/BracketView';
import { MatchCard } from './components/MatchCard';
import { AppMenu } from './components/AppMenu';
import { ProgressBar } from './components/ProgressBar';
import './App.css';

function App() {
  const {
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
    handleReset,
    handleBackupChange,
    handleSwap,
  } = useTournament();

  const hasBackup = !!state?.backup;

  const emptySlots = [
    { winner1: null, winner2: null, winner: null },
    { winner1: null, winner2: null, winner: null },
    { winner1: null, winner2: null, winner: null },
    { winner1: null, winner2: null, winner: null },
  ];

  const emptySfSlots = [
    { winner1: null, winner2: null, winner: null },
    { winner1: null, winner2: null, winner: null },
  ];

  const progressSteps = [
    t('stepNight1'),
    t('stepQFPairings'),
    t('stepQuarterfinals'),
    t('stepSFPairings'),
    t('stepFinals'),
  ];

  let currentStep = 0;
  if (state?.phase === 'pairing') currentStep = 1;
  else if (state?.phase === 'bracket' && sfNotYetSet) currentStep = 2;
  else if (state?.phase === 'sfPairing') currentStep = 3;
  else if (state?.phase === 'bracket') currentStep = 4;

  const header = (
    <>
      <header className="app-header">
        <button className="back-btn" onClick={handleBack}>{t('back')}</button>
        <h1 className="app-title">{t('appTitle')}</h1>
        <AppMenu
          hasBackup={hasBackup}
          backupUsed={state?.backupUsed}
          onInjurySub={() => setSwapMode(true)}
          onReset={() => { if (confirm(t('resetConfirm'))) handleReset(); }}
        />
      </header>
      <ProgressBar step={currentStep} steps={progressSteps} />
    </>
  );

  const swapBar = state?.backup && swapMode ? (
    <div className="swap-bar">
      <span className="swap-instruction">{t('swapInstruction').replace('{name}', state.backup)}</span>
      <button className="swap-cancel-btn" onClick={() => setSwapMode(false)}>{t('swapCancel')}</button>
    </div>
  ) : null;

  if (!state) {
    return <SetupView onStart={handleSetup} />;
  }

  if (state.phase === 'round1') {
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

  if (state.phase === 'pairing') {
    return (
      <div className="app">
        {header}
        {swapBar}
        <PairingView
          winners={round1Winners}
          slots={state.pairingSlots ?? emptySlots}
          onSlotsChange={handleSlotsChange}
          onConfirm={handlePairingsConfirmed}
          swapMode={swapMode}
          onSwap={handleSwap}
        />
      </div>
    );
  }

  if (state.phase === 'sfPairing') {
    return (
      <div className="app">
        {header}
        {swapBar}
        <PairingView
          winners={qfWinners}
          slots={state.sfPairingSlots ?? emptySfSlots}
          onSlotsChange={handleSfSlotsChange}
          onConfirm={handleSfPairingsConfirmed}
          title={t('sfPairingTitle')}
          subtitle={t('sfPairingSubtitle')}
          confirmLabel={t('revealSemifinals')}
          swapMode={swapMode}
          onSwap={handleSwap}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {header}
      {swapBar}

      <BracketView bracket={state.bracket!} onPickWinner={handleBracketPick} swapMode={swapMode} onSwap={handleSwap} />

      {allQFsDone && sfNotYetSet && (
        <button className="start-btn proceed-btn" onClick={handleGoToSfPairing}>
          {t('setSfPairings')}
        </button>
      )}
    </div>
  );
}

export default App;
