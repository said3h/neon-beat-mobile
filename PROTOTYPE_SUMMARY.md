# Neon Beat Mobile - Resumen del Prototipo

## ✅ Características Implementadas

### Gameplay Core
- [x] 4 lanes verticales
- [x] Notas cayendo hacia una línea de golpeo
- [x] Input multitáctil (puedes tocar múltiples lanes simultáneamente)
- [x] Hit detection con 4 niveles de precisión:
  - **PERFECT**: ≤45ms → 100 puntos
  - **GOOD**: ≤90ms → 50 puntos
  - **OK**: ≤140ms → 25 puntos
  - **MISS**: >150ms → 0 puntos + pierde combo
- [x] Sistema de score y combo
- [x] Multiplicador de combo (x1 a x4 cada 10 combos)
- [x] Barra de salud (70 HP inicial, -8 por miss, +6 por perfect)
- [x] Game Over cuando la salud llega a 0

### Renderizado
- [x] React Native Skia para renderizado fluido a 60fps
- [x] Efectos visuales:
  - Brillo en notas
  - Partículas al golpear
  - Textos flotantes (PERFECT/GOOD/OK/MISS)
  - Indicadores de carril con efecto de presión
- [x] HUD con score, combo y barra de salud

### Audio
- [x] Reproducción de audio streaming
- [x] Offset configurable (-200ms a +200ms)
- [x] Pantalla de calibración de audio

### Feedback
- [x] Feedback háptico (vibración) al golpear notas
- [x] Feedback visual con partículas y textos

## 📁 Estructura del Proyecto

```
neon-beat-mobile/
├── app/                        # Expo Router (navegación)
│   ├── _layout.tsx             # Layout raíz
│   ├── index.tsx               # Menú principal
│   ├── game.tsx                # Ruta de juego
│   └── calibrate.tsx           # Calibración de audio
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx      # Canvas del juego + HUD
│   │   └── GameScreen.tsx      # Pantalla completa de juego
│   └── game/
│       ├── config.ts           # Configuración global
│       ├── songData.ts         # Generador de canciones
│       └── useGameEngine.ts    # Hook del motor del juego
├── assets/                     # Recursos gráficos
└── package.json
```

## 🚀 Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Escanea el QR code con Expo Go (iOS/Android)
```

## 🎮 Controles

- **Toca los círculos** en la parte inferior cuando las notas lleguen a la línea
- **Multitáctil**: Puedes tocar múltiples lanes al mismo tiempo
- **Botones táctiles**: También hay 4 botones grandes debajo del canvas

## ⚙️ Configuración

### Ajustar Dificultad
Edita `src/game/config.ts`:

```typescript
export const DIFFICULTY_CONFIG = {
  TRAVEL_MS: 1700,        // Velocidad (ms desde arriba hasta línea)
  HIT_WIN: 150,           // Ventana máxima de golpeo
  PERFECT_WIN: 45,        // Ventana para PERFECT
  GOOD_WIN: 90,           // Ventana para GOOD
  OK_WIN: 140,            // Ventana para OK
};
```

### Cambiar Canción
Edita `src/game/songData.ts` para generar patrones personalizados o cargar desde archivo.

## 📊 Arquitectura Técnica

### Game Loop
- `requestAnimationFrame` para 60fps
- Estado del juego en `useRef` para evitar re-renders innecesarios
- Renderizado forzado con estado `tick` que se actualiza en cada frame

### Hit Detection
1. Al tocar un lane, busca la nota más cercana no golpeada
2. Calcula distancia temporal entre tiempo actual y tiempo de la nota
3. Determina precisión (PERFECT/GOOD/OK/MISS)
4. Aplica puntuación con multiplicador de combo
5. Actualiza salud y dispara efectos (partículas, haptics, texto)

### Audio Synchronization
- Tiempo base: `performance.now() - startTime + audioOffset`
- Offset configurable para calibrar latencia del dispositivo

## 🔧 Dependencias Clave

| Dependencia | Propósito |
|-------------|-----------|
| `@shopify/react-native-skia` | Renderizado Canvas 2D |
| `expo-av` | Reproducción de audio |
| `expo-haptics` | Feedback háptico |
| `expo-router` | Navegación entre pantallas |
| `@react-native-community/slider` | Slider de calibración |

## 📱 Próximas Mejoras (Roadmap)

### Corto Plazo
- [ ] Hold notes (notas mantenidas)
- [ ] Patrones especiales (acordes, ráfagas, escaleras)
- [ ] Múltiples canciones con carga local
- [ ] Persistencia de offset en AsyncStorage
- [ ] Mejorar assets gráficos

### Medio Plazo
- [ ] Sistema de dificultades (Fácil/Normal/Difícil/Experto)
- [ ] Leaderboards locales
- [ ] Historial de puntuaciones
- [ ] Modo práctica (slow motion)

### Largo Plazo
- [ ] Publicación en App Store / Play Store
- [ ] Game Center / Google Play Games
- [ ] Skin personalizable
- [ ] Canciones desbloqueables

## 🐛 Problemas Conocidos

1. **Textos flotantes**: Se renderizan como overlay de React Native en lugar de Skia (limitación de SkiaText). Funciona pero podría optimizarse.

2. **Audio streaming**: Usa URL externa para testing. En producción, usar archivos locales.

3. **Assets placeholder**: Los iconos son SVG convertidos a PNG. Reemplazar con assets finales.

## 📝 Notas de Desarrollo

- El juego usa `useRef` para el estado del motor para evitar re-renders costosos
- El game loop corre independiente del renderizado de React
- Skia se usa solo para gráficos, el texto usa React Native por limitaciones de SkiaText
- El multitáctil funciona nativamente con `onTouchStart` y `onTouchEnd`

## 🎯 Métricas de Rendimiento

Objetivos:
- 60 FPS constantes
- <16ms por frame
- Input latency <50ms

Para medir:
```bash
# En Expo Go, activa "Show Performance Monitor"
# Ver FPS, memoria, y tiempo de renderizado
```

---

**Prototipo completado** ✅ - Listo para testing en dispositivo
