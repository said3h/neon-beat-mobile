import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Line,
  Rect,
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
  GAME_LANE_TOP,
  GAME_LANE_WIDTH,
  GAME_TARGET_Y,
  getLaneNoteY,
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
  particles,
  texts,
  pressedLanes,
  currentTime,
  onHitLane,
}) => {
  const touchedLanesRef = useRef<Set<number>>(new Set());

  const handleTouchStart = useCallback(
    (e: any) => {
      const nativeEvent = e.nativeEvent;
      const touches = nativeEvent.touches || [];

      for (const touch of touches) {
        const lane = Math.floor(touch.x / GAME_LANE_WIDTH);
        if (lane >= 0 && lane < 4 && !touchedLanesRef.current.has(lane)) {
          touchedLanesRef.current.add(lane);
          onHitLane(lane);
        }
      }
    },
    [onHitLane]
  );

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
      <Canvas
        style={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Rect x={0} y={0} width={GAME_CANVAS_WIDTH} height={GAME_CANVAS_HEIGHT} color="#101218" />

        {Array.from({ length: 4 }).map((_, i) => (
          <Rect
            key={`lane-bg-${i}`}
            x={i * GAME_LANE_WIDTH}
            y={0}
            width={GAME_LANE_WIDTH}
            height={GAME_CANVAS_HEIGHT}
            color={i % 2 === 0 ? '#12151d' : '#0e1117'}
          />
        ))}

        {Array.from({ length: 4 }).map((_, i) => (
          <Rect
            key={`lane-press-${i}`}
            x={i * GAME_LANE_WIDTH}
            y={GAME_LANE_TOP}
            width={GAME_LANE_WIDTH}
            height={GAME_TARGET_Y - GAME_LANE_TOP + 20}
            color={pressedLanes[i] ? `${COLORS[i]}14` : 'transparent'}
          />
        ))}

        {Array.from({ length: 5 }).map((_, i) => (
          <Line
            key={`lane-line-${i}`}
            p1={{ x: i * GAME_LANE_WIDTH, y: 0 }}
            p2={{ x: i * GAME_LANE_WIDTH, y: GAME_CANVAS_HEIGHT }}
            color={i === 0 || i === 4 ? '#232630' : '#1a1d26'}
            strokeWidth={i === 0 || i === 4 ? 2 : 1}
          />
        ))}

        <Rect
          x={0}
          y={GAME_TARGET_Y - 2}
          width={GAME_CANVAS_WIDTH}
          height={4}
          color="rgba(255,255,255,0.14)"
        />
        <Rect
          x={0}
          y={GAME_TARGET_Y}
          width={GAME_CANVAS_WIDTH}
          height={1}
          color="rgba(255,255,255,0.40)"
        />

        {Array.from({ length: 4 }).map((_, i) => {
          const cx = i * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2;
          const baseColor = COLORS[i];
          const pressed = pressedLanes[i];

          return (
            <Group key={`receptor-${i}`}>
              <Circle
                cx={cx}
                cy={GAME_TARGET_Y}
                r={GAME_LANE_WIDTH * 0.36}
                color={pressed ? `${baseColor}26` : '#151821'}
              />
              <Circle
                cx={cx}
                cy={GAME_TARGET_Y}
                r={GAME_LANE_WIDTH * 0.28}
                color="#101218"
              />
              <Circle
                cx={cx}
                cy={GAME_TARGET_Y}
                r={GAME_LANE_WIDTH * 0.2}
                color={pressed ? `${baseColor}44` : '#141820'}
              />
            </Group>
          );
        })}

        {notes.map((note) => {
          if (note.hit || note.missed) {
            return null;
          }

          const timeDiff = note.time - currentTime;
          const progress = 1 - timeDiff / DIFFICULTY_CONFIG.TRAVEL_MS;

          if (progress < 0 || progress > 1.1) {
            return null;
          }

          const y = getLaneNoteY(progress);
          const x = note.lane * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2;
          const scale = 0.42 + 0.58 * Math.min(1, progress);
          const radius = GAME_LANE_WIDTH * 0.28 * scale;
          const noteColor = COLORS[note.lane];

          return (
            <Group key={note.id}>
              <Circle
                cx={x}
                cy={y}
                r={radius * 1.75}
                color={`${noteColor}18`}
              />
              <Circle
                cx={x}
                cy={y}
                r={radius * 1.18}
                color={`${noteColor}30`}
              />
              <Circle
                cx={x}
                cy={y}
                r={radius}
                color={`${noteColor}dd`}
              />
              <Circle
                cx={x - radius * 0.22}
                cy={y - radius * 0.22}
                r={radius * 0.28}
                color="#ffffff55"
              />
            </Group>
          );
        })}

        {particles.map((particle, i) => (
          <Circle
            key={`particle-${i}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.size * particle.life}
            color={
              particle.color +
              Math.floor(particle.life * 255)
                .toString(16)
                .padStart(2, '0')
            }
          />
        ))}
      </Canvas>

      <View pointerEvents="none" style={styles.textOverlay}>
        {texts.map((text, i) => (
          <View
            key={`text-${i}`}
            style={[
              styles.floatingTextContainer,
              {
                left: text.x - 56,
                top: text.y - 12,
                opacity: text.life,
              },
            ]}
          >
            <Text
              style={[
                styles.floatingText,
                { color: text.color, textShadowColor: text.color },
              ]}
            >
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
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#101218',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  canvas: {
    width: GAME_CANVAS_WIDTH,
    height: GAME_CANVAS_HEIGHT,
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingTextContainer: {
    position: 'absolute',
    width: 112,
    alignItems: 'center',
  },
  floatingText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.6,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
