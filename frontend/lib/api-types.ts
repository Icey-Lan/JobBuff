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

export interface ForgeResponse {
    forge_summary: {
        total_changes: number;
        estimated_match_boost: string;
        detected_style: string;
        key_improvements: string[];
        unmatched_jd_requirements: string[];
    };
    changes: Array<{
        id: string;
        module: string;
        location: string;
        priority: 'P0' | 'P1' | 'P2';
        title: string;
        issue: string;
        before: string;
        after: string;
        rationale: string;
        is_fabrication: boolean;
        fabrication_warning: string | null;
        needs_user_confirm: boolean;
        confirm_note: string | null;
    }>;
    forged_resume: object;
    markdown_export: string;
}

export interface ActionPlanResponse {
    strategy: {
        tier: 'A档' | 'B档' | 'C档' | 'D档';
        tier_reason: string;
        effort: string;
        priority_actions: string[];
    };
    channels: Array<{
        name: string;
        priority: number;
        how_to_find: string;
        success_rate: 'high' | 'medium' | 'low';
    }>;
    greetings: {
        professional: {
            style: '专业风';
            target: string;
            content: string;
            word_count: number;
        };
        passionate: {
            style: '热情风';
            target: string;
            content: string;
            word_count: number;
        };
        concise: {
            style: '简洁风';
            target: string;
            content: string;
            word_count: number;
        };
    };
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
        time_limit: string;
    }>;
}

export interface FeedbackResponse {
    feedback: {
        overall_score: 'A (优秀)' | 'B (良好)' | 'C (及格)' | 'D (需改进)';
        highlights: string[];
        improvements: string[];
        suggestions: string[];
        revised_answer: string | null;
    };
}
