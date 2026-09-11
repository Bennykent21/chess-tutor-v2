import React from 'react';
import { Tag, Sparkles, AlertCircle } from 'lucide-react';

interface MoveHistoryItem {
  san: string;
  from: string;
  to: string;
  fen: string;
  classification?: 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
  centipawnLoss?: number;
  comment?: string;
  tags?: string[];
}

interface MoveTreeProps {
  moves: MoveHistoryItem[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  repertoireName?: string;
  eco?: string;
}

export const MoveTree: React.FC<MoveTreeProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  repertoireName,
  eco,
}) => {
  // Format into pairs of moves (1. e4 e5, 2. Nf3 Nc6)
  const movePairs: { moveNumber: number; white: MoveHistoryItem | null; black: MoveHistoryItem | null; whiteIndex: number; blackIndex: number }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i] || null,
      black: moves[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  const getBadgeForClassification = (c?: string) => {
    switch (c) {
      case 'best':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 font-medium">Best</span>;
      case 'excellent':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950/70 text-emerald-400 font-medium">Ex</span>;
      case 'good':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Good</span>;
      case 'inaccuracy':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-400 font-medium">?!</span>;
      case 'mistake':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-orange-950 text-orange-400 font-medium">?</span>;
      case 'blunder':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-rose-950 text-rose-400 font-medium">??</span>;
      case 'book':
        return <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-950 text-indigo-300 font-medium">Book</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 h-full">
      {/* Header with Repertoire Family & ECO */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Tag className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-semibold text-slate-200 truncate">{repertoireName || 'Main Line Tree'}</span>
        </div>
        {eco && (
          <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
            {eco}
          </span>
        )}
      </div>

      {/* Move notation list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[160px] sm:max-h-[220px]">
        {movePairs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">Starting position</p>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.moveNumber} className="flex items-center text-xs gap-1 font-mono">
              <span className="w-7 text-slate-500 text-[11px] select-none text-right mr-1">
                {pair.moveNumber}.
              </span>

              {/* White Move */}
              {pair.white && (
                <button
                  onClick={() => onSelectMove(pair.whiteIndex)}
                  className={`flex-1 flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                    currentMoveIndex === pair.whiteIndex
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span>{pair.white.san}</span>
                  {getBadgeForClassification(pair.white.classification)}
                </button>
              )}

              {/* Black Move */}
              {pair.black ? (
                <button
                  onClick={() => onSelectMove(pair.blackIndex)}
                  className={`flex-1 flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                    currentMoveIndex === pair.blackIndex
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span>{pair.black.san}</span>
                  {getBadgeForClassification(pair.black.classification)}
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Current move note / pedagogical comment */}
      {currentMoveIndex >= 0 && moves[currentMoveIndex]?.comment && (
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded-lg">
          <span className="font-semibold text-amber-400 block mb-0.5">Repertoire Idea:</span>
          {moves[currentMoveIndex].comment}
        </div>
      )}
    </div>
  );
};
