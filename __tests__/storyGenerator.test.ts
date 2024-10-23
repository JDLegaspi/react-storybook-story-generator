// __tests__/storyGenerator.test.ts
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
import "openai/shims/node";
import fetch, { Request, Response, Headers } from "node-fetch";
if (!global.fetch) {
  global.fetch = fetch as any;
  global.Request = Request as any;
  global.Response = Response as any;
  global.Headers = Headers as any;
}

import fs from "fs";
import path from "path";
import { generateStories } from "../src/storyGenerator";
import { defaultConfig } from "../src/config";
import { Config } from "../src/types";
import { OpenAI } from "openai";

jest.mock("fs");
jest.mock("openai");

describe("Story Generator", () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let mockOpenAICreate: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Setup fs mocks
    mockFs.readdirSync.mockReturnValue([
      "Button.tsx",
      "Card.tsx",
    ] as unknown as fs.Dirent[]);

    mockFs.readFileSync.mockReturnValue(Buffer.from("mock component content"));
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);

    // Setup default OpenAI mock
    mockOpenAICreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: "mock story content",
            role: "assistant",
          },
        },
      ],
    });

    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: mockOpenAICreate,
      },
    } as any;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("processes story content correctly", async () => {
    mockOpenAICreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "```typescript\nsome story content\n```",
            role: "assistant",
          },
        },
      ],
    });

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
    });

    const writeFileCalls = mockFs.writeFileSync.mock.calls;
    const lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;

    expect(lastCallContent.trim()).toContain("mock story content");
  });

  test("handles missing OpenAI response content", async () => {
    // Reset the default mock
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                role: "assistant",
                // content is missing
              },
            },
          ],
        }),
      },
    } as any;

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
    });

    const writeFileCalls = mockFs.writeFileSync.mock.calls;
    const lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;
    expect(lastCallContent.trim()).toBe("");
  });

  test("handles OpenAI API error gracefully", async () => {
    const apiError = new Error("API error");

    // Reset the default mock
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: jest.fn().mockRejectedValue(apiError),
      },
    } as any;

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error generating story for Button"),
      apiError
    );

    const writeFileCalls = mockFs.writeFileSync.mock.calls;
    const lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;
    expect(lastCallContent.trim()).toBe("// Error generating story for Card");
  });

  // test("handles file read errors", async () => {
  //   mockFs.readFileSync.mockImplementationOnce(() => {
  //     throw new Error("File read error");
  //   });

  //   await generateStories({
  //     ...defaultConfig,
  //     openaiApiKey: "test-key",
  //   });

  //   expect(consoleErrorSpy).toHaveBeenCalled();
  //   expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  // });

  // test("handles directory creation error", async () => {
  //   mockFs.mkdirSync.mockImplementationOnce(() => {
  //     throw new Error("Directory creation failed");
  //   });

  //   await generateStories({
  //     ...defaultConfig,
  //     openaiApiKey: "test-key",
  //   });

  //   expect(consoleErrorSpy).toHaveBeenCalled();
  // });

  test("handles OpenAI response with null or undefined choices", async () => {
    // Reset the default mock
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: undefined,
        }),
      },
    } as any;

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
    });

    let writeFileCalls = mockFs.writeFileSync.mock.calls;
    let lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;
    expect(lastCallContent.trim()).toBe("// Error generating story for Card");
  });

  test("handles empty OpenAI response choices array", async () => {
    // Reset the default mock
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [],
        }),
      },
    } as any;

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
    });

    const writeFileCalls = mockFs.writeFileSync.mock.calls;
    const lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;
    expect(lastCallContent.trim()).toBe("");
  });

  test("processes multiple code block markers correctly", async () => {
    // Reset the default mock
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content:
                  "```typescript\n```typescript\nstory content\n```\n```",
                role: "assistant",
              },
            },
          ],
        }),
      },
    } as any;

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
    });

    const writeFileCalls = mockFs.writeFileSync.mock.calls;
    const lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;
    expect(lastCallContent.trim()).toContain("story content");
    expect(lastCallContent).not.toContain("```typescript");
    expect(lastCallContent).not.toContain("```\n");
  });

  test("includes custom imports in output", async () => {
    const customImports = ["import { Button } from './Button'"];

    await generateStories({
      ...defaultConfig,
      openaiApiKey: "test-key",
      importStatements: customImports,
    });

    const writeFileCalls = mockFs.writeFileSync.mock.calls;
    const lastCallContent = writeFileCalls[
      writeFileCalls.length - 1
    ][1] as string;
    expect(lastCallContent).toContain(customImports[0]);
  });
});
