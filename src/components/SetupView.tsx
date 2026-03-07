import type { Matchup } from '../types';
import { t } from '../i18n';
import { useSetupView } from '../hooks/useSetupView';
import { AppMenu } from './AppMenu';
import './SetupView.css';

type Props = {
  onStart: (matchups: Matchup[]) => void;
};

export function SetupView({ onStart }: Props) {
  const { matchups, update, allFilled, handleStart } = useSetupView(onStart);

  return (
    <div className="setup-view">
      <header className="app-header">
        <div className="back-btn-placeholder" />
        <h1 className="app-title">{t('appTitle')}</h1>
        <AppMenu />
      </header>
      <h2 className="setup-title">{t('setupTitle')}</h2>
      <p className="setup-subtitle">{t('setupSubtitle')}</p>

      <div className="setup-matches">
        {matchups.map((m, i) => (
          <div key={i} className="setup-row">
            <span className="match-num">{i + 1}</span>
            <input
              type="text"
              placeholder={t('wrestlerPlaceholder')}
              value={m.wrestler1}
              onChange={(e) => update(i, 'wrestler1', e.target.value)}
            />
            <span className="setup-vs">{t('vs')}</span>
            <input
              type="text"
              placeholder={t('wrestlerPlaceholder')}
              value={m.wrestler2}
              onChange={(e) => update(i, 'wrestler2', e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className="start-btn" onClick={handleStart} disabled={!allFilled}>
        {t('startNight1')}
      </button>
    </div>
  );
}
