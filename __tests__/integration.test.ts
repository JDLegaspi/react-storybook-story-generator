import "openai/shims/node"; // Add OpenAI shim for Node environment
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { generateStories } from "../src/storyGenerator";
import { Config } from "../src/types";
import { defaultConfig } from "../src";

// Mock OpenAI but keep real filesystem operations
jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            id: "mock-id",
            created: Date.now(),
            model: "gpt-4",
            object: "chat.completion",
            choices: [
              {
                finish_reason: "stop",
                index: 0,
                message: {
                  content: `
                  import type { Meta, StoryObj } from '@storybook/react';
                  import { Button } from '../components/Button';

                  const meta: Meta<typeof Button> = {
                    title: 'Components/Button',
                    component: Button,
                    tags: ['autodocs'],
                  };

                  export default meta;
                  type Story = StoryObj<typeof Button>;

                  export const Primary: Story = {
                    args: {
                      label: 'Click me',
                      onClick: () => console.log('clicked'),
                    },
                  };
                `,
                  role: "assistant",
                },
              },
            ],
            usage: {
              completion_tokens: 100,
              prompt_tokens: 100,
              total_tokens: 200,
            },
          }),
        },
      },
    })),
  };
});

describe("Integration Tests", () => {
  const testConfig: Config = {
    ...defaultConfig,
    openaiApiKey: "test-key",
    componentDirectory: path.join(__dirname, "fixtures/components"),
    outputDirectory: path.join(__dirname, "fixtures/stories"),
  };

  beforeAll(() => {
    // Create test directories and sample component
    fs.mkdirSync(testConfig.componentDirectory, { recursive: true });
    fs.mkdirSync(testConfig.outputDirectory, { recursive: true });

    // Create a sample component for testing
    const sampleComponent = `
      import React from 'react';

      interface ButtonProps {
        label: string;
        onClick?: () => void;
      }

      export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
        return <button onClick={onClick}>{label}</button>;
      };
    `;

    fs.writeFileSync(
      path.join(testConfig.componentDirectory, "Button.tsx"),
      sampleComponent
    );
  });

  afterAll(() => {
    // Clean up test directories
    fs.rmSync(testConfig.componentDirectory, { recursive: true, force: true });
    fs.rmSync(testConfig.outputDirectory, { recursive: true, force: true });
  });

  test("generates valid story files", async () => {
    await generateStories(testConfig);

    const storyFile = path.join(
      testConfig.outputDirectory,
      "Button.stories.tsx"
    );
    expect(fs.existsSync(storyFile)).toBe(true);

    const storyContent = fs.readFileSync(storyFile, "utf8");
    expect(storyContent).toContain("import type { Meta, StoryObj }");
    expect(storyContent).toContain("export default");
    expect(storyContent).toContain("component: Button");
  });

  test("handles multiple components", async () => {
    // Add another component
    const cardComponent = `
      import React from 'react';

      interface CardProps {
        title: string;
        content: string;
      }

      export const Card: React.FC<CardProps> = ({ title, content }) => {
        return (
          <div className="card">
            <h2>{title}</h2>
            <p>{content}</p>
          </div>
        );
      };
    `;

    fs.writeFileSync(
      path.join(testConfig.componentDirectory, "Card.tsx"),
      cardComponent
    );

    await generateStories(testConfig);

    // Check both stories were generated
    expect(
      fs.existsSync(path.join(testConfig.outputDirectory, "Button.stories.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(testConfig.outputDirectory, "Card.stories.tsx"))
    ).toBe(true);
  });

  test("respects custom output directory structure", async () => {
    const nestedConfig = {
      ...testConfig,
      outputDirectory: path.join(testConfig.outputDirectory, "nested/stories"),
    };

    await generateStories(nestedConfig);

    const storyFile = path.join(
      nestedConfig.outputDirectory,
      "Button.stories.tsx"
    );
    expect(fs.existsSync(storyFile)).toBe(true);
  });
});
