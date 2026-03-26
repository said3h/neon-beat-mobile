import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Canvas,
  Circle,
  Line,
  Rect,
  Group,
} from '@shopify/react-native-skia';
import {
  GameState,
  Note,
  Particle,
  FloatingText,
  DIFFICULTY_CONFIG,
  COLORS,
} from '../game/config';
import {
  GAME_CANVAS_HEIGHT,
  GAME_CANVAS_WIDTH,
  GAME_LANE_WIDTH,
  GAME_TARGET_Y,
} from '../game/layout';

interface GameCanvasProps {
  notes: Note[];
  gameState: GameState;
  particles: Particle[];
  texts: FloatingText[];
  pressedLanes: boolean[];
  currentTime: number;
  onHitLane: (lane: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  notes,
  gameState,
  particles,
  texts,
  pressedLanes,
  currentTime,
  onHitLane,
}) => {
  const touchedLanesRef = useRef<Set<number>>(new Set());

  const handleTouchStart = useCallback((e: any) => {
    const nativeEvent = e.nativeEvent;
    const touches = nativeEvent.touches || [];

    for (const touch of touches) {
      const lane = Math.floor(touch.x / GAME_LANE_WIDTH);
      if (lane >= 0 && lane < 4 && !touchedLanesRef.current.has(lane)) {
        touchedLanesRef.current.add(lane);
        onHitLane(lane);
      }
    }
  }, [onHitLane]);

  const handleTouchEnd = useCallback((e: any) => {
    const nativeEvent = e.nativeEvent;
    const touches = nativeEvent.touches || [];

    touchedLanesRef.current.clear();

    for (const touch of touches) {
      const lane = Math.floor(touch.x / GAME_LANE_WIDTH);
      if (lane >= 0 && lane < 4) {
        touchedLanesRef.current.add(lane);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.hudOverlay}>
        <Text style={styles.scoreText}>{gameState.score.toString().padStart(6, '0')}</Text>
        {gameState.combo > 1 && (
          <Text style={[styles.comboText, { color: COLORS[Math.min(gameState.combo - 1, 3)] }]}>
            {gameState.combo}x COMBO
          </Text>
        )}
      </View>

      <Canvas
        style={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Rect x={0} y={0} width={GAME_CANVAS_WIDTH} height={GAME_CANVAS_HEIGHT} color="#0a0a0a" />

        {Array.from({ length: 5 }).map((_, i) => (
          <Line
            key={i}
            p1={{ x: i * GAME_LANE_WIDTH, y: 0 }}
            p2={{ x: i * GAME_LANE_WIDTH, y: GAME_CANVAS_HEIGHT }}
            color={i === 0 || i === 4 ? '#333' : '#1a1a1a'}
            strokeWidth={i === 0 || i === 4 ? 2 : 1}
          />
        ))}

        <Line
          p1={{ x: 0, y: GAME_TARGET_Y }}
          p2={{ x: GAME_CANVAS_WIDTH, y: GAME_TARGET_Y }}
          color="#444"
          strokeWidth={2}
        />

        {Array.from({ length: 4 }).map((_, i) => (
          <Group key={i}>
            <Circle
              cx={i * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2}
              cy={GAME_TARGET_Y}
              r={GAME_LANE_WIDTH * 0.3}
              color={pressedLanes[i] ? '#fff' : COLORS[i] + '99'}
              strokeWidth={pressedLanes[i] ? 3 : 2}
            />
            {pressedLanes[i] && (
              <Circle
                cx={i * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2}
                cy={GAME_TARGET_Y}
                r={GAME_LANE_WIDTH * 0.4}
                color={COLORS[i] + '33'}
              />
            )}
          </Group>
        ))}

        {notes.map((note) => {
          if (note.hit || note.missed) {
            return null;
          }

          const timeDiff = note.time - currentTime;
          const progress = 1 - timeDiff / DIFFICULTY_CONFIG.TRAVEL_MS;

          if (progress < 0 || progress > 1.1) {
            return null;
          }

          const y = progress * GAME_TARGET_Y;
          const x = note.lane * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2;
          const scale = 0.35 + 0.65 * Math.min(1, progress);
          const radius = GAME_LANE_WIDTH * 0.28 * scale;

          return (
            <Group key={note.id}>
              <Circle
                cx={x}
                cy={y}
                r={radius * 1.6}
                color={COLORS[note.lane] + '18'}
              />
              <Circle
                cx={x}
                cy={y}
                r={radius * 1.15}
                color={COLORS[note.lane] + '30'}
              />
              <Circle
                cx={x}
                cy={y}
                r={radius}
                color={COLORS[note.lane] + 'dd'}
              />
              <Circle
                cx={x - radius * 0.22}
                cy={y - radius * 0.22}
                r={radius * 0.3}
                color="#ffffff55"
              />
            </Group>
          );
        })}

        {particles.map((particle, i) => (
          <Circle
            key={i}
            cx={particle.x}
            cy={particle.y}
            r={particle.size * particle.life}
            color={
              particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0')
            }
          />
        ))}

        <Rect
          x={0}
          y={GAME_CANVAS_HEIGHT - 8}
          width={GAME_CANVAS_WIDTH}
          height={8}
          color="#1a1a1a"
        />
        <Rect
          x={0}
          y={GAME_CANVAS_HEIGHT - 8}
          width={(GAME_CANVAS_WIDTH * gameState.health) / 100}
          height={8}
          color={gameState.health > 60 ? '#39ff14' : gameState.health > 30 ? '#ccff00' : '#ff073a'}
        />
      </Canvas>

      <View pointerEvents="none" style={styles.textOverlay}>
        {texts.map((text, i) => (
          <View
            key={i}
            style={[
              styles.floatingTextContainer,
              {
                left: text.x - 50,
                top: text.y - 12,
                opacity: text.life,
              },
            ]}
          >
            <Text style={[styles.floatingText, { color: text.color, textShadowColor: text.color }]}>
              {text.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: GAME_CANVAS_WIDTH,
    height: GAME_CANVAS_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: GAME_CANVAS_WIDTH,
    height: GAME_CANVAS_HEIGHT,
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    zIndex: 10,
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingTextContainer: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
  },
  floatingText: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  comboText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
