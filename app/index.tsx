import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { RECENT_TRACK } from '../src/game/songData';
import { TrackArtwork } from '../src/components/TrackArtwork';
import { glow, neon } from '../src/theme/neon';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.orb, styles.orbPrimary]} />
      <View style={[styles.orb, styles.orbSecondary]} />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.identityBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>
            <View>
              <Text style={styles.brand}>NEON RHYTHM</Text>
              <Text style={styles.level}>LEVEL 42</Text>
            </View>
          </View>

          <View style={styles.bitsBadge}>
            <View style={styles.bitsDot} />
            <Text style={styles.bitsText}>1,250 BITS</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <TrackArtwork size={168} accent="pink" />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>*</Text>
          </View>

          <Text style={styles.eyebrow}>LAST PLAYED</Text>
          <Text style={styles.heroTitle}>{RECENT_TRACK.title.toUpperCase()}</Text>
          <Text style={styles.heroSubtitle}>
            {RECENT_TRACK.artist} - {RECENT_TRACK.bpm} BPM
          </Text>

          <View style={styles.heroTags}>
            <View style={styles.primaryChip}>
              <Text style={styles.primaryChipText}>EXTREME</Text>
            </View>
            <View style={styles.secondaryChip}>
              <Text style={styles.secondaryChipText}>A+ SCORE</Text>
            </View>
          </View>
        </View>

        <View style={styles.challengeRow}>
          <View style={[styles.challengeCard, styles.challengePrimary]}>
            <Text style={styles.challengeIcon}>!</Text>
            <Text style={styles.challengeTitle}>Daily{'\n'}Challenge</Text>
            <Text style={styles.challengeCaption}>2h 44m left</Text>
          </View>

          <View style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>O</Text>
            <Text style={styles.challengeTitle}>Missions</Text>
            <Text style={styles.challengeCaption}>3 / 5 active</Text>
          </View>
        </View>

        <Pressable
          style={styles.calibrateButton}
          onPress={() => router.push('/calibrate')}
        >
          <Text style={styles.calibrateButtonText}>CALIBRATE AUDIO</Text>
        </Pressable>
      </View>

      <View style={styles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
          onPress={() => router.push('/song-select')}
        >
          <Text style={styles.playButtonIcon}>▶</Text>
        </Pressable>
        <Text style={styles.playCaption}>START A SESSION</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: neon.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 128,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 280,
    height: 280,
    right: -120,
    top: 100,
    backgroundColor: 'rgba(255,140,147,0.10)',
  },
  orbSecondary: {
    width: 320,
    height: 320,
    left: -140,
    bottom: 60,
    backgroundColor: 'rgba(0,244,254,0.08)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  identityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neon.colors.surfaceRaised,
    borderWidth: 2,
    borderColor: neon.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.primary, 0.2, 12, 4),
  },
  avatarText: {
    color: neon.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  brand: {
    color: neon.colors.text,
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  level: {
    color: neon.colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  bitsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(37,37,44,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bitsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: neon.colors.tertiary,
  },
  bitsText: {
    color: neon.colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: 'rgba(31,31,38,0.96)',
    borderRadius: neon.radius.xl,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 34,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  heroBadge: {
    position: 'absolute',
    right: 48,
    top: 180,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: neon.colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.tertiary, 0.35, 18, 10),
  },
  heroBadgeText: {
    color: '#262900',
    fontSize: 28,
    fontWeight: '900',
  },
  eyebrow: {
    color: neon.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginTop: 28,
    marginBottom: 10,
  },
  heroTitle: {
    color: neon.colors.text,
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.4,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: neon.colors.textMuted,
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  heroTags: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  primaryChip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.primary,
    ...glow(neon.colors.primary, 0.25, 18, 8),
  },
  primaryChipText: {
    color: '#5f001b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  secondaryChip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  secondaryChipText: {
    color: neon.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  challengeRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  challengeCard: {
    flex: 1,
    minHeight: 168,
    borderRadius: neon.radius.lg,
    padding: 20,
    backgroundColor: 'rgba(19,19,24,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'space-between',
  },
  challengePrimary: {
    backgroundColor: 'rgba(0,105,110,0.9)',
    ...glow(neon.colors.secondary, 0.16, 24, 8),
  },
  challengeIcon: {
    color: neon.colors.secondary,
    fontSize: 30,
  },
  challengeTitle: {
    color: neon.colors.text,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '900',
  },
  challengeCaption: {
    color: neon.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  calibrateButton: {
    marginTop: 6,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(37,37,44,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,244,254,0.28)',
  },
  calibrateButtonText: {
    color: neon.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  bottomAction: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: 'center',
  },
  playButton: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: neon.colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.tertiary, 0.38, 24, 14),
  },
  playButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  playButtonIcon: {
    color: '#303400',
    fontSize: 34,
    fontWeight: '900',
    marginLeft: 4,
  },
  playCaption: {
    marginTop: 14,
    color: neon.colors.tertiarySoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
