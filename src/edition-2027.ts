import type { Matchup, Round2Pairing } from './types';

export const EDITION_YEAR = 2027;
export const EDITION_TITLE = `wXw 16 Carat Gold ${EDITION_YEAR}`;
export const EDITION_DESCRIPTION = `Tournament bracket tracker for ${EDITION_TITLE}`;

// TODO: update with actual 2027 matchups
export const SEED_MATCHUPS: Matchup[] = [
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
  { wrestler1: 'TBD', wrestler2: 'TBD' },
];

export const NIGHT1_WINNERS: string[] = [];

export const NIGHT2_QF_PAIRINGS: Round2Pairing[] = [];

export const NIGHT2_QF_WINNERS: string[] = [];

export const BACKUP_WRESTLER = '';

/** Friday of the tournament weekend (Sat = Night 2, Sun = Night 3). */
export const NIGHT1_DATE = new Date(2027, 2, 5); // March 5, 2027

export function isTournamentOver(): boolean {
  const now = new Date();
  const monday = new Date(NIGHT1_DATE);
  monday.setDate(monday.getDate() + 3);
  monday.setHours(0, 0, 0, 0);
  return now >= monday;
}
