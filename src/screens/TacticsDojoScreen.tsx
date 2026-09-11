import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { 
  Zap, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Award,
  ChevronRight,
  Flame,
  Lightbulb
} from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { BUILT_IN_PUZZLES } from '../data/tacticsData';
import { TacticalPuzzle } from '../types';
import { soundEffects } from '../services/soundEffects';
import { VoiceCoachService } from '../services/voiceCoachService';

interface TacticsDojoScreenProps {
  userTacticsRating?: number;
  onRatingUpdate?: (newRating: number) => void;
}

export const TacticsDojoScreen: React.FC<TacticsDojoScreenProps> = ({
  userTacticsRating = 1150,
  onRatingUpdate
}) => {
  const [puzzles] = useState<TacticalPuzzle[]>(BUILT_IN_PUZZLES);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentFen, setCurrentFen] = useState<string>('');
  const [puzzleState, setPuzzleState] = useState<'solving' | 'correct' | 'failed'>('solving');
  const [moveStepIndex, setMoveStepIndex] = useState(0); // Which move in the solution sequence
  const [userRating, setUserRating] = useState(userTacticsRating);
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  const currentPuzzle = puzzles[currentPuzzleIndex] || puzzles[0];

  // Initialize current puzzle
  useEffect(() => {
    if (currentPuzzle) {
      setCurrentFen(currentPuzzle.fen);
      setPuzzleState('solving');
      setMoveStepIndex(0);
      setActiveHintLevel(0);
      setFeedbackMessage(null);
    }
  }, [currentPuzzleIndex, currentPuzzle]);

  const toggleVoice = () => {
    const next = !isVoiceOn;
    setIsVoiceOn(next);
    VoiceCoachService.setVoiceEnabled(next);
  };

  const handleUserMove = (from: string, to: string, promotion?: string): boolean => {
    if (puzzleState !== 'solving') return false;

    const game = new Chess(currentFen);
    const moveAttemptUci = `${from}${to}${promotion || ''}`;

    // Validate legal move
    const legalMove = game.move({ from, to, promotion: promotion || 'q' });
    if (!legalMove) return false;

    // Check if this matches the expected solution move at the current step
    const expectedMoveUci = currentPuzzle.solutionMovesUci[moveStepIndex];

    if (moveAttemptUci.toLowerCase().startsWith(expectedMoveUci.toLowerCase())) {
      // Correct user move!
      soundEffects.playMove();
      const nextFen = game.fen();
      setCurrentFen(nextFen);

      const nextStepIndex = moveStepIndex + 1;

      // Check if there is an opponent reply move in the puzzle
      if (nextStepIndex < currentPuzzle.solutionMovesUci.length) {
        setMoveStepIndex(nextStepIndex);
        setFeedbackMessage('Great move! Watch the opponent\'s response...');

        // Play opponent response after brief delay
        setTimeout(() => {
          const replyUci = currentPuzzle.solutionMovesUci[nextStepIndex];
          const replyFrom = replyUci.slice(0, 2);
          const replyTo = replyUci.slice(2, 4);
          const replyPromotion = replyUci.length > 4 ? replyUci.slice(4, 5) : undefined;

          const gameAfterReply = new Chess(nextFen);
          gameAfterReply.move({ from: replyFrom, to: replyTo, promotion: replyPromotion || 'q' });
          soundEffects.playCapture();
          setCurrentFen(gameAfterReply.fen());
          setMoveStepIndex(nextStepIndex + 1);

          // If the reply was the final move in sequence, puzzle solved
          if (nextStepIndex + 1 >= currentPuzzle.solutionMovesUci.length) {
            handlePuzzleSolved();
          } else {
            setFeedbackMessage('Your turn: deliver the decisive follow-up!');
          }
        }, 600);
      } else {
        // Solved immediately
        handlePuzzleSolved();
      }

      return true;
    } else {
      // Incorrect move
      soundEffects.playBlunder();
      setPuzzleState('failed');
      setFeedbackMessage('Incorrect move. The tactical advantage slips away. Try again or check the hint ladder.');
      VoiceCoachService.speakCoachFeedback('blunder');
      setStreak(0);
      return false;
    }
  };

  const handlePuzzleSolved = () => {
    soundEffects.playVictory();
    setPuzzleState('correct');
    setFeedbackMessage('Puzzle Solved! ' + currentPuzzle.explanation);
    VoiceCoachService.speakCoachFeedback('correct');

    const newRating = userRating + 15;
    const newStreak = streak + 1;
    setUserRating(newRating);
    setStreak(newStreak);
    setSolvedCount(prev => prev + 1);
    if (onRatingUpdate) onRatingUpdate(newRating);

    if (newStreak > 0 && newStreak % 3 === 0) {
      setTimeout(() => {
        VoiceCoachService.speakCoachFeedback('streak');
      }, 1200);
    }
  };

  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      setCurrentPuzzleIndex(0); // Loop back
    }
  };

  const handleRetry = () => {
    setCurrentFen(currentPuzzle.fen);
    setPuzzleState('solving');
    setMoveStepIndex(0);
    setFeedbackMessage(null);
  };

  const handleProgressiveHint = () => {
    if (activeHintLevel < 4) {
      const nextLevel = activeHintLevel + 1;
      setActiveHintLevel(nextLevel);
      if (nextLevel === 1) {
        VoiceCoachService.speak(currentPuzzle.hintLadder.level1Concept);
      } else if (nextLevel === 2) {
        VoiceCoachService.speak(currentPuzzle.hintLadder.level2FocusZone);
      }
    }
  };

  const sideToPlay = currentPuzzle.sideToPlay === 'w' ? 'White' : 'Black';

  return (
    <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100">Tactics Dojo</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentPuzzle.themeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Targeted pattern recognition calibrated to your tactical rating
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Rating:</span>
            <span className="font-bold text-amber-300 font-mono">{userRating}</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="font-bold text-orange-300 font-mono">{streak} 🔥</span>
          </div>

          <button
            onClick={toggleVoice}
            className={`p-2 rounded-xl border transition-colors ${
              isVoiceOn 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={isVoiceOn ? 'Voice Coach Active' : 'Voice Coach Muted'}
          >
            {isVoiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Board Container */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/40 p-3 sm:p-5 rounded-2xl border border-slate-800">
          <div className="w-full max-w-[440px]">
            <ChessBoard
              fen={currentFen}
              onMove={handleUserMove}
              orientation={currentPuzzle.sideToPlay === 'w' ? 'white' : 'black'}
              isInteractive={puzzleState === 'solving'}
              lastMove={undefined}
            />
          </div>

          <div className="w-full max-w-[440px] mt-3 flex items-center justify-between text-xs px-1 text-slate-400">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentPuzzle.sideToPlay === 'w' ? 'bg-white' : 'bg-slate-700'}`} />
              <span className="font-semibold text-slate-200">{sideToPlay} to Move</span>
            </div>
            <span className="text-slate-400 text-[11px]">Puzzle Rating: <strong className="text-amber-400 font-mono">{currentPuzzle.rating}</strong></span>
          </div>
        </div>

        {/* Tactical Control Panel & Hint Ladder */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {/* Status / Feedback Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            puzzleState === 'correct' 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : puzzleState === 'failed'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/70 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
              {puzzleState === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {puzzleState === 'failed' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {puzzleState === 'solving' && <Lightbulb className="w-5 h-5 text-amber-400" />}
              
              <span>
                {puzzleState === 'correct' ? 'Solved!' : puzzleState === 'failed' ? 'Incorrect Move' : currentPuzzle.title}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              {feedbackMessage || currentPuzzle.explanation}
            </p>

            {puzzleState !== 'solving' && (
              <div className="mt-4 flex items-center gap-2">
                {puzzleState === 'failed' && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
                <button
                  onClick={handleNextPuzzle}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40"
                >
                  <span>Next Puzzle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 4-Level Progressive Hint Ladder */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Coach Hint Ladder</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Level {activeHintLevel} of 4
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {activeHintLevel >= 1 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400 block mb-0.5">1. Strategic Concept:</strong>
                  {currentPuzzle.hintLadder.level1Concept}
                </div>
              )}
              {activeHintLevel >= 2 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400 block mb-0.5">2. Focus Zone:</strong>
                  {currentPuzzle.hintLadder.level2FocusZone}
                </div>
              )}
              {activeHintLevel >= 3 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400 block mb-0.5">3. Candidate Piece:</strong>
                  Square: <span className="font-mono text-amber-300 font-bold uppercase">{currentPuzzle.hintLadder.level3CandidatePiece}</span>
                </div>
              )}
              {activeHintLevel >= 4 && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200">
                  <strong className="text-amber-400 block mb-0.5">4. Direct Solution:</strong>
                  {currentPuzzle.solutionSanDisplay}
                </div>
              )}
            </div>

            {puzzleState === 'solving' && activeHintLevel < 4 && (
              <button
                onClick={handleProgressiveHint}
                className="w-full mt-1 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {activeHintLevel === 0 ? 'Request Level 1 Hint (Concept)' : `Unlock Level ${activeHintLevel + 1} Hint`}
                </span>
              </button>
            )}
          </div>

          {/* Quick theme explanation */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Tactical Theme:</span>{' '}
            {currentPuzzle.themeLabel} teaches you to exploit unprotected tactical weaknesses, winning decisive material.
          </div>
        </div>
      </div>
    </div>
  );
};
