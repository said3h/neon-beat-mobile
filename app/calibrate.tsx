import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';

export default function CalibrateScreen() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cargar sonido de prueba
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
          { shouldPlay: false }
        );
        soundRef.current = sound;
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Reproducir con offset
  const playTest = async () => {
    if (!soundRef.current) return;

    await soundRef.current.stopAsync();
    await soundRef.current.setPositionAsync(0);

    // Aplicar offset
    const offsetSeconds = offset / 1000;
    if (offsetSeconds > 0) {
      await soundRef.current.setPositionAsync(offsetSeconds * 1000);
    }

    await soundRef.current.playAsync();
    setIsPlaying(true);

    // Detener después de 10 segundos
    setTimeout(() => {
      stopTest();
    }, 10000);
  };

  const stopTest = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
    setIsPlaying(false);
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
          <Text style={styles.playButtonText}>
            {isPlaying ? 'DETENER' : 'PROBAR'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Instrucciones:</Text>
        <Text style={styles.infoText}>
          1. Reproduce el audio de prueba
        </Text>
        <Text style={styles.infoText}>
          2. Escucha si el audio está sincronizado
        </Text>
        <Text style={styles.infoText}>
          3. Ajusta el offset si es necesario
        </Text>
        <Text style={styles.infoText}>
          4. El offset positivo retrasa el audio
        </Text>
        <Text style={styles.infoText}>
          5. El offset negativo adelanta el audio
        </Text>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          // Guardar offset (en una app real, se guardaría en AsyncStorage)
          console.log('Offset guardado:', offset);
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
