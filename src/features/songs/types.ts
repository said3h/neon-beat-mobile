import type { AVPlaybackSource } from 'expo-av';

// ─────────────────────────────────────────────────────────────────────────────
// Chart Note Types
// ─────────────────────────────────────────────────────────────────────────────

export type Lane = 0 | 1 | 2 | 3;
export type NoteType = 'tap';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface ChartNote {
  id: string;
  lane: Lane;
  timeMs: number;
  type: NoteType;
}

export interface SongChart {
  songId: string;
  difficulty: Difficulty;
  musicOffsetMs?: number;
  notes: ChartNote[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Song Definition Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SongDefinition {
  id: string;
  title: string;
  artist: string;
  audioAsset: AVPlaybackSource;
  jacketAsset?: number;
  charts: {
    easy?: SongChart;
    normal?: SongChart;
    hard?: SongChart;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy compatibility types (for migration)
// ─────────────────────────────────────────────────────────────────────────────

export interface LegacyNote {
  id: number;
  time: number;
  lane: number;
  hit: boolean;
  missed: boolean;
}
