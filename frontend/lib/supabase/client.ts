import { createBrowserClient } from '@supabase/ssr';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a proper chainable mock for build time
const createChainableMock = () => {
    const chainable: any = {
        select: () => chainable,
        insert: () => chainable,
        update: () => chainable,
        delete: () => chainable,
        upsert: () => chainable,
        eq: () => chainable,
        neq: () => chainable,
        gt: () => chainable,
        gte: () => chainable,
        lt: () => chainable,
        lte: () => chainable,
        order: () => chainable,
        limit: () => chainable,
        single: () => Promise.resolve({ data: null, error: { code: 'MOCK', message: 'Mock client' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (resolve: any) => resolve({ data: null, error: { code: 'MOCK', message: 'Mock client' } }),
    };
    return chainable;
};

// Create a mock client for build time when env vars are not available
const createMockClient = () => ({
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
    },
    from: () => createChainableMock(),
    rpc: () => Promise.resolve({ data: null, error: { code: 'MOCK', message: 'Mock client' } }),
});

export function createClient() {
    // Return mock client during build if env vars are missing
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[Supabase] Environment variables not available, using mock client');
        return createMockClient() as any;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
