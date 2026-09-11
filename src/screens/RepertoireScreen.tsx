import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Download, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Shield,
  Swords
} from 'lucide-react';
import { RepertoireLine } from '../types';

interface RepertoireScreenProps {
  repertoires: RepertoireLine[];
  onSelectRepertoire: (rep: RepertoireLine) => void;
  onOpenImport: () => void;
  onDeleteRepertoire: (id: string) => void;
}

export const RepertoireScreen: React.FC<RepertoireScreenProps> = ({
  repertoires,
  onSelectRepertoire,
  onOpenImport,
  onDeleteRepertoire,
}) => {
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');

  const filteredRepertoires = repertoires.filter(r => r.color === selectedColor);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Top Header & Import Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Opening Repertoire Hub</h2>
          <p className="text-[11px] text-slate-400">Structured master lines & branch variations</p>
        </div>
        <button
          onClick={onOpenImport}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import Study</span>
        </button>
      </div>

      {/* Color Tab Filter */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setSelectedColor('white')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            selectedColor === 'white'
              ? 'bg-slate-200 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
          <span>White Repertoire ({repertoires.filter(r => r.color === 'white').length})</span>
        </button>

        <button
          onClick={() => setSelectedColor('black')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            selectedColor === 'black'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-amber-400" />
          <span>Black Repertoire ({repertoires.filter(r => r.color === 'black').length})</span>
        </button>
      </div>

      {/* Repertoire List */}
      <div className="flex flex-col gap-2.5">
        {filteredRepertoires.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center gap-2">
            <BookOpen className="w-8 h-8 text-slate-600" />
            <h3 className="text-xs font-semibold text-slate-300">No {selectedColor} lines yet</h3>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Import lines from your Lichess studies, paste PGN move text, or load a curated grandmaster preset.
            </p>
            <button
              onClick={onOpenImport}
              className="mt-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Import Lichess Study / PGN
            </button>
          </div>
        ) : (
          filteredRepertoires.map((rep) => {
            const isMastered = rep.masteryPercentage >= 80;
            const isWeak = rep.masteryPercentage < 65;

            return (
              <div
                key={rep.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{rep.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 font-semibold">
                        {rep.eco}
                      </span>
                      {rep.source === 'lichess' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono">
                          Lichess
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {rep.variation} • {rep.movesCount} key positions
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isMastered 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : isWeak
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isMastered ? 'Mastered' : isWeak ? 'Needs Practice' : 'Solid'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Mastery Retention</span>
                    <span className="font-semibold text-slate-200">{rep.masteryPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isMastered ? 'bg-emerald-400' : isWeak ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                      style={{ width: `${rep.masteryPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500">
                    {rep.dueForReview ? '⚠️ Review Due' : `Next review: ${rep.reviewIntervalDays}d`}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteRepertoire(rep.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Repertoire Line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectRepertoire(rep)}
                      className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Study Line</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
