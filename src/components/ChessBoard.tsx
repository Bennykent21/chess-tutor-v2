import React, { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import { BoardTheme, BOARD_THEMES, getStoredBoardTheme } from '../services/boardThemes';
import { chessAudio } from '../services/soundEffects';

export interface ChessBoardProps {
  chess?: Chess;
  fen?: string;
  onMove: (from: string, to: string, promotion?: string) => void | boolean | Promise<boolean>;
  orientation?: 'white' | 'black';
  bestMove?: { from: string; to: string } | null;
  lastMove?: { from: string; to: string } | null;
  disabled?: boolean;
  isInteractive?: boolean;
  theme?: BoardTheme;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess: propChess,
  fen,
  onMove,
  orientation = 'white',
  bestMove,
  lastMove,
  disabled = false,
  isInteractive,
  theme = getStoredBoardTheme(),
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Derive effective chess instance safely
  const effectiveChess = useMemo(() => {
    if (propChess) return propChess;
    try {
      if (fen) return new Chess(fen);
    } catch (e) {
      console.error('Invalid FEN passed to ChessBoard:', fen, e);
    }
    return new Chess();
  }, [propChess, fen]);

  const isDisabled = disabled || (isInteractive !== undefined ? !isInteractive : false);

  const board = effectiveChess.board();

  // Compute legal moves for the selected square
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      const moves = effectiveChess.moves({ square: selectedSquare as Square, verbose: true });
      return moves.map(m => m.to);
    } catch {
      return [];
    }
  }, [effectiveChess, selectedSquare]);

  const inCheck = effectiveChess.inCheck();
  const turn = effectiveChess.turn();

  // Find king in check
  const checkedKingSquare = useMemo(() => {
    if (!inCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return `${String.fromCharCode(97 + c)}${8 - r}`;
        }
      }
    }
    return null;
  }, [board, inCheck, turn]);

  const handleSquareClick = (square: string) => {
    if (isDisabled || pendingPromotion) return;

    // If no piece is selected yet
    if (!selectedSquare) {
      const piece = effectiveChess.get(square as Square);
      if (piece && piece.color === effectiveChess.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    // Deselect if clicking the same square
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If clicking another friendly piece, switch selection
    const pieceOnTarget = effectiveChess.get(square as Square);
    if (pieceOnTarget && pieceOnTarget.color === effectiveChess.turn()) {
      setSelectedSquare(square);
      return;
    }

    // Check if target square is legal
    if (legalDestinations.includes(square)) {
      const movingPiece = effectiveChess.get(selectedSquare as Square);
      const isPawnPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && square.endsWith('8')) ||
         (movingPiece.color === 'b' && square.endsWith('1')));

      if (isPawnPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
      } else {
        const isCapture = Boolean(pieceOnTarget) || (movingPiece?.type === 'p' && selectedSquare[0] !== square[0]);
        if (isCapture) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }
        onMove(selectedSquare, square);
        setSelectedSquare(null);
      }
    } else {
      setSelectedSquare(null);
    }
  };

  const handlePromotionChoice = (promotionPiece: string) => {
    if (pendingPromotion) {
      chessAudio.playMove();
      onMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  // Generate ranks and files based on orientation
  const ranks = orientation === 'white' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="relative aspect-square w-full max-w-[500px] mx-auto select-none rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((r) =>
          files.map((c) => {
            const squareName = `${String.fromCharCode(97 + c)}${r + 1}`;
            const piece = board[7 - r][c];
            const isDark = (r + c) % 2 === 0;

            const isSelected = selectedSquare === squareName;
            const isLegalTarget = legalDestinations.includes(squareName);
            const isCheckedKing = checkedKingSquare === squareName;
            const isLastMove = lastMove?.from === squareName || lastMove?.to === squareName;
            const isBestMoveSource = bestMove?.from === squareName;
            const isBestMoveDest = bestMove?.to === squareName;

            // Compute background color using theme
            let squareBg = isDark ? theme.darkSquare : theme.lightSquare;
            if (isLastMove) {
              squareBg = isDark ? theme.highlightDark : theme.highlightLight;
            }
            if (isSelected) {
              squareBg = isDark ? '#b45309' : '#f59e0b';
            }
            if (isCheckedKing) {
              squareBg = '#dc2626';
            }

            return (
              <div
                key={squareName}
                onClick={() => handleSquareClick(squareName)}
                style={{ backgroundColor: squareBg }}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                  isDisabled ? 'cursor-not-allowed' : ''
                }`}
              >
                {/* Board Notation Labels */}
                {c === (orientation === 'white' ? 0 : 7) && (
                  <span
                    className="absolute top-0.5 left-1 text-[9px] font-bold select-none opacity-60"
                    style={{ color: isDark ? theme.lightSquare : theme.darkSquare }}
                  >
                    {r + 1}
                  </span>
                )}
                {r === (orientation === 'white' ? 0 : 7) && (
                  <span
                    className="absolute bottom-0.5 right-1 text-[9px] font-bold select-none opacity-60"
                    style={{ color: isDark ? theme.lightSquare : theme.darkSquare }}
                  >
                    {String.fromCharCode(97 + c)}
                  </span>
                )}

                {/* Best Move Hint Arrows / Dots */}
                {isBestMoveSource && (
                  <div className="absolute inset-0 border-2 border-emerald-400/80 pointer-events-none rounded-sm" />
                )}
                {isBestMoveDest && (
                  <div className="absolute inset-0 bg-emerald-500/30 border-2 border-emerald-400 pointer-events-none rounded-sm" />
                )}

                {/* Legal Move Destination Marker */}
                {isLegalTarget && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {piece ? (
                      <div className="w-full h-full border-4 border-amber-400/70 rounded-full scale-90" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-900/40 border border-amber-400/60" />
                    )}
                  </div>
                )}

                {/* Chess Piece Vector SVG */}
                {piece && (
                  <div className="w-[85%] h-[85%] flex items-center justify-center transition-transform hover:scale-105 pointer-events-none z-0">
                    <ChessPieceSvg type={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal Overlay */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              Promote Pawn
            </span>
            <div className="flex items-center gap-2">
              {['q', 'r', 'b', 'n'].map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionChoice(pType)}
                  className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center p-2 transition-transform hover:scale-110 active:scale-95"
                >
                  <ChessPieceSvg
                    type={pType}
                    color={effectiveChess.turn()}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
