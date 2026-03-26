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
import { GAME_TARGET_Y, getLaneCenterX } from './layout';

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
  const startTimeRef = useRef(0);
  const rafIdRef = useRef(0);

  const cleanupAudio = useCallback(async () => {
    const sound = audioRef.current;
    if (!sound) {
      return;
    }

    audioRef.current = null;

    try {
      await sound.stopAsync();
    } catch (error) {
      // Ignore stop errors when the sound has not started yet.
    }

    try {
      await sound.unloadAsync();
    } catch (error) {
      // Ignore unload errors so cleanup never blocks game shutdown.
    }
  }, []);

  const setGameOver = useCallback(() => {
    const engine = engineRef.current;
    if (engine.gameState.isGameOver) {
      return;
    }

    engine.gameState.health = 0;
    engine.gameState.isGameOver = true;
    engine.gameState.isPlaying = false;
    void cleanupAudio();
  }, [cleanupAudio]);

  const init = useCallback((notes: Note[]) => {
    startTimeRef.current = 0;

    engineRef.current = {
      ...engineRef.current,
      notes: notes.map((note) => ({ ...note, hit: false, missed: false })),
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
    };
  }, []);

  const getCurrentTime = useCallback((): number => {
    return performance.now() - startTimeRef.current + engineRef.current.audioOffset;
  }, []);

  const getHitResult = useCallback((distance: number): HitResult | null => {
    const { PERFECT_WIN, GOOD_WIN, OK_WIN, HIT_WIN } = DIFFICULTY_CONFIG;

    if (distance <= PERFECT_WIN) return 'PERFECT';
    if (distance <= GOOD_WIN) return 'GOOD';
    if (distance <= OK_WIN) return 'OK';
    if (distance <= HIT_WIN) return 'MISS';
    return null;
  }, []);

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

  const spawnText = useCallback((text: string, x: number, y: number, color: string) => {
    engineRef.current.texts.push({
      text,
      x,
      y,
      life: 1,
      color,
    });
  }, []);

  const hitLane = useCallback(async (lane: number) => {
    const engine = engineRef.current;
    const now = getCurrentTime();
    const { HIT_WIN } = DIFFICULTY_CONFIG;
    const hitX = getLaneCenterX(lane);
    const hitY = GAME_TARGET_Y;

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

        spawnParticles(hitX, hitY, COLORS[lane]);
        spawnText('PERFECT', hitX, hitY - 30, '#39ff14');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (result === 'GOOD') {
        bestNote.hit = true;
        engine.gameState.score += SCORE_BASE.GOOD * multiplier;
        engine.gameState.combo++;
        engine.gameState.maxCombo = Math.max(engine.gameState.maxCombo, engine.gameState.combo);
        engine.gameState.goods++;
        engine.gameState.health = Math.min(100, engine.gameState.health + 4);

        spawnParticles(hitX, hitY, COLORS[lane], 12);
        spawnText('GOOD', hitX, hitY - 30, '#ccff00');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (result === 'OK') {
        bestNote.hit = true;
        engine.gameState.score += SCORE_BASE.OK * multiplier;
        engine.gameState.combo++;
        engine.gameState.maxCombo = Math.max(engine.gameState.maxCombo, engine.gameState.combo);
        engine.gameState.okays++;
        engine.gameState.health = Math.min(100, engine.gameState.health + 2);

        spawnParticles(hitX, hitY, COLORS[lane], 8);
        spawnText('OK', hitX, hitY - 30, '#00ffff');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (result === 'MISS') {
        bestNote.missed = true;
        engine.gameState.combo = 0;
        engine.gameState.misses++;
        engine.gameState.health -= 8;

        spawnText('MISS', hitX, hitY - 30, '#ff073a');
      }

      if (engine.gameState.health <= 0) {
        setGameOver();
      }
    }
  }, [getCurrentTime, getHitResult, setGameOver, spawnParticles, spawnText]);

  const updateParticles = useCallback(() => {
    const engine = engineRef.current;
    for (let i = engine.particles.length - 1; i >= 0; i--) {
      const particle = engine.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.35;
      particle.life -= 0.04;
      if (particle.life <= 0) {
        engine.particles.splice(i, 1);
      }
    }
  }, []);

  const updateTexts = useCallback(() => {
    const engine = engineRef.current;
    for (let i = engine.texts.length - 1; i >= 0; i--) {
      const text = engine.texts[i];
      text.y -= 1.2;
      text.life -= 0.022;
      if (text.life <= 0) {
        engine.texts.splice(i, 1);
      }
    }
  }, []);

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
          setGameOver();
        }
      }
    }
  }, [getCurrentTime, setGameOver]);

  const startGame = useCallback(async (audioUri: string) => {
    try {
      await cleanupAudio();

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }
      );
      audioRef.current = sound;

      startTimeRef.current = performance.now();
      engineRef.current.currentTime = 0;

      await sound.playAsync();

      engineRef.current.gameState.isPlaying = true;
    } catch (error) {
      console.error('Error starting audio:', error);
      startTimeRef.current = performance.now();
      engineRef.current.currentTime = 0;
      engineRef.current.gameState.isPlaying = true;
    }
  }, [cleanupAudio]);

  const stopGame = useCallback(async () => {
    await cleanupAudio();
    engineRef.current.gameState.isPlaying = false;
  }, [cleanupAudio]);

  const setAudioOffset = useCallback((offset: number) => {
    engineRef.current.audioOffset = offset;
  }, []);

  const gameLoop = useCallback(() => {
    const engine = engineRef.current;

    if (!engine.gameState.isPlaying || engine.gameState.isGameOver) {
      return;
    }

    engine.currentTime = getCurrentTime();
    updateParticles();
    updateTexts();
    checkMisses();

    rafIdRef.current = requestAnimationFrame(gameLoop);
  }, [checkMisses, getCurrentTime, updateParticles, updateTexts]);

  const startLoop = useCallback(() => {
    rafIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const stopLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopLoop();
      void stopGame();
    };
  }, [stopGame, stopLoop]);

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
