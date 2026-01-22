import React from 'react';
import styles from './GlitchCard.module.css';

export type GlitchSeverity = 'warning' | 'danger' | 'info';

interface GlitchCardProps {
    severity?: GlitchSeverity;
    title?: string;
    className?: string;
    children: React.ReactNode;
}

export function GlitchCard({
    severity = 'danger',
    title,
    className = '',
    children,
}: GlitchCardProps) {
    const classNames = [
        styles['glitch-card'],
        styles[`glitch-card--${severity}`],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames}>
            {title && <div className={styles['glitch-card__title']}>{title}</div>}
            <div className={styles['glitch-card__content']}>{children}</div>
        </div>
    );
}

export default GlitchCard;
