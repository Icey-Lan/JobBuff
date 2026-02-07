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

export function IconSignal({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="2" y="14" width="4" height="6" fill={color} />
            <rect x="8" y="10" width="4" height="10" fill={color} />
            <rect x="14" y="6" width="4" height="14" fill={color} />
            <rect x="20" y="2" width="4" height="18" fill={color} />
        </svg>
    );
}

export function IconChat({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 4H20V16H10L6 20V16H4V4Z" fill={color} />
            <rect x="7" y="8" width="10" height="2" fill="white" fillOpacity="0.5" />
            <rect x="7" y="12" width="7" height="2" fill="white" fillOpacity="0.5" />
        </svg>
    );
}

export function IconGitHub({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

export function IconGoogle({ size = 24, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

