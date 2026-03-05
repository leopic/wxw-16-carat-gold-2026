const strings = {
  en: {
    appTitle: 'wXw 16 Carat Gold 2026',
    back: 'Back',
    reset: 'Reset',
    resetConfirm: 'Reset the entire tournament? This cannot be undone.',
    // Setup
    setupTitle: 'Night 1 Setup',
    setupSubtitle: 'Confirm the matchups or edit as needed',
    wrestlerPlaceholder: 'Wrestler',
    startNight1: 'Start Night 1',
    // Round 1
    pickWinner: 'Pick the winner of each match',
    allDecided: 'All matches decided — Set Night 2 Pairings',
    // Match
    vs: 'vs',
    tbd: 'TBD',
    // Bracket
    round1: 'Round 1',
    quarterfinals: 'Quarterfinals',
    semifinal: 'Semifinal',
    leftBracket: 'Left Bracket',
    rightBracket: 'Right Bracket',
    championshipFinal: 'Championship Final',
    // Pairing
    pairingTitle: 'Night 2 Pairings',
    pairingSubtitle: 'Tap a winner below, then tap a slot to place them. First 2 matches = left bracket, last 2 = right bracket.',
    match: 'Match',
    left: 'Left',
    right: 'Right',
    tapToPlace: 'Tap to place',
    allPlaced: 'All winners placed',
    revealBrackets: 'Reveal Brackets',
  },
  de: {
    appTitle: 'wXw 16 Carat Gold 2026',
    back: 'Zurück',
    reset: 'Zurücksetzen',
    resetConfirm: 'Das gesamte Turnier zurücksetzen? Dies kann nicht rückgängig gemacht werden.',
    // Setup
    setupTitle: 'Abend 1 – Aufstellung',
    setupSubtitle: 'Paarungen bestätigen oder anpassen',
    wrestlerPlaceholder: 'Wrestler',
    startNight1: 'Abend 1 starten',
    // Round 1
    pickWinner: 'Wähle den Gewinner jedes Kampfes',
    allDecided: 'Alle Kämpfe entschieden — Paarungen für Abend 2 festlegen',
    // Match
    vs: 'vs',
    tbd: 'TBD',
    // Bracket
    round1: 'Runde 1',
    quarterfinals: 'Viertelfinale',
    semifinal: 'Halbfinale',
    leftBracket: 'Linke Seite',
    rightBracket: 'Rechte Seite',
    championshipFinal: 'Finale',
    // Pairing
    pairingTitle: 'Abend 2 – Paarungen',
    pairingSubtitle: 'Tippe auf einen Gewinner und dann auf einen Platz. Die ersten 2 Kämpfe = linke Seite, die letzten 2 = rechte Seite.',
    match: 'Kampf',
    left: 'Links',
    right: 'Rechts',
    tapToPlace: 'Tippen zum Platzieren',
    allPlaced: 'Alle Gewinner platziert',
    revealBrackets: 'Turnierbaum anzeigen',
  },
  es: {
    appTitle: 'wXw 16 Carat Gold 2026',
    back: 'Atrás',
    reset: 'Reiniciar',
    resetConfirm: '¿Reiniciar todo el torneo? Esto no se puede deshacer.',
    // Setup
    setupTitle: 'Noche 1 – Configuración',
    setupSubtitle: 'Confirma los combates o edítalos',
    wrestlerPlaceholder: 'Luchador',
    startNight1: 'Iniciar Noche 1',
    // Round 1
    pickWinner: 'Elige al ganador de cada combate',
    allDecided: 'Todos los combates decididos — Definir combates de la Noche 2',
    // Match
    vs: 'vs',
    tbd: 'PD',
    // Bracket
    round1: 'Ronda 1',
    quarterfinals: 'Cuartos de final',
    semifinal: 'Semifinal',
    leftBracket: 'Lado Izquierdo',
    rightBracket: 'Lado Derecho',
    championshipFinal: 'Gran Final',
    // Pairing
    pairingTitle: 'Noche 2 – Combates',
    pairingSubtitle: 'Toca un ganador y luego un espacio para colocarlo. Los primeros 2 combates = lado izquierdo, los últimos 2 = lado derecho.',
    match: 'Combate',
    left: 'Izq',
    right: 'Der',
    tapToPlace: 'Toca para colocar',
    allPlaced: 'Todos los ganadores colocados',
    revealBrackets: 'Revelar llaves',
  },
} as const;

type Locale = keyof typeof strings;
type StringKey = keyof (typeof strings)['en'];

function detectLocale(): Locale {
  const lang = navigator.language.slice(0, 2).toLowerCase();
  if (lang === 'de') return 'de';
  if (lang === 'es') return 'es';
  return 'en';
}

export const locale = detectLocale();

export function t(key: StringKey): string {
  return strings[locale][key];
}
