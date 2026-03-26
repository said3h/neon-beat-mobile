// Configuración global del juego
export const COLORS = ['#39ff14', '#ff073a', '#ccff00', '#00ffff'];
export const NUM_LANES = 4;
export const LANE_WIDTH = 80;

// Configuración de dificultad
export const DIFFICULTY_CONFIG = {
  TRAVEL_MS: 1700,        // Tiempo de viaje de las notas
  TARGET_Y: 0.82,         // Posición Y de la línea de golpeo (0-1)
  HIT_WIN: 150,           // Ventana de golpeo total (ms)
  PERFECT_WIN: 45,        // Ventana para PERFECTO (ms)
  GOOD_WIN: 90,           // Ventana para GENIAL (ms)
  OK_WIN: 140,            // Ventana para OK (ms)
};

// Puntuación base
export const SCORE_BASE = {
  PERFECT: 100,
  GOOD: 50,
  OK: 25,
  MISS: 0,
};

// Multiplicador de combo (cada 10 combos aumenta el multiplicador)
export const getComboMultiplier = (combo: number): number => {
  return Math.min(4, 1 + Math.floor(combo / 10));
};

// Tipos de hit
export type HitResult = 'PERFECT' | 'GOOD' | 'OK' | 'MISS';

// Interfaz de Nota
export interface Note {
  id: number;
  time: number;         // Tiempo de aparición (ms desde inicio)
  lane: number;         // Carril (0-3)
  hit: boolean;
  missed: boolean;
}

// Interfaz de estado del juego
export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  health: number;
  perfects: number;
  goods: number;
  okays: number;
  misses: number;
  isPlaying: boolean;
  isGameOver: boolean;
}

// Interfaz de partícula
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

// Interfaz de texto flotante
export interface FloatingText {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}
