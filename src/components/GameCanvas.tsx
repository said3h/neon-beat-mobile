import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  Canvas,
  Circle,
  Line,
  Rect,
  Group,
} from '@shopify/react-native-skia';
import { GameState, Note, Particle, FloatingText, DIFFICULTY_CONFIG, COLORS } from '../game/config';

interface GameCanvasProps {
  notes: Note[];
  gameState: GameState;
  particles: Particle[];
  texts: FloatingText[];
  pressedLanes: boolean[];
  currentTime: number;
  onHitLane: (lane: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = Math.min(SCREEN_WIDTH, 400);
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.7;
const LANE_WIDTH = CANVAS_WIDTH / 4;
const TARGET_Y = CANVAS_HEIGHT * DIFFICULTY_CONFIG.TARGET_Y;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  notes,
  gameState,
  particles,
  texts,
  pressedLanes,
  currentTime,
  onHitLane,
}) => {
  const canvasRef = useRef<any>(null);
  const touchedLanesRef = useRef<Set<number>>(new Set());

  // Manejar touch start - soporta multitouch
  const handleTouchStart = useCallback((e: any) => {
    const nativeEvent = e.nativeEvent;
    const touches = nativeEvent.touches || [];

    for (const touch of touches) {
      const lane = Math.floor(touch.x / LANE_WIDTH);
      if (lane >= 0 && lane < 4 && !touchedLanesRef.current.has(lane)) {
        touchedLanesRef.current.add(lane);
        onHitLane(lane);
      }
    }
  }, [onHitLane]);

  // Manejar touch end
  const handleTouchEnd = useCallback((e: any) => {
    const nativeEvent = e.nativeEvent;
    const touches = nativeEvent.touches || [];

    // Resetear lanes tocados
    touchedLanesRef.current.clear();

    // Mantener activos los lanes que aún tienen touches
    for (const touch of touches) {
      const lane = Math.floor(touch.x / LANE_WIDTH);
      if (lane >= 0 && lane < 4) {
        touchedLanesRef.current.add(lane);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* HUD Overlay */}
      <View style={styles.hudOverlay}>
        <Text style={styles.scoreText}>{gameState.score.toString().padStart(6, '0')}</Text>
        {gameState.combo > 1 && (
          <Text style={[styles.comboText, { color: COLORS[Math.min(gameState.combo - 1, 3)] }]}>
            {gameState.combo}x COMBO
          </Text>
        )}
      </View>

      <Canvas
        ref={canvasRef}
        style={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Fondo */}
        <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} color="#0a0a0a" />

        {/* Líneas de carriles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Line
            key={i}
            p1={{ x: i * LANE_WIDTH, y: 0 }}
            p2={{ x: i * LANE_WIDTH, y: CANVAS_HEIGHT }}
            color={i === 0 || i === 4 ? '#333' : '#1a1a1a'}
            strokeWidth={i === 0 || i === 4 ? 2 : 1}
          />
        ))}

        {/* Línea de golpeo */}
        <Line
          p1={{ x: 0, y: TARGET_Y }}
          p2={{ x: CANVAS_WIDTH, y: TARGET_Y }}
          color="#444"
          strokeWidth={2}
        />

        {/* Indicadores de carriles */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Group key={i}>
            {/* Círculo del indicador */}
            <Circle
              cx={i * LANE_WIDTH + LANE_WIDTH / 2}
              cy={TARGET_Y}
              r={LANE_WIDTH * 0.3}
              color={pressedLanes[i] ? '#fff' : COLORS[i] + '99'}
              strokeWidth={pressedLanes[i] ? 3 : 2}
            />
            {/* Efecto de presión */}
            {pressedLanes[i] && (
              <Circle
                cx={i * LANE_WIDTH + LANE_WIDTH / 2}
                cy={TARGET_Y}
                r={LANE_WIDTH * 0.4}
                color={COLORS[i] + '33'}
              />
            )}
          </Group>
        ))}

        {/* Notas */}
        {notes.map((note) => {
          if (note.hit || note.missed) return null;

          const timeDiff = note.time - currentTime;
          const progress = 1 - timeDiff / DIFFICULTY_CONFIG.TRAVEL_MS;

          if (progress < 0 || progress > 1.1) return null;

          const y = progress * TARGET_Y;
          const x = note.lane * LANE_WIDTH + LANE_WIDTH / 2;
          const scale = 0.35 + 0.65 * Math.min(1, progress);
          const radius = LANE_WIDTH * 0.28 * scale;

          return (
            <Group key={note.id}>
              {/* Sombra exterior */}
              <Circle
                cx={x}
                cy={y}
                r={radius * 1.6}
                color={COLORS[note.lane] + '18'}
              />
              {/* Anillo medio */}
              <Circle
                cx={x}
                cy={y}
                r={radius * 1.15}
                color={COLORS[note.lane] + '30'}
              />
              {/* Nota principal */}
              <Circle
                cx={x}
                cy={y}
                r={radius}
                color={COLORS[note.lane] + 'dd'}
              />
              {/* Brillo */}
              <Circle
                cx={x - radius * 0.22}
                cy={y - radius * 0.22}
                r={radius * 0.3}
                color="#ffffff55"
              />
            </Group>
          );
        })}

        {/* Partículas */}
        {particles.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.size * p.life}
            color={p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0')}
          />
        ))}

        {/* Textos flotantes - Renderizados como overlay */}
        {texts.map((t, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: t.x - 50,
              top: t.y - 12,
              width: 100,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: t.color, fontSize: 24, fontWeight: 'bold', textShadowColor: t.color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
              {t.text}
            </Text>
          </View>
        ))}

        {/* Barra de salud */}
        <Rect
          x={0}
          y={CANVAS_HEIGHT - 8}
          width={CANVAS_WIDTH}
          height={8}
          color="#1a1a1a"
        />
        <Rect
          x={0}
          y={CANVAS_HEIGHT - 8}
          width={(CANVAS_WIDTH * gameState.health) / 100}
          height={8}
          color={gameState.health > 60 ? '#39ff14' : gameState.health > 30 ? '#ccff00' : '#ff073a'}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
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
    pointerEvents: 'none',
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
