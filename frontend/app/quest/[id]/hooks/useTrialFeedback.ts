'use client';

import { Dispatch, SetStateAction, useCallback } from 'react';
import type { InterviewQuestion } from '@/components/features/InterviewCard';
import type { ToastType } from '@/components/ui/ToastProvider';
import type { FeedbackResponse } from '@/lib/api-types';
import { updateQuest } from '@/lib/supabase/quests';
import type { SavedUserAnswers } from '../quest-mappers';
import type { QuestPageData } from '../types';

type ShowToast = (text: string, type?: ToastType, durationMs?: number) => void;

type FetchJsonOrThrow = <T,>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackError: string
) => Promise<T>;

interface UseTrialFeedbackParams {
    questId: string;
    questData: QuestPageData | null;
    setQuestData: Dispatch<SetStateAction<QuestPageData | null>>;
    questions: InterviewQuestion[];
    setQuestions: Dispatch<SetStateAction<InterviewQuestion[]>>;
    fetchJsonOrThrow: FetchJsonOrThrow;
    showToast: ShowToast;
}

export function useTrialFeedback({
    questId,
    questData,
    setQuestData,
    questions,
    setQuestions,
    fetchJsonOrThrow,
    showToast,
}: UseTrialFeedbackParams) {
    const handleSubmitAnswer = useCallback(async (id: string, answer: string) => {
        const question = questions.find((row) => row.id === id);
        if (!question) {
            return;
        }

        try {
            const data = await fetchJsonOrThrow<FeedbackResponse>('/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.question,
                    key_points: question.keyPoints || [],
                    user_answer: answer,
                }),
            }, '点评失败');

            const feedback = data.feedback;
            const feedbackData: { content: string; rating: 'good' | 'average' | 'poor' } = {
                content: feedback.suggestions?.join(' ') || feedback.highlights?.join(' ') || '已收录',
                rating: feedback.overall_score?.startsWith('A')
                    ? 'good'
                    : feedback.overall_score?.startsWith('B')
                        ? 'average'
                        : 'poor',
            };

            const updatedQuestions = questions.map((row) => (
                row.id === id
                    ? {
                        ...row,
                        userAnswer: answer,
                        feedback: feedbackData,
                    }
                    : row
            ));
            setQuestions(updatedQuestions);

            if (questData?.trial) {
                const userAnswers = updatedQuestions.reduce((acc, row) => {
                    if (row.userAnswer || row.feedback) {
                        acc[row.id] = {
                            userAnswer: row.userAnswer,
                            feedback: row.feedback,
                        };
                    }
                    return acc;
                }, {} as SavedUserAnswers);

                const { error } = await updateQuest(questId, {
                    trial: { ...questData.trial, userAnswers },
                });
                if (error) {
                    showToast('反馈保存失败，请稍后重试', 'error');
                    return;
                }

                setQuestData((prev) => (
                    prev?.trial
                        ? {
                            ...prev,
                            trial: { ...prev.trial, userAnswers },
                        }
                        : prev
                ));
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : '点评失败';
            showToast(message, 'error');
        }
    }, [fetchJsonOrThrow, questData, questId, questions, setQuestData, setQuestions, showToast]);

    return { handleSubmitAnswer };
}
