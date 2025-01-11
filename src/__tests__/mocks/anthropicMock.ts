export const mockTranslationResponses = {
    'es': {
        'Time flies like an arrow': 'El tiempo vuela como una flecha',
        'fruit flies like a banana': 'a las moscas les gustan los plátanos',
        'John Smith': 'Juan Herrero',
        'Mary Johnson': 'María Jiménez',
        'Professor White': 'Profesor Blanco',
        'Dr. Black': 'Dr. Negro'
    },
    'fr': {
        'Time flies like an arrow': 'Le temps passe comme une flèche',
        'fruit flies like a banana': 'les mouches aiment les bananes',
        'John Smith': 'Jean Lefebvre',
        'Mary Johnson': 'Marie Dupont',
        'Professor White': 'Professeur Blanc',
        'Dr. Black': 'Dr. Noir'
    }
};

export class MockAnthropicAPI {
    private targetLanguage: string;

    constructor(targetLanguage: string) {
        this.targetLanguage = targetLanguage;
    }

    async call(messages: any[]): Promise<{ content: string }> {
        const input = messages[messages.length - 1].content as string;
        const responses = mockTranslationResponses[this.targetLanguage] || {};
        
        // Find the closest matching key in the responses
        const matchingKey = Object.keys(responses).find(key => input.includes(key));
        
        if (matchingKey) {
            return { content: responses[matchingKey] };
        }
        
        // If no match found, return a mock translation
        return { content: `[Mock translation to ${this.targetLanguage}]: ${input}` };
    }
}