import React, { useState } from 'react';
import { X, Cpu, Sliders, CheckCircle2, Shield, Activity, RefreshCw } from 'lucide-react';
import { StockfishConfig } from '../types';
import { globalEngine } from '../services/chessEngine';

interface EngineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StockfishConfig;
  onUpdateConfig: (newConfig: StockfishConfig) => void;
}

export const EngineSettingsModal: React.FC<EngineSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [targetElo, setTargetElo] = useState<number>(config.targetElo);
  const [threads, setThreads] = useState<number>(config.threads);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Derive calibrated skill level and depth
  const skillLevel = Math.round(((targetElo - 800) / (2850 - 800)) * 20);
  const depth = Math.max(4, Math.min(18, Math.round(4 + (skillLevel / 20) * 14)));

  const handleSave = () => {
    globalEngine.calibrateElo(targetElo);
    onUpdateConfig({
      ...config,
      targetElo,
      skillLevel,
      depth,
      threads,
      isCalibrated: true,
    });
    onClose();
  };

  const runDiagnostics = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await globalEngine.testEngine();
    setTestResult(res);
    setIsTesting(false);
  };

  const getEloLabel = (elo: number) => {
    if (elo <= 1000) return 'Beginner / Novice';
    if (elo <= 1400) return 'Club Intermediate';
    if (elo <= 1800) return 'Advanced Competitor';
    if (elo <= 2200) return 'Expert / Candidate Master';
    return 'Grandmaster / Super-Engine';
  };

  const engineName = globalEngine.getEngineName();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Stockfish Engine Calibration</h3>
              <p className="text-[11px] text-slate-400">Configure engine strength, depth & check integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Engine Core</span>
              <span className="text-xs font-bold text-slate-200">{engineName}</span>
            </div>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isTesting}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-amber-400 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Engine'}</span>
          </button>
        </div>

        {/* Diagnostics output */}
        {testResult && (
          <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
            testResult.ok ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{testResult.message} ({testResult.latencyMs}ms)</span>
          </div>
        )}

        {/* Elo Strength Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Target Opponent Elo</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-amber-400 font-mono">{targetElo}</span>
              <span className="text-[10px] text-slate-400 font-medium">ELO</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 pb-1">
            <button
              type="button"
              onClick={() => setTargetElo(2850)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center ${
                targetElo >= 2800
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>⚡ Max (GM)</span>
              <span className="text-[9px] font-mono opacity-80">2850</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetElo(2200)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center ${
                targetElo === 2200
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>🏆 Master</span>
              <span className="text-[9px] font-mono opacity-80">2200</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetElo(1600)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center ${
                targetElo === 1600
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>⚔️ Club</span>
              <span className="text-[9px] font-mono opacity-80">1600</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetElo(1200)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center ${
                targetElo === 1200
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>♟️ Casual</span>
              <span className="text-[9px] font-mono opacity-80">1200</span>
            </button>
          </div>

          <input
            type="range"
            min="800"
            max="2850"
            step="50"
            value={targetElo}
            onChange={(e) => setTargetElo(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>800 ELO (Novice)</span>
            <span className="text-amber-300 font-semibold">{getEloLabel(targetElo)}</span>
            <span>2850 ELO (Peak GM)</span>
          </div>
        </div>

        {/* Calibrated Specs Display */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">UCI Skill Level</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{skillLevel} / 20</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Search Depth</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{depth} Plies</span>
          </div>
        </div>

        {/* Explanation Note */}
        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-850/40 p-2.5 rounded-xl border border-slate-800/80">
          The engine scales search depth and tactical blunder probability dynamically to emulate authentic human play across Elo ratings.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
