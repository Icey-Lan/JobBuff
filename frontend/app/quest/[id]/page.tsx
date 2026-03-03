'use client';

import React, { useState } from 'react';
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
import type { ActionPlanResponse, FeedbackResponse, ForgeResponse, IntelResponse, InterviewResponse } from '@/lib/api-types';
import {
    buildResumePreview,
    extractApiErrorMessage,
    mapActionPlanToCardData,
    mapForgeChangesToDiffs,
    mapIntelToAnalysis,
    mapInterviewQuestionsToCards,
    QuestForge,
    QuestTrial,
    SavedUserAnswers,
    stripForgePreviewDecorations,
    type IntelAnalysis,
} from './quest-mappers';

type Stage = 'intel' | 'forge' | 'trial';

interface QuestPageData {
    id: string;
    inputs: {
        jd_text: string;
        resume_text: string;
        target_position?: string | null;
        target_salary?: string | null;
    };
    intel?: IntelResponse;
    forge?: QuestForge;
    trial?: QuestTrial;
    diffStatus?: Record<string, string>;
}

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const questId = params.id as string;

    // State
    const [currentStage, setCurrentStage] = useState<Stage>('intel');
    const [completedStages, setCompletedStages] = useState<Stage[]>([]);

    // Data Loading State
    const [loading, setLoading] = useState(true);
    const [questData, setQuestData] = useState<QuestPageData | null>(null);

    // Analysis Data (from Intel)
    const [analysis, setAnalysis] = useState<IntelAnalysis | null>(null);

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

    const fetchJsonOrThrow = async <T,>(input: RequestInfo | URL, init: RequestInit, fallbackError: string): Promise<T> => {
        const response = await fetch(input, init);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(extractApiErrorMessage(payload, fallbackError));
        }

        return payload as T;
    };

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
            const data: QuestPageData = {
                id: quest.id,
                inputs: {
                    jd_text: quest.jdText,
                    resume_text: quest.resumeText,
                    target_position: quest.targetPosition,
                    target_salary: quest.targetSalary,
                },
                intel: (quest.intel ?? undefined) as IntelResponse | undefined,
                forge: (quest.forge ?? undefined) as QuestForge | undefined,
                trial: (quest.trial ?? undefined) as QuestTrial | undefined,
                diffStatus: (quest.diffStatus ?? undefined) as Record<string, string> | undefined,
            };
            setQuestData(data);

            // Setup Intel Data
            if (data.intel) {
                setAnalysis(mapIntelToAnalysis(data.intel));
            }

            // Restore other stages if they exist
            if (data.forge) {
                setCompletedStages(prev => Array.from(new Set([...prev, 'intel'])));
                const savedStatus = data.diffStatus || {};
                const restoredDiffs = mapForgeChangesToDiffs(data.forge.changes, savedStatus);
                setDiffs(restoredDiffs);
                const basePreview = data.forge.customPreview || data.forge.markdown_export;
                if (basePreview) {
                    setResumePreview(buildResumePreview(basePreview, restoredDiffs));
                }
            }

            if (data.trial) {
                setCompletedStages(prev => Array.from(new Set([...prev, 'intel', 'forge'])));

                // Restore Action Plan
                if (data.trial.actionPlan) {
                    const mappedPlan = mapActionPlanToCardData(data.trial.actionPlan);
                    if (mappedPlan) {
                        setActionPlan(mappedPlan);
                    }
                }

                // Restore Questions
                const savedUserAnswers = data.trial.userAnswers || {};
                const restoredQuestions = mapInterviewQuestionsToCards(data.trial.questions, savedUserAnswers);
                setQuestions(restoredQuestions);
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
                if (!questData.intel) {
                    alert('缺少情报数据，无法执行锻造');
                    return;
                }
                setIsForging(true);
                try {
                    const forgeResult = await fetchJsonOrThrow<ForgeResponse>('/api/resume-forge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            original_resume: questData.inputs.resume_text,
                            target_jd: questData.inputs.jd_text,
                            jd_analysis: questData.intel.jd_insight,
                            match_analysis: questData.intel.match_analysis
                        })
                    }, '锻造失败，请重试');

                    // Update Quest Data in Supabase
                    await updateQuest(questId, { forge: forgeResult });
                    const newQuestData = { ...questData, forge: forgeResult };
                    setQuestData(newQuestData);

                    const newDiffs = mapForgeChangesToDiffs(forgeResult.changes);
                    setDiffs(newDiffs);
                    setResumePreview(buildResumePreview(forgeResult.markdown_export, newDiffs));

                } catch (e) {
                    console.error(e);
                    const message = e instanceof Error ? e.message : '锻造失败，请重试';
                    alert(message);
                } finally {
                    setIsForging(false);
                }
            } else if (questData?.forge) {
                // Already loaded, just ensure state is set (optimization: do in useEffect)
                // Re-mapping for safety if navigating back/forth
                const forgeResult = questData.forge;
                if (diffs.length === 0) {
                    const savedStatus = questData.diffStatus || {};
                    const newDiffs = mapForgeChangesToDiffs(forgeResult.changes, savedStatus);
                    setDiffs(newDiffs);
                    const basePreview = forgeResult.customPreview || forgeResult.markdown_export;
                    setResumePreview(buildResumePreview(basePreview, newDiffs));
                }
            }

        } else if (currentStage === 'forge') {
            setCompletedStages(prev => Array.from(new Set([...prev, 'forge'])) as Stage[]);
            setCurrentStage('trial');

            // Check if we need to call Trial APIs
            if (questData && !questData.trial && !isTrialLoading) {
                if (!questData.intel) {
                    alert('缺少情报数据，无法生成试炼');
                    return;
                }
                setIsTrialLoading(true);
                try {
                    // Call Action Plan
                    const actionResult = await fetchJsonOrThrow<ActionPlanResponse>('/api/action-plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jd_info: questData.inputs.jd_text,
                            match_analysis: questData.intel.match_analysis,
                            user_resume: questData.inputs.resume_text // Use original or forged? Original for generic strategy.
                        })
                    }, '行动策略生成失败');
                    const mappedActionPlan = mapActionPlanToCardData(actionResult);
                    if (mappedActionPlan) {
                        setActionPlan(mappedActionPlan);
                    }

                    // Call Interview
                    const interviewResult = await fetchJsonOrThrow<InterviewResponse>('/api/interview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jd_info: questData.inputs.jd_text,
                            jd_analysis: questData.intel.jd_insight,
                            user_resume: questData.inputs.resume_text
                        })
                    }, '面试题生成失败');
                    const newQuestions = mapInterviewQuestionsToCards(interviewResult);
                    setQuestions(newQuestions);

                    // Save Trial Data to Supabase
                    const trialData: QuestTrial = { actionPlan: actionResult, questions: interviewResult };
                    await updateQuest(questId, { trial: trialData });
                    const newQuestData = { ...questData, trial: trialData };
                    setQuestData(newQuestData);

                } catch (e) {
                    console.error(e);
                    const message = e instanceof Error ? e.message : '试炼生成失败';
                    alert(message);
                } finally {
                    setIsTrialLoading(false);
                }
            } else if (questData?.trial) {
                // Restore Trial State - map snake_case to camelCase
                const storedPlan = questData.trial.actionPlan;
                if (storedPlan) {
                    const mappedPlan = mapActionPlanToCardData(storedPlan);
                    if (mappedPlan) {
                        setActionPlan(mappedPlan);
                    }
                }
                if (questions.length === 0 && questData.trial.questions) {
                    const newQuestions = mapInterviewQuestionsToCards(questData.trial.questions, questData.trial.userAnswers || {});
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
        if (!questData || !questData.intel) {
            alert('缺少任务数据，无法重铸');
            return;
        }

        setIsForging(true);
        try {
            const forgeResult = await fetchJsonOrThrow<ForgeResponse>('/api/resume-forge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_resume: questData.inputs.resume_text,
                    target_jd: questData.inputs.jd_text,
                    jd_analysis: questData.intel.jd_insight,
                    match_analysis: questData.intel.match_analysis,
                    target_style: targetStyle
                })
            }, '重铸失败，请重试');

            const preservedMeta = Object.entries(questData.diffStatus || {}).reduce((acc, [key, value]) => {
                if (key.startsWith('__')) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);

            // Update Quest Data in Supabase
            await updateQuest(questId, { forge: forgeResult, diffStatus: preservedMeta });
            const newQuestData = { ...questData, forge: forgeResult, diffStatus: preservedMeta };
            setQuestData(newQuestData);

            const newDiffs = mapForgeChangesToDiffs(forgeResult.changes);
            setDiffs(newDiffs);
            setResumePreview(buildResumePreview(forgeResult.markdown_export, newDiffs));

        } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : '重铸失败，请重试';
            alert(message);
        } finally {
            setIsForging(false);
        }
    };

    // Forge handlers - with Supabase persistence + preview update
    const saveDiffStatus = async (updatedDiffs: DiffItem[]) => {
        if (questData) {
            const preservedMeta = Object.entries(questData.diffStatus || {}).reduce((acc, [key, value]) => {
                if (key.startsWith('__')) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);

            const statusMap = updatedDiffs.reduce((acc, d) => {
                acc[d.id] = d.status;
                return acc;
            }, preservedMeta as Record<string, string>);
            await updateQuest(questId, { diffStatus: statusMap });
            setQuestData({ ...questData, diffStatus: statusMap });
        }
    };

    // Update preview based on accepted/rejected changes
    const updatePreview = (updatedDiffs: DiffItem[], explicitBase?: string) => {
        if (!questData?.forge?.markdown_export) return;

        const basePreview = explicitBase || questData.forge.customPreview || questData.forge.markdown_export;
        setResumePreview(buildResumePreview(basePreview, updatedDiffs));
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
            const data = await fetchJsonOrThrow<FeedbackResponse>('/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: q.question,
                    key_points: q.keyPoints || [],
                    user_answer: answer
                })
            }, '点评失败');
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
                }, {} as SavedUserAnswers);

                await updateQuest(questId, {
                    trial: { ...questData.trial, userAnswers }
                });
                setQuestData({ ...questData, trial: { ...questData.trial, userAnswers } });
            }
        } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : '点评失败';
            alert(message);
        }
    };

    const acceptedCount = diffs.filter(d => d.status === 'accepted').length;
    const pendingCount = diffs.filter(d => d.status === 'pending').length;

    if (loading) return <div style={{ padding: 40 }}>Loading Quest Data...</div>;
    if (!analysis) return <div style={{ padding: 40 }}>Quest Not Found (Local Storage)</div>;
    const analysisData = analysis;

    return (
        <div className={styles['quest-detail']}>
            {/* Quest Header */}
            <div className={styles['quest-header']}>
                <div className={styles['quest-header__info']}>
                    <span className={styles['quest-header__company']}>
                        {analysisData.company} · {analysisData.role}
                    </span>
                    <span className={styles['quest-header__role']}>
                        {analysisData.salary} · 任务ID: {questId}
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
                                    <div className={styles['score-value']}>{analysisData.score}%</div>
                                    <div className={styles['score-label']}>战力评分</div>
                                    <div style={{ marginTop: 8, fontSize: '0.85rem', color: analysisData.recommendation === '推荐投递' ? 'var(--color-loot-green)' : analysisData.recommendation === '不建议投递' ? 'var(--color-trap-red)' : 'var(--color-buff-orange)' }}>
                                        {analysisData.recommendation}
                                    </div>
                                </div>
                                <div className={styles['radar-chart']}>
                                    <SkillRadar dimensions={analysisData.dimensions || { skills: 0, experience: 0, education: 0, industry: 0, fit: 0 }} />
                                </div>
                            </PixelCard>

                            {/* SWOT Analysis */}
                            {analysisData.swot && (
                                <div style={{ marginTop: 16 }}>
                                    <PixelCard shadow="sm">
                                        <div className={styles['brief-section__title']}>📊 SWOT 分析</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                                            <div style={{ padding: 8, background: 'rgba(0,200,100,0.1)' }}>
                                                <strong>优势 S</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysisData.swot.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div style={{ padding: 8, background: 'rgba(255,100,0,0.1)' }}>
                                                <strong>劣势 W</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysisData.swot.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                            <div style={{ padding: 8, background: 'rgba(0,150,255,0.1)' }}>
                                                <strong>机会 O</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysisData.swot.opportunities?.map((o: string, i: number) => <li key={i}>{o}</li>)}
                                                </ul>
                                            </div>
                                            <div style={{ padding: 8, background: 'rgba(150,0,150,0.1)' }}>
                                                <strong>威胁 T</strong>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {analysisData.swot.threats?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </PixelCard>
                                </div>
                            )}
                        </div>

                        <div className={styles['brief-panel']}>
                            {/* Risk Warnings */}
                            {analysisData.risks && analysisData.risks.length > 0 ? (
                                analysisData.risks.map((risk, i: number) => (
                                    <GlitchCard key={i} severity="warning" title={risk.title}>
                                        {risk.desc}
                                        {risk.evidence && <div style={{ fontSize: '0.75rem', marginTop: 4, opacity: 0.7 }}>证据: {risk.evidence}</div>}
                                    </GlitchCard>
                                ))
                            ) : (
                                <div style={{ padding: 20, background: 'rgba(0,200,100,0.1)', textAlign: 'center' }}>✅ 暂无明显风险</div>
                            )}

                            {/* Daily Work */}
                            {analysisData.dailyWork && analysisData.dailyWork.length > 0 && (
                                <div className={styles['brief-section']}>
                                    <div className={styles['brief-section__title']}>📋 日常工作内容</div>
                                    <ul className={styles['brief-section__list']}>
                                        {analysisData.dailyWork.map((work: string, i: number) => (
                                            <li key={i} className={styles['brief-section__item']}>{work}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Core Requirements */}
                            <div className={styles['brief-section']}>
                                <div className={styles['brief-section__title']}>🎯 核心能力要求</div>
                                <ul className={styles['brief-section__list']}>
                                    {analysisData.coreRequirements?.map((req: string, i: number) => (
                                        <li key={i} className={styles['brief-section__item']}>{req}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Hidden Requirements */}
                            {analysisData.hiddenRequirements && analysisData.hiddenRequirements.length > 0 && (
                                <div className={styles['brief-section']} style={{ background: 'rgba(255,200,0,0.1)' }}>
                                    <div className={styles['brief-section__title']}>⚠️ 隐藏要求</div>
                                    <ul className={styles['brief-section__list']}>
                                        {analysisData.hiddenRequirements.map((req: string, i: number) => (
                                            <li key={i} className={styles['brief-section__item']}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Gap Analysis */}
                            {analysisData.gapAnalysis && analysisData.gapAnalysis.length > 0 && (
                                <div className={styles['brief-section']}>
                                    <div className={styles['brief-section__title']}>📊 能力差距分析</div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {analysisData.gapAnalysis.map((gap, i: number) => (
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
                            {analysisData.keyPoints && analysisData.keyPoints.length > 0 && (
                                <div className={styles['brief-section']} style={{ background: 'var(--color-buff-orange)', color: 'white' }}>
                                    <div className={styles['brief-section__title']} style={{ color: 'white' }}>💡 核心观点</div>
                                    <ul className={styles['brief-section__list']}>
                                        {analysisData.keyPoints.map((point: string, i: number) => (
                                            <li key={i} className={styles['brief-section__item']} style={{ color: 'white' }}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* AI Summary */}
                            <div className={styles['ai-summary']}>
                                <span className={styles['ai-summary__label']}>AI 参谋总结</span>
                                {analysisData.aiSummary}
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
                                                                    if (questData?.forge) {
                                                                        const updatedForge = {
                                                                            ...questData.forge,
                                                                            customPreview: editedPreview,
                                                                        };
                                                                        await updateQuest(questId, {
                                                                            forge: updatedForge,
                                                                        });
                                                                        setQuestData({ ...questData, forge: updatedForge });
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
                                                            navigator.clipboard.writeText(stripForgePreviewDecorations(resumePreview));
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
