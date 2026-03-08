import type { Matchup, Round2Pairing } from './types';

export const EDITION_YEAR = 2026;
export const EDITION_TITLE = `wXw 16 Carat Gold ${EDITION_YEAR}`;
export const EDITION_DESCRIPTION = `Tournament bracket tracker for ${EDITION_TITLE}`;

export const SEED_MATCHUPS: Matchup[] = [
  { wrestler1: 'YAMATO', wrestler2: 'Axel Tischer' },
  { wrestler1: 'Peter Tihanyi', wrestler2: 'Arez' },
  { wrestler1: 'Chihiro Hashimoto', wrestler2: 'Thomas Shire' },
  { wrestler1: 'Ahura', wrestler2: "Dennis 'Cash' Dullnig" },
  { wrestler1: 'Dieter Schwartz', wrestler2: 'Tetsuya Naito' },
  { wrestler1: 'Bobby Gunns', wrestler2: 'Erick Stevens' },
  { wrestler1: 'Alan Angels', wrestler2: 'Titus Alexander' },
  { wrestler1: 'Zoltan', wrestler2: 'Bushi' },
];

export const NIGHT1_WINNERS = [
  'YAMATO', 'Peter Tihanyi', 'Thomas Shire', 'Ahura',
  'Tetsuya Naito', 'Erick Stevens', 'Alan Angels', 'Zoltan',
];

export const NIGHT2_QF_PAIRINGS: Round2Pairing[] = [
  { winner1: 'YAMATO', winner2: 'Erick Stevens' },
  { winner1: 'Thomas Shire', winner2: 'Zoltan' },
  { winner1: 'Peter Tihanyi', winner2: 'Alan Angels' },
  { winner1: 'Ahura', winner2: 'Tetsuya Naito' },
];

export const NIGHT2_QF_WINNERS = ['YAMATO', 'Thomas Shire', 'Peter Tihanyi', 'Ahura'];

export const BACKUP_WRESTLER = 'Jay Joshua';
