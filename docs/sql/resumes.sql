-- ==========================================================================
-- Resume Material Library - Database Schema
-- ==========================================================================

-- Table: resumes
-- Stores user uploaded resume metadata and parsed text content
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,       -- Original file name (e.g., resume_v2.pdf)
    file_type VARCHAR(50) NOT NULL,        -- File type: pdf / docx / md
    content TEXT NOT NULL,                 -- Parsed text content
    file_size INTEGER,                     -- File size in bytes
    last_used_at TIMESTAMPTZ,              -- Last used timestamp for sorting
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: Sort by user and recent usage
CREATE INDEX idx_resumes_user_recent ON resumes(user_id, last_used_at DESC NULLS LAST);

-- Row Level Security: Users can only access their own resumes
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" ON resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
    FOR DELETE USING (auth.uid() = user_id);
