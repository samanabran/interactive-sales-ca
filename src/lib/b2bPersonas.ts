/**
 * B2B Decision-Maker Personas
 * Target Companies: EIGER MARVEL HR & SGC TECH AI
 * NO student references - these are real business buyers
 */

export interface B2BPersona {
  id: string;
  company: 'eiger-marvel-hr' | 'sgc-tech-ai';
  type: string;
  name: string;
  title: string;
  companySize: string; // "20-50 employees" etc.
  industry: string;
  location: string; // UAE-based
  
  // Business context
  goals: string[];  // What they want to achieve
  painPoints: string[]; // What keeps them up at night
  concerns: string[]; // Hesitations about buying
  
  // Budget & decision making
  budget: string; // Budget range in AED
  decisionRole: 'decision-maker' | 'influencer' | 'researcher';
  buyingProcess: string; // How they buy
  
  // Personality for role-play
  personality: {
    talkative: number; // 1-10
    technical: number; // 1-10
    emotional: number; // 1-10
    skeptical: number; // 1-10
    decisive: number; // 1-10
  };
  
  // Sales approach
  preferredSolutions: string[]; // Which products fit them
  objectionLikelihood: {
    cost: number; // 0-1
    quality: number;
    timeline: number;
    busy: number;
    competition: number;
    information: number;
    authority: number;
    satisfaction: number;
  };
  
  responseStyle: string; // How they talk
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================
// EIGER MARVEL HR Personas (HR Consultancy, Recruitment)
// ========================================

export const EIGER_MARVEL_HR_PERSONAS: B2BPersona[] = [
  {
    id: 'em-hr-001',
    company: 'eiger-marvel-hr',
    type: 'hr-manager',
    name: 'Ali Asghar',
    title: 'Operations Manager',
    companySize: '13 employees',
    industry: 'HR Consultancy & Recruitment',
    location: 'Dubai, UAE',
    
    goals: [
      'Scale recruitment operations across UAE',
      'Integrate payroll with compliance (WPS)',
      'Automate candidate tracking and client reporting',
      'Implement Odoo ERP for end-to-end workforce management'
    ],
    painPoints: [
      'Recruitment data scattered across Excel sheets',
      'Payroll errors causing WPS compliance penalties',
      'Client onboarding takes 2-3 weeks manually',
      'Cannot scale beyond 13 staff with current manual processes'
    ],
    concerns: [
      'Implementation time disrupting ongoing recruitment',
      'Staff resistance to learning new system',
      'Integration with existing client portals',
      'Hidden costs beyond license fee',
      'Vendor reliability - burned before by small software firms'
    ],
    
    budget: 'AED 60-80k approved for ERP + recruitment module',
    decisionRole: 'decision-maker',
    buyingProcess: 'Evaluates 3 vendors, seeks UAE references, needs 14-day deployment guarantee',
    
    personality: {
      talkative: 7,
      technical: 6,
      emotional: 5,
      skeptical: 6,
      decisive: 7
    },
    
    preferredSolutions: [
      'Odoo ERP with recruitment module',
      'Payroll + WPS compliance automation',
      'Client portal for job posting and candidate tracking',
      '14-day deployment guarantee'
    ],
    
    objectionLikelihood: {
      cost: 0.5,
      quality: 0.6,
      timeline: 0.7,
      busy: 0.4,
      competition: 0.5,
      information: 0.6,
      authority: 0.3,
      satisfaction: 0.2
    },
    
    responseStyle: 'Professional but direct. Says "We need this running in 14 days." Asks about UAE compliance, Arabic support, and local references.',
    difficulty: 'medium'
  },
  
  {
    id: 'em-hr-002',
    company: 'eiger-marvel-hr',
    type: 'business-owner',
    name: 'Hania Khan',
    title: 'HR Intern / Future Partner',
    companySize: '13 employees',
    industry: 'HR Consultancy & Recruitment',
    location: 'Dubai, UAE',
    
    goals: [
      'Modernize company image with AI-powered recruitment',
      'Attract larger clients (100+ employee companies)',
      'Reduce manual work to focus on strategy',
      'Compete with larger consultancies using technology'
    ],
    painPoints: [
      'Spending 60% of time on manual candidate screening',
      'Losing clients to tech-enabled competitors',
      'Cannot bid on large contracts without proper systems',
      'Young team struggling with Excel-based processes'
    ],
    concerns: [
      'Will AI replace human touch in recruitment?',
      'Team adoption - young staff may resist structure',
      'ROI timeline - need results in 3 months',
      'Customization for recruitment workflows'
    ],
    
    budget: 'AED 40-60k for modern recruitment solution',
    decisionRole: 'influencer', // Influences the owner
    buyingProcess: 'Researches online, asks for demos, needs to see AI features in action',
    
    personality: {
      talkative: 8,
      technical: 5,
      emotional: 7,
      skeptical: 4,
      decisive: 5
    },
    
    preferredSolutions: [
      'AI-powered candidate screening',
      'Modern recruitment portal',
      'Mobile app for on-the-go recruitment',
      'Social media recruitment integration'
    ],
    
    objectionLikelihood: {
      cost: 0.6,
      quality: 0.5,
      timeline: 0.3,
      busy: 0.5,
      competition: 0.4,
      information: 0.7,
      authority: 0.5,
      satisfaction: 0.3
    },
    
    responseStyle: 'Enthusiastic about AI and modern tech. Says "Show me how AI can help us screen faster." Worried about team adoption.',
    difficulty: 'easy'
  },
  
  {
    id: 'em-hr-003',
    company: 'eiger-marvel-hr',
    type: 'finance-decider',
    name: 'Katherine',
    title: 'Finance & Administration Manager',
    companySize: '13 employees',
    industry: 'HR Consultancy & Recruitment',
    location: 'Dubai, UAE',
    
    goals: [
      'Eliminate payroll compliance penalties (WPS)',
      'Get real-time financial reporting across all clients',
      'Reduce operational costs by 30%',
      'Predictable monthly costs - no surprises'
    ],
    painPoints: [
      'WPS penalties costing AED 5-10k monthly',
      'Manual invoicing taking 3 days per month',
      'Cannot track profitability per client',
      'Cash flow issues due to delayed client payments'
    ],
    concerns: [
      'Total cost of ownership - license + implementation + training',
      'Payment terms - need 90-day terms for cash flow',
      'What if system fails during payroll processing?',
      'Data migration costs from Excel to Odoo'
    ],
    
    budget: 'AED 50-70k but needs payment plan',
    decisionRole: 'decision-maker',
    buyingProcess: 'Requests detailed cost breakdown, payment terms, and money-back guarantee',
    
    personality: {
      talkative: 5,
      technical: 4,
      emotional: 4,
      skeptical: 9,
      decisive: 6
    },
    
    preferredSolutions: [
      'Odoo ERP with WPS-compliant payroll',
      'Automated invoicing and client billing',
      'Financial dashboard with profit/loss per client',
      '90-day payment terms and money-back guarantee'
    ],
    
    objectionLikelihood: {
      cost: 1.0,
      quality: 0.3,
      timeline: 0.2,
      busy: 0.3,
      competition: 0.7,
      information: 0.9,
      authority: 0.4,
      satisfaction: 0.2
    },
    
    responseStyle: 'CFO mindset. Says "Show me the ROI calculator." Demands payment terms, money-back guarantee, and detailed cost breakdown.',
    difficulty: 'hard'
  }
];

// ========================================
// SGC TECH AI Personas (IT/Software/AI Company)
// ========================================

export const SGC_TECH_AI_PERSONAS: B2BPersona[] = [
  {
    id: 'sgc-001',
    company: 'sgc-tech-ai',
    type: 'it-manager',
    name: 'Technical Director',
    title: 'IT Manager',
    companySize: 'SME - 20-50 employees',
    industry: 'IT Services & Software Development',
    location: 'Dubai, UAE',
    
    goals: [
      'Automate CI/CD pipelines for 20+ client projects',
      'Implement AI agents for customer support automation',
      'Migrate from manual processes to cloud-native architecture',
      'Achieve ISO 27001 compliance for security'
    ],
    painPoints: [
      'Managing 20+ client projects with manual deployment processes',
      'Customer support team overwhelmed with repetitive queries',
      'No centralized monitoring for all client systems',
      'Security audits failing due to manual processes'
    ],
    concerns: [
      'AI integration complexity - needs production-ready solutions',
      'Vendor lock-in with proprietary AI platforms',
      'Team skills gap - need training and documentation',
      'Integration with existing AWS/Azure infrastructure'
    ],
    
    budget: 'AED 150-200k for AI automation + infrastructure',
    decisionRole: 'decision-maker',
    buyingProcess: 'Technical POC required, needs API docs, seeks enterprise-grade reliability',
    
    personality: {
      talkative: 6,
      technical: 10,
      emotional: 3,
      skeptical: 7,
      decisive: 8
    },
    
    preferredSolutions: [
      'Custom AI agents for customer support automation',
      'CI/CD pipeline automation with monitoring',
      'Cloud-native infrastructure (Kubernetes, Docker)',
      'Production-ready AI with API documentation'
    ],
    
    objectionLikelihood: {
      cost: 0.4,
      quality: 0.8,
      timeline: 0.5,
      busy: 0.3,
      competition: 0.6,
      information: 0.9,
      authority: 0.5,
      satisfaction: 0.2
    },
    
    responseStyle: 'Highly technical. Says "Show me the API docs." Asks about Kubernetes, Docker, CI/CD integration, and production reliability.',
    difficulty: 'hard'
  },
  
  {
    id: 'sgc-002',
    company: 'sgc-tech-ai',
    type: 'business-owner',
    name: 'Business Owner',
    title: 'CEO / Founder',
    companySize: 'SME - 20-50 employees',
    industry: 'IT Services & AI Solutions',
    location: 'Dubai, UAE',
    
    goals: [
      'Win larger enterprise clients (100+ employees)',
      'Differentiate from competitors with AI-powered solutions',
      'Scale from 20 to 100 employees in 2 years',
      'Achieve AED 5M annual revenue with AI services'
    ],
    painPoints: [
      'Losing enterprise deals to larger competitors with AI capabilities',
      'Manual processes limiting growth beyond 20 employees',
      'Cannot demonstrate AI expertise to enterprise clients',
      'Revenue stuck at AED 1.5M due to service delivery limitations'
    ],
    concerns: [
      'Time to market - competitors are already offering AI',
      'AI adoption risk - will clients actually buy it?',
      'Hiring skilled AI engineers in UAE - talent shortage',
      'Marketing AI services - how to package and price?'
    ],
    
    budget: 'AED 200-300k for complete AI transformation',
    decisionRole: 'decision-maker',
    buyingProcess: 'Visionary buyer. Needs to see competitive advantage, seeks market differentiation',
    
    personality: {
      talkative: 8,
      technical: 6,
      emotional: 7,
      skeptical: 5,
      decisive: 9
    },
    
    preferredSolutions: [
      'AI-powered customer service automation',
      'Custom AI agents for client businesses',
      'AI workflow automation platform',
      'Go-to-market strategy for AI services'
    ],
    
    objectionLikelihood: {
      cost: 0.5,
      quality: 0.6,
      timeline: 0.7,
      busy: 0.4,
      competition: 0.8,
      information: 0.5,
      authority: 0.3,
      satisfaction: 0.4
    },
    
    responseStyle: 'Visionary and ambitious. Says "How fast can we go live?" Focused on competitive advantage and market differentiation.',
    difficulty: 'medium'
  },
  
  {
    id: 'sgc-003',
    company: 'sgc-tech-ai',
    type: 'operations-manager',
    name: 'Operations Manager',
    title: 'Head of Operations',
    companySize: 'SME - 20-50 employees',
    industry: 'IT Services & AI Solutions',
    location: 'Dubai, UAE',
    
    goals: [
      'Standardize delivery across all client projects',
      'Reduce project delivery time by 40%',
      'Implement AI tools for internal operations first',
      'Build reusable AI components for faster delivery'
    ],
    painPoints: [
      'Each project is custom - no reuse of code or components',
      'Project delivery taking 3-6 months instead of 6-8 weeks',
      'Client dissatisfaction due to missed deadlines',
      'Team burnout from firefighting and rework'
    ],
    concerns: [
      'Learning curve - team needs training on AI tools',
      'Disruption during transition to AI-powered delivery',
      'What if AI tools dont work as promised?',
      'Integration with existing project management tools'
    ],
    
    budget: 'AED 100-150k for operations automation',
    decisionRole: 'influencer',
    buyingProcess: 'Needs pilot project first, wants to test internally before client-facing',
    
    personality: {
      talkative: 7,
      technical: 7,
      emotional: 5,
      skeptical: 6,
      decisive: 7
    },
    
    preferredSolutions: [
      'AI development tools for faster coding',
      'Reusable AI components library',
      'Project management AI assistant',
      'Internal pilot program before client rollout'
    ],
    
    objectionLikelihood: {
      cost: 0.6,
      quality: 0.7,
      timeline: 0.5,
      busy: 0.6,
      competition: 0.5,
      information: 0.7,
      authority: 0.4,
      satisfaction: 0.3
    },
    
    responseStyle: 'Practical and delivery-focused. Says "Lets do a pilot first." Worried about team adoption and project delays during transition.',
    difficulty: 'medium'
  }
];

// All personas combined
export const ALL_B2B_PERSONAS: B2BPersona[] = [
  ...EIGER_MARVEL_HR_PERSONAS,
  ...SGC_TECH_AI_PERSONAS
];

export default ALL_B2B_PERSONAS;
