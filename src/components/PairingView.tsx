import { useState } from 'react';
import type { Round2Pairing, PairingSlot } from '../types';
import { t } from '../i18n';
import './PairingView.css';

type Props = {
  winners: string[];
  slots: PairingSlot[];
  onSlotsChange: (slots: PairingSlot[]) => void;
  onConfirm: (pairings: Round2Pairing[]) => void;
  swapMode?: boolean;
  onSwap?: (wrestler: string) => void;
};

export function PairingView({ winners, slots, onSlotsChange, onConfirm, swapMode, onSwap }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const assigned = new Set(
    slots.flatMap((s) => [s.winner1, s.winner2].filter(Boolean))
  );
  const available = winners.filter((w) => !assigned.has(w));

  const handleWinnerTap = (name: string) => {
    if (selected === name) {
      setSelected(null);
      return;
    }
    setSelected(name);
  };

  const handleSlotTap = (slotIdx: number, position: 'winner1' | 'winner2') => {
    const current = slots[slotIdx][position];

    // If slot is filled, remove the wrestler back to pool
    if (current) {
      onSlotsChange(
        slots.map((s, i) => (i === slotIdx ? { ...s, [position]: null } : s))
      );
      return;
    }

    // If a wrestler is selected, place them
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

  return (
    <div className="pairing-view">
      <h1 className="pairing-title">{t('pairingTitle')}</h1>
      <p className="pairing-subtitle">{t('pairingSubtitle')}</p>

      <div className="winner-pool">
        {available.map((w) => (
          <button
            key={w}
            className={`pool-chip ${selected === w ? 'selected' : ''} ${swapMode ? 'swap-target' : ''}`}
            onClick={() => swapMode && onSwap ? onSwap(w) : handleWinnerTap(w)}
          >
            {w}
          </button>
        ))}
        {available.length === 0 && assigned.size < winners.length && (
          <span className="pool-empty">{t('allPlaced')}</span>
        )}
      </div>

      <div className="pairing-slots">
        {slots.map((slot, i) => (
          <div key={i} className="pairing-slot">
            <div className="slot-header">
              <span className="slot-label">{t('match')} {i + 1}</span>
              {i < 2 && <span className="slot-side left-tag">{t('left')}</span>}
              {i >= 2 && <span className="slot-side right-tag">{t('right')}</span>}
            </div>
            <div className="slot-row">
              <button
                className={[
                  'slot-btn',
                  slot.winner1 ? 'filled' : '',
                  !slot.winner1 && selected ? 'ready' : '',
                  swapMode && slot.winner1 ? 'swap-target' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => swapMode && onSwap && slot.winner1 ? onSwap(slot.winner1) : handleSlotTap(i, 'winner1')}
              >
                {slot.winner1 ?? t('tapToPlace')}
              </button>
              <span className="slot-vs">{t('vs')}</span>
              <button
                className={[
                  'slot-btn',
                  slot.winner2 ? 'filled' : '',
                  !slot.winner2 && selected ? 'ready' : '',
                  swapMode && slot.winner2 ? 'swap-target' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => swapMode && onSwap && slot.winner2 ? onSwap(slot.winner2) : handleSlotTap(i, 'winner2')}
              >
                {slot.winner2 ?? t('tapToPlace')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="start-btn" onClick={handleConfirm} disabled={!allFilled}>
        {t('revealBrackets')}
      </button>
    </div>
  );
}
