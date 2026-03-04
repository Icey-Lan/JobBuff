import { NextRequest } from 'next/server';
import type { InterviewResponse } from '@/lib/api-types';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';
import { generateJSON } from '@/lib/llm';
import { INTERVIEW_SYSTEM_PROMPT, getInterviewUserPrompt } from '@/lib/prompts';
import { SchemaValidationError, validateInterviewResponse } from '@/lib/runtime-validators';

export interface InterviewRequest {
    jd_info: string;
    jd_analysis: unknown;
    user_resume: string;
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'llm');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId } = guard.context;

    try {
        const body: InterviewRequest = await request.json();

        if (!body.jd_info?.trim() || !body.user_resume?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing required fields: jd_info and user_resume');
        }

        const userPrompt = getInterviewUserPrompt(
            body.jd_info,
            JSON.stringify(body.jd_analysis || {}),
            body.user_resume
        );

        const rawResult = await generateJSON<unknown>(INTERVIEW_SYSTEM_PROMPT, userPrompt);
        const result: InterviewResponse = validateInterviewResponse(rawResult);

        return createSuccessResponse(requestId, result);
    } catch (error) {
        console.error(`[${requestId}] Error in interview:`, error);
        if (error instanceof SchemaValidationError) {
            return createErrorResponse(requestId, 502, 'Invalid AI response schema');
        }
        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
