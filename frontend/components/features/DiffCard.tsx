import React from 'react';
import styles from './DiffCard.module.css';
import { IconCheck, IconX } from '@/components/icons';

export type DiffStatus = 'pending' | 'accepted' | 'rejected';
export type DiffPriority = 'P0' | 'P1' | 'P2';

export interface DiffItem {
    id: string;
    index: number;
    section: string;        // module
    title?: string;         // title of the change
    issue?: string;         // original issue description
    before: string;
    after: string;
    reason: string;         // rationale
    status: DiffStatus;
    priority?: DiffPriority;
    isFabrication?: boolean;
    fabricationWarning?: string | null;
    needsUserConfirm?: boolean;
    confirmNote?: string | null;
}

interface DiffCardProps {
    diff: DiffItem;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

const priorityColors: Record<DiffPriority, string> = {
    'P0': 'var(--color-trap-red)',
    'P1': 'var(--color-buff-orange)',
    'P2': 'var(--color-pixel-gray-dark)',
};

const priorityLabels: Record<DiffPriority, string> = {
    'P0': '必改',
    'P1': '推荐',
    'P2': '可选',
};

export function DiffCard({ diff, onAccept, onReject }: DiffCardProps) {
    const cardClass = [
        styles['diff-card'],
        diff.status === 'accepted' && styles['diff-card--accepted'],
        diff.status === 'rejected' && styles['diff-card--rejected'],
        diff.isFabrication && styles['diff-card--fabrication'],
    ]
        .filter(Boolean)
        .join(' ');

    const statusClass = styles[`diff-card__status--${diff.status}`];

    return (
        <div className={cardClass}>
            {/* Header */}
            <div className={styles['diff-card__header']}>
                <span className={styles['diff-card__label']}>
                    <span className={styles['diff-card__index']}>{diff.index}</span>
                    {diff.priority && (
                        <span
                            className={styles['diff-card__priority']}
                            style={{
                                backgroundColor: priorityColors[diff.priority],
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '2px',
                                fontSize: '0.7rem',
                                marginRight: '6px',
                            }}
                        >
                            {priorityLabels[diff.priority]}
                        </span>
                    )}
                    {diff.section}
                </span>
                <span className={`${styles['diff-card__status']} ${statusClass}`}>
                    {diff.status === 'pending' && '待定'}
                    {diff.status === 'accepted' && '✓ 已接受'}
                    {diff.status === 'rejected' && '✗ 已拒绝'}
                </span>
            </div>

            {/* Title & Issue */}
            {(diff.title || diff.issue) && (
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-pixel-gray)', fontSize: '0.85rem' }}>
                    {diff.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{diff.title}</div>}
                    {diff.issue && <div style={{ color: 'var(--color-pixel-gray-dark)' }}>问题: {diff.issue}</div>}
                </div>
            )}

            {/* Fabrication Warning */}
            {diff.isFabrication && (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 100, 0, 0.15)',
                    borderBottom: '1px solid var(--color-buff-orange)',
                    fontSize: '0.8rem',
                    color: 'var(--color-trap-red)',
                }}>
                    ⚠️ <strong>注意：</strong>此改动可能涉及添加简历中未提及的内容
                    {diff.fabricationWarning && <span> - {diff.fabricationWarning}</span>}
                </div>
            )}

            {/* Needs User Confirm */}
            {diff.needsUserConfirm && (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 200, 0, 0.15)',
                    borderBottom: '1px solid var(--color-buff-orange)',
                    fontSize: '0.8rem',
                }}>
                    🔔 <strong>需要确认：</strong>{diff.confirmNote || '请仔细核实此改动是否符合您的真实情况'}
                </div>
            )}

            {/* Body */}
            <div className={styles['diff-card__body']}>
                {/* Before */}
                <div className={styles['diff-block']}>
                    <div className={styles['diff-block__label']}>原文</div>
                    <div className={`${styles['diff-block__content']} ${styles['diff-block__content--before']}`}>
                        {diff.before || '(无)'}
                    </div>
                </div>

                {/* After */}
                <div className={styles['diff-block']}>
                    <div className={styles['diff-block__label']}>优化后</div>
                    <div className={`${styles['diff-block__content']} ${styles['diff-block__content--after']}`}>
                        {diff.after}
                    </div>
                </div>

                {/* Reason */}
                <div className={styles['diff-card__reason']}>
                    <span className={styles['diff-card__reason-label']}>修改理由:</span>
                    {diff.reason}
                </div>
            </div>

            {/* Actions */}
            {diff.status === 'pending' && (
                <div className={styles['diff-card__actions']}>
                    <button
                        className={`${styles['diff-card__action']} ${styles['diff-card__action--accept']}`}
                        onClick={() => onAccept(diff.id)}
                    >
                        <IconCheck size={12} />
                        接受
                    </button>
                    <button
                        className={`${styles['diff-card__action']} ${styles['diff-card__action--reject']}`}
                        onClick={() => onReject(diff.id)}
                    >
                        <IconX size={12} />
                        拒绝
                    </button>
                </div>
            )}
        </div>
    );
}

export default DiffCard;
