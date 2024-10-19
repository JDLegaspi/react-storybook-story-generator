export interface Config {
  openaiApiKey: string;
  openaiModel: string;
  temperature: number;
  componentDirectory: string;
  outputDirectory: string;
  storyFileExtension: string;
  promptTemplate: string;
  importStatements: string[];
  componentImportPath: string;
}

export interface StoryGenerationResult {
  componentName: string;
  storyContent: string;
}
