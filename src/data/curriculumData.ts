import { CurriculumLesson } from '../types';

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  {
    id: 'italian_game',
    title: 'Italian Game: Giuoco Piano',
    ecoCode: 'C50',
    category: 'OPENINGS',
    difficultyLevel: 'BEGINNER',
    summary: 'Classic open game focusing on rapid kingside development and immediate pressure against Black\'s vulnerable f7 square.',
    keyTakeaway: 'Prioritize piece activity and keep the d4 square contested before launching kingside strikes.',
    steps: [
      {
        stepIndex: 1,
        startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        playedMoveUci: 'e2e4',
        playedMoveSan: 'e4',
        conceptTitle: 'Seizing Central Real Estate',
        explanation: 'White stakes an immediate claim to the center (d5 and f5 squares) while opening vital diagonal pathways for the Queen and light-squared Bishop.',
        hintLadder: {
          level1Concept: 'Which pawn advance opens lines for two pieces at once?',
          level2FocusZone: 'Center files (e and d)',
          level3CandidatePiece: 'e2',
          level4DirectMove: 'e2e4 (e4)'
        },
        recommendedArrow: ['e2', 'e4'],
        highlightedSquares: ['d5', 'f5']
      },
      {
        stepIndex: 2,
        startingFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        playedMoveUci: 'g1f3',
        playedMoveSan: 'Nf3',
        conceptTitle: 'Developing with Tempo',
        explanation: 'Never develop aimlessly. Nf3 simultaneously attacks Black\'s e5 pawn and prepares short kingside castling.',
        hintLadder: {
          level1Concept: 'How do you attack Black\'s undefended e5 pawn while developing a minor piece?',
          level2FocusZone: 'Kingside knight development',
          level3CandidatePiece: 'g1',
          level4DirectMove: 'g1f3 (Nf3)'
        },
        recommendedArrow: ['g1', 'f3'],
        highlightedSquares: ['e5']
      },
      {
        stepIndex: 3,
        startingFen: 'r1bqkbnr/pppp1ppp/2n6/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 3',
        playedMoveUci: 'f1c4',
        playedMoveSan: 'Bc4',
        conceptTitle: 'The Italian Bishop on c4',
        explanation: 'The defining move of the Italian Game! The Bishop targets Black\'s f7 square—the only pawn guarded solely by Black\'s King.',
        hintLadder: {
          level1Concept: 'Where can your light-squared Bishop create the strongest geometric crossfire?',
          level2FocusZone: 'The c4 outpost pointing directly at f7',
          level3CandidatePiece: 'f1',
          level4DirectMove: 'f1c4 (Bc4)'
        },
        recommendedArrow: ['f1', 'c4'],
        highlightedSquares: ['f7']
      },
      {
        stepIndex: 4,
        startingFen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4',
        playedMoveUci: 'c2c3',
        playedMoveSan: 'c3',
        conceptTitle: 'Preparing the d4 Center Steamroller',
        explanation: 'The move c3 reinforces an upcoming d2-d4 pawn break to establish a majestic classical pawn center.',
        hintLadder: {
          level1Concept: 'How can you prepare a secondary pawn push into the absolute center?',
          level2FocusZone: 'Supporting the d4 square',
          level3CandidatePiece: 'c2',
          level4DirectMove: 'c2c3 (c3)'
        },
        recommendedArrow: ['c2', 'c3'],
        highlightedSquares: ['d4']
      }
    ]
  },
  {
    id: 'sicilian_defense_intro',
    title: 'Sicilian Defense: Dynamic Asymmetry',
    ecoCode: 'B20',
    category: 'OPENINGS',
    difficultyLevel: 'INTERMEDIATE',
    summary: 'The highest-scoring counter to 1.e4. Black fights for the center from the flank, aiming for queenside counterplay and an asymmetrical imbalance.',
    keyTakeaway: 'Trade the c-pawn for White\'s d-pawn to gain a central pawn majority and an open c-file.',
    steps: [
      {
        stepIndex: 1,
        startingFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        playedMoveUci: 'c7c5',
        playedMoveSan: 'c5',
        conceptTitle: 'Flank Control of d4',
        explanation: 'By pushing ...c5, Black controls the d4 square without mirroring White\'s e4 pawn, creating rich dynamic counter-attacking potential.',
        hintLadder: {
          level1Concept: 'Control d4 with a flank pawn advance.',
          level2FocusZone: 'c-file advance',
          level3CandidatePiece: 'c7',
          level4DirectMove: 'c7c5 (c5)'
        },
        recommendedArrow: ['c7', 'c5'],
        highlightedSquares: ['d4']
      },
      {
        stepIndex: 2,
        startingFen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
        playedMoveUci: 'd7d6',
        playedMoveSan: 'd6',
        conceptTitle: 'Fortifying the Center',
        explanation: '2...d6 stops White\'s e4-e5 advance and prepares knights and bishops for flexible Najdorf or Classical deployments.',
        hintLadder: {
          level1Concept: 'Solidify central squares before committing knights.',
          level2FocusZone: 'Pawn anchor',
          level3CandidatePiece: 'd7',
          level4DirectMove: 'd7d6 (d6)'
        },
        recommendedArrow: ['d7', 'd6'],
        highlightedSquares: ['e5']
      }
    ]
  },
  {
    id: 'pawn_endgame_principles',
    title: 'Endgame Mastery: The Square of the Pawn',
    ecoCode: 'ENDGAME',
    category: 'ENDGAMES',
    difficultyLevel: 'BEGINNER',
    summary: 'Master mental calculation of king-pawn foot races without moving a single piece.',
    keyTakeaway: 'If the defending king can step inside the square of the passer, it catches the pawn; otherwise, promotion is inevitable.',
    steps: [
      {
        stepIndex: 1,
        startingFen: '8/8/8/3P4/8/8/8/K1k5 w - - 0 1',
        playedMoveUci: 'd5d6',
        playedMoveSan: 'd6',
        conceptTitle: 'Pushing the Passed Pawn',
        explanation: 'Push the passer forward immediately. Every step shrinks the boundary square, leaving the enemy King stranded in the dust.',
        hintLadder: {
          level1Concept: 'Advance your passed pawn without delay.',
          level2FocusZone: 'The d-file passer',
          level3CandidatePiece: 'd5',
          level4DirectMove: 'd5d6 (d6)'
        },
        recommendedArrow: ['d5', 'd6'],
        highlightedSquares: ['d8']
      }
    ]
  }
];
