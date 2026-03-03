import { NextRequest } from 'next/server';
import type { ForgeResponse } from '@/lib/api-types';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';
import { generateJSON } from '@/lib/llm';
import { FORGE_SYSTEM_PROMPT, getForgeUserPrompt } from '@/lib/prompts';
import { SchemaValidationError, validateForgeResponse } from '@/lib/runtime-validators';

export interface ResumeForgeRequest {
    original_resume: string;
    target_jd: string;
    jd_analysis: unknown;
    match_analysis?: unknown;
    target_style?: string;
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'llm');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId } = guard.context;

    try {
        const body: ResumeForgeRequest = await request.json();

        if (!body.original_resume?.trim() || !body.target_jd?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing required fields: original_resume and target_jd');
        }

        if (!process.env.LLM_API_KEY) {
            return createErrorResponse(requestId, 500, 'Service temporarily unavailable');
        }

        const userPrompt = getForgeUserPrompt(
            body.original_resume,
            body.target_jd,
            JSON.stringify(body.jd_analysis || {}),
            JSON.stringify(body.match_analysis || {}),
            body.target_style || 'auto'
        );

        const rawResult = await generateJSON<unknown>(FORGE_SYSTEM_PROMPT, userPrompt);
        const result: ForgeResponse = validateForgeResponse(rawResult);

        return createSuccessResponse(requestId, result);
    } catch (error) {
        console.error(`[${requestId}] Error in resume-forge:`, error);
        if (error instanceof SchemaValidationError) {
            return createErrorResponse(requestId, 502, 'Invalid AI response schema');
        }
        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
