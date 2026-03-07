import type { Match } from '../types';
import { t } from '../i18n';
import { MatchCard } from './MatchCard';
import './BracketView.css';

type Props = {
  label: string;
  rounds: Match[][];
  onPickWinner: (matchId: string, winner: string) => void;
  swapMode?: boolean;
  onSwap?: (wrestler: string) => void;
};

export function BracketView({ label, rounds, onPickWinner, swapMode, onSwap }: Props) {
  const roundLabels = [t('round1'), t('quarterfinals'), t('semifinal')];
  const lastRoundIdx = rounds.length - 1;

  return (
    <div className="bracket-side">
      <h2 className="bracket-label">{label}</h2>
      <div className="rounds-container">
        {rounds.map((round, roundIdx) => (
          <div key={roundIdx} className={`round${roundIdx > 0 ? ' round--fed' : ''}`}>
            <h3 className="round-label">{roundLabels[roundIdx]}</h3>
            <div className="round-matches">
              {roundIdx < lastRoundIdx
                ? chunk(round, 2).map((pair, pairIdx) => (
                    <div key={pairIdx} className="match-pair">
                      {pair.map((match) => (
                        <MatchCard key={match.id} match={match} onPickWinner={onPickWinner} swapMode={swapMode} onSwap={onSwap} />
                      ))}
                    </div>
                  ))
                : round.map((match) => (
                    <MatchCard key={match.id} match={match} onPickWinner={onPickWinner} swapMode={swapMode} onSwap={onSwap} />
                  ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
