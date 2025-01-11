export const CONFIG = {
  CHUNK_SIZE: 4000,
  CHUNK_OVERLAP: 200,
  COST_PER_1K_TOKENS: 0.008, // Claude Sonnet cost per 1K tokens
  DEFAULT_TARGET_LANGUAGE: "English",
  TRANSLATION_MEMORY_FILE: "./translation_memory.json",
  OUTPUT_DIR: "translated_books",
  PROGRESS_UPDATE_INTERVAL: 1000, // Update progress display every 1 second
  AUTO_SAVE_INTERVAL: 1, // Save after every chunk
  BACKUP_DIR: "./backups", // Directory for backup files
};
