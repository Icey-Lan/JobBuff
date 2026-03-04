import React from 'react';
import styles from './TrialStage.module.css';
import { ActionCard, ActionPlanData } from '@/components/features/ActionCard';
import { InterviewCard, InterviewQuestion } from '@/components/features/InterviewCard';

interface TrialStageProps {
    isTrialLoading: boolean;
    actionPlan: ActionPlanData | null;
    questions: InterviewQuestion[];
    onSubmitAnswer: (id: string, answer: string) => Promise<void>;
}

export function TrialStage({ isTrialLoading, actionPlan, questions, onSubmitAnswer }: TrialStageProps) {
    return (
        <div className={styles['trial-stage']}>
            {isTrialLoading && <div style={{ textAlign: 'center', padding: 40 }}>正在生成试炼挑战... (AI 生成中)</div>}

            {!isTrialLoading && (
                <>
                    {actionPlan && <ActionCard data={actionPlan} />}

                    <div className={styles['trial-header']}>
                        <h2>Boss 挑战题</h2>
                        <p>基于 JD 生成的 {questions.length} 道模拟面试题，点击展开作答</p>
                    </div>
                    <div className={styles['interview-list']}>
                        {questions.map((q) => (
                            <InterviewCard
                                key={q.id}
                                question={q}
                                onSubmitAnswer={onSubmitAnswer}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
