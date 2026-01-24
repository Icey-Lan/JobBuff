'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserQuota {
    freeQuota: number;
    usedQuota: number;
    remaining: number;
    isPremium: boolean;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    quota: UserQuota | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshQuota: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [quota, setQuota] = useState<UserQuota | null>(null);
    const [loading, setLoading] = useState(true);

    // 只创建一次 Supabase client
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // 追踪初始化状态
    const isInitializedRef = useRef(false);
    const isFetchingQuotaRef = useRef(false);

    const fetchQuota = async (userId: string) => {
        // 防止并发请求
        if (isFetchingQuotaRef.current) {
            console.log('[AuthProvider] Already fetching quota, skipping');
            return;
        }

        console.log('[AuthProvider] Fetching quota for user:', userId);
        isFetchingQuotaRef.current = true;

        try {
            const { data, error } = await supabase
                .from('user_quotas')
                .select('free_quota, used_quota, is_premium')
                .eq('id', userId)
                .single();

            console.log('[AuthProvider] Quota fetch result:', { data, error: error?.message, errorCode: error?.code });

            if (data && !error) {
                setQuota({
                    freeQuota: data.free_quota,
                    usedQuota: data.used_quota,
                    remaining: data.free_quota - data.used_quota,
                    isPremium: data.is_premium,
                });
            } else if (error?.code === 'PGRST116') {
                // 没有记录，创建新的
                console.log('[AuthProvider] No quota record, creating...');
                const { data: newQuota, error: insertError } = await supabase
                    .from('user_quotas')
                    .insert({
                        id: userId,
                        free_quota: 10,
                        used_quota: 0,
                        is_premium: false
                    })
                    .select()
                    .single();

                if (newQuota && !insertError) {
                    setQuota({
                        freeQuota: newQuota.free_quota,
                        usedQuota: newQuota.used_quota,
                        remaining: newQuota.free_quota - newQuota.used_quota,
                        isPremium: newQuota.is_premium
                    });
                }
            }
        } catch (err) {
            console.error('[AuthProvider] Quota fetch error:', err);
        } finally {
            isFetchingQuotaRef.current = false;
        }
    };

    const refreshQuota = async () => {
        if (user) {
            await fetchQuota(user.id);
        }
    };

    useEffect(() => {
        // 订阅 auth 状态变化 - 这是唯一处理 auth 的地方
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('[AuthProvider] Auth state changed:', event, newSession?.user?.email);

                // 更新 session 和 user
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (newSession?.user) {
                    // 使用 setTimeout 避免 Supabase SDK 的内部锁问题
                    setTimeout(async () => {
                        await fetchQuota(newSession.user.id);
                        setLoading(false);
                    }, 0);
                } else {
                    setQuota(null);
                    setLoading(false);
                }
            }
        );

        // 手动获取初始 session（如果 onAuthStateChange 没有立即触发）
        const checkSession = async () => {
            // 等待一小段时间确保 onAuthStateChange 有机会先触发
            await new Promise(resolve => setTimeout(resolve, 100));

            // 如果还在 loading 状态，说明 onAuthStateChange 还没触发
            if (!isInitializedRef.current) {
                console.log('[AuthProvider] Checking session manually...');
                try {
                    const { data: { session: currentSession } } = await supabase.auth.getSession();

                    if (currentSession?.user) {
                        setSession(currentSession);
                        setUser(currentSession.user);
                        await fetchQuota(currentSession.user.id);
                    }
                } catch (err) {
                    console.error('[AuthProvider] Session check error:', err);
                } finally {
                    setLoading(false);
                    isInitializedRef.current = true;
                }
            }
        };

        checkSession();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 监听 user 变化，标记已初始化
    useEffect(() => {
        if (user !== null || quota !== null) {
            isInitializedRef.current = true;
        }
    }, [user, quota]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setQuota(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, quota, loading, signOut, refreshQuota }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
