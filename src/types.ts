export type Wrestler = string;

export type Match = {
  id: string;
  wrestler1: Wrestler | null;
  wrestler2: Wrestler | null;
  winner: Wrestler | null;
};

export type Bracket = {
  left: Match[][];   // [round1(4), round2(2), semiFinal(1)]
  right: Match[][];  // [round1(4), round2(2), semiFinal(1)]
  final: Match;
};

export type Matchup = {
  wrestler1: string;
  wrestler2: string;
};

export type Round2Pairing = {
  winner1: string;
  winner2: string;
};

export type PairingSlot = {
  winner1: string | null;
  winner2: string | null;
};

export type TournamentState = {
  phase: 'round1' | 'pairing' | 'bracket';
  round1Matches: Match[];        // 8 flat matches for Night 1
  pairingSlots?: PairingSlot[];  // in-progress pairing work (4 slots)
  round2Pairings?: Round2Pairing[]; // 4 pairings (first 2 = left, last 2 = right)
  bracket?: Bracket;             // full bracket once pairings are set
  backup?: string;               // backup wrestler who can sub in from round 2
  backupUsed?: boolean;           // true after the backup has been swapped in
};
