import { Dimensions } from 'react-native';
import { DIFFICULTY_CONFIG, NUM_LANES } from './config';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const GAME_CANVAS_WIDTH = Math.min(screenWidth, 400);
export const GAME_CANVAS_HEIGHT = screenHeight * 0.7;
export const GAME_LANE_WIDTH = GAME_CANVAS_WIDTH / NUM_LANES;
export const GAME_TARGET_Y = GAME_CANVAS_HEIGHT * DIFFICULTY_CONFIG.TARGET_Y;

export function getLaneCenterX(lane: number): number {
  return lane * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2;
}
