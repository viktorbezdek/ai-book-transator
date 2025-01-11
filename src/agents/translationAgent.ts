import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import "dotenv/config";

const DEFAULT_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

if (!DEFAULT_API_KEY || DEFAULT_API_KEY === "") {
  console.error("Missing API key");
  process.exit(1);
}

export class TranslationAgent {
  private model: ChatAnthropic;
  private targetLanguage: string;
  private translationMemory: Map<string, string>;
  private nameTranslations: Map<string, string>;

  constructor(apiKey: string = DEFAULT_API_KEY, targetLanguage: string) {
    this.model = new ChatAnthropic({
      modelName: "claude-3-sonnet-20240229",
      anthropicApiKey: apiKey,
      temperature: 0.3,
    });
    this.targetLanguage = targetLanguage;
    this.translationMemory = new Map();
    this.nameTranslations = new Map();
    
    // Load existing translation memory if available
    try {
      if (fs.existsSync(CONFIG.TRANSLATION_MEMORY_FILE)) {
        const memory = JSON.parse(fs.readFileSync(CONFIG.TRANSLATION_MEMORY_FILE, 'utf-8'));
        if (memory.translations) {
          Object.entries(memory.translations).forEach(([key, value]) => {
            this.translationMemory.set(key, value as string);
          });
        }
        if (memory.names) {
          Object.entries(memory.names).forEach(([key, value]) => {
            this.nameTranslations.set(key, value as string);
          });
        }
      }
    } catch (error) {
      console.warn("Could not load existing translation memory:", error.message);
    }
  }

  async translateChunk(chunk: string, context: string = ""): Promise<string> {
    const systemPrompt = `You are a professional literary translator with expertise in capturing nuances, wordplay, and cultural context. 
Your task is to translate the following text into ${this.targetLanguage} while maintaining the original style and meaning.
Consider the provided context and maintain consistency with previously translated names and terms.

Translation guidelines:
1. Preserve the original formatting and structure
2. Maintain consistent translation of names and terms
3. When encountering wordplay, create an equivalent in the target language that preserves the intended effect
4. Keep cultural references accessible while preserving their essence
5. Maintain the author's tone and style

Context provided: ${context}`;

    const response = await this.model.call([
      new SystemMessage(systemPrompt),
      new HumanMessage(chunk),
    ]);

    return response.content as string;
  }

  async processName(name: string, context: string = ""): Promise<string> {
    if (this.nameTranslations.has(name)) {
      return this.nameTranslations.get(name)!;
    }

    const systemPrompt = `You are a naming expert specializing in cross-cultural name adaptation.
Your task is to determine how to handle the following name in ${this.targetLanguage} translation.
Consider the cultural context and any meaning or wordplay in the name.

Guidelines:
1. If the name has meaning or wordplay, suggest an appropriate adaptation
2. If it's a proper name without special meaning, suggest whether to keep it as is or adapt it
3. Consider cultural connotations in the target language
4. Provide explanation for your choice

Context: ${context}`;

    const response = await this.model.call([
      new SystemMessage(systemPrompt),
      new HumanMessage(name),
    ]);

    const translatedName = response.content as string;
    this.nameTranslations.set(name, translatedName);

    // Also add to translation memory for consistency
    this.updateTranslationMemory(name, translatedName);

    return translatedName;
  }

  updateTranslationMemory(original: string, translation: string) {
    this.translationMemory.set(original, translation);
  }

  getTranslationMemory(): Map<string, string> {
    return this.translationMemory;
  }

  getNameTranslations(): Map<string, string> {
    return this.nameTranslations;
  }
}
