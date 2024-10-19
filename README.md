# Storybook Story Generator

Automatically generate Storybook stories for React components using OpenAI's GPT models.

## Features

- Scans a directory for React components
- Generates Storybook stories using OpenAI's GPT models
- Supports TypeScript
- Highly customizable configuration
- Flexible import statements

## Installation

```bash
npm install storybook-story-generator
```

## Usage

1. Set up your OpenAI API key in a `.env` file in your project root:

```
OPENAI_API_KEY=your_api_key_here
```

2. Create a script to run the story generator (e.g., `generate-stories.ts`):

```typescript
const { generateStories, defaultConfig } = require("storybook-story-generator");

const customConfig = {
  ...defaultConfig,
  openaiAPIKey: "YOUR_OPENAI_API_KEY",
  componentDirectory: "./src/components",
  outputDirectory: "./src/stories",
  componentImportPath: "../components",
  importStatements: [
    ...defaultConfig.importStatements,
    "import 'app/css/style.css';",
  ],
};

generateStories(customConfig)
  .then(() => console.log("Story generation complete"))
  .catch((error: Error) => console.error("Error in story generation:", error));
```

3. Run the script:

```bash
ts-node generate-stories.ts
```

## Configuration

You can customize various aspects of the story generation process. Here are the available configuration options:

| Option                | Type     | Description                                | Default                |
| --------------------- | -------- | ------------------------------------------ | ---------------------- |
| `openaiApiKey`        | string   | Your OpenAI API key                        | undefined              |
| `openaiModel`         | string   | The OpenAI model to use                    | `'gpt-4-1106-preview'` |
| `temperature`         | number   | Creativity of the AI (0-1)                 | `0.7`                  |
| `componentDirectory`  | string   | Directory containing your React components | `'./components'`       |
| `outputDirectory`     | string   | Directory where stories will be generated  | `'./stories'`          |
| `storyFileExtension`  | string   | File extension for generated stories       | `'.stories.tsx'`       |
| `promptTemplate`      | string   | Template for the story generation prompt   | (see defaultConfig)    |
| `importStatements`    | string[] | Array of import statements to include      | (see defaultConfig)    |
| `componentImportPath` | string   | Path to import components from             | `'../components'`      |

## Customizing the Prompt

You can customize the prompt sent to the OpenAI model by modifying the `promptTemplate` in your configuration. Use placeholders like `{componentName}`, `{fileName}`, and `{componentContent}` which will be replaced with actual values during generation.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the GPT models
- Storybook community for inspiration
