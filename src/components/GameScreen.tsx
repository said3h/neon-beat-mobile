import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GameCanvas } from './GameCanvas';
import { useGameEngine } from '../game/useGameEngine';
import { TEST_SONG } from '../game/songData';
import { getAudioCalibrationOffset } from '../game/audioCalibration';

const COLORS = ['#39ff14', '#ff073a', '#ccff00', '#00ffff'];

export default function GameScreen() {
  const {
    engineRef,
    init,
    hitLane,
    startGame,
    stopGame,
    startLoop,
    stopLoop,
    setAudioOffset,
  } = useGameEngine();

  const [, setTick] = useState(0);

  useEffect(() => {
    let isActive = true;
    let rafId = 0;

    init(TEST_SONG.notes);
    setAudioOffset(getAudioCalibrationOffset());

    const renderLoop = () => {
      setTick((tick) => tick + 1);

      if (engineRef.current.gameState.isGameOver) {
        return;
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    const bootGame = async () => {
      await startGame(TEST_SONG.audioUri);

      if (!isActive) {
        await stopGame();
        return;
      }

      startLoop();
      rafId = requestAnimationFrame(renderLoop);
    };

    void bootGame();

    return () => {
      isActive = false;
      cancelAnimationFrame(rafId);
      stopLoop();
      void stopGame();
    };
  }, [engineRef, init, setAudioOffset, startGame, startLoop, stopGame, stopLoop]);

  const handleHitLane = useCallback((lane: number) => {
    hitLane(lane);
    engineRef.current.pressedLanes[lane] = true;

    setTimeout(() => {
      engineRef.current.pressedLanes[lane] = false;
    }, 100);
  }, [engineRef, hitLane]);

  const { gameState, notes, particles, texts, pressedLanes, currentTime } = engineRef.current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NEON BEAT</Text>
        <Text style={styles.subtitle}>Prototype</Text>
      </View>

      <GameCanvas
        notes={notes}
        gameState={gameState}
        particles={particles}
        texts={texts}
        pressedLanes={pressedLanes}
        currentTime={currentTime}
        onHitLane={handleHitLane}
      />

      <View style={styles.controls}>
        {Array.from({ length: 4 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.laneButton,
              { backgroundColor: pressedLanes[i] ? '#fff' : COLORS[i] + '66' },
            ]}
            onPressIn={() => handleHitLane(i)}
            activeOpacity={0.7}
          />
        ))}
      </View>

      <View style={styles.stats}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Perfect:</Text>
          <Text style={styles.statValue}>{gameState.perfects}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Good:</Text>
          <Text style={styles.statValue}>{gameState.goods}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Miss:</Text>
          <Text style={styles.statValue}>{gameState.misses}</Text>
        </View>
      </View>

      {gameState.isGameOver && (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverTitle}>GAME OVER</Text>
          <Text style={styles.gameOverScore}>Score: {gameState.score}</Text>
          <Text style={styles.gameOverMaxCombo}>Max Combo: {gameState.maxCombo}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#39ff14',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  laneButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  statRow: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverTitle: {
    color: '#ff073a',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameOverScore: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 10,
  },
  gameOverMaxCombo: {
    color: '#ccff00',
    fontSize: 20,
  },
});
