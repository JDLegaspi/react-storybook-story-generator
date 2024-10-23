import "openai/shims/node";
import { generateStories, defaultConfig } from "../src/index";
import * as originalModule from "../src/storyGenerator";
import type { Config } from "../src/types";

jest.mock("../src/storyGenerator", () => ({
  generateStories: jest.fn().mockResolvedValue(undefined),
}));

describe("Index", () => {
  const mockOriginalGenerateStories =
    originalModule.generateStories as jest.MockedFunction<
      typeof originalModule.generateStories
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("exports defaultConfig", () => {
    expect(defaultConfig).toBeDefined();
    expect(defaultConfig).toHaveProperty("openaiApiKey");
    expect(defaultConfig).toHaveProperty("componentDirectory");
    expect(defaultConfig).toHaveProperty("outputDirectory");
  });

  describe("error handling", () => {
    test("synchronously throws for missing API key", () => {
      const config = {
        ...defaultConfig,
        openaiApiKey: "",
      };

      expect(() => {
        generateStories(config);
      }).toThrow("OpenAI API key is required");
    });

    test("synchronously throws for undefined API key", () => {
      const config = {
        ...defaultConfig,
        openaiApiKey: undefined as unknown as string,
      };

      expect(() => {
        generateStories(config);
      }).toThrow("OpenAI API key is required");
    });
  });

  test("calls original generateStories with valid config", async () => {
    const validConfig: Config = {
      ...defaultConfig,
      openaiApiKey: "valid-key",
      componentDirectory: "./custom-components",
      outputDirectory: "./custom-stories",
    };

    await generateStories(validConfig);

    expect(mockOriginalGenerateStories).toHaveBeenCalledTimes(1);
    expect(mockOriginalGenerateStories).toHaveBeenCalledWith(validConfig);
  });

  test("preserves custom config options", async () => {
    const customConfig: Config = {
      ...defaultConfig,
      openaiApiKey: "valid-key",
      temperature: 0.8,
      storyFileExtension: ".custom.stories.tsx",
      componentDirectory: "./src/components",
      outputDirectory: "./src/stories",
    };

    await generateStories(customConfig);

    expect(mockOriginalGenerateStories).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.8,
        storyFileExtension: ".custom.stories.tsx",
        componentDirectory: "./src/components",
        outputDirectory: "./src/stories",
      })
    );
  });

  test("passes through original function return value", async () => {
    mockOriginalGenerateStories.mockResolvedValueOnce(undefined);

    const result = await generateStories({
      ...defaultConfig,
      openaiApiKey: "valid-key",
    });

    expect(result).toBeUndefined();
  });

  test("handles rejection from original function", async () => {
    const error = new Error("Original function error");
    mockOriginalGenerateStories.mockRejectedValueOnce(error);

    await expect(
      generateStories({
        ...defaultConfig,
        openaiApiKey: "valid-key",
      })
    ).rejects.toThrow("Original function error");
  });

  describe("type safety", () => {
    test("accepts valid config", async () => {
      const validConfig: Config = {
        ...defaultConfig,
        openaiApiKey: "valid-key",
      };

      await expect(generateStories(validConfig)).resolves.toBeUndefined();
    });

    test("throws for missing API key", () => {
      const invalidConfig = { ...defaultConfig } as any;
      delete invalidConfig.openaiApiKey;

      expect(() => {
        generateStories(invalidConfig);
      }).toThrow("OpenAI API key is required");
    });

    test("throws for null API key", () => {
      const invalidConfig = {
        ...defaultConfig,
        openaiApiKey: null,
      } as any;

      expect(() => {
        generateStories(invalidConfig);
      }).toThrow("OpenAI API key is required");
    });

    test("throws for empty string API key", () => {
      const invalidConfig = {
        ...defaultConfig,
        openaiApiKey: "",
      };

      expect(() => {
        generateStories(invalidConfig);
      }).toThrow("OpenAI API key is required");
    });
  });
});
