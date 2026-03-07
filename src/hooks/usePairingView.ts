import { useState } from 'react';
import type { PairingSlot, Round2Pairing } from '../types';

export function usePairingView(
  slots: PairingSlot[],
  winners: string[],
  onSlotsChange: (slots: PairingSlot[]) => void,
  onConfirm: (pairings: Round2Pairing[]) => void,
  swapMode?: boolean,
  onSwap?: (wrestler: string) => void,
) {
  const [selected, setSelected] = useState<string | null>(null);

  const assigned = new Set(
    slots.flatMap((s) => [s.winner1, s.winner2].filter(Boolean))
  );
  const available = winners.filter((w) => !assigned.has(w));

  const handleWinnerTap = (name: string) => {
    if (swapMode && onSwap) {
      onSwap(name);
      return;
    }
    setSelected(selected === name ? null : name);
  };

  const handleSlotTap = (slotIdx: number, position: 'winner1' | 'winner2') => {
    const current = slots[slotIdx][position];

    if (swapMode && onSwap && current) {
      onSwap(current);
      return;
    }

    if (current) {
      onSlotsChange(
        slots.map((s, i) => (i === slotIdx ? { ...s, [position]: null } : s))
      );
      return;
    }

    if (selected) {
      onSlotsChange(
        slots.map((s, i) => (i === slotIdx ? { ...s, [position]: selected } : s))
      );
      setSelected(null);
    }
  };

  const allFilled = slots.every((s) => s.winner1 && s.winner2);

  const handleConfirm = () => {
    if (!allFilled) return;
    onConfirm(
      slots.map((s) => ({
        winner1: s.winner1!,
        winner2: s.winner2!,
      }))
    );
  };

  return {
    selected,
    available,
    assigned,
    allFilled,
    handleWinnerTap,
    handleSlotTap,
    handleConfirm,
  };
}
