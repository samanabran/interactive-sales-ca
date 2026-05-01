# Claude Code Plugin Guide for interactive-sales-ca

## Activated Plugins

### 1. **superpowers** 
**Purpose:** Planning, execution, and workflow management

**Key Skills Available:**
- `/superpowers:brainstorming` - Use BEFORE any creative work (scenario design, feature planning)
- `/superpowers:writing-plans` - Create detailed implementation plans (use for Phase 1-5 of upgrade)
- `/superpowers:executing-plans` - Execute plans with review checkpoints
- `/superpowers:subagent-driven-development` - Parallel task execution
- `/superpowers:verification-before-completion` - Evidence-based completion checks
- `/superpowers:using-git-worktrees` - Isolated feature branches (already using `.worktrees/`)
- `/superpowers:test-driven-development` - Write tests before implementation
- `/superpowers:systematic-debugging` - Structured debugging approach
- `/superpowers:requesting-code-review` - Trigger code review workflows
- `/superpowers:finishing-a-development-branch` - PR/merge guidance

**When to use:** Every major feature (telephony, recording pipeline, AI migration)

---

### 2. **oh-my-claudecode** (OMC Framework)
**Purpose:** Advanced agent orchestration, memory management, state tracking

**Key Skills Available:**
- `/oh-my-claudecode:autopilot` - Full autonomous execution (use for Phase 1 cleanup)
- `/oh-my-claudecode:ralph` - Self-referential improvement loop
- `/oh-my-claudecode:ultrawork` - Parallel execution engine
- `/oh-my-claudecode:deep-dive` - 2-stage investigation (trace → interview)
- `/oh-my-claudecode:trace` - Evidence-driven causal tracing
- `/oh-my-claudecode:omc-plan` - Strategic planning with interview
- `/oh-my-claudecode:wiki` - Persistent markdown knowledge base
- `/oh-my-claudecode:learner` - Extract reusable skills from sessions
- `/oh-my-claudecode:project-session-manager` - Worktree + tmux sessions
- `/oh-my-claudecode:team` - N coordinated agents on shared task list

**When to use:** Complex migrations (Cloudflare → Contabo), multi-agent workflows

---

### 3. **claude-mem**
**Purpose:** Persistent memory across sessions with observation tracking

**Key Skills Available:**
- `/claude-mem:make-plan` - Create phased implementation plans with documentation discovery
- `/claude-mem:do` - Execute plans using subagents
- `/claude-mem:mem-search` - Search across session memory ("did we already solve this?")
- `/claude-mem:knowledge-agent` - Build AI-powered knowledge bases
- `/claude-mem:timeline-report` - Generate project development history
- `/claude-mem:pathfinder` - Map codebase into feature-grouped flowcharts
- `/claude-mem:smart-explore` - Token-optimized code search with tree-sitter AST

**Memory Types:** task, code_pattern, problem, solution, project, technology, error, fix, command, file_context, workflow, general, conversation

**When to use:** Tracking upgrade progress, recalling past decisions, building knowledge base

---

### 4. **token-optimizer**
**Purpose:** Monitor and optimize token usage across sessions

**Key Skills Available:**
- `/token-optimizer:token-dashboard` - Visual dashboard of token usage
- `/token-optimizer:token-coach` - Proactive optimization guidance
- `/token-optimizer:fleet-auditor` - Audit multi-agent token waste
- `/token-optimizer:token-optimizer` - Find and fix ghost tokens
- `/token-optimizer:health` - Check running sessions, find zombies

**When to use:** Long upgrade sessions, multi-agent deployments, cost tracking

---

### 5. **claude-md-management**
**Purpose:** Maintain and improve CLAUDE.md files

**Key Skills Available:**
- `/claude-md-management:claude-md-improver` - Audit and improve CLAUDE.md files
- `/claude-md-management:revise-claude-md` - Update with learnings from session

**When to use:** After Phase 1 cleanup, before major milestones

---

## Auto-Loaded Skills (from .claude/settings.json)

### **omc-reference**
- OMC agent catalog, tools, team pipeline routing
- Auto-loads when delegating to agents, using OMC tools, orchestrating teams
- **Loaded automatically** - no need to invoke

### **canvas-design**
- Create visual art in .png and .pdf formats
- Use for: architecture diagrams, deployment flowcharts, UI mockups
- **Loaded automatically** - invoke with `/canvas-design` if needed

---

## MCP Servers Configured

### **github**
- Access to `renbran/interactive-sales-ca` repository
- Use for: checking reference implementations, comparing with upstream changes

### **cloudflare**
- Manage Cloudflare Workers, R2, D1 resources
- Use for: gradual migration while testing Contabo setup

### **filesystem**
- Local file access within project directory
- Use for: reading/writing project files

### **context7**
- Library documentation and code examples
- Use for: researching Contabo deployment tools, PostgreSQL migrations, Docker best practices

---

## Quick Reference: Plugin Activation Status

| Plugin | Status | Priority For This Project |
|--------|--------|--------------------------|
| superpowers | ✅ Enabled | High - Use for phased upgrade execution |
| oh-my-claudecode | ✅ Enabled | High - Complex Contabo migration |
| claude-mem | ✅ Enabled | Medium - Track upgrade decisions |
| token-optimizer | ✅ Enabled | Low - Monitor long sessions |
| claude-md-management | ✅ Enabled | Medium - Maintain docs |

---

## Recommended Workflow for Contabo Migration

1. **Phase 1 (Cleanup):** Use `/superpowers:autopilot` or `/oh-my-claudecode:autopilot`
2. **Phase 2 (Recording):** Use `/superpowers:writing-plans` → `/superpowers:executing-plans`
3. **Phase 3 (AI Stack):** Use `/oh-my-claudecode:deep-dive` for architecture decisions
4. **Phase 4 (Practice System):** Use `/superpowers:subagent-driven-development`
5. **Phase 5 (Scale):** Use `/oh-my-claudecode:team` for parallel optimization

---

## Notes

- All plugins are configured in `.claude/settings.json`
- MCP servers are in `.mcp.json` (Claude Desktop) and `.claude/settings.json` (Claude Code)
- Your Contabo VPS (80.241.218.108) is pre-configured with SSH key at `~/.ssh/contabo_80_241_218_108`
- GitHub repo reference: `renbran/interactive-sales-ca`
