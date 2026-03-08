import type { Round2Pairing, PairingSlot } from '../types';
import { t } from '../i18n';
import { MatchCard } from './MatchCard';
import { usePairingView } from '../hooks/usePairingView';
import './PairingView.css';

type Props = {
  winners: string[];
  slots: PairingSlot[];
  onSlotsChange: (slots: PairingSlot[]) => void;
  onConfirm: (pairings: Round2Pairing[]) => void;
  swapMode?: boolean;
  onSwap?: (wrestler: string) => void;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
};

export function PairingView({ winners, slots, onSlotsChange, onConfirm, swapMode, onSwap, title, subtitle, confirmLabel }: Props) {
  const {
    selected,
    available,
    allDecided,
    handleWinnerTap,
    handleSlotTap,
    handleMatchWinner,
    handleConfirm,
  } = usePairingView(slots, winners, onSlotsChange, onConfirm, swapMode, onSwap);

  return (
    <div className="pairing-view">
      <h1 className="pairing-title">{title ?? t('pairingTitle')}</h1>
      <p className="pairing-subtitle">{subtitle ?? t('pairingSubtitle')}</p>

      <div className="winner-pool">
        {available.map((w) => (
          <button
            key={w}
            className={`pool-chip ${selected === w ? 'selected' : ''} ${swapMode ? 'swap-target' : ''}`}
            onClick={() => handleWinnerTap(w)}
          >
            {w}
          </button>
        ))}
        {available.length === 0 && winners.length > 0 && (
          <span className="pool-empty">{t('allPlaced')}</span>
        )}
      </div>

      <div className="pairing-slots">
        {slots.map((slot, i) => {
          const matchReady = slot.winner1 !== null && slot.winner2 !== null;
          return (
            <div key={i} className="pairing-slot">
              <div className="slot-header">
                <span className="slot-label">{t('match')} {i + 1}</span>
              </div>
              {matchReady ? (
                <>
                  <MatchCard
                    match={{
                      id: `pairing-${i}`,
                      wrestler1: slot.winner1,
                      wrestler2: slot.winner2,
                      winner: slot.winner,
                    }}
                    onPickWinner={(_id, winner) => handleMatchWinner(i, winner)}
                    swapMode={swapMode}
                    onSwap={onSwap}
                  />
                  {!swapMode && (
                    <button
                      className="slot-clear-btn"
                      onClick={() => {
                        handleSlotTap(i, 'winner2');
                      }}
                    >
                      {t('clearMatch')}
                    </button>
                  )}
                </>
              ) : (
                <div className="slot-row">
                  <button
                    className={[
                      'slot-btn',
                      slot.winner1 ? 'filled' : '',
                      !slot.winner1 && selected ? 'ready' : '',
                      swapMode && slot.winner1 ? 'swap-target' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleSlotTap(i, 'winner1')}
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
                    onClick={() => handleSlotTap(i, 'winner2')}
                  >
                    {slot.winner2 ?? t('tapToPlace')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="start-btn" onClick={handleConfirm} disabled={!allDecided}>
        {confirmLabel ?? t('revealBrackets')}
      </button>
    </div>
  );
}
