import { useState } from 'react';
import type { Matchup } from '../types';

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

export function useSetupView(onStart: (matchups: Matchup[]) => void) {
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

  return { matchups, update, allFilled, handleStart };
}
