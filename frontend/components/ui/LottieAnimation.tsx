'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const DotLottieReact = dynamic(
    () => import('@lottiefiles/dotlottie-react').then(m => m.DotLottieReact),
    { ssr: false }
);

interface LottieAnimationProps {
    src: string;  // Path to .lottie or .json file in public folder
    width?: number | string;
    height?: number | string;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
    className?: string;
}

/**
 * Lottie Animation Component using dotLottie format
 * 
 * Usage:
 * <LottieAnimation 
 *   src="/animations/loading.lottie" 
 *   width={200} 
 *   height={200} 
 * />
 * 
 * Files should be placed in: frontend/public/animations/
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
    src,
    width = 200,
    height = 200,
    loop = true,
    autoplay = true,
    speed = 1,
    className,
}) => {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div className={className} style={style}>
            <DotLottieReact
                src={src}
                loop={loop}
                autoplay={autoplay}
                speed={speed}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default LottieAnimation;
