import React, { useState } from 'react';
import { X, Download, Globe, FileText, CheckCircle2, AlertCircle, Sparkles, BookOpen, User, Play } from 'lucide-react';
import { lichessService } from '../services/lichessService';
import { ChessComService } from '../services/chessComService';
import { repertoireStore } from '../services/repertoireStore';
import { RepertoireLine, ChessComGameItem } from '../types';

interface LichessImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newRepertoire: RepertoireLine) => void;
}

type TabType = 'lichess' | 'chesscom' | 'pgn' | 'presets';

export const LichessImportModal: React.FC<LichessImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('lichess');
  const [lichessInput, setLichessInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [repertoireName, setRepertoireName] = useState('');
  const [repertoireColor, setRepertoireColor] = useState<'white' | 'black'>('white');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [chesscomUsername, setChesscomUsername] = useState('');
  const [chesscomGames, setChesscomGames] = useState<ChessComGameItem[]>([]);
  const [isFetchingChessCom, setIsFetchingChessCom] = useState(false);

  if (!isOpen) return null;

  const presets = lichessService.getCuratedPresets();

  const handleFetchChessComGames = async () => {
    setErrorMessage(null);
    if (!chesscomUsername.trim()) {
      setErrorMessage('Please enter a Chess.com username.');
      return;
    }

    setIsFetchingChessCom(true);
    try {
      const games = await ChessComService.fetchRecentGames(chesscomUsername);
      if (games.length === 0) {
        setErrorMessage(`No recent games found for "${chesscomUsername}".`);
      } else {
        setChesscomGames(games);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch games from Chess.com.');
    } finally {
      setIsFetchingChessCom(false);
    }
  };

  const handleImportChessComGame = (game: ChessComGameItem) => {
    if (!game.pgn) {
      setErrorMessage('This game does not contain PGN data.');
      return;
    }

    try {
      const whiteName = game.white?.username || 'White';
      const blackName = game.black?.username || 'Black';
      const title = `${whiteName} vs ${blackName} (Chess.com)`;
      const userIsBlack = (game.black?.username?.toLowerCase() === chesscomUsername.toLowerCase());
      const detectedColor = userIsBlack ? 'black' : 'white';

      const result = lichessService.parsePgnToRepertoire(game.pgn, detectedColor, repertoireName || title);
      repertoireStore.addRepertoire(result.repertoire);
      onImportSuccess(result.repertoire);
      onClose();
    } catch (err: any) {
      setErrorMessage(`Error importing game: ${err.message}`);
    }
  };

  const handleLichessStudyImport = async () => {
    setErrorMessage(null);
    const studyId = lichessService.extractStudyId(lichessInput);
    if (!studyId) {
      setErrorMessage('Please enter a valid Lichess study URL (e.g. https://lichess.org/study/xxxxxx) or 8-character study ID.');
      return;
    }

    setIsLoading(true);
    try {
      const pgnText = await lichessService.fetchStudyPgn(studyId);
      const result = lichessService.parsePgnToRepertoire(pgnText, repertoireColor, repertoireName || `Lichess Study (${studyId})`);
      repertoireStore.addRepertoire(result.repertoire);
      onImportSuccess(result.repertoire);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import study from Lichess.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePgnImport = () => {
    setErrorMessage(null);
    if (!pgnInput.trim()) {
      setErrorMessage('Please paste valid PGN move text.');
      return;
    }

    try {
      const result = lichessService.parsePgnToRepertoire(
        pgnInput,
        repertoireColor,
        repertoireName || 'Imported PGN Repertoire'
      );
      repertoireStore.addRepertoire(result.repertoire);
      onImportSuccess(result.repertoire);
      onClose();
    } catch (err: any) {
      setErrorMessage(`PGN Parsing Error: ${err.message}`);
    }
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    try {
      const result = lichessService.parsePgnToRepertoire(
        preset.pgn,
        preset.color,
        preset.name
      );
      repertoireStore.addRepertoire(result.repertoire);
      onImportSuccess(result.repertoire);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Import Chess Repertoire</h3>
              <p className="text-[11px] text-slate-400">Sync from Lichess Study, PGN, or Master Presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => { setActiveTab('lichess'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'lichess'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Lichess</span>
          </button>
          <button
            onClick={() => { setActiveTab('chesscom'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'chesscom'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Chess.com</span>
          </button>
          <button
            onClick={() => { setActiveTab('pgn'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pgn'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PGN</span>
          </button>
          <button
            onClick={() => { setActiveTab('presets'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-900/80 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Color & Title Configuration (for Lichess & PGN tabs) */}
        {activeTab !== 'presets' && (
          <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Repertoire Color
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRepertoireColor('white')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    repertoireColor === 'white'
                      ? 'bg-slate-200 text-slate-950 border-white'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  White (1. e4 / 1. d4)
                </button>
                <button
                  type="button"
                  onClick={() => setRepertoireColor('black')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    repertoireColor === 'black'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Black (Defense)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Custom Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. My Lichess London System"
                value={repertoireName}
                onChange={(e) => setRepertoireName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Lichess Study Input Tab */}
        {activeTab === 'lichess' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Lichess Study Link or Study ID
              </label>
              <input
                type="text"
                placeholder="https://lichess.org/study/gE9uXpYt or gE9uXpYt"
                value={lichessInput}
                onChange={(e) => setLichessInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Works with any public or unlisted study on Lichess.
              </p>
            </div>

            <button
              onClick={handleLichessStudyImport}
              disabled={isLoading || !lichessInput.trim()}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              {isLoading ? (
                <span>Fetching Lichess Study PGN...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import Lichess Study</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Chess.com Player Games Input Tab */}
        {activeTab === 'chesscom' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Chess.com Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. magnuscarlsen, hikaru, or your handle"
                  value={chesscomUsername}
                  onChange={(e) => setChesscomUsername(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleFetchChessComGames}
                  disabled={isFetchingChessCom || !chesscomUsername.trim()}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  {isFetchingChessCom ? 'Fetching...' : 'Fetch Games'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Directly queries Chess.com public archives for recent games and blunders.
              </p>
            </div>

            {/* List of Fetched Games */}
            {chesscomGames.length > 0 && (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Recent Games ({chesscomGames.length})
                </span>
                {chesscomGames.map((game, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span>{game.white?.username} ({game.white?.rating})</span>
                        <span className="text-slate-500">vs</span>
                        <span>{game.black?.username} ({game.black?.rating})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="uppercase px-1 py-0.2 rounded bg-slate-800 font-mono text-amber-300">
                          {game.time_class || 'game'}
                        </span>
                        <span>{game.end_time ? new Date(game.end_time * 1000).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportChessComGame(game)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors shrink-0"
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Raw PGN Input Tab */}
        {activeTab === 'pgn' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Paste PGN Move Notation
              </label>
              <textarea
                rows={5}
                placeholder="1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3..."
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handlePgnImport}
              disabled={!pgnInput.trim()}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Parse & Add to Repertoire</span>
            </button>
          </div>
        )}

        {/* Master Presets Tab */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              1-Click Master Repertoire Starters
            </span>
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.name}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{preset.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-400">
                        {preset.eco}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-semibold ${
                        preset.color === 'white' ? 'bg-slate-200 text-slate-950' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {preset.color}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectPreset(preset)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex-shrink-0 transition-colors"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
