import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShieldAlert, 
  Trophy, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { PLACEMENT_QUESTIONS } from '../data/assessmentData';
import { AssessmentPosition } from '../types';
import { soundEffects } from '../services/soundEffects';
import { VoiceCoachService } from '../services/voiceCoachService';

interface AssessmentScreenProps {
  onAssessmentCompleted: (calculatedRating: number) => void;
  onCancel: () => void;
}

export const AssessmentScreen: React.FC<AssessmentScreenProps> = ({
  onAssessmentCompleted,
  onCancel
}) => {
  const [questions] = useState<AssessmentPosition[]>(PLACEMENT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [earnedEloPoints, setEarnedEloPoints] = useState(700); // Baseline 700 + weighted points
  const [answers, setAnswers] = useState<Record<number, { isCorrect: boolean; chosenMoveUci: string }>>({});
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
  const [selectedMoveFeedback, setSelectedMoveFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [boardFen, setBoardFen] = useState(questions[0]?.fen || '');

  const currentQ = questions[currentIndex] || questions[0];

  const handleChooseMove = (chosenUci: string) => {
    if (isQuestionAnswered) return;

    const isCorrect = chosenUci.toLowerCase() === currentQ.bestMoveUci.toLowerCase();

    // Play move on board
    try {
      const g = new Chess(currentQ.fen);
      const from = chosenUci.slice(0, 2);
      const to = chosenUci.slice(2, 4);
      g.move({ from, to, promotion: 'q' });
      setBoardFen(g.fen());
    } catch (e) {
      console.warn('Move preview error', e);
    }

    if (isCorrect) {
      soundEffects.playVictory();
      setUserScore(prev => prev + 1);
      setEarnedEloPoints(prev => prev + currentQ.ratingWeight);
      VoiceCoachService.speakCoachFeedback('correct');
      setSelectedMoveFeedback({
        isCorrect: true,
        explanation: currentQ.bestMoveConcept
      });
    } else {
      soundEffects.playBlunder();
      VoiceCoachService.speakCoachFeedback('blunder');
      setSelectedMoveFeedback({
        isCorrect: false,
        explanation: currentQ.alternativeRefutation
      });
    }

    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { isCorrect, chosenMoveUci: chosenUci }
    }));
    setIsQuestionAnswered(true);
  };

  const handleBoardMove = (from: string, to: string, promotion?: string): boolean => {
    if (isQuestionAnswered) return false;
    const moveUci = `${from}${to}${promotion || ''}`;
    handleChooseMove(moveUci);
    return true;
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setBoardFen(questions[nextIdx].fen);
      setIsQuestionAnswered(false);
      setSelectedMoveFeedback(null);
    } else {
      // Finished all 5 questions
      setIsCompleted(true);
    }
  };

  const calculatedFinalRating = Math.min(1850, Math.max(800, earnedEloPoints));

  if (isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-950/40">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          Calibration Complete
        </span>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">
          Diagnostic Rating Placed
        </h2>

        <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 w-full">
          <div className="text-4xl font-extrabold font-mono text-amber-400 mb-1">
            {calculatedFinalRating} ELO
          </div>
          <p className="text-xs text-slate-400">
            Score: <strong className="text-slate-200">{userScore} / {questions.length} Correct</strong> ({Math.round((userScore / questions.length) * 100)}%)
          </p>
        </div>

        <div className="text-left w-full space-y-2 mb-6 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <strong className="text-slate-100 block mb-1">Recommended Sparring Tier:</strong>
            {calculatedFinalRating < 1100 ? 'Casual 1000 Bot — Focus on hanging pieces & basic pins.' :
             calculatedFinalRating < 1400 ? 'Intermediate 1200 Bot — Focus on central pawn breaks & pawn forks.' :
             calculatedFinalRating < 1600 ? 'Club 1400 Bot — Study opening repertoire move trees & rook endgames.' :
             'Advanced 1600+ Bot — Deep positional calculation & Greek gift conversions.'}
          </div>
        </div>

        <button
          onClick={() => onAssessmentCompleted(calculatedFinalRating)}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>Apply Calibration & Start Training</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Top Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Skill Placement Assessment</h1>
            <p className="text-xs text-slate-400">Diagnostic position {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors"
        >
          Exit
        </button>
      </div>

      {/* Main Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Board View */}
        <div className="md:col-span-7 flex flex-col items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="w-full max-w-[400px]">
            <ChessBoard
              fen={boardFen}
              onMove={handleBoardMove}
              orientation="white"
              isInteractive={!isQuestionAnswered}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Drag your piece directly on the board, or tap one of the candidate options on the right.
          </p>
        </div>

        {/* Question & Options */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
              {currentQ.topic}
            </span>
            <h2 className="text-sm font-bold text-slate-100 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Move Choices */}
          <div className="space-y-2">
            <button
              onClick={() => handleChooseMove(currentQ.bestMoveUci)}
              disabled={isQuestionAnswered}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                isQuestionAnswered && selectedMoveFeedback?.isCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 mr-2">Candidate A:</span>
                <span className="text-sm font-bold">{currentQ.bestMoveSan}</span>
              </div>
              {isQuestionAnswered && selectedMoveFeedback?.isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              onClick={() => handleChooseMove(currentQ.plausibleAlternativeUci)}
              disabled={isQuestionAnswered}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                isQuestionAnswered && !selectedMoveFeedback?.isCorrect
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-100'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 mr-2">Candidate B:</span>
                <span className="text-sm font-bold">{currentQ.plausibleAlternativeSan}</span>
              </div>
              {isQuestionAnswered && !selectedMoveFeedback?.isCorrect && (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </button>
          </div>

          {/* Explanation Callout */}
          {selectedMoveFeedback && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              selectedMoveFeedback.isCorrect 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}>
              <strong className="block font-bold mb-1">
                {selectedMoveFeedback.isCorrect ? '✓ Principled Choice:' : '✕ Tactical Trap:'}
              </strong>
              {selectedMoveFeedback.explanation}
            </div>
          )}

          {isQuestionAnswered && (
            <button
              onClick={handleNext}
              className="mt-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-950/40"
            >
              <span>{currentIndex < questions.length - 1 ? 'Next Position' : 'See Assessment Results'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
