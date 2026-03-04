import { NextRequest } from 'next/server';
import type { ActionPlanResponse } from '@/lib/api-types';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';
import { generateJSON } from '@/lib/llm';
import { ACTION_PLAN_SYSTEM_PROMPT, getActionPlanUserPrompt } from '@/lib/prompts';
import { SchemaValidationError, validateActionPlanResponse } from '@/lib/runtime-validators';

export interface ActionPlanRequest {
    jd_info: string;
    match_analysis: unknown;
    user_resume: string;
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'llm');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId } = guard.context;

    try {
        const body: ActionPlanRequest = await request.json();

        if (!body.jd_info?.trim() || !body.user_resume?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing required fields: jd_info and user_resume');
        }

        const userPrompt = getActionPlanUserPrompt(
            body.jd_info,
            JSON.stringify(body.match_analysis || {}),
            body.user_resume
        );

        const rawResult = await generateJSON<unknown>(ACTION_PLAN_SYSTEM_PROMPT, userPrompt);
        const result: ActionPlanResponse = validateActionPlanResponse(rawResult);

        return createSuccessResponse(requestId, result);
    } catch (error) {
        console.error(`[${requestId}] Error in action-plan:`, error);
        if (error instanceof SchemaValidationError) {
            const message =
                process.env.NODE_ENV === 'development'
                    ? `Invalid AI response schema: ${error.message}`
                    : 'Invalid AI response schema';
            return createErrorResponse(requestId, 502, message);
        }
        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
