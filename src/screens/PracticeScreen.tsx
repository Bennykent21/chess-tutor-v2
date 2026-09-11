import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import {
  Swords,
  Play,
  RotateCcw,
  Sparkles,
  Flag,
  Lightbulb,
  Clock,
  Sliders,
  ChevronRight,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  RefreshCw,
  Cpu,
  BookmarkPlus,
} from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { EvaluationBar } from '../components/EvaluationBar';
import { BoardThemeSelector } from '../components/BoardThemeSelector';
import { EngineSettingsModal } from '../components/EngineSettingsModal';
import { OPENINGS_LIBRARY } from '../data/openingsLibrary';
import { OpeningPreset, StockfishConfig, EngineEvaluation, PracticeMoveHistoryItem } from '../types';
import { globalEngine } from '../services/chessEngine';
import { ChessAudio, chessAudio } from '../services/soundEffects';
import { repertoireStore } from '../services/repertoireStore';

export const PracticeScreen: React.FC = () => {
  // Opening Selection State
  const [selectedOpening, setSelectedOpening] = useState<OpeningPreset>(OPENINGS_LIBRARY[1]); // Default to Italian Game
  const [isOpeningPickerOpen, setIsOpeningPickerOpen] = useState<boolean>(false);
  const [openingSearchQuery, setOpeningSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Match Configuration
  const [userColor, setUserColor] = useState<'white' | 'black'>('white');
  const [engineConfig, setEngineConfig] = useState<StockfishConfig>(() => globalEngine.getConfig());
  const [isEngineSettingsOpen, setIsEngineSettingsOpen] = useState<boolean>(false);
  const [timeControlMin, setTimeControlMin] = useState<number>(0); // 0 = unlimited / casual
  const [coachMode, setCoachMode] = useState<boolean>(true); // Shows eval bar & hints

  // Chess Game State
  const [chess] = useState<Chess>(() => new Chess());
  const [boardFen, setBoardFen] = useState<string>(chess.fen());
  const [moveHistory, setMoveHistory] = useState<PracticeMoveHistoryItem[]>([]);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout';
    winner?: 'user' | 'engine' | 'draw';
    description?: string;
  }>({ status: 'playing' });

  // Evaluation & Clocks
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);
  const [hint, setHint] = useState<{ san: string; uci: string; clue: string; level: number } | null>(null);
  const [userTimeSec, setUserTimeSec] = useState<number>(0);
  const [engineTimeSec, setEngineTimeSec] = useState<number>(0);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);
  const [blundersSaved, setBlundersSaved] = useState<boolean>(false);

  // Material Tracker
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);

  // Sound Engine
  const audioRef = useRef<ChessAudio | null>(chessAudio);
  useEffect(() => {
    audioRef.current = chessAudio;
  }, []);

  // Quick Engine Tier Switcher
  const handleSetEngineTier = useCallback((elo: number) => {
    const updated = globalEngine.calibrateElo(elo);
    setEngineConfig(updated);
    globalEngine.evaluate(chess.fen()).then((ev) => setEvaluation(ev));
  }, [chess]);

  // Compute captured pieces from current board state
  const updateCapturedPieces = useCallback(() => {
    const counts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentCounts: Record<string, { w: number; b: number }> = {
      p: { w: 0, b: 0 },
      n: { w: 0, b: 0 },
      b: { w: 0, b: 0 },
      r: { w: 0, b: 0 },
      q: { w: 0, b: 0 },
    };

    const board = chess.board();
    for (const row of board) {
      for (const piece of row) {
        if (piece && piece.type !== 'k') {
          currentCounts[piece.type][piece.color]++;
        }
      }
    }

    const whiteCaptured: string[] = [];
    const blackCaptured: string[] = [];

    (['p', 'n', 'b', 'r', 'q'] as (keyof typeof counts)[]).forEach((type) => {
      const missingBlack = counts[type] - currentCounts[type].b;
      for (let i = 0; i < missingBlack; i++) whiteCaptured.push(type);

      const missingWhite = counts[type] - currentCounts[type].w;
      for (let i = 0; i < missingWhite; i++) blackCaptured.push(type);
    });

    setCapturedByWhite(whiteCaptured);
    setCapturedByBlack(blackCaptured);
  }, [chess]);

  // Start or restart game from the chosen opening
  const initializeGame = useCallback(
    (opening: OpeningPreset, playerColor: 'white' | 'black') => {
      chess.reset();
      const historyItems: PracticeMoveHistoryItem[] = [];

      // Apply initial opening moves
      try {
        for (const san of opening.movesSan) {
          const moveRes = chess.move(san);
          if (moveRes) {
            historyItems.push({
              san: moveRes.san,
              from: moveRes.from,
              to: moveRes.to,
              fen: chess.fen(),
              by: 'user', // Book move
              classification: 'book',
            });
          }
        }
      } catch (err) {
        console.error('Error applying opening moves:', err);
      }

      setBoardFen(chess.fen());
      setMoveHistory(historyItems);
      setGameResult({ status: 'playing' });
      setHint(null);
      setBlundersSaved(false);

      if (timeControlMin > 0) {
        setUserTimeSec(timeControlMin * 60);
        setEngineTimeSec(timeControlMin * 60);
        setIsClockRunning(true);
      } else {
        setIsClockRunning(false);
      }

      updateCapturedPieces();

      // Trigger initial evaluation
      globalEngine.evaluate(chess.fen()).then((ev) => setEvaluation(ev));

      // Check if it is the engine's turn right away
      const currentTurn = chess.turn();
      const engineTurnColor = playerColor === 'white' ? 'b' : 'w';

      if (currentTurn === engineTurnColor) {
        triggerEngineMove();
      }
    },
    [chess, timeControlMin, updateCapturedPieces]
  );

  // Trigger engine calculation and move
  const triggerEngineMove = useCallback(async () => {
    if (chess.isGameOver() || gameResult.status !== 'playing') return;

    setIsEngineThinking(true);
    const startFen = chess.fen();

    try {
      const evalResult = await globalEngine.evaluate(startFen);
      setEvaluation(evalResult);

      if (evalResult && evalResult.bestMove && chess.fen() === startFen) {
        const moveRes = chess.move({
          from: evalResult.bestMove.from as Square,
          to: evalResult.bestMove.to as Square,
          promotion: 'q',
        });

        if (moveRes) {
          // Play appropriate sound
          if (chess.isCheckmate()) {
            chessAudio.playCheckmate();
          } else if (chess.inCheck()) {
            chessAudio.playCheck();
          } else if (moveRes.captured) {
            chessAudio.playCapture();
          } else {
            chessAudio.playMove();
          }

          const currentBoardFen = chess.fen();
          setBoardFen(currentBoardFen);
          setMoveHistory((prev) => [
            ...prev,
            {
              san: moveRes.san,
              from: moveRes.from,
              to: moveRes.to,
              fen: currentBoardFen,
              by: 'engine',
              evalCentipawns: evalResult.score,
              classification: 'best',
            },
          ]);
          updateCapturedPieces();

          // Immediately update evaluation for player's turn
          globalEngine.evaluate(currentBoardFen).then((ev) => setEvaluation(ev));

          // Check for game end conditions
          checkGameStatus();
        }
      }
    } catch (e) {
      console.error('Engine move error:', e);
    } finally {
      setIsEngineThinking(false);
    }
  }, [chess, gameResult.status, updateCapturedPieces]);

  // Check game termination status
  const checkGameStatus = useCallback(() => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === (userColor === 'white' ? 'w' : 'b') ? 'engine' : 'user';
      setGameResult({
        status: 'checkmate',
        winner,
        description: winner === 'user' ? 'Checkmate! You won!' : 'Checkmate! Stockfish won.',
      });
      setIsClockRunning(false);
    } else if (chess.isStalemate()) {
      setGameResult({
        status: 'stalemate',
        winner: 'draw',
        description: 'Stalemate! Game drawn.',
      });
      setIsClockRunning(false);
    } else if (chess.isDraw()) {
      setGameResult({
        status: 'draw',
        winner: 'draw',
        description: 'Game drawn by repetition or insufficient material.',
      });
      setIsClockRunning(false);
    }
  }, [chess, userColor]);

  // User Move Handler
  const handleUserMove = useCallback(
    async (from: Square, to: Square) => {
      if (isEngineThinking || gameResult.status !== 'playing') return false;

      const playerTurn = userColor === 'white' ? 'w' : 'b';
      if (chess.turn() !== playerTurn) return false;

      const prevFen = chess.fen();
      let moveRes = null;

      try {
        moveRes = chess.move({ from, to, promotion: 'q' });
      } catch {
        return false;
      }

      if (!moveRes) return false;

      // Move audio
      if (chess.isCheckmate()) {
        chessAudio.playCheckmate();
      } else if (chess.inCheck()) {
        chessAudio.playCheck();
      } else if (moveRes.captured) {
        chessAudio.playCapture();
      } else {
        chessAudio.playMove();
      }

      const newFen = chess.fen();
      setBoardFen(newFen);
      setHint(null);

      // Classify user move if evaluation is available
      let classification: PracticeMoveHistoryItem['classification'] = 'good';
      if (evaluation?.bestMove) {
        const checkClass = globalEngine.classifyMove(prevFen, moveRes.san, evaluation.bestMove.san);
        classification = checkClass.classification;
      }

      const historyItem: PracticeMoveHistoryItem = {
        san: moveRes.san,
        from: moveRes.from,
        to: moveRes.to,
        fen: newFen,
        by: 'user',
        classification,
      };

      setMoveHistory((prev) => [...prev, historyItem]);
      updateCapturedPieces();

      // Immediately evaluate user move to update evaluation bar
      globalEngine.evaluate(newFen).then((ev) => setEvaluation(ev));

      // Check if user move ended the game
      if (chess.isGameOver()) {
        checkGameStatus();
        return true;
      }

      // Trigger engine response
      setTimeout(() => {
        triggerEngineMove();
      }, 100);

      return true;
    },
    [isEngineThinking, gameResult.status, userColor, chess, evaluation, updateCapturedPieces, checkGameStatus, triggerEngineMove]
  );

  // Undo / Takeback Move
  const handleTakeback = () => {
    if (isEngineThinking || moveHistory.length === 0) return;

    // If it's user's turn, undo both engine's last move and user's last move
    chess.undo(); // Undo 1 move
    if (moveHistory.length > 1 && chess.turn() !== (userColor === 'white' ? 'w' : 'b')) {
      chess.undo(); // Undo second move to return to user's turn
    }

    setBoardFen(chess.fen());
    setMoveHistory((prev) => prev.slice(0, prev.length - 2));
    setGameResult({ status: 'playing' });
    setHint(null);
    updateCapturedPieces();

    globalEngine.evaluate(chess.fen()).then((ev) => setEvaluation(ev));
  };

  // Hint ladder request
  const handleAskHint = async () => {
    if (!evaluation || !evaluation.bestMove) {
      const ev = await globalEngine.evaluate(chess.fen());
      setEvaluation(ev);
      if (!ev.bestMove) return;
    }

    const best = evaluation?.bestMove;
    if (!best) return;

    if (!hint) {
      // Level 1: Tactical Clue
      setHint({
        san: best.san,
        uci: best.uci,
        clue: `Look at your piece on ${best.from.toUpperCase()} or targets around ${best.to.toUpperCase()}`,
        level: 1,
      });
    } else {
      // Level 2: Exact move reveal
      setHint({
        san: best.san,
        uci: best.uci,
        clue: `Stockfish recommends: ${best.san} (${best.from} → ${best.to})`,
        level: 2,
      });
    }
  };

  // Resign Handler
  const handleResign = () => {
    if (gameResult.status !== 'playing') return;
    setGameResult({
      status: 'resigned',
      winner: 'engine',
      description: 'You resigned. Stockfish wins.',
    });
    setIsClockRunning(false);
  };

  // Save detected mistakes/blunders from this match to Spaced Repetition deck
  const handleSaveMistakesToReview = () => {
    const mistakes = moveHistory.filter(
      (m) => m.by === 'user' && (m.classification === 'blunder' || m.classification === 'mistake')
    );

    if (mistakes.length === 0) {
      alert('Great game! No major blunders or mistakes recorded in this session.');
      return;
    }

    let savedCount = 0;
    mistakes.forEach((m) => {
      repertoireStore.addCustomMistakeCard(
        selectedOpening.name,
        m.fen,
        userColor === 'white' ? 'w' : 'b',
        evaluation?.bestMove?.san || m.san,
        m.san,
        `Practice mistake in ${selectedOpening.name}. Find the stronger engine alternative.`
      );
      savedCount++;
    });

    setBlundersSaved(true);
  };

  // Filter openings for opening picker modal
  const filteredOpenings = OPENINGS_LIBRARY.filter((op) => {
    const matchesCategory = selectedCategory === 'All' || op.category === selectedCategory;
    const matchesSearch =
      op.name.toLowerCase().includes(openingSearchQuery.toLowerCase()) ||
      op.eco.toLowerCase().includes(openingSearchQuery.toLowerCase()) ||
      op.description.toLowerCase().includes(openingSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Material Count calculation
  const getMaterialAdvantage = () => {
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const whiteSum = capturedByWhite.reduce((acc, p) => acc + (values[p] || 0), 0);
    const blackSum = capturedByBlack.reduce((acc, p) => acc + (values[p] || 0), 0);
    const diff = whiteSum - blackSum;
    return diff;
  };

  // Format evaluation in pawns e.g. +1.40 or -0.85
  const getFormattedEval = () => {
    if (!evaluation) return '0.00';
    if (evaluation.mateIn !== undefined) {
      return `#${evaluation.mateIn}`;
    }
    const score = evaluation.score / 100;
    return (score > 0 ? '+' : '') + score.toFixed(2);
  };

  // Initialize on mount or opening change
  useEffect(() => {
    initializeGame(selectedOpening, userColor);
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-6 gap-6">
      {/* Top Banner: Opening Info & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Swords className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {selectedOpening.eco}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">{selectedOpening.name}</h2>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{selectedOpening.description}</p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Opening Switcher Button */}
          <button
            onClick={() => setIsOpeningPickerOpen(true)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Select Opening</span>
          </button>

          {/* Color Switcher */}
          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => {
                setUserColor('white');
                initializeGame(selectedOpening, 'white');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                userColor === 'white' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              White
            </button>
            <button
              onClick={() => {
                setUserColor('black');
                initializeGame(selectedOpening, 'black');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                userColor === 'black' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Black
            </button>
          </div>

          {/* Quick Engine Strength Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleSetEngineTier(2850)}
              title="Stockfish Max Grandmaster - Full calculation depth, zero blunders"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                engineConfig.targetElo >= 2800
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Max (GM)
            </button>
            <button
              onClick={() => handleSetEngineTier(2200)}
              title="Master Level (2200 Elo)"
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                engineConfig.targetElo === 2200
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏆 2200
            </button>
            <button
              onClick={() => handleSetEngineTier(1600)}
              title="Club Player Level (1600 Elo)"
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                engineConfig.targetElo === 1600
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚔️ 1600
            </button>
            <button
              onClick={() => handleSetEngineTier(1200)}
              title="Casual Sparring Level (1200 Elo)"
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                engineConfig.targetElo === 1200
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ♟️ 1200
            </button>
            <button
              onClick={() => setIsEngineSettingsOpen(true)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
              title="Advanced Engine Calibration"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Playing Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chess Board & Eval Bar */}
        <div className="lg:col-span-8 flex flex-col items-center gap-4">
          {/* Opponent Info Bar */}
          <div className="w-full max-w-[620px] flex items-center justify-between px-2 py-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-slate-200">
                  Stockfish ({engineConfig.targetElo >= 2800 ? 'Peak GM 2850+' : `${engineConfig.targetElo} ELO`})
                </span>
                {isEngineThinking && (
                  <span className="ml-2 text-[10px] text-amber-400 animate-pulse font-medium">
                    Calculating...
                  </span>
                )}
              </div>
            </div>

            {/* Material & Captured */}
            <div className="flex items-center gap-1">
              {(userColor === 'white' ? capturedByWhite : capturedByBlack).map((p, idx) => (
                <span key={idx} className="text-[11px] font-mono text-slate-400 uppercase">
                  {p}
                </span>
              ))}
              {getMaterialAdvantage() !== 0 && (
                <span className="text-[10px] font-bold text-amber-400 font-mono ml-1">
                  {userColor === 'white' && getMaterialAdvantage() < 0 ? `+${Math.abs(getMaterialAdvantage())}` : ''}
                  {userColor === 'black' && getMaterialAdvantage() > 0 ? `+${getMaterialAdvantage()}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Board Container with Real-Time Evaluation Bar */}
          <div className="w-full max-w-[620px] flex items-center justify-center gap-2 sm:gap-3.5">
            {coachMode && (
              <div className="shrink-0">
                <EvaluationBar
                  evaluation={evaluation}
                  orientation={userColor}
                  heightClass="h-[320px] sm:h-[460px]"
                />
              </div>
            )}
            <div className="flex-1 max-w-[540px]">
              <ChessBoard
                chess={chess}
                fen={boardFen}
                orientation={userColor}
                onMove={handleUserMove}
                disabled={isEngineThinking || gameResult.status !== 'playing'}
                isInteractive={!isEngineThinking && gameResult.status === 'playing'}
              />
            </div>
          </div>

          {/* User Info Bar */}
          <div className="w-full max-w-[620px] flex items-center justify-between px-2 py-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="font-bold text-amber-400">You</span>
              </div>
              <span className="font-bold text-slate-200">
                Playing as {userColor === 'white' ? 'White' : 'Black'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {(userColor === 'white' ? capturedByBlack : capturedByWhite).map((p, idx) => (
                <span key={idx} className="text-[11px] font-mono text-slate-400 uppercase">
                  {p}
                </span>
              ))}
              {getMaterialAdvantage() !== 0 && (
                <span className="text-[10px] font-bold text-amber-400 font-mono ml-1">
                  {userColor === 'white' && getMaterialAdvantage() > 0 ? `+${getMaterialAdvantage()}` : ''}
                  {userColor === 'black' && getMaterialAdvantage() < 0 ? `+${Math.abs(getMaterialAdvantage())}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Interactive In-Game Toolbar */}
          <div className="w-full max-w-[560px] flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTakeback}
                disabled={moveHistory.length === 0 || isEngineThinking}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Undo last move"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Takeback</span>
              </button>

              <button
                onClick={handleAskHint}
                disabled={isEngineThinking || gameResult.status !== 'playing'}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Get progressive hint"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Coach Hint</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <BoardThemeSelector />

              <button
                onClick={handleResign}
                disabled={gameResult.status !== 'playing'}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Resign</span>
              </button>
            </div>
          </div>

          {/* Hint Card if active */}
          {hint && (
            <div className="w-full max-w-[560px] bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{hint.clue}</span>
              </div>
              {hint.level === 1 && (
                <button
                  onClick={handleAskHint}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors shrink-0"
                >
                  Show Move
                </button>
              )}
            </div>
          )}

          {/* Game Over Banner */}
          {gameResult.status !== 'playing' && (
            <div className="w-full max-w-[560px] bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{gameResult.description}</h3>
                  <p className="text-xs text-slate-400">Match concluded against Stockfish.</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    gameResult.winner === 'user'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : gameResult.winner === 'draw'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {gameResult.winner === 'user'
                    ? 'Victory'
                    : gameResult.winner === 'draw'
                    ? 'Draw'
                    : 'Defeat'}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => initializeGame(selectedOpening, userColor)}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rematch</span>
                </button>

                <button
                  onClick={handleSaveMistakesToReview}
                  disabled={blundersSaved}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{blundersSaved ? 'Saved to Review' : 'Save Blunders'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Move Notation, Evaluation & Key Themes */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Live Coach Evaluation Gauge */}
          {coachMode && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Stockfish Evaluation</span>
                </span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {getFormattedEval()}
                </span>
              </div>

              {/* Graphical Eval Bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                {/* White's percentage */}
                <div
                  className="h-full bg-slate-100 transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(95, 50 + (evaluation?.score ? evaluation.score / 20 : 0))
                    )}%`,
                  }}
                />
                {/* Black's percentage */}
                <div className="h-full bg-slate-950 flex-1" />
              </div>

              {evaluation?.bestMove && (
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Engine recommendation:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {evaluation.bestMove.san}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Move History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg h-[340px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">Move History</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {Math.ceil(moveHistory.length / 2)} moves
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 text-xs">
              {moveHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
                  <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                  <p>Opening ready. Make your first move on the board.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {moveHistory.map((item, idx) => {
                    const isWhite = idx % 2 === 0;
                    const moveNumber = Math.floor(idx / 2) + 1;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          idx === moveHistory.length - 1
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                            : 'bg-slate-850/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-slate-400 font-sans text-[10px]">
                          {isWhite ? `${moveNumber}.` : '...'}
                        </span>
                        <span>{item.san}</span>
                        {item.classification && item.classification !== 'good' && (
                          <span
                            className={`text-[9px] uppercase font-bold px-1 rounded ${
                              item.classification === 'book'
                                ? 'text-sky-400'
                                : item.classification === 'best'
                                ? 'text-emerald-400'
                                : item.classification === 'inaccuracy'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {item.classification === 'book' ? 'BK' : item.classification[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Strategic Opening Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Key Opening Themes</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedOpening.keyThemes.map((theme, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opening Selector Modal */}
      {isOpeningPickerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100">Select Practice Opening</h3>
                  <p className="text-xs text-slate-400">
                    Choose from standard grandmaster openings or scratch setup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpeningPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search & Categories Bar */}
            <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search openings (e.g. Sicilian, Italian, Queen's Gambit, E97)..."
                  value={openingSearchQuery}
                  onChange={(e) => setOpeningSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', '1.e4 Openings', '1.d4 Openings', 'Indian Defenses', 'Flank & Gambits'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Openings Grid List */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredOpenings.map((op) => {
                const isSelected = op.id === selectedOpening.id;
                return (
                  <div
                    key={op.id}
                    onClick={() => {
                      setSelectedOpening(op);
                      setUserColor(op.recommendedColor);
                      setIsOpeningPickerOpen(false);
                      initializeGame(op, op.recommendedColor);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                        : 'bg-slate-850/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {op.eco}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {op.recommendedColor} favored
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100">{op.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {op.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-500 font-mono">
                        {op.movesSan.length > 0 ? `${op.movesSan.length} ply book` : 'Move 1 start'}
                      </span>
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        Play this <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Engine Calibration Modal */}
      <EngineSettingsModal
        isOpen={isEngineSettingsOpen}
        onClose={() => setIsEngineSettingsOpen(false)}
        config={engineConfig}
        onUpdateConfig={(cfg) => {
          setEngineConfig(cfg);
          globalEngine.setConfig(cfg);
        }}
      />
    </div>
  );
};
