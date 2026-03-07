import { useState } from 'react';
import type { Matchup } from '../types';
import { t } from '../i18n';
import { AppMenu } from './AppMenu';
import './SetupView.css';

type Props = {
  onStart: (matchups: Matchup[]) => void;
};

const SEED_MATCHUPS: Matchup[] = [
  { wrestler1: 'YAMATO', wrestler2: 'Axel Tischer' },
  { wrestler1: 'Peter Tihanyi', wrestler2: 'Arez' },
  { wrestler1: 'Chihiro Hashimoto', wrestler2: 'Thomas Shire' },
  { wrestler1: 'Ahura', wrestler2: "Dennis 'Cash' Dullnig" },
  { wrestler1: 'Dieter Schwartz', wrestler2: 'Tetsuya Naito' },
  { wrestler1: 'Bobby Gunns', wrestler2: 'Erick Stevens' },
  { wrestler1: 'Alan Angels', wrestler2: 'Titus Alexander' },
  { wrestler1: 'Zoltan', wrestler2: 'Bushi' },
];

export function SetupView({ onStart }: Props) {
  const [matchups, setMatchups] = useState<Matchup[]>(SEED_MATCHUPS);

  const update = (index: number, field: 'wrestler1' | 'wrestler2', value: string) => {
    setMatchups((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const allFilled = matchups.every(
    (m) => m.wrestler1.trim() && m.wrestler2.trim()
  );

  const handleStart = () => {
    if (!allFilled) return;
    onStart(matchups.map((m) => ({
      wrestler1: m.wrestler1.trim(),
      wrestler2: m.wrestler2.trim(),
    })));
  };

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
