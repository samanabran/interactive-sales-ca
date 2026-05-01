-- Scholarix CRM Database Schema
-- PostgreSQL — converted from Cloudflare D1 (SQLite)
-- Includes: initial schema + transcription additions

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'agent')) DEFAULT 'agent',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    position TEXT,
    status TEXT CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'new',
    source TEXT CHECK(source IN ('website', 'referral', 'cold-call', 'email', 'social-media', 'event', 'other')) DEFAULT 'other',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    estimated_value NUMERIC(10,2) DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    next_follow_up TIMESTAMPTZ,
    last_contact TIMESTAMPTZ,
    notes TEXT,
    tags TEXT
);

CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX idx_leads_priority ON leads(priority);

-- =====================================================
-- CALLS TABLE
-- =====================================================
CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    call_date TIMESTAMPTZ DEFAULT NOW(),
    duration INTEGER DEFAULT 0,
    outcome TEXT CHECK(outcome IN ('answered', 'no-answer', 'voicemail', 'busy', 'callback', 'meeting-scheduled', 'not-interested')) DEFAULT 'answered',
    notes TEXT,
    recording_url TEXT,
    script_used TEXT,
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Transcription fields (from 0002)
    transcription TEXT,
    transcription_status TEXT DEFAULT 'pending',
    transcription_language TEXT DEFAULT 'en',
    transcription_confidence NUMERIC(5,4),
    transcription_summary TEXT,
    transcription_key_points TEXT,
    transcription_sentiment_analysis TEXT,
    transcription_processed_at TIMESTAMPTZ,
    recording_duration INTEGER DEFAULT 0
);

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_call_date ON calls(call_date);

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN ('note', 'email', 'sms', 'call-summary', 'meeting-notes')) DEFAULT 'note',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- =====================================================
-- ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- CALL SCRIPTS TABLE
-- =====================================================
CREATE TABLE call_scripts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_scripts_is_active ON call_scripts(is_active);
CREATE INDEX idx_call_scripts_category ON call_scripts(category);

-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- TAGS TABLE
-- =====================================================
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

-- =====================================================
-- LEAD_TAGS TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE lead_tags (
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (lead_id, tag_id)
);

CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON lead_tags(tag_id);

-- =====================================================
-- TRANSCRIPTION SEGMENTS TABLE (from 0002)
-- =====================================================
CREATE TABLE transcription_segments (
    id SERIAL PRIMARY KEY,
    call_id INTEGER NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    segment_index INTEGER NOT NULL,
    start_time NUMERIC(10,3) NOT NULL,
    end_time NUMERIC(10,3) NOT NULL,
    text TEXT NOT NULL,
    confidence NUMERIC(5,4),
    speaker TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transcription_segments_call_id ON transcription_segments(call_id);
CREATE INDEX idx_transcription_segments_start_time ON transcription_segments(start_time);

-- =====================================================
-- CALL ANALYTICS TABLE (from 0002)
-- =====================================================
CREATE TABLE call_analytics (
    id SERIAL PRIMARY KEY,
    call_id INTEGER NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    talk_time_agent INTEGER DEFAULT 0,
    talk_time_customer INTEGER DEFAULT 0,
    interruptions_count INTEGER DEFAULT 0,
    silence_duration INTEGER DEFAULT 0,
    sentiment_score NUMERIC(4,3),
    engagement_score NUMERIC(4,3),
    key_topics TEXT,
    action_items TEXT,
    objections_raised TEXT,
    buying_signals TEXT,
    next_steps TEXT,
    call_quality_score NUMERIC(4,3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_analytics_call_id ON call_analytics(call_id);
CREATE INDEX idx_call_analytics_sentiment_score ON call_analytics(sentiment_score);
CREATE INDEX idx_call_analytics_quality_score ON call_analytics(call_quality_score);

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW v_leads_detailed AS
SELECT
    l.*,
    u.full_name AS assigned_to_name,
    u.email AS assigned_to_email,
    c.full_name AS created_by_name,
    (SELECT COUNT(*) FROM calls WHERE lead_id = l.id) AS total_calls,
    (SELECT COUNT(*) FROM conversations WHERE lead_id = l.id) AS total_conversations,
    (SELECT MAX(call_date) FROM calls WHERE lead_id = l.id) AS last_call_date
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN users c ON l.created_by = c.id;

CREATE VIEW v_user_call_stats AS
SELECT
    u.id,
    u.full_name,
    COUNT(c.id) AS total_calls,
    SUM(c.duration) AS total_duration,
    AVG(c.duration) AS avg_duration,
    COUNT(CASE WHEN c.outcome = 'answered' THEN 1 END) AS answered_calls,
    COUNT(CASE WHEN c.outcome IN ('no-answer', 'voicemail', 'busy') THEN 1 END) AS missed_calls
FROM users u
LEFT JOIN calls c ON u.id = c.user_id
GROUP BY u.id, u.full_name;

CREATE VIEW v_pipeline_summary AS
SELECT
    status,
    COUNT(*) AS count,
    SUM(estimated_value) AS total_value,
    AVG(estimated_value) AS avg_value
FROM leads
GROUP BY status;

-- =====================================================
-- TRIGGER FUNCTION: update_updated_at
-- Reusable for all tables with updated_at column
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leads_timestamp
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_call_scripts_timestamp
BEFORE UPDATE ON call_scripts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TRIGGER FUNCTION: increment_script_usage
-- =====================================================
CREATE OR REPLACE FUNCTION increment_script_usage_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.script_used IS NOT NULL THEN
        UPDATE call_scripts
        SET usage_count = usage_count + 1
        WHERE title = NEW.script_used;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_script_usage
AFTER INSERT ON calls
FOR EACH ROW EXECUTE FUNCTION increment_script_usage_fn();

-- =====================================================
-- TRIGGER FUNCTION: update_lead_last_contact
-- =====================================================
CREATE OR REPLACE FUNCTION update_lead_last_contact_fn()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE leads
    SET last_contact = NEW.call_date
    WHERE id = NEW.lead_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_last_contact
AFTER INSERT ON calls
FOR EACH ROW EXECUTE FUNCTION update_lead_last_contact_fn();

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO call_scripts (title, content, category, description, is_active) VALUES
('Initial Cold Call', 'Hi [Name], this is [Your Name] from Scholarix. I noticed [Company] could benefit from our education solutions. Do you have a moment to discuss how we help institutions improve student outcomes?', 'cold-call', 'Standard opening for cold calls', TRUE),
('Follow-up Call', 'Hi [Name], following up on our conversation from [Date]. I wanted to discuss [Topic] and see if you had any questions about our proposal.', 'follow-up', 'Standard follow-up script', TRUE),
('Demo Scheduling', 'Hi [Name], thank you for your interest in Scholarix. I''d love to schedule a personalized demo. Are you available [Day] at [Time]?', 'demo', 'Demo scheduling script', TRUE);

INSERT INTO tags (name, color) VALUES
('Hot Lead', '#EF4444'),
('Qualified', '#10B981'),
('Decision Maker', '#8B5CF6'),
('Budget Approved', '#F59E0B'),
('Needs Nurturing', '#6B7280');
