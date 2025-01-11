import { expect, test, describe, beforeAll, afterAll, mock } from "bun:test";
import { DocumentParser } from "../parsers/documentParser";
import { TranslationCoordinator } from "../translationCoordinator";
import { MockAnthropicAPI } from "./mocks/mockAnthropicAPI";
import * as fs from "fs";
import * as path from "path";

// Mock the modules
mock.module("@langchain/anthropic", () => {
  return {
    ChatAnthropic: MockAnthropicAPI,
  };
});

mock.module("pdf-parse", () => import("mock-pdf-parse"));

describe("Integration Tests", () => {
  const fixturesDir = path.join(import.meta.dir, "fixtures");
  const outputPath = path.join(import.meta.dir, "test-output.md");
  let parser: DocumentParser;
  let coordinator: TranslationCoordinator;

  beforeAll(() => {
    parser = new DocumentParser();
    coordinator = new TranslationCoordinator("fake-api-key", "es");
  });

  afterAll(() => {
    try {
      fs.unlinkSync(outputPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  test("should process a complete book translation workflow", async () => {
    // 1. Parse the document
    const content = await parser.parseFile(
      path.join(fixturesDir, "sample.txt"),
    );
    expect(content).toBeTruthy();
    expect(content).toContain("Time flies like an arrow");

    // 2. Translate the content
    await coordinator.translateBook(content, outputPath);

    // 3. Verify the results
    expect(fs.existsSync(outputPath)).toBe(true);
    const translation = fs.readFileSync(outputPath, "utf-8");

    // Check for translated content
    expect(translation).toContain("El tiempo vuela como una flecha");
    expect(translation).toContain("Juan Herrero");
    expect(translation).toContain("María Jiménez");
    expect(translation).toContain("Profesor Blanco");
    expect(translation).toContain("Dr. Negro");
  });

  test("should handle empty input gracefully", async () => {
    await coordinator.translateBook("", outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
    const translation = fs.readFileSync(outputPath, "utf-8");
    expect(translation.trim()).toBe("");
  });
});
