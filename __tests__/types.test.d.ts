import { generateStories } from "../src";
import { expectType } from "tsd";

// Valid usage
expectType<Promise<void>>(
  generateStories({
    openaiApiKey: "valid-key",
    componentDirectory: "./components",
    outputDirectory: "./stories",
  })
);

// @ts-expect-error Missing required openaiApiKey
generateStories({
  componentDirectory: "./components",
  outputDirectory: "./stories",
});

// @ts-expect-error Wrong type for openaiApiKey
generateStories({
  openaiApiKey: 123,
  componentDirectory: "./components",
  outputDirectory: "./stories",
});
