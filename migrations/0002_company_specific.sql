-- Company-Specific Sales Platform Migration
-- Cloudflare D1 (SQLite) Migration
-- Version: 0002_company_specific

-- =====================================================
-- COMPANIES TABLE
-- Core company configuration for EIGER MARVEL HR and SGC TECH AI
-- =====================================================
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_key TEXT UNIQUE NOT NULL,  -- 'eiger-marvel-hr' | 'sgc-tech-ai'
    name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    icon TEXT,
    primary_color TEXT,
    description TEXT,
    value_proposition TEXT,
    sales_methodology TEXT,  -- JSON: {stages, cycle_length, decision_makers}
    objection_library TEXT,  -- JSON: company-specific objections
    roi_calculator_template TEXT,  -- JSON: pricing model
    competitive_positioning TEXT,
    implementation_timeline TEXT,  -- JSON
    success_metrics TEXT,  -- JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_key ON companies(company_key);

-- Seed the two companies
INSERT INTO companies (company_key, name, domain, industry, icon, primary_color, description, value_proposition) VALUES
    ('eiger-marvel-hr', 'EIGER MARVEL HR', 'HR Consultancy & Recruitment Automation', 'HR Technology', '🇦🇪', '#3B82F6',
     'HR consultancy specializing in AI-powered recruitment automation for UAE companies',
     'Cut time-to-hire by 50% and reduce cost-per-hire by 40% with AI-driven recruitment automation built for UAE compliance'),
    ('sgc-tech-ai', 'SGC TECH AI', 'IT Services & AI Solutions', 'Enterprise Technology', '🤖', '#10B981',
     'Enterprise AI and ERP enhancement solutions for UAE and GCC organizations',
     'Transform your ERP from a cost center to a competitive advantage with AI-driven automation and 99.99% uptime');

-- =====================================================
-- COMPANY SALES STAGES
-- Defines the stage progression for each company's sales methodology
-- =====================================================
CREATE TABLE company_sales_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    stage_key TEXT NOT NULL,  -- e.g. 'greeting', 'discovery', 'poc-proposal'
    stage_name TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    duration_days INTEGER,
    key_activities TEXT,  -- JSON array
    decision_criteria TEXT,  -- JSON
    success_metric TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_stages_company_id ON company_sales_stages(company_id);
CREATE INDEX idx_company_stages_order ON company_sales_stages(company_id, stage_order);

-- Seed EIGER MARVEL HR stages
INSERT INTO company_sales_stages (company_id, stage_key, stage_name, stage_order, duration_days, success_metric) VALUES
    (1, 'greeting', 'Opening', 1, 1, 'Interest shown and time agreed'),
    (1, 'discovery', 'Discovery', 2, 2, 'Volume, budget, and timeline confirmed'),
    (1, 'pain-quantification', 'Pain Quantification', 3, 1, 'Annual cost of problem quantified'),
    (1, 'solution', 'Solution Pitch', 4, 1, 'Product demo completed and understood'),
    (1, 'handling', 'Objection Handling', 5, 2, 'All key objections addressed'),
    (1, 'closing', 'Close / Next Step', 6, 1, 'Pilot or MOU agreed');

-- Seed SGC TECH AI stages
INSERT INTO company_sales_stages (company_id, stage_key, stage_name, stage_order, duration_days, success_metric) VALUES
    (2, 'greeting', 'Opening', 1, 1, 'Interest confirmed and technical contact identified'),
    (2, 'discovery', 'Technical Discovery', 2, 3, 'ERP stack and pain points mapped'),
    (2, 'gap-analysis', 'Gap Analysis', 3, 2, 'Three key gaps identified and quantified'),
    (2, 'business-case', 'Business Case', 4, 2, 'ROI model presented and validated'),
    (2, 'poc-proposal', 'PoC Proposal', 5, 1, 'PoC scope and success metrics agreed'),
    (2, 'handling', 'Objection Handling', 6, 3, 'Technical and risk objections resolved'),
    (2, 'closing', 'Close / Next Step', 7, 1, 'PoC agreement signed and kickoff scheduled');

-- =====================================================
-- COMPANY PERSONAS
-- Buying power and behavior profiles per company
-- =====================================================
CREATE TABLE company_personas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    persona_type TEXT NOT NULL,  -- 'hr-manager', 'business-owner', etc.
    display_name TEXT NOT NULL,
    buying_power TEXT CHECK(buying_power IN ('primary', 'influencer', 'gate-keeper', 'budget-holder')) NOT NULL,
    avg_decision_time_days INTEGER,
    key_objections TEXT,  -- JSON array
    success_triggers TEXT,  -- JSON array
    budget_range_low REAL,
    budget_range_high REAL,
    currency TEXT DEFAULT 'AED',
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_personas_company_id ON company_personas(company_id);

-- Seed EIGER MARVEL HR personas
INSERT INTO company_personas (company_id, persona_type, display_name, buying_power, avg_decision_time_days, budget_range_low, budget_range_high, difficulty) VALUES
    (1, 'hr-manager', 'HR Manager (Operations)', 'influencer', 14, 50000, 200000, 'medium'),
    (1, 'business-owner', 'Business Owner / Founder', 'primary', 7, 50000, 500000, 'medium'),
    (1, 'finance-decider', 'Finance Manager / CFO', 'budget-holder', 21, 50000, 1000000, 'hard');

-- Seed SGC TECH AI personas
INSERT INTO company_personas (company_id, persona_type, display_name, buying_power, avg_decision_time_days, budget_range_low, budget_range_high, difficulty) VALUES
    (2, 'it-manager', 'IT Manager / CTO', 'gate-keeper', 30, 800000, 5000000, 'hard'),
    (2, 'business-owner', 'CEO / Founder', 'primary', 14, 800000, 10000000, 'medium'),
    (2, 'operations-manager', 'Operations Manager', 'influencer', 21, 500000, 3000000, 'medium');

-- =====================================================
-- COMPANY OBJECTIONS
-- Tracked objection outcomes per company
-- =====================================================
CREATE TABLE company_objections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    objection_key TEXT NOT NULL,
    objection_text TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    best_response_approach TEXT,
    best_response_script TEXT,
    effectiveness_score REAL DEFAULT 0.75,
    times_encountered INTEGER DEFAULT 0,
    times_overcome INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_objections_company_id ON company_objections(company_id);
CREATE INDEX idx_company_objections_key ON company_objections(company_id, objection_key);

-- =====================================================
-- ALTER EXISTING TABLES — Add company_id foreign keys
-- =====================================================

-- Add company_id to leads (which company's sales cycle this lead belongs to)
ALTER TABLE leads ADD COLUMN company_id INTEGER REFERENCES companies(id);
CREATE INDEX idx_leads_company_id ON leads(company_id);

-- Add company_id to calls
ALTER TABLE calls ADD COLUMN company_id INTEGER REFERENCES companies(id);
CREATE INDEX idx_calls_company_id ON calls(company_id);

-- Add call stage tracking to calls
ALTER TABLE calls ADD COLUMN call_stage TEXT;  -- current stage when call ended
ALTER TABLE calls ADD COLUMN stages_completed TEXT;  -- JSON array of completed stages

-- Add company_id to call_scripts
ALTER TABLE call_scripts ADD COLUMN company_id INTEGER REFERENCES companies(id);
CREATE INDEX idx_call_scripts_company_id ON call_scripts(company_id);

-- =====================================================
-- ROLEPLAY SESSIONS TABLE
-- Track AI roleplay practice sessions per user per company
-- =====================================================
CREATE TABLE roleplay_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),
    persona_type TEXT NOT NULL,
    tts_provider TEXT DEFAULT 'gemini',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    message_count INTEGER DEFAULT 0,
    overall_score REAL,
    script_adherence_score REAL,
    objection_handling_score REAL,
    rapport_score REAL,
    closing_score REAL,
    objections_encountered TEXT,  -- JSON array
    objections_handled TEXT,  -- JSON array
    stages_reached TEXT,  -- JSON array
    final_stage TEXT,
    strengths TEXT,  -- JSON array
    improvements TEXT,  -- JSON array
    transcript TEXT,  -- JSON: full conversation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roleplay_sessions_user_id ON roleplay_sessions(user_id);
CREATE INDEX idx_roleplay_sessions_company_id ON roleplay_sessions(company_id);
CREATE INDEX idx_roleplay_sessions_started_at ON roleplay_sessions(started_at);
