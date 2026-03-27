import type { SongDefinition } from './types';
import { doradaNormal } from './charts/dorada.normal';
import { rabaRabaNormal } from './charts/rabaRaba.normal';

/**
 * Song Catalog
 * 
 * Central registry of all songs with their charts.
 * Add new songs here with their available difficulties.
 */

export const SONG_CATALOG: SongDefinition[] = [
  {
    id: 'dorada',
    title: 'DORADA',
    artist: 'SAID 3H',
    audioAsset: require('../../../assets/audio/dorada.mp3'),
    jacketAsset: require('../../../assets/icon.png'),
    charts: {
      normal: doradaNormal,
      // easy: doradaEasy,    // TODO: Add when ready
      // hard: doradaHard,    // TODO: Add when ready
    },
  },
  {
    id: 'raba-raba',
    title: 'Raba Raba',
    artist: 'SAID 3H',
    audioAsset: require('../../../assets/audio/raba-raba-said-3h.mp3'),
    jacketAsset: require('../../../assets/icon.png'),
    charts: {
      normal: rabaRabaNormal,
      // easy: rabaRabaEasy,  // TODO: Add when ready
      // hard: rabaRabaHard,  // TODO: Add when ready
    },
  },
];

/**
 * Get a song definition by ID
 */
export function getSongById(songId?: string | string[]): SongDefinition | undefined {
  const normalizedId = Array.isArray(songId) ? songId[0] : songId;
  return SONG_CATALOG.find((song) => song.id === normalizedId);
}

/**
 * Get a chart for a specific song and difficulty
 */
export function getChartForSong(
  songId: string,
  difficulty: 'easy' | 'normal' | 'hard'
): SongDefinition['charts'][typeof difficulty] | undefined {
  const song = getSongById(songId);
  if (!song) return undefined;
  return song.charts[difficulty];
}

/**
 * Get all available difficulties for a song
 */
export function getAvailableDifficulties(songId: string): string[] {
  const song = getSongById(songId);
  if (!song) return [];
  
  const difficulties: string[] = [];
  if (song.charts.easy) difficulties.push('easy');
  if (song.charts.normal) difficulties.push('normal');
  if (song.charts.hard) difficulties.push('hard');
  
  return difficulties;
}
