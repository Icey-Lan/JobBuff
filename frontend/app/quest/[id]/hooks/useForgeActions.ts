'use client';

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import type { ToastType } from '@/components/ui/ToastProvider';
import type { DiffItem, DiffStatus } from '@/components/features/DiffCard';
import type { ForgeResponse } from '@/lib/api-types';
import { updateQuest } from '@/lib/supabase/quests';
import {
    buildResumePreview,
    mapForgeChangesToDiffs,
} from '../quest-mappers';
import type { QuestPageData } from '../types';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

type FetchJsonOrThrow = <T,>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackError: string
) => Promise<T>;

type ShowToast = (text: string, type?: ToastType, durationMs?: number) => void;

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

interface UseForgeActionsParams {
    questId: string;
    questData: QuestPageData | null;
    setQuestData: Dispatch<SetStateAction<QuestPageData | null>>;
    diffs: DiffItem[];
    setDiffs: Dispatch<SetStateAction<DiffItem[]>>;
    targetStyle: string;
    setIsForging: Dispatch<SetStateAction<boolean>>;
    setResumePreview: Dispatch<SetStateAction<string>>;
    fetchJsonOrThrow: FetchJsonOrThrow;
    confirm: ConfirmFn;
    showToast: ShowToast;
}

function extractPreservedMeta(diffStatus: Record<string, string> | undefined): Record<string, string> {
    return Object.entries(diffStatus || {}).reduce((acc, [key, value]) => {
        if (key.startsWith('__')) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, string>);
}

export function useForgeActions({
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
}: UseForgeActionsParams) {
    const updatePreview = useCallback((updatedDiffs: DiffItem[], explicitBase?: string) => {
        if (!questData?.forge?.markdown_export) {
            return;
        }

        const basePreview = explicitBase || questData.forge.customPreview || questData.forge.markdown_export;
        setResumePreview(buildResumePreview(basePreview, updatedDiffs));
    }, [questData, setResumePreview]);

    const persistDiffStatus = useCallback(async (
        updatedDiffs: DiffItem[],
        fallbackDiffs: DiffItem[]
    ) => {
        if (!questData) {
            return;
        }

        const preservedMeta = extractPreservedMeta(questData.diffStatus);
        const statusMap = updatedDiffs.reduce((acc, diff) => {
            acc[diff.id] = diff.status;
            return acc;
        }, preservedMeta as Record<string, string>);

        const { error } = await updateQuest(questId, { diffStatus: statusMap });
        if (error) {
            showToast('修改状态保存失败，已恢复到之前状态', 'error');
            setDiffs(fallbackDiffs);
            updatePreview(fallbackDiffs);
            return;
        }

        setQuestData((prev) => (prev ? { ...prev, diffStatus: statusMap } : prev));
    }, [questData, questId, setDiffs, setQuestData, showToast, updatePreview]);

    const handleAcceptDiff = useCallback((id: string) => {
        const fallbackDiffs = diffs;
        const updatedDiffs = diffs.map((diff) => (
            diff.id === id ? { ...diff, status: 'accepted' as DiffStatus } : diff
        ));
        setDiffs(updatedDiffs);
        updatePreview(updatedDiffs);
        void persistDiffStatus(updatedDiffs, fallbackDiffs);
    }, [diffs, persistDiffStatus, setDiffs, updatePreview]);

    const handleRejectDiff = useCallback((id: string) => {
        const fallbackDiffs = diffs;
        const updatedDiffs = diffs.map((diff) => (
            diff.id === id ? { ...diff, status: 'rejected' as DiffStatus } : diff
        ));
        setDiffs(updatedDiffs);
        updatePreview(updatedDiffs);
        void persistDiffStatus(updatedDiffs, fallbackDiffs);
    }, [diffs, persistDiffStatus, setDiffs, updatePreview]);

    const handleAcceptAll = useCallback(() => {
        const fallbackDiffs = diffs;
        const updatedDiffs = diffs.map((diff) => (
            diff.status === 'pending' ? { ...diff, status: 'accepted' as DiffStatus } : diff
        ));
        setDiffs(updatedDiffs);
        updatePreview(updatedDiffs);
        void persistDiffStatus(updatedDiffs, fallbackDiffs);
    }, [diffs, persistDiffStatus, setDiffs, updatePreview]);

    const handleRegenerateForge = useCallback(async () => {
        const accepted = await confirm({
            title: '确认重铸',
            message: '重新锻造将覆盖当前的修改记录，确定要继续吗？',
            confirmText: '继续重铸',
            cancelText: '取消',
            danger: true,
        });

        if (!accepted) return;

        if (!questData || !questData.intel) {
            showToast('缺少任务数据，无法重铸', 'error');
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
                    target_style: targetStyle,
                }),
            }, '重铸失败，请重试');

            const preservedMeta = extractPreservedMeta(questData.diffStatus);
            const { error: updateError } = await updateQuest(questId, {
                forge: forgeResult,
                diffStatus: preservedMeta,
            });
            if (updateError) {
                showToast('重铸结果保存失败，请重试', 'error');
                return;
            }

            setQuestData((prev) => (
                prev
                    ? {
                        ...prev,
                        forge: forgeResult,
                        diffStatus: preservedMeta,
                    }
                    : prev
            ));

            const newDiffs = mapForgeChangesToDiffs(forgeResult.changes);
            setDiffs(newDiffs);
            setResumePreview(buildResumePreview(forgeResult.markdown_export, newDiffs));
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : '重铸失败，请重试';
            showToast(message, 'error');
        } finally {
            setIsForging(false);
        }
    }, [
        confirm,
        fetchJsonOrThrow,
        questData,
        questId,
        setDiffs,
        setIsForging,
        setQuestData,
        setResumePreview,
        showToast,
        targetStyle,
    ]);

    const acceptedCount = useMemo(
        () => diffs.filter((diff) => diff.status === 'accepted').length,
        [diffs]
    );
    const pendingCount = useMemo(
        () => diffs.filter((diff) => diff.status === 'pending').length,
        [diffs]
    );

    return {
        handleRegenerateForge,
        handleAcceptDiff,
        handleRejectDiff,
        handleAcceptAll,
        acceptedCount,
        pendingCount,
    };
}
