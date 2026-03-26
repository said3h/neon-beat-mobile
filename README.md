# Neon Beat Mobile - Prototype

Juego de ritmo tipo Guitar Hero para iOS/Android desarrollado con React Native + Expo.

## Características del Prototipo

- ✅ 4 lanes verticales
- ✅ Notas cayendo hacia una línea de golpeo
- ✅ Input multitáctil por lane
- ✅ Hit detection (PERFECT / GOOD / OK / MISS)
- ✅ Sistema de score y combo
- ✅ Reproducción de audio con offset configurable
- ✅ Renderizado fluido con React Native Skia
- ✅ Feedback háptico al golpear notas
- ✅ Barra de salud
- ✅ Game Over cuando la salud llega a 0

## Requisitos

- Node.js 18+
- npm o yarn
- Expo CLI
- Dispositivo iOS/Android o emulador
- Expo Go app (para testing en dispositivo físico)

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

## Ejecutar en Dispositivo

### iOS (con Expo Go)
1. Instala Expo Go desde App Store
2. Escanea el QR code que aparece en la terminal
3. La app se cargará en tu dispositivo

### Android (con Expo Go)
1. Instala Expo Go desde Play Store
2. Escanea el QR code que aparece en la terminal
3. La app se cargará en tu dispositivo

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## Controles

- **Toca los círculos** en la parte inferior cuando las notas lleguen a la línea de golpeo
- **Mantén el combo** golpeando notas consecutivamente
- **Multiplicador de combo**: x1 (1-9), x2 (10-19), x3 (20-29), x4 (30+)

## Sistema de Puntuación

| Precisión | Ventana | Puntos Base |
|-----------|---------|-------------|
| PERFECT   | ≤45ms   | 100         |
| GOOD      | ≤90ms   | 50          |
| OK        | ≤140ms  | 25          |
| MISS      | >150ms  | 0           |

## Calibración de Audio

Si las notas no están sincronizadas con el audio:

1. Ve a "CALIBRAR AUDIO" en el menú principal
2. Reproduce el audio de prueba
3. Ajusta el offset (-200ms a +200ms)
4. Guarda la configuración

## Estructura del Proyecto

```
neon-beat-mobile/
├── app/                      # Expo Router (pantallas)
│   ├── _layout.tsx           # Layout principal
│   ├── index.tsx             # Menú principal
│   ├── game.tsx              # Pantalla de juego
│   └── calibrate.tsx         # Calibración de audio
├── src/
│   ├── components/           # Componentes React
│   │   ├── GameCanvas.tsx    # Renderizado del juego
│   │   └── GameScreen.tsx    # Pantalla completa de juego
│   └── game/                 # Lógica del juego
│       ├── config.ts         # Configuración global
│       ├── songData.ts       # Datos de canciones
│       └── useGameEngine.ts  # Motor del juego (hook)
└── assets/                   # Recursos (iconos, splash)
```

## Configuración de Dificultad

Edita `src/game/config.ts` para ajustar:

```typescript
export const DIFFICULTY_CONFIG = {
  TRAVEL_MS: 1700,        // Velocidad de las notas
  HIT_WIN: 150,           // Ventana total de golpeo
  PERFECT_WIN: 45,        // Ventana para PERFECT
  GOOD_WIN: 90,           // Ventana para GOOD
  OK_WIN: 140,            // Ventana para OK
};
```

## Próximas Características (Roadmap)

- [ ] Hold notes (notas mantenidas)
- [ ] Patrones especiales (acordes, ráfagas, escaleras)
- [ ] Múltiples canciones
- [ ] Sistema de dificultades
- [ ] Persistencia de puntuaciones
- [ ] Modo offline con audio local
- [ ] Publicación en App Store / Play Store

## Solución de Problemas

### Las notas no están sincronizadas con el audio
- Usa la pantalla de calibración para ajustar el offset
- El offset positivo retrasa el audio, negativo lo adelanta

### El audio no se reproduce
- Verifica tu conexión a internet (el audio de prueba es online)
- En producción, usa archivos de audio locales

### El juego va lento
- Cierra otras aplicaciones
- Reduce la calidad en dispositivos antiguos
- Verifica que el game loop esté corriendo a 60fps

## Licencia

MIT - Uso personal y educativo
