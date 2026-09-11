import { RepertoireLine, MoveNode, SpacedReviewCard } from '../types';

const STORAGE_KEY_REPERTOIRE = 'chess_tutor_repertoires_v2';
const STORAGE_KEY_REVIEWS = 'chess_tutor_spaced_reviews_v2';

// Seed preset repertoires
const DEFAULT_WHITE_ITALIAN: RepertoireLine = {
  id: 'rep-white-italian',
  color: 'white',
  name: 'Italian Game (Giuoco Piano)',
  eco: 'C50',
  variation: 'Main Line & Quiet Center',
  rootFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  rootMoveId: 'm1',
  movesCount: 12,
  masteryPercentage: 82,
  dueForReview: true,
  nextReviewDate: new Date().toISOString(),
  reviewIntervalDays: 2,
  lastStudied: 'Yesterday',
  source: 'preset',
  moves: {
    'm1': {
      id: 'm1',
      san: 'e4',
      uci: 'e2e4',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      parentId: null,
      children: ['m2'],
      comment: 'Control the center and open diagonals for the Queen and light-squared Bishop.',
      tags: ['mastered'],
    },
    'm2': {
      id: 'm2',
      san: 'e5',
      uci: 'e7e5',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      parentId: 'm1',
      children: ['m3'],
      comment: 'Open game symmetry.',
    },
    'm3': {
      id: 'm3',
      san: 'Nf3',
      uci: 'g1f3',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
      parentId: 'm2',
      children: ['m4'],
      comment: 'Developing with tempo against the e5 pawn.',
      tags: ['mastered'],
    },
    'm4': {
      id: 'm4',
      san: 'Nc6',
      uci: 'b8c6',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      parentId: 'm3',
      children: ['m5'],
      comment: 'Defending e5 naturally.',
    },
    'm5': {
      id: 'm5',
      san: 'Bc4',
      uci: 'f1c4',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
      parentId: 'm4',
      children: ['m6'],
      comment: 'The hallmark Italian Bishop targeting f7, black’s weakest point before castling.',
      tags: ['critical', 'mastered'],
    },
    'm6': {
      id: 'm6',
      san: 'Bc5',
      uci: 'f8c5',
      fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      parentId: 'm5',
      children: ['m7'],
      comment: 'Giuoco Piano setup.',
    },
    'm7': {
      id: 'm7',
      san: 'c3',
      uci: 'c2c3',
      fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4',
      parentId: 'm6',
      children: ['m8'],
      comment: 'Preparing the central push d4 to establish a classical pawn center.',
      tags: ['critical'],
    },
    'm8': {
      id: 'm8',
      san: 'Nf6',
      uci: 'g8f6',
      fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5',
      parentId: 'm7',
      children: ['m9'],
      comment: 'Counter-attacking e4.',
    },
    'm9': {
      id: 'm9',
      san: 'd3',
      uci: 'd2d3',
      fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R b KQkq - 0 5',
      parentId: 'm8',
      children: [],
      comment: 'Giuoco Pianissimo: solid, pawn-protected center allowing castling and Bg5 pins.',
      tags: ['mastered'],
    },
  },
};

const DEFAULT_BLACK_SICILIAN: RepertoireLine = {
  id: 'rep-black-sicilian',
  color: 'black',
  name: 'Sicilian Defense (Najdorf)',
  eco: 'B90',
  variation: 'Classical & English Attack Counter',
  rootFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  rootMoveId: 's1',
  movesCount: 10,
  masteryPercentage: 64,
  dueForReview: true,
  nextReviewDate: new Date().toISOString(),
  reviewIntervalDays: 1,
  lastStudied: '3 days ago',
  source: 'preset',
  moves: {
    's1': {
      id: 's1',
      san: 'e4',
      uci: 'e2e4',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      parentId: null,
      children: ['s2'],
      comment: 'King’s Pawn.',
    },
    's2': {
      id: 's2',
      san: 'c5',
      uci: 'c7c5',
      fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
      parentId: 's1',
      children: ['s3'],
      comment: 'The fighting Sicilian: asymmetrical fight for the center with d-file prospects.',
      tags: ['critical', 'mastered'],
    },
    's3': {
      id: 's3',
      san: 'Nf3',
      uci: 'g1f3',
      fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
      parentId: 's2',
      children: ['s4'],
      comment: 'Open Sicilian preparation.',
    },
    's4': {
      id: 's4',
      san: 'd6',
      uci: 'd7d6',
      fen: 'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
      parentId: 's3',
      children: ['s5'],
      comment: 'Prevents e5 pushes and opens the c8 bishop.',
    },
    's5': {
      id: 's5',
      san: 'd4',
      uci: 'd2d4',
      fen: 'rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3',
      parentId: 's4',
      children: ['s6'],
      comment: 'White breaks open the center.',
    },
    's6': {
      id: 's6',
      san: 'cxd4',
      uci: 'c5d4',
      fen: 'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
      parentId: 's5',
      children: ['s7'],
      comment: 'Securing the semi-open c-file for Black.',
    },
    's7': {
      id: 's7',
      san: 'Nxd4',
      uci: 'f3d4',
      fen: 'rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4',
      parentId: 's6',
      children: ['s8'],
      comment: 'Recapturing with knight.',
    },
    's8': {
      id: 's8',
      san: 'Nf6',
      uci: 'g8f6',
      fen: 'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5',
      parentId: 's7',
      children: ['s9'],
      comment: 'Attacks e4, forcing White’s knight to defend.',
    },
    's9': {
      id: 's9',
      san: 'Nc3',
      uci: 'b1c3',
      fen: 'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5',
      parentId: 's8',
      children: ['s10'],
      comment: 'Standard defense of e4.',
    },
    's10': {
      id: 's10',
      san: 'a6',
      uci: 'a7a6',
      fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
      parentId: 's9',
      children: [],
      comment: 'The definitive Najdorf move! Controls b5, prepares ...b5 expansion and queenside counterplay.',
      tags: ['critical', 'weak'],
    },
  },
};

const DEFAULT_REVIEW_CARDS: SpacedReviewCard[] = [
  {
    id: 'rev-1',
    repertoireId: 'rep-white-italian',
    repertoireName: 'Italian Game (C50)',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    turn: 'w',
    expectedMoveSan: 'Bc4',
    expectedMoveUci: 'f1c4',
    lastPlayedBlunderSan: 'Bb5 (Spanish mistake)',
    explanation: 'In your Italian repertoire, 3. Bc4 targets the weak f7 square immediately, unlike Bb5 (Ruy Lopez).',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 1,
    dueDate: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    repertoireId: 'rep-white-italian',
    repertoireName: 'Italian Game (C50)',
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    turn: 'w',
    expectedMoveSan: 'c3',
    expectedMoveUci: 'c2c3',
    lastPlayedBlunderSan: 'O-O?!',
    explanation: '4. c3 is key! It prepares the central steamroller d2-d4 while keeping your pawn structure flexible.',
    intervalDays: 2,
    easeFactor: 2.3,
    repetitions: 2,
    dueDate: new Date().toISOString(),
  },
  {
    id: 'rev-3',
    repertoireId: 'rep-black-sicilian',
    repertoireName: 'Sicilian Najdorf (B90)',
    fen: 'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5',
    turn: 'b',
    expectedMoveSan: 'a6',
    expectedMoveUci: 'a7a6',
    lastPlayedBlunderSan: 'e6?!',
    explanation: '5... a6 prevents White knights/bishops invading b5 and lays the foundation for Black’s queenside attack.',
    intervalDays: 1,
    easeFactor: 2.1,
    repetitions: 1,
    dueDate: new Date().toISOString(),
  },
];

export class RepertoireStore {
  private repertoires: RepertoireLine[] = [];
  private reviewCards: SpacedReviewCard[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedReps = localStorage.getItem(STORAGE_KEY_REPERTOIRE);
      if (savedReps) {
        this.repertoires = JSON.parse(savedReps);
      } else {
        this.repertoires = [DEFAULT_WHITE_ITALIAN, DEFAULT_BLACK_SICILIAN];
        this.saveRepertoires();
      }

      const savedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (savedReviews) {
        this.reviewCards = JSON.parse(savedReviews);
      } else {
        this.reviewCards = DEFAULT_REVIEW_CARDS;
        this.saveReviews();
      }
    } catch {
      this.repertoires = [DEFAULT_WHITE_ITALIAN, DEFAULT_BLACK_SICILIAN];
      this.reviewCards = DEFAULT_REVIEW_CARDS;
    }
  }

  public getRepertoires(color?: 'white' | 'black'): RepertoireLine[] {
    if (color) {
      return this.repertoires.filter(r => r.color === color);
    }
    return [...this.repertoires];
  }

  public getRepertoireById(id: string): RepertoireLine | undefined {
    return this.repertoires.find(r => r.id === id);
  }

  public getReviewCards(): SpacedReviewCard[] {
    return [...this.reviewCards];
  }

  public getDueReviewCards(): SpacedReviewCard[] {
    const now = new Date().getTime();
    return this.reviewCards.filter(c => new Date(c.dueDate).getTime() <= now);
  }

  public addRepertoire(rep: RepertoireLine) {
    this.repertoires.push(rep);
    this.saveRepertoires();
  }

  public updateRepertoire(updated: RepertoireLine) {
    this.repertoires = this.repertoires.map(r => r.id === updated.id ? updated : r);
    this.saveRepertoires();
  }

  public deleteRepertoire(id: string) {
    this.repertoires = this.repertoires.filter(r => r.id !== id);
    this.reviewCards = this.reviewCards.filter(c => c.repertoireId !== id);
    this.saveRepertoires();
    this.saveReviews();
  }

  public recordReviewResult(cardId: string, isCorrect: boolean) {
    const cardIndex = this.reviewCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = { ...this.reviewCards[cardIndex] };
    if (isCorrect) {
      card.repetitions += 1;
      card.intervalDays = Math.round(card.intervalDays * card.easeFactor);
      card.easeFactor = Math.min(2.8, card.easeFactor + 0.1);
    } else {
      card.repetitions = 0;
      card.intervalDays = 1;
      card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.intervalDays);
    card.dueDate = nextDate.toISOString();

    this.reviewCards[cardIndex] = card;
    this.saveReviews();
  }

  public addMistakeToReview(card: Omit<SpacedReviewCard, 'id' | 'repetitions' | 'intervalDays' | 'easeFactor' | 'dueDate'>) {
    const existing = this.reviewCards.find(c => c.fen === card.fen);
    if (existing) {
      existing.intervalDays = 1;
      existing.dueDate = new Date().toISOString();
      if (card.lastPlayedBlunderSan) {
        existing.lastPlayedBlunderSan = card.lastPlayedBlunderSan;
      }
      this.saveReviews();
      return;
    }

    const newCard: SpacedReviewCard = {
      ...card,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
    };
    this.reviewCards.unshift(newCard);
    this.saveReviews();
  }

  public addCustomMistakeCard(
    repertoireName: string,
    fen: string,
    turn: 'w' | 'b',
    expectedMoveSan: string,
    lastPlayedBlunderSan: string,
    explanation: string
  ) {
    this.addMistakeToReview({
      repertoireId: 'custom-practice',
      repertoireName,
      fen,
      turn,
      expectedMoveSan,
      expectedMoveUci: '',
      lastPlayedBlunderSan,
      explanation,
    });
  }

  private saveRepertoires() {
    try {
      localStorage.setItem(STORAGE_KEY_REPERTOIRE, JSON.stringify(this.repertoires));
    } catch {}
  }

  private saveReviews() {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.reviewCards));
    } catch {}
  }
}

export const repertoireStore = new RepertoireStore();
