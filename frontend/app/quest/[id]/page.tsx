'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePDF } from 'react-to-pdf';
import styles from './page.module.css';
import { updateQuest } from '@/lib/supabase/quests';
import { useToast } from '@/components/ui/ToastProvider';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { IntelStage } from './components/IntelStage';
import { ForgeStage } from './components/ForgeStage';
import { TrialStage } from './components/TrialStage';
import { QuestHeader } from './components/QuestHeader';
import { StageTabs } from './components/StageTabs';
import { StageActions } from './components/StageActions';
import { useQuestData } from './hooks/useQuestData';
import { useForgeActions } from './hooks/useForgeActions';
import { useStageFlow } from './hooks/useStageFlow';
import { useTrialFeedback } from './hooks/useTrialFeedback';
import {
    extractApiErrorMessage,
    stripForgePreviewDecorations,
} from './quest-mappers';
import type { Stage } from './types';

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const questId = params.id as string;
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // State
    const [currentStage, setCurrentStage] = useState<Stage>('intel');
    const {
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
    } = useQuestData(questId);

    // Forge state
    const [isForging, setIsForging] = useState(false);
    const [targetStyle, setTargetStyle] = useState<string>('auto');
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editedPreview, setEditedPreview] = useState<string>('');

    // Trial state
    const [isTrialLoading, setIsTrialLoading] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);

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

    const {
        handleRegenerateForge,
        handleAcceptDiff,
        handleRejectDiff,
        handleAcceptAll,
        acceptedCount,
        pendingCount,
    } = useForgeActions({
        questId,
        questData,
        setQuestData,
        diffs,
        setDiffs,
        targetStyle,
        setIsForging,
        setResumePreview,
        fetchJsonOrThrow,
        confirm,
        showToast,
    });

    const { handleNextStage } = useStageFlow({
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
        onFinish: () => router.push('/log'),
    });

    const { handleSubmitAnswer } = useTrialFeedback({
        questId,
        questData,
        setQuestData,
        questions,
        setQuestions,
        fetchJsonOrThrow,
        showToast,
    });

    const handleAbort = async () => {
        const accepted = await confirm({
            title: '放弃任务',
            message: '确定要放弃本次任务吗？任务将被归档。',
            confirmText: '放弃任务',
            cancelText: '继续任务',
            danger: true,
        });
        if (accepted) {
            router.push('/log');
        }
    };


    const saveEditedPreview = async (): Promise<boolean> => {
        if (!questData?.forge) {
            return false;
        }

        const updatedForge = {
            ...questData.forge,
            customPreview: editedPreview,
        };
        const { error } = await updateQuest(questId, { forge: updatedForge });

        if (error) {
            showToast('保存失败，请重试', 'error');
            return false;
        }

        setResumePreview(editedPreview);
        setIsEditingPreview(false);
        setQuestData((prev) => (prev ? { ...prev, forge: updatedForge } : prev));
        return true;
    };

    const copyMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(stripForgePreviewDecorations(resumePreview));
            showToast('已复制到剪贴板', 'success');
        } catch (error) {
            console.error(error);
            showToast('复制失败，请检查浏览器权限', 'error');
        }
    };

    const exportPdf = () => {
        toPDF();
    };

    const handleSaveQuest = async () => {
        if (currentStage === 'forge' && isEditingPreview) {
            const saved = await saveEditedPreview();
            if (saved) {
                showToast('预览内容已保存', 'success');
            }
            return;
        }

        showToast('当前进度已自动保存', 'info');
    };

    const handleExportQuest = () => {
        if (currentStage !== 'forge') {
            showToast('请先进入「装备锻造」阶段后导出', 'info');
            return;
        }
        exportPdf();
    };

    if (loading) return <div style={{ padding: 40 }}>正在加载任务数据...</div>;
    if (!analysis) return <div style={{ padding: 40 }}>未找到任务数据，请返回任务日志后重试。</div>;
    const analysisData = analysis;

    return (
        <div className={styles['quest-detail']}>
            <QuestHeader
                company={analysisData.company}
                role={analysisData.role}
                salary={analysisData.salary}
                questId={questId}
                onSave={handleSaveQuest}
                onExport={handleExportQuest}
            />

            <StageTabs
                currentStage={currentStage}
                completedStages={completedStages}
                disabled={isAdvancing || isForging || isTrialLoading}
                onSelectStage={setCurrentStage}
            />

            {/* Stage Content */}
            <div className={styles['stage-content']}>
                {currentStage === 'intel' && (
                    <div id="stage-panel-intel" role="tabpanel" aria-labelledby="stage-tab-intel">
                        <IntelStage analysis={analysisData} />
                    </div>
                )}
                {currentStage === 'forge' && (
                    <div id="stage-panel-forge" role="tabpanel" aria-labelledby="stage-tab-forge">
                        <ForgeStage
                            isForging={isForging}
                            questForge={questData?.forge}
                            targetStyle={targetStyle}
                            setTargetStyle={setTargetStyle}
                            handleRegenerateForge={handleRegenerateForge}
                            acceptedCount={acceptedCount}
                            pendingCount={pendingCount}
                            diffs={diffs}
                            handleAcceptDiff={handleAcceptDiff}
                            handleRejectDiff={handleRejectDiff}
                            handleAcceptAll={handleAcceptAll}
                            isEditingPreview={isEditingPreview}
                            setEditedPreview={setEditedPreview}
                            setIsEditingPreview={setIsEditingPreview}
                            editedPreview={editedPreview}
                            resumePreview={resumePreview}
                            saveEditedPreview={saveEditedPreview}
                            copyMarkdown={copyMarkdown}
                            exportPdf={exportPdf}
                            targetRef={targetRef}
                        />
                    </div>
                )}
                {currentStage === 'trial' && (
                    <div id="stage-panel-trial" role="tabpanel" aria-labelledby="stage-tab-trial">
                        <TrialStage
                            isTrialLoading={isTrialLoading}
                            actionPlan={actionPlan}
                            questions={questions}
                            onSubmitAnswer={handleSubmitAnswer}
                        />
                    </div>
                )}
            </div>

            <StageActions
                currentStage={currentStage}
                disabled={isAdvancing || isForging || isTrialLoading}
                onAbort={handleAbort}
                onNext={() => { void handleNextStage(); }}
            />
        </div>
    );
}
