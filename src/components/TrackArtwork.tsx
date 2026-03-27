import React from 'react';
import { StyleSheet, View } from 'react-native';
import { glow, neon } from '../theme/neon';

type ArtworkAccent = 'pink' | 'cyan' | 'mixed';

interface TrackArtworkProps {
  size: number;
  accent?: ArtworkAccent;
}

const ACCENTS: Record<ArtworkAccent, [string, string]> = {
  pink: [neon.colors.primary, neon.colors.primaryStrong],
  cyan: [neon.colors.secondary, neon.colors.secondaryStrong],
  mixed: [neon.colors.primary, neon.colors.secondary],
};

export function TrackArtwork({
  size,
  accent = 'mixed',
}: TrackArtworkProps) {
  const [lead, support] = ACCENTS[accent];
  const frameRadius = size * 0.24;
  const diamond = size * 0.44;

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: frameRadius,
        },
      ]}
    >
      <View
        style={[
          styles.aura,
          {
            top: size * 0.12,
            left: size * 0.22,
            width: size * 0.56,
            height: size * 0.56,
            borderRadius: size * 0.28,
            backgroundColor: `${support}30`,
          },
        ]}
      />

      <View
        style={[
          styles.diamond,
          {
            width: diamond,
            height: diamond,
            left: size * 0.22,
            top: size * 0.12,
            backgroundColor: `${lead}d5`,
            transform: [{ rotate: '35deg' }],
            borderRadius: size * 0.12,
            ...glow(lead, 0.32, 18, 10),
          },
        ]}
      />

      <View
        style={[
          styles.diamond,
          {
            width: diamond * 0.82,
            height: diamond * 0.82,
            left: size * 0.46,
            top: size * 0.18,
            backgroundColor: `${support}bf`,
            transform: [{ rotate: '-28deg' }],
            borderRadius: size * 0.12,
            ...glow(support, 0.28, 20, 10),
          },
        ]}
      />

      <View
        style={[
          styles.ribbon,
          {
            width: size * 0.6,
            height: size * 0.18,
            left: size * 0.08,
            bottom: size * 0.2,
            backgroundColor: `${lead}bf`,
            transform: [{ rotate: '-24deg' }],
          },
        ]}
      />

      <View
        style={[
          styles.ribbon,
          {
            width: size * 0.52,
            height: size * 0.12,
            right: size * 0.08,
            bottom: size * 0.26,
            backgroundColor: `${support}bf`,
            transform: [{ rotate: '18deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#101117',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  aura: {
    position: 'absolute',
  },
  diamond: {
    position: 'absolute',
  },
  ribbon: {
    position: 'absolute',
    borderRadius: 999,
  },
});
