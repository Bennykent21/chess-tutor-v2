import { AssessmentPosition } from '../types';

export const PLACEMENT_QUESTIONS: AssessmentPosition[] = [
  {
    id: 'assess_1_opening',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    topic: 'Opening Principle: Harmony & Development',
    question: 'White to move. Black just played 2...Nc6 defending e5. What is the most principled classical developing move?',
    bestMoveUci: 'f1c4',
    bestMoveSan: 'Bc4',
    plausibleAlternativeUci: 'd1e2',
    plausibleAlternativeSan: 'Qe2',
    bestMoveConcept: 'Bc4 targets the vulnerable f7 square, develops a minor piece actively, and prepares kingside castling.',
    alternativeRefutation: 'Qe2 prematurely blocks the light-squared bishop from developing and misplaces the queen.',
    ratingWeight: 200
  },
  {
    id: 'assess_2_tactics',
    fen: 'r1b1k2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 6',
    topic: 'Tactical Punishment: Free Piece or Counter-attack',
    question: 'Black\'s knight captured on e4. How does White regain initiative and capitalize on kingside control?',
    bestMoveUci: 'c4f7',
    bestMoveSan: 'Bxf7+',
    plausibleAlternativeUci: 'd2d3',
    plausibleAlternativeSan: 'd3',
    bestMoveConcept: 'Bxf7+ strips Black\'s King of castling rights immediately and sets up a devastating tactical recovery.',
    alternativeRefutation: 'd3 is slow and passive, allowing Black\'s knight to comfortably consolidate.',
    ratingWeight: 250
  },
  {
    id: 'assess_3_defense',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    topic: 'Positional Safety: King Safety First',
    question: 'All minor pieces are mobilized. What is White\'s top priority before launching central combat?',
    bestMoveUci: 'e1g1',
    bestMoveSan: 'O-O',
    plausibleAlternativeUci: 'a2a3',
    plausibleAlternativeSan: 'a3',
    bestMoveConcept: 'Castling connects the rooks, safeguards the king, and prepares central pawn breaks like d4.',
    alternativeRefutation: 'a3 is a passive flank waste of tempo when king safety remains unresolved.',
    ratingWeight: 200
  },
  {
    id: 'assess_4_fork',
    fen: 'r1bqk2r/pppp1ppp/8/4n3/2B1P3/2N5/PPPP1PPP/R1BQK2R w KQkq - 0 7',
    topic: 'Calculation: Defending Hanging Pieces',
    question: 'Black knight on e5 attacks your bishop on c4. How do you save the bishop while maintaining diagonal pressure?',
    bestMoveUci: 'c4b3',
    bestMoveSan: 'Bb3',
    plausibleAlternativeUci: 'c4f1',
    plausibleAlternativeSan: 'Bf1',
    bestMoveConcept: 'Bb3 preserves bishop pressure on the critical a2-g8 diagonal while retreating to safety.',
    alternativeRefutation: 'Bf1 is overly timid and buries the bishop back onto its starting square.',
    ratingWeight: 200
  },
  {
    id: 'assess_5_endgame',
    fen: '8/5pk1/6p1/7p/7P/5PK1/6P1/8 w - - 0 1',
    topic: 'Pawn Endgame: The Principle of Opposition',
    question: 'Pawn endgame. Black just played ...Kf6. How does White claim the key central opposition?',
    bestMoveUci: 'g3f4',
    bestMoveSan: 'Kf4',
    plausibleAlternativeUci: 'g2g4',
    plausibleAlternativeSan: 'g4',
    bestMoveConcept: 'Kf4 seizes the direct opposition against Black\'s King, forcing Black backwards or conceding ground.',
    alternativeRefutation: 'g4 prematurely commits pawn structure and creates unnecessary weaknesses on the kingside.',
    ratingWeight: 250
  }
];
