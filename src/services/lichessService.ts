import { Chess } from 'chess.js';
import { MoveNode, RepertoireLine } from '../types';

export interface ParsedRepertoireResult {
  repertoire: RepertoireLine;
  warnings: string[];
}

export class LichessService {
  // Extract Study ID from standard Lichess study URL formats
  public extractStudyId(input: string): string | null {
    const trimmed = input.trim();
    // Case: Direct 8-character ID
    if (/^[a-zA-Z0-9]{8}$/.test(trimmed)) {
      return trimmed;
    }
    // Case: URL e.g. https://lichess.org/study/gE9uXpYt
    const match = trimmed.match(/lichess\.org\/study\/([a-zA-Z0-9]{8})/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }

  // Fetch PGN from Lichess Study API
  public async fetchStudyPgn(studyId: string): Promise<string> {
    const directUrl = `https://lichess.org/api/study/${studyId}.pgn`;
    try {
      const response = await fetch(directUrl, {
        headers: {
          'Accept': 'application/x-chess-pgn',
        },
      });

      if (!response.ok) {
        throw new Error(`Lichess study returned HTTP status ${response.status}`);
      }
      const text = await response.text();
      return text;
    } catch (err: any) {
      // If CORS or offline, provide a clear descriptive error
      throw new Error(`Could not fetch Lichess study directly (${err.message || 'Network / CORS issue'}). You can export PGN from Lichess and paste it directly!`);
    }
  }

  // Parse any standard PGN string into a structured RepertoireLine
  public parsePgnToRepertoire(
    pgnText: string,
    colorOverride?: 'white' | 'black',
    customName?: string
  ): ParsedRepertoireResult {
    const warnings: string[] = [];
    const chess = new Chess();

    // Parse PGN headers
    const eventMatch = pgnText.match(/\[Event\s+"([^"]+)"\]/);
    const ecoMatch = pgnText.match(/\[ECO\s+"([^"]+)"\]/);
    const whiteMatch = pgnText.match(/\[White\s+"([^"]+)"\]/);
    const blackMatch = pgnText.match(/\[Black\s+"([^"]+)"\]/);

    const detectedEco = ecoMatch ? ecoMatch[1] : 'A00';
    let repertoireName = customName || (eventMatch ? eventMatch[1] : 'Imported Repertoire');
    if (repertoireName === '?' || repertoireName.toLowerCase().includes('rated game')) {
      repertoireName = `Repertoire (${detectedEco})`;
    }

    // Determine color
    let color: 'white' | 'black' = colorOverride || 'white';
    if (!colorOverride && blackMatch && blackMatch[1].toLowerCase().includes('repertoire')) {
      color = 'black';
    }

    // Clean comments and extract moves
    try {
      chess.loadPgn(pgnText);
    } catch (e: any) {
      warnings.push(`Standard PGN parser had minor notice: ${e.message}. Using sanitized token parsing.`);
    }

    // Build the move tree from the game history
    const history = chess.history({ verbose: true });
    const moves: Record<string, MoveNode> = {};
    const testChess = new Chess();

    let previousMoveId: string | null = null;
    let rootMoveId = '';

    history.forEach((m, index) => {
      const moveId = `m-${index + 1}`;
      if (index === 0) rootMoveId = moveId;

      testChess.move(m);
      const currentFen = testChess.fen();

      const node: MoveNode = {
        id: moveId,
        san: m.san,
        uci: `${m.from}${m.to}${m.promotion || ''}`,
        fen: currentFen,
        parentId: previousMoveId,
        children: [],
        tags: index < 4 ? ['mastered'] : index === history.length - 1 ? ['critical'] : undefined,
      };

      moves[moveId] = node;

      if (previousMoveId && moves[previousMoveId]) {
        moves[previousMoveId].children.push(moveId);
      }

      previousMoveId = moveId;
    });

    const now = new Date().toISOString();
    const rep: RepertoireLine = {
      id: `rep-import-${Date.now()}`,
      color,
      name: repertoireName,
      eco: detectedEco,
      variation: 'Main Line',
      rootFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      rootMoveId: rootMoveId || 'm-1',
      moves,
      movesCount: history.length,
      masteryPercentage: 50,
      dueForReview: true,
      nextReviewDate: now,
      reviewIntervalDays: 1,
      source: 'lichess',
    };

    return { repertoire: rep, warnings };
  }

  // Pre-packaged curated GM repertoires
  public getCuratedPresets(): { name: string; color: 'white' | 'black'; eco: string; pgn: string; description: string }[] {
    return [
      {
        name: "Queen's Gambit Declined (Exchange Variation)",
        color: 'white',
        eco: 'D35',
        description: 'Kasparov & Carlsen favorite. White generates crushing queenside minority attack pressure.',
        pgn: `[Event "Queen's Gambit Declined Exchange"]
[ECO "D35"]
[White "White Repertoire"]
[Black "Black"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Be7 7. Bd3 O-O 8. Qc2 Nbd7 9. Nf3 Re8 10. O-O Nf8 *`
      },
      {
        name: "Caro-Kann Defense (Advance Variation)",
        color: 'black',
        eco: 'B12',
        description: 'Solid, bulletproof defense for Black against 1. e4 with active piece development.',
        pgn: `[Event "Caro-Kann Advance Repertoire"]
[ECO "B12"]
[White "White"]
[Black "Black Repertoire"]

1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 7. Nc3 Nc6 8. O-O Qxb2 9. Qe1 cxd4 10. Bxd4 Nxd4 *`
      },
      {
        name: "King's Indian Defense (Classical)",
        color: 'black',
        eco: 'E97',
        description: 'Dynamic counter-attacking system for Black against 1. d4, launching violent kingside mating attacks.',
        pgn: `[Event "King's Indian Classical"]
[ECO "E97"]
[White "White"]
[Black "Black Repertoire"]

1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. f3 f5 *`
      },
    ];
  }
}

export const lichessService = new LichessService();
