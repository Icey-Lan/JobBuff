'use client';

import { Dispatch, SetStateAction, useCallback } from 'react';
import type { ActionPlanData } from '@/components/features/ActionCard';
import type { DiffItem } from '@/components/features/DiffCard';
import type { InterviewQuestion } from '@/components/features/InterviewCard';
import type { ToastType } from '@/components/ui/ToastProvider';
import type { ActionPlanResponse, ForgeResponse, InterviewResponse } from '@/lib/api-types';
import { updateQuest } from '@/lib/supabase/quests';
import {
    buildResumePreview,
    mapActionPlanToCardData,
    mapForgeChangesToDiffs,
    mapInterviewQuestionsToCards,
    type QuestTrial,
} from '../quest-mappers';
import type { QuestPageData, Stage } from '../types';

type ShowToast = (text: string, type?: ToastType, durationMs?: number) => void;

type FetchJsonOrThrow = <T,>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackError: string
) => Promise<T>;

interface UseStageFlowParams {
    currentStage: Stage;
    setCurrentStage: Dispatch<SetStateAction<Stage>>;
    setCompletedStages: Dispatch<SetStateAction<Stage[]>>;
    isAdvancing: boolean;
    setIsAdvancing: Dispatch<SetStateAction<boolean>>;
    questId: string;
    questData: QuestPageData | null;
    setQuestData: Dispatch<SetStateAction<QuestPageData | null>>;
    diffs: DiffItem[];
    setDiffs: Dispatch<SetStateAction<DiffItem[]>>;
    setResumePreview: Dispatch<SetStateAction<string>>;
    questions: InterviewQuestion[];
    setQuestions: Dispatch<SetStateAction<InterviewQuestion[]>>;
    setActionPlan: Dispatch<SetStateAction<ActionPlanData | null>>;
    isForging: boolean;
    setIsForging: Dispatch<SetStateAction<boolean>>;
    isTrialLoading: boolean;
    setIsTrialLoading: Dispatch<SetStateAction<boolean>>;
    fetchJsonOrThrow: FetchJsonOrThrow;
    showToast: ShowToast;
    onFinish: () => void;
}

function markStage(setCompletedStages: Dispatch<SetStateAction<Stage[]>>, stage: Stage) {
    setCompletedStages((prev) => Array.from(new Set([...prev, stage])) as Stage[]);
}

export function useStageFlow({
    currentStage,
    setCurrentStage,
    setCompletedStages,
    isAdvancing,
    setIsAdvancing,
    questId,
    questData,
    setQuestData,
    diffs,
    setDiffs,
    setResumePreview,
    questions,
    setQuestions,
    setActionPlan,
    isForging,
    setIsForging,
    isTrialLoading,
    setIsTrialLoading,
    fetchJsonOrThrow,
    showToast,
    onFinish,
}: UseStageFlowParams) {
    const handleNextStage = useCallback(async () => {
        if (isAdvancing) {
            return;
        }

        setIsAdvancing(true);
        try {
            if (currentStage === 'intel') {
                if (!questData) {
                    showToast('任务数据加载中，请稍后重试', 'error');
                    return;
                }

                if (!questData.intel) {
                    showToast('缺少情报数据，无法执行锻造', 'error');
                    return;
                }

                if (!questData.forge) {
                    if (isForging) {
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
                            }),
                        }, '锻造失败，请重试');

                        const { error: updateError } = await updateQuest(questId, { forge: forgeResult });
                        if (updateError) {
                            showToast('锻造结果保存失败，请重试', 'error');
                            return;
                        }

                        setQuestData((prev) => (prev ? { ...prev, forge: forgeResult } : prev));

                        const newDiffs = mapForgeChangesToDiffs(forgeResult.changes);
                        setDiffs(newDiffs);
                        setResumePreview(buildResumePreview(forgeResult.markdown_export, newDiffs));
                    } catch (error) {
                        console.error(error);
                        const message = error instanceof Error ? error.message : '锻造失败，请重试';
                        showToast(message, 'error');
                        return;
                    } finally {
                        setIsForging(false);
                    }
                } else if (diffs.length === 0) {
                    const savedStatus = questData.diffStatus || {};
                    const newDiffs = mapForgeChangesToDiffs(questData.forge.changes, savedStatus);
                    setDiffs(newDiffs);
                    const basePreview = questData.forge.customPreview || questData.forge.markdown_export;
                    setResumePreview(buildResumePreview(basePreview, newDiffs));
                }

                markStage(setCompletedStages, 'intel');
                setCurrentStage('forge');
                return;
            }

            if (currentStage === 'forge') {
                if (!questData) {
                    showToast('任务数据加载中，请稍后重试', 'error');
                    return;
                }

                if (!questData.intel) {
                    showToast('缺少情报数据，无法生成试炼', 'error');
                    return;
                }

                if (!questData.trial) {
                    if (isTrialLoading) {
                        return;
                    }

                    setIsTrialLoading(true);
                    try {
                        const [actionResultState, interviewResultState] = await Promise.allSettled([
                            fetchJsonOrThrow<ActionPlanResponse>('/api/action-plan', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    jd_info: questData.inputs.jd_text,
                                    match_analysis: questData.intel.match_analysis,
                                    user_resume: questData.inputs.resume_text,
                                }),
                            }, '行动策略生成失败'),
                            fetchJsonOrThrow<InterviewResponse>('/api/interview', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    jd_info: questData.inputs.jd_text,
                                    jd_analysis: questData.intel.jd_insight,
                                    user_resume: questData.inputs.resume_text,
                                }),
                            }, '面试题生成失败'),
                        ]);

                        if (interviewResultState.status === 'rejected') {
                            const message =
                                interviewResultState.reason instanceof Error
                                    ? interviewResultState.reason.message
                                    : '面试题生成失败';
                            throw new Error(message);
                        }

                        const interviewResult = interviewResultState.value;
                        const actionResult =
                            actionResultState.status === 'fulfilled' ? actionResultState.value : null;

                        if (actionResultState.status === 'rejected') {
                            const actionErrorMessage =
                                actionResultState.reason instanceof Error
                                    ? actionResultState.reason.message
                                    : '行动策略生成失败';
                            showToast(`${actionErrorMessage}，已先进入试炼挑战`, 'info', 4200);
                        }

                        const trialData: QuestTrial = {
                            actionPlan: actionResult,
                            questions: interviewResult,
                        };
                        const { error: updateError } = await updateQuest(questId, { trial: trialData });
                        if (updateError) {
                            showToast('试炼结果保存失败，请重试', 'error');
                            return;
                        }

                        const mappedActionPlan = mapActionPlanToCardData(actionResult);
                        if (mappedActionPlan) {
                            setActionPlan(mappedActionPlan);
                        }

                        const newQuestions = mapInterviewQuestionsToCards(interviewResult);
                        setQuestions(newQuestions);
                        setQuestData((prev) => (prev ? { ...prev, trial: trialData } : prev));
                    } catch (error) {
                        console.error(error);
                        const message = error instanceof Error ? error.message : '试炼生成失败';
                        showToast(message, 'error');
                        return;
                    } finally {
                        setIsTrialLoading(false);
                    }
                } else {
                    const storedPlan = questData.trial.actionPlan;
                    if (storedPlan) {
                        const mappedPlan = mapActionPlanToCardData(storedPlan);
                        if (mappedPlan) {
                            setActionPlan(mappedPlan);
                        }
                    }

                    if (questions.length === 0 && questData.trial.questions) {
                        const restoredQuestions = mapInterviewQuestionsToCards(
                            questData.trial.questions,
                            questData.trial.userAnswers || {}
                        );
                        setQuestions(restoredQuestions);
                    }
                }

                markStage(setCompletedStages, 'forge');
                setCurrentStage('trial');
                return;
            }

            onFinish();
        } finally {
            setIsAdvancing(false);
        }
    }, [
        currentStage,
        diffs,
        fetchJsonOrThrow,
        isAdvancing,
        isForging,
        isTrialLoading,
        onFinish,
        questData,
        questId,
        questions,
        setActionPlan,
        setCompletedStages,
        setCurrentStage,
        setDiffs,
        setIsAdvancing,
        setIsForging,
        setIsTrialLoading,
        setQuestData,
        setQuestions,
        setResumePreview,
        showToast,
    ]);

    return { handleNextStage };
}
