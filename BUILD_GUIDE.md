# Guia de Build con GitHub Actions

Este proyecto ya no usa EAS Build en CI. Los binarios se generan directamente en GitHub Actions con `expo prebuild` y las toolchains nativas.

## Workflows

- `Android Build`
  Genera un APK release y lo sube como artefacto de GitHub.
- `iOS Build`
  Genera una build sin codesign, la empaqueta como `.ipa` y la sube como artefacto.

## Como lanzarlos

1. Abre la pestana `Actions` del repositorio.
2. Entra en `Android Build` o `iOS Build`.
3. Pulsa `Run workflow`.

## Donde quedan los binarios

- Android: artefacto `neon-beat-android`
- iOS: artefacto `neon-beat-ios`

## Notas

- Android no necesita `EXPO_TOKEN`.
- iOS se construye sin firma. Sirve para verificar que compila y para pruebas tecnicas, pero para instalar en dispositivo o publicar necesitas firma de Apple.
- Los directorios `android/` e `ios/` se generan en CI con `npx expo prebuild` y no se guardan en git.

## Build local opcional

```bash
npm ci
npx expo prebuild --platform android --no-install
cd android
./gradlew assembleRelease
```

```bash
npm ci
npx expo prebuild --platform ios --no-install
cd ios
pod install
```
