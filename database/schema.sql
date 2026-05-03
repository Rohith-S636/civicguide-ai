-- ============================================================================
-- CivicGuide AI - Complete Supabase PostgreSQL Schema
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'te', 'ta')),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
    last_active DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_xp ON public.users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can view all public profile data
CREATE POLICY "Users can view all profiles"
    ON public.users
    FOR SELECT
    USING (true);

-- Users can update only their own data
CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only authenticated users can insert their profile
CREATE POLICY "Users can insert their own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. QUIZ SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL CHECK (topic IN ('general_election', 'constitution', 'voting_process', 'current_affairs', 'state_elections', 'eci_history')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'student', 'exam')),
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'te', 'ta')),
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for quiz_sessions
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_topic ON public.quiz_sessions(topic);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_difficulty ON public.quiz_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON public.quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_topic ON public.quiz_sessions(user_id, topic);

-- Enable RLS on quiz_sessions table
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_sessions
-- Users can view their own quiz sessions
CREATE POLICY "Users can view their own quiz sessions"
    ON public.quiz_sessions
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own quiz sessions
CREATE POLICY "Users can insert their own quiz sessions"
    ON public.quiz_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own quiz sessions
CREATE POLICY "Users can update their own quiz sessions"
    ON public.quiz_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 3. CHAT SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_key TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'te', 'ta')),
    total_messages INTEGER NOT NULL DEFAULT 0 CHECK (total_messages >= 0),
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_key ON public.chat_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);

-- Enable RLS on chat_sessions table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
-- Users can view their own chat sessions
CREATE POLICY "Users can view their own chat sessions"
    ON public.chat_sessions
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own chat sessions
CREATE POLICY "Users can insert their own chat sessions"
    ON public.chat_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own chat sessions
CREATE POLICY "Users can update their own chat sessions"
    ON public.chat_sessions
    FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- 4. CHAT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'te', 'ta')),
    references JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);

-- Enable RLS on chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
-- Users can view messages from their own chat sessions
CREATE POLICY "Users can view their own chat messages"
    ON public.chat_messages
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.chat_sessions 
            WHERE auth.uid() = user_id OR user_id IS NULL
        )
    );

-- Users can insert messages to their own chat sessions
CREATE POLICY "Users can insert messages to their own sessions"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM public.chat_sessions 
            WHERE auth.uid() = user_id OR user_id IS NULL
        )
    );

-- ============================================================================
-- 5. USER BADGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create indexes for user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges(earned_at DESC);

-- Enable RLS on user_badges table
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
-- Anyone can view badges (public recognition)
CREATE POLICY "Anyone can view user badges"
    ON public.user_badges
    FOR SELECT
    USING (true);

-- Users can view their own badge insertions (system use)
CREATE POLICY "Users can insert their own badges"
    ON public.user_badges
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. BOOKMARKED FLASHCARDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookmarked_flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    card_front TEXT NOT NULL,
    card_back TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, card_id)
);

-- Create indexes for bookmarked_flashcards
CREATE INDEX IF NOT EXISTS idx_bookmarked_flashcards_user_id ON public.bookmarked_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_flashcards_card_id ON public.bookmarked_flashcards(card_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_flashcards_created_at ON public.bookmarked_flashcards(created_at DESC);

-- Enable RLS on bookmarked_flashcards table
ALTER TABLE public.bookmarked_flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmarked_flashcards
-- Users can only view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON public.bookmarked_flashcards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
    ON public.bookmarked_flashcards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
    ON public.bookmarked_flashcards
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Leaderboard View: Top 100 users by XP
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    u.id,
    u.username,
    u.xp,
    u.level,
    u.language,
    COALESCE(b.badges_count, 0) AS badges_count,
    u.created_at,
    ROW_NUMBER() OVER (ORDER BY u.xp DESC) AS rank
FROM public.users u
LEFT JOIN (
    SELECT user_id, COUNT(*) AS badges_count
    FROM public.user_badges
    GROUP BY user_id
) b ON u.id = b.user_id
ORDER BY u.xp DESC
LIMIT 100;

-- User Statistics View
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
    u.id,
    u.username,
    u.xp,
    u.level,
    u.streak,
    COUNT(DISTINCT qs.id) AS total_quizzes,
    ROUND(AVG(CASE WHEN qs.total_questions > 0 THEN (qs.score::float / qs.total_questions * 100) ELSE 0 END))::int AS avg_quiz_score,
    SUM(qs.xp_earned) AS xp_from_quizzes,
    COUNT(DISTINCT cs.id) AS total_chat_sessions,
    SUM(cs.xp_earned) AS xp_from_chat,
    COUNT(DISTINCT ub.badge_id) AS badge_count,
    COUNT(DISTINCT bf.card_id) AS bookmarked_cards
FROM public.users u
LEFT JOIN public.quiz_sessions qs ON u.id = qs.user_id
LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
LEFT JOIN public.user_badges ub ON u.id = ub.user_id
LEFT JOIN public.bookmarked_flashcards bf ON u.id = bf.user_id
GROUP BY u.id, u.username, u.xp, u.level, u.streak;

-- ============================================================================
-- SEED DATA (Test Users)
-- ============================================================================

-- Note: These users reference auth.users. In production, ensure auth.users exists first
-- For testing purposes, these are example UUIDs. Replace with actual auth user IDs.

INSERT INTO public.users (id, username, email, language, xp, level, streak, last_active, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'priya_voter', 'priya@civicguide.com', 'hi', 1250, 5, 12, CURRENT_DATE, NOW()),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'rajesh_knowledge', 'rajesh@civicguide.com', 'en', 950, 4, 8, CURRENT_DATE, NOW()),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'anjali_democracy', 'anjali@civicguide.com', 'te', 1800, 6, 15, CURRENT_DATE, NOW()),
    ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'arun_elections', 'arun@civicguide.com', 'ta', 650, 3, 5, CURRENT_DATE - INTERVAL '2 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'meera_active', 'meera@civicguide.com', 'en', 2100, 7, 20, CURRENT_DATE, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz sessions
INSERT INTO public.quiz_sessions (user_id, topic, difficulty, language, score, total_questions, xp_earned, time_taken_seconds, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'general_election', 'beginner', 'hi', 9, 10, 45, 180, NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'constitution', 'student', 'hi', 8, 10, 80, 300, NOW() - INTERVAL '1 day'),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'voting_process', 'beginner', 'en', 10, 10, 50, 150, NOW() - INTERVAL '3 days'),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'general_election', 'exam', 'te', 7, 10, 105, 200, NOW()),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'constitution', 'exam', 'en', 9, 10, 135, 250, NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- Insert sample chat sessions
INSERT INTO public.chat_sessions (user_id, session_key, language, total_messages, xp_earned, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'session_priya_001', 'hi', 8, 30, NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'session_rajesh_001', 'en', 12, 50, NOW() - INTERVAL '1 day'),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'session_anjali_001', 'te', 15, 60, NOW()),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'session_meera_001', 'en', 20, 80, NOW() - INTERVAL '3 hours')
ON CONFLICT (session_key) DO NOTHING;

-- Insert sample chat messages
INSERT INTO public.chat_messages (session_id, role, content, language, references, created_at)
VALUES 
    (
        (SELECT id FROM public.chat_sessions WHERE session_key = 'session_priya_001' LIMIT 1),
        'user',
        'भारत में वोटिंग की न्यूनतम उम्र क्या है?',
        'hi',
        '[]'::jsonb,
        NOW() - INTERVAL '2 days'
    ),
    (
        (SELECT id FROM public.chat_sessions WHERE session_key = 'session_priya_001' LIMIT 1),
        'assistant',
        'भारत में वोटिंग की न्यूनतम आयु 18 वर्ष है। यह संविधान के अनुच्छेद 326 में उल्लेख है।',
        'hi',
        '["https://eci.gov.in", "Article 326"]'::jsonb,
        NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'
    )
ON CONFLICT DO NOTHING;

-- Insert sample badges
INSERT INTO public.user_badges (user_id, badge_id, badge_name, earned_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'first_quiz', 'Quiz Master', NOW() - INTERVAL '5 days'),
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'streak_7', 'On Fire', NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'first_chat', 'Curious Mind', NOW() - INTERVAL '4 days'),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'level_5', 'Knowledge Seeker', NOW() - INTERVAL '1 day'),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'streak_7', 'On Fire', NOW()),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'first_quiz', 'Quiz Master', NOW() - INTERVAL '6 days'),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'level_6', 'Election Expert', NOW() - INTERVAL '1 day'),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'streak_10', 'Unstoppable', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Insert sample bookmarked flashcards
INSERT INTO public.bookmarked_flashcards (user_id, card_id, card_front, card_back, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'card_form6', 'Form 6 का क्या प्रयोजन है?', 'Form 6 का उपयोग मतदाता सूची में नाम को शामिल करने के लिए किया जाता है।', NOW() - INTERVAL '5 days'),
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'card_evm', 'EVM का पूरा नाम क्या है?', 'Electronic Voting Machine (इलेक्ट्रॉनिक वोटिंग मशीन)', NOW() - INTERVAL '3 days'),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'card_vvpat', 'VVPAT क्या है?', 'Voter Verifiable Paper Audit Trail - मतदाता सत्यापन योग्य कागज ऑडिट ट्रेल', NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'card_mcc', 'Model Code of Conduct कब बनाया गया?', 'Model Code of Conduct 1960 में बनाया गया था।', NOW()),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'card_nota', 'NOTA का क्या मतलब है?', 'None of the Above - कोई भी नहीं', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_users_updated_at();

-- Function to update chat_sessions updated_at
CREATE OR REPLACE FUNCTION public.update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_sessions table updated_at
CREATE TRIGGER trigger_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_chat_sessions_updated_at();

-- Function to update XP when quiz is completed
CREATE OR REPLACE FUNCTION public.update_user_xp_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET xp = xp + NEW.xp_earned,
        level = CASE 
            WHEN (xp + NEW.xp_earned) >= 5000 THEN 10
            WHEN (xp + NEW.xp_earned) >= 3000 THEN 8
            WHEN (xp + NEW.xp_earned) >= 1500 THEN 6
            WHEN (xp + NEW.xp_earned) >= 750 THEN 4
            WHEN (xp + NEW.xp_earned) >= 300 THEN 2
            ELSE 1
        END
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user XP on quiz completion
CREATE TRIGGER trigger_update_xp_on_quiz
    AFTER INSERT ON public.quiz_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_xp_on_quiz();

-- Function to update XP when chat session is created/updated
CREATE OR REPLACE FUNCTION public.update_user_xp_on_chat()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET xp = xp + COALESCE(NEW.xp_earned - COALESCE(OLD.xp_earned, 0), 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user XP on chat session update
CREATE TRIGGER trigger_update_xp_on_chat
    AFTER INSERT OR UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_xp_on_chat();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user profile with stats
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    email TEXT,
    language TEXT,
    xp INTEGER,
    level INTEGER,
    streak INTEGER,
    last_active DATE,
    total_quizzes BIGINT,
    total_chat_sessions BIGINT,
    badge_count BIGINT,
    bookmarked_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.language,
        u.xp,
        u.level,
        u.streak,
        u.last_active,
        COUNT(DISTINCT qs.id),
        COUNT(DISTINCT cs.id),
        COUNT(DISTINCT ub.id),
        COUNT(DISTINCT bf.id)
    FROM public.users u
    LEFT JOIN public.quiz_sessions qs ON u.id = qs.user_id
    LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
    LEFT JOIN public.user_badges ub ON u.id = ub.user_id
    LEFT JOIN public.bookmarked_flashcards bf ON u.id = bf.user_id
    WHERE u.id = user_uuid
    GROUP BY u.id, u.username, u.email, u.language, u.xp, u.level, u.streak, u.last_active;
END;
$$ LANGUAGE plpgsql;

-- Function to get leaderboard with pagination
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INT DEFAULT 100, offset_count INT DEFAULT 0)
RETURNS TABLE (
    rank INT,
    username TEXT,
    xp INTEGER,
    level INTEGER,
    badges_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.xp DESC)::INT,
        u.username,
        u.xp,
        u.level,
        COALESCE(COUNT(DISTINCT ub.id), 0)
    FROM public.users u
    LEFT JOIN public.user_badges ub ON u.id = ub.user_id
    GROUP BY u.id, u.username, u.xp, u.level
    ORDER BY u.xp DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.users IS 'Stores user profiles and progression data for CivicGuide AI';
COMMENT ON TABLE public.quiz_sessions IS 'Records individual quiz attempts with scores and XP earned';
COMMENT ON TABLE public.chat_sessions IS 'Tracks chat sessions with the Election AI Agent';
COMMENT ON TABLE public.chat_messages IS 'Stores messages within chat sessions';
COMMENT ON TABLE public.user_badges IS 'Tracks badges earned by users for achievements';
COMMENT ON TABLE public.bookmarked_flashcards IS 'User flashcard bookmarks for learning';

COMMENT ON COLUMN public.users.xp IS 'Experience points accumulated through quizzes and chat';
COMMENT ON COLUMN public.users.level IS 'User level calculated based on XP (1-10)';
COMMENT ON COLUMN public.users.streak IS 'Consecutive days of active participation';
COMMENT ON COLUMN public.quiz_sessions.xp_earned IS 'XP awarded based on difficulty (beginner=5, student=10, exam=15) × (score/total)';
COMMENT ON COLUMN public.chat_messages.references IS 'JSONB array of references used in the response (e.g., URLs, articles)';

-- ============================================================================
-- GRANTS (Optional - if using Supabase service roles)
-- ============================================================================

-- Grant permissions to authenticated users on their data
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.quiz_sessions TO authenticated;
GRANT SELECT ON public.chat_sessions TO authenticated;
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT SELECT ON public.user_badges TO authenticated;
GRANT SELECT ON public.bookmarked_flashcards TO authenticated;

-- Grant permissions to anon for viewing public leaderboard
GRANT SELECT ON public.leaderboard TO anon;
GRANT SELECT ON public.user_statistics TO anon;
