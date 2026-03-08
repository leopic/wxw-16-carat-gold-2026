import type { Match, Bracket } from '../types';
import { t } from '../i18n';
import { MatchCard } from './MatchCard';
import { ChampionAlert } from './ChampionAlert';
import './BracketView.css';

type Props = {
  bracket: Bracket;
  onPickWinner: (matchId: string, winner: string) => void;
  swapMode?: boolean;
  onSwap?: (wrestler: string) => void;
};

const ROUND_LABELS = ['round1', 'quarterfinals', 'semifinal', 'championshipFinal'] as const;

export function BracketView({ bracket, onPickWinner, swapMode, onSwap }: Props) {
  const { rounds } = bracket;
  const finalMatch = rounds[rounds.length - 1]?.[0];

  return (
    <div className="bracket-side">
      <div className="rounds-container">
        {rounds.map((round, roundIdx) => (
          <div key={roundIdx} className={`round${roundIdx > 0 ? ' round--fed' : ''}`}>
            <h3 className="round-label">{t(ROUND_LABELS[roundIdx])}</h3>
            <div className="round-matches">
              {roundIdx < rounds.length - 1
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
      {finalMatch && <ChampionAlert winner={finalMatch.winner} />}
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
