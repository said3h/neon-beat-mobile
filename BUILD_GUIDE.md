# Guía de Build - iOS y Android

## Prerrequisitos

1. **Tener cuenta de Expo**: https://expo.dev
2. **Tener cuenta de Apple Developer** (para iOS): $99/año
3. **Tener cuenta de Google Play Console** (para Android): $25 único

---

## Paso 1: Iniciar sesión en EAS

```bash
cd c:\Users\Said-\.gemini\antigravity\scratch\guitar\neon-beat-mobile

eas login
```

Ingresa tus credenciales de Expo (o crea una cuenta si no tienes).

---

## Paso 2: Configurar el proyecto en EAS

```bash
eas build:configure
```

Esto creará un `projectId` automático en `app.json`.

---

## Paso 3: Build para Android (APK)

### Opción A: Build gratuito (servidores de Expo)

```bash
eas build --platform android --profile preview
```

- **Tiempo**: ~10-15 minutos
- **Costo**: Gratis (cola de build pública)
- **Resultado**: APK descargable

### Opción B: Build local (si tienes Android Studio)

```bash
eas build --platform android --profile preview --local
```

---

## Paso 4: Build para iOS (IPA)

### Requisitos previos:
- Cuenta de Apple Developer ($99/año)
- Certificado de distribución configurado

### Opción A: Build en la nube de Expo

```bash
eas build --platform ios --profile preview
```

- **Tiempo**: ~20-30 minutos
- **Costo**: Gratis (cola pública) o prioritario con plan paid
- **Resultado**: IPA descargable

### Opción B: Build local (solo macOS con Xcode)

```bash
eas build --platform ios --profile preview --local
```

---

## Paso 5: Descargar los builds

Después de completar el build:

1. Ve a https://expo.dev/accounts/said3h/projects/neon-beat-mobile/builds
2. Descarga el APK (Android) o IPA (iOS)
3. Para iOS: También puedes recibir un email con el link de descarga

---

## Paso 6: Instalar en dispositivos

### Android (APK)
1. Transfiere el APK a tu dispositivo
2. Activa "Orígenes desconocidos" en Ajustes
3. Instala el APK

### iOS (IPA)

#### Opción A: TestFlight (Recomendado)
```bash
eas submit --platform ios --latest
```
Sube el build a App Store Connect y usa TestFlight para testing.

#### Opción B: Sideloading (Sin App Store)
- Usa **AltStore** (gratis, requiere renovar cada 7 días)
- Usa **Signulous** o servicios similares (pago, sin renovación)
- Usa **Xcode** para instalar directamente (requiere macOS)

---

## Comandos Útiles

### Ver estado de builds
```bash
eas build:list
```

### Cancelar un build en progreso
```bash
eas build:cancel <BUILD_ID>
```

### Ver detalles de un build
```bash
eas build:view <BUILD_ID>
```

---

## Configuración de Certificados (iOS)

Si es tu primera vez buildiando para iOS:

```bash
eas credentials
```

Sigue el menú para:
1. Configurar Apple App Store Connect
2. Crear certificado de distribución
3. Crear provisioning profile

---

## Builds de Producción

Para builds listos para tiendas:

### Android (Google Play)
```bash
eas build --platform android --profile production
```
Genera un **AAB** (Android App Bundle) para subir a Google Play.

### iOS (App Store)
```bash
eas build --platform ios --profile production
```
Luego submit:
```bash
eas submit --platform ios --latest
```

---

## Solución de Problemas

### Error: "Insufficient privileges"
- Asegúrate de ser el owner del proyecto
- Verifica `eas login`

### Error: "Bundle identifier already taken"
- Cambia el `bundleIdentifier` en `app.json`
- Usa algo único como `com.said3h.neonbeat2024`

### Build falla en iOS
- Verifica que tu cuenta de Apple Developer esté activa
- Revisa los certificados en `eas credentials`

### Build muy lento
- Los builds gratis tienen cola de espera
- Considera un plan paid de EAS para prioridad

---

## Links Útiles

- Dashboard de builds: https://expo.dev/accounts/said3h/projects/neon-beat-mobile/builds
- Documentación EAS: https://docs.expo.dev/eas/
- Configurar Apple: https://docs.expo.dev/distribution/app-store-connect/
- Configurar Google Play: https://docs.expo.dev/distribution/google-play-store/

---

## Resumen Rápido

```bash
# 1. Login
eas login

# 2. Configurar
eas build:configure

# 3. Build Android
eas build --platform android --profile preview

# 4. Build iOS
eas build --platform ios --profile preview

# 5. Descargar desde:
# https://expo.dev/accounts/said3h/projects/neon-beat-mobile/builds
```
