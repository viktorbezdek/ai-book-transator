export default async function pdfParse(dataBuffer: Buffer) {
    return {
        text: 'Mock PDF content for testing',
        numpages: 1,
        numrender: 1,
        info: {
            PDFFormatVersion: '1.4',
            IsAcroFormPresent: false,
            IsXFAPresent: false,
            Title: 'Mock PDF',
            Author: 'Test Author',
            Creator: 'Test Creator',
            Producer: 'Test Producer',
            CreationDate: 'D:20240111000000Z',
            ModDate: 'D:20240111000000Z'
        },
        metadata: null,
        version: '1.0.0'
    };
}