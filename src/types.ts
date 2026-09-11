// Core data models for Chess Tutor Repertoire & Engine

export type PieceColor = 'w' | 'b';

export interface MoveNode {
  id: string;
  san: string;
  uci: string;
  fen: string;
  comment?: string;
  nag?: string; // e.g. ! (Good), ? (Mistake), !? (Interesting)
  parentId: string | null;
  children: string[]; // move IDs
  tags?: ('critical' | 'novelty' | 'trap' | 'mastered' | 'weak')[];
  evalCentipawns?: number;
  bestMove?: string;
}

export interface RepertoireLine {
  id: string;
  color: 'white' | 'black';
  name: string;
  eco: string; // e.g. C50, B90
  variation: string; // e.g. Giuoco Piano, Main Line
  rootFen: string;
  moves: Record<string, MoveNode>; // map of move id to node
  rootMoveId: string;
  movesCount: number;
  masteryPercentage: number; // 0 - 100
  dueForReview: boolean;
  nextReviewDate: string; // ISO string
  reviewIntervalDays: number;
  lastStudied?: string;
  source: 'lichess' | 'pgn' | 'custom' | 'preset';
  sourceUrl?: string;
}

export interface StockfishConfig {
  skillLevel: number; // 0 to 20
  targetElo: number; // 800 to 2850
  depth: number; // 4 to 20
  threads: number;
  contempt: number; // -100 to 100
  isCalibrated: boolean;
}

export interface EngineEvaluation {
  score: number; // in centipawns from White's perspective (+100 = +1.00)
  mateIn?: number; // moves to mate if any (+3 White mates in 3, -2 Black mates in 2)
  bestMove: {
    from: string;
    to: string;
    san: string;
    uci: string;
  } | null;
  pv: string[]; // principal variation line
  depth: number;
  nodesPerSecond?: number;
  classification?: 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  centipawnLoss?: number;
  isEvaluating: boolean;
}

export interface SpacedReviewCard {
  id: string;
  repertoireId: string;
  repertoireName: string;
  fen: string;
  turn: 'w' | 'b';
  expectedMoveSan: string;
  expectedMoveUci: string;
  lastPlayedBlunderSan?: string;
  explanation: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  dueDate: string;
}

export interface OpeningPreset {
  id: string;
  name: string;
  eco: string;
  category: '1.e4 Openings' | '1.d4 Openings' | 'Indian Defenses' | 'Flank & Gambits';
  movesSan: string[];
  description: string;
  keyThemes: string[];
  recommendedColor: 'white' | 'black';
}

export interface PracticeMoveHistoryItem {
  san: string;
  from: string;
  to: string;
  fen: string;
  by: 'user' | 'engine';
  evalCentipawns?: number;
  timeSpentSec?: number;
  classification?: 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
}

// Tactics Dojo Types
export type TacticalThemeType = 'FORK' | 'PIN' | 'SKEWER' | 'BACK_RANK' | 'DISCOVERED_ATTACK' | 'ENDGAME' | 'SACRIFICE';

export interface HintLadder {
  level1Concept: string;
  level2FocusZone: string;
  level3CandidatePiece: string; // e.g. 'c4'
  level4DirectMove: string; // e.g. 'c4f7' or 'Bxf7+'
}

export interface TacticalPuzzle {
  id: string;
  title: string;
  theme: TacticalThemeType;
  themeLabel: string;
  rating: number; // 900 - 2000
  fen: string;
  sideToPlay: 'w' | 'b';
  solutionMovesUci: string[]; // sequence of moves [player, opponent, player, ...]
  solutionSanDisplay: string;
  explanation: string;
  hintLadder: HintLadder;
}

// Assessment Placement Types
export interface AssessmentPosition {
  id: string;
  fen: string;
  topic: string;
  question: string;
  bestMoveUci: string;
  bestMoveSan: string;
  plausibleAlternativeUci: string;
  plausibleAlternativeSan: string;
  bestMoveConcept: string;
  alternativeRefutation: string;
  ratingWeight: number;
}

export interface AssessmentResult {
  score: number;
  total: number;
  calculatedElo: number;
  completedAt: string;
  recommendedFocus: string;
}

// Curriculum Types
export interface LessonStep {
  stepIndex: number;
  startingFen: string;
  playedMoveUci: string;
  playedMoveSan: string;
  conceptTitle: string;
  explanation: string;
  hintLadder: HintLadder;
  recommendedArrow?: [string, string]; // [from, to]
  highlightedSquares?: string[];
}

export interface CurriculumLesson {
  id: string;
  title: string;
  ecoCode: string;
  category: 'OPENINGS' | 'TACTICS' | 'ENDGAMES' | 'PAWN_STRUCTURE';
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  summary: string;
  keyTakeaway: string;
  steps: LessonStep[];
}

// Chess.com Game Import Types
export interface ChessComGameItem {
  url?: string;
  pgn?: string;
  time_control?: string;
  end_time?: number;
  rated?: boolean;
  time_class?: string;
  white?: { username?: string; rating?: number; result?: string };
  black?: { username?: string; rating?: number; result?: string };
  fen?: string;
}

