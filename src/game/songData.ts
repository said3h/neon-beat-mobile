// Datos de ejemplo para la canción prototipo
// En producción, esto se generaría dinámicamente o se cargaría desde un archivo

import { Note } from './config';

export interface SongData {
  notes: Note[];
  duration: number;
  name: string;
  bpm: number;
}

// Generador de notas básicas para testing
export function generateTestSong(bpm: number = 120, durationMs: number = 60000): SongData {
  const notes: Note[] = [];
  const beatMs = (60000 / bpm);
  let id = 0;

  // Generar notas en cada tiempo, distribuidas por lanes
  for (let time = 2000; time < durationMs - 2000; time += beatMs) {
    // Patrón básico: cada tiempo una nota en un lane diferente
    const lane = Math.floor((time / beatMs)) % 4;
    
    notes.push({
      id: id++,
      time: Math.floor(time),
      lane,
      hit: false,
      missed: false,
    });

    // Cada 4 tiempos, añadir un acorde (2 notas simultáneas)
    if (Math.floor((time / beatMs)) % 4 === 0 && time + beatMs / 2 < durationMs) {
      const otherLane = (lane + 2) % 4;
      notes.push({
        id: id++,
        time: Math.floor(time + beatMs / 2),
        lane: otherLane,
        hit: false,
        missed: false,
      });
    }

    // Cada 8 tiempos, añadir una ráfaga rápida
    if (Math.floor((time / beatMs)) % 8 === 0 && time + beatMs * 2 < durationMs) {
      for (let i = 0; i < 4; i++) {
        notes.push({
          id: id++,
          time: Math.floor(time + beatMs + (i * beatMs / 4)),
          lane: i,
          hit: false,
          missed: false,
        });
      }
    }
  }

  // Ordenar notas por tiempo
  notes.sort((a, b) => a.time - b.time);

  return {
    notes,
    duration: durationMs,
    name: 'Test Song',
    bpm,
  };
}

// Canción de ejemplo para el prototipo
export const TEST_SONG = generateTestSong(128, 90000); // 128 BPM, 90 segundos
