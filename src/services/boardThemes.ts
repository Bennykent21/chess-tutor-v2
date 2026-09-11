export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  lightSquareLabel: string;
  darkSquareLabel: string;
  lastMoveLight: string;
  lastMoveDark: string;
}

export const BOARD_THEMES: Record<string, BoardTheme> = {
  walnut: {
    id: 'walnut',
    name: 'Walnut & Maple',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    lightSquareLabel: '#b58863',
    darkSquareLabel: '#f0d9b5',
    lastMoveLight: '#ced26b',
    lastMoveDark: '#aaa23a',
  },
  olive: {
    id: 'olive',
    name: 'Tournament Olive',
    lightSquare: '#eeeed2',
    darkSquare: '#769656',
    lightSquareLabel: '#769656',
    darkSquareLabel: '#eeeed2',
    lastMoveLight: '#f7f784',
    lastMoveDark: '#baca44',
  },
  ocean: {
    id: 'ocean',
    name: 'Nordic Ocean',
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    lightSquareLabel: '#8ca2ad',
    darkSquareLabel: '#dee3e6',
    lastMoveLight: '#a9d0e6',
    lastMoveDark: '#679db8',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Dark Obsidian',
    lightSquare: '#94a3b8',
    darkSquare: '#475569',
    lightSquareLabel: '#475569',
    darkSquareLabel: '#94a3b8',
    lastMoveLight: '#cbd5e1',
    lastMoveDark: '#64748b',
  },
};

const THEME_STORAGE_KEY = 'chess_tutor_board_theme';

export function getStoredBoardTheme(): BoardTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && BOARD_THEMES[saved]) {
      return BOARD_THEMES[saved];
    }
  } catch {}
  return BOARD_THEMES.walnut; // Warm Walnut & Maple by default
}

export function setStoredBoardTheme(themeId: string) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {}
}
