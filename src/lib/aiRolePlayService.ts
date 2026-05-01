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
import { detectObjectionType, getBestResponse as getEigerBestResponse } from './objections/eigerMarvelObjections';
import { detectTechObjectionType, getTechBestResponse } from './objections/sdcTechAIObjections';
import { mistralService } from './mistralService';

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
 * Generate realistic B2B prospect response using Mistral AI with local fallback
 */
export async function generateProspectResponse(
  context: ConversationContext,
  userMessage: string
): Promise<string> {
  const persona = getPersonaByType(context.company, context.personaType);
  if (!persona) {
    return "I'm not sure I understand. Can you tell me more about your solution?";
  }

  const companyName = context.company === 'eiger-marvel-hr' ? 'EIGER MARVEL HR' : 'SGC TECH AI';
  const systemPrompt = `You are ${persona.name}, ${persona.title} at ${companyName} in the UAE.
Goals: ${persona.goals.slice(0, 2).join('; ')}.
Pain points: ${persona.painPoints.slice(0, 2).join('; ')}.
Concerns: ${persona.concerns.slice(0, 2).join('; ')}.
Budget: ${persona.budget}. Skepticism level: ${persona.personality.skeptical}/10.
RULES: Stay in character. Respond in 1-3 sentences. Raise realistic B2B objections. Reference UAE context (AED, WPS compliance) where relevant. Never say you are an AI.`;

  const chatMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...context.messages
      .filter(m => m.role !== 'system')
      .slice(-6) // last 6 messages for context
      .map(m => ({
        role: (m.role === 'prospect' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      })),
    { role: 'user' as const, content: userMessage },
  ];

  try {
    const aiResponse = await mistralService.chatCompletion(chatMessages);
    if (aiResponse && aiResponse.length > 10) {
      return applyTalkativeStyle(aiResponse, persona.personality.talkative);
    }
  } catch {
    // fall through to local generation
  }

  // Local fallback
  const response = generateB2BResponse(persona, userMessage);
  return applyTalkativeStyle(response, persona.personality.talkative);
}

/**
 * Core B2B response generation logic — delegates to company-specific objection libraries
 */
function generateB2BResponse(
  persona: B2BPersona,
  userMessage: string
): string {
  if (persona.company === 'eiger-marvel-hr') {
    const objectionType = detectObjectionType(userMessage);
    if (objectionType) {
      const response = getEigerBestResponse(objectionType);
      if (response) return response.script;
    }
  } else {
    const techObjectionType = detectTechObjectionType(userMessage);
    if (techObjectionType) {
      const response = getTechBestResponse(techObjectionType);
      if (response) return response.script;
    }
  }

  // ===== POSITIVE RESPONSES =====
  const message = userMessage.toLowerCase();
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
