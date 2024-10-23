import { defaultConfig } from "../src/config";

describe("Config", () => {
  test("default config has required properties", () => {
    expect(defaultConfig).toHaveProperty("openaiApiKey");
    expect(defaultConfig).toHaveProperty("openaiModel");
    expect(defaultConfig).toHaveProperty("temperature");
    expect(defaultConfig).toHaveProperty("componentDirectory");
    expect(defaultConfig).toHaveProperty("outputDirectory");
    expect(defaultConfig).toHaveProperty("storyFileExtension");
    expect(defaultConfig).toHaveProperty("promptTemplate");
    expect(defaultConfig).toHaveProperty("importStatements");
    expect(defaultConfig).toHaveProperty("componentImportPath");
  });

  test("default config has valid values", () => {
    expect(typeof defaultConfig.temperature).toBe("number");
    expect(defaultConfig.temperature).toBeGreaterThan(0);
    expect(defaultConfig.temperature).toBeLessThan(1);
    expect(defaultConfig.storyFileExtension).toMatch(/\.stories\.tsx$/);
    expect(Array.isArray(defaultConfig.importStatements)).toBe(true);
  });
});
