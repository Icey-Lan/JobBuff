import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/llm';
import { INTEL_SYSTEM_PROMPT, getIntelUserPrompt } from '@/lib/prompts';

export interface AnalyzeJobRequest {
    jd_text: string;
    resume_text: string;
    target_position: string;
    target_salary: string;
}

export interface IntelResponse {
    jd_insight: {
        role_reality: {
            title: string;
            team_inference: string | null;
            daily_work: string[];
            hidden_duties: string[];
        };
        requirements: {
            must_have: string[];
            nice_to_have: string[];
            hidden: string[];
        };
        risk_assessment: {
            red_flags: Array<{ signal: string; evidence: string; meaning: string }>;
            yellow_flags: Array<{ signal: string; evidence: string; meaning: string }>;
            overall_risk: 'low' | 'medium' | 'high';
        };
        salary_analysis: {
            range: string;
            vs_market: 'below' | 'at' | 'above' | 'unknown';
            vs_target: 'below' | 'at' | 'above';
        };
    };
    match_analysis: {
        overall_score: number;
        radar_chart: {
            skills: number;
            experience: number;
            education: number;
            industry: number;
            fit: number;
        };
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
        gap_analysis: Array<{
            jd_requirement: string;
            resume_status: 'matched' | 'partial' | 'missing';
            suggestion: string | null;
        }>;
    };
    verdict: {
        recommendation: '推荐投递' | '谨慎考虑' | '不建议投递';
        one_line_summary: string;
        key_points: string[];
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: AnalyzeJobRequest = await request.json();

        // Validate required fields
        if (!body.jd_text || !body.resume_text) {
            return NextResponse.json(
                { error: 'Missing required fields: jd_text and resume_text' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.LLM_API_KEY) {
            return NextResponse.json(
                { error: 'LLM_API_KEY not configured' },
                { status: 500 }
            );
        }

        const userPrompt = getIntelUserPrompt(
            body.jd_text,
            body.resume_text,
            body.target_position || '未指定',
            body.target_salary || '未指定'
        );

        const result = await generateJSON<IntelResponse>(INTEL_SYSTEM_PROMPT, userPrompt);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in analyze-job:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
