// EIGER MARVEL HR — Company-Specific Call Flow
// HR Consultancy & Recruitment Automation for UAE Market

export interface CallStage {
  id: string;
  label: string;
  timeLimit: number; // seconds
  script: string;
  successIndicators: string[];
}

export interface DiscoveryQuestion {
  question: string;
  storeAs: string;
  followUp?: string;
}

export interface ObjectionScript {
  approach: string;
  script: string;
}

export interface QualificationCriteria {
  minimumHiringVolume: number;
  budgetAvailable: number; // AED/year
  decisionTimeline: number; // days
}

export interface CalculationFormulas {
  monthlyCost: string;
  annualWaste: string;
  timeSaved: string;
}

export const EIGER_MARVEL_CALL_FLOW = {
  stages: ['greeting', 'discovery', 'pain-quantification', 'solution', 'handling', 'closing'] as const,

  greeting: {
    id: 'greeting',
    label: 'Opening',
    timeLimit: 90,
    script: `Hi [NAME], this is [YOUR_NAME] from Eiger Marvel HR. I noticed you're hiring for [ROLE] positions.
We help companies like yours cut recruitment time in half while improving hire quality.
Do you have 3 minutes to explore how we're doing this for similar companies in the UAE?`,
    successIndicators: ['Interest shown', 'Time agreed', 'Pain acknowledged'],
  } satisfies CallStage,

  discovery: {
    id: 'discovery',
    label: 'Discovery',
    timeLimit: 300,
    script: `Great! Let me ask you a few quick questions to see exactly how we can help:
1. How many positions are you hiring for this quarter?
2. What's your average time-to-hire right now?
3. What's your biggest recruitment bottleneck?`,
    successIndicators: ['Volume confirmed', 'Pain articulated', 'Qualification complete'],
    questions: [
      { question: 'Monthly hiring volume?', storeAs: 'hiring_volume', followUp: 'Is that consistent or seasonal?' },
      { question: 'Current cost per hire (including agency fees)?', storeAs: 'cost_per_hire', followUp: 'Any hidden costs like re-hiring when someone leaves?' },
      { question: 'Time from job posting to candidate start?', storeAs: 'time_to_hire', followUp: 'And how much of that is CV screening?' },
      { question: 'ATS or manual spreadsheet process?', storeAs: 'current_system', followUp: 'How satisfied is your team with it?' },
      { question: 'Are quality/retention issues a concern?', storeAs: 'quality_issues', followUp: 'What percentage of hires pass their 90-day review?' },
    ] satisfies DiscoveryQuestion[],
    qualificationCriteria: {
      minimumHiringVolume: 10, // per month
      budgetAvailable: 50000, // AED/year
      decisionTimeline: 30, // days
    } satisfies QualificationCriteria,
  },

  painQuantification: {
    id: 'pain-quantification',
    label: 'Pain Quantification',
    timeLimit: 180,
    script: `So you're hiring [X] people/month at AED [Y] cost per hire, taking [Z] weeks.
That's costing you about AED [CALCULATION] annually — just in direct recruitment costs.
On top of that, every bad hire costs you roughly AED 40k in rework and lost productivity.
What if we could cut this by 40% in the first 3 months?`,
    calculations: {
      monthlyCost: 'hiring_volume * cost_per_hire',
      annualWaste: 'monthly_cost * 12 * 0.4',
      timeSaved: 'hiring_volume * 2',
    } satisfies CalculationFormulas,
  },

  solution: {
    id: 'solution',
    label: 'Solution Pitch',
    timeLimit: 240,
    script: `Here's exactly how Eiger Marvel changes this — in 14 days, not 6 months:
We handle the full recruitment cycle: AI-powered CV screening, candidate ranking, interview scheduling, and offer letters.
Your team focuses purely on the final 5% — the hiring decision. Everything else is automated.`,
    pitchPoints: [
      'AI CV screening: 40-hour process → 2-hour QA review',
      'Candidate ranking by role fit and cultural match',
      'Interview scheduling automation with calendar sync',
      'Offer package generation with WPS compliance',
      'Ongoing performance and retention tracking',
      'UAE Labour Law compliance built-in',
    ],
  },

  handling: {
    id: 'handling',
    label: 'Objection Handling',
    timeLimit: 300,
    cost: {
      approach: 'ROI Calculation',
      script: `I understand cost is top of mind. Here's the math:
You're currently spending AED [X] on recruitment annually with [Y] cost per hire.
Our service reduces cost per hire by 40%, paying for itself by month 2.
After that, you're looking at AED [Z] in annual savings — pure profit growth.
Want to see the full breakdown in a 10-minute call with our CFO?`,
    } satisfies ObjectionScript,
    adoption: {
      approach: 'Change Management',
      script: `This is designed to empower your team, not replace them.
We provide: 2 weeks of onboarding, 24/7 support, and a dedicated success manager.
In week 1 we shadow your process. Week 2 you shadow ours. By week 3 your team prefers it.
We've done this with 40+ UAE companies — 92% adoption rate within 30 days.`,
    } satisfies ObjectionScript,
    quality: {
      approach: 'Guarantee Anchor',
      script: `Our AI uses a 47-point candidate scoring matrix refined over 10,000+ UAE placements.
We guarantee that 80%+ of our candidates pass your first-round interview stage.
If that metric isn't met in the first 90 days, we continue working at no additional cost.
That's the only SLA in UAE recruitment that actually has teeth.`,
    } satisfies ObjectionScript,
    competition: {
      approach: 'UAE-Specific Positioning',
      script: `LinkedIn Recruiter is a sourcing tool — it still requires your team to screen and rank.
We're a full-service replacement that handles sourcing through onboarding.
The real comparison: your current process costs AED [X]. We cost AED [Y]. Net saving: AED [Z].
Which other vendor offers a 14-day go-live with WPS compliance included?`,
    } satisfies ObjectionScript,
  },

  closing: {
    id: 'closing',
    label: 'Close / Next Step',
    timeLimit: 120,
    script: `Based on everything we've discussed, I think there's clear ROI here for your business.
What if we started with a pilot? 10-20 positions, 30-day commitment, no lock-in.
We'll prove the value in real numbers, and then you decide whether to continue.
Fair?`,
    closingQuestions: [
      'Does a 30-day pilot approach work with your hiring cycle?',
      "What's your next major hiring push? That's when we'd want to go live.",
      'Can we schedule a 30-minute call with your CFO for budget sign-off?',
    ],
    successOutcomes: ['Pilot agreed', 'CFO meeting scheduled', 'Implementation timeline set', 'MOU signed'],
  },
};

export type EigerMarvelCallStage = (typeof EIGER_MARVEL_CALL_FLOW.stages)[number];

export function getEigerMarvelStageLabel(stage: EigerMarvelCallStage): string {
  const labels: Record<EigerMarvelCallStage, string> = {
    greeting: '👋 Opening',
    discovery: '🔍 Discovery',
    'pain-quantification': '💡 Pain Quantification',
    solution: '🎯 Solution Pitch',
    handling: '🛡️ Objection Handling',
    closing: '🤝 Close / Next Step',
  };
  return labels[stage];
}

export function getEigerMarvelStageProgress(stage: EigerMarvelCallStage): number {
  const progress: Record<EigerMarvelCallStage, number> = {
    greeting: 10,
    discovery: 30,
    'pain-quantification': 50,
    solution: 65,
    handling: 80,
    closing: 95,
  };
  return progress[stage];
}
