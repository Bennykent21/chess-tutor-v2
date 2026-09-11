import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Play, 
  Download, 
  Cpu, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Wifi, 
  Battery,
  Layers,
  ChevronRight,
  Swords,
  Zap,
  GraduationCap,
  Award
} from 'lucide-react';
import { DashboardScreen } from './screens/DashboardScreen';
import { RepertoireScreen } from './screens/RepertoireScreen';
import { StudyBoardScreen } from './screens/StudyBoardScreen';
import { PracticeScreen } from './screens/PracticeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { TacticsDojoScreen } from './screens/TacticsDojoScreen';
import { AssessmentScreen } from './screens/AssessmentScreen';
import { CurriculumScreen } from './screens/CurriculumScreen';
import { EngineSettingsModal } from './components/EngineSettingsModal';
import { LichessImportModal } from './components/LichessImportModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { repertoireStore } from './services/repertoireStore';
import { globalEngine } from './services/chessEngine';
import { RepertoireLine, StockfishConfig, SpacedReviewCard } from './types';

type ActiveTab = 'dashboard' | 'curriculum' | 'tactics' | 'practice' | 'repertoire' | 'study' | 'review' | 'assessment';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [repertoires, setRepertoires] = useState<RepertoireLine[]>([]);
  const [selectedRepertoire, setSelectedRepertoire] = useState<RepertoireLine | null>(null);
  const [dueCards, setDueCards] = useState<SpacedReviewCard[]>([]);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false); // Default to full expanded view for comfortable play
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [engineConfig, setEngineConfig] = useState<StockfishConfig>(() => globalEngine.getConfig());

  // Load repertoires and spaced cards
  const refreshData = () => {
    const reps = repertoireStore.getRepertoires();
    setRepertoires(reps);
    setDueCards(repertoireStore.getDueReviewCards());
    if (!selectedRepertoire && reps.length > 0) {
      setSelectedRepertoire(reps[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleContinueStudy = (repertoireId: string) => {
    const rep = repertoires.find(r => r.id === repertoireId) || repertoires[0];
    if (rep) {
      setSelectedRepertoire(rep);
      setActiveTab('study');
    }
  };

  const handleSelectRepertoire = (rep: RepertoireLine) => {
    setSelectedRepertoire(rep);
    setActiveTab('study');
  };

  const handleDeleteRepertoire = (id: string) => {
    repertoireStore.deleteRepertoire(id);
    refreshData();
    if (selectedRepertoire?.id === id) {
      const remaining = repertoireStore.getRepertoires();
      setSelectedRepertoire(remaining[0] || null);
    }
  };

  const handleImportSuccess = (newRep: RepertoireLine) => {
    refreshData();
    setSelectedRepertoire(newRep);
    setActiveTab('study');
  };

  const handleUpdateEngineConfig = (newConfig: StockfishConfig) => {
    globalEngine.setConfig(newConfig);
    setEngineConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:py-4 sm:px-4 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className={`w-full ${isPhoneFrame ? 'max-w-[440px]' : 'max-w-7xl'} flex items-center justify-between px-4 py-2 text-xs text-slate-400 select-none mb-1 transition-all duration-300`}>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-100 text-sm tracking-tight">Chess Tutor</span>
          
          <button
            onClick={() => setIsEngineModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-950/40 hover:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800/40 transition-colors"
            title="Click to calibrate and test Stockfish"
          >
            <Cpu className="w-3 h-3 text-amber-400" />
            <span>Stockfish {engineConfig.targetElo >= 2800 ? 'Max (2850+ GM)' : `${engineConfig.targetElo} Elo`}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
            title="Toggle Smartphone Frame View"
          >
            {isPhoneFrame ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            <span className="text-[11px] font-medium">{isPhoneFrame ? 'Expand Layout' : 'Phone Frame'}</span>
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <div 
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame 
            ? 'max-w-[440px] bg-slate-925 rounded-[36px] border-4 border-slate-800 shadow-2xl shadow-black/80 overflow-hidden min-h-[780px]' 
            : 'max-w-7xl bg-slate-900/60 rounded-2xl border border-slate-800/80 p-2 sm:p-5 shadow-xl min-h-[820px]'
        }`}
      >
        {/* Smartphone Status Bar (only shown in phone frame mode) */}
        {isPhoneFrame && (
          <div className="w-full bg-slate-950/90 pt-3 px-6 pb-2 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none border-b border-slate-850">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-900 rounded-full border border-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Dynamic Screen Surface */}
        <main className="flex-1 p-2 sm:p-3 overflow-y-auto pb-20 flex flex-col">
          <ErrorBoundary fallbackTitle="Could not load view">
            {activeTab === 'dashboard' && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-3xl mx-auto w-full'}>
                <DashboardScreen
                  repertoires={repertoires}
                  dueCards={dueCards}
                  engineConfig={engineConfig}
                  onContinueStudy={handleContinueStudy}
                  onStartReview={() => setActiveTab('review')}
                  onStartPractice={() => setActiveTab('practice')}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onOpenEngineSettings={() => setIsEngineModalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
                />
              </div>
            )}

            {activeTab === 'practice' && (
              <PracticeScreen />
            )}

            {activeTab === 'tactics' && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-4xl mx-auto w-full'}>
                <TacticsDojoScreen />
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-4xl mx-auto w-full'}>
                <CurriculumScreen />
              </div>
            )}

            {activeTab === 'assessment' && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-3xl mx-auto w-full'}>
                <AssessmentScreen onComplete={() => setActiveTab('dashboard')} />
              </div>
            )}

            {activeTab === 'repertoire' && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-3xl mx-auto w-full'}>
                <RepertoireScreen
                  repertoires={repertoires}
                  onSelectRepertoire={handleSelectRepertoire}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onDeleteRepertoire={handleDeleteRepertoire}
                />
              </div>
            )}

            {activeTab === 'study' && selectedRepertoire && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-4xl mx-auto w-full'}>
                <StudyBoardScreen
                  repertoire={selectedRepertoire}
                  engineConfig={engineConfig}
                  onOpenEngineSettings={() => setIsEngineModalOpen(true)}
                  onBackToRepertoire={() => setActiveTab('repertoire')}
                />
              </div>
            )}

            {activeTab === 'review' && (
              <div className={isPhoneFrame ? 'w-full' : 'max-w-3xl mx-auto w-full'}>
                <ReviewScreen
                  onBackToDashboard={() => setActiveTab('dashboard')}
                />
              </div>
            )}
          </ErrorBoundary>
        </main>

        {/* Unified Bottom Navigation Bar */}
        <nav className={`fixed sm:sticky bottom-0 inset-x-0 mx-auto w-full ${isPhoneFrame ? 'max-w-[432px]' : 'max-w-2xl'} bg-slate-950/95 backdrop-blur-md border-t border-slate-850 px-1 sm:px-3 py-2 flex items-center justify-around z-20 rounded-t-2xl sm:rounded-2xl sm:mb-2`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Today</span>
          </button>

          <button
            onClick={() => setActiveTab('tactics')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'tactics'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Dojo</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
              activeTab === 'practice'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'curriculum'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Lessons</span>
          </button>

          <button
            onClick={() => setActiveTab('repertoire')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'repertoire'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Repertoire</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl relative transition-all ${
              activeTab === 'review'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Review</span>
            {dueCards.length > 0 && (
              <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </nav>
      </div>

      {/* Stockfish Engine Calibration & Test Modal */}
      <EngineSettingsModal
        isOpen={isEngineModalOpen}
        onClose={() => setIsEngineModalOpen(false)}
        config={engineConfig}
        onUpdateConfig={handleUpdateEngineConfig}
      />

      {/* Lichess & PGN Repertoire Import Modal */}
      <LichessImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
