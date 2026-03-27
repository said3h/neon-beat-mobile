import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import {
  getAudioCalibrationOffsetAsync,
  resetAudioCalibration,
  setAudioCalibrationOffset,
} from '../src/game/audioCalibration';
import { PRIMARY_TRACK } from '../src/game/songData';
import { glow, neon } from '../src/theme/neon';

export default function CalibrateScreen() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load calibration offset on mount
  useEffect(() => {
    void getAudioCalibrationOffsetAsync().then(setOffset);
  }, []);

  const clearTimers = () => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }

    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          PRIMARY_TRACK.audioSource,
          { shouldPlay: false }
        );
        soundRef.current = sound;
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    void loadSound();

    return () => {
      clearTimers();

      if (soundRef.current) {
        void soundRef.current.unloadAsync();
      }
    };
  }, []);

  const stopTest = async () => {
    clearTimers();

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        // Ignore stop errors when the sound is idle.
      }

      await soundRef.current.setPositionAsync(0);
    }

    setIsPlaying(false);
  };

  const playTest = async () => {
    const sound = soundRef.current;
    if (!sound) {
      return;
    }

    clearTimers();

    try {
      await sound.stopAsync();
    } catch (error) {
      // Ignore stop errors when restarting the preview.
    }

    await sound.setPositionAsync(0);

    if (offset < 0) {
      await sound.setPositionAsync(Math.abs(offset));
    }

    setIsPlaying(true);

    const startPlayback = async () => {
      try {
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing sound:', error);
        setIsPlaying(false);
      }
    };

    if (offset > 0) {
      startTimeoutRef.current = setTimeout(() => {
        void startPlayback();
      }, offset);
    } else {
      await startPlayback();
    }

    stopTimeoutRef.current = setTimeout(() => {
      void stopTest();
    }, 10000 + Math.max(offset, 0));
  };

  const displayedOffset = offset > 0 ? `+${offset}` : `${offset}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.orb, styles.orbPrimary]} />
      <View style={[styles.orb, styles.orbSecondary]} />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.bitsText}>1,250 BITS</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>FEEL THE BEAT</Text>
          <Text style={styles.subtitle}>
            Make sure the snare feels locked to the visual pulse before you start
            playing.
          </Text>
        </View>

        <View style={styles.centerStage}>
          <View style={styles.outerPulse} />
          <View style={styles.midPulse} />

          <Pressable
            style={({ pressed }) => [
              styles.tapButton,
              pressed && styles.tapButtonPressed,
              isPlaying && styles.tapButtonActive,
            ]}
            onPress={isPlaying ? () => void stopTest() : () => void playTest()}
          >
            <View style={styles.tapInner}>
              <Text style={styles.tapIcon}>{isPlaying ? '[]' : 'OO'}</Text>
              <Text style={styles.tapLabel}>{isPlaying ? 'STOP' : 'TAP'}</Text>
            </View>
          </Pressable>

          <View style={styles.offsetBubble}>
            <Text style={styles.offsetBubbleText}>{displayedOffset}ms</Text>
          </View>
        </View>

        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <View>
              <Text style={styles.sliderCaption}>CURRENT DELAY</Text>
              <Text style={styles.sliderValue}>
                {Math.abs(offset / 100).toFixed(2)}
                <Text style={styles.sliderUnit}>MS</Text>
              </Text>
            </View>

            <Text style={styles.sliderMeta}>Fine tune offset</Text>
          </View>

          <View style={styles.sliderShell}>
            <Slider
              style={styles.slider}
              minimumValue={-200}
              maximumValue={200}
              step={10}
              value={offset}
              onValueChange={setOffset}
              minimumTrackTintColor={neon.colors.secondary}
              maximumTrackTintColor="rgba(255,255,255,0.10)"
              thumbTintColor={neon.colors.white}
            />
          </View>

          <View style={styles.sliderScale}>
            <Text style={styles.sliderScaleLabel}>EARLIER</Text>
            <Text style={[styles.sliderScaleLabel, styles.sliderScaleCenter]}>
              PERFECT SYNC
            </Text>
            <Text style={styles.sliderScaleLabel}>LATER</Text>
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Positive values delay the audio. Negative values push it earlier.
          </Text>
          <Text style={styles.instructionsText}>
            Use the big button as a quick preview, then save when the groove feels
            right.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.finishButton,
            pressed && styles.finishButtonPressed,
          ]}
          onPress={async () => {
            await setAudioCalibrationOffset(offset);
            router.back();
          }}
        >
          <Text style={styles.finishButtonText}>FINISH CALIBRATION {'>'}</Text>
        </Pressable>

        <Pressable
          style={styles.resetButton}
          onPress={async () => {
            setOffset(0);
            await resetAudioCalibration();
          }}
        >
          <Text style={styles.resetButtonText}>RESET TO DEFAULT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: neon.colors.background,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 280,
    height: 280,
    left: -90,
    top: 160,
    backgroundColor: 'rgba(255,140,147,0.10)',
  },
  orbSecondary: {
    width: 340,
    height: 340,
    right: -130,
    bottom: 120,
    backgroundColor: 'rgba(0,244,254,0.08)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(37,37,44,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: neon.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  bitsText: {
    color: neon.colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  header: {
    alignItems: 'center',
    marginTop: 6,
  },
  title: {
    color: neon.colors.text,
    fontSize: 44,
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.4,
  },
  subtitle: {
    marginTop: 14,
    color: neon.colors.textMuted,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  outerPulse: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(255,140,147,0.16)',
  },
  midPulse: {
    position: 'absolute',
    width: 212,
    height: 212,
    borderRadius: 106,
    borderWidth: 2,
    borderColor: 'rgba(0,244,254,0.14)',
  },
  tapButton: {
    width: 208,
    height: 208,
    borderRadius: 104,
    padding: 4,
    backgroundColor: neon.colors.primary,
    ...glow(neon.colors.primary, 0.26, 28, 12),
  },
  tapButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  tapButtonActive: {
    backgroundColor: neon.colors.secondary,
    ...glow(neon.colors.secondary, 0.22, 28, 12),
  },
  tapInner: {
    flex: 1,
    borderRadius: 100,
    backgroundColor: 'rgba(15,18,37,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tapIcon: {
    color: neon.colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  tapLabel: {
    color: neon.colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  offsetBubble: {
    position: 'absolute',
    top: 16,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(37,37,44,0.78)',
    ...glow(neon.colors.secondary, 0.14, 20, 6),
  },
  offsetBubbleText: {
    color: neon.colors.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  sliderCard: {
    backgroundColor: 'rgba(25,25,31,0.96)',
    borderRadius: neon.radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  sliderCaption: {
    color: neon.colors.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  sliderValue: {
    color: neon.colors.text,
    fontSize: 42,
    fontWeight: '900',
  },
  sliderUnit: {
    color: neon.colors.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  sliderMeta: {
    color: neon.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  sliderShell: {
    borderRadius: neon.radius.full,
    backgroundColor: 'rgba(37,37,44,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  sliderScaleLabel: {
    color: neon.colors.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  sliderScaleCenter: {
    color: neon.colors.secondary,
  },
  instructions: {
    paddingHorizontal: 10,
    gap: 8,
  },
  instructionsText: {
    color: neon.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  finishButton: {
    borderRadius: neon.radius.full,
    paddingVertical: 20,
    backgroundColor: neon.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(neon.colors.primary, 0.3, 24, 12),
  },
  finishButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  finishButtonText: {
    color: '#5f001b',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resetButtonText: {
    color: neon.colors.textFaint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
});
