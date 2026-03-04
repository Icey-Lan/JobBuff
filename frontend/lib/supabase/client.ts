import { createBrowserClient } from '@supabase/ssr';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

interface MockError {
    code: string;
    message: string;
}

interface MockQueryResult {
    data: null;
    error: MockError | null;
}

interface ChainableMock {
    select: () => ChainableMock;
    insert: () => ChainableMock;
    update: () => ChainableMock;
    delete: () => ChainableMock;
    upsert: () => ChainableMock;
    eq: () => ChainableMock;
    neq: () => ChainableMock;
    gt: () => ChainableMock;
    gte: () => ChainableMock;
    lt: () => ChainableMock;
    lte: () => ChainableMock;
    order: () => ChainableMock;
    limit: () => ChainableMock;
    single: () => Promise<MockQueryResult>;
    maybeSingle: () => Promise<{ data: null; error: null }>;
    then: (resolve: (value: MockQueryResult) => unknown) => unknown;
}

// Create a proper chainable mock for build time
const createChainableMock = (): ChainableMock => {
    const chainable: ChainableMock = {
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
        then: (resolve) => resolve({ data: null, error: { code: 'MOCK', message: 'Mock client' } }),
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
        updateUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
    },
    from: () => createChainableMock(),
    rpc: () => Promise.resolve({ data: null, error: { code: 'MOCK', message: 'Mock client' } }),
});

export function createClient() {
    // Return mock client during build if env vars are missing
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[Supabase] Environment variables not available, using mock client');
        return createMockClient() as unknown as BrowserSupabaseClient;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
