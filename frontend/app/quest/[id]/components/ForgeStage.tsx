import React from 'react';
import styles from './ForgeStage.module.css';
import { PixelCard } from '@/components/ui/PixelCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { IconCheck } from '@/components/icons';
import { DiffCard, DiffItem } from '@/components/features/DiffCard';
import type { QuestForge } from '../quest-mappers';

interface ForgeStageProps {
    isForging: boolean;
    questForge?: QuestForge;
    targetStyle: string;
    setTargetStyle: (value: string) => void;
    handleRegenerateForge: () => void;
    acceptedCount: number;
    pendingCount: number;
    diffs: DiffItem[];
    handleAcceptDiff: (id: string) => void;
    handleRejectDiff: (id: string) => void;
    handleAcceptAll: () => void;
    isEditingPreview: boolean;
    setEditedPreview: (value: string) => void;
    setIsEditingPreview: (value: boolean) => void;
    editedPreview: string;
    resumePreview: string;
    saveEditedPreview: () => Promise<boolean>;
    copyMarkdown: () => void;
    exportPdf: () => void;
    targetRef: React.RefObject<HTMLDivElement | null>;
}

export function ForgeStage({
    isForging,
    questForge,
    targetStyle,
    setTargetStyle,
    handleRegenerateForge,
    acceptedCount,
    pendingCount,
    diffs,
    handleAcceptDiff,
    handleRejectDiff,
    handleAcceptAll,
    isEditingPreview,
    setEditedPreview,
    setIsEditingPreview,
    editedPreview,
    resumePreview,
    saveEditedPreview,
    copyMarkdown,
    exportPdf,
    targetRef,
}: ForgeStageProps) {
    return (
        <div className={styles['forge-stage']}>
            {isForging && <div style={{ textAlign: 'center', padding: 40 }}>正在锻造简历装备... (AI 生成中)</div>}

            {!isForging && (
                <>
                    {questForge?.forge_summary && (
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
                                                    fontSize: '0.85rem',
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
                                        <span
                                            style={{
                                                backgroundColor: 'var(--color-loot-green)',
                                                color: 'white',
                                                padding: '4px 12px',
                                                borderRadius: 4,
                                                fontWeight: 600,
                                            }}
                                        >
                                            预估提升 {questForge.forge_summary.estimated_match_boost}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                                        <strong>总改动:</strong> {questForge.forge_summary.total_changes} 处
                                        <span style={{ marginLeft: 16 }}>
                                            <strong>风格:</strong> {questForge.forge_summary.detected_style}
                                        </span>
                                    </div>
                                    {questForge.forge_summary.key_improvements?.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                                            <strong>关键改进:</strong>
                                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                {questForge.forge_summary.key_improvements.map((imp: string, i: number) => (
                                                    <li key={i} style={{ color: 'var(--color-loot-green)' }}>{imp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {questForge.forge_summary.unmatched_jd_requirements?.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', padding: 8, backgroundColor: 'rgba(255,100,0,0.1)', marginTop: 8 }}>
                                            <strong style={{ color: 'var(--color-trap-red)' }}>⚠️ 无法匹配的JD要求:</strong>
                                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                {questForge.forge_summary.unmatched_jd_requirements.map((req: string, i: number) => (
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
                            {diffs.map((diff) => (
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
                                                    onClick={saveEditedPreview}
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
                                            onClick={copyMarkdown}
                                        >
                                            复制 MD
                                        </RetroButton>
                                        <RetroButton
                                            variant="ghost"
                                            size="small"
                                            onClick={exportPdf}
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
    );
}
