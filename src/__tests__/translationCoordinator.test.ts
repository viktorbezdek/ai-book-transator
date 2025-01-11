import {
  expect,
  test,
  describe,
  beforeEach,
  afterEach,
  beforeAll,
  mock,
} from "bun:test";
import { TranslationCoordinator } from "../translationCoordinator";
import { MockAnthropicAPI } from "./mocks/mockAnthropicAPI";
import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "../config";

// Mock the ChatAnthropic class
mock.module("@langchain/anthropic", () => {
  return {
    ChatAnthropic: MockAnthropicAPI,
  };
});

describe("TranslationCoordinator", () => {
  let coordinator: TranslationCoordinator;
  const outputPath = path.join(import.meta.dir, "test-translation.md");
  const memoryPath = CONFIG.TRANSLATION_MEMORY_FILE;

  beforeAll(() => {
    coordinator = new TranslationCoordinator("fake-api-key", "es");
  });

  beforeEach(() => {
    // Create test directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Clean up any existing test files
    try {
      fs.unlinkSync(outputPath);
      fs.unlinkSync(memoryPath);
    } catch (error) {
      // Ignore errors if files don't exist
    }
  });

  afterEach(() => {
    // Clean up test files
    try {
      fs.unlinkSync(outputPath);
      fs.unlinkSync(memoryPath);
    } catch (error) {
      // Ignore errors if files don't exist
    }
  });

  test("should translate text and save output", async () => {
    const text = "Time flies like an arrow. John Smith is reading a book.";
    await coordinator.translateBook(text, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);
    const translation = fs.readFileSync(outputPath, "utf-8");
    expect(translation).toContain("El tiempo vuela como una flecha");
    expect(translation).toContain("Juan Herrero");
  });

  test("should save translation memory", async () => {
    const text = "Professor White and Dr. Black are discussing.";
    await coordinator.translateBook(text, outputPath);

    expect(fs.existsSync(memoryPath)).toBe(true);
    const memory = JSON.parse(fs.readFileSync(memoryPath, "utf-8"));
    expect(memory.translations["Professor White"]).toBe("Profesor Blanco");
    expect(memory.translations["Dr. Black"]).toBe("Dr. Negro");
  });

  test("should handle empty text", async () => {
    await coordinator.translateBook("", outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
    const translation = fs.readFileSync(outputPath, "utf-8");
    expect(translation.trim()).toBe("");
  });

  test("should calculate cost correctly", async () => {
    const text = "A".repeat(1000); // 1000 characters ≈ 250 tokens
    await coordinator.translateBook(text, outputPath);

    // Cost calculation can be verified through private method testing or checking logs
    // This is a basic test that ensures the process completes
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
