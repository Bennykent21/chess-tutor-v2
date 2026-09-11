import React from 'react';
import { 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Cpu,
  Flame,
  Plus,
  Swords,
  Zap,
  GraduationCap,
  Award
} from 'lucide-react';
import { RepertoireLine, SpacedReviewCard, StockfishConfig } from '../types';
import { InstallAppBanner } from '../components/InstallAppBanner';

interface DashboardScreenProps {
  repertoires: RepertoireLine[];
  dueCards: SpacedReviewCard[];
  engineConfig: StockfishConfig;
  onContinueStudy: (repertoireId: string) => void;
  onStartReview: () => void;
  onStartPractice: () => void;
  onOpenImport: () => void;
  onOpenEngineSettings: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  repertoires,
  dueCards,
  engineConfig,
  onContinueStudy,
  onStartReview,
  onStartPractice,
  onOpenImport,
  onOpenEngineSettings,
  onNavigateTab,
}) => {
  // Identify the most urgent line to study (due for review or lowest mastery)
  const primaryStudyLine = repertoires.find(r => r.dueForReview) || repertoires[0];

  const whiteLines = repertoires.filter(r => r.color === 'white');
  const blackLines = repertoires.filter(r => r.color === 'black');

  const whiteMastery = whiteLines.length > 0
    ? Math.round(whiteLines.reduce((acc, r) => acc + r.masteryPercentage, 0) / whiteLines.length)
    : 0;

  const blackMastery = blackLines.length > 0
    ? Math.round(blackLines.reduce((acc, r) => acc + r.masteryPercentage, 0) / blackLines.length)
    : 0;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Practice vs Engine Callout Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-100">Play vs Stockfish Practice</h2>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                NEW
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Spar against Stockfish from any grandmaster opening position
            </p>
          </div>
        </div>

        <button
          onClick={onStartPractice}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Play Now</span>
        </button>
      </div>

      {/* Integrated Training Hub: Tactics, Curriculum, Placement Assessment */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigateTab('tactics')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3 rounded-2xl flex flex-col items-start text-left transition-all hover:bg-slate-850 group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
            Tactics Dojo
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            Puzzles & Streaks
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('curriculum')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3 rounded-2xl flex flex-col items-start text-left transition-all hover:bg-slate-850 group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
            Curriculum
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            Masterclasses & Hints
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('assessment')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-2xl flex flex-col items-start text-left transition-all hover:bg-slate-850 group"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
            Placement Test
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            5-Q Diagnostic Elo
          </span>
        </button>
      </div>

      {/* Dominant Primary Action Card: Today's Core Repertoire Study */}
      {primaryStudyLine && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Today’s Priority Study
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {primaryStudyLine.eco}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
            {primaryStudyLine.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {primaryStudyLine.variation} • {primaryStudyLine.movesCount} key moves
          </p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Line Retention</span>
              <span className="font-semibold text-slate-200">{primaryStudyLine.masteryPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${primaryStudyLine.masteryPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onContinueStudy(primaryStudyLine.id)}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.99]"
          >
            <Play className="w-4 h-4 text-amber-400 fill-current" />
            <span>Continue Repertoire Study</span>
          </button>
        </div>
      )}

      {/* Spaced Review Queue Notification */}
      {dueCards.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">
                {dueCards.length} Critical Position{dueCards.length > 1 ? 's' : ''} Due
              </h3>
              <p className="text-[11px] text-slate-400">
                Spaced repetition memory deck
              </p>
            </div>
          </div>
          <button
            onClick={onStartReview}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Repertoire Coverage: White & Black */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Repertoire Health
          </h3>
          <button
            onClick={() => onNavigateTab('repertoire')}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
          >
            <span>View All ({repertoires.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* White Repertoire Card */}
          <div 
            onClick={() => onNavigateTab('repertoire')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-400 inline-block" />
                White Lines
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{whiteLines.length}</span>
            </div>
            <div className="text-lg font-bold text-slate-100">{whiteMastery}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-slate-200 h-full rounded-full" style={{ width: `${whiteMastery}%` }} />
            </div>
          </div>

          {/* Black Repertoire Card */}
          <div 
            onClick={() => onNavigateTab('repertoire')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400 inline-block" />
                Black Lines
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{blackLines.length}</span>
            </div>
            <div className="text-lg font-bold text-amber-400">{blackMastery}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${blackMastery}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stockfish Engine Status & Calibration */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-200">Stockfish Engine</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 font-mono font-semibold">
                {engineConfig.targetElo >= 2800 ? 'Max (2850+ GM)' : `${engineConfig.targetElo} ELO`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Depth {engineConfig.depth} plies • UCI Skill Level {engineConfig.skillLevel}/20
            </p>
          </div>
        </div>
        <button
          onClick={onOpenEngineSettings}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          Calibrate & Test
        </button>
      </div>

      {/* Standalone Application Installation Banner */}
      <InstallAppBanner />

      {/* Quick Import Footer Callout */}
      <div className="bg-slate-900/60 border border-dashed border-slate-800 p-3 rounded-xl flex items-center justify-between">
        <span className="text-xs text-slate-400">Want to add your Lichess studies or PGN?</span>
        <button
          onClick={onOpenImport}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import Study</span>
        </button>
      </div>
    </div>
  );
};
