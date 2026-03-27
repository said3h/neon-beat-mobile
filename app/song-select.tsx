import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getTrackById, PRIMARY_TRACK, TRACK_LIBRARY } from '../src/game/songData';
import { TrackArtwork } from '../src/components/TrackArtwork';
import { glow, neon } from '../src/theme/neon';

export default function SongSelectScreen() {
  const router = useRouter();
  const [selectedTrackId, setSelectedTrackId] = useState(PRIMARY_TRACK.id);
  const selectedTrack = useMemo(
    () => getTrackById(selectedTrackId),
    [selectedTrackId]
  );
  const alternateTracks = useMemo(
    () => TRACK_LIBRARY.filter((track) => track.id !== selectedTrack.id),
    [selectedTrack.id]
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    selectedTrack.difficultyOptions[0]
  );

  useEffect(() => {
    setSelectedDifficulty(selectedTrack.difficultyOptions[0]);
  }, [selectedTrack]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.orb, styles.orbPrimary]} />
      <View style={[styles.orb, styles.orbSecondary]} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.titleBlock}>
            <Text style={styles.menuIcon}>=</Text>
            <Text style={styles.logo}>NEON RHYTHM</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>

        <View style={styles.activeTrackCard}>
          <TrackArtwork size={220} accent={selectedTrack.featuredAccent} />

          <View style={styles.bpmBadge}>
            <Text style={styles.bpmBadgeText}>{selectedTrack.bpm} BPM</Text>
          </View>

          <View style={styles.activeTrackBody}>
            <Text style={styles.activeTrackEyebrow}>ACTIVE TRACK</Text>
            <Text style={styles.activeTrackTitle}>
              {selectedTrack.title.toUpperCase()}
            </Text>
            <Text style={styles.activeTrackArtist}>{selectedTrack.artist}</Text>

            <View style={styles.statGrid}>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>DURATION</Text>
                <Text style={styles.statValue}>{selectedTrack.durationLabel}</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>HI-SCORE</Text>
                <Text style={[styles.statValue, styles.secondaryValue]}>
                  {selectedTrack.highScore
                    ? selectedTrack.highScore.toLocaleString()
                    : 'NEW RUN'}
                </Text>
              </View>
            </View>

            <Text style={styles.selectLabel}>SELECT DIFFICULTY</Text>
            <View style={styles.difficultyRow}>
              {selectedTrack.difficultyOptions.map((difficulty) => {
                const isSelected = difficulty === selectedDifficulty;

                return (
                  <Pressable
                    key={difficulty}
                    style={[
                      styles.difficultyChip,
                      isSelected && styles.difficultyChipSelected,
                    ]}
                    onPress={() => setSelectedDifficulty(difficulty)}
                  >
                    <Text
                      style={[
                        styles.difficultyChipText,
                        isSelected && styles.difficultyChipTextSelected,
                      ]}
                    >
                      {difficulty.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.startButtonPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/game',
                  params: {
                    trackId: selectedTrack.id,
                    difficulty: selectedDifficulty,
                  },
                })
              }
            >
              <Text style={styles.startButtonText}>START SESSION {'>'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TRACK LIBRARY</Text>
          <Text style={styles.sectionLink}>{TRACK_LIBRARY.length} SONGS</Text>
        </View>

        <View style={styles.list}>
          {alternateTracks.map((track, index) => (
            <Pressable
              key={track.id}
              style={({ pressed }) => [
                styles.listRow,
                pressed && styles.listRowPressed,
              ]}
              onPress={() => setSelectedTrackId(track.id)}
            >
              <TrackArtwork
                size={74}
                accent={index % 2 === 0 ? track.featuredAccent : 'cyan'}
              />

              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{track.title.toUpperCase()}</Text>
                <Text style={styles.listArtist}>{track.artist}</Text>

                <View style={styles.listMeta}>
                  <Text style={styles.listMetaText}>BPM {track.bpm}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.listMetaMuted}>LV. {track.level}</Text>
                </View>
              </View>

              <View style={styles.listAside}>
                <Text style={styles.favorite}>+</Text>
                <Text style={styles.listDuration}>{track.durationLabel}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.calibrateLink}
          onPress={() => router.push('/calibrate')}
        >
          <Text style={styles.calibrateLinkText}>CALIBRATE BEFORE PLAYING</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: neon.colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 44,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 240,
    height: 240,
    right: -110,
    top: 160,
    backgroundColor: 'rgba(255,140,147,0.08)',
  },
  orbSecondary: {
    width: 280,
    height: 280,
    left: -130,
    bottom: 140,
    backgroundColor: 'rgba(0,244,254,0.07)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    color: neon.colors.textFaint,
    fontSize: 18,
    fontWeight: '700',
  },
  logo: {
    color: neon.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: neon.colors.surfaceRaised,
    borderWidth: 2,
    borderColor: 'rgba(255,140,147,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: neon.colors.text,
    fontWeight: '900',
  },
  activeTrackCard: {
    borderRadius: neon.radius.xl,
    backgroundColor: 'rgba(31,31,38,0.98)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 30,
    ...glow(neon.colors.primary, 0.12, 28, 8),
  },
  bpmBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(14,14,19,0.86)',
    zIndex: 2,
  },
  bpmBadgeText: {
    color: neon.colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  activeTrackBody: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
  },
  activeTrackEyebrow: {
    color: neon.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  activeTrackTitle: {
    color: neon.colors.text,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '900',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  activeTrackArtist: {
    color: neon.colors.textMuted,
    fontSize: 18,
    marginBottom: 18,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  statPill: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: neon.radius.md,
    backgroundColor: neon.colors.surface,
  },
  statLabel: {
    color: neon.colors.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  statValue: {
    color: neon.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryValue: {
    color: neon.colors.secondary,
  },
  selectLabel: {
    color: neon.colors.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  difficultyChip: {
    flexGrow: 1,
    minWidth: 78,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  difficultyChipSelected: {
    backgroundColor: neon.colors.primary,
    borderColor: 'rgba(255,255,255,0.18)',
    ...glow(neon.colors.primary, 0.22, 16, 8),
  },
  difficultyChipText: {
    color: neon.colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  difficultyChipTextSelected: {
    color: '#5f001b',
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: neon.radius.full,
    backgroundColor: neon.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.secondary, 0.24, 22, 10),
  },
  startButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  startButtonText: {
    color: '#004346',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: neon.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  sectionLink: {
    color: neon.colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  list: {
    gap: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: neon.radius.lg,
    backgroundColor: 'rgba(19,19,24,0.98)',
  },
  listRowPressed: {
    transform: [{ scale: 0.99 }],
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    color: neon.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 3,
  },
  listArtist: {
    color: neon.colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listMetaText: {
    color: neon.colors.tertiarySoft,
    fontSize: 11,
    fontWeight: '800',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: neon.colors.textFaint,
  },
  listMetaMuted: {
    color: neon.colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
  },
  listAside: {
    alignItems: 'flex-end',
    gap: 4,
  },
  favorite: {
    color: neon.colors.textMuted,
    fontSize: 18,
    fontWeight: '800',
  },
  listDuration: {
    color: neon.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  calibrateLink: {
    alignSelf: 'center',
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(37,37,44,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  calibrateLinkText: {
    color: neon.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
});
