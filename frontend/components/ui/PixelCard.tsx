import React from 'react';
import styles from './PixelCard.module.css';

export type ShadowSize = 'none' | 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'primary' | 'secondary' | 'danger';

interface PixelCardProps {
    shadow?: ShadowSize;
    variant?: CardVariant;
    hoverLift?: boolean;
    noPadding?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface PixelCardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface PixelCardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function PixelCard({
    shadow = 'none',
    variant = 'default',
    hoverLift = false,
    noPadding = false,
    className = '',
    children,
}: PixelCardProps) {
    const shadowClass = shadow === 'md'
        ? styles['pixel-card--shadow']
        : shadow !== 'none'
            ? styles[`pixel-card--shadow-${shadow}`]
            : '';

    const variantClass = variant !== 'default' ? styles[`pixel-card--${variant}`] : '';

    const classNames = [
        styles['pixel-card'],
        shadowClass,
        variantClass,
        hoverLift && styles['pixel-card--hover-lift'],
        noPadding && styles['pixel-card--no-padding'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <div className={classNames}>{children}</div>;
}

export function PixelCardHeader({ children, className = '' }: PixelCardHeaderProps) {
    return (
        <div className={`${styles['pixel-card__header']} ${className}`}>
            {children}
        </div>
    );
}

export function PixelCardFooter({ children, className = '' }: PixelCardFooterProps) {
    return (
        <div className={`${styles['pixel-card__footer']} ${className}`}>
            {children}
        </div>
    );
}

export default PixelCard;
