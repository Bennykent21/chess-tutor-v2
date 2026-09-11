import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Trophy,
  Layers,
  Palette
} from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { BoardThemeSelector } from '../components/BoardThemeSelector';
import { globalEngine } from '../services/chessEngine';
import { repertoireStore } from '../services/repertoireStore';
import { chessAudio } from '../services/soundEffects';
import { getStoredBoardTheme, BoardTheme } from '../services/boardThemes';
import { SpacedReviewCard } from '../types';

interface ReviewScreenProps {
  onBackToDashboard: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ onBackToDashboard }) => {
  const [cards, setCards] = useState<SpacedReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [chess] = useState<Chess>(() => new Chess());
  const [playedMove, setPlayedMove] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{
    classification: string;
    loss: number;
    explanation: string;
  } | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => getStoredBoardTheme());

  const loadCards = (forceAll = false) => {
    const due = repertoireStore.getDueReviewCards();
    const all = repertoireStore.getReviewCards();
    setCards(forceAll || due.length === 0 ? all : due);
    setCurrentIndex(0);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (currentCard) {
      chess.load(currentCard.fen);
      setPlayedMove(null);
      setIsCorrect(null);
      setFeedback(null);
      setRevealed(false);
    }
  }, [currentCard, chess]);

  const handleUserMove = (from: string, to: string, promotion = 'q') => {
    if (!currentCard || isCorrect !== null) return;

    try {
      const moveRes = chess.move({ from, to, promotion });
      if (!moveRes) return;

      setPlayedMove(moveRes.san);

      // Check if user played the correct repertoire move
      const correctSan = currentCard.expectedMoveSan;
      const isMatch = moveRes.san.toLowerCase() === correctSan.toLowerCase() ||
                      (moveRes.from + moveRes.to) === currentCard.expectedMoveUci;

      if (isMatch) {
        chessAudio.playSuccess();
        setIsCorrect(true);
        setFeedback({
          classification: 'best',
          loss: 0,
          explanation: `Perfect! ${correctSan} is the exact move prescribed by your repertoire. ${currentCard.explanation}`,
        });
        repertoireStore.recordReviewResult(currentCard.id, true);
      } else {
        chessAudio.playBlunder();
        const classification = globalEngine.classifyMove(currentCard.fen, moveRes.san, correctSan);
        setIsCorrect(false);
        setFeedback({
          classification: classification.classification,
          loss: classification.loss,
          explanation: `You played ${moveRes.san} (${classification.classification}). The intended repertoire move is ${correctSan} (+${classification.loss} cp advantage). ${currentCard.explanation}`,
        });
        repertoireStore.recordReviewResult(currentCard.id, false);
      }
    } catch {
      // Illegal move
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onBackToDashboard();
    }
  };

  const handleReveal = () => {
    setRevealed(true);
    if (!currentCard) return;
    setFeedback({
      classification: 'repertoire',
      loss: 0,
      explanation: `The intended repertoire move is ${currentCard.expectedMoveSan}. ${currentCard.explanation}`,
    });
  };

  if (!currentCard) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center gap-3 animate-in fade-in">
        <Trophy className="w-12 h-12 text-amber-400" />
        <h2 className="text-base font-bold text-slate-100">All Caught Up!</h2>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          You have zero pending blunder cards due today. You can return to your dashboard or practice all repertoire memory cards.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => loadCards(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors"
          >
            Practice All Cards
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const turnText = currentCard.turn === 'w' ? 'White' : 'Black';

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
              Spaced Repetition
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[220px]">
            {currentCard.repertoireName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <BoardThemeSelector
            currentTheme={boardTheme}
            onSelectTheme={setBoardTheme}
          />
          <button
            onClick={onBackToDashboard}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Question prompt card */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-200 block">
            What is {turnText}'s best move in this position?
          </span>
          <span className="text-[11px] text-slate-400">
            Make the move directly on the board
          </span>
        </div>

        {isCorrect === null && !revealed && (
          <button
            onClick={handleReveal}
            className="px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Show Answer</span>
          </button>
        )}
      </div>

      {/* Interactive Board with Selected Theme */}
      <div className="flex justify-center">
        <ChessBoard
          chess={chess}
          onMove={handleUserMove}
          orientation={currentCard.turn === 'w' ? 'white' : 'black'}
          disabled={isCorrect !== null}
          theme={boardTheme}
        />
      </div>

      {/* Immediate Pedagogical Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex flex-col gap-2 animate-in fade-in ${
          isCorrect === true
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : isCorrect === false
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs">
              {isCorrect === true ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correct Repertoire Move!</span>
                </>
              ) : isCorrect === false ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Inaccurate Repertoire Move</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Repertoire Solution</span>
                </>
              )}
            </div>

            <button
              onClick={handleNext}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <span>{currentIndex < cards.length - 1 ? 'Next Card' : 'Finish Session'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-200">
            {feedback.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
