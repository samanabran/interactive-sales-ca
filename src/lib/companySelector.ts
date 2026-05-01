/**
 * Company Selector - Choose training focus
 * EIGER MARVEL HR (HR Consultancy/Recruitment)
 * SGC TECH AI (IT/Software/AI Company)
 */

export type CompanyType = 'eiger-marvel-hr' | 'sgc-tech-ai';

export interface CompanyProfile {
  id: CompanyType;
  name: string;
  domain: string;
  website: string;
  description: string;
  industry: string;
  location: string;
  targetClients: string[];
  painPoints: string[];
  solutions: string[];
  color: string; // UI theme color
  icon: string; // Emoji icon
}

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: 'eiger-marvel-hr',
    name: 'EIGER MARVEL HR',
    domain: 'HR Consultancy & Recruitment',
    website: 'eigermarvelhr.com',
    description: 'End-to-end workforce solutions - recruitment, payroll, WPS compliance, ERP implementation',
    industry: 'HR Consultancy, Recruitment, Payroll Processing',
    location: 'Dubai, UAE',
    targetClients: [
      'SMEs with 20-100 employees',
      'Construction companies',
      'Hospitality businesses',
      'Retail chains',
      'Professional services firms'
    ],
    painPoints: [
      'Recruitment data scattered across Excel sheets',
      'Payroll errors causing WPS compliance penalties',
      'Client onboarding takes 2-3 weeks manually',
      'Cannot scale beyond 13 staff with current manual processes'
    ],
    solutions: [
      'Odoo ERP with recruitment module',
      'Payroll + WPS compliance automation',
      'Client portal for job posting and candidate tracking',
      '14-day deployment guarantee'
    ],
    color: '#3B82F6', // Blue
    icon: '🇦🇪'
  },
  {
    id: 'sgc-tech-ai',
    name: 'SGC TECH AI',
    domain: 'IT Services & AI Solutions',
    website: 'sgctech.ai',
    description: 'AI-powered Odoo ERP, IT infrastructure management, custom software development',
    industry: 'IT Services, Software Development, AI Solutions',
    location: 'Dubai, UAE',
    targetClients: [
      'SMEs needing IT infrastructure',
      'Companies wanting AI automation',
      'Businesses scaling from 20-100 employees',
      'Organizations needing custom software'
    ],
    painPoints: [
      'Managing 20+ client projects with manual deployment processes',
      'Customer support overwhelmed with repetitive queries',
      'No centralized monitoring for all client systems',
      'Security audits failing due to manual processes'
    ],
    solutions: [
      'AI-powered customer support automation',
      'CI/CD pipeline automation with monitoring',
      'Cloud-native infrastructure (Kubernetes, Docker)',
      'Production-ready AI with API documentation'
    ],
    color: '#10B981', // Green
    icon: '🤖'
  }
];

/**
 * Get company profile by ID
 */
export function getCompanyProfile(companyId: CompanyType): CompanyProfile {
  return COMPANY_PROFILES.find(c => c.id === companyId) || COMPANY_PROFILES[0];
}

/**
 * Get B2B personas for selected company
 */
export function getPersonasForCompany(companyId: CompanyType): string[] {
  switch (companyId) {
    case 'eiger-marvel-hr':
      return ['hr-manager', 'business-owner', 'finance-decider'];
    case 'sgc-tech-ai':
      return ['it-manager', 'business-owner', 'operations-manager'];
    default:
      return ['hr-manager', 'business-owner'];
  }
}

/**
 * Get training scenarios for company
 */
export function getTrainingScenarios(companyId: CompanyType): string[] {
  switch (companyId) {
    case 'eiger-marvel-hr':
      return [
        'Recruitment automation pitch',
        'Payroll + WPS compliance demo',
        'Client portal walkthrough',
        '14-day deployment guarantee',
        'ROI calculator for HR consultancy'
      ];
    case 'sgc-tech-ai':
      return [
        'AI customer support automation',
        'CI/CD pipeline automation',
        'Cloud-native infrastructure pitch',
        'Custom AI agent development',
        'Production AI reliability demo'
      ];
    default:
      return [];
  }
}

export default COMPANY_PROFILES;
