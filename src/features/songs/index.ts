// Song Feature Module
// Central export for all song-related types and utilities

export type {
  Lane,
  NoteType,
  Difficulty,
  ChartNote,
  SongChart,
  SongDefinition,
  LegacyNote,
} from './types';

export {
  SONG_CATALOG,
  getSongById,
  getChartForSong,
  getAvailableDifficulties,
} from './catalog';

export {
  convertChartToNotes,
  loadChartForSong,
} from './chartLoader';
