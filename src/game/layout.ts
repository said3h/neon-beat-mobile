import { Dimensions } from 'react-native';
import { DIFFICULTY_CONFIG, NUM_LANES } from './config';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const GAME_CANVAS_WIDTH = Math.min(screenWidth - 24, 420);
export const GAME_CANVAS_HEIGHT = Math.max(Math.min(screenHeight * 0.78, 760), 560);
export const GAME_LANE_WIDTH = GAME_CANVAS_WIDTH / NUM_LANES;
export const GAME_TARGET_Y = GAME_CANVAS_HEIGHT - 84;
export const GAME_LANE_TOP = 28;

export function getLaneCenterX(lane: number): number {
  return lane * GAME_LANE_WIDTH + GAME_LANE_WIDTH / 2;
}

export function getLaneNoteY(progress: number): number {
  return GAME_LANE_TOP + progress * (GAME_TARGET_Y - GAME_LANE_TOP);
}
