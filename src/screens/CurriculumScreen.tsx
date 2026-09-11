import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Lightbulb, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  Layers,
  GraduationCap,
  Play
} from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { CURRICULUM_LESSONS } from '../data/curriculumData';
import { CurriculumLesson } from '../types';
import { soundEffects } from '../services/soundEffects';
import { VoiceCoachService } from '../services/voiceCoachService';

export const CurriculumScreen: React.FC = () => {
  const [lessons] = useState<CurriculumLesson[]>(CURRICULUM_LESSONS);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeHintLevel, setActiveHintLevel] = useState(0);
  const [boardFen, setBoardFen] = useState('');
  const [isStepCompleted, setIsStepCompleted] = useState(false);

  const activeLesson = lessons[selectedLessonIndex] || lessons[0];
  const activeStep = activeLesson.steps[currentStepIndex] || activeLesson.steps[0];

  useEffect(() => {
    if (activeStep) {
      setBoardFen(activeStep.startingFen);
      setIsStepCompleted(false);
      setActiveHintLevel(0);
    }
  }, [selectedLessonIndex, currentStepIndex]);

  const handleBoardMove = (from: string, to: string, promotion?: string): boolean => {
    const attemptedUci = `${from}${to}${promotion || ''}`;
    if (attemptedUci.toLowerCase().startsWith(activeStep.playedMoveUci.toLowerCase())) {
      // Correct pedagogical move!
      soundEffects.playMove();
      const g = new Chess(activeStep.startingFen);
      g.move({ from, to, promotion: promotion || 'q' });
      setBoardFen(g.fen());
      setIsStepCompleted(true);
      VoiceCoachService.speak(activeStep.explanation);
      return true;
    } else {
      soundEffects.playBlunder();
      return false;
    }
  };

  const handlePlayRecommendedMove = () => {
    const from = activeStep.playedMoveUci.slice(0, 2);
    const to = activeStep.playedMoveUci.slice(2, 4);
    handleBoardMove(from, to);
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeLesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
      {/* Lesson Selector Strip */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => {
                setSelectedLessonIndex(idx);
                setCurrentStepIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLessonIndex === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                  : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {lesson.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lesson Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Board View */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="w-full max-w-[420px]">
            <ChessBoard
              fen={boardFen}
              onMove={handleBoardMove}
              orientation="white"
              isInteractive={!isStepCompleted}
            />
          </div>

          {/* Stepper Navigation */}
          <div className="w-full max-w-[420px] mt-4 flex items-center justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Step {currentStepIndex + 1} of {activeLesson.steps.length}
            </span>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex >= activeLesson.steps.length - 1}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Masterclass Explanations & Coach Card */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {/* Active Step Concept Card */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-amber-400">
              <GraduationCap className="w-4 h-4" />
              <span>Masterclass Concept #{activeStep.stepIndex}</span>
            </div>

            <h2 className="text-base font-bold text-slate-100">
              {activeStep.conceptTitle}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeStep.explanation}
            </p>

            {!isStepCompleted && (
              <button
                onClick={handlePlayRecommendedMove}
                className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Demonstrate Move ({activeStep.playedMoveSan})</span>
              </button>
            )}
          </div>

          {/* Hint Ladder */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Coach Guidance</span>
              </div>
              <span className="text-[11px] text-slate-400">Hint {activeHintLevel} / 4</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {activeHintLevel >= 1 && (
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400 block">Concept:</strong> {activeStep.hintLadder.level1Concept}
                </div>
              )}
              {activeHintLevel >= 2 && (
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400 block">Focus Zone:</strong> {activeStep.hintLadder.level2FocusZone}
                </div>
              )}
              {activeHintLevel >= 3 && (
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-400 block">Piece Candidate:</strong> {activeStep.hintLadder.level3CandidatePiece}
                </div>
              )}
              {activeHintLevel >= 4 && (
                <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
                  <strong className="text-amber-400 block">Play Move:</strong> {activeStep.hintLadder.level4DirectMove}
                </div>
              )}
            </div>

            {activeHintLevel < 4 && (
              <button
                onClick={() => setActiveHintLevel(prev => Math.min(4, prev + 1))}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Reveal Next Hint
              </button>
            )}
          </div>

          {/* Key Takeaway */}
          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-400 block mb-0.5">Lesson Takeaway:</strong>
            {activeLesson.keyTakeaway}
          </div>
        </div>
      </div>
    </div>
  );
};
