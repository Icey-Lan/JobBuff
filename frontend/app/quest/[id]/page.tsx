'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePDF } from 'react-to-pdf';
import styles from './page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { GlitchCard } from '@/components/ui/GlitchCard';
import { DiffCard, DiffItem, DiffStatus } from '@/components/features/DiffCard';
import { InterviewCard, InterviewQuestion } from '@/components/features/InterviewCard';
import { ActionCard, ActionPlanData } from '@/components/features/ActionCard';
import { SkillRadar } from '@/components/features/SkillRadar';
import { IconRadar, IconHammer, IconSword, IconSave, IconExport, IconCheck, IconX } from '@/components/icons';
import { getQuest, updateQuest } from '@/lib/supabase/quests';

// Mock data for demo
const mockAnalysis = {
    company: '字节跳动',
    role: '高级产品经理',
    salary: '40k-60k',
    score: 78,
    dimensions: {
        skills: 85,
        experience: 72,
        education: 90,
        industry: 65,
        culture: 80,
    },
    coreRequirements: [
        '3年以上产品经理经验，有 B 端 SaaS 产品经验优先',
        '熟悉敏捷开发流程，具备跨团队协作能力',
        '数据驱动思维，能够通过数据分析指导产品决策',
        '优秀的沟通表达能力和文档撰写能力',
    ],
    risks: [
        { title: '"弹性工作制"', desc: '可能存在高强度加班风险，建议面试时确认具体工作时间' },
        { title: '"抗压能力强"', desc: '暗示工作节奏快、压力大，需评估自身承受能力' },
    ],
    aiSummary: '该岗位整体匹配度良好（78%）。您的技术背景和项目经验与岗位要求高度吻合。建议重点准备 B 端 SaaS 产品案例，并在面试中主动展示数据分析能力。注意：JD 中存在2处风险信号需要关注。',
};

// Mock diffs for forge stage
const initialDiffs: DiffItem[] = [
    {
        id: 'diff-1',
        index: 1,
        section: '个人简介',
        before: '5年互联网产品经理经验，负责过多个产品从0到1。',
        after: '5年互联网产品经验，主导 B 端 SaaS 产品从0到1，用户规模突破 10 万。',
        reason: '补充 B 端 SaaS 经验关键词，增加量化数据',
        status: 'pending',
    },
    {
        id: 'diff-2',
        index: 2,
        section: '工作经历',
        before: '负责产品规划和需求分析工作。',
        after: '主导产品规划与需求分析，运用数据驱动决策，DAU 提升 35%。',
        reason: '植入"数据驱动"关键词，添加具体成果数据',
        status: 'pending',
    },
    {
        id: 'diff-3',
        index: 3,
        section: '项目经历',
        before: '参与敏捷开发流程，与技术团队紧密合作。',
        after: '作为 Scrum Master 推行敏捷开发，协调 5 个跨职能团队，迭代周期缩短 40%。',
        reason: '强化敏捷开发经验，增加团队协作规模和成效数据',
        status: 'pending',
    },
];

// Mock questions for trial stage
const initialQuestions: InterviewQuestion[] = [
    {
        id: 'q-1',
        index: 1,
        question: '请介绍一个你从 0 到 1 主导的产品案例？',
        referenceAnswer: '可以从以下几个维度展开：1) 产品背景和目标用户 2) 核心问题和解决方案 3) 你的具体职责和贡献 4) 最终成果和数据验证 5) 复盘和改进点。建议选择与 B 端 SaaS 相关的案例。',
    },
    {
        id: 'q-2',
        index: 2,
        question: '如何用数据驱动产品决策？请举例说明。',
        referenceAnswer: '回答框架：1) 定义关键指标（北极星指标）2) 数据采集和埋点设计 3) 分析方法（漏斗分析、A/B测试等）4) 如何将分析结论转化为产品决策 5) 决策后的效果验证。',
    },
    {
        id: 'q-3',
        index: 3,
        question: '面对需求变更频繁的情况，你会如何处理？',
        referenceAnswer: '关键点：1) 建立需求优先级评估框架（价值/成本矩阵）2) 与干系人对齐预期 3) 敏捷迭代小步快跑 4) 做好变更记录和影响评估 5) 保持团队沟通透明度。',
    },
    {
        id: 'q-4',
        index: 4,
        question: '你如何看待"弹性工作制"？',
        referenceAnswer: '这是一道考察价值观契合度的题目。可以表达：1) 理解业务需要灵活性 2) 关注工作效率而非工时 3) 适当询问公司的弹性工作实践 4) 表达对工作生活平衡的合理期望。',
    },
    {
        id: 'q-5',
        index: 5,
        question: '你有什么问题想问我们的？',
        referenceAnswer: '建议提问：1) 团队的产品方法论和文化 2) 这个岗位的核心挑战是什么 3) 对新人的期望和成长路径 4) 产品的技术架构和迭代节奏。避免过早询问薪资福利。',
    },
];

// Mock action plan for demo
const mockActionPlan: ActionPlanData = {
    strategy: {
        tier: 'A 档 (重点)',
        tierReason: '匹配度 > 80%，核心技能 (SaaS, 数据驱动) 完全吻合，且风险可控。',
        effort: '建议投入 3-5 天深度准备，优先寻找内推渠道。',
    },
    greetings: {
        professional: {
            style: '专业风',
            target: 'HR',
            content: '您好，我有5年B端产品经验，主导过亿级SaaS产品从0到1，擅长数据驱动决策（DAU提升35%）。看到贵司在招高级PM，觉得非常匹配，希望能有交流机会。',
            word_count: 50
        },
        passionate: {
            style: '热情风',
            target: 'HR',
            content: 'HR您的眼光真好！我是[产品名称]的忠实用户，一直关注贵司在SaaS领域的创新。我有5年相关经验，希望能加入团队一起搞事情！',
            word_count: 40
        },
        concise: {
            style: '简洁风',
            target: 'HR',
            content: '5年B端产品经验 | 主导过亿级SaaS项目 | 数据驱动增长专家 | 求撩~',
            word_count: 30
        }
    }
};

type Stage = 'intel' | 'forge' | 'trial';

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const questId = params.id as string;

    // State
    const [currentStage, setCurrentStage] = useState<Stage>('intel');
    const [completedStages, setCompletedStages] = useState<Stage[]>([]);

    // Data Loading State
    const [loading, setLoading] = useState(true);
    const [questData, setQuestData] = useState<any>(null);

    // Analysis Data (from Intel)
    const [analysis, setAnalysis] = useState<any>(null); // Replace mockAnalysis

    // Forge state
    const [diffs, setDiffs] = useState<DiffItem[]>([]);
    const [isForging, setIsForging] = useState(false);
    const [targetStyle, setTargetStyle] = useState<string>('auto');
    const [resumePreview, setResumePreview] = useState<string>('');
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editedPreview, setEditedPreview] = useState<string>('');

    // Trial state
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);
    const [isTrialLoading, setIsTrialLoading] = useState(false);

    // PDF Export
    const { toPDF, targetRef } = usePDF({
        filename: `简历_${questId}.pdf`,
        page: { margin: 20 }
    });

    // Load Data on Mount
    React.useEffect(() => {
        const loadQuestData = async () => {
            const { data: quest, error } = await getQuest(questId);

            if (error || !quest) {
                console.error('Failed to load quest:', error);
                setLoading(false);
                return;
            }

            // Transform Supabase data to local format
            const data = {
                id: quest.id,
                inputs: {
                    jd_text: quest.jdText,
                    resume_text: quest.resumeText,
                    target_position: quest.targetPosition,
                    target_salary: quest.targetSalary,
                },
                intel: quest.intel,
                forge: quest.forge,
                trial: quest.trial,
                diffStatus: quest.diffStatus,
            };
            setQuestData(data);

            // Setup Intel Data
            if (data.intel) {
                // Transform API response to UI State - include ALL fields
                const intel = data.intel;
                const uiAnalysis = {
                    company: intel.jd_insight?.role_reality?.team_inference || '未知公司',
                    role: intel.jd_insight?.role_reality?.title || '未知岗位',
                    salary: intel.jd_insight?.salary_analysis?.range || '未知',
                    score: intel.match_analysis?.overall_score || 0,
                    dimensions: intel.match_analysis?.radar_chart || { skills: 0, experience: 0, education: 0, industry: 0, fit: 0 },
                    coreRequirements: intel.jd_insight?.requirements?.must_have || [],
                    niceToHave: intel.jd_insight?.requirements?.nice_to_have || [],
                    hiddenRequirements: intel.jd_insight?.requirements?.hidden || [],
                    risks: intel.jd_insight?.risk_assessment?.red_flags?.map((r: any) => ({ title: r.signal, desc: r.meaning, evidence: r.evidence })) || [],
                    yellowFlags: intel.jd_insight?.risk_assessment?.yellow_flags?.map((r: any) => ({ title: r.signal, desc: r.meaning })) || [],
                    overallRisk: intel.jd_insight?.risk_assessment?.overall_risk || 'unknown',
                    dailyWork: intel.jd_insight?.role_reality?.daily_work || [],
                    hiddenDuties: intel.jd_insight?.role_reality?.hidden_duties || [],
                    swot: intel.match_analysis?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
                    gapAnalysis: intel.match_analysis?.gap_analysis || [],
                    aiSummary: intel.verdict?.one_line_summary || '暂无总结',
                    recommendation: intel.verdict?.recommendation || '待评估',
                    keyPoints: intel.verdict?.key_points || [],
                    cultureInference: intel.jd_insight?.company_intel?.culture_inference || null,
                    growthStage: intel.jd_insight?.company_intel?.growth_stage || 'unknown',
                    salaryVsTarget: intel.jd_insight?.salary_analysis?.vs_target || 'unknown',
                };
                setAnalysis(uiAnalysis);
            }

            // Restore other stages if they exist
            if (data.forge) {
                setCompletedStages(prev => Array.from(new Set([...prev, 'intel'])));
                // Restore Forge Data
                const forgeResult = data.forge;
                const savedStatus = data.diffStatus || {};
                const restoredDiffs = forgeResult.changes.map((c: any, idx: number) => {
                    const id = c.id || `diff-${idx}`;
                    return {
                        id,
                        index: idx + 1,
                        section: c.module,
                        title: c.title,
                        issue: c.issue,
                        before: c.before,
                        after: c.after,
                        reason: c.rationale,
                        status: savedStatus[id] || 'pending',
                        priority: c.priority,
                        isFabrication: c.is_fabrication,
                        fabricationWarning: c.fabrication_warning,
                        needsUserConfirm: c.needs_user_confirm,
                        confirmNote: c.confirm_note,
                    };
                });
                setDiffs(restoredDiffs);
                setResumePreview(forgeResult.markdown_export);
            }

            if (data.trial) {
                setCompletedStages(prev => Array.from(new Set([...prev, 'intel', 'forge'])));

                // Restore Action Plan
                if (data.trial.actionPlan) {
                    const storedPlan = data.trial.actionPlan;
                    setActionPlan({
                        strategy: {
                            tier: storedPlan.strategy?.tier,
                            tierReason: storedPlan.strategy?.tier_reason || storedPlan.strategy?.tierReason,
                            effort: storedPlan.strategy?.effort,
                            priorityActions: storedPlan.strategy?.priorityActions || storedPlan.strategy?.priority_actions,
                        },
                        channels: storedPlan.channels?.map((c: any) => ({
                            name: c.name,
                            priority: c.priority,
                            howToFind: c.howToFind || c.how_to_find,
                            successRate: c.successRate || c.success_rate
                        })),
                        greetings: storedPlan.greetings
                    });
                }

                // Restore Questions
                const questionsData = data.trial.questions?.interview_questions || data.trial.questions || [];
                const savedUserAnswers = data.trial.userAnswers || {};
                if (Array.isArray(questionsData)) {
                    const restoredQuestions = questionsData.map((q: any, idx: number) => {
                        const qId = q.id || `q-${idx}`;
                        const savedAnswer = savedUserAnswers[qId];
                        return {
                            id: qId,
                            index: idx + 1,
                            question: q.question,
                            type: q.type,
                            difficulty: q.difficulty,
                            jdRelevance: q.jd_relevance || q.jdRelevance,
                            commonMistakes: q.reference_answer?.common_mistakes || q.commonMistakes || [],
                            referenceAnswer: q.reference_answer?.example_answer || q.reference_answer?.key_points?.join('; ') || q.referenceAnswer || '暂无参考',
                            keyPoints: q.reference_answer?.key_points || q.keyPoints || [],
                            // Restore saved user answer and feedback
                            userAnswer: savedAnswer?.userAnswer,
                            feedback: savedAnswer?.feedback,
                        };
                    });
                    setQuestions(restoredQuestions);
                }
            }
            setLoading(false);
        };

        loadQuestData();
    }, [questId]);


    // Stage Handlers
    const handleNextStage = async () => {
        if (currentStage === 'intel') {
            setCompletedStages(prev => Array.from(new Set([...prev, 'intel'])) as Stage[]);
            setCurrentStage('forge');

            // Check if we need to call Forge API
            if (questData && !questData.forge && !isForging) {
                setIsForging(true);
                try {
                    const res = await fetch('/api/resume-forge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            original_resume: questData.inputs.resume_text,
                            target_jd: questData.inputs.jd_text,
                            jd_analysis: questData.intel.jd_insight,
                            match_analysis: questData.intel.match_analysis
                        })
                    });
                    const forgeResult = await res.json();

                    // Update Quest Data in Supabase
                    await updateQuest(questId, { forge: forgeResult });
                    const newQuestData = { ...questData, forge: forgeResult };
                    setQuestData(newQuestData);

                    // Map Diffs with all fields
                    const newDiffs = forgeResult.changes.map((c: any, idx: number) => ({
                        id: c.id || `diff-${idx}`,
                        index: idx + 1,
                        section: c.module,
                        title: c.title,
                        issue: c.issue,
                        before: c.before,
                        after: c.after,
                        reason: c.rationale,
                        status: 'pending',
                        priority: c.priority,
                        isFabrication: c.is_fabrication,
                        fabricationWarning: c.fabrication_warning,
                        needsUserConfirm: c.needs_user_confirm,
                        confirmNote: c.confirm_note,
                    }));
                    setDiffs(newDiffs);
                    setResumePreview(forgeResult.markdown_export);

                } catch (e) {
                    console.error(e);
                    alert('锻造失败，请重试');
                } finally {
                    setIsForging(false);
                }
            } else if (questData?.forge) {
                // Already loaded, just ensure state is set (optimization: do in useEffect)
                // Re-mapping for safety if navigating back/forth
                const forgeResult = questData.forge;
                if (diffs.length === 0) {
                    const savedStatus = questData.diffStatus || {};
                    const newDiffs = forgeResult.changes.map((c: any, idx: number) => {
                        const id = c.id || `diff-${idx}`;
                        return {
                            id,
                            index: idx + 1,
                            section: c.module,
                            title: c.title,
                            issue: c.issue,
                            before: c.before,
                            after: c.after,
                            reason: c.rationale,
                            status: savedStatus[id] || 'pending',
                            priority: c.priority,
                            isFabrication: c.is_fabrication,
                            fabricationWarning: c.fabrication_warning,
                            needsUserConfirm: c.needs_user_confirm,
                            confirmNote: c.confirm_note,
                        };
                    });
                    setDiffs(newDiffs);
                    setResumePreview(forgeResult.markdown_export);
                }
            }

        } else if (currentStage === 'forge') {
            setCompletedStages(prev => Array.from(new Set([...prev, 'forge'])) as Stage[]);
            setCurrentStage('trial');

            // Check if we need to call Trial APIs
            if (questData && !questData.trial && !isTrialLoading) {
                setIsTrialLoading(true);
                try {
                    // Call Action Plan
                    const actionRes = await fetch('/api/action-plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jd_info: questData.inputs.jd_text,
                            match_analysis: questData.intel.match_analysis,
                            user_resume: questData.inputs.resume_text // Use original or forged? Original for generic strategy.
                        })
                    });
                    const actionResult = await actionRes.json();
                    // Map snake_case API response to camelCase for ActionCard component
                    const mappedActionPlan = {
                        strategy: {
                            tier: actionResult.strategy?.tier,
                            tierReason: actionResult.strategy?.tier_reason,
                            effort: actionResult.strategy?.effort,
                            priorityActions: actionResult.strategy?.priority_actions,
                        },
                        channels: actionResult.channels?.map((c: any) => ({
                            name: c.name,
                            priority: c.priority,
                            howToFind: c.how_to_find,
                            successRate: c.success_rate
                        })),
                        greetings: actionResult.greetings
                    };
                    setActionPlan(mappedActionPlan);

                    // Call Interview
                    const interviewRes = await fetch('/api/interview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jd_info: questData.inputs.jd_text,
                            jd_analysis: questData.intel.jd_insight,
                            user_resume: questData.inputs.resume_text
                        })
                    });
                    const interviewResult = await interviewRes.json();

                    if (interviewResult.interview_questions) {
                        const newQuestions = interviewResult.interview_questions.map((q: any, idx: number) => ({
                            id: q.id || `q-${idx}`,
                            index: idx + 1,
                            question: q.question,
                            type: q.type,
                            difficulty: q.difficulty,
                            jdRelevance: q.jd_relevance,
                            commonMistakes: q.reference_answer?.common_mistakes || [],
                            referenceAnswer: q.reference_answer?.example_answer || q.reference_answer?.key_points?.join('; ') || '暂无参考',
                            keyPoints: q.reference_answer?.key_points || []
                        }));
                        setQuestions(newQuestions);
                    }

                    // Save Trial Data to Supabase
                    const trialData = { actionPlan: actionResult, questions: interviewResult };
                    await updateQuest(questId, { trial: trialData });
                    const newQuestData = { ...questData, trial: trialData };
                    setQuestData(newQuestData);

                } catch (e) {
                    console.error(e);
                    alert('试炼生成失败');
                } finally {
                    setIsTrialLoading(false);
                }
            } else if (questData?.trial) {
                // Restore Trial State - map snake_case to camelCase
                const storedPlan = questData.trial.actionPlan;
                if (storedPlan) {
                    const mappedPlan = {
                        strategy: {
                            tier: storedPlan.strategy?.tier,
                            tierReason: storedPlan.strategy?.tier_reason || storedPlan.strategy?.tierReason,
                            effort: storedPlan.strategy?.effort,
                            priorityActions: storedPlan.strategy?.priorityActions || storedPlan.strategy?.priority_actions,
                        },
                        channels: storedPlan.channels?.map((c: any) => ({
                            name: c.name,
                            priority: c.priority,
                            howToFind: c.howToFind || c.how_to_find,
                            successRate: c.successRate || c.success_rate
                        })),
                        greetings: storedPlan.greetings
                    };
                    setActionPlan(mappedPlan);
                }
                if (questions.length === 0 && questData.trial.questions?.interview_questions) {
                    const newQuestions = questData.trial.questions.interview_questions.map((q: any, idx: number) => ({
                        id: q.id || `q-${idx}`,
                        index: idx + 1,
                        question: q.question,
                        type: q.type,
                        difficulty: q.difficulty,
                        jdRelevance: q.jd_relevance || q.jdRelevance,
                        commonMistakes: q.reference_answer?.common_mistakes || q.commonMistakes || [],
                        referenceAnswer: q.reference_answer?.example_answer || q.reference_answer?.key_points?.join('; ') || '暂无参考',
                        keyPoints: q.reference_answer?.key_points || []
                    }));
                    setQuestions(newQuestions);
                }
            }

        } else {
            router.push('/log');
        }
    };

    const handleAbort = () => {
        if (confirm('确定要放弃本次任务吗？任务将被归档。')) {
            router.push('/log');
        }
    };

    const handleRegenerateForge = async () => {
        if (!confirm('重新锻造将覆盖当前的修改记录，确定要继续吗？')) return;

        setIsForging(true);
        try {
            const res = await fetch('/api/resume-forge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_resume: questData.inputs.resume_text,
                    target_jd: questData.inputs.jd_text,
                    jd_analysis: questData.intel.jd_insight,
                    match_analysis: questData.intel.match_analysis,
                    target_style: targetStyle
                })
            });
            const forgeResult = await res.json();

            // Update Quest Data in Supabase
            await updateQuest(questId, { forge: forgeResult, diffStatus: {} });
            const newQuestData = { ...questData, forge: forgeResult, diffStatus: {} };
            setQuestData(newQuestData);

            // Map Diffs with all fields
            const newDiffs = forgeResult.changes.map((c: any, idx: number) => ({
                id: c.id || `diff-${idx}`,
                index: idx + 1,
                section: c.module,
                title: c.title,
                issue: c.issue,
                before: c.before,
                after: c.after,
                reason: c.rationale,
                status: 'pending',
                priority: c.priority,
                isFabrication: c.is_fabrication,
                fabricationWarning: c.fabrication_warning,
                needsUserConfirm: c.needs_user_confirm,
                confirmNote: c.confirm_note,
            }));
            setDiffs(newDiffs);
            setResumePreview(forgeResult.markdown_export);

        } catch (e) {
            console.error(e);
            alert('重铸失败，请重试');
        } finally {
            setIsForging(false);
        }
    };

    // Forge handlers - with Supabase persistence + preview update
    const saveDiffStatus = async (updatedDiffs: DiffItem[]) => {
        if (questData) {
            const statusMap = updatedDiffs.reduce((acc, d) => {
                acc[d.id] = d.status;
                return acc;
            }, {} as Record<string, DiffStatus>);
            await updateQuest(questId, { diffStatus: statusMap });
        }
    };

    // Update preview based on accepted/rejected changes
    const updatePreview = (updatedDiffs: DiffItem[]) => {
        if (!questData?.forge?.markdown_export) return;

        // Always start with markdown_export (proper Markdown format)
        // NOT resume_text which may be a JSON object from PDF parsing
        const basePreview = questData.forge.customPreview || questData.forge.markdown_export;
        let newPreview = basePreview;

        // Apply accepted changes to preview
        updatedDiffs.forEach(diff => {
            if (diff.status === 'accepted' && diff.before && diff.after) {
                // Replace original text with the improved version
                newPreview = newPreview.replace(diff.before, diff.after);
            }
            // For rejected changes, keep the original (don't replace)
        });

        // Build a summary at the top
        const acceptedCount = updatedDiffs.filter(d => d.status === 'accepted').length;
        const rejectedCount = updatedDiffs.filter(d => d.status === 'rejected').length;
        const pendingCount = updatedDiffs.filter(d => d.status === 'pending').length;

        const statusLine = `【锻造状态】已接受: ${acceptedCount} | 已拒绝: ${rejectedCount} | 待定: ${pendingCount}\n${'─'.repeat(40)}\n\n`;

        // Use the modified preview with accepted changes applied
        setResumePreview(statusLine + newPreview);
    };

    const handleAcceptDiff = (id: string) => {
        const updatedDiffs = diffs.map(d => d.id === id ? { ...d, status: 'accepted' as DiffStatus } : d);
        setDiffs(updatedDiffs);
        saveDiffStatus(updatedDiffs);
        updatePreview(updatedDiffs);
    };

    const handleRejectDiff = (id: string) => {
        const updatedDiffs = diffs.map(d => d.id === id ? { ...d, status: 'rejected' as DiffStatus } : d);
        setDiffs(updatedDiffs);
        saveDiffStatus(updatedDiffs);
        updatePreview(updatedDiffs);
    };

    const handleAcceptAll = () => {
        const updatedDiffs = diffs.map(d => d.status === 'pending' ? { ...d, status: 'accepted' as DiffStatus } : d);
        setDiffs(updatedDiffs);
        saveDiffStatus(updatedDiffs);
        updatePreview(updatedDiffs);
    };

    // Trial handlers (Feedback)
    const handleSubmitAnswer = async (id: string, answer: string) => {
        const q = questions.find(q => q.id === id);
        if (!q) return;

        // Call Feedback API
        try {
            const res = await fetch('/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: q.question,
                    key_points: q.keyPoints || [],
                    user_answer: answer
                })
            });
            const data = await res.json();
            const fb = data.feedback;

            const feedbackData: { content: string; rating: 'good' | 'average' | 'poor' } = {
                content: fb.suggestions?.join(' ') || fb.highlights?.join(' ') || '已收录',
                rating: fb.overall_score?.startsWith('A') ? 'good' : fb.overall_score?.startsWith('B') ? 'average' : 'poor'
            };

            const updatedQuestions = questions.map(q =>
                q.id === id
                    ? {
                        ...q,
                        userAnswer: answer,
                        feedback: feedbackData
                    }
                    : q
            );
            setQuestions(updatedQuestions);

            // Persist user answers to Supabase
            if (questData?.trial) {
                const userAnswers = updatedQuestions.reduce((acc, q) => {
                    if (q.userAnswer || q.feedback) {
                        acc[q.id] = {
                            userAnswer: q.userAnswer,
                            feedback: q.feedback
                        };
                    }
                    return acc;
                }, {} as Record<string, { userAnswer?: string; feedback?: any }>);

                await updateQuest(questId, {
                    trial: { ...questData.trial, userAnswers }
                });
                setQuestData({ ...questData, trial: { ...questData.trial, userAnswers } });
            }
        } catch (e) {
            console.error(e);
            alert('点评失败');
        }
    };

    const acceptedCount = diffs.filter(d => d.status === 'accepted').length;
    const pendingCount = diffs.filter(d => d.status === 'pending').length;

    if (loading) return <div style={{ padding: 40 }}>Loading Quest Data...</div>;
    if (!analysis && !loading) return <div style={{ padding: 40 }}>Quest Not Found (Local Storage)</div>;

    return (
        <div className={styles['quest-detail']}>
            {/* Quest Header */}
            <div className={styles['quest-header']}>
                <div className={styles['quest-header__info']}>
                    <span className={styles['quest-header__company']}>
                        {analysis.company} · {analysis.role}
                    </span>
                    <span className={styles['quest-header__role']}>
                        {analysis.salary} · 任务ID: {questId}
                    </span>
                </div>
                <div className={styles['quest-header__actions']}>
                    <RetroButton variant="ghost" size="small">
                        <IconSave size={14} />
                        保存
                    </RetroButton>
                    <RetroButton variant="ghost" size="small">
                        <IconExport size={14} />
                        导出
                    </RetroButton>
                </div>
            </div>

            {/* Stage Tabs */}
            <div className={styles['stage-tabs']}>
                <button
                    className={`${styles['stage-tab']} ${currentStage === 'intel' ? styles['stage-tab--active'] : ''} ${completedStages.includes('intel') ? styles['stage-tab--completed'] : ''}`}
                    onClick={() => setCurrentStage('intel')}
                >
                    <span className={styles['stage-tab__icon']}>
                        <IconRadar size={18} />
                    </span>
                    情报侦察
                </button>
                <button
                    className={`${styles['stage-tab']} ${currentStage === 'forge' ? styles['stage-tab--active'] : ''} ${completedStages.includes('forge') ? styles['stage-tab--completed'] : ''}`}
                    onClick={() => completedStages.includes('intel') && setCurrentStage('forge')}
                    disabled={!completedStages.includes('intel')}
                >
                    <span className={styles['stage-tab__icon']}>
                        <IconHammer size={18} />
                    </span>
                    装备锻造
                </button>
                <button
                    className={`${styles['stage-tab']} ${currentStage === 'trial' ? styles['stage-tab--active'] : ''} ${completedStages.includes('trial') ? styles['stage-tab--completed'] : ''}`}
                    onClick={() => completedStages.includes('forge') && setCurrentStage('trial')}
                    disabled={!completedStages.includes('forge')}
                >
                    <span className={styles['stage-tab__icon']}>
                        <IconSword size={18} />
                    </span>
                    试炼挑战
                </button>
            </div>

            {/* Stage Content */}
            <div className={styles['stage-content']}>
                {/* Intel Stage */}
                {currentStage === 'intel' && (
                    <div className={styles['intel-scan']}>
                        <div>
                            {/* Score Panel */}
                            <PixelCard shadow="md">
                                <div className={styles['score-panel']}>
                                    <div className={styles['score-value']}>{analysis.score}%</div>
                                    <div className={styles['score-label']}>战力评分</div>
                                    <div style={{ marginTop: 8, fontSize: '0.85rem', color: analysis.recommendation === '推荐投递' ? 'var(--color-loot-green)' : analysis.recommendation === '不建议投递' ? 'var(--color-trap-red)' : 'var(--color-buff-orange)' }}>
                                        {analysis.recommendation}
                                    </div>
                                </div>
                                <div className={styles['radar-chart']}>
                                    <SkillRadar dimensions={analysis.dimensions || { skills: 0, experience: 0, education: 0, industry: 0, fit: 0 }} />
                                </div>
                            </PixelCard>

                            {/* SWOT Analysis */}
                            {analysis.swot && (
                                <div style={{ marginTop: 16 }}>
                                    <PixelCard shadow="sm">
                                        <div className={styles['brief-section__title']}>📊 SWOT 分析</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                                            <div style={{ padding: 8, background: 'rgba(0,200,100,0.1)' }}>
                                                <strong>优势 S</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysis.swot.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div style={{ padding: 8, background: 'rgba(255,100,0,0.1)' }}>
                                                <strong>劣势 W</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysis.swot.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                            <div style={{ padding: 8, background: 'rgba(0,150,255,0.1)' }}>
                                                <strong>机会 O</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysis.swot.opportunities?.map((o: string, i: number) => <li key={i}>{o}</li>)}
                                                </ul>
                                            </div>
                                            <div style={{ padding: 8, background: 'rgba(150,0,150,0.1)' }}>
                                                <strong>威胁 T</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysis.swot.threats?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </PixelCard>
                                </div>
                            )}
                        </div>

                        <div className={styles['brief-panel']}>
                            {/* Risk Warnings */}
                            {analysis.risks && analysis.risks.length > 0 ? (
                                analysis.risks.map((risk: any, i: number) => (
                                    <GlitchCard key={i} severity="warning" title={risk.title}>
                                        {risk.desc}
                                        {risk.evidence && <div style={{ fontSize: '0.75rem', marginTop: 4, opacity: 0.7 }}>证据: {risk.evidence}</div>}
                                    </GlitchCard>
                                ))
                            ) : (
                                <div style={{ padding: 20, background: 'rgba(0,200,100,0.1)', textAlign: 'center' }}>✅ 暂无明显风险</div>
                            )}

                            {/* Daily Work */}
                            {analysis.dailyWork && analysis.dailyWork.length > 0 && (
                                <div className={styles['brief-section']}>
                                    <div className={styles['brief-section__title']}>📋 日常工作内容</div>
                                    <ul className={styles['brief-section__list']}>
                                        {analysis.dailyWork.map((work: string, i: number) => (
                                            <li key={i} className={styles['brief-section__item']}>{work}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Core Requirements */}
                            <div className={styles['brief-section']}>
                                <div className={styles['brief-section__title']}>🎯 核心能力要求</div>
                                <ul className={styles['brief-section__list']}>
                                    {analysis.coreRequirements?.map((req: string, i: number) => (
                                        <li key={i} className={styles['brief-section__item']}>{req}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Hidden Requirements */}
                            {analysis.hiddenRequirements && analysis.hiddenRequirements.length > 0 && (
                                <div className={styles['brief-section']} style={{ background: 'rgba(255,200,0,0.1)' }}>
                                    <div className={styles['brief-section__title']}>⚠️ 隐藏要求</div>
                                    <ul className={styles['brief-section__list']}>
                                        {analysis.hiddenRequirements.map((req: string, i: number) => (
                                            <li key={i} className={styles['brief-section__item']}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Gap Analysis */}
                            {analysis.gapAnalysis && analysis.gapAnalysis.length > 0 && (
                                <div className={styles['brief-section']}>
                                    <div className={styles['brief-section__title']}>📊 能力差距分析</div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {analysis.gapAnalysis.map((gap: any, i: number) => (
                                            <div key={i} style={{ padding: 8, marginBottom: 8, background: gap.resume_status === 'matched' ? 'rgba(0,200,100,0.1)' : gap.resume_status === 'partial' ? 'rgba(255,200,0,0.1)' : 'rgba(255,0,0,0.1)' }}>
                                                <strong>{gap.jd_requirement}</strong>
                                                <span style={{ marginLeft: 8, fontSize: '0.75rem' }}>
                                                    {gap.resume_status === 'matched' ? '✅ 匹配' : gap.resume_status === 'partial' ? '⚠️ 部分匹配' : '❌ 缺失'}
                                                </span>
                                                {gap.suggestion && <div style={{ fontSize: '0.75rem', marginTop: 4 }}>💡 {gap.suggestion}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key Points */}
                            {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                                <div className={styles['brief-section']} style={{ background: 'var(--color-buff-orange)', color: 'white' }}>
                                    <div className={styles['brief-section__title']} style={{ color: 'white' }}>💡 核心观点</div>
                                    <ul className={styles['brief-section__list']}>
                                        {analysis.keyPoints.map((point: string, i: number) => (
                                            <li key={i} className={styles['brief-section__item']} style={{ color: 'white' }}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* AI Summary */}
                            <div className={styles['ai-summary']}>
                                <span className={styles['ai-summary__label']}>AI 参谋总结</span>
                                {analysis.aiSummary}
                            </div>
                        </div>
                    </div>
                )}

                {/* Forge Stage */}
                {currentStage === 'forge' && (
                    <div className={styles['forge-stage']}>
                        {isForging && <div style={{ textAlign: 'center', padding: 40 }}>正在锻造简历装备... (AI 生成中)</div>}

                        {!isForging && (
                            <>
                                {/* Forge Summary Panel */}
                                {questData?.forge?.forge_summary && (
                                    <div style={{ marginBottom: 16 }}>
                                        <PixelCard shadow="sm">
                                            <div style={{ padding: 16 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                                            🔨 锻造结果
                                                        </span>
                                                        <select
                                                            value={targetStyle}
                                                            onChange={(e) => setTargetStyle(e.target.value)}
                                                            className={styles['style-select']}
                                                            disabled={isForging}
                                                            style={{
                                                                padding: '2px 8px',
                                                                borderRadius: 4,
                                                                border: '1px solid #ccc',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            <option value="auto">🔮 智能推荐</option>
                                                            <option value="quantitative">📊 数据驱动</option>
                                                            <option value="concise">⚡️ 简洁高效</option>
                                                            <option value="narrative">📖 故事化</option>
                                                        </select>
                                                        <RetroButton
                                                            variant="ghost"
                                                            size="small"
                                                            onClick={handleRegenerateForge}
                                                            disabled={isForging}
                                                        >
                                                            🔄 重铸
                                                        </RetroButton>
                                                    </div>
                                                    <span style={{
                                                        backgroundColor: 'var(--color-loot-green)',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: 4,
                                                        fontWeight: 600,
                                                    }}>
                                                        预估提升 {questData.forge.forge_summary.estimated_match_boost}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                                                    <strong>总改动:</strong> {questData.forge.forge_summary.total_changes} 处
                                                    <span style={{ marginLeft: 16 }}>
                                                        <strong>风格:</strong> {questData.forge.forge_summary.detected_style}
                                                    </span>
                                                </div>
                                                {questData.forge.forge_summary.key_improvements?.length > 0 && (
                                                    <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                                                        <strong>关键改进:</strong>
                                                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                            {questData.forge.forge_summary.key_improvements.map((imp: string, i: number) => (
                                                                <li key={i} style={{ color: 'var(--color-loot-green)' }}>{imp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {questData.forge.forge_summary.unmatched_jd_requirements?.length > 0 && (
                                                    <div style={{ fontSize: '0.85rem', padding: 8, backgroundColor: 'rgba(255,100,0,0.1)', marginTop: 8 }}>
                                                        <strong style={{ color: 'var(--color-trap-red)' }}>⚠️ 无法匹配的JD要求:</strong>
                                                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                            {questData.forge.forge_summary.unmatched_jd_requirements.map((req: string, i: number) => (
                                                                <li key={i}>{req}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </PixelCard>
                                    </div>
                                )}

                                <div className={styles['forge-header']}>
                                    <div className={styles['forge-stats']}>
                                        <span>
                                            <IconCheck size={14} color="var(--color-loot-green)" />
                                            已接受: {acceptedCount}/{diffs.length}
                                        </span>
                                        <span>待定: {pendingCount}</span>
                                    </div>
                                    <RetroButton variant="secondary" size="small" onClick={handleAcceptAll} disabled={pendingCount === 0}>
                                        全部接受
                                    </RetroButton>
                                </div>

                                <div className={styles['forge-content']}>
                                    <div className={styles['diff-list']}>
                                        {diffs.map(diff => (
                                            <DiffCard
                                                key={diff.id}
                                                diff={diff}
                                                onAccept={handleAcceptDiff}
                                                onReject={handleRejectDiff}
                                            />
                                        ))}
                                        {diffs.length === 0 && <div>暂无优化建议</div>}
                                    </div>

                                    <div className={styles['resume-preview']}>
                                        <PixelCard shadow="sm">
                                            <div className={styles['resume-preview__header']}>
                                                <span>简历预览 {isEditingPreview && '(编辑中)'}</span>
                                                <div className={styles['resume-preview__actions']}>
                                                    {!isEditingPreview ? (
                                                        <RetroButton
                                                            variant="ghost"
                                                            size="small"
                                                            onClick={() => {
                                                                setEditedPreview(resumePreview);
                                                                setIsEditingPreview(true);
                                                            }}
                                                        >
                                                            编辑
                                                        </RetroButton>
                                                    ) : (
                                                        <>
                                                            <RetroButton
                                                                variant="primary"
                                                                size="small"
                                                                onClick={async () => {
                                                                    setResumePreview(editedPreview);
                                                                    setIsEditingPreview(false);
                                                                    // Save to Supabase
                                                                    if (questData) {
                                                                        await updateQuest(questId, {
                                                                            forge: { ...questData.forge, customPreview: editedPreview }
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                保存
                                                            </RetroButton>
                                                            <RetroButton
                                                                variant="ghost"
                                                                size="small"
                                                                onClick={() => setIsEditingPreview(false)}
                                                            >
                                                                取消
                                                            </RetroButton>
                                                        </>
                                                    )}
                                                    <RetroButton
                                                        variant="ghost"
                                                        size="small"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(resumePreview);
                                                            alert('已复制到剪贴板！');
                                                        }}
                                                    >
                                                        复制 MD
                                                    </RetroButton>
                                                    <RetroButton
                                                        variant="ghost"
                                                        size="small"
                                                        onClick={() => toPDF()}
                                                    >
                                                        导出 PDF
                                                    </RetroButton>
                                                </div>
                                            </div>
                                            <div className={styles['resume-preview__content']}>
                                                {isEditingPreview ? (
                                                    <textarea
                                                        value={editedPreview}
                                                        onChange={(e) => setEditedPreview(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            minHeight: '400px',
                                                            padding: '12px',
                                                            fontSize: '0.85rem',
                                                            lineHeight: 1.6,
                                                            fontFamily: 'var(--font-mono)',
                                                            border: '2px solid var(--color-buff-orange)',
                                                            borderRadius: 0,
                                                            resize: 'vertical',
                                                        }}
                                                    />
                                                ) : (
                                                    <div ref={targetRef} style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.6, padding: '16px', backgroundColor: 'white' }}>
                                                        {resumePreview || '预览加载中...'}
                                                    </div>
                                                )}
                                            </div>
                                        </PixelCard>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Trial Stage */}
                {currentStage === 'trial' && (
                    <div className={styles['trial-stage']}>
                        {isTrialLoading && <div style={{ textAlign: 'center', padding: 40 }}>正在生成试炼挑战... (AI 生成中)</div>}

                        {!isTrialLoading && (
                            <>
                                {/* Action Plan Card */}
                                {actionPlan && <ActionCard data={actionPlan} />}

                                <div className={styles['trial-header']}>
                                    <h2>Boss 挑战题</h2>
                                    <p>基于 JD 生成的 {questions.length} 道模拟面试题，点击展开作答</p>
                                </div>
                                <div className={styles['interview-list']}>
                                    {questions.map(q => (
                                        <InterviewCard
                                            key={q.id}
                                            question={q}
                                            onSubmitAnswer={handleSubmitAnswer}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className={styles['stage-actions']}>
                <div className={styles['stage-actions__secondary']}>
                    <RetroButton variant="danger" size="small" onClick={handleAbort}>
                        <IconX size={14} />
                        放弃任务
                    </RetroButton>
                </div>
                <RetroButton variant="primary" onClick={handleNextStage} pulse disabled={isForging || isTrialLoading}>
                    {currentStage === 'intel' && (
                        <>
                            <IconHammer size={16} />
                            去锻造装备
                        </>
                    )}
                    {currentStage === 'forge' && (
                        <>
                            <IconSword size={16} />
                            去试炼挑战
                        </>
                    )}
                    {currentStage === 'trial' && (
                        <>
                            <IconCheck size={16} />
                            完成任务
                        </>
                    )}
                </RetroButton>
            </div>
        </div>
    );
}
