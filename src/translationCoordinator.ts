import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TranslationAgent } from './agents/translationAgent';
import { CONFIG } from './config';
import * as fs from 'fs';
import * as path from 'path';

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
        let translatedText = '';
        let context = '';

        console.log(`Starting translation of ${totalChunks} chunks...`);

        // First, process all names in the text to ensure consistency
        const nameRegex = /(?:[A-Z][a-z]+|[A-Z]r\.) (?:[A-Z][a-z]+|[A-Z]\.)+/g;
        const names = text.match(nameRegex) || [];
        for (const name of names) {
            await this.agent.processName(name);
        }

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const progress = ((i + 1) / totalChunks * 100).toFixed(2);
            
            console.log(`Translating chunk ${i + 1}/${totalChunks} (${progress}%)`);
            
            const translatedChunk = await this.agent.translateChunk(chunk, context);
            translatedText += translatedChunk + '\n\n';
            
            // Update context with the last translated chunk
            context = translatedChunk;
            
            // Estimate token count (rough estimation: 4 characters per token)
            this.totalTokens += (chunk.length + translatedChunk.length) / 4;
            
            // Save progress periodically
            if (i % 5 === 0) {
                this.saveProgress(outputPath, translatedText);
            }
        }

        // Save final translation
        this.saveProgress(outputPath, translatedText);
        
        // Save translation memory
        this.saveTranslationMemory();
        
        console.log('\nTranslation completed!');
        console.log(`Estimated cost: $${this.calculateCost()}`);
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
            names: Object.fromEntries(names)
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
            JSON.stringify(memory, null, 2)
        );
    }

    private calculateCost(): string {
        return ((this.totalTokens / 1000) * CONFIG.COST_PER_1K_TOKENS).toFixed(2);
    }
}