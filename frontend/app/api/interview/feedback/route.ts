import { NextRequest } from 'next/server';
import type { FeedbackResponse } from '@/lib/api-types';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';
import { generateJSON } from '@/lib/llm';
import { FEEDBACK_SYSTEM_PROMPT, getFeedbackUserPrompt } from '@/lib/prompts';
import { SchemaValidationError, validateFeedbackResponse } from '@/lib/runtime-validators';

export interface FeedbackRequest {
    question: string;
    key_points: string[];
    user_answer: string;
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'llm');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId } = guard.context;

    try {
        const body: FeedbackRequest = await request.json();

        if (!body.question?.trim() || !body.user_answer?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing required fields: question and user_answer');
        }

        const userPrompt = getFeedbackUserPrompt(
            body.question,
            body.key_points || [],
            body.user_answer
        );

        const rawResult = await generateJSON<unknown>(FEEDBACK_SYSTEM_PROMPT, userPrompt);
        const result: FeedbackResponse = validateFeedbackResponse(rawResult);

        return createSuccessResponse(requestId, result);
    } catch (error) {
        console.error(`[${requestId}] Error in interview feedback:`, error);
        if (error instanceof SchemaValidationError) {
            return createErrorResponse(requestId, 502, 'Invalid AI response schema');
        }
        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
