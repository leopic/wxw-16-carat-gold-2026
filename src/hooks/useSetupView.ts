import { useState } from 'react';
import type { Matchup } from '../types';
import { SEED_MATCHUPS } from '../edition';

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
