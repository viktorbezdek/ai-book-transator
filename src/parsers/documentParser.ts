import * as fs from "fs";
import * as path from "path";
import pdfParse from "pdf-parse";
import * as epub from "epub2";
import mammoth from "mammoth";

export class DocumentParser {
  async parseFile(filePath: string): Promise<string> {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case ".pdf":
        return this.parsePdf(filePath);
      case ".epub":
        return this.parseEpub(filePath);
      case ".docx":
        return this.parseDocx(filePath);
      case ".txt":
        return this.parseTxt(filePath);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  private async parsePdf(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  private async parseEpub(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const epubBook = new epub(filePath);
      let content = "";

      epubBook.on("end", () => {
        epubBook.flow.forEach((chapter: any) => {
          if (chapter.text) {
            content += chapter.text + "\n\n";
          }
        });
        resolve(content);
      });

      epubBook.on("error", reject);
      epubBook.parse();
    });
  }

  private async parseDocx(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  private async parseTxt(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, "utf-8");
  }
}
