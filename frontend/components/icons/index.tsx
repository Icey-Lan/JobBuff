import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
}

// Pixel-art style icons using SVG paths

export function IconRadar({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="2" y="2" width="20" height="20" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="3" fill={color} />
            <line x1="12" y1="2" x2="12" y2="9" stroke={color} strokeWidth="2" />
            <line x1="12" y1="15" x2="12" y2="22" stroke={color} strokeWidth="2" />
            <line x1="2" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" />
            <line x1="15" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
        </svg>
    );
}

export function IconHammer({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="4" y="2" width="10" height="6" fill={color} />
            <rect x="8" y="8" width="2" height="14" fill={color} />
        </svg>
    );
}

export function IconSword({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="10" y="2" width="4" height="14" fill={color} />
            <rect x="6" y="14" width="12" height="2" fill={color} />
            <rect x="10" y="16" width="4" height="6" fill={color} />
        </svg>
    );
}

export function IconScroll({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="4" y="2" width="16" height="20" stroke={color} strokeWidth="2" fill="none" />
            <line x1="7" y1="6" x2="17" y2="6" stroke={color} strokeWidth="2" />
            <line x1="7" y1="10" x2="17" y2="10" stroke={color} strokeWidth="2" />
            <line x1="7" y1="14" x2="13" y2="14" stroke={color} strokeWidth="2" />
        </svg>
    );
}

export function IconUpload({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="4" y="14" width="16" height="8" stroke={color} strokeWidth="2" fill="none" />
            <rect x="10" y="6" width="4" height="10" fill={color} />
            <polygon points="12,2 6,8 18,8" fill={color} />
        </svg>
    );
}

export function IconFile({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 2 L14 2 L20 8 L20 22 L4 22 Z" stroke={color} strokeWidth="2" fill="none" />
            <path d="M14 2 L14 8 L20 8" stroke={color} strokeWidth="2" fill="none" />
        </svg>
    );
}

export function IconCheck({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polyline points="4,12 10,18 20,6" stroke={color} strokeWidth="3" fill="none" />
        </svg>
    );
}

export function IconX({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="3" />
            <line x1="20" y1="4" x2="4" y2="20" stroke={color} strokeWidth="3" />
        </svg>
    );
}

export function IconWarning({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polygon points="12,2 2,22 22,22" stroke={color} strokeWidth="2" fill="none" />
            <rect x="11" y="8" width="2" height="7" fill={color} />
            <rect x="11" y="17" width="2" height="2" fill={color} />
        </svg>
    );
}

export function IconInfo({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <rect x="11" y="7" width="2" height="2" fill={color} />
            <rect x="11" y="11" width="2" height="6" fill={color} />
        </svg>
    );
}

export function IconPlus({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="10" y="4" width="4" height="16" fill={color} />
            <rect x="4" y="10" width="16" height="4" fill={color} />
        </svg>
    );
}

export function IconMinus({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="4" y="10" width="16" height="4" fill={color} />
        </svg>
    );
}

export function IconChevronRight({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polyline points="8,4 16,12 8,20" stroke={color} strokeWidth="3" fill="none" />
        </svg>
    );
}

export function IconChevronDown({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polyline points="4,8 12,16 20,8" stroke={color} strokeWidth="3" fill="none" />
        </svg>
    );
}

export function IconSave({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="2" y="2" width="20" height="20" stroke={color} strokeWidth="2" fill="none" />
            <rect x="6" y="2" width="12" height="8" stroke={color} strokeWidth="2" fill="none" />
            <rect x="6" y="14" width="12" height="8" fill={color} />
        </svg>
    );
}

export function IconExport({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth="2" fill="none" />
            <polygon points="12,6 6,12 18,12" fill={color} />
            <rect x="10" y="12" width="4" height="6" fill={color} />
        </svg>
    );
}

export function IconTarget({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="2" fill={color} />
        </svg>
    );
}

export function IconLightning({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polygon points="14,2 6,14 12,14 10,22 18,10 12,10" fill={color} />
        </svg>
    );
}

export function IconGamepad({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <rect x="6" y="10" width="2" height="4" fill={color} />
            <rect x="5" y="11" width="4" height="2" fill={color} />
            <circle cx="16" cy="10" r="1.5" fill={color} />
            <circle cx="18" cy="12" r="1.5" fill={color} />
        </svg>
    );
}

export function IconTrendingUp({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke={color} strokeWidth="2" />
            <polyline points="16 7 22 7 22 13" stroke={color} strokeWidth="2" />
        </svg>
    );
}

export function IconPieChart({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke={color} strokeWidth="2" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" fill={color} />
        </svg>
    );
}

export function IconUser({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="8" r="4" fill={color} />
            <path d="M4 22 C4 16 8 14 12 14 C16 14 20 16 20 22" stroke={color} strokeWidth="2" fill="none" />
        </svg>
    );
}

export function IconRocket({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2 C12 2 6 8 6 14 L12 20 L18 14 C18 8 12 2 12 2" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="12" cy="10" r="2" fill={color} />
            <path d="M6 14 L2 18" stroke={color} strokeWidth="2" />
            <path d="M18 14 L22 18" stroke={color} strokeWidth="2" />
        </svg>
    );
}

export function IconShield({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2 L4 6 L4 12 C4 17 8 21 12 22 C16 21 20 17 20 12 L20 6 L12 2" stroke={color} strokeWidth="2" fill="none" />
            <polyline points="9,12 11,14 15,10" stroke={color} strokeWidth="2" fill="none" />
        </svg>
    );
}

export function IconTrash({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="5" y="6" width="14" height="14" stroke={color} strokeWidth="2" fill="none" />
            <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" />
            <path d="M8 6 L8 4 L16 4 L16 6" stroke={color} strokeWidth="2" fill="none" />
            <line x1="10" y1="10" x2="10" y2="16" stroke={color} strokeWidth="2" />
            <line x1="14" y1="10" x2="14" y2="16" stroke={color} strokeWidth="2" />
        </svg>
    );
}

