'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import styles from './page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { IconScroll, IconRadar, IconTarget, IconX, IconTrendingUp, IconPieChart } from '@/components/icons';

interface QuestSummary {
    id: string;
    company: string;
    role: string;
    score: number;
    createdAt: string;
    status: 'in_progress' | 'completed' | 'archived';
    salary?: string;
}

interface LogStats {
    totalQuests: number;
    avgScore: number;
    completedForges: number;
    weeklyNew: number;
}

export default function LogPage() {
    const [quests, setQuests] = useState<QuestSummary[]>([]);
    const [stats, setStats] = useState<LogStats>({ totalQuests: 0, avgScore: 0, completedForges: 0, weeklyNew: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [distData, setDistData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load all quests from localStorage
        const loadedQuests: QuestSummary[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('jobbuff_quest_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '');
                    const intel = data.intel;

                    loadedQuests.push({
                        id: data.id,
                        company: intel?.jd_insight?.role_reality?.team_inference || '未知公司',
                        role: intel?.jd_insight?.role_reality?.title || data.inputs?.target_position || '未知岗位',
                        score: intel?.match_analysis?.overall_score || 0,
                        createdAt: data.createdAt,
                        status: data.trial ? 'completed' : data.forge ? 'in_progress' : 'in_progress',
                        salary: intel?.jd_insight?.salary_analysis?.range,
                    });
                } catch (e) {
                    console.error('Failed to parse quest:', key, e);
                }
            }
        }

        // Sort by creation date (newest first)
        loadedQuests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setQuests(loadedQuests);

        // Calculate Stats
        const total = loadedQuests.length;
        const totalScore = loadedQuests.reduce((acc, q) => acc + q.score, 0);
        const avg = total > 0 ? Math.round(totalScore / total) : 0;
        const completed = loadedQuests.filter(q => q.status === 'completed').length;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekly = loadedQuests.filter(q => new Date(q.createdAt) >= oneWeekAgo).length;

        setStats({
            totalQuests: total,
            avgScore: avg,
            completedForges: completed,
            weeklyNew: weekly
        });

        // Prepare Chart Data (Trend) - Reverse for chronological order
        const trend = [...loadedQuests].reverse().map(q => ({
            name: new Date(q.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
            score: q.score,
            fullDate: q.createdAt,
        }));
        setChartData(trend);

        // Prepare Distribution Data (Score Ranges)
        const ranges = [
            { name: '<60', count: 0, color: '#ff4d4f' },
            { name: '60-75', count: 0, color: 'var(--color-buff-orange)' },
            { name: '75-90', count: 0, color: 'var(--color-loot-green)' },
            { name: '>90', count: 0, color: '#1890ff' },
        ];

        loadedQuests.forEach(q => {
            if (q.score < 60) ranges[0].count++;
            else if (q.score < 75) ranges[1].count++;
            else if (q.score < 90) ranges[2].count++;
            else ranges[3].count++;
        });
        setDistData(ranges);

        setLoading(false);
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('确定要删除这个任务吗？')) {
            localStorage.removeItem(`jobbuff_quest_${id}`);
            const newQuests = quests.filter(q => q.id !== id);
            setQuests(newQuests);

            // Re-calc stats (simplified for deletion)
            setStats(prev => ({
                ...prev,
                totalQuests: prev.totalQuests - 1
            }));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className={`${styles['quest-badge']} ${styles['quest-badge--completed']}`}>已完成</span>;
            case 'archived':
                return <span className={`${styles['quest-badge']} ${styles['quest-badge--archived']}`}>已归档</span>;
            default:
                return <span className={`${styles['quest-badge']} ${styles['quest-badge--progress']}`}>进行中</span>;
        }
    };

    return (
        <div className={styles['adventure-log']}>
            {/* Header */}
            <div className={styles['log-header']}>
                <div className={styles['log-header__title']}>
                    <IconScroll size={32} color="var(--color-buff-orange)" />
                    冒险日志
                </div>
                <p className={styles['log-header__subtitle']}>
                    记录你的每一次求职侦察任务，分析战力成长趋势
                </p>
            </div>

            {/* Stats Grid */}
            <div className={styles['stats-grid']}>
                <PixelCard variant="default" shadow="sm">
                    <div className={styles['stat-card']}>
                        <div className={styles['stat-card__value']}>{stats.totalQuests}</div>
                        <div className={styles['stat-card__label']}>总任务数</div>
                    </div>
                </PixelCard>
                <PixelCard variant="default" shadow="sm">
                    <div className={styles['stat-card']}>
                        <div className={styles['stat-card__value']} style={{ color: 'var(--color-loot-green)' }}>+{stats.weeklyNew}</div>
                        <div className={styles['stat-card__label']}>本周新增</div>
                    </div>
                </PixelCard>
                <PixelCard variant="default" shadow="sm">
                    <div className={styles['stat-card']}>
                        <div className={styles['stat-card__value']}>{stats.avgScore}</div>
                        <div className={styles['stat-card__label']}>平均战力</div>
                    </div>
                </PixelCard>
                <PixelCard variant="default" shadow="sm">
                    <div className={styles['stat-card']}>
                        <div className={styles['stat-card__value']} style={{ color: '#1890ff' }}>{stats.completedForges}</div>
                        <div className={styles['stat-card__label']}>已完成试炼</div>
                    </div>
                </PixelCard>
            </div>

            {/* Charts Section */}
            {quests.length > 0 && (
                <div className={styles['charts-section']}>
                    <PixelCard shadow="md">
                        <div style={{ padding: 24, height: '100%' }}>
                            <div className={styles['chart-title']}>
                                <IconTrendingUp size={20} />
                                战力趋势 (Score Trend)
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 12, fill: '#666' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            hide={false}
                                            tick={{ fontSize: 12, fill: '#666' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                border: '2px solid black',
                                                borderRadius: 0,
                                                boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="var(--color-buff-orange)"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </PixelCard>

                    <PixelCard shadow="md">
                        <div style={{ padding: 24, height: '100%' }}>
                            <div className={styles['chart-title']}>
                                <IconPieChart size={20} />
                                分数段分布
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={distData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tick={{ fontSize: 12 }}
                                            width={50}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                            {distData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </PixelCard>
                </div>
            )}

            {/* Actions */}
            <div className={styles['log-actions']}>
                <Link href="/quest/new">
                    <RetroButton variant="primary" size="medium">
                        <IconTarget size={16} />
                        开启新任务
                    </RetroButton>
                </Link>
            </div>

            {/* Quest List */}
            <div className={styles['quest-list']}>
                {loading ? (
                    <div className={styles['loading']}>数据同步中...</div>
                ) : quests.length === 0 ? (
                    <PixelCard>
                        <div className={styles['empty-state']}>
                            <IconRadar size={64} color="var(--color-pixel-gray-dark)" />
                            <p>暂无侦察记录</p>
                            <p className={styles['empty-hint']}>开启你的第一个任务，点亮冒险地图！</p>
                        </div>
                    </PixelCard>
                ) : (
                    quests.map(quest => (
                        <PixelCard key={quest.id} shadow="sm" hoverLift>
                            <div className={styles['quest-item']}>
                                <div className={styles['quest-info']}>
                                    <div className={styles['quest-main']}>
                                        <span className={styles['quest-company']}>{quest.company}</span>
                                        <span className={styles['quest-role']}>{quest.role}</span>
                                    </div>
                                    <div className={styles['quest-meta']}>
                                        {getStatusBadge(quest.status)}
                                        <span className={styles['quest-score']}>
                                            战力: {quest.score}
                                        </span>
                                        <span className={styles['quest-date']}>
                                            {formatDate(quest.createdAt)}
                                        </span>
                                        {quest.salary && (
                                            <span style={{ color: '#666' }}>💰 {quest.salary}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles['quest-actions']}>
                                    <Link href={`/quest/${quest.id}`}>
                                        <RetroButton variant="secondary" size="small">
                                            查看详情
                                        </RetroButton>
                                    </Link>
                                    <button
                                        className={styles['delete-btn']}
                                        onClick={(e) => { e.preventDefault(); handleDelete(quest.id); }}
                                        title="删除任务"
                                    >
                                        <IconX size={14} color="var(--color-trap-red)" />
                                    </button>
                                </div>
                            </div>
                        </PixelCard>
                    ))
                )}
            </div>
        </div>
    );
}
