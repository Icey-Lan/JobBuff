import type {
    ActionPlanResponse,
    FeedbackResponse,
    ForgeResponse,
    IntelResponse,
    InterviewResponse,
} from '@/lib/api-types';

type JsonRecord = Record<string, unknown>;

export class SchemaValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SchemaValidationError';
    }
}

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectRecord(value: unknown, path: string): JsonRecord {
    if (!isRecord(value)) {
        throw new SchemaValidationError(`${path} must be an object`);
    }
    return value;
}

function expectArray(value: unknown, path: string): unknown[] {
    if (!Array.isArray(value)) {
        throw new SchemaValidationError(`${path} must be an array`);
    }
    return value;
}

function expectString(value: unknown, path: string): string {
    if (typeof value !== 'string') {
        throw new SchemaValidationError(`${path} must be a string`);
    }
    const trimmed = value.trim();
    if (!trimmed) {
        throw new SchemaValidationError(`${path} must not be empty`);
    }
    return trimmed;
}

function expectNullableString(value: unknown, path: string): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    return expectString(value, path);
}

function expectStringArray(value: unknown, path: string): string[] {
    return expectArray(value, path).map((item, index) => expectString(item, `${path}[${index}]`));
}

function expectBoolean(value: unknown, path: string, defaultValue = false): boolean {
    if (value === undefined) {
        return defaultValue;
    }
    if (typeof value !== 'boolean') {
        throw new SchemaValidationError(`${path} must be a boolean`);
    }
    return value;
}

function expectNumber(value: unknown, path: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new SchemaValidationError(`${path} must be a finite number`);
    }
    return value;
}

function expectEnum<T extends string>(
    value: unknown,
    allowed: readonly T[],
    path: string
): T {
    if (typeof value !== 'string' || !allowed.includes(value as T)) {
        throw new SchemaValidationError(`${path} must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
}

function parseRiskFlags(value: unknown, path: string): Array<{ signal: string; evidence: string; meaning: string }> {
    const array = expectArray(value, path);
    return array.map((item, index) => {
        const row = expectRecord(item, `${path}[${index}]`);
        return {
            signal: expectString(row.signal, `${path}[${index}].signal`),
            evidence: expectString(row.evidence, `${path}[${index}].evidence`),
            meaning: expectString(row.meaning, `${path}[${index}].meaning`),
        };
    });
}

export function validateIntelResponse(value: unknown): IntelResponse {
    const root = expectRecord(value, 'root');

    const jdInsight = expectRecord(root.jd_insight, 'jd_insight');
    const roleReality = expectRecord(jdInsight.role_reality, 'jd_insight.role_reality');
    const requirements = expectRecord(jdInsight.requirements, 'jd_insight.requirements');
    const riskAssessment = expectRecord(jdInsight.risk_assessment, 'jd_insight.risk_assessment');
    const salaryAnalysis = expectRecord(jdInsight.salary_analysis, 'jd_insight.salary_analysis');

    const matchAnalysis = expectRecord(root.match_analysis, 'match_analysis');
    const radarChart = expectRecord(matchAnalysis.radar_chart, 'match_analysis.radar_chart');
    const swot = expectRecord(matchAnalysis.swot, 'match_analysis.swot');
    const gapAnalysis = expectArray(matchAnalysis.gap_analysis, 'match_analysis.gap_analysis');

    const verdict = expectRecord(root.verdict, 'verdict');

    return {
        jd_insight: {
            role_reality: {
                title: expectString(roleReality.title, 'jd_insight.role_reality.title'),
                team_inference: expectNullableString(roleReality.team_inference, 'jd_insight.role_reality.team_inference'),
                daily_work: expectStringArray(roleReality.daily_work, 'jd_insight.role_reality.daily_work'),
                hidden_duties: expectStringArray(roleReality.hidden_duties, 'jd_insight.role_reality.hidden_duties'),
            },
            requirements: {
                must_have: expectStringArray(requirements.must_have, 'jd_insight.requirements.must_have'),
                nice_to_have: expectStringArray(requirements.nice_to_have, 'jd_insight.requirements.nice_to_have'),
                hidden: expectStringArray(requirements.hidden, 'jd_insight.requirements.hidden'),
            },
            risk_assessment: {
                red_flags: parseRiskFlags(riskAssessment.red_flags, 'jd_insight.risk_assessment.red_flags'),
                yellow_flags: parseRiskFlags(riskAssessment.yellow_flags, 'jd_insight.risk_assessment.yellow_flags'),
                overall_risk: expectEnum(
                    riskAssessment.overall_risk,
                    ['low', 'medium', 'high'] as const,
                    'jd_insight.risk_assessment.overall_risk'
                ),
            },
            salary_analysis: {
                range: expectString(salaryAnalysis.range, 'jd_insight.salary_analysis.range'),
                vs_market: expectEnum(
                    salaryAnalysis.vs_market,
                    ['below', 'at', 'above', 'unknown'] as const,
                    'jd_insight.salary_analysis.vs_market'
                ),
                vs_target: expectEnum(
                    salaryAnalysis.vs_target,
                    ['below', 'at', 'above'] as const,
                    'jd_insight.salary_analysis.vs_target'
                ),
            },
        },
        match_analysis: {
            overall_score: expectNumber(matchAnalysis.overall_score, 'match_analysis.overall_score'),
            radar_chart: {
                skills: expectNumber(radarChart.skills, 'match_analysis.radar_chart.skills'),
                experience: expectNumber(radarChart.experience, 'match_analysis.radar_chart.experience'),
                education: expectNumber(radarChart.education, 'match_analysis.radar_chart.education'),
                industry: expectNumber(radarChart.industry, 'match_analysis.radar_chart.industry'),
                fit: expectNumber(radarChart.fit, 'match_analysis.radar_chart.fit'),
            },
            swot: {
                strengths: expectStringArray(swot.strengths, 'match_analysis.swot.strengths'),
                weaknesses: expectStringArray(swot.weaknesses, 'match_analysis.swot.weaknesses'),
                opportunities: expectStringArray(swot.opportunities, 'match_analysis.swot.opportunities'),
                threats: expectStringArray(swot.threats, 'match_analysis.swot.threats'),
            },
            gap_analysis: gapAnalysis.map((item, index) => {
                const row = expectRecord(item, `match_analysis.gap_analysis[${index}]`);
                return {
                    jd_requirement: expectString(row.jd_requirement, `match_analysis.gap_analysis[${index}].jd_requirement`),
                    resume_status: expectEnum(
                        row.resume_status,
                        ['matched', 'partial', 'missing'] as const,
                        `match_analysis.gap_analysis[${index}].resume_status`
                    ),
                    suggestion: expectNullableString(row.suggestion, `match_analysis.gap_analysis[${index}].suggestion`),
                };
            }),
        },
        verdict: {
            recommendation: expectEnum(
                verdict.recommendation,
                ['推荐投递', '谨慎考虑', '不建议投递'] as const,
                'verdict.recommendation'
            ),
            one_line_summary: expectString(verdict.one_line_summary, 'verdict.one_line_summary'),
            key_points: expectStringArray(verdict.key_points, 'verdict.key_points'),
        },
    };
}

export function validateForgeResponse(value: unknown): ForgeResponse {
    const root = expectRecord(value, 'root');
    const summary = expectRecord(root.forge_summary, 'forge_summary');
    const changes = expectArray(root.changes, 'changes');
    const forgedResume = expectRecord(root.forged_resume, 'forged_resume');

    return {
        forge_summary: {
            total_changes: expectNumber(summary.total_changes, 'forge_summary.total_changes'),
            estimated_match_boost: expectString(summary.estimated_match_boost, 'forge_summary.estimated_match_boost'),
            detected_style: expectString(summary.detected_style, 'forge_summary.detected_style'),
            key_improvements: expectStringArray(summary.key_improvements, 'forge_summary.key_improvements'),
            unmatched_jd_requirements: expectStringArray(
                summary.unmatched_jd_requirements,
                'forge_summary.unmatched_jd_requirements'
            ),
        },
        changes: changes.map((item, index) => {
            const row = expectRecord(item, `changes[${index}]`);
            return {
                id: typeof row.id === 'string' && row.id.trim() ? row.id.trim() : `change_${index + 1}`,
                module: expectString(row.module, `changes[${index}].module`),
                location: expectString(row.location, `changes[${index}].location`),
                priority: expectEnum(row.priority, ['P0', 'P1', 'P2'] as const, `changes[${index}].priority`),
                title: expectString(row.title, `changes[${index}].title`),
                issue: expectString(row.issue, `changes[${index}].issue`),
                before: expectString(row.before, `changes[${index}].before`),
                after: expectString(row.after, `changes[${index}].after`),
                rationale: expectString(row.rationale, `changes[${index}].rationale`),
                is_fabrication: expectBoolean(row.is_fabrication, `changes[${index}].is_fabrication`, false),
                fabrication_warning: expectNullableString(
                    row.fabrication_warning,
                    `changes[${index}].fabrication_warning`
                ),
                needs_user_confirm: expectBoolean(row.needs_user_confirm, `changes[${index}].needs_user_confirm`, false),
                confirm_note: expectNullableString(row.confirm_note, `changes[${index}].confirm_note`),
            };
        }),
        forged_resume: forgedResume,
        markdown_export: expectString(root.markdown_export, 'markdown_export'),
    };
}

export function validateActionPlanResponse(value: unknown): ActionPlanResponse {
    const root = expectRecord(value, 'root');
    const strategy = expectRecord(root.strategy, 'strategy');
    const channels = expectArray(root.channels, 'channels');
    const greetings = expectRecord(root.greetings, 'greetings');

    const professional = expectRecord(greetings.professional, 'greetings.professional');
    const passionate = expectRecord(greetings.passionate, 'greetings.passionate');
    const concise = expectRecord(greetings.concise, 'greetings.concise');

    return {
        strategy: {
            tier: expectEnum(strategy.tier, ['A档', 'B档', 'C档', 'D档'] as const, 'strategy.tier'),
            tier_reason: expectString(strategy.tier_reason, 'strategy.tier_reason'),
            effort: expectString(strategy.effort, 'strategy.effort'),
            priority_actions: expectStringArray(strategy.priority_actions, 'strategy.priority_actions'),
        },
        channels: channels.map((item, index) => {
            const row = expectRecord(item, `channels[${index}]`);
            return {
                name: expectString(row.name, `channels[${index}].name`),
                priority: expectNumber(row.priority, `channels[${index}].priority`),
                how_to_find: expectString(row.how_to_find, `channels[${index}].how_to_find`),
                success_rate: expectEnum(
                    row.success_rate,
                    ['high', 'medium', 'low'] as const,
                    `channels[${index}].success_rate`
                ),
            };
        }),
        greetings: {
            professional: {
                style: expectEnum(professional.style, ['专业风'] as const, 'greetings.professional.style'),
                target: expectString(professional.target, 'greetings.professional.target'),
                content: expectString(professional.content, 'greetings.professional.content'),
                word_count: expectNumber(professional.word_count, 'greetings.professional.word_count'),
            },
            passionate: {
                style: expectEnum(passionate.style, ['热情风'] as const, 'greetings.passionate.style'),
                target: expectString(passionate.target, 'greetings.passionate.target'),
                content: expectString(passionate.content, 'greetings.passionate.content'),
                word_count: expectNumber(passionate.word_count, 'greetings.passionate.word_count'),
            },
            concise: {
                style: expectEnum(concise.style, ['简洁风'] as const, 'greetings.concise.style'),
                target: expectString(concise.target, 'greetings.concise.target'),
                content: expectString(concise.content, 'greetings.concise.content'),
                word_count: expectNumber(concise.word_count, 'greetings.concise.word_count'),
            },
        },
    };
}

export function validateInterviewResponse(value: unknown): InterviewResponse {
    const root = expectRecord(value, 'root');
    const questions = expectArray(root.interview_questions, 'interview_questions');

    return {
        interview_questions: questions.map((item, index) => {
            const row = expectRecord(item, `interview_questions[${index}]`);
            const referenceAnswer = expectRecord(row.reference_answer, `interview_questions[${index}].reference_answer`);
            return {
                id: typeof row.id === 'string' && row.id.trim() ? row.id.trim() : `q${index + 1}`,
                type: expectString(row.type, `interview_questions[${index}].type`),
                difficulty: expectString(row.difficulty, `interview_questions[${index}].difficulty`),
                question: expectString(row.question, `interview_questions[${index}].question`),
                jd_relevance: expectString(row.jd_relevance, `interview_questions[${index}].jd_relevance`),
                reference_answer: {
                    key_points: expectStringArray(referenceAnswer.key_points, `interview_questions[${index}].reference_answer.key_points`),
                    example_answer: expectString(referenceAnswer.example_answer, `interview_questions[${index}].reference_answer.example_answer`),
                    common_mistakes: expectStringArray(
                        referenceAnswer.common_mistakes,
                        `interview_questions[${index}].reference_answer.common_mistakes`
                    ),
                },
                time_limit: expectString(row.time_limit, `interview_questions[${index}].time_limit`),
            };
        }),
    };
}

export function validateFeedbackResponse(value: unknown): FeedbackResponse {
    const root = expectRecord(value, 'root');
    const feedback = expectRecord(root.feedback, 'feedback');

    return {
        feedback: {
            overall_score: expectEnum(
                feedback.overall_score,
                ['A (优秀)', 'B (良好)', 'C (及格)', 'D (需改进)'] as const,
                'feedback.overall_score'
            ),
            highlights: expectStringArray(feedback.highlights, 'feedback.highlights'),
            improvements: expectStringArray(feedback.improvements, 'feedback.improvements'),
            suggestions: expectStringArray(feedback.suggestions, 'feedback.suggestions'),
            revised_answer: expectNullableString(feedback.revised_answer, 'feedback.revised_answer'),
        },
    };
}
