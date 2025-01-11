# Book Translator

A powerful BunJS-based tool for translating books using LLMs while maintaining context and consistency.

## Features

- Support for multiple file formats:
  - EPUB
  - PDF
  - DOCX
  - TXT
- Context-aware translation with memory
- Name consistency tracking
- Progress monitoring and cost estimation
- Periodic progress saving
- CLI interface

## Known Issues

PDF currently doesn't work. Will be fixed soon.

## Installation

```bash
# Clone the repository
git clone https://github.com/viktorbezdek/ai-book-transator.git
cd ai-book-transator

# Install dependencies
bun install
```

## Usage

```bash
bun run src/index.ts translate -f /path/to/book.epub -k your-api-key -l "Target Language"
```

### Options

- `-f, --file <path>`: Path to the book file (required)
- `-k, --api-key <key>`: Anthropic API key (required)
- `-l, --language <lang>`: Target language (default: "English")
- `-o, --output <path>`: Output file path (optional)

## How it Works

The tool uses a sophisticated approach to translate books:

1. **Document Parsing**: Handles various file formats and extracts text content
2. **Chunking**: Splits content into manageable pieces while maintaining context
3. **Translation Memory**: Keeps track of previous translations for consistency
4. **Name Handling**: Special processing for character names and places
5. **Context Management**: Maintains context between chunks for coherent translation
6. **Progress Tracking**: Shows translation progress and estimates cost

## Architecture

The application consists of several key components:

1. **DocumentParser**: Handles different file formats
2. **TranslationAgent**: Core translation logic using Claude Sonnet
3. **TranslationCoordinator**: Manages the overall translation process

## Development

```bash
# Run in development mode
bun run start

# Build for production
bun run build
```

## License

MIT
