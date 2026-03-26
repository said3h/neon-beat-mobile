import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import {
  GameState,
  Note,
  HitResult,
  Particle,
  FloatingText,
  DIFFICULTY_CONFIG,
  SCORE_BASE,
  getComboMultiplier,
  COLORS,
} from './config';

export interface EngineState {
  notes: Note[];
  gameState: GameState;
  particles: Particle[];
  texts: FloatingText[];
  pressedLanes: boolean[];
  currentTime: number;
  audioOffset: number;
}

export function useGameEngine() {
  const engineRef = useRef<EngineState>({
    notes: [],
    gameState: {
      score: 0,
      combo: 0,
      maxCombo: 0,
      health: 70,
      perfects: 0,
      goods: 0,
      okays: 0,
      misses: 0,
      isPlaying: false,
      isGameOver: false,
    },
    particles: [],
    texts: [],
    pressedLanes: [false, false, false, false],
    currentTime: 0,
    audioOffset: 0,
  });

  const audioRef = useRef<Audio.Sound | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);

  // Inicializar el motor con notas
  const init = useCallback((notes: Note[]) => {
    engineRef.current = {
      ...engineRef.current,
      notes: notes.map(n => ({ ...n, hit: false, missed: false })),
      gameState: {
        score: 0,
        combo: 0,
        maxCombo: 0,
        health: 70,
        perfects: 0,
        goods: 0,
        okays: 0,
        misses: 0,
        isPlaying: true,
        isGameOver: false,
      },
      particles: [],
      texts: [],
      pressedLanes: [false, false, false, false],
      currentTime: 0,
    };
  }, []);

  // Obtener tiempo actual del juego
  const getCurrentTime = useCallback((): number => {
    return performance.now() - startTimeRef.current + engineRef.current.audioOffset;
  }, []);

  // Determinar resultado del hit
  const getHitResult = useCallback((distance: number): HitResult | null => {
    const { PERFECT_WIN, GOOD_WIN, OK_WIN, HIT_WIN } = DIFFICULTY_CONFIG;
    
    if (distance <= PERFECT_WIN) return 'PERFECT';
    if (distance <= GOOD_WIN) return 'GOOD';
    if (distance <= OK_WIN) return 'OK';
    if (distance <= HIT_WIN) return 'MISS';
    return null;
  }, []);

  // Spawn de partículas
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 16) => {
    for (let i = 0; i < count; i++) {
      engineRef.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 12,
        life: 1,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }, []);

  // Spawn de texto flotante
  const spawnText = useCallback((text: string, x: number, y: number, color: string) => {
    engineRef.current.texts.push({
      text,
      x,
      y,
      life: 1,
      color,
    });
  }, []);

  // Procesar golpe en un lane
  const hitLane = useCallback(async (lane: number) => {
    const engine = engineRef.current;
    const now = getCurrentTime();
    const { HIT_WIN } = DIFFICULTY_CONFIG;

    // Buscar la nota más cercana en el lane
    let bestNote: Note | null = null;
    let bestDistance = Infinity;

    for (const note of engine.notes) {
      if (!note.hit && !note.missed && note.lane === lane) {
        const distance = Math.abs(note.time - now);
        if (distance < HIT_WIN * 1.6 && distance < bestDistance) {
          bestNote = note;
          bestDistance = distance;
        }
      }
    }

    // Si hay una nota en rango
    if (bestNote && bestDistance <= HIT_WIN) {
      const result = getHitResult(bestDistance);
      const multiplier = getComboMultiplier(engine.gameState.combo);

      if (result === 'PERFECT') {
        bestNote.hit = true;
        engine.gameState.score += SCORE_BASE.PERFECT * multiplier;
        engine.gameState.combo++;
        engine.gameState.maxCombo = Math.max(engine.gameState.maxCombo, engine.gameState.combo);
        engine.gameState.perfects++;
        engine.gameState.health = Math.min(100, engine.gameState.health + 6);
        
        spawnParticles(lane * 80 + 40, 80 * 0.82, COLORS[lane]);
        spawnText('PERFECT', lane * 80 + 40, 80 * 0.82 - 30, '#39ff14');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (result === 'GOOD') {
        bestNote.hit = true;
        engine.gameState.score += SCORE_BASE.GOOD * multiplier;
        engine.gameState.combo++;
        engine.gameState.maxCombo = Math.max(engine.gameState.maxCombo, engine.gameState.combo);
        engine.gameState.goods++;
        engine.gameState.health = Math.min(100, engine.gameState.health + 4);
        
        spawnParticles(lane * 80 + 40, 80 * 0.82, COLORS[lane], 12);
        spawnText('GOOD', lane * 80 + 40, 80 * 0.82 - 30, '#ccff00');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (result === 'OK') {
        bestNote.hit = true;
        engine.gameState.score += SCORE_BASE.OK * multiplier;
        engine.gameState.combo++;
        engine.gameState.maxCombo = Math.max(engine.gameState.maxCombo, engine.gameState.combo);
        engine.gameState.okays++;
        engine.gameState.health = Math.min(100, engine.gameState.health + 2);
        
        spawnParticles(lane * 80 + 40, 80 * 0.82, COLORS[lane], 8);
        spawnText('OK', lane * 80 + 40, 80 * 0.82 - 30, '#00ffff');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (result === 'MISS') {
        bestNote.missed = true;
        engine.gameState.combo = 0;
        engine.gameState.misses++;
        engine.gameState.health -= 8;
        
        spawnText('MISS', lane * 80 + 40, 80 * 0.82 - 30, '#ff073a');
      }

      // Verificar game over
      if (engine.gameState.health <= 0) {
        engine.gameState.health = 0;
        engine.gameState.isGameOver = true;
        engine.gameState.isPlaying = false;
      }
    }
  }, [getCurrentTime, getHitResult, spawnParticles, spawnText]);

  // Actualizar partículas
  const updateParticles = useCallback(() => {
    const engine = engineRef.current;
    for (let i = engine.particles.length - 1; i >= 0; i--) {
      const p = engine.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravedad
      p.life -= 0.04;
      if (p.life <= 0) {
        engine.particles.splice(i, 1);
      }
    }
  }, []);

  // Actualizar textos flotantes
  const updateTexts = useCallback(() => {
    const engine = engineRef.current;
    for (let i = engine.texts.length - 1; i >= 0; i--) {
      const t = engine.texts[i];
      t.y -= 1.2;
      t.life -= 0.022;
      if (t.life <= 0) {
        engine.texts.splice(i, 1);
      }
    }
  }, []);

  // Verificar misses automáticos
  const checkMisses = useCallback(() => {
    const engine = engineRef.current;
    const now = getCurrentTime();
    const { HIT_WIN } = DIFFICULTY_CONFIG;

    for (const note of engine.notes) {
      if (!note.hit && !note.missed && now > note.time + HIT_WIN) {
        note.missed = true;
        engine.gameState.combo = 0;
        engine.gameState.misses++;
        engine.gameState.health -= 8;
        
        if (engine.gameState.health <= 0) {
          engine.gameState.health = 0;
          engine.gameState.isGameOver = true;
          engine.gameState.isPlaying = false;
        }
      }
    }
  }, [getCurrentTime]);

  // Iniciar juego con audio
  const startGame = useCallback(async (audioUri: string) => {
    try {
      // Cargar audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }
      );
      audioRef.current = sound;

      // Iniciar juego
      startTimeRef.current = performance.now();
      
      // Reproducir audio
      await sound.playAsync();
      
      engineRef.current.gameState.isPlaying = true;
    } catch (error) {
      console.error('Error starting audio:', error);
      // Si falla el audio, iniciar igual sin él
      startTimeRef.current = performance.now();
      engineRef.current.gameState.isPlaying = true;
    }
  }, []);

  // Detener juego
  const stopGame = useCallback(async () => {
    if (audioRef.current) {
      await audioRef.current.stopAsync();
      await audioRef.current.unloadAsync();
      audioRef.current = null;
    }
    engineRef.current.gameState.isPlaying = false;
  }, []);

  // Actualizar offset de audio
  const setAudioOffset = useCallback((offset: number) => {
    engineRef.current.audioOffset = offset;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const engine = engineRef.current;
    
    if (!engine.gameState.isPlaying || engine.gameState.isGameOver) {
      return;
    }

    // Actualizar tiempo
    engine.currentTime = getCurrentTime();

    // Actualizar partículas y textos
    updateParticles();
    updateTexts();

    // Verificar misses
    checkMisses();

    // Continuar game loop
    rafIdRef.current = requestAnimationFrame(gameLoop);
  }, [getCurrentTime, updateParticles, updateTexts, checkMisses]);

  // Iniciar game loop
  const startLoop = useCallback(() => {
    rafIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Detener game loop
  const stopLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopLoop();
      stopGame();
    };
  }, [stopLoop, stopGame]);

  return {
    engineRef,
    init,
    hitLane,
    startGame,
    stopGame,
    startLoop,
    stopLoop,
    setAudioOffset,
    getCurrentTime,
  };
}
