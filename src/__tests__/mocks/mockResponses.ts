export const mockTranslations = {
  "Time flies like an arrow": "El tiempo vuela como una flecha",
  "fruit flies like a banana": "a las moscas les gustan los plátanos",
  "John Smith": "Juan Herrero",
  "Mary Johnson": "María Jiménez",
  "Professor White": "Profesor Blanco",
  "Dr. Black": "Dr. Negro",
  "is reading a book": "está leyendo un libro",
  "are discussing": "están discutiendo",
};

export function getMockTranslation(input: string): string {
  // Try to find an exact match
  if (mockTranslations[input]) {
    return mockTranslations[input];
  }

  // Try to find and replace all known phrases
  let translation = input;
  for (const [key, value] of Object.entries(mockTranslations)) {
    translation = translation.replace(key, value);
  }

  // If we made any replacements, return the result
  if (translation !== input) {
    return translation;
  }

  // Return a default mock translation
  return `[Mock translation to Spanish]: ${input}`;
}
