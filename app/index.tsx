import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEON BEAT</Text>
      <Text style={styles.subtitle}>Prototype</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => router.push('/game')}
      >
        <Text style={styles.playButtonText}>JUGAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.calibrateButton}
        onPress={() => router.push('/calibrate')}
      >
        <Text style={styles.calibrateButtonText}>CALIBRAR AUDIO</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Toca los círculos cuando las notas
        </Text>
        <Text style={styles.infoText}>
          lleguen a la línea de golpeo
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Cómo jugar:</Text>
        <Text style={styles.instructionsText}>• 4 lanes verticales</Text>
        <Text style={styles.instructionsText}>• Notas cayendo hacia la línea</Text>
        <Text style={styles.instructionsText}>• Toca en el momento preciso</Text>
        <Text style={styles.instructionsText}>• Mantén tu combo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#39ff14',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#39ff14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 60,
  },
  playButton: {
    backgroundColor: '#39ff14',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#39ff14',
  },
  playButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  calibrateButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00ffff',
    marginBottom: 40,
  },
  calibrateButtonText: {
    color: '#00ffff',
    fontSize: 18,
  },
  info: {
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    marginVertical: 2,
  },
  instructions: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    color: '#aaa',
    fontSize: 14,
    marginVertical: 2,
  },
});
