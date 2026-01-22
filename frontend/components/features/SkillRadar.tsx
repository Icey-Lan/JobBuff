'use client';

import React from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface SkillRadarProps {
    dimensions: {
        skills: number;
        experience: number;
        education: number;
        industry: number;
        fit: number;
    };
}

const dimensionLabels: Record<string, string> = {
    skills: '技能',
    experience: '经验',
    education: '学历',
    industry: '行业',
    fit: '适配',
};

export function SkillRadar({ dimensions }: SkillRadarProps) {
    // Transform dimensions to chart data format
    const data = Object.entries(dimensions).map(([key, value]) => ({
        dimension: dimensionLabels[key] || key,
        value: value || 0,
        fullMark: 100,
    }));

    return (
        <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid
                        stroke="var(--color-pixel-gray)"
                        strokeOpacity={0.5}
                    />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{
                            fill: 'var(--color-ink-black)',
                            fontSize: 12,
                            fontFamily: 'var(--font-heading)'
                        }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        tickCount={5}
                    />
                    <Radar
                        name="匹配度"
                        dataKey="value"
                        stroke="var(--color-buff-orange)"
                        fill="var(--color-buff-orange)"
                        fillOpacity={0.4}
                        strokeWidth={2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-card-white)',
                            border: '2px solid var(--color-ink-black)',
                            borderRadius: 0,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                        }}
                        formatter={(value) => [`${value ?? 0}%`, '匹配度']}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default SkillRadar;
