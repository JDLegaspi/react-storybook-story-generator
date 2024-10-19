import dotenv from 'dotenv';
import { generateStories } from './storyGenerator';
import { defaultConfig } from './config';
import type { Config } from './types';

dotenv.config();

export { generateStories, defaultConfig };
export type { Config };