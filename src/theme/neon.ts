import { ViewStyle } from 'react-native';

export const neon = {
  colors: {
    background: '#0e0e13',
    backgroundAlt: '#131318',
    surface: '#19191f',
    surfaceRaised: '#1f1f26',
    surfaceStrong: '#25252c',
    surfaceMuted: '#2c2b33',
    text: '#f8f5fd',
    textMuted: '#acaab1',
    textFaint: '#7f7d87',
    primary: '#ff8c93',
    primaryStrong: '#ff7480',
    secondary: '#00f4fe',
    secondaryStrong: '#00d9f1',
    tertiary: '#d4ff00',
    tertiarySoft: '#d8ff7a',
    purple: '#b90afc',
    success: '#92ff71',
    warning: '#ffd66e',
    danger: '#ff7351',
    white: '#ffffff',
    black: '#000000',
  },
  radius: {
    sm: 16,
    md: 22,
    lg: 30,
    xl: 40,
    full: 999,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export function glow(
  color: string,
  opacity: number = 0.3,
  radius: number = 24,
  elevation: number = 12
): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 10 },
    elevation,
  };
}
