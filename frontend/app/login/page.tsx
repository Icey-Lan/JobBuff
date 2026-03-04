'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { trackUserAction } from '@/lib/analytics';
import styles from './page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { IconGamepad, IconGitHub, IconGoogle } from '@/components/icons';

// Inner component that uses useSearchParams
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const searchParams = useSearchParams();
    const supabase = createClient();

    const handleOAuthLogin = async (provider: 'github' | 'google') => {
        setLoading(true);
        const redirectTo = searchParams.get('redirect') || '/';
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                // Sign up new user
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    setMessage({ type: 'error', text: error.message });
                    setLoading(false);
                } else if (data.user) {
                    // Check if email confirmation is required
                    if (data.session) {
                        // Session exists, redirect immediately
                        trackUserAction.signup(); // GA 埋点：注册成功
                        setMessage({ type: 'success', text: '🎮 注册成功！正在进入游戏...' });
                        const redirectTo = searchParams.get('redirect') || '/';
                        // Use window.location for full page reload
                        window.location.href = redirectTo === '/login' ? '/' : redirectTo;
                    } else {
                        // Email confirmation required
                        setMessage({
                            type: 'success',
                            text: '📧 注册成功！请查收邮箱验证后登录。'
                        });
                        setLoading(false);
                    }
                }
            } else {
                // Sign in existing user
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    setMessage({ type: 'error', text: error.message });
                    setLoading(false);
                } else if (data.session) {
                    trackUserAction.login(); // GA 埋点：登录成功
                    const redirectTo = searchParams.get('redirect') || '/';
                    // Use window.location for full page reload
                    window.location.href = redirectTo === '/login' ? '/' : redirectTo;
                }
            }
        } catch {
            setMessage({ type: 'error', text: '发生未知错误，请重试' });
            setLoading(false);
        }
    };

    return (
        <div className={styles['login-content']}>
            <div className={styles['login-header']}>
                <IconGamepad size={48} color="var(--color-buff-orange)" />
                <h1 className={styles['login-title']}>
                    {isSignUp ? '创建账号' : '进入游戏'}
                </h1>
                <p className={styles['login-subtitle']}>
                    {isSignUp ? '新冒险者注册' : '欢迎回来，冒险者'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles['login-form']}>
                <div className={styles['form-group']}>
                    <label htmlFor="email" className={styles['form-label']}>
                        邮箱地址
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className={styles['form-input']}
                        disabled={loading}
                    />
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="password" className={styles['form-label']}>
                        密码
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="至少6位"
                        required
                        minLength={6}
                        className={styles['form-input']}
                        disabled={loading}
                    />
                </div>

                {message && (
                    <div className={`${styles['message']} ${styles[`message--${message.type}`]}`}>
                        {message.text}
                    </div>
                )}

                <RetroButton
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={loading || !email || !password}
                    pulse={!loading && !!email && !!password}
                >
                    {loading ? '加载中...' : (isSignUp ? '🚀 创建账号' : '⚔️ 开始冒险')}
                </RetroButton>
            </form>

            <div className={styles['oauth-divider']}>或</div>

            <div className={styles['oauth-buttons']}>
                <button
                    type="button"
                    className={`${styles['oauth-button']} ${styles['oauth-button--github']}`}
                    onClick={() => handleOAuthLogin('github')}
                    disabled={loading}
                >
                    <IconGitHub size={20} />
                    使用 GitHub 登录
                </button>
                <button
                    type="button"
                    className={`${styles['oauth-button']} ${styles['oauth-button--google']}`}
                    onClick={() => handleOAuthLogin('google')}
                    disabled={loading}
                >
                    <IconGoogle size={20} />
                    使用 Google 登录
                </button>
            </div>

            <div className={styles['login-footer']}>
                <button
                    type="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setMessage(null);
                    }}
                    className={styles['toggle-mode']}
                >
                    {isSignUp ? '已有账号？点击登录' : '没有账号？点击注册'}
                </button>
                {isSignUp && (
                    <p style={{ marginTop: '8px' }}>注册即可享受 <strong>10 次</strong> 免费分析额度</p>
                )}
            </div>
        </div>
    );
}

// Loading placeholder for Suspense
function LoginFormLoading() {
    return (
        <div className={styles['login-content']}>
            <div className={styles['login-header']}>
                <IconGamepad size={48} color="var(--color-buff-orange)" />
                <h1 className={styles['login-title']}>加载中...</h1>
            </div>
        </div>
    );
}

// Main page component with Suspense boundary
export default function LoginPage() {
    return (
        <div className={styles['login-page']}>
            <div className={styles['login-container']}>
                <PixelCard shadow="lg">
                    <Suspense fallback={<LoginFormLoading />}>
                        <LoginForm />
                    </Suspense>
                </PixelCard>
            </div>
        </div>
    );
}
