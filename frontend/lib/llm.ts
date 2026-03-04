import OpenAI from 'openai';

// Initialize OpenAI client with AIHubMix compatible endpoint
const openai = new OpenAI({
    apiKey: process.env.LLM_API_KEY || '',
    baseURL: process.env.LLM_BASE_URL || 'https://aihubmix.com/v1',
});

// Default model - can be overridden via environment variable
const DEFAULT_MODEL = process.env.LLM_MODEL || 'gemini-3-flash-preview';

// Helper to generate JSON response
export async function generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    model?: string
): Promise<T> {
    const response = await openai.chat.completions.create({
        model: model || DEFAULT_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${userPrompt}\n\n请以严格的 JSON 格式输出，不要包含任何 markdown 代码块标记。` },
        ],
        temperature: 0.4,
        max_tokens: 8192,
    });

    const text = response.choices[0]?.message?.content || '';

    // Clean up potential markdown code blocks
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    try {
        return JSON.parse(cleanedText) as T;
    } catch {
        console.error('Failed to parse LLM response as JSON:', text);
        throw new Error('AI response was not valid JSON');
    }
}

// Helper for streaming responses (for future use)
export async function* generateStream(
    systemPrompt: string,
    userPrompt: string,
    model?: string
) {
    const stream = await openai.chat.completions.create({
        model: model || DEFAULT_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        stream: true,
    });

    for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
            yield text;
        }
    }
}
