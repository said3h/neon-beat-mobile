import type { Note } from '../../game/config';
import type { ChartNote, SongChart } from './types';
import { getAudioCalibrationOffset } from '../../game/audioCalibration';

/**
 * Convert chart notes to legacy Note format for compatibility
 * with existing game engine.
 * 
 * Applies timing calibration:
 * effectiveTime = note.timeMs + globalCalibrationOffsetMs + chart.musicOffsetMs
 */
export function convertChartToNotes(chart: SongChart): Note[] {
  const globalOffset = getAudioCalibrationOffset();
  const musicOffset = chart.musicOffsetMs ?? 0;
  const totalOffset = globalOffset + musicOffset;

  return chart.notes.map((chartNote): Note => ({
    id: parseInt(chartNote.id.split('-').pop() || '0', 10),
    time: chartNote.timeMs + totalOffset,
    lane: chartNote.lane,
    hit: false,
    missed: false,
  }));
}

/**
 * Load chart for a song and convert to playable notes.
 * Falls back to auto-generated notes if no chart exists.
 */
export function loadChartForSong(
  songId: string,
  difficulty: 'easy' | 'normal' | 'hard'
): Note[] {
  // Dynamic import to avoid circular dependencies
  // In production, use the catalog directly
  const { getChartForSong } = require('./catalog');

  const chart = getChartForSong(songId, difficulty);

  if (!chart) {
    // Fallback: return empty array or generate procedural notes
    // This maintains backward compatibility during migration
    console.warn(`No chart found for ${songId} (${difficulty}), using empty chart`);
    return [];
  }

  return convertChartToNotes(chart);
}
