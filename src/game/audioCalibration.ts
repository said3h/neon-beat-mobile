import AsyncStorage from '@react-native-async-storage/async-storage';

const CALIBRATION_KEY = '@neonbeat:audioCalibrationOffset';

let audioCalibrationOffset = 0;
let isInitialized = false;

/**
 * Initialize calibration from AsyncStorage
 */
async function initializeCalibration(): Promise<void> {
  if (isInitialized) return;

  try {
    const stored = await AsyncStorage.getItem(CALIBRATION_KEY);
    if (stored !== null) {
      audioCalibrationOffset = parseInt(stored, 10);
    }
  } catch (error) {
    console.warn('Failed to load audio calibration:', error);
  }

  isInitialized = true;
}

/**
 * Get the current audio calibration offset (in milliseconds)
 * Ensures initialization before returning value
 */
export async function getAudioCalibrationOffsetAsync(): Promise<number> {
  if (!isInitialized) {
    await initializeCalibration();
  }
  return audioCalibrationOffset;
}

/**
 * Get the current audio calibration offset (synchronous)
 * Uses cached value, may be stale on first call
 */
export function getAudioCalibrationOffset(): number {
  return audioCalibrationOffset;
}

/**
 * Set the audio calibration offset and persist to AsyncStorage
 */
export async function setAudioCalibrationOffset(offset: number): Promise<void> {
  audioCalibrationOffset = offset;

  try {
    await AsyncStorage.setItem(CALIBRATION_KEY, offset.toString());
  } catch (error) {
    console.warn('Failed to save audio calibration:', error);
  }
}

/**
 * Reset calibration to default (0ms)
 */
export async function resetAudioCalibration(): Promise<void> {
  audioCalibrationOffset = 0;

  try {
    await AsyncStorage.removeItem(CALIBRATION_KEY);
  } catch (error) {
    console.warn('Failed to reset audio calibration:', error);
  }
}
