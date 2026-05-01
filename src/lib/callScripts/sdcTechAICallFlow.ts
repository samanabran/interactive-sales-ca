// SGC TECH AI — Company-Specific Call Flow
// IT Services & AI Automation for Enterprise UAE Market

export interface TechCallStage {
  id: string;
  label: string;
  timeLimit: number; // seconds
  script: string;
  successIndicators: string[];
}

export interface TechDiscoveryQuestion {
  question: string;
  storeAs: string;
  followUp?: string;
}

export interface TechObjectionScript {
  approach: string;
  script: string;
}

export interface TechQualificationCriteria {
  minimumTransactionVolume: string;
  minimumModules: number;
  budgetAvailable: number; // AED
  decisionTimeline: number; // days
}

export const SDC_TECH_AI_CALL_FLOW = {
  stages: ['greeting', 'discovery', 'gap-analysis', 'business-case', 'poc-proposal', 'handling', 'closing'] as const,

  greeting: {
    id: 'greeting',
    label: 'Opening',
    timeLimit: 120,
    script: `Hi [NAME], this is [YOUR_NAME] from SGC Tech AI.
We specialize in helping [INDUSTRY] enterprises like [COMPANY] eliminate the bottlenecks between your ERP modules using AI-driven automation.
I noticed [COMPANY] recently [RECENT_NEWS — expansion/tech upgrade/new funding].
Do you have 3 minutes to see how we're helping similar enterprises achieve 99.99% uptime and 40% process automation?`,
    successIndicators: ['Interest confirmed', 'Technical contact identified', 'Pain acknowledged'],
  } satisfies TechCallStage,

  discovery: {
    id: 'discovery',
    label: 'Technical Discovery',
    timeLimit: 480,
    script: `Let me understand your current infrastructure first:
1. Which ERP platform are you running — SAP, Oracle, Odoo, or a custom build?
2. How many modules and integration points do you have?
3. What integration failures or data sync delays are you dealing with?`,
    successIndicators: ['ERP stack identified', 'Pain quantified', 'Stakeholders mapped'],
    questions: [
      { question: 'Which ERP platform (SAP, Oracle, Odoo, custom)?', storeAs: 'erp_system', followUp: 'Which version and how long have you been on it?' },
      { question: 'Annual transaction volume through the system?', storeAs: 'transaction_volume', followUp: 'Peak volumes during month-end or quarter-end?' },
      { question: 'Number of active module integrations?', storeAs: 'integrations', followUp: 'Which integrations fail most often?' },
      { question: 'Last major system upgrade timeline?', storeAs: 'upgrade_timeline', followUp: 'Was it on time and budget?' },
      { question: 'System downtime or data sync failures per month?', storeAs: 'reliability_issues', followUp: 'What is the business impact per hour of downtime?' },
      { question: 'Current team size managing the ERP?', storeAs: 'team_size', followUp: 'What percentage is manual reconciliation work?' },
    ] satisfies TechDiscoveryQuestion[],
    qualificationCriteria: {
      minimumTransactionVolume: '500,000/year',
      minimumModules: 4,
      budgetAvailable: 1500000, // AED, C-level investment
      decisionTimeline: 60, // days
    } satisfies TechQualificationCriteria,
  },

  gapAnalysis: {
    id: 'gap-analysis',
    label: 'Gap Analysis',
    timeLimit: 360,
    script: `Based on what you've shared, I'm seeing 3 critical gaps in your current architecture:
1. [GAP_1] — costing you approximately AED [IMPACT_1] per month
2. [GAP_2] — causing [IMPACT_2] hours of manual reconciliation weekly
3. [GAP_3] — creating [IMPACT_3]% risk of compliance penalties

Total estimated annual impact: AED [TOTAL]. That's the problem we solve.`,
    gapTypes: [
      'Module connectivity failures causing data inconsistency',
      'Manual reconciliation processes consuming engineering hours',
      'No real-time visibility into cross-module transactions',
      'API rate limiting causing multi-hour data sync delays',
      'Integration scalability limits at peak volume',
      'Lack of AI-driven anomaly detection',
    ],
  },

  businessCase: {
    id: 'business-case',
    label: 'Business Case',
    timeLimit: 480,
    script: `Here's the financial case for AI-driven ERP enhancement:
[Present ROI model with CFO-level financials]
Based on your numbers: AED [COST] investment yields AED [BENEFIT] in year 1.
Payback period: 6-8 months. After that: recurring AED [ANNUAL_NET] in operational savings.`,
    roiComponents: [
      'Efficiency gains: 30-40% process automation reducing manual hours',
      'Risk reduction: 90% fewer integration failures and compliance incidents',
      'Time savings: 200+ engineering hours/month freed from reconciliation',
      'Revenue impact: Faster reporting enabling better business decisions',
      'System reliability: 99.95% → 99.99% uptime improvement',
      'Scalability: Handle 5x transaction volume without headcount increase',
    ],
    financialModel: {
      implementationCost: 'AED 800k–1.5M based on scope',
      monthlyCost: 'AED 40k–80k SaaS model (or one-time license)',
      annualBenefit: 'AED 1.2M–3M (efficiency + risk + time savings)',
      roiMonths: 6,
      paybackPeriod: '6-8 months',
    },
  },

  pocProposal: {
    id: 'poc-proposal',
    label: 'PoC Proposal',
    timeLimit: 240,
    script: `I know you need to see results before committing — that's exactly how enterprise decisions should work.
What if we started with a 30-day proof-of-concept on your highest-impact module?
Zero risk. We set clear success metrics upfront: uptime, sync time, error rate.
If we don't hit the numbers, we stop and give you a full technical debrief at no cost.`,
    pocScope: [
      'Single highest-impact module with AI connectivity layer',
      'AI-powered anomaly detection and auto-correction',
      'Daily performance reports against agreed KPIs',
      'Technical handoff documentation at end of pilot',
      'Clear success metrics: uptime ≥99.99%, sync delay <30s, error rate <0.1%',
    ],
  },

  handling: {
    id: 'handling',
    label: 'Objection Handling',
    timeLimit: 360,
    trackRecord: {
      approach: 'Regional Expertise + Guarantee',
      script: `You're right to ask. Here's our differentiation:
We've done 23 ERP AI implementations across UAE and GCC — 8 in financial services.
Unlike global vendors, we're built for UAE: Arabic UI, WPS compliance, DIFC data residency.
And we back it with a 6-month implementation guarantee with financial penalties if we miss KPIs.
No other vendor in this market does that.`,
    } satisfies TechObjectionScript,
    risk: {
      approach: 'PoC Risk Reversal',
      script: `I understand risk is your primary concern — it should be.
That's exactly why the 30-day PoC exists. Here's how we eliminate risk:
1. We don't touch production — we mirror your environment in isolated infrastructure
2. You maintain full rollback capability throughout
3. Every change requires your IT team's explicit approval
4. If Day 15 metrics aren't on track, we pause and diagnose before continuing
You maintain full control. We just do the heavy lifting.`,
    } satisfies TechObjectionScript,
    cost: {
      approach: 'Cost of Inaction',
      script: `The cost of NOT upgrading is significantly higher than our fee.
You're currently spending AED [X] on manual reconciliation + AED [Y] on integration failures.
Our solution pays for itself in 6 months, then delivers AED [Z] in annual ongoing savings.
The question isn't whether you can afford to do this — it's whether you can afford to wait.`,
    } satisfies TechObjectionScript,
    competition: {
      approach: 'Technical Differentiation',
      script: `SAP and Oracle add-ons require 12–18 month implementations and dedicated SAP architects.
We deploy in 30 days and integrate with your existing stack — whatever it is.
Our AI layer sits above your ERP, not inside it, which means zero disruption to existing operations.
Which vendor is offering you a 30-day PoC with financial guarantees?`,
    } satisfies TechObjectionScript,
  },

  closing: {
    id: 'closing',
    label: 'Close / Next Step',
    timeLimit: 180,
    script: `Based on our technical discussion, I think we're aligned on the business case.
Let's move forward with the 30-day PoC. I'll prepare a detailed scope document
with clear success metrics for you and your IT Manager by [DATE].
What's your preferred start date — and should we include Finance in the kickoff call?`,
    closingQuestions: [
      'Does a 30-day PoC fit your current project calendar?',
      'Should we include IT, Finance, and Operations in the kickoff meeting?',
      "What's your ideal PoC start date?",
    ],
    successOutcomes: ['PoC agreement signed', 'Kickoff meeting scheduled', 'Technical requirements gathered', 'Budget approval confirmed'],
  },
};

export type SDCTechCallStage = (typeof SDC_TECH_AI_CALL_FLOW.stages)[number];

export function getSDCTechStageLabel(stage: SDCTechCallStage): string {
  const labels: Record<SDCTechCallStage, string> = {
    greeting: '👋 Opening',
    discovery: '🔍 Technical Discovery',
    'gap-analysis': '📊 Gap Analysis',
    'business-case': '💰 Business Case',
    'poc-proposal': '🧪 PoC Proposal',
    handling: '🛡️ Objection Handling',
    closing: '🤝 Close / Next Step',
  };
  return labels[stage];
}

export function getSDCTechStageProgress(stage: SDCTechCallStage): number {
  const progress: Record<SDCTechCallStage, number> = {
    greeting: 10,
    discovery: 25,
    'gap-analysis': 40,
    'business-case': 55,
    'poc-proposal': 70,
    handling: 85,
    closing: 95,
  };
  return progress[stage];
}
