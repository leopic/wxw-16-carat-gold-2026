import type { Match } from '../types';
import { t } from '../i18n';
import { MatchCard } from './MatchCard';
import './BracketView.css';

type Props = {
  label: string;
  rounds: Match[][];
  onPickWinner: (matchId: string, winner: string) => void;
};

export function BracketView({ label, rounds, onPickWinner }: Props) {
  const roundLabels = [t('round1'), t('quarterfinals'), t('semifinal')];

  return (
    <div className="bracket-side">
      <h2 className="bracket-label">{label}</h2>
      <div className="rounds-container">
        {rounds.map((round, roundIdx) => (
          <div key={roundIdx} className="round">
            <h3 className="round-label">{roundLabels[roundIdx]}</h3>
            <div className="round-matches">
              {round.map((match) => (
                <MatchCard key={match.id} match={match} onPickWinner={onPickWinner} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
