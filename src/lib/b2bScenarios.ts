/**
 * B2B Scenario Scripts for EIGER MARVEL HR & SGC TECH AI
 * Realistic sales scenarios for training
 */

import type { CompanyType } from './companySelector';
import type { B2BPersonaType } from './b2bPersonas';

export interface B2BScenario {
  id: string;
  company: CompanyType;
  title: string;
  personaType: B2BPersonaType;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  objectives: string[];
  opener: string; // How prospect opens
  keyObjectionTypes: string[];
  successCriteria: string[];
  estimatedDuration: string; // e.g., "5-10 min"
}

// ============================================
// EIGER MARVEL HR Scenarios (HR Consultancy)
// ============================================

export const EIGER_MARVEL_HR_SCENARIOS: B2BScenario[] = [
  {
    id: 'em-hr-recruitment-automation',
    company: 'eiger-marvel-hr',
    title: 'Recruitment Automation Pitch',
    personaType: 'hr-manager', // Ali Asghar
    difficulty: 'medium',
    description: 'Pitch Odoo ERP recruitment module to Operations Manager dealing with Excel chaos',
    objectives: [
      'Highlight pain of manual candidate tracking',
      'Demo 14-day deployment guarantee',
      'Show WPS compliance automation',
      'Address UAE reference request'
    ],
    opener: "We're drowning in Excel sheets. Last month we lost 3 candidates because someone forgot to follow up. How can you help?",
    keyObjectionTypes: ['timeline', 'quality', 'competition'],
    successCriteria: [
      'Mention 14-day deployment at least twice',
      'Explain WPS compliance automation',
      'Provide at least 2 UAE references',
      'Handle "we tried ERP before" objection'
    ],
    estimatedDuration: '8-12 min'
  },
  {
    id: 'em-hr-payroll-compliance',
    company: 'eiger-marvel-hr',
    title: 'Payroll + WPS Compliance Demo',
    personaType: 'finance-decider', // Katherine
    difficulty: 'hard',
    description: 'Convince Finance Manager to automate payroll with WPS compliance to avoid penalties',
    objectives: [
      'Show ROI calculator (AED 40k monthly savings)',
      'Address 90-day payment terms request',
      'Provide money-back guarantee',
      'Detail total cost of ownership'
    ],
    opener: "We've paid AED 50k in WPS penalties this year alone. Before we talk features, show me the ROI. What's the total cost including training?",
    keyObjectionTypes: ['cost', 'timeline', 'authority'],
    successCriteria: [
      'Present clear ROI calculation',
      'Offer 90-day payment terms',
      'Provide money-back guarantee in writing',
      'Break down all costs transparently'
    ],
    estimatedDuration: '10-15 min'
  },
  {
    id: 'em-hr-modernization',
    company: 'eiger-marvel-hr',
    title: 'AI-Powered Recruitment Modernization',
    personaType: 'business-owner', // Hania Khan
    difficulty: 'easy',
    description: 'Show young HR team how AI can screen candidates faster and modernize their consultancy',
    objectives: [
      'Demo AI candidate screening',
      'Show mobile recruitment capabilities',
      'Address team adoption concerns',
      'Explain competitive advantage vs. larger firms'
    ],
    opener: "I'm excited about AI! Show me how this can help us screen candidates faster. But will my team actually use it? They're used to Excel.",
    keyObjectionTypes: ['information', 'busy'],
    successCriteria: [
      'Demo AI screening with example',
      'Show mobile app for on-the-go recruitment',
      'Address team adoption with training plan',
      'Explain how this helps win larger clients'
    ],
    estimatedDuration: '6-10 min'
  },
  {
    id: 'em-hr-14day-guarantee',
    company: 'eiger-marvel-hr',
    title: '14-Day Deployment Guarantee',
    personaType: 'hr-manager', // Ali Asghar
    difficulty: 'medium',
    description: 'Prove the 14-day deployment claim to a skeptical Operations Manager',
    objectives: [
      'Explain phased deployment approach',
      'Provide implementation timeline',
      'Show UAE client references',
      'Address disruption concerns'
    ],
    opener: "14 days sounds impossible. Our last ERP took 6 months and it still has bugs. How can you guarantee 14 days without disrupting our 50+ active placements?",
    keyObjectionTypes: ['timeline', 'quality', 'competition'],
    successCriteria: [
      'Present detailed 14-day timeline',
      'Explain phased approach (no downtime)',
      'Provide 3 UAE references with similar timeline',
      'Offer money-back if deadline missed'
    ],
    estimatedDuration: '8-12 min'
  }
];

// ============================================
// SGC TECH AI Scenarios (IT/Software)
// ============================================

export const SGC_TECH_AI_SCENARIOS: B2BScenario[] = [
  {
    id: 'sgc-ai-customer-support',
    company: 'sgc-tech-ai',
    title: 'AI Customer Support Automation',
    personaType: 'it-manager', // Technical Director
    difficulty: 'hard',
    description: 'Pitch AI-powered customer support automation to IT Manager handling 20+ client projects',
    objectives: [
      'Show API documentation',
      'Explain Kubernetes + Docker deployment',
      'Address production reliability concerns',
      'Demo POC within 2 weeks'
    ],
    opener: "I've evaluated 20+ AI solutions. Most can't handle production workloads. Show me your API docs and tell me about uptime SLA. What's your rate limit?",
    keyObjectionTypes: ['quality', 'information', 'competition'],
    successCriteria: [
      'Share comprehensive API documentation',
      'Explain Kubernetes architecture',
      'Provide 99.9% uptime SLA',
      'Offer 48-hour sandbox access for technical team'
    ],
    estimatedDuration: '12-18 min'
  },
  {
    id: 'sgc-ai-enterprise-deals',
    company: 'sgc-tech-ai',
    title: 'Winning Enterprise Deals with AI',
    personaType: 'business-owner', // CEO/Founder
    difficulty: 'medium',
    description: 'Convince CEO to use AI solutions to win enterprise clients and scale from AED 1.5M to AED 5M revenue',
    objectives: [
      'Present competitive advantage',
      'Show fast deployment capabilities',
      'Explain market differentiation',
      'Commit to revenue growth targets'
    ],
    opener: "We're stuck at AED 1.5M revenue. Our competitors are offering AI and winning enterprise deals. How fast can you deploy? I need to see a competitive edge in 6 months.",
    keyObjectionTypes: ['timeline', 'competition'],
    successCriteria: [
      'Present clear competitive advantage',
      'Commit to 2-week POC deployment',
      'Show enterprise-ready features',
      'Provide growth projection (1.5M → 5M in 2 years)'
    ],
    estimatedDuration: '10-15 min'
  },
  {
    id: 'sgc-ai-cicd-pipeline',
    company: 'sgc-tech-ai',
    title: 'CI/CD Pipeline Automation',
    personaType: 'it-manager', // Technical Director
    difficulty: 'hard',
    description: 'Sell CI/CD automation to IT Manager managing 20+ client projects with manual processes',
    objectives: [
      'Demo automated deployment pipeline',
      'Show monitoring dashboard',
      'Explain integration with existing AWS/Azure',
      'Provide training for technical team'
    ],
    opener: "We're managing 20+ client projects with manual deployment. It's chaos. How can you automate this? Show me the CI/CD pipeline architecture and monitoring tools.",
    keyObjectionTypes: ['quality', 'information'],
    successCriteria: [
      'Present CI/CD architecture diagram',
      'Demo monitoring dashboard with real-time metrics',
      'Explain AWS/Azure integration',
      'Provide hands-on training schedule'
    ],
    estimatedDuration: '12-18 min'
  },
  {
    id: 'sgc-ai-custom-ai-agents',
    company: 'sgc-tech-ai',
    title: 'Custom AI Agent Development',
    personaType: 'operations-manager', // Head of Operations
    difficulty: 'medium',
    description: 'Pitch reusable AI components and pilot program to Operations Manager struggling with custom code',
    objectives: [
      'Explain reusable component library',
      'Propose pilot program first',
      'Show delivery time reduction (3-6 months → 6-8 weeks)',
      'Address team learning curve'
    ],
    opener: "Every project is custom - no reuse, no efficiency. Our delivery takes 3-6 months. Can you build a reusable AI component library? I want a pilot program first with my team.",
    keyObjectionTypes: ['timeline', 'information', 'busy'],
    successCriteria: [
      'Present reusable component strategy',
      'Design pilot program (scope + timeline)',
      'Show delivery time reduction calculation',
      'Provide comprehensive training plan'
    ],
    estimatedDuration: '10-15 min'
  }
];

// ============================================
// Utility Functions
// ============================================

export function getScenariosForCompany(company: CompanyType): B2BScenario[] {
  return company === 'eiger-marvel-hr' 
    ? EIGER_MARVEL_HR_SCENARIOS 
    : SGC_TECH_AI_SCENARIOS;
}

export function getScenarioById(scenarioId: string): B2BScenario | undefined {
  const allScenarios = [...EIGER_MARVEL_HR_SCENARIOS, ...SGC_TECH_AI_SCENARIOS];
  return allScenarios.find(s => s.id === scenarioId);
}

export function getScenariosForPersona(
  company: CompanyType,
  personaType: B2BPersonaType
): B2BScenario[] {
  const scenarios = getScenariosForCompany(company);
  return scenarios.filter(s => s.personaType === personaType);
}

// Export all scenarios
export const ALL_B2B_SCENARIOS = [...EIGER_MARVEL_HR_SCENARIOS, ...SGC_TECH_AI_SCENARIOS];

export default ALL_B2B_SCENARIOS;
