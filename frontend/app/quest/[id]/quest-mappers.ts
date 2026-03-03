import type { ActionPlanData } from '@/components/features/ActionCard';
import type { DiffItem, DiffPriority, DiffStatus } from '@/components/features/DiffCard';
import type { InterviewQuestion } from '@/components/features/InterviewCard';
import type {
    ActionPlanResponse,
    ForgeResponse,
    IntelResponse,
    InterviewResponse,
} from '@/lib/api-types';

export interface SavedUserAnswer {
    userAnswer?: string;
    feedback?: InterviewQuestion['feedback'];
}

export type SavedUserAnswers = Record<string, SavedUserAnswer>;

export interface IntelAnalysis {
    company: string;
    role: string;
    salary: string;
    score: number;
    dimensions: IntelResponse['match_analysis']['radar_chart'];
    coreRequirements: string[];
    niceToHave: string[];
    hiddenRequirements: string[];
    risks: Array<{ title: string; desc: string; evidence: string }>;
    yellowFlags: Array<{ title: string; desc: string; evidence: string }>;
    overallRisk: 'low' | 'medium' | 'high';
    dailyWork: string[];
    hiddenDuties: string[];
    swot: IntelResponse['match_analysis']['swot'];
    gapAnalysis: IntelResponse['match_analysis']['gap_analysis'];
    aiSummary: string;
    recommendation: IntelResponse['verdict']['recommendation'];
    keyPoints: string[];
    cultureInference: string | null;
    growthStage: string;
    salaryVsTarget: IntelResponse['jd_insight']['salary_analysis']['vs_target'];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

function toNonEmptyString(value: unknown, fallback = ''): string {
    const text = toString(value).trim();
    return text || fallback;
}

function toOptionalString(value: unknown): string | undefined {
    const text = toString(value).trim();
    return text || undefined;
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
}

function toDiffStatus(value: unknown): DiffStatus {
    if (value === 'accepted' || value === 'rejected' || value === 'pending') {
        return value;
    }
    return 'pending';
}

function toDiffPriority(value: unknown): DiffPriority | undefined {
    if (value === 'P0' || value === 'P1' || value === 'P2') {
        return value;
    }
    return undefined;
}

function stripMarkdown(value: string): string {
    return value
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

function markdownFuzzyReplace(
    sourceText: string,
    searchText: string,
    replacementText: string
): { result: string; matched: boolean } {
    if (sourceText.includes(searchText)) {
        return { result: sourceText.replace(searchText, replacementText), matched: true };
    }

    const trimmedSearch = searchText.trim();
    if (trimmedSearch && sourceText.includes(trimmedSearch)) {
        return {
            result: sourceText.replace(trimmedSearch, replacementText.trim()),
            matched: true,
        };
    }

    const strippedSearch = stripMarkdown(searchText);
    if (!strippedSearch || strippedSearch.length < 10) {
        return { result: sourceText, matched: false };
    }

    const lines = sourceText.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
        const strippedLine = stripMarkdown(lines[i]);
        if (strippedLine.includes(strippedSearch)) {
            const mdPrefix = lines[i].match(/^(\s*[-*+]\s+|\s*#{1,6}\s+|\s*)/)?.[0] || '';
            lines[i] = mdPrefix + replacementText.trim();
            return { result: lines.join('\n'), matched: true };
        }
    }

    const strippedFull = stripMarkdown(sourceText);
    if (strippedFull.includes(strippedSearch)) {
        for (let i = 0; i < lines.length; i += 1) {
            for (let j = i; j < Math.min(i + 3, lines.length); j += 1) {
                const chunk = lines.slice(i, j + 1).join('\n');
                if (stripMarkdown(chunk).includes(strippedSearch)) {
                    const mdPrefix = lines[i].match(/^(\s*[-*+]\s+|\s*#{1,6}\s+|\s*)/)?.[0] || '';
                    lines.splice(i, j - i + 1, mdPrefix + replacementText.trim());
                    return { result: lines.join('\n'), matched: true };
                }
            }
        }
    }

    return { result: sourceText, matched: false };
}

function parseGreeting(value: unknown, fallbackStyle: string) {
    const row = isRecord(value) ? value : {};
    return {
        style: toNonEmptyString(row.style, fallbackStyle),
        target: toNonEmptyString(row.target, 'HR'),
        content: toNonEmptyString(row.content, ''),
        word_count: typeof row.word_count === 'number' ? row.word_count : 0,
    };
}

export function mapIntelToAnalysis(intel: IntelResponse): IntelAnalysis {
    const companyIntel = (intel.jd_insight as IntelResponse['jd_insight'] & {
        company_intel?: {
            culture_inference?: string | null;
            growth_stage?: string;
        };
    }).company_intel;

    return {
        company: intel.jd_insight.role_reality.team_inference || '未知公司',
        role: intel.jd_insight.role_reality.title || '未知岗位',
        salary: intel.jd_insight.salary_analysis.range || '未知',
        score: intel.match_analysis.overall_score || 0,
        dimensions: intel.match_analysis.radar_chart || {
            skills: 0,
            experience: 0,
            education: 0,
            industry: 0,
            fit: 0,
        },
        coreRequirements: intel.jd_insight.requirements.must_have || [],
        niceToHave: intel.jd_insight.requirements.nice_to_have || [],
        hiddenRequirements: intel.jd_insight.requirements.hidden || [],
        risks: (intel.jd_insight.risk_assessment.red_flags || []).map((risk) => ({
            title: risk.signal,
            desc: risk.meaning,
            evidence: risk.evidence,
        })),
        yellowFlags: (intel.jd_insight.risk_assessment.yellow_flags || []).map((risk) => ({
            title: risk.signal,
            desc: risk.meaning,
            evidence: risk.evidence,
        })),
        overallRisk: intel.jd_insight.risk_assessment.overall_risk,
        dailyWork: intel.jd_insight.role_reality.daily_work || [],
        hiddenDuties: intel.jd_insight.role_reality.hidden_duties || [],
        swot: intel.match_analysis.swot || {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
        },
        gapAnalysis: intel.match_analysis.gap_analysis || [],
        aiSummary: intel.verdict.one_line_summary || '暂无总结',
        recommendation: intel.verdict.recommendation || '谨慎考虑',
        keyPoints: intel.verdict.key_points || [],
        cultureInference: companyIntel?.culture_inference ?? null,
        growthStage: companyIntel?.growth_stage || 'unknown',
        salaryVsTarget: intel.jd_insight.salary_analysis.vs_target || 'below',
    };
}

export function mapForgeChangesToDiffs(
    changes: unknown,
    savedStatus: Record<string, unknown> = {}
): DiffItem[] {
    if (!Array.isArray(changes)) return [];

    return changes.map((raw, idx) => {
        const row = isRecord(raw) ? raw : {};
        const id = toNonEmptyString(row.id, `diff-${idx}`);

        return {
            id,
            index: idx + 1,
            section: toNonEmptyString(row.module, '未分类'),
            title: toOptionalString(row.title),
            issue: toOptionalString(row.issue),
            before: toString(row.before),
            after: toString(row.after),
            reason: toString(row.rationale),
            status: toDiffStatus(savedStatus[id]),
            priority: toDiffPriority(row.priority),
            isFabrication: Boolean(row.is_fabrication),
            fabricationWarning: row.fabrication_warning == null ? null : toString(row.fabrication_warning),
            needsUserConfirm: Boolean(row.needs_user_confirm),
            confirmNote: row.confirm_note == null ? null : toString(row.confirm_note),
        };
    });
}

export function mapActionPlanToCardData(value: unknown): ActionPlanData | null {
    if (!isRecord(value)) return null;

    const strategy = isRecord(value.strategy) ? value.strategy : {};
    const greetings = isRecord(value.greetings) ? value.greetings : {};
    const channels = Array.isArray(value.channels) ? value.channels : [];

    return {
        strategy: {
            tier: toNonEmptyString(strategy.tier, 'B档'),
            tierReason: toNonEmptyString(strategy.tierReason ?? strategy.tier_reason, '暂无策略说明'),
            effort: toNonEmptyString(strategy.effort, '暂无建议'),
            priorityActions: toStringArray(strategy.priorityActions ?? strategy.priority_actions),
        },
        channels: channels.map((raw) => {
            const row = isRecord(raw) ? raw : {};
            return {
                name: toNonEmptyString(row.name, '未知渠道'),
                priority: typeof row.priority === 'number' ? row.priority : 0,
                howToFind: toNonEmptyString(row.howToFind ?? row.how_to_find, '暂无说明'),
                successRate: toNonEmptyString(row.successRate ?? row.success_rate, 'medium'),
            };
        }),
        greetings: {
            professional: parseGreeting(greetings.professional, '专业风'),
            passionate: parseGreeting(greetings.passionate, '热情风'),
            concise: parseGreeting(greetings.concise, '简洁风'),
        },
    };
}

export function mapInterviewQuestionsToCards(
    value: unknown,
    savedAnswers: SavedUserAnswers = {}
): InterviewQuestion[] {
    const rows = Array.isArray(value)
        ? value
        : isRecord(value) && Array.isArray(value.interview_questions)
            ? value.interview_questions
            : [];

    return rows.map((raw, idx) => {
        const row = isRecord(raw) ? raw : {};
        const reference = isRecord(row.reference_answer) ? row.reference_answer : {};
        const id = toNonEmptyString(row.id, `q-${idx}`);
        const keyPoints = toStringArray(reference.key_points ?? row.keyPoints);
        const referenceAnswer =
            toOptionalString(reference.example_answer) ||
            (keyPoints.length > 0 ? keyPoints.join('; ') : toOptionalString(row.referenceAnswer)) ||
            '暂无参考';
        const saved = savedAnswers[id];

        return {
            id,
            index: idx + 1,
            question: toNonEmptyString(row.question, `问题 ${idx + 1}`),
            referenceAnswer,
            keyPoints,
            type: toOptionalString(row.type),
            difficulty: toOptionalString(row.difficulty),
            jdRelevance: toOptionalString(row.jdRelevance ?? row.jd_relevance),
            commonMistakes: toStringArray(reference.common_mistakes ?? row.commonMistakes),
            userAnswer: saved?.userAnswer,
            feedback: saved?.feedback,
        };
    });
}

export function buildResumePreview(markdownExport: string, diffs: DiffItem[]): string {
    const acceptedCount = diffs.filter((diff) => diff.status === 'accepted').length;
    const rejectedCount = diffs.filter((diff) => diff.status === 'rejected').length;
    const pendingCount = diffs.filter((diff) => diff.status === 'pending').length;
    const statusLine = `【锻造状态】已接受: ${acceptedCount} | 已拒绝: ${rejectedCount} | 待定: ${pendingCount}\n${'─'.repeat(40)}\n\n`;

    if (rejectedCount === 0) {
        return statusLine + markdownExport;
    }

    let preview = markdownExport;
    const unmatchedChanges: { title: string; before: string }[] = [];

    diffs.forEach((diff) => {
        if (diff.status !== 'rejected' || !diff.before || !diff.after) {
            return;
        }

        const { result, matched } = markdownFuzzyReplace(preview, diff.after, diff.before);
        if (matched) {
            preview = result;
            return;
        }

        unmatchedChanges.push({
            title: diff.title || diff.section,
            before: diff.before,
        });
    });

    if (unmatchedChanges.length === 0) {
        return statusLine + preview;
    }

    let annotations = `\n\n${'─'.repeat(40)}\n📝 以下拒绝的修改因格式差异无法自动还原，原文如下：\n`;
    unmatchedChanges.forEach((change) => {
        annotations += `\n▸「${change.title}」应保留原文：\n  ${change.before}\n`;
    });

    return statusLine + preview + annotations;
}

export function stripForgePreviewDecorations(value: string): string {
    return value
        .replace(/^【锻造状态】.*\n─+\n\n/, '')
        .replace(/\n\n─+\n📝 以下拒绝的修改因格式差异无法自动还原，原文如下：[\s\S]*$/, '');
}

export function extractApiErrorMessage(payload: unknown, fallback: string): string {
    if (isRecord(payload)) {
        const maybeError = payload.error;
        if (typeof maybeError === 'string' && maybeError.trim()) {
            return maybeError;
        }
        const maybeMessage = payload.message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
            return maybeMessage;
        }
    }
    return fallback;
}

export type QuestForge = ForgeResponse & { customPreview?: string };
export type QuestTrial = {
    actionPlan?: ActionPlanResponse | ActionPlanData | null;
    questions?: InterviewResponse | InterviewQuestion[] | null;
    userAnswers?: SavedUserAnswers;
};
