import { useState } from 'react';
import type { Matchup } from '../types';
import './SetupView.css';

type Props = {
  onStart: (matchups: Matchup[]) => void;
};

const SEED_MATCHUPS: Matchup[] = [
  { wrestler1: 'Titus Alexander', wrestler2: 'Ricky Sosa' },
  { wrestler1: 'Arez', wrestler2: 'Peter Tihanyi' },
  { wrestler1: 'Zoltan', wrestler2: 'Bushi' },
  { wrestler1: 'Chihiro Hashimoto', wrestler2: 'Tomas Shire' },
  { wrestler1: 'Dieter Schwartz', wrestler2: 'Tetsuya Naito' },
  { wrestler1: 'Erick Stevens', wrestler2: 'Bobby Gunns' },
  { wrestler1: 'Yamato', wrestler2: 'Axel Tischer' },
  { wrestler1: "Dennis 'Cash' Dulling", wrestler2: 'Ahura' },
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
      <h1 className="setup-title">Night 1 Setup</h1>
      <p className="setup-subtitle">Confirm the matchups or edit as needed</p>

      <div className="setup-matches">
        {matchups.map((m, i) => (
          <div key={i} className="setup-row">
            <span className="match-num">{i + 1}</span>
            <input
              type="text"
              placeholder={`Wrestler`}
              value={m.wrestler1}
              onChange={(e) => update(i, 'wrestler1', e.target.value)}
            />
            <span className="setup-vs">vs</span>
            <input
              type="text"
              placeholder={`Wrestler`}
              value={m.wrestler2}
              onChange={(e) => update(i, 'wrestler2', e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className="start-btn" onClick={handleStart} disabled={!allFilled}>
        Start Night 1
      </button>
    </div>
  );
}
