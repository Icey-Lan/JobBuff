// Google Analytics 4 配置和事件追踪工具

// GA4 Measurement ID - 从环境变量读取
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// 检查 GA 是否可用
export const isGAEnabled = () => {
    return typeof window !== 'undefined' && GA_MEASUREMENT_ID && window.gtag;
};

// 页面浏览事件
export const pageview = (url: string) => {
    if (!isGAEnabled()) return;

    window.gtag('config', GA_MEASUREMENT_ID!, {
        page_path: url,
    });
};

// 自定义事件追踪
export const event = ({
    action,
    category,
    label,
    value,
}: {
    action: string;
    category: string;
    label?: string;
    value?: number;
}) => {
    if (!isGAEnabled()) return;

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};

// ==========================================
// 预定义的业务事件追踪函数
// ==========================================

// 用户行为事件
export const trackUserAction = {
    // 登录相关
    login: () => event({ action: 'login', category: 'auth' }),
    signup: () => event({ action: 'signup', category: 'auth' }),
    logout: () => event({ action: 'logout', category: 'auth' }),

    // 任务相关
    startQuest: () => event({ action: 'start_quest', category: 'quest' }),
    completeQuest: (questId: string) => event({
        action: 'complete_quest',
        category: 'quest',
        label: questId
    }),

    // AI 分析相关
    startAnalysis: (stage: string) => event({
        action: 'start_analysis',
        category: 'ai',
        label: stage
    }),
    completeAnalysis: (stage: string, durationMs?: number) => event({
        action: 'complete_analysis',
        category: 'ai',
        label: stage,
        value: durationMs
    }),

    // 简历相关
    uploadResume: () => event({ action: 'upload_resume', category: 'resume' }),
    downloadResume: () => event({ action: 'download_resume', category: 'resume' }),
    acceptDiff: (count: number) => event({
        action: 'accept_diff',
        category: 'resume',
        value: count
    }),
    rejectDiff: (count: number) => event({
        action: 'reject_diff',
        category: 'resume',
        value: count
    }),

    // 面试相关
    startInterview: () => event({ action: 'start_interview', category: 'interview' }),
    submitAnswer: (questionIndex: number) => event({
        action: 'submit_answer',
        category: 'interview',
        value: questionIndex
    }),
    viewFeedback: () => event({ action: 'view_feedback', category: 'interview' }),

    // 页面交互
    clickCTA: (ctaName: string) => event({
        action: 'click_cta',
        category: 'engagement',
        label: ctaName
    }),
    copyContent: (contentType: string) => event({
        action: 'copy_content',
        category: 'engagement',
        label: contentType
    }),
};

// 性能事件
export const trackPerformance = {
    apiLatency: (endpoint: string, durationMs: number) => event({
        action: 'api_latency',
        category: 'performance',
        label: endpoint,
        value: durationMs,
    }),
    pageLoadTime: (page: string, durationMs: number) => event({
        action: 'page_load',
        category: 'performance',
        label: page,
        value: durationMs,
    }),
};

// 错误事件
export const trackError = (errorType: string, errorMessage: string) => {
    event({
        action: 'error',
        category: 'error',
        label: `${errorType}: ${errorMessage}`,
    });
};

// TypeScript 类型声明
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js',
            targetId: string,
            config?: Record<string, unknown>
        ) => void;
        dataLayer: unknown[];
    }
}
