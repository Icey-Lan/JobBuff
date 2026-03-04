'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import type { ActionPlanData } from '@/components/features/ActionCard';
import type { DiffItem } from '@/components/features/DiffCard';
import type { InterviewQuestion } from '@/components/features/InterviewCard';
import { getQuest } from '@/lib/supabase/quests';
import {
    buildResumePreview,
    mapActionPlanToCardData,
    mapForgeChangesToDiffs,
    mapIntelToAnalysis,
    mapInterviewQuestionsToCards,
    type IntelAnalysis,
    type QuestForge,
    type QuestTrial,
} from '../quest-mappers';
import type { QuestPageData, Stage } from '../types';

interface UseQuestDataResult {
    loading: boolean;
    questData: QuestPageData | null;
    analysis: IntelAnalysis | null;
    completedStages: Stage[];
    diffs: DiffItem[];
    resumePreview: string;
    questions: InterviewQuestion[];
    actionPlan: ActionPlanData | null;
    setQuestData: Dispatch<SetStateAction<QuestPageData | null>>;
    setCompletedStages: Dispatch<SetStateAction<Stage[]>>;
    setDiffs: Dispatch<SetStateAction<DiffItem[]>>;
    setResumePreview: Dispatch<SetStateAction<string>>;
    setQuestions: Dispatch<SetStateAction<InterviewQuestion[]>>;
    setActionPlan: Dispatch<SetStateAction<ActionPlanData | null>>;
}

export function useQuestData(questId: string): UseQuestDataResult {
    const [loading, setLoading] = useState(true);
    const [questData, setQuestData] = useState<QuestPageData | null>(null);
    const [analysis, setAnalysis] = useState<IntelAnalysis | null>(null);
    const [completedStages, setCompletedStages] = useState<Stage[]>([]);
    const [diffs, setDiffs] = useState<DiffItem[]>([]);
    const [resumePreview, setResumePreview] = useState('');
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const loadQuestData = async () => {
            setLoading(true);
            setQuestData(null);
            setAnalysis(null);
            setCompletedStages([]);
            setDiffs([]);
            setResumePreview('');
            setQuestions([]);
            setActionPlan(null);

            const { data: quest, error } = await getQuest(questId);

            if (isCancelled) {
                return;
            }

            if (error || !quest) {
                console.error('Failed to load quest:', error);
                setLoading(false);
                return;
            }

            const data: QuestPageData = {
                id: quest.id,
                inputs: {
                    jd_text: quest.jdText,
                    resume_text: quest.resumeText,
                    target_position: quest.targetPosition,
                    target_salary: quest.targetSalary,
                },
                intel: (quest.intel ?? undefined),
                forge: (quest.forge ?? undefined) as QuestForge | undefined,
                trial: (quest.trial ?? undefined) as QuestTrial | undefined,
                diffStatus: (quest.diffStatus ?? undefined) as Record<string, string> | undefined,
            };

            setQuestData(data);

            if (data.intel) {
                setAnalysis(mapIntelToAnalysis(data.intel));
            }

            const restoredStages: Stage[] = [];

            if (data.forge) {
                restoredStages.push('intel');
                const savedStatus = data.diffStatus || {};
                const restoredDiffs = mapForgeChangesToDiffs(data.forge.changes, savedStatus);
                setDiffs(restoredDiffs);
                const basePreview = data.forge.customPreview || data.forge.markdown_export;
                if (basePreview) {
                    setResumePreview(buildResumePreview(basePreview, restoredDiffs));
                }
            }

            if (data.trial) {
                if (!restoredStages.includes('intel')) {
                    restoredStages.push('intel');
                }
                restoredStages.push('forge');

                if (data.trial.actionPlan) {
                    const mappedPlan = mapActionPlanToCardData(data.trial.actionPlan);
                    if (mappedPlan) {
                        setActionPlan(mappedPlan);
                    }
                }

                const savedUserAnswers = data.trial.userAnswers || {};
                const restoredQuestions = mapInterviewQuestionsToCards(data.trial.questions, savedUserAnswers);
                setQuestions(restoredQuestions);
            }

            setCompletedStages(restoredStages);
            setLoading(false);
        };

        loadQuestData();

        return () => {
            isCancelled = true;
        };
    }, [questId]);

    return {
        loading,
        questData,
        analysis,
        completedStages,
        diffs,
        resumePreview,
        questions,
        actionPlan,
        setQuestData,
        setCompletedStages,
        setDiffs,
        setResumePreview,
        setQuestions,
        setActionPlan,
    };
}
