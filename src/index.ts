import { generateStories as originalGenerateStories } from "./storyGenerator";
import type { Config } from "./types";

export interface RequiredKeyConfig extends Omit<Config, "openaiApiKey"> {
  openaiApiKey: string;
}

export function generateStories(config: RequiredKeyConfig): Promise<void> {
  // Ensure the API key is provided
  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key is required");
  }

  return originalGenerateStories(config);
}

export { defaultConfig } from "./config";
export type { RequiredKeyConfig as Config };
