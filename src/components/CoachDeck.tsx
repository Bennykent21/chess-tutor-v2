import React, { useState } from 'react';
import { Sparkles, Lightbulb, ChevronRight, HelpCircle, ShieldAlert } from 'lucide-react';
import { EngineEvaluation } from '../types';

interface CoachDeckProps {
  evaluation: EngineEvaluation | null;
  repertoireHint?: string;
  onShowBestMove?: () => void;
}

export const CoachDeck: React.FC<CoachDeckProps> = ({
  evaluation,
  repertoireHint,
  onShowBestMove,
}) => {
  const [hintTier, setHintTier] = useState<number>(0);

  const bestMoveSan = evaluation?.bestMove?.san || 'Be3';

  // Dynamic 4-tier pedagogical hints
  const getHintContent = () => {
    switch (hintTier) {
      case 1:
        return {
          title: 'Tier 1: Strategic Concept',
          text: repertoireHint || 'Identify the piece that is either undefended or under multiple tactical pressures in black’s camp.',
        };
      case 2:
        return {
          title: 'Tier 2: Focus Zone',
          text: 'Concentrate on the central d- and e-files or key outposts near the opponent king.',
        };
      case 3:
        return {
          title: 'Tier 3: Candidate Piece',
          text: evaluation?.bestMove 
            ? `Look closely at your ${evaluation.bestMove.san.startsWith('N') ? 'Knight' : evaluation.bestMove.san.startsWith('B') ? 'Bishop' : evaluation.bestMove.san.startsWith('R') ? 'Rook' : evaluation.bestMove.san.startsWith('Q') ? 'Queen' : 'Pawn'}.`
            : 'Find the active minor piece that controls the greatest number of forward squares.',
        };
      case 4:
        return {
          title: 'Tier 4: Direct Move',
          text: `Calibrated Stockfish & Repertoire recommend: ${bestMoveSan}!`,
        };
      default:
        return {
          title: 'Concept-First Coach',
          text: repertoireHint || 'Think about your core opening principle: piece activity, king safety, and controlling critical central outposts.',
        };
    }
  };

  const currentHint = getHintContent();

  const handleNextHint = () => {
    setHintTier(prev => {
      const next = Math.min(4, prev + 1);
      if (next === 4 && onShowBestMove) {
        onShowBestMove();
      }
      return next;
    });
  };

  const handleResetHint = () => {
    setHintTier(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pedagogical Coach</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <span>Tier {hintTier}/4</span>
          {hintTier > 0 && (
            <button 
              onClick={handleResetHint}
              className="text-slate-500 hover:text-slate-300 ml-1 text-[10px] underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 min-h-[56px] flex flex-col justify-center">
        <span className="text-[10px] font-semibold text-amber-400/90 block mb-0.5">
          {currentHint.title}
        </span>
        <p className="text-xs text-slate-200 leading-relaxed">
          {currentHint.text}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={handleNextHint}
          disabled={hintTier >= 4}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            hintTier >= 4
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{hintTier === 0 ? 'Request Hint' : hintTier === 3 ? 'Reveal Exact Move' : 'Deeper Hint'}</span>
        </button>
      </div>
    </div>
  );
};
