// src/config.ts
import type { Config } from "./types";

export const defaultConfig: Config = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: "gpt-4-1106-preview",
  temperature: 0.7,
  componentDirectory: "./components",
  outputDirectory: "./stories",
  storyFileExtension: ".stories.tsx",
  promptTemplate: `
Create a Storybook story for a React component named {componentName}.
The component file is located at {fileName}.

The component file contains:

{componentContent}

Generate a story that:
1. Imports the component
2. Creates a default export with component metadata
3. Defines at least two stories (default and an alternate state)
4. Uses args to demonstrate different prop combinations
5. Includes any necessary decorators or parameters

Provide only compilable typescript code for the story, without any explanation or markdown code blocks.
Use import type { Meta, StoryObj } from '@storybook/react'; to import the necessary types.
`,
  importStatements: [
    "import type { Meta, StoryObj } from '@storybook/react';",
    "import { {componentName} } from '{componentPath}';",
  ],
  componentImportPath: "../components",
};
