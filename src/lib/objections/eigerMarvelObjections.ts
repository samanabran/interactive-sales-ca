// EIGER MARVEL HR — Company-Specific Objection Library
// Based on real UAE HR consultancy sales scenarios

export interface ObjectionResponse {
  approach: string;
  script: string;
  dataPoints?: string[];
  effectiveness?: number; // 0–1 success rate
}

export interface Objection {
  id: string;
  objection: string;
  context: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responses: ObjectionResponse[];
  counterObjections?: string[];
}

export const EIGER_MARVEL_OBJECTIONS: Record<string, Objection> = {
  cost: {
    id: 'cost',
    objection: 'Your service is too expensive compared to LinkedIn Recruiter or a local agency',
    context: 'Usually from CFO, Finance Manager, or conservative owner. Triggered by seeing pricing or asking about costs.',
    priority: 'high',
    responses: [
      {
        approach: 'ROI Calculation',
        script: `I understand cost is important. Let me show you the numbers:
LinkedIn Recruiter costs AED [X]/month but still requires your team to screen, rank, and coordinate every candidate.
We handle the full process for AED [Y]/month — meaning you get back 40 hours of team time per week.
Your time savings alone cover our fee by month 1. The quality improvement kicks in on top of that.`,
        dataPoints: ['time_saved_hours', 'cost_per_hire_reduction', 'annual_roi'],
        effectiveness: 0.78,
      },
      {
        approach: 'Bad Hire Cost Anchor',
        script: `The real cost isn't our fee — it's the bad hires costing you AED 40,000 each in rework, re-hiring, and lost productivity.
Our quality screening reduces bad hires by 70%.
That single metric alone pays for our service 10x over in a year.
Do you track your current bad-hire rate?`,
        dataPoints: ['bad_hire_cost', 'retention_rate', 'quality_improvement'],
        effectiveness: 0.85,
      },
      {
        approach: 'Phased Investment',
        script: `I hear you. What if we started smaller — just the CV screening module at AED [Z]/month?
That gives you 30 hours/week back immediately, at a fraction of the full cost.
Once you see the ROI, you decide whether to expand. No pressure, no lock-in.`,
        effectiveness: 0.72,
      },
    ],
    counterObjections: [
      "Won't AI screening reduce candidate quality?",
      'What if we only hire for 2 months a year?',
      'Can we pay per hire instead of monthly?',
    ],
  },

  teamAdoption: {
    id: 'teamAdoption',
    objection: "Our team won't use a new system — they're comfortable with the current process",
    context: 'Typically from Operations Manager or HR head with 5+ years tenure. Fear of disruption to established workflows.',
    priority: 'high',
    responses: [
      {
        approach: 'Structured Onboarding Roadmap',
        script: `This is exactly why we have a dedicated change manager assigned to your account.
Here's what the first 30 days look like:
Week 1: 4 hours of training (not 40 — we know your team is busy)
Week 2: We run the process, your team observes and gives feedback
Week 3: Side-by-side — your team leads, we support
Week 4: Full handoff with your team fully confident
92% of teams prefer the new system by day 30. Want to hear from one of our clients directly?`,
        effectiveness: 0.92,
      },
      {
        approach: 'Time-Freedom Pitch',
        script: `Your team currently spends 30+ hours per week on CV screening and follow-up admin.
Our system cuts that to 2 hours of quality review per week.
That's 28 hours/week your team gets back — for actual hiring strategy and relationship-building.
When I explain this to HR teams, I've never had anyone say they want to keep doing the 30 hours.`,
        effectiveness: 0.88,
      },
    ],
    counterObjections: [
      "What if our team rejects it after the pilot?",
      'How long before the team is fully independent?',
    ],
  },

  atsIntegration: {
    id: 'atsIntegration',
    objection: 'Will this work with our existing ATS or HR system?',
    context: 'From IT Manager or HR Technology lead. Critical concern if they have a significant existing ATS investment.',
    priority: 'critical',
    responses: [
      {
        approach: 'Integration Roadmap',
        script: `Great question — integration is actually one of our core strengths.
We have pre-built connectors for: Workday (2-hour setup), SAP SuccessFactors (4-hour setup), BambooHR (1-hour setup), and LinkedIn Recruiter (automatic sync).
For custom or legacy systems, we build a bespoke API integration — 2-week timeline, included in the implementation fee.
What system are you currently using? I'll give you the exact integration specs.`,
        dataPoints: ['integration_time', 'supported_systems', 'custom_api_option'],
        effectiveness: 0.90,
      },
    ],
    counterObjections: [
      'Who maintains the integration if the ATS updates?',
      'What happens to historical data from our old system?',
    ],
  },

  wpsCompliance: {
    id: 'wpsCompliance',
    objection: "We can't risk payroll compliance — WPS errors cost us penalties",
    context: 'Critical for UAE companies. Finance Managers and HR leaders are extremely risk-averse on payroll compliance.',
    priority: 'critical',
    responses: [
      {
        approach: 'Compliance-First Architecture',
        script: `WPS compliance is built into the DNA of our system — it's not an add-on.
Our payroll module has been certified by the UAE Ministry of Human Resources.
Every payment run generates automatic WPS files in the correct format with validation before submission.
We've processed 50,000+ WPS-compliant payments with zero Ministry penalties. Zero.
I can share our compliance certification document right now if that helps.`,
        effectiveness: 0.95,
      },
    ],
    counterObjections: [
      'What if WPS regulations change next year?',
      'Do you handle multi-currency payroll for expat staff?',
    ],
  },

  proofOfConcept: {
    id: 'proofOfConcept',
    objection: "We've been burned before by ERP systems that didn't deliver. We need proof first.",
    context: 'Common with companies that had bad experiences with previous implementations. High emotional weight.',
    priority: 'high',
    responses: [
      {
        approach: 'Pilot with Guarantee',
        script: `I completely understand — and honestly, you should be skeptical. Any vendor that doesn't offer a pilot isn't confident in their product.
Here's what we propose: a 30-day pilot with 10–20 actual positions run through our system.
No long-term commitment. We agree on success metrics upfront — time-to-hire, quality rate, team adoption.
If we don't hit them, you owe us nothing and we give you a full debrief on what to look for next time.
That's how confident we are in the outcome.`,
        effectiveness: 0.87,
      },
      {
        approach: 'Reference Calls',
        script: `I hear you. Rather than me telling you it works, let me connect you with [SIMILAR UAE COMPANY].
They were in the same position 6 months ago. 20-minute call, completely candid — I won't be on it.
If they tell you it wasn't worth it, we part ways professionally. If they say it transformed their recruitment, we move forward.
When can I arrange that call?`,
        effectiveness: 0.82,
      },
    ],
  },

  timeline: {
    id: 'timeline',
    objection: '14 days is too good to be true. Our last implementation took 6 months.',
    context: 'Skepticism about speed claims. Usually from people who have managed ERP implementations before.',
    priority: 'medium',
    responses: [
      {
        approach: 'Scope Clarity',
        script: `That skepticism is healthy — and 100% valid for an ERP or infrastructure project.
The difference: we're not replacing your ERP. We're adding an AI layer that sits above your current process.
Day 1–3: Data import and system configuration
Day 4–7: First job requisitions processed (live, real candidates)
Day 8–14: Your team live and independent
It's fast because we're not rebuilding — we're augmenting. What would you need to see in day 1 to believe this?`,
        effectiveness: 0.80,
      },
    ],
  },
};

export function getObjectionById(id: string): Objection | undefined {
  return EIGER_MARVEL_OBJECTIONS[id];
}

export function detectObjectionType(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('cost') || lower.includes('price') || lower.includes('expensive') || lower.includes('budget')) return 'cost';
  if (lower.includes('team') || lower.includes('adoption') || lower.includes('use it') || lower.includes('change')) return 'teamAdoption';
  if (lower.includes('ats') || lower.includes('integrate') || lower.includes('system')) return 'atsIntegration';
  if (lower.includes('wps') || lower.includes('payroll') || lower.includes('compliance') || lower.includes('penalty')) return 'wpsCompliance';
  if (lower.includes('proof') || lower.includes('burned') || lower.includes('trust') || lower.includes('reference')) return 'proofOfConcept';
  if (lower.includes('14 days') || lower.includes('timeline') || lower.includes('too fast') || lower.includes('too good')) return 'timeline';
  return null;
}

export function getBestResponse(objectionId: string): ObjectionResponse | null {
  const objection = getObjectionById(objectionId);
  if (!objection) return null;
  return objection.responses.reduce((best, current) =>
    (current.effectiveness ?? 0) > (best.effectiveness ?? 0) ? current : best
  );
}
