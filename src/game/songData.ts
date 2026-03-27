import type { AVPlaybackSource } from 'expo-av';
import { Note } from './config';

export interface SongData {
  notes: Note[];
  duration: number;
  name: string;
  artist: string;
  durationLabel: string;
  bpm: number;
  audioSource: AVPlaybackSource;
}

export interface TrackPreview {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  durationMs: number;
  durationLabel: string;
  difficultyOptions: string[];
  featuredAccent: 'mixed' | 'pink' | 'cyan';
  highScore: number;
  level: number;
  audioSource: AVPlaybackSource;
}

export const TRACK_LIBRARY: TrackPreview[] = [
  {
    id: 'dorada',
    title: 'DORADA',
    artist: 'SAID 3H',
    bpm: 124,
    durationMs: 198936,
    durationLabel: '03:18',
    difficultyOptions: ['Normal', 'Hard', 'Expert'],
    featuredAccent: 'mixed',
    highScore: 0,
    level: 9,
    audioSource: require('../../assets/audio/dorada.mp3'),
  },
  {
    id: 'raba-raba',
    title: 'Raba Raba',
    artist: 'SAID 3H',
    bpm: 136,
    durationMs: 149640,
    durationLabel: '02:29',
    difficultyOptions: ['Hard', 'Expert'],
    featuredAccent: 'pink',
    highScore: 0,
    level: 11,
    audioSource: require('../../assets/audio/raba-raba-said-3h.mp3'),
  },
];

export const PRIMARY_TRACK = TRACK_LIBRARY[0];
export const RECENT_TRACK = TRACK_LIBRARY[1];
export const UPCOMING_TRACKS = TRACK_LIBRARY.slice(2);

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export function buildSongFromTrack(track: TrackPreview): SongData {
  const notes: Note[] = [];
  const beatMs = 60000 / track.bpm;
  let id = 0;

  for (let time = 2000; time < track.durationMs - 2000; time += beatMs) {
    const lane = Math.floor(time / beatMs) % 4;

    notes.push({
      id: id++,
      time: Math.floor(time),
      lane,
      hit: false,
      missed: false,
    });

    if (Math.floor(time / beatMs) % 4 === 0 && time + beatMs / 2 < track.durationMs) {
      notes.push({
        id: id++,
        time: Math.floor(time + beatMs / 2),
        lane: (lane + 2) % 4,
        hit: false,
        missed: false,
      });
    }

    if (Math.floor(time / beatMs) % 8 === 0 && time + beatMs * 2 < track.durationMs) {
      for (let i = 0; i < 4; i++) {
        notes.push({
          id: id++,
          time: Math.floor(time + beatMs + i * (beatMs / 4)),
          lane: i,
          hit: false,
          missed: false,
        });
      }
    }
  }

  notes.sort((a, b) => a.time - b.time);

  return {
    notes,
    duration: track.durationMs,
    name: track.title,
    artist: track.artist,
    durationLabel: formatDuration(track.durationMs),
    bpm: track.bpm,
    audioSource: track.audioSource,
  };
}

export function getTrackById(trackId?: string | string[]): TrackPreview {
  const normalizedId = Array.isArray(trackId) ? trackId[0] : trackId;

  return (
    TRACK_LIBRARY.find((track) => track.id === normalizedId) ??
    PRIMARY_TRACK
  );
}

export function getSongByTrackId(trackId?: string | string[]): SongData {
  return buildSongFromTrack(getTrackById(trackId));
}

export const TEST_SONG = buildSongFromTrack(PRIMARY_TRACK);
