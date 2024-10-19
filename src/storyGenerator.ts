import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { defaultConfig } from "./config";
import type { Config, StoryGenerationResult } from "./types";

export async function generateStories(
  userConfig: Partial<Config> = {}
): Promise<void> {
  const config: Config = { ...defaultConfig, ...userConfig };

  const openai = new OpenAI({ apiKey: config.openaiApiKey });

  const files: string[] = fs.readdirSync(config.componentDirectory);

  for (const file of files) {
    if (path.extname(file) === ".tsx") {
      const componentName: string = path.basename(file, ".tsx");
      const componentPath: string = path.join(config.componentDirectory, file);
      const componentContent: string = fs.readFileSync(componentPath, "utf8");
      const storyContent: string = await createStoryForComponent(
        openai,
        config,
        componentName,
        componentContent,
        file
      );

      console.log("Successfully created story for:", componentName);

      const storyPath: string = path.join(
        config.outputDirectory,
        `${componentName}${config.storyFileExtension}`
      );

      fs.mkdirSync(path.dirname(storyPath), { recursive: true });
      fs.writeFileSync(storyPath, storyContent);
      console.log(`Generated story for ${componentName}`);
    }
  }
}

async function createStoryForComponent(
  openai: OpenAI,
  config: Config,
  componentName: string,
  componentContent: string,
  fileName: string
): Promise<string> {
  console.log("Creating story for:", componentName);

  const prompt: string = config.promptTemplate
    .replace("{componentName}", componentName)
    .replace("{fileName}", fileName)
    .replace("{componentContent}", componentContent)
    .replace("{componentPath}", path.join(config.componentDirectory, fileName));

  try {
    const response = await openai.chat.completions.create({
      model: config.openaiModel,
      messages: [{ role: "user", content: prompt }],
      temperature: config.temperature,
    });

    let storyContent = response.choices[0]?.message.content?.trim() || "";
    storyContent = storyContent.replace(/^```typescript\s*/, "");
    storyContent = storyContent.replace(/^```\s*/, "");
    storyContent = storyContent.replace(/\s*```$/, "");

    const customImports = config.importStatements.join("\n");

    return `${customImports}\n\n${storyContent}`;
  } catch (error) {
    console.error(`Error generating story for ${componentName}:`, error);
    return `// Error generating story for ${componentName}`;
  }
}
