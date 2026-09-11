import { ChessComGameItem } from '../types';

export class ChessComService {
  private static BASE_URL = 'https://api.chess.com/pub/player';

  /**
   * Fetch recent monthly game archives for a given Chess.com username
   */
  public static async fetchRecentGames(username: string): Promise<ChessComGameItem[]> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      throw new Error('Please provide a valid Chess.com username');
    }

    try {
      // 1. Fetch archives list
      const archivesRes = await fetch(`${this.BASE_URL}/${cleanUsername}/games/archives`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!archivesRes.ok) {
        if (archivesRes.status === 404) {
          throw new Error(`Chess.com player "${cleanUsername}" not found. Please check spelling.`);
        }
        throw new Error(`Chess.com error (${archivesRes.status}): Could not load player archives.`);
      }

      const archivesData = await archivesRes.json();
      const archives: string[] = archivesData.archives || [];

      if (archives.length === 0) {
        return [];
      }

      // 2. Fetch the latest month's games
      const latestArchiveUrl = archives[archives.length - 1];
      const gamesRes = await fetch(latestArchiveUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!gamesRes.ok) {
        throw new Error('Failed to load recent games from archive');
      }

      const gamesData = await gamesRes.json();
      const games: ChessComGameItem[] = gamesData.games || [];

      // Return recent 20 games sorted by end_time desc
      return games
        .filter(g => g.rules === 'chess' || !g.rules)
        .sort((a, b) => (b.end_time || 0) - (a.end_time || 0))
        .slice(0, 25);
    } catch (err: any) {
      console.error('Chess.com API Error:', err);
      throw new Error(err.message || 'Failed to connect to Chess.com');
    }
  }
}
