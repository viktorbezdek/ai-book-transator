import { Command } from "commander";
import { DocumentParser } from "./parsers/documentParser";
import { TranslationCoordinator } from "./translationCoordinator";
import { CONFIG } from "./config";
import * as path from "path";

const program = new Command();

program
  .name("book-translator")
  .description("AI-powered book translation tool")
  .version("1.0.0");

program
  .command("translate")
  .description("Translate a book file")
  .requiredOption(
    "-f, --file <path>",
    "Path to the book file (epub, pdf, docx, or txt)",
  )
  .requiredOption("-k, --api-key <key>", "Anthropic API key")
  .option(
    "-l, --language <lang>",
    "Target language",
    CONFIG.DEFAULT_TARGET_LANGUAGE,
  )
  .option("-o, --output <path>", "Output file path")
  .action(async (options) => {
    try {
      const parser = new DocumentParser();
      const coordinator = new TranslationCoordinator(
        options.apiKey,
        options.language,
      );

      console.log("Parsing document...");
      const text = await parser.parseFile(options.file);

      const outputPath =
        options.output ||
        path.join(
          CONFIG.OUTPUT_DIR,
          `${path.basename(options.file, path.extname(options.file))}_${options.language}.md`,
        );

      console.log(`Translation will be saved to: ${outputPath}`);
      await coordinator.translateBook(text, outputPath);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
