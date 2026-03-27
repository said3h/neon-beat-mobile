# Chart System Implementation Summary

## ✅ Completed Tasks

### 1. Type Definitions (`src/features/songs/types.ts`)
- `Lane = 0 | 1 | 2 | 3`
- `NoteType = 'tap'`
- `ChartNote` - Timestamped note with id, lane, time, type
- `SongChart` - Complete chart for a song/difficulty
- `SongDefinition` - Full song with metadata and multiple charts

### 2. Example Charts

**DORADA - Normal** (`src/features/songs/charts/dorada.normal.ts`)
- 35 notes
- Spans intro, verses, chorus, and bridge
- BPM: 124

**Raba Raba - Normal** (`src/features/songs/charts/rabaRaba.normal.ts`)
- 32 notes
- Includes intro, verse, pre-chorus, chorus, outro
- BPM: 136

### 3. Song Catalog (`src/features/songs/catalog.ts`)
- Central registry of all songs
- Functions: `getSongById()`, `getChartForSong()`, `getAvailableDifficulties()`
- Ready for easy expansion

### 4. Chart Loader (`src/features/songs/chartLoader.ts`)
- `convertChartToNotes()` - Converts chart notes to legacy Note format
- `loadChartForSong()` - Loads chart and applies calibration
- Automatic timing: `effectiveTime = note.timeMs + globalOffset + musicOffset`

### 5. Audio Calibration Persistence

**Updated `src/game/audioCalibration.ts`:**
- Now uses AsyncStorage for persistence
- `getAudioCalibrationOffsetAsync()` - Load from storage
- `setAudioCalibrationOffset()` - Save to storage
- `resetAudioCalibration()` - Clear calibration

**Updated `app/calibrate.tsx`:**
- Loads calibration on mount (async)
- Saves calibration on finish (async)
- Reset button clears storage

**Updated `src/components/GameScreen.tsx`:**
- Loads calibration async at session start
- Ensures persisted offset is applied every game session

### 6. Dependencies

**Updated `package.json`:**
```json
"@react-native-async-storage/async-storage": "^2.1.0"
```

---

## 📁 File Structure Created

```
src/features/songs/
├── types.ts                      # Type definitions
├── catalog.ts                    # Song registry
├── chartLoader.ts                # Chart loading utilities
├── index.ts                      # Clean exports
├── INTEGRATION.md                # Integration guide
├── GAME_INTEGRATION_EXAMPLE.ts   # Copy-paste integration code
└── charts/
    ├── dorada.normal.ts          # DORADA normal chart (35 notes)
    └── rabaRaba.normal.ts        # Raba Raba normal chart (32 notes)
```

---

## 🔧 How to Integrate in GameScreen.tsx

### Quick Integration (3 steps):

**Step 1: Add imports**
```typescript
import { getSongById, loadChartForSong } from '../features/songs';
```

**Step 2: Replace song loading**
```typescript
// REPLACE:
const song = useMemo(() => getSongByTrackId(params.trackId), [params.trackId]);

// WITH:
const songDefinition = useMemo(
  () => getSongById(params.trackId),
  [params.trackId]
);

const song = useMemo(() => {
  if (!songDefinition) return null;
  
  const difficultyMap: Record<string, 'easy' | 'normal' | 'hard'> = {
    'EASY': 'easy',
    'NORMAL': 'normal',
    'HARD': 'hard',
    'EXPERT': 'hard',
  };
  
  const chartDifficulty = difficultyMap[selectedDifficulty] || 'normal';
  const notes = loadChartForSong(songDefinition.id, chartDifficulty);
  
  const lastNoteTime = notes.length > 0 
    ? Math.max(...notes.map(n => n.time)) 
    : 0;
  
  return {
    notes,
    duration: lastNoteTime + 10000,
    name: songDefinition.title,
    artist: songDefinition.artist,
    audioSource: songDefinition.audioAsset,
  };
}, [songDefinition, selectedDifficulty]);
```

**Step 3: Install dependencies**
```bash
npm install
```

---

## 🎯 Timing System

Charts apply timing offsets automatically:

```typescript
effectiveNoteTime = note.timeMs + globalCalibrationOffsetMs + chart.musicOffsetMs
```

| Component | Value | Purpose |
|-----------|-------|---------|
| `note.timeMs` | From chart | Base timestamp |
| `globalCalibrationOffsetMs` | User setting (-200 to +200ms) | User calibration |
| `chart.musicOffsetMs` | Per-song (default 0) | Fine-tune per track |

---

## 🎵 Creating New Charts

### Template:
```typescript
import type { SongChart } from '../types';

export const mySongChart: SongChart = {
  songId: 'my-song',
  difficulty: 'normal',
  musicOffsetMs: 0,
  notes: [
    { id: 'mys-n-001', lane: 0, timeMs: 2000, type: 'tap' },
    { id: 'mys-n-002', lane: 1, timeMs: 2500, type: 'tap' },
    // Add more notes...
  ],
};
```

### BPM Reference:
| BPM | Beat Interval |
|-----|---------------|
| 124 | 484ms |
| 136 | 441ms |
| 140 | 429ms |
| 150 | 400ms |

### Tips:
- Place notes on beat multiples for natural rhythm
- Use 1/4, 1/8, 1/16 beat subdivisions for variety
- Leave breathing room between phrases
- Test with calibration offset to verify timing

---

## ✅ Backward Compatibility

- Existing `Note` interface unchanged
- Game engine requires no modifications
- Scoring, rendering, hit detection work as before
- Falls back to empty array if chart missing (with warning)

---

## 🚀 Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Integrate in GameScreen.tsx** (see GAME_INTEGRATION_EXAMPLE.ts)

3. **Test charts:**
   - Play DORADA normal
   - Play Raba Raba normal
   - Verify calibration persists after app restart

4. **Create more charts:**
   - Easy difficulties for both songs
   - Hard/Expert difficulties
   - New songs

5. **Optional enhancements:**
   - Chart editor tool
   - Import/export charts
   - Community chart sharing

---

## 📋 Migration Checklist

- [ ] Install AsyncStorage dependency
- [ ] Copy integration code to GameScreen.tsx
- [ ] Test with existing songs
- [ ] Verify calibration persistence
- [ ] Create easy/hard charts
- [ ] Remove auto-generation fallback (optional)

---

## 🆘 Troubleshooting

**Charts not loading?**
- Check console for warnings about missing charts
- Verify songId matches between catalog and chart files
- Ensure difficulty string matches ('easy' | 'normal' | 'hard')

**Timing feels off?**
- Test with different calibration offsets
- Adjust `musicOffsetMs` per chart if needed
- Verify audio file matches the chart's BPM

**Calibration not persisting?**
- Check AsyncStorage is installed
- Verify calibrate screen uses async functions
- Test on device (AsyncStorage may not work in web preview)

---

**Status: Ready for integration** 🎮
