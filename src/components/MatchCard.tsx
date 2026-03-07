import type { Match } from '../types';
import { t } from '../i18n';
import './MatchCard.css';

type Props = {
  match: Match;
  onPickWinner: (matchId: string, winner: string) => void;
  swapMode?: boolean;
  onSwap?: (wrestler: string) => void;
};

export function MatchCard({ match, onPickWinner, swapMode, onSwap }: Props) {
  const canPick = match.wrestler1 !== null && match.wrestler2 !== null;

  const handleClick = (wrestler: string | null) => {
    if (!wrestler) return;
    if (swapMode && onSwap) {
      onSwap(wrestler);
      return;
    }
    if (!canPick) return;
    onPickWinner(match.id, wrestler);
  };

  return (
    <div className="match-card">
      <button
        className={[
          'wrestler-btn',
          match.winner === match.wrestler1 && match.wrestler1 ? 'winner' : '',
          swapMode && match.wrestler1 ? 'swap-target' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => handleClick(match.wrestler1)}
        disabled={!swapMode && !canPick}
      >
        {match.wrestler1 ?? t('tbd')}
      </button>
      <span className="vs">{t('vs')}</span>
      <button
        className={[
          'wrestler-btn',
          match.winner === match.wrestler2 && match.wrestler2 ? 'winner' : '',
          swapMode && match.wrestler2 ? 'swap-target' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => handleClick(match.wrestler2)}
        disabled={!swapMode && !canPick}
      >
        {match.wrestler2 ?? t('tbd')}
      </button>
    </div>
  );
}
