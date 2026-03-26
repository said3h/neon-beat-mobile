import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import {
  getAudioCalibrationOffset,
  setAudioCalibrationOffset,
} from '../src/game/audioCalibration';
import { TEST_AUDIO_URI } from '../src/game/songData';

export default function CalibrateScreen() {
  const router = useRouter();
  const [offset, setOffset] = useState(() => getAudioCalibrationOffset());
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          { uri: TEST_AUDIO_URI },
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
        // Ignore stop errors when the sound has not started yet.
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
      // Ignore stop errors when replaying from an idle state.
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CALIBRAR AUDIO</Text>
      <Text style={styles.subtitle}>Ajusta el offset para sincronizar audio y notas</Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Offset: {offset}ms</Text>
        <Slider
          style={styles.slider}
          minimumValue={-200}
          maximumValue={200}
          step={10}
          value={offset}
          onValueChange={setOffset}
          minimumTrackTintColor="#39ff14"
          maximumTrackTintColor="#333"
          thumbTintColor="#39ff14"
        />
        <View style={styles.scale}>
          <Text style={styles.scaleText}>-200ms</Text>
          <Text style={styles.scaleText}>0ms</Text>
          <Text style={styles.scaleText}>+200ms</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={isPlaying ? stopTest : playTest}
        >
          <Text style={[styles.playButtonText, isPlaying && styles.playButtonTextActive]}>
            {isPlaying ? 'DETENER' : 'PROBAR'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Instrucciones:</Text>
        <Text style={styles.infoText}>1. Reproduce el audio de prueba</Text>
        <Text style={styles.infoText}>2. Ajusta el offset hasta que se sienta correcto</Text>
        <Text style={styles.infoText}>3. El offset positivo retrasa el audio</Text>
        <Text style={styles.infoText}>4. El offset negativo adelanta el audio</Text>
        <Text style={styles.infoText}>5. Guarda y vuelve al menu para jugar con ese ajuste</Text>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          setAudioCalibrationOffset(offset);
          router.back();
        }}
      >
        <Text style={styles.saveButtonText}>GUARDAR Y VOLVER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  title: {
    color: '#00ffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 40,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  scaleText: {
    color: '#666',
    fontSize: 12,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  playButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#39ff14',
  },
  playButtonActive: {
    backgroundColor: '#39ff14',
  },
  playButtonText: {
    color: '#39ff14',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playButtonTextActive: {
    color: '#000',
  },
  info: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
    marginVertical: 3,
  },
  saveButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00ffff',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
