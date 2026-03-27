import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameCanvas } from './GameCanvas';
import { GameState, COLORS } from '../game/config';
import { useGameEngine } from '../game/useGameEngine';
import { GAME_CANVAS_WIDTH } from '../game/layout';
import { getSongByTrackId } from '../game/songData';
import { getAudioCalibrationOffset } from '../game/audioCalibration';
import { glow, neon } from '../theme/neon';

type SessionPhase = 'booting' | 'playing' | 'paused' | 'completed' | 'gameover';

const COMPLETE_BUFFER_MS = 900;

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function getAccuracy(gameState: GameState): number {
  const totalHits =
    gameState.perfects + gameState.goods + gameState.okays + gameState.misses;

  if (!totalHits) {
    return 0;
  }

  const weightedHits =
    gameState.perfects * 100 + gameState.goods * 80 + gameState.okays * 55;

  return (weightedHits / (totalHits * 100)) * 100;
}

function getRank(gameState: GameState, accuracy: number): string {
  if (accuracy >= 98 && gameState.misses === 0) {
    return 'S+';
  }

  if (accuracy >= 95) {
    return 'S';
  }

  if (accuracy >= 90) {
    return 'A';
  }

  if (accuracy >= 82) {
    return 'B';
  }

  if (accuracy >= 72) {
    return 'C';
  }

  return 'D';
}

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trackId?: string; difficulty?: string }>();
  const {
    engineRef,
    init,
    hitLane,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    startLoop,
    stopLoop,
    setAudioOffset,
  } = useGameEngine();

  const [, setTick] = useState(0);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('booting');
  const song = useMemo(() => getSongByTrackId(params.trackId), [params.trackId]);
  const selectedDifficulty = useMemo(() => {
    const rawDifficulty = Array.isArray(params.difficulty)
      ? params.difficulty[0]
      : params.difficulty;

    return rawDifficulty ? rawDifficulty.toUpperCase() : 'HARD';
  }, [params.difficulty]);

  const renderRafRef = useRef(0);
  const bootIdRef = useRef(0);
  const sessionPhaseRef = useRef<SessionPhase>('booting');
  const laneTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout> | null>>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    sessionPhaseRef.current = sessionPhase;
  }, [sessionPhase]);

  const forceRender = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);

  const clearLaneTimeouts = useCallback(() => {
    laneTimeoutsRef.current.forEach((timeoutId, index) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        laneTimeoutsRef.current[index] = null;
      }
    });
  }, []);

  const stopRenderLoop = useCallback(() => {
    if (renderRafRef.current) {
      cancelAnimationFrame(renderRafRef.current);
      renderRafRef.current = 0;
    }
  }, []);

  const concludeSession = useCallback(
    (nextPhase: 'completed' | 'gameover') => {
      stopRenderLoop();
      stopLoop();
      setSessionPhase(nextPhase);
      forceRender();
      void stopGame();
    },
    [forceRender, stopGame, stopLoop, stopRenderLoop]
  );

  const startRenderLoop = useCallback(() => {
    stopRenderLoop();

    const render = () => {
      const engine = engineRef.current;

      forceRender();

      if (engine.gameState.isGameOver) {
        concludeSession('gameover');
        return;
      }

      if (engine.currentTime >= song.duration + COMPLETE_BUFFER_MS) {
        concludeSession('completed');
        return;
      }

      if (!engine.gameState.isPlaying) {
        return;
      }

      renderRafRef.current = requestAnimationFrame(render);
    };

    renderRafRef.current = requestAnimationFrame(render);
  }, [concludeSession, engineRef, forceRender, song.duration, stopRenderLoop]);

  const bootSession = useCallback(async () => {
    const bootId = bootIdRef.current + 1;
    bootIdRef.current = bootId;

    clearLaneTimeouts();
    stopRenderLoop();
    stopLoop();
    await stopGame();

    init(song.notes);
    setAudioOffset(getAudioCalibrationOffset());
    setSessionPhase('booting');
    forceRender();

    await startGame(song.audioSource);

    if (bootIdRef.current !== bootId) {
      await stopGame();
      return;
    }

    startLoop();
    setSessionPhase('playing');
    forceRender();
    startRenderLoop();
  }, [
    clearLaneTimeouts,
    forceRender,
    init,
    song.audioSource,
    song.notes,
    setAudioOffset,
    startGame,
    startLoop,
    startRenderLoop,
    stopGame,
    stopLoop,
    stopRenderLoop,
  ]);

  useEffect(() => {
    void bootSession();

    return () => {
      bootIdRef.current += 1;
      clearLaneTimeouts();
      stopRenderLoop();
      stopLoop();
      void stopGame();
    };
  }, [bootSession, clearLaneTimeouts, stopGame, stopLoop, stopRenderLoop]);

  const handleHitLane = useCallback(
    (lane: number) => {
      if (sessionPhaseRef.current !== 'playing') {
        return;
      }

      hitLane(lane);
      engineRef.current.pressedLanes[lane] = true;

      const existingTimeout = laneTimeoutsRef.current[lane];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      laneTimeoutsRef.current[lane] = setTimeout(() => {
        engineRef.current.pressedLanes[lane] = false;
        laneTimeoutsRef.current[lane] = null;
      }, 90);
    },
    [engineRef, hitLane]
  );

  const handlePause = useCallback(async () => {
    if (sessionPhaseRef.current !== 'playing') {
      return;
    }

    await pauseGame();
    stopRenderLoop();
    setSessionPhase('paused');
    forceRender();
  }, [forceRender, pauseGame, stopRenderLoop]);

  const handleResume = useCallback(async () => {
    if (sessionPhaseRef.current !== 'paused') {
      return;
    }

    await resumeGame();
    startLoop();
    setSessionPhase('playing');
    forceRender();
    startRenderLoop();
  }, [forceRender, resumeGame, startLoop, startRenderLoop]);

  const handleExitToSongSelect = useCallback(async () => {
    bootIdRef.current += 1;
    clearLaneTimeouts();
    stopRenderLoop();
    stopLoop();
    await stopGame();
    router.replace('/song-select');
  }, [clearLaneTimeouts, router, stopGame, stopLoop, stopRenderLoop]);

  const handleGoHome = useCallback(async () => {
    bootIdRef.current += 1;
    clearLaneTimeouts();
    stopRenderLoop();
    stopLoop();
    await stopGame();
    router.replace('/');
  }, [clearLaneTimeouts, router, stopGame, stopLoop, stopRenderLoop]);

  const {
    gameState,
    notes,
    particles,
    texts,
    pressedLanes,
    currentTime,
  } = engineRef.current;

  const clampedCurrentTime = Math.max(0, currentTime);
  const accuracy = getAccuracy(gameState);
  const rank = getRank(gameState, accuracy);
  const progress = Math.min(1, clampedCurrentTime / song.duration);
  const healthTint =
    gameState.health > 55
      ? neon.colors.secondary
      : gameState.health > 25
        ? neon.colors.warning
        : neon.colors.danger;

  const renderOverlay = () => {
    if (sessionPhase === 'booting') {
      return (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayEyebrow}>SYNCING TRACK</Text>
            <Text style={styles.overlayTitle}>{song.name.toUpperCase()}</Text>
            <Text style={styles.overlayBody}>
              Loading audio and preparing the first drop.
            </Text>
          </View>
        </View>
      );
    }

    if (sessionPhase === 'paused') {
      return (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayEyebrow}>SESSION PAUSED</Text>
            <Text style={styles.overlayTitle}>Take A Breath</Text>
            <Text style={styles.overlayBody}>
              Jump back in when you are ready for the next streak.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.overlayPrimaryButton,
                pressed && styles.overlayButtonPressed,
              ]}
              onPress={() => {
                void handleResume();
              }}
            >
              <Text style={styles.overlayPrimaryButtonText}>RESUME SESSION</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.overlaySecondaryButton,
                pressed && styles.overlayButtonPressed,
              ]}
              onPress={() => {
                void bootSession();
              }}
            >
              <Text style={styles.overlaySecondaryButtonText}>RETRY TRACK</Text>
            </Pressable>

            <Pressable
              style={styles.overlayTextButton}
              onPress={() => {
                void handleExitToSongSelect();
              }}
            >
              <Text style={styles.overlayTextButtonText}>BACK TO SONG SELECT</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (sessionPhase === 'completed' || sessionPhase === 'gameover') {
      const isVictory = sessionPhase === 'completed';

      return (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text
              style={[
                styles.overlayEyebrow,
                isVictory && styles.overlayEyebrowVictory,
              ]}
            >
              {isVictory ? 'TRACK CLEARED' : 'SESSION LOST'}
            </Text>
            <Text style={styles.overlayTitle}>{isVictory ? 'Results' : 'Try Again'}</Text>

            <View
              style={[
                styles.rankBadge,
                isVictory ? styles.rankBadgeVictory : styles.rankBadgeFailure,
              ]}
            >
              <Text style={styles.rankBadgeText}>{rank}</Text>
            </View>

            <View style={styles.overlayStatsRow}>
              <View style={styles.overlayStatCard}>
                <Text style={styles.overlayStatLabel}>SCORE</Text>
                <Text style={styles.overlayStatValue}>
                  {gameState.score.toLocaleString()}
                </Text>
              </View>
              <View style={styles.overlayStatCard}>
                <Text style={styles.overlayStatLabel}>ACCURACY</Text>
                <Text style={styles.overlayStatValue}>{accuracy.toFixed(1)}%</Text>
              </View>
            </View>

            <View style={styles.overlayStatsRow}>
              <View style={styles.overlayStatCard}>
                <Text style={styles.overlayStatLabel}>MAX COMBO</Text>
                <Text style={styles.overlayStatValue}>{gameState.maxCombo}</Text>
              </View>
              <View style={styles.overlayStatCard}>
                <Text style={styles.overlayStatLabel}>MISSES</Text>
                <Text style={styles.overlayStatValue}>{gameState.misses}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.overlayPrimaryButton,
                pressed && styles.overlayButtonPressed,
              ]}
              onPress={() => {
                void bootSession();
              }}
            >
              <Text style={styles.overlayPrimaryButtonText}>PLAY AGAIN</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.overlaySecondaryButton,
                pressed && styles.overlayButtonPressed,
              ]}
              onPress={() => {
                void handleExitToSongSelect();
              }}
            >
              <Text style={styles.overlaySecondaryButtonText}>SONG SELECT</Text>
            </Pressable>

            <Pressable
              style={styles.overlayTextButton}
              onPress={() => {
                void handleGoHome();
              }}
            >
              <Text style={styles.overlayTextButtonText}>GO HOME</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.orb, styles.orbPrimary]} />
      <View style={[styles.orb, styles.orbSecondary]} />

      <View style={styles.screen}>
        <View style={styles.topPanel}>
          <View style={styles.topBar}>
            <Pressable
              style={({ pressed }) => [
                styles.pauseButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={() => {
                void handlePause();
              }}
            >
              <Text style={styles.pauseButtonText}>II</Text>
            </Pressable>

            <View style={styles.trackCard}>
              <Text style={styles.trackEyebrow}>NOW PLAYING</Text>
              <Text style={styles.trackTitle}>{song.name.toUpperCase()}</Text>
              <Text style={styles.trackArtist}>
                {song.artist} / {song.bpm} BPM / {selectedDifficulty}
              </Text>
            </View>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text style={styles.scoreValue}>{gameState.score.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.healthPanel}>
            <View style={styles.healthMetaRow}>
              <Text style={styles.healthLabel}>HEALTH</Text>
              <Text style={styles.healthValue}>{Math.max(0, gameState.health)}%</Text>
            </View>
            <View style={styles.healthTrack}>
              <View
                style={[
                  styles.healthFill,
                  {
                    width: `${Math.max(0, Math.min(100, gameState.health))}%`,
                    backgroundColor: healthTint,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.stage}>
          <GameCanvas
            notes={notes}
            gameState={gameState}
            particles={particles}
            texts={texts}
            pressedLanes={pressedLanes}
            currentTime={clampedCurrentTime}
            onHitLane={handleHitLane}
          />

          {sessionPhase === 'playing' && gameState.combo > 1 && (
            <View style={styles.comboBadge}>
              <Text style={styles.comboLabel}>COMBO</Text>
              <Text style={styles.comboValue}>{gameState.combo}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressTime}>{formatTime(clampedCurrentTime)}</Text>
            <Text style={styles.progressTrackName}>{song.name.toUpperCase()}</Text>
            <Text style={styles.progressTime}>{formatTime(song.duration)}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>PERFECT</Text>
              <Text style={styles.metaValue}>{gameState.perfects}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>ACCURACY</Text>
              <Text style={styles.metaValue}>{accuracy.toFixed(1)}%</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>RANK</Text>
              <Text style={styles.metaValue}>{rank}</Text>
            </View>
          </View>

          <View style={styles.laneHintRow}>
            {COLORS.map((color, index) => (
              <View key={index} style={styles.laneHint}>
                <View
                  style={[
                    styles.laneHintDot,
                    { backgroundColor: color, opacity: pressedLanes[index] ? 1 : 0.6 },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {renderOverlay()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: neon.colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orb: {
    position: 'absolute',
    borderRadius: neon.radius.full,
  },
  orbPrimary: {
    width: 260,
    height: 260,
    top: 120,
    right: -120,
    backgroundColor: 'rgba(255,140,147,0.08)',
  },
  orbSecondary: {
    width: 300,
    height: 300,
    left: -140,
    bottom: 90,
    backgroundColor: 'rgba(0,244,254,0.06)',
  },
  topPanel: {
    width: GAME_CANVAS_WIDTH,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pauseButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: neon.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButtonText: {
    color: neon.colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  iconButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  trackCard: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: neon.radius.lg,
    backgroundColor: 'rgba(25,25,31,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  trackEyebrow: {
    color: neon.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  trackTitle: {
    color: neon.colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  trackArtist: {
    color: neon.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  scoreCard: {
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: neon.radius.lg,
    backgroundColor: 'rgba(255,140,147,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,147,0.28)',
    alignItems: 'flex-end',
    ...glow(neon.colors.primary, 0.12, 16, 6),
  },
  scoreLabel: {
    color: neon.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  scoreValue: {
    color: neon.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  healthPanel: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: neon.radius.lg,
    backgroundColor: 'rgba(19,19,24,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  healthMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthLabel: {
    color: neon.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  healthValue: {
    color: neon.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  healthTrack: {
    height: 12,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.surfaceStrong,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: neon.radius.full,
  },
  stage: {
    position: 'relative',
    width: GAME_CANVAS_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.secondary, 0.08, 20, 8),
  },
  comboBadge: {
    position: 'absolute',
    top: 18,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(14,14,19,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  comboLabel: {
    color: neon.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  comboValue: {
    color: neon.colors.tertiarySoft,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '900',
  },
  bottomPanel: {
    width: GAME_CANVAS_WIDTH,
    gap: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrackName: {
    color: neon.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  progressTime: {
    color: neon.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.surfaceStrong,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(25,25,31,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  metaLabel: {
    color: neon.colors.textFaint,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  metaValue: {
    color: neon.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  laneHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  laneHint: {
    flex: 1,
    alignItems: 'center',
  },
  laneHintDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,12,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    borderRadius: neon.radius.xl,
    backgroundColor: 'rgba(19,19,24,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  overlayEyebrow: {
    color: neon.colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  overlayEyebrowVictory: {
    color: neon.colors.secondary,
  },
  overlayTitle: {
    color: neon.colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  overlayBody: {
    color: neon.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  rankBadge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rankBadgeVictory: {
    backgroundColor: 'rgba(0,244,254,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,244,254,0.26)',
    ...glow(neon.colors.secondary, 0.18, 18, 8),
  },
  rankBadgeFailure: {
    backgroundColor: 'rgba(255,115,81,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,115,81,0.24)',
    ...glow(neon.colors.danger, 0.18, 18, 8),
  },
  rankBadgeText: {
    color: neon.colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  overlayStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  overlayStatCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: neon.radius.md,
    backgroundColor: neon.colors.surface,
    alignItems: 'center',
  },
  overlayStatLabel: {
    color: neon.colors.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  overlayStatValue: {
    color: neon.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  overlayPrimaryButton: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 18,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.secondary, 0.2, 18, 8),
  },
  overlayPrimaryButtonText: {
    color: '#004346',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  overlaySecondaryButton: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlaySecondaryButtonText: {
    color: neon.colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  overlayButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  overlayTextButton: {
    marginTop: 14,
    paddingVertical: 8,
  },
  overlayTextButtonText: {
    color: neon.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
});
