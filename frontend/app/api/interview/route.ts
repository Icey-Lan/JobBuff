import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/llm';
import { INTERVIEW_SYSTEM_PROMPT, getInterviewUserPrompt } from '@/lib/prompts';

export interface InterviewRequest {
    jd_info: string;
    jd_analysis: object;
    user_resume: string;
}

export interface InterviewResponse {
    interview_questions: Array<{
        id: string;
        type: string;
        difficulty: string;
        question: string;
        jd_relevance: string;
        reference_answer: {
            key_points: string[];
            example_answer: string;
            common_mistakes: string[];
        };
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const body: InterviewRequest = await request.json();

        if (!body.jd_info || !body.user_resume) {
            return NextResponse.json(
                { error: 'Missing required fields: jd_info and user_resume' },
                { status: 400 }
            );
        }

        if (!process.env.LLM_API_KEY) {
            return NextResponse.json(
                { error: 'LLM_API_KEY not configured' },
                { status: 500 }
            );
        }

        const userPrompt = getInterviewUserPrompt(
            body.jd_info,
            JSON.stringify(body.jd_analysis || {}),
            body.user_resume
        );

        const result = await generateJSON<InterviewResponse>(INTERVIEW_SYSTEM_PROMPT, userPrompt);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in interview:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
