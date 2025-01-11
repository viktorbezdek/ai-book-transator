import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TranslationAgent } from "./agents/translationAgent";
import { CONFIG } from "./config";
import * as fs from "fs";
import * as path from "path";

export class TranslationCoordinator {
  private agent: TranslationAgent;
  private textSplitter: RecursiveCharacterTextSplitter;
  private totalTokens: number = 0;

  constructor(apiKey: string, targetLanguage: string) {
    this.agent = new TranslationAgent(apiKey, targetLanguage);
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CONFIG.CHUNK_SIZE,
      chunkOverlap: CONFIG.CHUNK_OVERLAP,
    });
  }

  async translateBook(text: string, outputPath: string): Promise<void> {
    const chunks = await this.textSplitter.splitText(text);
    const totalChunks = chunks.length;
    let translatedText = "";
    let context = "";
    let startTime = Date.now();
    let lastProgressUpdate = startTime;
    let wordsTranslated = 0;

    console.log(`Starting translation of ${totalChunks} chunks...`);
    console.log("Processing names for consistency...");

    // First, process all names in the text to ensure consistency
    const nameRegex = /(?:[A-Z][a-z]+|[A-Z]r\.) (?:[A-Z][a-z]+|[A-Z]\.)+/g;
    const names = text.match(nameRegex) || [];
    const uniqueNames = [...new Set(names)];
    for (let i = 0; i < uniqueNames.length; i++) {
      const name = uniqueNames[i];
      const nameProgress = (((i + 1) / uniqueNames.length) * 100).toFixed(1);
      process.stdout.write(`\rProcessing names: ${nameProgress}% (${i + 1}/${uniqueNames.length})`);
      await this.agent.processName(name);
      this.saveTranslationMemory();
    }
    console.log("\nNames processed successfully!");

    // Create progress file
    const progressFile = `${outputPath}.progress`;
    fs.writeFileSync(progressFile, JSON.stringify({
      totalChunks,
      completedChunks: 0,
      wordsTranslated: 0,
      startTime,
      lastSaveTime: startTime
    }));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkWords = chunk.split(/\s+/).length;
      const progress = (((i + 1) / totalChunks) * 100).toFixed(1);
      const currentTime = Date.now();
      
      // Update progress every second
      if (currentTime - lastProgressUpdate >= 1000) {
        const elapsedMinutes = (currentTime - startTime) / 60000;
        const wordsPerMinute = Math.round(wordsTranslated / elapsedMinutes);
        const remainingChunks = totalChunks - (i + 1);
        const estimatedRemainingMinutes = remainingChunks * (elapsedMinutes / (i + 1));
        
        process.stdout.write(`\r\x1b[K`); // Clear line
        process.stdout.write(
          `Progress: ${progress}% | Chunk: ${i + 1}/${totalChunks} | ` +
          `Speed: ${wordsPerMinute} words/min | ` +
          `ETA: ${Math.round(estimatedRemainingMinutes)}min`
        );
        
        lastProgressUpdate = currentTime;
      }

      const translatedChunk = await this.agent.translateChunk(chunk, context);
      translatedText += translatedChunk + "\n\n";
      wordsTranslated += chunkWords;

      // Update context with the last translated chunk
      context = translatedChunk;

      // Estimate token count (rough estimation: 4 characters per token)
      this.totalTokens += (chunk.length + translatedChunk.length) / 4;

      // Save progress after every chunk
      this.saveProgress(outputPath, translatedText);
      this.saveTranslationMemory();
      
      // Update progress file
      fs.writeFileSync(progressFile, JSON.stringify({
        totalChunks,
        completedChunks: i + 1,
        wordsTranslated,
        startTime,
        lastSaveTime: Date.now()
      }));
    }

    // Save final translation
    this.saveProgress(outputPath, translatedText);
    this.saveTranslationMemory();

    // Remove progress file
    fs.unlinkSync(progressFile);

    // Display final summary
    const endTime = Date.now();
    const totalMinutes = ((endTime - startTime) / 60000).toFixed(1);
    const averageSpeed = Math.round(wordsTranslated / parseFloat(totalMinutes));
    
    console.log("\n\n=== Translation Summary ===");
    console.log(`✓ Translation completed in ${totalMinutes} minutes`);
    console.log(`✓ Total words translated: ${wordsTranslated}`);
    console.log(`✓ Average speed: ${averageSpeed} words/minute`);
    console.log(`✓ Unique names processed: ${uniqueNames.length}`);
    console.log(`✓ Total chunks processed: ${totalChunks}`);
    console.log(`✓ Translation memory entries: ${this.agent.getTranslationMemory().size}`);
    console.log(`✓ Estimated cost: $${this.calculateCost()}`);
    console.log(`✓ Output saved to: ${outputPath}`);
    console.log("=====================");
  }

  private saveProgress(outputPath: string, content: string) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, content);
  }

  private saveTranslationMemory() {
    const translations = this.agent.getTranslationMemory();
    const names = this.agent.getNameTranslations();

    const memory = {
      translations: Object.fromEntries(translations),
      names: Object.fromEntries(names),
    };

    const dir = path.dirname(CONFIG.TRANSLATION_MEMORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Ensure all names are also in the translations memory
    for (const [name, translation] of names.entries()) {
      memory.translations[name] = translation;
    }

    fs.writeFileSync(
      CONFIG.TRANSLATION_MEMORY_FILE,
      JSON.stringify(memory, null, 2),
    );
  }

  private calculateCost(): string {
    return ((this.totalTokens / 1000) * CONFIG.COST_PER_1K_TOKENS).toFixed(2);
  }
}
