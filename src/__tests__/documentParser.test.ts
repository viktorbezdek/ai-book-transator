import { expect, test, describe, beforeAll, mock } from "bun:test";
import { DocumentParser } from "../parsers/documentParser";
import * as fs from "fs";
import * as path from "path";

// Mock pdf-parse
mock.module("pdf-parse", () => import("mock-pdf-parse"));

describe("DocumentParser", () => {
  let parser: DocumentParser;
  let fixturesDir: string;

  beforeAll(() => {
    parser = new DocumentParser();
    fixturesDir = path.join(import.meta.dir, "fixtures");
  });

  test("should parse txt files correctly", async () => {
    const filePath = path.join(fixturesDir, "sample.txt");
    const content = await parser.parseFile(filePath);

    expect(content).toContain("This is a sample text for testing");
    expect(content).toContain("John Smith");
    expect(content).toContain("Mary Johnson");
  });

  test("should throw error for unsupported file format", async () => {
    const filePath = "test.xyz";
    try {
      await parser.parseFile(filePath);
      throw new Error("Expected to throw but did not");
    } catch (error) {
      expect(error.message).toContain("Unsupported file format: .xyz");
    }
  });

  test("should throw error for non-existent file", async () => {
    const filePath = "nonexistent.txt";
    try {
      await parser.parseFile(filePath);
      throw new Error("Expected to throw but did not");
    } catch (error) {
      expect(error.message.toLowerCase()).toContain(
        "no such file or directory",
      );
    }
  });
});
