/**
 * GAME INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the chart system into GameScreen.tsx
 * Copy the relevant patterns into your actual GameScreen component.
 */

import React, { useMemo } from 'react';
import { getSongById, loadChartForSong, getAvailableDifficulties } from './index';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Replace song loading logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * REPLACE THIS (old approach):
 * 
 * const song = useMemo(() => getSongByTrackId(params.trackId), [params.trackId]);
 */

/**
 * WITH THIS (chart-based approach):
 */
export function useChartBasedSong(params: { trackId?: string; difficulty?: string }) {
  // Get song definition from catalog
  const songDefinition = useMemo(
    () => getSongById(params.trackId),
    [params.trackId]
  );

  // Map difficulty string to chart difficulty type
  const selectedDifficulty = useMemo(() => {
    const rawDifficulty = Array.isArray(params.difficulty)
      ? params.difficulty[0]
      : params.difficulty;

    return rawDifficulty ? rawDifficulty.toUpperCase() : 'NORMAL';
  }, [params.difficulty]);

  // Build song object with chart-based notes
  const song = useMemo(() => {
    if (!songDefinition) {
      // Return minimal fallback
      return {
        notes: [],
        duration: 0,
        name: 'Unknown',
        artist: 'Unknown',
        audioSource: undefined,
      };
    }

    // Map UI difficulty to chart difficulty
    const difficultyMap: Record<string, 'easy' | 'normal' | 'hard'> = {
      'EASY': 'easy',
      'NORMAL': 'normal',
      'HARD': 'hard',
      'EXPERT': 'hard', // Map expert to hard if no expert chart exists
    };

    const chartDifficulty = difficultyMap[selectedDifficulty] || 'normal';

    // Load chart notes (calibration is applied automatically in loadChartForSong)
    const notes = loadChartForSong(songDefinition.id, chartDifficulty);

    // Get song duration from chart or fallback
    const lastNoteTime = notes.length > 0
      ? Math.max(...notes.map((n: { time: number }) => n.time))
      : 0;
    const estimatedDuration = lastNoteTime + 10000; // Add 10s buffer after last note

    return {
      notes,
      duration: estimatedDuration,
      name: songDefinition.title,
      artist: songDefinition.artist,
      audioSource: songDefinition.audioAsset,
    };
  }, [songDefinition, selectedDifficulty]);

  return song;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Use in your GameScreen component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Example usage in GameScreen.tsx:
 * 
 * export default function GameScreen() {
 *   const router = useRouter();
 *   const params = useLocalSearchParams<{ trackId?: string; difficulty?: string }>();
 *   
 *   // ... other hooks ...
 *   
 *   // REPLACE:
 *   // const song = useMemo(() => getSongByTrackId(params.trackId), [params.trackId]);
 *   
 *   // WITH:
 *   const song = useChartBasedSong(params);
 *   
 *   // ... rest of component ...
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Verify chart loading works
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Test that charts are loading correctly:
 */
export function testChartLoading() {
  // Test DORADA normal chart
  const doradaNotes = loadChartForSong('dorada', 'normal');
  console.log('DORADA normal chart:', doradaNotes.length, 'notes');
  // Expected: ~35 notes

  // Test Raba Raba normal chart
  const rabaNotes = loadChartForSong('raba-raba', 'normal');
  console.log('Raba Raba normal chart:', rabaNotes.length, 'notes');
  // Expected: ~32 notes

  // Test missing chart (should return empty array)
  const missingNotes = loadChartForSong('dorada', 'easy');
  console.log('DORADA easy chart (missing):', missingNotes.length, 'notes');
  // Expected: 0 notes (with warning)
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Optional - Add chart availability check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a chart exists before selecting difficulty
 */
export function getAvailableDifficultiesForSong(songId: string): string[] {
  return getAvailableDifficulties(songId);
}

/**
 * Example usage in song-select.tsx:
 *
 * const availableDifficulties = useMemo(
 *   () => getAvailableDifficultiesForSong(selectedTrack.id),
 *   [selectedTrack.id]
 * );
 *
 * // Only show difficulty options that have charts
 */

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [ ] 1. Add AsyncStorage dependency (npm install @react-native-async-storage/async-storage)
 * [ ] 2. Update audioCalibration.ts to use AsyncStorage (DONE)
 * [ ] 3. Update calibrate.tsx to use async calibration (DONE)
 * [ ] 4. Update GameScreen.tsx to load calibration async (DONE)
 * [ ] 5. Replace song loading with chart-based approach (TODO - copy useChartBasedSong)
 * [ ] 6. Test with DORADA and Raba Raba charts
 * [ ] 7. Create remaining difficulty charts (easy, hard for each song)
 * [ ] 8. Remove or deprecate auto-generated note fallback
 */
