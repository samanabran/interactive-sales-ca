// AI Role-Play Service - B2B Sales Training
// Companies: EIGER MARVEL HR (HR Consultancy) & SGC TECH AI (IT/Software)
// NO student personas - these are real B2B decision-makers

import {
  type B2BPersona,
  type B2BPersonaType,
  EIGER_MARVEL_HR_PERSONAS,
  SGC_TECH_AI_PERSONAS,
  ALL_B2B_PERSONAS
} from './b2bPersonas';
import { CompanyType } from './companySelector';

export type { B2BPersonaType } from './b2bPersonas';

// ============================================
// Persona lookup by company
// ============================================

export function getPersonaByType(
  company: CompanyType,
  personaType: B2BPersonaType
): B2BPersona | undefined {
  const personas = company === 'eiger-marvel-hr' 
    ? EIGER_MARVEL_HR_PERSONAS 
    : SGC_TECH_AI_PERSONAS;
  
  return personas.find(p => p.type === personaType);
}

export function getPersonasForCompany(company: CompanyType): B2BPersona[] {
  return company === 'eiger-marvel-hr' 
    ? EIGER_MARVEL_HR_PERSONAS 
    : SGC_TECH_AI_PERSONAS;
}

// ============================================
// Response generation for B2B role-play
// ============================================

export interface AIMessage {
  id: string;
  role: 'user' | 'prospect' | 'system';
  content: string;
  timestamp: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  objectionRaised?: string;
}

export interface ConversationContext {
  company: CompanyType;
  personaType: B2BPersonaType;
  messages: AIMessage[];
  currentGoal: string;
  objectionsHandled: string[];
  talkativeLevel: number;
  emotionalLevel: number;
  skepticalLevel: number;
}

/**
 * Generate realistic B2B prospect response
 */
export async function generateProspectResponse(
  context: ConversationContext,
  userMessage: string
): Promise<string> {
  
  const persona = getPersonaByType(context.company, context.personaType);
  if (!persona) {
    return "I'm not sure I understand. Can you tell me more about your solution?";
  }
  
  // Generate response based on persona
  const response = generateB2BResponse(persona, userMessage);

  return applyTalkativeStyle(response, persona.personality.talkative);
}

/**
 * Core B2B response generation logic
 */
function generateB2BResponse(
  persona: B2BPersona,
  userMessage: string
): string {
  
  const message = userMessage.toLowerCase();
  
  // ===== COST OBJECTIONS =====
  if (message.includes('cost') || message.includes('price') || message.includes('budget')) {
    if (persona.objectionLikelihood.cost > 0.6) {
      return generateCostObjection(persona);
    }
  }
  
  // ===== TIMELINE/IMPLEMENTATION =====
  if (message.includes('time') || message.includes('long') || message.includes('deploy')) {
    if (persona.objectionLikelihood.timeline > 0.5) {
      return generateTimelineObjection(persona);
    }
  }
  
  // ===== QUALITY/COMPETENCE =====
  if (message.includes('quality') || message.includes('proof') || message.includes('reference')) {
    if (persona.objectionLikelihood.quality > 0.5) {
      return generateQualityObjection(persona);
    }
  }
  
  // ===== COMPETITION =====
  if (message.includes('competitor') || message.includes('sap') || message.includes('oracle')) {
    if (persona.objectionLikelihood.competition > 0.6) {
      return generateCompetitionObjection(persona);
    }
  }
  
  // ===== POSITIVE RESPONSES =====
  if (message.includes('roi') || message.includes('save') || message.includes('benefit')) {
    return generatePositiveResponse(persona);
  }
  
  // ===== DEFAULT PERSONA RESPONSE =====
  return generatePersonaDefaultResponse(persona);
}

function applyTalkativeStyle(text: string, talkativeLevel: number): string {
  if (talkativeLevel >= 8 && !text.includes('...')) {
    return text.replace('. ', '... ');
  }

  if (talkativeLevel >= 6 && !text.toLowerCase().startsWith('well,')) {
    return `Well, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  }

  return text;
}

// ============================================
// B2B Objection Handlers
// ============================================

function generateCostObjection(persona: B2BPersona): string {
  const responses: Record<string, string[]> = {
    'eiger-marvel-hr': [
      `Look, we're a 13-person consultancy. Our budget is AED ${persona.budget}. Can you do payment terms? We've been burned before by hidden costs.`,
      `AED ${persona.budget.split('-')[1] || '80k'} is our max. What's the total cost of ownership? License, implementation, training, support - I need the full breakdown.`,
      `We don't have budget right now for a full system. Do you have a phased approach? Maybe start with recruitment module only?`
    ],
    'sgc-tech-ai': [
      `AED ${persona.budget} is approved, but I need to see the ROI calculator first. How long until we break even? Show me the numbers.`,
      `We're looking at 3 vendors. Your price needs to be competitive. What's the total cost including AI training and API documentation?`,
      `Budget isn't the issue - it's value. Can you guarantee AED 200k additional revenue within 6 months of using your AI agents?`
    ]
  };
  
  const options = responses[persona.company] || responses['eiger-marvel-hr'];
  return options[Math.floor(Math.random() * options.length)];
}

function generateTimelineObjection(persona: B2BPersona): string {
  const responses: Record<string, string[]> = {
    'eiger-marvel-hr': [
      `You say 14 days, but our last ERP took 6 months. How can you guarantee 14-day deployment? What if something goes wrong?`,
      `We can't afford disruption. Our recruitment is running 50+ placements right now. Can you do a phased rollout without stopping operations?`,
      `14 days sounds too good to be true. What's the catch? Will the system be stable? Can we get a money-back guarantee?`
    ],
    'sgc-tech-ai': [
      `Our clients can't wait 3 months for AI automation. Can you show me a working POC within 2 weeks?`,
      `We need to win 3 enterprise deals by Q3. How fast can you deploy AI customer support? I need production-ready, not beta.`,
      `Timeline is critical. SAP takes 6 months, Microsoft takes 4. You say 14 days - prove it with a demo deployment.`
    ]
  };
  
  const options = responses[persona.company] || responses['eiger-marvel-hr'];
  return options[Math.floor(Math.random() * options.length)];
}

function generateQualityObjection(persona: B2BPersona): string {
  const responses: Record<string, string[]> = {
    'eiger-marvel-hr': [
      `We tried an ERP before - it was too complex, our staff couldn't use it. What makes yours different? Give me 3 UAE references I can call.`,
      `I need proof. Show me a case study of a similar HR consultancy that went live in 14 days. Who else in Dubai is using this?`,
      `Our last vendor disappeared after implementation. How do I know you'll be here in 2 years? What's your support SLA?`
    ],
    'sgc-tech-ai': [
      `I've seen 20+ AI demos. Most can't handle production workloads. Show me your API docs, tell me about rate limits, data encryption standards.`,
      `We need enterprise-grade reliability. Can your AI handle 100k+ transactions daily? What's your uptime SLA? Show me your ISO 27001 certification.`,
      `Talk is cheap. Give me access to a sandbox environment for 48 hours. I want my technical team to test every API endpoint.`
    ]
  };
  
  const options = responses[persona.company] || responses['eiger-marvel-hr'];
  return options[Math.floor(Math.random() * options.length)];
}

function generateCompetitionObjection(persona: B2BPersona): string {
  const responses: Record<string, string[]> = {
    'eiger-marvel-hr': [
      `We're also talking to a larger consultancy that uses SAP. They've been in UAE for 20 years. Why should we choose you over them?`,
      `Microsoft Dynamics offered us a similar package for AED 20k less. What's your differentiator? Why pay more for Odoo?`
    ],
    'sgc-tech-ai': [
      `We're evaluating SAP, Oracle, and Microsoft's AI stack. Why should we build on Odoo instead? Convince me technically.`,
      `I have proposals from 3 AI companies. Yours is the most expensive. What am I getting extra for the premium price?`
    ]
  };
  
  const options = responses[persona.company] || responses['eiger-marvel-hr'];
  return options[Math.floor(Math.random() * options.length)];
}

function generatePositiveResponse(persona: B2BPersona): string {
  const responses: Record<string, string[]> = {
    'eiger-marvel-hr': [
      `Okay, AED ${persona.budget} for 14-day deployment with WPS compliance - that's interesting. How do we start? I want to see the recruitment module demo.`,
      `If you can really eliminate our payroll penalties and automate candidate tracking, that's AED 40k savings monthly. Let's discuss payment terms.`
    ],
    'sgc-tech-ai': [
      `AI-powered customer support could save us 200 hours monthly. If your POC works, we'll roll out to all 20+ client projects. Let's sign the MOU.`,
      `Differentiation with AI agents - that's what we need to win enterprise deals. Show me the technical architecture and API documentation.`
    ]
  };
  
  const options = responses[persona.company] || responses['eiger-marvel-hr'];
  return options[Math.floor(Math.random() * options.length)];
}

function generatePersonaDefaultResponse(
  persona: B2BPersona
): string {
  const companyName = persona.company === 'eiger-marvel-hr' ? 'EIGER MARVEL HR' : 'SGC TECH AI';
  const personaKey = `${persona.company}:${persona.type}`;

  const responses: Record<string, string[]> = {
    'eiger-marvel-hr:hr-manager': [
      `I'm ${persona.name}, Operations Manager at ${companyName}. We need to scale our recruitment operations. Tell me about your 14-day deployment guarantee.`,
      `We're currently using Excel for everything - it's costing us AED 40k monthly in errors. How can Odoo ERP help us automate?`
    ],
    'eiger-marvel-hr:business-owner': [
      `I'm ${persona.name} at ${companyName}. We want to modernize with AI-powered recruitment. Can your system help us attract larger clients?`,
      `We're a 13-person team. Show me how AI can screen candidates faster. We need to compete with larger consultancies.`
    ],
    'eiger-marvel-hr:finance-decider': [
      `I'm ${persona.name}, Finance Manager. Before we discuss features, show me the ROI calculator. What's the total cost including training and support?`,
      `We need payment terms - 90 days ideally. Can you provide a money-back guarantee if the system fails during payroll processing?`
    ],
    'sgc-tech-ai:it-manager': [
      `I'm ${persona.name}, IT Manager at ${companyName}. I need to see API documentation first. How does your AI agent integrate with our existing AWS infrastructure?`,
      `We're managing 20+ client projects manually. Show me the CI/CD automation and Kubernetes setup. I need production-grade reliability.`
    ],
    'sgc-tech-ai:business-owner': [
      `I'm ${persona.name}, CEO of ${companyName}. We're stuck at AED 1.5M revenue. How can AI agents help us win enterprise clients and scale to AED 5M?`,
      `Our competitors are offering AI. If we don't adapt in 6 months, we'll lose market share. Show me your competitive advantage.`
    ],
    'sgc-tech-ai:operations-manager': [
      `I'm ${persona.name}, Head of Operations. Our project delivery takes 3-6 months. How can AI tools reduce that to 6-8 weeks? I want a pilot program first.`,
      `We're doing everything custom - no reuse, no efficiency. Show me your reusable AI components library. How do we standardize delivery?`
    ]
  };
  
  const options = responses[personaKey] || responses['eiger-marvel-hr:hr-manager'];
  return options[Math.floor(Math.random() * options.length)];
}

// ============================================
// Export for use in components
// ============================================

export const PROSPECT_PERSONAS = ALL_B2B_PERSONAS;
export const getPersona = getPersonaByType;
export const getCompanyPersonas = getPersonasForCompany;

export default {
  generateProspectResponse,
  getPersonaByType,
  getPersonasForCompany,
  PROSPECT_PERSONAS
};
