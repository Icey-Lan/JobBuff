import { NextRequest } from 'next/server';
import type { IntelResponse } from '@/lib/api-types';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';
import { generateJSON } from '@/lib/llm';
import { INTEL_SYSTEM_PROMPT, getIntelUserPrompt } from '@/lib/prompts';
import { SchemaValidationError, validateIntelResponse } from '@/lib/runtime-validators';

export interface AnalyzeJobRequest {
    jd_text: string;
    resume_text: string;
    target_position?: string;
    target_salary?: string;
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'llm');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId } = guard.context;

    try {
        const body: AnalyzeJobRequest = await request.json();

        if (!body.jd_text?.trim() || !body.resume_text?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing required fields: jd_text and resume_text');
        }

        if (!process.env.LLM_API_KEY) {
            return createErrorResponse(requestId, 500, 'Service temporarily unavailable');
        }

        const userPrompt = getIntelUserPrompt(
            body.jd_text,
            body.resume_text,
            body.target_position || '未指定',
            body.target_salary || '未指定'
        );

        const rawResult = await generateJSON<unknown>(INTEL_SYSTEM_PROMPT, userPrompt);
        const result: IntelResponse = validateIntelResponse(rawResult);

        return createSuccessResponse(requestId, result);
    } catch (error) {
        console.error(`[${requestId}] Error in analyze-job:`, error);
        if (error instanceof SchemaValidationError) {
            return createErrorResponse(requestId, 502, 'Invalid AI response schema');
        }
        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
