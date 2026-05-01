// SGC TECH AI — Company-Specific Objection Library
// Based on real UAE enterprise IT/AI sales scenarios

export interface TechObjectionResponse {
  approach: string;
  script: string;
  technicalDetails?: string[];
  effectiveness?: number; // 0–1 success rate
}

export interface TechObjection {
  id: string;
  objection: string;
  context: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responses: TechObjectionResponse[];
  counterObjections?: string[];
}

export const SDC_TECH_AI_OBJECTIONS: Record<string, TechObjection> = {
  trackRecord: {
    id: 'trackRecord',
    objection: 'You have no UAE enterprise clients in our industry as references',
    context: 'From IT Manager or CTO. High skepticism about ability to deliver at enterprise scale. Common in financial services and government sectors.',
    priority: 'critical',
    responses: [
      {
        approach: 'UAE Expertise + Regional Track Record',
        script: `You're right to ask for proof, and I respect that.
Here's our regional track record: 23 ERP AI implementations across UAE and GCC, 8 in financial services.
Unlike global vendors, we're built for UAE: Arabic UI, WPS compliance, DIFC data residency requirements.
I'll share a case study from a Dubai-based bank with similar transaction volume — anonymized if needed.
And we back it with a 6-month implementation guarantee with financial penalties if we miss KPIs.
No other vendor in this market does that. When can I introduce you to our technical lead?`,
        technicalDetails: ['DIFC data residency', 'Arabic UI support', 'WPS integration', 'UAE Labour Law compliance'],
        effectiveness: 0.82,
      },
      {
        approach: 'Technical Validation First',
        script: `Rather than taking my word for it, let me offer something more concrete:
A 48-hour sandbox access for your technical team to test every API endpoint.
Real load testing — put our system through your peak transaction volume.
Your team writes the test cases. We execute. You evaluate.
If we fail a single critical test, we acknowledge it and propose a solution before asking for any commitment.`,
        effectiveness: 0.88,
      },
    ],
    counterObjections: [
      "What's your SLA for system failures?",
      'How do you handle data sovereignty requirements?',
    ],
  },

  transactionVolume: {
    id: 'transactionVolume',
    objection: "Your system has never handled our transaction volume at our scale",
    context: 'Technical objection from IT Manager or CTO focused on performance at scale. Often in enterprise banking or telecoms.',
    priority: 'critical',
    responses: [
      {
        approach: 'Performance Benchmarking',
        script: `Let me be specific about our architecture:
Our AI layer processes 2M+ transactions per hour in a UAE financial services client.
It's built on Kubernetes with auto-scaling — meaning it scales horizontally with your peak load automatically.
I'll share our benchmark report: response time, throughput, and error rates at 10x your stated volume.
Better yet — let's run a live load test in our environment with your test data.
What's your peak transactions-per-second requirement?`,
        technicalDetails: ['Kubernetes auto-scaling', 'Horizontal pod autoscaling', 'Load testing documentation', 'API rate limit specifications'],
        effectiveness: 0.85,
      },
    ],
    counterObjections: [
      'What happens to our data during the load test?',
      'Can we see real-time monitoring dashboards?',
    ],
  },

  implementationRisk: {
    id: 'implementationRisk',
    objection: 'Implementation risk is too high — we cannot afford any production disruption',
    context: 'Critical concern for IT teams managing mission-critical systems. Triggered by any mention of integration or changes to production.',
    priority: 'critical',
    responses: [
      {
        approach: 'Zero-Risk PoC Architecture',
        script: `I understand completely — this is why our PoC methodology was designed by a team that came from banking.
Here is exactly what happens:
1. We never touch production — we mirror your environment in isolated infrastructure
2. We use anonymized data copies, never live customer data
3. You maintain full rollback capability at every stage
4. Every change requires your IT team's explicit written approval
5. If Day 15 metrics aren't on track, we pause — not you.
You're in the driver's seat throughout. We provide the engine.`,
        technicalDetails: ['Production isolation', 'Data anonymization', 'Rollback procedures', 'Change approval process'],
        effectiveness: 0.90,
      },
      {
        approach: 'Phased Deployment',
        script: `No good enterprise implementation goes from zero to full in one step.
Our approach: Phase 1 is one module, read-only integration, zero write access to production.
Phase 2 adds write access to that one module only, with dual-approval gates.
Phase 3 expands to additional modules, with Phase 2 fully validated and stable.
You never have more than one module in transition at any time.
That's how we eliminate implementation risk structurally.`,
        effectiveness: 0.86,
      },
    ],
  },

  slaRequirements: {
    id: 'slaRequirements',
    objection: 'We need a 6-month SLA with financial penalties for any failures',
    context: 'Procurement and legal requirement. Usually driven by internal IT governance or previous vendor failures.',
    priority: 'high',
    responses: [
      {
        approach: 'SLA Acceptance + Differentiation',
        script: `We don't just accept a 6-month SLA — we propose it.
Our standard enterprise contract includes: 99.99% uptime SLA with financial credits if missed.
Response time commitments: Critical issues resolved within 4 hours, major within 24 hours.
Financial penalties: AED [X] per hour of downtime beyond SLA thresholds.
We're one of the few vendors in UAE tech that actively proposes penalty clauses because our uptime record makes it low-risk for us.
I'll have our legal team send the standard SLA template for your review today.`,
        effectiveness: 0.88,
      },
    ],
    counterObjections: [
      'What counts as "downtime" under your SLA?',
      'How are penalties calculated for partial outages?',
    ],
  },

  securityCompliance: {
    id: 'securityCompliance',
    objection: 'We need ISO 27001 certification and proof of data security standards',
    context: 'Standard enterprise security requirement. Often from IT Security Manager or compliance team.',
    priority: 'high',
    responses: [
      {
        approach: 'Compliance Documentation',
        script: `We hold ISO 27001:2022 certification — I'll send the certificate immediately.
Beyond that: SOC 2 Type II completed in Q1, DIFC data residency compliance documented, and annual penetration testing by third-party security firm.
For UAE-specific requirements: all data is processed and stored within UAE borders, full audit logs with 7-year retention.
Want me to schedule a 1-hour security review with our Chief Security Officer and your IT Security team?`,
        technicalDetails: ['ISO 27001:2022', 'SOC 2 Type II', 'DIFC compliance', 'UAE data residency', 'Annual pen testing'],
        effectiveness: 0.87,
      },
    ],
  },

  vendorLockIn: {
    id: 'vendorLockIn',
    objection: "We don't want to be locked into a vendor — what's our exit strategy?",
    context: 'Strategic concern from CTO or Procurement. Common after previous vendor lock-in experiences.',
    priority: 'medium',
    responses: [
      {
        approach: 'Open Architecture + Data Portability',
        script: `Vendor lock-in is a legitimate concern and one we designed our architecture to prevent.
Three reasons you're never locked in:
1. Open APIs: all data is accessible via standard REST APIs you control
2. Data portability: full export in standard formats (JSON, CSV, direct DB dump) at any time
3. Documentation: full technical documentation for every integration — your team can maintain it without us
If you leave, you take everything with you. We believe in earning your business every quarter, not trapping you.`,
        effectiveness: 0.84,
      },
    ],
  },

  aiQuality: {
    id: 'aiQuality',
    objection: "AI demos look great but fail in production — we've seen this before",
    context: 'Deep skepticism from experienced IT Managers who have evaluated many AI vendors. High bar for technical proof.',
    priority: 'high',
    responses: [
      {
        approach: 'Production Evidence',
        script: `That skepticism is completely earned — most AI demos are optimized for demos, not production.
Here's how we're different: I'll give you direct access to a client's production monitoring dashboard (anonymized).
Real API response times. Real error rates. Real edge case handling. Not a curated demo.
I'll also share our incident log from the past 12 months — including the 3 issues we had and exactly how we resolved them.
If a vendor won't show you their incident log, they're hiding something.`,
        technicalDetails: ['Production monitoring access', 'Real API metrics', 'Incident log transparency', 'Edge case documentation'],
        effectiveness: 0.89,
      },
      {
        approach: 'Your Data, Your Test',
        script: `Rather than showing you our use cases, let's test with your actual data.
Anonymize 10,000 of your real transactions. We'll run them through our AI in a sandbox environment.
You define the test cases. You evaluate the output. You decide if it meets your standard.
If it doesn't, we either fix it or we tell you it's not the right fit — honestly, before you spend any money.`,
        effectiveness: 0.91,
      },
    ],
    counterObjections: [
      'How do you handle AI model drift over time?',
      'What retraining is required as our data evolves?',
    ],
  },
};

export function getTechObjectionById(id: string): TechObjection | undefined {
  return SDC_TECH_AI_OBJECTIONS[id];
}

export function detectTechObjectionType(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('reference') || lower.includes('client') || lower.includes('track record') || lower.includes('proof')) return 'trackRecord';
  if (lower.includes('volume') || lower.includes('scale') || lower.includes('transaction') || lower.includes('load')) return 'transactionVolume';
  if (lower.includes('risk') || lower.includes('disruption') || lower.includes('production') || lower.includes('downtime')) return 'implementationRisk';
  if (lower.includes('sla') || lower.includes('penalty') || lower.includes('guarantee') || lower.includes('contract')) return 'slaRequirements';
  if (lower.includes('iso') || lower.includes('security') || lower.includes('compliance') || lower.includes('certification')) return 'securityCompliance';
  if (lower.includes('lock') || lower.includes('vendor') || lower.includes('exit') || lower.includes('migrate')) return 'vendorLockIn';
  if (lower.includes('ai') && (lower.includes('fail') || lower.includes("doesn't work") || lower.includes('seen before') || lower.includes('demo'))) return 'aiQuality';
  return null;
}

export function getTechBestResponse(objectionId: string): TechObjectionResponse | null {
  const objection = getTechObjectionById(objectionId);
  if (!objection) return null;
  return objection.responses.reduce((best, current) =>
    (current.effectiveness ?? 0) > (best.effectiveness ?? 0) ? current : best
  );
}
