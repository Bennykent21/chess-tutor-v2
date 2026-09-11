import React from 'react';
import { EngineEvaluation } from '../types';

interface EvaluationBarProps {
  evaluation: EngineEvaluation | null;
  orientation?: 'white' | 'black';
  heightClass?: string;
  showScoreLabel?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  orientation = 'white',
  heightClass = 'h-full min-h-[300px]',
  showScoreLabel = true,
}) => {
  const score = evaluation?.score ?? 0;
  const isEvaluating = evaluation?.isEvaluating ?? false;

  // Convert centipawns to percentage (sigmoid clamp for chess evaluations)
  // Logistic sigmoid formula: 1 / (1 + 10^(-cp / 400))
  // Clamping between -1500 and +1500 allows deep tactical advantages to visibly push the bar
  const clampedCp = Math.max(-1500, Math.min(1500, score));
  const whitePercent = Math.round(100 / (1 + Math.pow(10, -clampedCp / 400)));

  // Display text: e.g. "+1.2", "-0.8", "M3"
  let displayText = '0.0';
  if (evaluation?.mateIn !== undefined) {
    displayText = evaluation.mateIn > 0 ? `M${evaluation.mateIn}` : `-M${Math.abs(evaluation.mateIn)}`;
  } else if (score > 0) {
    displayText = `+${(score / 100).toFixed(1)}`;
  } else if (score < 0) {
    displayText = `${(score / 100).toFixed(1)}`;
  }

  // Adjust for orientation
  const barFillPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Top score readout */}
      {showScoreLabel && (
        <span 
          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
            score > 50 
              ? 'bg-slate-100 text-slate-900' 
              : score < -50 
                ? 'bg-slate-850 text-slate-200 border border-slate-750' 
                : 'bg-slate-800 text-slate-300'
          }`}
          title={`Evaluation: ${displayText} (Centipawns: ${score})`}
        >
          {displayText}
        </span>
      )}

      {/* Main Bar */}
      <div 
        className={`w-6 sm:w-7 bg-slate-950 border border-slate-700/80 rounded-lg overflow-hidden flex flex-col justify-end relative shadow-inner ${heightClass}`}
        title={`Stockfish Evaluation: ${displayText} (Depth ${evaluation?.depth || 12})`}
      >
        {/* Black's portion (top) */}
        <div 
          className="w-full bg-slate-850 transition-all duration-200 ease-out flex items-start justify-center pt-1"
          style={{ height: `${100 - barFillPercent}%` }}
        >
          {barFillPercent < 85 && (
            <span className="text-[9px] font-mono font-bold text-slate-400 transform -rotate-90 select-none pointer-events-none">
              {orientation === 'white' && score < -50 ? displayText : ''}
              {orientation === 'black' && score > 50 ? displayText : ''}
            </span>
          )}
        </div>

        {/* Center equality guide line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-600/60 pointer-events-none" />

        {/* White's portion (bottom) */}
        <div 
          className="w-full bg-slate-100 transition-all duration-200 ease-out flex items-end justify-center pb-1"
          style={{ height: `${barFillPercent}%` }}
        >
          {barFillPercent > 15 && (
            <span className="text-[9px] font-mono font-bold text-slate-900 transform -rotate-90 select-none pointer-events-none">
              {orientation === 'white' && score >= -50 ? displayText : ''}
              {orientation === 'black' && score <= 50 ? displayText : ''}
            </span>
          )}
        </div>

        {/* Pulse effect if calculating */}
        {isEvaluating && (
          <div className="absolute inset-0 bg-amber-400/15 animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
};
