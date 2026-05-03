-- Migration: Practice Scenario System
-- Version: 0003_practice_system
-- Dependency: Must run after 0001_initial_schema.sql
--   (requires the `users` table defined in that migration)
-- Adds tables for persisting B2B role-play practice attempts and recommendations

-- Practice scenarios table (populated from b2bPersonas.ts + b2bScenarios.ts at runtime)
CREATE TABLE IF NOT EXISTS practice_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id TEXT NOT NULL UNIQUE,     -- matches B2BScenario.id in b2bScenarios.ts
    company TEXT NOT NULL,                -- 'eiger-marvel-hr' | 'sgc-tech-ai'
    persona_type TEXT NOT NULL,           -- matches B2BPersonaType
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
    description TEXT,
    context_json TEXT,                    -- JSON: full B2BScenario snapshot
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_practice_scenarios_company ON practice_scenarios(company);
CREATE INDEX IF NOT EXISTS idx_practice_scenarios_persona ON practice_scenarios(persona_type);

-- Practice attempts table
CREATE TABLE IF NOT EXISTS practice_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id INTEGER NOT NULL REFERENCES practice_scenarios(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    transcript TEXT,                      -- Full conversation transcript
    qa_score REAL,                        -- 0-100 composite score
    feedback_json TEXT,                   -- JSON: { strengths[], improvements[], coaching_notes }
    passed BOOLEAN DEFAULT FALSE,
    duration_seconds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_id ON practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_scenario_id ON practice_attempts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_started_at ON practice_attempts(started_at);
