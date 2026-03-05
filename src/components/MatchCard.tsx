import type { Match } from '../types';
import { t } from '../i18n';
import './MatchCard.css';

type Props = {
  match: Match;
  onPickWinner: (matchId: string, winner: string) => void;
};

export function MatchCard({ match, onPickWinner }: Props) {
  const canPick = match.wrestler1 !== null && match.wrestler2 !== null;

  const handlePick = (wrestler: string | null) => {
    if (!wrestler || !canPick) return;
    onPickWinner(match.id, wrestler);
  };

  return (
    <div className="match-card">
      <button
        className={`wrestler-btn ${match.winner === match.wrestler1 && match.wrestler1 ? 'winner' : ''}`}
        onClick={() => handlePick(match.wrestler1)}
        disabled={!canPick}
      >
        {match.wrestler1 ?? t('tbd')}
      </button>
      <span className="vs">{t('vs')}</span>
      <button
        className={`wrestler-btn ${match.winner === match.wrestler2 && match.wrestler2 ? 'winner' : ''}`}
        onClick={() => handlePick(match.wrestler2)}
        disabled={!canPick}
      >
        {match.wrestler2 ?? t('tbd')}
      </button>
    </div>
  );
}
