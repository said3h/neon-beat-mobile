# Chart System Integration Guide

## Overview

This document explains how to integrate the new chart-based note system into the existing gameplay flow.

## File Structure

```
src/features/songs/
├── types.ts              # TypeScript type definitions
├── catalog.ts            # Song registry with charts
├── chartLoader.ts        # Chart loading & conversion utilities
├── index.ts              # Clean exports
└── charts/
    ├── dorada.normal.ts  # DORADA normal chart (~35 notes)
    └── rabaRaba.normal.ts # Raba Raba normal chart (~32 notes)
```

## Integration in GameScreen.tsx

Replace the current song loading logic:

### BEFORE (current code):

```typescript
import { getSongByTrackId } from '../game/songData';

// ...

const song = useMemo(() => getSongByTrackId(params.trackId), [params.trackId]);
```

### AFTER (with chart system):

```typescript
import { useMemo } from 'react';
import { getSongById, loadChartForSong } from '../features/songs';
import { getAudioCalibrationOffset } from '../game/audioCalibration';

// ...

const songDefinition = useMemo(
  () => getSongById(params.trackId),
  [params.trackId]
);

// Build song object with chart-based notes
const song = useMemo(() => {
  if (!songDefinition) {
    return null;
  }

  // Map difficulty string to chart difficulty
  const difficultyMap: Record<string, 'easy' | 'normal' | 'hard'> = {
    'EASY': 'easy',
    'NORMAL': 'normal',
    'HARD': 'hard',
    'EXPERT': 'hard', // Map expert to hard if no expert chart
  };

  const chartDifficulty = difficultyMap[selectedDifficulty] || 'normal';
  
  // Load chart notes (applies calibration automatically)
  const notes = loadChartForSong(songDefinition.id, chartDifficulty);

  return {
    notes,
    duration: 198936, // TODO: Get from song metadata
    name: songDefinition.title,
    artist: songDefinition.artist,
    audioSource: songDefinition.audioAsset,
  };
}, [songDefinition, selectedDifficulty]);
```

## How Timing Works

The chart system applies timing offsets automatically:

```typescript
effectiveNoteTime = note.timeMs + globalCalibrationOffsetMs + chart.musicOffsetMs
```

Where:
- `note.timeMs` = Base timestamp from chart file
- `globalCalibrationOffsetMs` = User calibration (from calibrate screen)
- `chart.musicOffsetMs` = Per-song offset (optional, defaults to 0)

## Creating New Charts

### Step 1: Create chart file

```typescript
// src/features/songs/charts/mySong.normal.ts
import type { SongChart } from '../types';

export const mySongNormal: SongChart = {
  songId: 'my-song',
  difficulty: 'normal',
  musicOffsetMs: 0, // Adjust if audio needs per-song offset
  notes: [
    { id: 'mys-n-001', lane: 0, timeMs: 2000, type: 'tap' },
    { id: 'mys-n-002', lane: 1, timeMs: 2500, type: 'tap' },
    { id: 'mys-n-003', lane: 2, timeMs: 3000, type: 'tap' },
    { id: 'mys-n-004', lane: 3, timeMs: 3500, type: 'tap' },
    // Add more notes...
  ],
};
```

### Step 2: Register in catalog

```typescript
// src/features/songs/catalog.ts
import { mySongNormal } from './charts/mySong.normal';

export const SONG_CATALOG: SongDefinition[] = [
  // ...existing songs
  {
    id: 'my-song',
    title: 'My Song',
    artist: 'Artist Name',
    audioAsset: require('../../assets/audio/my-song.mp3'),
    charts: {
      normal: mySongNormal,
    },
  },
];
```

## Chart Format Reference

### Lane Values
```
0 = Left lane
1 = Center-left lane
2 = Center-right lane
3 = Right lane
```

### Note Type
```typescript
type NoteType = 'tap'; // Currently only tap notes supported
// Future: 'hold', 'flick', etc.
```

### Timing Tips
- Use BPM calculators to find beat intervals
- Place notes on beat multiples for natural rhythm
- Example for 124 BPM: beat = 60000/124 = 484ms
- Example for 136 BPM: beat = 60000/136 = 441ms

## Migration Strategy

1. **Phase 1 (Current)**: Charts exist alongside auto-generated notes
2. **Phase 2**: Add charts for all songs/difficulties
3. **Phase 3**: Remove auto-generation fallback
4. **Phase 4**: Add advanced features (hold notes, etc.)

## Backward Compatibility

The system maintains backward compatibility:
- If no chart exists for a song/difficulty, returns empty array
- Existing `Note` interface unchanged
- Game engine requires no modifications
- Scoring, rendering, hit detection all work as before

## Next Steps

1. Integrate chart loading in `GameScreen.tsx`
2. Test with existing songs (DORADA, Raba Raba)
3. Create remaining difficulty charts (easy, hard)
4. Add audio sync fine-tuning per chart
5. Implement chart editor tool (optional)
