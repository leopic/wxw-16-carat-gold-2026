import type { Match } from '../types';
import { MatchCard } from './MatchCard';
import './BracketView.css';

type Props = {
  label: string;
  rounds: Match[][];
  onPickWinner: (matchId: string, winner: string) => void;
};

const ROUND_LABELS = ['Round 1', 'Quarterfinals', 'Semifinal'];

export function BracketView({ label, rounds, onPickWinner }: Props) {
  return (
    <div className="bracket-side">
      <h2 className="bracket-label">{label}</h2>
      <div className="rounds-container">
        {rounds.map((round, roundIdx) => (
          <div key={roundIdx} className="round">
            <h3 className="round-label">{ROUND_LABELS[roundIdx]}</h3>
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
