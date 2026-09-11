import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  FlipHorizontal, 
  Settings2, 
  Sparkles, 
  Cpu,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Swords,
  Plus,
  Share2
} from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { EvaluationBar } from '../components/EvaluationBar';
import { MoveTree } from '../components/MoveTree';
import { CoachDeck } from '../components/CoachDeck';
import { BoardThemeSelector } from '../components/BoardThemeSelector';
import { globalEngine } from '../services/chessEngine';
import { repertoireStore } from '../services/repertoireStore';
import { chessAudio } from '../services/soundEffects';
import { getStoredBoardTheme, BoardTheme } from '../services/boardThemes';
import { RepertoireLine, EngineEvaluation, StockfishConfig } from '../types';

interface StudyBoardScreenProps {
  repertoire: RepertoireLine;
  engineConfig: StockfishConfig;
  onOpenEngineSettings: () => void;
  onBackToRepertoire: () => void;
}

interface MoveHistoryItem {
  san: string;
  from: string;
  to: string;
  fen: string;
  classification?: 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
  centipawnLoss?: number;
  comment?: string;
}

export const StudyBoardScreen: React.FC<StudyBoardScreenProps> = ({
  repertoire,
  engineConfig,
  onOpenEngineSettings,
  onBackToRepertoire,
}) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [orientation, setOrientation] = useState<'white' | 'black'>(repertoire.color);
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);
  const [showBestMoveHint, setShowBestMoveHint] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => getStoredBoardTheme());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sparringMode, setSparringMode] = useState<boolean>(false);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);

  // Initialize board with the repertoire moves
  useEffect(() => {
    chess.reset();
    const history: MoveHistoryItem[] = [];

    let currentId: string | null = repertoire.rootMoveId;
    while (currentId && repertoire.moves[currentId]) {
      const node = repertoire.moves[currentId];
      try {
        const moveRes = chess.move(node.san);
        if (moveRes) {
          history.push({
            san: node.san,
            from: moveRes.from,
            to: moveRes.to,
            fen: chess.fen(),
            comment: node.comment,
            classification: 'book',
          });
        }
      } catch {}
      currentId = node.children.length > 0 ? node.children[0] : null;
    }

    setMoveHistory(history);
    setCurrentMoveIndex(history.length - 1);
    setFen(chess.fen());
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    }
  }, [repertoire, chess]);

  // Run asynchronous Stockfish evaluation whenever the position changes
  useEffect(() => {
    let isCurrent = true;
    setEvaluation(prev => prev ? { ...prev, isEvaluating: true } : null);

    globalEngine.evaluate(fen).then((evalResult) => {
      if (isCurrent) {
        setEvaluation(evalResult);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [fen]);

  // Sparring: If opponent turn and Sparring Mode is ON, make Stockfish play
  useEffect(() => {
    if (!sparringMode || chess.isGameOver() || isEngineThinking) return;

    const currentTurnColor = chess.turn() === 'w' ? 'white' : 'black';
    const isOpponentTurn = currentTurnColor !== orientation;

    if (isOpponentTurn) {
      setIsEngineThinking(true);
      const timer = setTimeout(async () => {
        const evalRes = await globalEngine.evaluate(chess.fen());
        if (evalRes.bestMove) {
          try {
            const moveRes = chess.move({
              from: evalRes.bestMove.from,
              to: evalRes.bestMove.to,
            });

            if (moveRes) {
              const newFen = chess.fen();
              setFen(newFen);
              setLastMove({ from: moveRes.from, to: moveRes.to });

              if (moveRes.captured) {
                chessAudio.playCapture();
              } else {
                chessAudio.playMove();
              }

              const engineItem: MoveHistoryItem = {
                san: moveRes.san,
                from: moveRes.from,
                to: moveRes.to,
                fen: newFen,
                classification: 'best',
                comment: `Stockfish (${engineConfig.targetElo} Elo) played ${moveRes.san}`,
              };

              setMoveHistory(prev => [...prev, engineItem]);
              setCurrentMoveIndex(prev => prev + 1);
            }
          } catch {}
        }
        setIsEngineThinking(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [fen, sparringMode, chess, orientation, engineConfig, isEngineThinking]);

  // Handle user piece move on the board
  const handleUserMove = useCallback((from: string, to: string, promotion = 'q') => {
    if (isEngineThinking) return;

    try {
      const moveRes = chess.move({ from, to, promotion });
      if (!moveRes) return;

      const newFen = chess.fen();
      setFen(newFen);
      setLastMove({ from, to });

      if (chess.inCheck()) {
        chessAudio.playCheck();
      }

      // Compare played move against calibrated Stockfish best move
      const currentBest = evaluation?.bestMove?.san || moveRes.san;
      const analysis = globalEngine.classifyMove(fen, moveRes.san, currentBest);

      const newItem: MoveHistoryItem = {
        san: moveRes.san,
        from,
        to,
        fen: newFen,
        classification: analysis.classification,
        centipawnLoss: analysis.loss,
        comment: analysis.explanation,
      };

      // Record mistake in spaced review deck if blunder or mistake
      if (analysis.classification === 'blunder' || analysis.classification === 'mistake') {
        repertoireStore.addMistakeToReview({
          repertoireId: repertoire.id,
          repertoireName: repertoire.name,
          fen,
          turn: chess.turn() === 'b' ? 'w' : 'b',
          expectedMoveSan: currentBest,
          expectedMoveUci: evaluation?.bestMove ? `${evaluation.bestMove.from}${evaluation.bestMove.to}` : '',
          lastPlayedBlunderSan: moveRes.san,
          explanation: analysis.explanation,
        });
      }

      setMoveHistory(prev => {
        const sliced = prev.slice(0, currentMoveIndex + 1);
        return [...sliced, newItem];
      });
      setCurrentMoveIndex(prev => prev + 1);
    } catch {
      // Illegal move rejected
    }
  }, [chess, fen, evaluation, currentMoveIndex, repertoire, isEngineThinking]);

  // Jump to specific move in tree
  const handleJumpToMove = (targetIndex: number) => {
    if (targetIndex < -1 || targetIndex >= moveHistory.length) return;

    chess.reset();
    for (let i = 0; i <= targetIndex; i++) {
      chess.move(moveHistory[i].san);
    }
    setFen(chess.fen());
    setCurrentMoveIndex(targetIndex);

    if (targetIndex >= 0) {
      setLastMove({ from: moveHistory[targetIndex].from, to: moveHistory[targetIndex].to });
    } else {
      setLastMove(null);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    chessAudio.setSoundEnabled(next);
  };

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-200">
      {/* Header bar with line name, back button, and engine calibration indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRepertoire}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Back to Repertoire"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[200px] sm:max-w-none">
                {repertoire.name}
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-850 text-amber-400 font-semibold">
                {repertoire.eco}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{repertoire.variation}</p>
          </div>
        </div>

        {/* Engine status indicator & settings button */}
        <button
          onClick={onOpenEngineSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px] font-bold text-amber-400">{engineConfig.targetElo}</span>
          <Settings2 className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      {/* Main Board Area with Evaluation Bar */}
      <div className="flex gap-2 sm:gap-3 items-stretch justify-center">
        {/* Calibrated Stockfish Evaluation Bar */}
        <EvaluationBar
          evaluation={evaluation}
          orientation={orientation}
        />

        {/* Interactive Chessboard */}
        <div className="flex-1 max-w-[460px]">
          <ChessBoard
            chess={chess}
            onMove={handleUserMove}
            orientation={orientation}
            bestMove={showBestMoveHint ? evaluation?.bestMove : null}
            lastMove={lastMove}
            theme={boardTheme}
            disabled={isEngineThinking}
          />
        </div>
      </div>

      {/* Navigation, Theme Selector, Sound & Sparring Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <div className="flex items-center gap-1">
          {/* Board Theme Selector */}
          <BoardThemeSelector
            currentTheme={boardTheme}
            onSelectTheme={setBoardTheme}
          />

          {/* Flip Board */}
          <button
            onClick={() => setOrientation(prev => prev === 'white' ? 'black' : 'white')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Flip Board Orientation"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Best Move Toggle */}
          <button
            onClick={() => setShowBestMoveHint(prev => !prev)}
            className={`p-1.5 rounded-lg transition-colors ${
              showBestMoveHint ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Toggle Stockfish Best Move Arrow"
          >
            {showBestMoveHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Spar with Stockfish Mode Toggle */}
          <button
            onClick={() => setSparringMode(!sparringMode)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              sparringMode 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
            }`}
            title="When active, Stockfish plays the opponent moves automatically"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{sparringMode ? 'Sparring ON' : 'Spar Bot'}</span>
          </button>
        </div>

        {/* Step Forward / Backward controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleJumpToMove(-1)}
            disabled={currentMoveIndex < 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleJumpToMove(currentMoveIndex - 1)}
            disabled={currentMoveIndex < 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous Move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">
            {currentMoveIndex + 1} / {moveHistory.length}
          </span>
          <button
            onClick={() => handleJumpToMove(currentMoveIndex + 1)}
            disabled={currentMoveIndex >= moveHistory.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Next Move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pedagogical Hint Ladder */}
      <CoachDeck
        evaluation={evaluation}
        repertoireHint={currentMoveIndex >= 0 ? moveHistory[currentMoveIndex]?.comment : undefined}
        onShowBestMove={() => setShowBestMoveHint(true)}
      />

      {/* Move Tree Component */}
      <MoveTree
        moves={moveHistory}
        currentMoveIndex={currentMoveIndex}
        onSelectMove={handleJumpToMove}
        repertoireName={repertoire.name}
        eco={repertoire.eco}
      />
    </div>
  );
};
