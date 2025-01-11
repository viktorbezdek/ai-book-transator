import { getMockTranslation, mockTranslations } from './mockResponses';

export class MockAnthropicAPI {
    private temperature: number;
    private anthropicApiKey: string;

    constructor(config: any) {
        this.temperature = config?.temperature ?? 0.7;
        this.anthropicApiKey = config?.anthropicApiKey ?? 'mock-api-key';
    }

    async invoke(input: any): Promise<any> {
        const lastMessage = input.messages[input.messages.length - 1];
        const content = lastMessage.content as string;

        // Check if this is a name translation request
        if (content.includes('name adaptation')) {
            const nameMatch = Object.keys(mockTranslations).find(key => {
                const lines = content.split('\n');
                const lastLine = lines[lines.length - 1];
                return key === lastLine.trim();
            });
            if (nameMatch) {
                return {
                    content: mockTranslations[nameMatch]
                };
            }
        }

        return {
            content: getMockTranslation(content)
        };
    }

    async call(messages: any[]): Promise<{ content: string }> {
        const lastMessage = messages[messages.length - 1];
        const input = lastMessage.content as string;

        // Check if this is a name translation request
        if (input.includes('name adaptation')) {
            const nameMatch = Object.keys(mockTranslations).find(key => {
                const lines = input.split('\n');
                const lastLine = lines[lines.length - 1];
                return key === lastLine.trim();
            });
            if (nameMatch) {
                return {
                    content: mockTranslations[nameMatch]
                };
            }
        }

        return { content: getMockTranslation(input) };
    }

    async complete(input: any): Promise<any> {
        return {
            completion: getMockTranslation(input.prompt)
        };
    }

    async stream(input: any): Promise<any> {
        return {
            completion: getMockTranslation(input.prompt)
        };
    }
}