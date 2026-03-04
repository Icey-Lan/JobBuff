import React from 'react';
import styles from './IntelStage.module.css';
import { PixelCard } from '@/components/ui/PixelCard';
import { GlitchCard } from '@/components/ui/GlitchCard';
import { SkillRadar } from '@/components/features/SkillRadar';
import type { IntelAnalysis } from '../quest-mappers';

interface IntelStageProps {
    analysis: IntelAnalysis;
}

export function IntelStage({ analysis }: IntelStageProps) {
    return (
        <div className={styles['intel-scan']}>
            <div>
                <PixelCard shadow="md">
                    <div className={styles['score-panel']}>
                        <div className={styles['score-value']}>{analysis.score}%</div>
                        <div className={styles['score-label']}>战力评分</div>
                        <div
                            style={{
                                marginTop: 8,
                                fontSize: '0.85rem',
                                color: analysis.recommendation === '推荐投递'
                                    ? 'var(--color-loot-green)'
                                    : analysis.recommendation === '不建议投递'
                                        ? 'var(--color-trap-red)'
                                        : 'var(--color-buff-orange)',
                            }}
                        >
                            {analysis.recommendation}
                        </div>
                    </div>
                    <div className={styles['radar-chart']}>
                        <SkillRadar dimensions={analysis.dimensions || { skills: 0, experience: 0, education: 0, industry: 0, fit: 0 }} />
                    </div>
                </PixelCard>

                {analysis.swot && (
                    <div style={{ marginTop: 16 }}>
                        <PixelCard shadow="sm">
                            <div className={styles['brief-section__title']}>📊 SWOT 分析</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                                <div style={{ padding: 8, background: 'rgba(0,200,100,0.1)' }}>
                                    <strong>优势 S</strong>
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {analysis.swot.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div style={{ padding: 8, background: 'rgba(255,100,0,0.1)' }}>
                                    <strong>劣势 W</strong>
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {analysis.swot.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                                <div style={{ padding: 8, background: 'rgba(0,150,255,0.1)' }}>
                                    <strong>机会 O</strong>
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {analysis.swot.opportunities?.map((o: string, i: number) => <li key={i}>{o}</li>)}
                                    </ul>
                                </div>
                                <div style={{ padding: 8, background: 'rgba(150,0,150,0.1)' }}>
                                    <strong>威胁 T</strong>
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {analysis.swot.threats?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </PixelCard>
                    </div>
                )}
            </div>

            <div className={styles['brief-panel']}>
                {analysis.risks && analysis.risks.length > 0 ? (
                    analysis.risks.map((risk, i: number) => (
                        <GlitchCard key={i} severity="warning" title={risk.title}>
                            {risk.desc}
                            {risk.evidence && <div style={{ fontSize: '0.75rem', marginTop: 4, opacity: 0.7 }}>证据: {risk.evidence}</div>}
                        </GlitchCard>
                    ))
                ) : (
                    <div style={{ padding: 20, background: 'rgba(0,200,100,0.1)', textAlign: 'center' }}>✅ 暂无明显风险</div>
                )}

                {analysis.dailyWork && analysis.dailyWork.length > 0 && (
                    <div className={styles['brief-section']}>
                        <div className={styles['brief-section__title']}>📋 日常工作内容</div>
                        <ul className={styles['brief-section__list']}>
                            {analysis.dailyWork.map((work: string, i: number) => (
                                <li key={i} className={styles['brief-section__item']}>{work}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className={styles['brief-section']}>
                    <div className={styles['brief-section__title']}>🎯 核心能力要求</div>
                    <ul className={styles['brief-section__list']}>
                        {analysis.coreRequirements?.map((req: string, i: number) => (
                            <li key={i} className={styles['brief-section__item']}>{req}</li>
                        ))}
                    </ul>
                </div>

                {analysis.hiddenRequirements && analysis.hiddenRequirements.length > 0 && (
                    <div className={styles['brief-section']} style={{ background: 'rgba(255,200,0,0.1)' }}>
                        <div className={styles['brief-section__title']}>⚠️ 隐藏要求</div>
                        <ul className={styles['brief-section__list']}>
                            {analysis.hiddenRequirements.map((req: string, i: number) => (
                                <li key={i} className={styles['brief-section__item']}>{req}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {analysis.gapAnalysis && analysis.gapAnalysis.length > 0 && (
                    <div className={styles['brief-section']}>
                        <div className={styles['brief-section__title']}>📊 能力差距分析</div>
                        <div style={{ fontSize: '0.85rem' }}>
                            {analysis.gapAnalysis.map((gap, i: number) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: 8,
                                        marginBottom: 8,
                                        background: gap.resume_status === 'matched'
                                            ? 'rgba(0,200,100,0.1)'
                                            : gap.resume_status === 'partial'
                                                ? 'rgba(255,200,0,0.1)'
                                                : 'rgba(255,0,0,0.1)',
                                    }}
                                >
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

                {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                    <div className={styles['brief-section']} style={{ background: 'var(--color-buff-orange)', color: 'white' }}>
                        <div className={styles['brief-section__title']} style={{ color: 'white' }}>💡 核心观点</div>
                        <ul className={styles['brief-section__list']}>
                            {analysis.keyPoints.map((point: string, i: number) => (
                                <li key={i} className={styles['brief-section__item']} style={{ color: 'white' }}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className={styles['ai-summary']}>
                    <span className={styles['ai-summary__label']}>AI 参谋总结</span>
                    {analysis.aiSummary}
                </div>
            </div>
        </div>
    );
}
