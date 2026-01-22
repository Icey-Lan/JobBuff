'use client';

import React, { useState } from 'react';
import styles from './ActionCard.module.css';
import { PixelCard } from '@/components/ui/PixelCard';

export interface ActionPlanData {
    strategy: {
        tier: string;
        tierReason: string;
        effort: string;
        priorityActions?: string[];
    };
    channels?: Array<{
        name: string;
        priority: number;
        howToFind: string;
        successRate: string;
    }>;
    greetings: {
        professional: {
            style: string;
            target: string;
            content: string;
            word_count: number;
        };
        passionate: {
            style: string;
            target: string;
            content: string;
            word_count: number;
        };
        concise: {
            style: string;
            target: string;
            content: string;
            word_count: number;
        };
    };
}

interface ActionCardProps {
    data: ActionPlanData;
}

export function ActionCard({ data }: ActionCardProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className={styles['action-card']}>
            {/* Strategy Section */}
            <PixelCard variant="primary">
                <div className={styles['strategy-section']}>
                    <div>
                        <span className={styles['tier-badge']}>{data.strategy.tier}</span>
                    </div>
                    <div className={styles['tier-info']}>
                        <strong>策略建议：</strong>{data.strategy.tierReason}
                        <br />
                        <strong>投入预估：</strong>{data.strategy.effort}
                        {data.strategy.priorityActions && data.strategy.priorityActions.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <strong>优先行动：</strong>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                    {data.strategy.priorityActions.map((action, i) => (
                                        <li key={i}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </PixelCard>

            {/* Channels Section */}
            {data.channels && data.channels.length > 0 && (
                <div className={styles['channels-section']} style={{ margin: '16px 0' }}>
                    <h3>📡 投递渠道</h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {data.channels.map((channel, i) => (
                            <div key={i} style={{
                                padding: 12,
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <strong>{channel.name}</strong>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        background: channel.successRate === 'high' ? 'var(--color-loot-green)' : 'var(--color-buff-orange)',
                                        color: 'white'
                                    }}>
                                        成功率: {channel.successRate === 'high' ? '高' : channel.successRate === 'medium' ? '中' : '低'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{channel.howToFind}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Greetings Section */}
            <div className={styles['greetings-section']}>
                <h3>👋 开场白技能</h3>

                {/* Professional */}
                <div className={styles['greeting-item']}>
                    <div className={styles['greeting-header']}>
                        <span>专业风 (适合技术/外企)</span>
                        <button
                            className={styles['copy-btn']}
                            onClick={() => handleCopy(data.greetings.professional.content, 'pro')}
                        >
                            {copied === 'pro' ? '已复制!' : '[复制]'}
                        </button>
                    </div>
                    <div className={styles['greeting-content']}>
                        {data.greetings.professional.content}
                    </div>
                </div>

                {/* Passionate */}
                <div className={styles['greeting-item']}>
                    <div className={styles['greeting-header']}>
                        <span>热情风 (适合创业/快消)</span>
                        <button
                            className={styles['copy-btn']}
                            onClick={() => handleCopy(data.greetings.passionate.content, 'passion')}
                        >
                            {copied === 'passion' ? '已复制!' : '[复制]'}
                        </button>
                    </div>
                    <div className={styles['greeting-content']}>
                        {data.greetings.passionate.content}
                    </div>
                </div>

                {/* Concise */}
                <div className={styles['greeting-item']}>
                    <div className={styles['greeting-header']}>
                        <span>简洁风 (适合海投)</span>
                        <button
                            className={styles['copy-btn']}
                            onClick={() => handleCopy(data.greetings.concise.content, 'concise')}
                        >
                            {copied === 'concise' ? '已复制!' : '[复制]'}
                        </button>
                    </div>
                    <div className={styles['greeting-content']}>
                        {data.greetings.concise.content}
                    </div>
                </div>
            </div>
        </div>
    );
}
