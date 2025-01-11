import { expect, test, describe, beforeAll, mock } from "bun:test";
import { TranslationAgent } from "../agents/translationAgent";
import { MockAnthropicAPI } from "./mocks/mockAnthropicAPI";

// Mock the ChatAnthropic class
mock.module("@langchain/anthropic", () => {
  return {
    ChatAnthropic: MockAnthropicAPI,
  };
});

describe("TranslationAgent", () => {
  let agent: TranslationAgent;

  beforeAll(() => {
    agent = new TranslationAgent("fake-api-key", "es");
  });

  test("should translate text correctly", async () => {
    const text = "Time flies like an arrow";
    const translation = await agent.translateChunk(text);

    expect(translation).toBe("El tiempo vuela como una flecha");
  });

  test("should handle wordplay appropriately", async () => {
    const text = "fruit flies like a banana";
    const translation = await agent.translateChunk(text);

    expect(translation).toBe("a las moscas les gustan los plátanos");
  });

  test("should maintain consistent name translations", async () => {
    const name = "John Smith";
    const translation1 = await agent.processName(name);
    const translation2 = await agent.processName(name);

    expect(translation1).toBe("Juan Herrero");
    expect(translation2).toBe("Juan Herrero");
    expect(agent.getNameTranslations().get(name)).toBe("Juan Herrero");
  });

  test("should update and retrieve translation memory", async () => {
    const original = "Hello World";
    const translation = "Hola Mundo";

    agent.updateTranslationMemory(original, translation);
    const memory = agent.getTranslationMemory();

    expect(memory.get(original)).toBe(translation);
  });
});
