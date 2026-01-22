'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    const supabase = createClient();

    const fetchQuota = async (userId: string) => {
        console.log('[AuthProvider] Fetching quota for user:', userId);
        const { data, error } = await supabase
            .from('user_quotas')
            .select('free_quota, used_quota, is_premium')
            .eq('id', userId)
            .single();

        console.log('[AuthProvider] Quota fetch result:', { data, error: error?.message });

        if (data && !error) {
            const quotaData = {
                freeQuota: data.free_quota,
                usedQuota: data.used_quota,
                remaining: data.free_quota - data.used_quota,
                isPremium: data.is_premium,
            };
            console.log('[AuthProvider] Setting quota:', quotaData);
            setQuota(quotaData);
        } else if (error) {
            console.error('[AuthProvider] Quota fetch error:', error);
            // Create default quota if not exists
            if (error.code === 'PGRST116') {
                console.log('[AuthProvider] Creating default quota for new user');
                const { error: insertError } = await supabase
                    .from('user_quotas')
                    .insert({ id: userId, free_quota: 10, used_quota: 0 });

                if (!insertError) {
                    setQuota({ freeQuota: 10, usedQuota: 0, remaining: 10, isPremium: false });
                } else {
                    console.error('[AuthProvider] Failed to create quota:', insertError);
                }
            }
        }
    };

    const refreshQuota = async () => {
        if (user) {
            await fetchQuota(user.id);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const getSession = async () => {
            try {
                console.log('[AuthProvider] Getting session...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!isMounted) return;

                console.log('[AuthProvider] Session result:', {
                    hasSession: !!session,
                    userId: session?.user?.id,
                    email: session?.user?.email,
                    error
                });

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchQuota(session.user.id);
                }
                setLoading(false);
            } catch (err) {
                console.error('[AuthProvider] Error getting session:', err);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                console.log('[AuthProvider] Auth state changed:', event, session?.user?.email);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchQuota(session.user.id);
                } else {
                    setQuota(null);
                }
                setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

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
