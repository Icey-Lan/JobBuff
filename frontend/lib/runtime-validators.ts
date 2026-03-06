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

function expectEnumInsensitive<T extends string>(
    value: unknown,
    allowed: readonly T[],
    path: string
): T {
    if (typeof value !== 'string') {
        throw new SchemaValidationError(`${path} must be a string`);
    }
    const lower = value.trim().toLowerCase();
    const match = allowed.find((a) => a.toLowerCase() === lower);
    if (match) {
        return match;
    }
    throw new SchemaValidationError(`${path} must be one of: ${allowed.join(', ')}`);
}

function pickField(record: JsonRecord, keys: string[]): unknown {
    for (const key of keys) {
        const value = record[key];
        if (value !== undefined && value !== null) {
            return value;
        }
    }
    return undefined;
}

function expectNumberLike(value: unknown, path: string): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value.trim());
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    throw new SchemaValidationError(`${path} must be a finite number`);
}

function normalizeActionTier(value: unknown, path: string): ActionPlanResponse['strategy']['tier'] {
    const raw = expectString(value, path);
    const compact = raw
        .replace(/\s+/g, '')
        .replace(/Ａ/g, 'A')
        .replace(/Ｂ/g, 'B')
        .replace(/Ｃ/g, 'C')
        .replace(/Ｄ/g, 'D')
        .toUpperCase();

    if (compact.startsWith('A') || raw.includes('重点')) {
        return 'A档';
    }
    if (compact.startsWith('B') || raw.includes('常规')) {
        return 'B档';
    }
    if (compact.startsWith('C') || raw.includes('保底')) {
        return 'C档';
    }
    if (compact.startsWith('D') || raw.includes('放弃') || raw.includes('不投')) {
        return 'D档';
    }

    throw new SchemaValidationError(`${path} must be one of: A档, B档, C档, D档`);
}

function normalizeSuccessRate(value: unknown): ActionPlanResponse['channels'][number]['success_rate'] {
    if (typeof value !== 'string' || !value.trim()) {
        return 'medium';
    }

    const lower = value.toLowerCase();
    if (lower.includes('high') || value.includes('高')) {
        return 'high';
    }
    if (lower.includes('medium') || lower.includes('mid') || value.includes('中')) {
        return 'medium';
    }
    if (lower.includes('low') || value.includes('低')) {
        return 'low';
    }

    return 'medium';
}

function normalizePriorityActions(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return value
            .split(/\n|；|;|。|\|/)
            .map((item) => item.replace(/^(?:[-*•]|\d+[.)、])\s*/, '').trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeWordCount(value: unknown, content: string, path: string): number {
    if (value === undefined || value === null || value === '') {
        return content.length;
    }

    try {
        const parsed = expectNumberLike(value, path);
        return Math.max(0, Math.round(parsed));
    } catch {
        return content.length;
    }
}

function parseRiskFlags(value: unknown, path: string): Array<{ signal: string; evidence: string; meaning: string }> {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.flatMap((item, index) => {
        if (!isRecord(item)) {
            return [];
        }
        const signal = typeof item.signal === 'string' && item.signal.trim() ? item.signal.trim() : null;
        if (!signal) {
            return [];
        }
        return [{
            signal,
            evidence: typeof item.evidence === 'string' && item.evidence.trim() ? item.evidence.trim() : signal,
            meaning: typeof item.meaning === 'string' && item.meaning.trim() ? item.meaning.trim() : signal,
        }];
    });
}

function normalizeOverallRisk(value: unknown): 'low' | 'medium' | 'high' {
    if (typeof value !== 'string' || !value.trim()) {
        return 'medium';
    }
    const lower = value.trim().toLowerCase();
    if (lower === 'low' || lower.includes('低')) return 'low';
    if (lower === 'high' || lower.includes('高')) return 'high';
    return 'medium';
}

function normalizeVsComparison(value: unknown, allowUnknown: boolean): 'below' | 'at' | 'above' | 'unknown' {
    if (typeof value !== 'string' || !value.trim()) {
        return allowUnknown ? 'unknown' : 'at';
    }
    const lower = value.trim().toLowerCase();
    if (lower === 'below' || lower.includes('低') || lower.includes('below')) return 'below';
    if (lower === 'above' || lower.includes('高') || lower.includes('above')) return 'above';
    if (lower === 'at' || lower.includes('持平') || lower.includes('相当')) return 'at';
    if (allowUnknown && (lower === 'unknown' || lower.includes('未知') || lower.includes('不确定'))) return 'unknown';
    return allowUnknown ? 'unknown' : 'at';
}

function normalizeResumeStatus(value: unknown): 'matched' | 'partial' | 'missing' {
    if (typeof value !== 'string' || !value.trim()) {
        return 'partial';
    }
    const lower = value.trim().toLowerCase();
    if (lower === 'matched' || lower.includes('match')) return 'matched';
    if (lower === 'missing' || lower.includes('miss') || lower.includes('缺')) return 'missing';
    return 'partial';
}

function normalizeRecommendation(value: unknown): '推荐投递' | '谨慎考虑' | '不建议投递' {
    if (typeof value !== 'string' || !value.trim()) {
        return '谨慎考虑';
    }
    const text = value.trim();
    if (text.includes('推荐') && !text.includes('不')) return '推荐投递';
    if (text.includes('不建议') || text.includes('不推荐') || text.includes('放弃')) return '不建议投递';
    return '谨慎考虑';
}

function normalizeFeedbackScore(value: unknown): 'A (优秀)' | 'B (良好)' | 'C (及格)' | 'D (需改进)' {
    if (typeof value !== 'string' || !value.trim()) {
        return 'C (及格)';
    }
    const text = value.trim().toUpperCase();
    if (text.startsWith('A') || text.includes('优秀') || text.includes('优')) return 'A (优秀)';
    if (text.startsWith('B') || text.includes('良好') || text.includes('良')) return 'B (良好)';
    if (text.startsWith('D') || text.includes('需改进') || text.includes('差') || text.includes('改进')) return 'D (需改进)';
    return 'C (及格)';
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
                overall_risk: normalizeOverallRisk(riskAssessment.overall_risk),
            },
            salary_analysis: {
                range: typeof salaryAnalysis.range === 'string' && salaryAnalysis.range.trim() ? salaryAnalysis.range.trim() : '未提供',
                vs_market: normalizeVsComparison(salaryAnalysis.vs_market, true) as 'below' | 'at' | 'above' | 'unknown',
                vs_target: normalizeVsComparison(salaryAnalysis.vs_target, true) as 'below' | 'at' | 'above',
            },
        },
        match_analysis: {
            overall_score: expectNumberLike(matchAnalysis.overall_score, 'match_analysis.overall_score'),
            radar_chart: {
                skills: expectNumberLike(radarChart.skills, 'match_analysis.radar_chart.skills'),
                experience: expectNumberLike(radarChart.experience, 'match_analysis.radar_chart.experience'),
                education: expectNumberLike(radarChart.education, 'match_analysis.radar_chart.education'),
                industry: expectNumberLike(radarChart.industry, 'match_analysis.radar_chart.industry'),
                fit: expectNumberLike(radarChart.fit, 'match_analysis.radar_chart.fit'),
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
                    resume_status: normalizeResumeStatus(row.resume_status),
                    suggestion: expectNullableString(row.suggestion, `match_analysis.gap_analysis[${index}].suggestion`),
                };
            }),
        },
        verdict: {
            recommendation: normalizeRecommendation(verdict.recommendation),
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
            total_changes: expectNumberLike(summary.total_changes, 'forge_summary.total_changes'),
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
                priority: expectEnumInsensitive(row.priority, ['P0', 'P1', 'P2'] as const, `changes[${index}].priority`),
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
    const outer = expectRecord(value, 'root');
    const nested = [outer.action_plan, outer.data, outer.result].find((item) => {
        if (!isRecord(item)) {
            return false;
        }
        return item.strategy !== undefined || item.channels !== undefined || item.greetings !== undefined;
    });
    const root = isRecord(nested) ? nested : outer;

    const strategy = expectRecord(root.strategy, 'strategy');
    const strategyTier = normalizeActionTier(pickField(strategy, ['tier', 'grade', 'level']), 'strategy.tier');
    const strategyReason = expectString(
        pickField(strategy, ['tier_reason', 'tierReason', 'reason']),
        'strategy.tier_reason'
    );
    const strategyEffort = expectString(
        pickField(strategy, ['effort', 'time_cost', 'timeCost']),
        'strategy.effort'
    );
    const strategyActions = normalizePriorityActions(
        pickField(strategy, ['priority_actions', 'priorityActions', 'actions'])
    );

    const rawChannels = Array.isArray(root.channels) ? root.channels : [];
    const channels = rawChannels.flatMap((item, index) => {
        if (!isRecord(item)) {
            return [];
        }

        const name = expectString(pickField(item, ['name', 'channel']), `channels[${index}].name`);
        const howToFind = expectString(
            pickField(item, ['how_to_find', 'howToFind', 'instruction']),
            `channels[${index}].how_to_find`
        );

        const priorityValue = pickField(item, ['priority', 'rank']);
        const priority =
            priorityValue === undefined || priorityValue === null
                ? index + 1
                : Math.max(1, Math.round(expectNumberLike(priorityValue, `channels[${index}].priority`)));

        return [{
            name,
            priority,
            how_to_find: howToFind,
            success_rate: normalizeSuccessRate(pickField(item, ['success_rate', 'successRate', 'rate'])),
        }];
    });

    const greetingsSource = isRecord(root.greetings) ? root.greetings : root;
    const greetings = expectRecord(greetingsSource, 'greetings');

    const professional = expectRecord(greetings.professional, 'greetings.professional');
    const passionate = expectRecord(greetings.passionate, 'greetings.passionate');
    const concise = expectRecord(greetings.concise, 'greetings.concise');

    const professionalTarget = expectString(
        pickField(professional, ['target', 'audience']),
        'greetings.professional.target'
    );
    const professionalContent = expectString(
        pickField(professional, ['content', 'message', 'text']),
        'greetings.professional.content'
    );

    const passionateTarget = expectString(
        pickField(passionate, ['target', 'audience']),
        'greetings.passionate.target'
    );
    const passionateContent = expectString(
        pickField(passionate, ['content', 'message', 'text']),
        'greetings.passionate.content'
    );

    const conciseTarget = expectString(
        pickField(concise, ['target', 'audience']),
        'greetings.concise.target'
    );
    const conciseContent = expectString(
        pickField(concise, ['content', 'message', 'text']),
        'greetings.concise.content'
    );

    return {
        strategy: {
            tier: strategyTier,
            tier_reason: strategyReason,
            effort: strategyEffort,
            priority_actions: strategyActions,
        },
        channels,
        greetings: {
            professional: {
                style: '专业风',
                target: professionalTarget,
                content: professionalContent,
                word_count: normalizeWordCount(
                    pickField(professional, ['word_count', 'wordCount']),
                    professionalContent,
                    'greetings.professional.word_count'
                ),
            },
            passionate: {
                style: '热情风',
                target: passionateTarget,
                content: passionateContent,
                word_count: normalizeWordCount(
                    pickField(passionate, ['word_count', 'wordCount']),
                    passionateContent,
                    'greetings.passionate.word_count'
                ),
            },
            concise: {
                style: '简洁风',
                target: conciseTarget,
                content: conciseContent,
                word_count: normalizeWordCount(
                    pickField(concise, ['word_count', 'wordCount']),
                    conciseContent,
                    'greetings.concise.word_count'
                ),
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
            overall_score: normalizeFeedbackScore(feedback.overall_score),
            highlights: expectStringArray(feedback.highlights, 'feedback.highlights'),
            improvements: expectStringArray(feedback.improvements, 'feedback.improvements'),
            suggestions: expectStringArray(feedback.suggestions, 'feedback.suggestions'),
            revised_answer: expectNullableString(feedback.revised_answer, 'feedback.revised_answer'),
        },
    };
}
