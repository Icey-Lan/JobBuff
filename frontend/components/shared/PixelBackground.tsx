'use client';

import React, { useEffect, useState } from 'react';
import styles from './PixelBackground.module.css';

interface Shape {
    id: number;
    type: 'arrow' | 'plus' | 'square';
    x: number;
    y: number;
    size: number;
    color: string;
    filled: boolean;
}

/* Pixel Art SVGs - Now accepting color props */
const ArrowIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L12 18" stroke={color} strokeWidth="3" />
        <path d="M12 2L6 8" stroke={color} strokeWidth="3" />
        <path d="M12 2L18 8" stroke={color} strokeWidth="3" />
        {/* Removed small dot to simplify */}
    </svg>
);

const CrossIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4V20" stroke={color} strokeWidth="4" />
        <path d="M4 12H20" stroke={color} strokeWidth="4" />
    </svg>
);

const SquareIcon = ({ color, filled }: { color: string; filled: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
            x="2"
            y="2"
            width="16"
            height="16"
            stroke={color}
            strokeWidth="3"
            fill={filled ? color : 'none'}
        />
    </svg>
);

export function PixelBackground() {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const generatedShapes: Shape[] = [];
        const count = 40; // Slightly reduced count as they are bigger

        // Increased variety of colors including standard black/gray
        const colors = [
            'var(--color-buff-orange)',
            'var(--color-loot-green)',
            'var(--color-mana-blue)',
            'var(--color-trap-red)',
            'var(--color-ink-black)',
            'var(--color-ink-black)', // Weight black slightly higher
            '#AAAAAA'
        ];

        for (let i = 0; i < count; i++) {
            const bias = Math.random();
            // yPos logic: heavier bias to bottom (0-40% height mostly)
            const yPos = Math.floor(Math.pow(bias, 1.5) * 45);

            const typeRandom = Math.random();
            let type: 'arrow' | 'plus' | 'square' = 'square';
            if (typeRandom > 0.6) type = 'arrow';
            else if (typeRandom > 0.3) type = 'plus';

            generatedShapes.push({
                id: i,
                type,
                x: Math.random() * 98, // 0-98% width
                y: yPos + 2, // Bottom padding
                // Increased size range: 1.2x to 2.2x (was 0.8x to 1.2x)
                size: Math.random() * 1.0 + 1.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                filled: Math.random() > 0.6, // More outlines than fills
            });
        }
        setShapes(generatedShapes);
    }, []);

    if (!isClient) return null;

    return (
        <div className={styles.container}>
            {shapes.map((shape) => (
                <div
                    key={shape.id}
                    className={`${styles.shape} ${styles[shape.type]}`}
                    style={{
                        left: `${shape.x}%`,
                        bottom: `${shape.y}%`,
                        transform: `scale(${shape.size})`,
                    }}
                >
                    {shape.type === 'arrow' && <ArrowIcon color={shape.color} />}
                    {shape.type === 'plus' && <CrossIcon color={shape.color} />}
                    {shape.type === 'square' && <SquareIcon color={shape.color} filled={shape.filled} />}
                </div>
            ))}
        </div>
    );
}

export default PixelBackground;
