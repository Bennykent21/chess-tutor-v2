import { TacticalPuzzle } from '../types';

export const BUILT_IN_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'puzzle_fork_1',
    title: 'Royal Knight Fork Deflection',
    theme: 'FORK',
    themeLabel: 'Knight / Pawn Fork',
    rating: 1100,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    sideToPlay: 'w',
    solutionMovesUci: ['c4f7', 'e8f7', 'f3e5'],
    solutionSanDisplay: '1. Bxf7+! Kxf7 2. Nxe5+ (Decoy into Central Fork)',
    explanation: 'Sacrificing the bishop on f7 deflects the King from castling, setting up an irresistible knight strike that tears open Black\'s defense.',
    hintLadder: {
      level1Concept: 'Target the f7 square, the weakest point in Black\'s uncastled position.',
      level2FocusZone: 'Look at the f7 square and the exposed Black King.',
      level3CandidatePiece: 'c4',
      level4DirectMove: 'c4f7 (Bxf7+)'
    }
  },
  {
    id: 'puzzle_fork_c7',
    title: 'Outpost Fork on c7',
    theme: 'FORK',
    themeLabel: 'Knight Fork',
    rating: 1250,
    fen: 'r1b1kb1r/pp1p1ppp/2n2n2/q3p3/2B1P3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 2 7',
    sideToPlay: 'w',
    solutionMovesUci: ['c3d5', 'a5d8', 'c1g5'],
    solutionSanDisplay: '1. Nd5! Qd8 2. Bg5',
    explanation: 'Invading the centralized d5 outpost exerts unbearable geometric crossfire against the c7 and f6 squares.',
    hintLadder: {
      level1Concept: 'Look for an unchallenged central outpost to unleash multiple threats.',
      level2FocusZone: 'Focus on the c3 knight springing into d5.',
      level3CandidatePiece: 'c3',
      level4DirectMove: 'c3d5 (Nd5)'
    }
  },
  {
    id: 'puzzle_back_rank_1',
    title: 'Corridor Back-Rank Mate',
    theme: 'BACK_RANK',
    themeLabel: 'Back-Rank Mate',
    rating: 1200,
    fen: '3r2k1/pp3ppp/8/8/3R4/8/PP3PPP/6K1 w - - 0 1',
    sideToPlay: 'w',
    solutionMovesUci: ['d4d8'],
    solutionSanDisplay: '1. Rxd8#',
    explanation: 'Black\'s king is asphyxiated behind its own wall of defensive pawns without luft (an escape window), allowing an immediate back-rank checkmate.',
    hintLadder: {
      level1Concept: 'Check whether Black\'s King has an escape square on the 7th rank.',
      level2FocusZone: 'The 8th rank corridor.',
      level3CandidatePiece: 'd4',
      level4DirectMove: 'd4d8 (Rxd8#)'
    }
  },
  {
    id: 'puzzle_pin_1',
    title: 'Absolute Pin on the Queen',
    theme: 'PIN',
    themeLabel: 'Absolute Pin',
    rating: 1350,
    fen: 'r1b1k2r/ppppqppp/5n2/4b3/2B5/5Q2/PPP2PPP/RNB1R1K1 w kq - 0 9',
    sideToPlay: 'w',
    solutionMovesUci: ['c1g5', 'd7d6', 'b1c3'],
    solutionSanDisplay: '1. Bg5 d6 2. Nc3',
    explanation: 'Black\'s bishop on e5 is paralyzed by the absolute pin along the open e-file against the uncastled King and Queen.',
    hintLadder: {
      level1Concept: 'Find a piece that cannot legally move because it shields the King.',
      level2FocusZone: 'The e-file and the immobilized e5 bishop.',
      level3CandidatePiece: 'c1',
      level4DirectMove: 'c1g5 (Bg5)'
    }
  },
  {
    id: 'puzzle_discovered_1',
    title: 'Lasker\'s Discovered Check',
    theme: 'DISCOVERED_ATTACK',
    themeLabel: 'Discovered Attack',
    rating: 1450,
    fen: 'r1b2rk1/pp1p1ppp/2n1pn2/q7/2BNP3/2P5/P1PB1PPP/R2Q1RK1 w - - 4 10',
    sideToPlay: 'w',
    solutionMovesUci: ['d4b3', 'a5c7', 'f2f4'],
    solutionSanDisplay: '1. Nb3 Qc7 2. f4',
    explanation: 'Repositioning the knight unmasks the battery from the d2 bishop and d1 queen against Black\'s exposed central pieces.',
    hintLadder: {
      level1Concept: 'Move one piece to unveil a lethal line of sight from another.',
      level2FocusZone: 'd4 knight and queen diagonal.',
      level3CandidatePiece: 'd4',
      level4DirectMove: 'd4b3 (Nb3)'
    }
  },
  {
    id: 'puzzle_endgame_1',
    title: 'Lucena Bridge Building Breakthrough',
    theme: 'ENDGAME',
    themeLabel: 'King & Pawn Promotion',
    rating: 1550,
    fen: '1K1k4/1P6/8/8/8/8/1r6/2R5 w - - 0 1',
    sideToPlay: 'w',
    solutionMovesUci: ['c1c4', 'b2b1', 'b8a7'],
    solutionSanDisplay: '1. Rc4! Rb1 2. Ka7',
    explanation: 'Lifting the rook to the 4th rank builds the famous Lucena bridge to shelter the King from vertical checks and guarantee pawn promotion.',
    hintLadder: {
      level1Concept: 'Build a defensive shelter for your King using your rook on the 4th rank.',
      level2FocusZone: '4th rank bridge construction.',
      level3CandidatePiece: 'c1',
      level4DirectMove: 'c1c4 (Rc4!)'
    }
  },
  {
    id: 'puzzle_greek_gift',
    title: 'Classical Greek Gift Sacrifice',
    theme: 'SACRIFICE',
    themeLabel: 'King Attack Sacrifice',
    rating: 1650,
    fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7',
    sideToPlay: 'w',
    solutionMovesUci: ['d3h7', 'g8h7', 'f3g5'],
    solutionSanDisplay: '1. Bxh7+! Kxh7 2. Ng5+ (Greek Gift)',
    explanation: 'The classic bishop sacrifice demolishes the f7-g7-h7 pawn shield, dragging the defender into the crosshairs of Ng5+ and Qh5.',
    hintLadder: {
      level1Concept: 'Obliterate Black\'s kingside castled pawn shield with a tactical sacrifice.',
      level2FocusZone: 'The h7 pawn square.',
      level3CandidatePiece: 'd3',
      level4DirectMove: 'd3h7 (Bxh7+)'
    }
  }
];
