import React from 'react';
import { Palette } from 'lucide-react';
import { BoardTheme, BOARD_THEMES, setStoredBoardTheme } from '../services/boardThemes';

interface BoardThemeSelectorProps {
  currentTheme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
}

export const BoardThemeSelector: React.FC<BoardThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (theme: BoardTheme) => {
    setStoredBoardTheme(theme.id);
    onSelectTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex items-center gap-1"
        title="Change Board Color Palette"
      >
        <Palette className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-40 flex flex-col gap-1 animate-in fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Board Palette
            </span>
            {Object.values(BOARD_THEMES).map((th) => (
              <button
                key={th.id}
                onClick={() => handleSelect(th)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  currentTheme.id === th.id
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{th.name}</span>
                <div className="flex items-center rounded overflow-hidden border border-slate-700 w-6 h-4">
                  <div className="w-1/2 h-full" style={{ backgroundColor: th.lightSquare }} />
                  <div className="w-1/2 h-full" style={{ backgroundColor: th.darkSquare }} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
