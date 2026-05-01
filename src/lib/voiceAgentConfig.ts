/**
 * Voice Agent Configuration - B2B Decision Makers
 * Companies: EIGER MARVEL HR & SGC TECH AI
 * NO student personas - these are real business buyers
 */

import type { CompanyType } from './companySelector';
import type { B2BPersonaType } from './b2bPersonas';

export interface VoiceAgent {
  id: string;
  name: string; // Gemini voice name
  voice: string;
  gender: 'male' | 'female';
  accent: string;
  personality: string;
  stylePrompt: string;
  useCase: string[];
  targetCompany: CompanyType | 'both';
  targetPersonaTypes: B2BPersonaType[];
  fallbackVoice?: string; // Edge TTS backup
  deepgramVoice?: string;
}

// ============================================
// MALE VOICES (Gemini 3.1 Flash TTS)
// ========================================

export const VOICE_AGENTS: VoiceAgent[] = [
  // ===== EIGER MARVEL HR (HR Consultancy) =====
  {
    id: 'orion-hr-manager',
    name: 'Orion',
    voice: 'Orion',
    gender: 'male',
    accent: 'American',
    personality: 'Clear, professional operations manager',
    stylePrompt: 'Speak clearly and professionally about daily HR operations. Say "Our recruitment process needs updating, but we have limited budget." Focus on operational efficiency.',
    useCase: ['budget-conscious', 'operations', 'process-improvement'],
    targetCompany: 'eiger-marvel-hr',
    targetPersonaTypes: ['hr-manager'],
    fallbackVoice: 'en-US-GuyNeural',
    deepgramVoice: 'aura-2-orion-en' // Deepgram: Clear, articulate, professional
  },
  {
    id: 'solomon-hr-finance',
    name: 'Solomon',
    voice: 'Solomon',
    gender: 'male',
    accent: 'American',
    personality: 'Wise, authoritative finance decision-maker',
    stylePrompt: 'Speak wisely about financial decisions and budgets. Say "We need to see ROI data before investing in new HR software." Focus on numbers and ROI.',
    useCase: ['budget-focused', 'roi-driven', 'financial-decision-maker'],
    targetCompany: 'eiger-marvel-hr',
    targetPersonaTypes: ['finance-decider'],
    fallbackVoice: 'en-US-GuyNeural',
    deepgramVoice: 'aura-2-solomon-en' // Deepgram: Wise, authoritative, measured
  },
  
  {
    id: 'puck-hr-skeptical',
    name: 'Puck',
    voice: 'Puck',
    gender: 'male',
    accent: 'American',
    personality: 'Analytical, skeptical about ERP failures',
    stylePrompt: 'Speak analytically and skeptically. Mention being "burned before by small software firms". Ask about money-back guarantees and hidden costs repeatedly.',
    useCase: ['skeptical-buyer', 'erp-failure-concerns', 'budget-conscious'],
    targetCompany: 'eiger-marvel-hr',
    targetPersonaTypes: ['finance-decider'],
    fallbackVoice: 'en-US-DavisNeural',
    deepgramVoice: 'aura-2-arcas-en' // Deepgram: Warm, friendly (disarming for skeptical buyers)
  },
  
  {
    id: 'orus-hr-efficient',
    name: 'Orus',
    voice: 'Orus',
    gender: 'male',
    accent: 'American',
    personality: 'Efficient, results-driven operations',
    stylePrompt: 'Speak efficiently about scaling recruitment operations. Focus on "automating candidate tracking" and "reducing manual work". Value speed and results.',
    useCase: ['scaling-operations', 'efficiency-focused', 'recruitment-automation'],
    targetCompany: 'eiger-marvel-hr',
    targetPersonaTypes: ['hr-manager'],
    fallbackVoice: 'en-US-BrandonNeural',
    deepgramVoice: 'aura-2-orion-en' // Deepgram: Clear, articulate (matches efficiency focus)
  },

  // ===== SGC TECH AI (IT/Software) =====
  {
    id: 'algenib-tech-expert',
    name: 'Algenib',
    voice: 'Algenib',
    gender: 'male',
    accent: 'American',
    personality: 'Technical expert, highly skilled in IT/AI',
    stylePrompt: 'Speak as a technical director. Use terms like "Kubernetes", "Docker", "CI/CD", "API documentation". Ask about production reliability and enterprise-grade solutions.',
    useCase: ['technical-discussion', 'ai-implementation', 'cloud-architecture'],
    targetCompany: 'sgc-tech-ai',
    targetPersonaTypes: ['it-manager'],
    fallbackVoice: 'en-US-AndrewNeural',
    deepgramVoice: 'aura-2-zeus-en' // Deepgram: Deep, authoritative (technical expertise)
  },
  
  {
    id: 'mintaka-tech-urgent',
    name: 'Mintaka',
    voice: 'Mintaka',
    gender: 'male',
    accent: 'American',
    personality: 'Urgent, visionary business owner',
    stylePrompt: 'Speak with urgency about market differentiation. Say "How fast can we go live?" and "Our competitors are already offering AI". Focus on competitive advantage.',
    useCase: ['visionary-buyer', 'competitive-advantage', 'fast-deployment'],
    targetCompany: 'sgc-tech-ai',
    targetPersonaTypes: ['business-owner'],
    fallbackVoice: 'en-US-AndrewNeural',
    deepgramVoice: 'aura-2-atlas-en' // Deepgram: Strong, confident (matches urgency/CEO energy)
  },
  
  {
    id: 'fenrir-tech-practical',
    name: 'Fenrir',
    voice: 'Fenrir',
    gender: 'male',
    accent: 'American',
    personality: 'Practical, delivery-focused operations',
    stylePrompt: 'Speak practically about project delivery. Mention "pilot program first" and "standardizing delivery across clients". Concerned about team adoption and learning curve.',
    useCase: ['operations-manager', 'pilot-program', 'delivery-focused'],
    targetCompany: 'sgc-tech-ai',
    targetPersonaTypes: ['operations-manager'],
    fallbackVoice: 'en-US-TonyNeural',
    deepgramVoice: 'aura-2-orion-en' // Deepgram: Clear, articulate (practical operations)
  },

  // ===== FEMALE VOICES =====
   
  // EIGER MARVEL HR
  {
    id: 'leda-hr-finance',
    name: 'Leda',
    voice: 'Leda',
    gender: 'female',
    accent: 'American',
    personality: 'CFO mindset, budget-conscious',
    stylePrompt: 'Speak with CFO mindset. Say "Show me the ROI calculator" and "We need 90-day payment terms". Demand money-back guarantee and detailed cost breakdown.',
    useCase: ['finance-decider', 'budget-conscious', 'roi-focused'],
    targetCompany: 'eiger-marvel-hr',
    targetPersonaTypes: ['finance-decider'],
    fallbackVoice: 'en-US-JennyNeural',
    deepgramVoice: 'aura-2-lyra-en-gb' // Deepgram: Sophisticated, professional (CFO persona)
  },

  // SGC TECH AI
  {
    id: 'zeus-tech-director',
    name: 'Zeus',
    voice: 'Zeus',
    gender: 'male',
    accent: 'American',
    personality: 'Authoritative technical director',
    stylePrompt: 'Speak authoritatively about technical infrastructure. Say "We need a solution that integrates with our existing tech stack seamlessly." Focus on technical requirements.',
    useCase: ['technical', 'infrastructure', 'integration-focused'],
    targetCompany: 'sgc-tech-ai',
    targetPersonaTypes: ['it-manager'],
    fallbackVoice: 'en-US-GuyNeural',
    deepgramVoice: 'aura-2-zeus-en' // Deepgram: Deep, authoritative, confident
  },
  {
    id: 'atlas-tech-ceo',
    name: 'Atlas',
    voice: 'Atlas',
    gender: 'male',
    accent: 'American',
    personality: 'Strong, confident CEO',
    stylePrompt: 'Speak confidently about business growth and technology adoption. Say "Our company is scaling fast, and we need AI tools that can keep up." Focus on business growth.',
    useCase: ['executive', 'growth-focused', 'business-strategy'],
    targetCompany: 'sgc-tech-ai',
    targetPersonaTypes: ['business-owner'],
    fallbackVoice: 'en-US-GuyNeural',
    deepgramVoice: 'aura-2-atlas-en' // Deepgram: Strong, confident, direct
  },
  {
    id: 'asteria-tech-operations',
    name: 'Asteria',
    voice: 'Asteria',
    gender: 'female',
    accent: 'American',
    personality: 'Warm, professional operations lead',
    stylePrompt: 'Speak warmly but professionally about daily tech operations. Say "We are looking for ways to automate our customer service with AI." Focus on operational efficiency.',
    useCase: ['operations', 'automation', 'customer-service'],
    targetCompany: 'sgc-tech-ai',
    targetPersonaTypes: ['operations-manager'],
    fallbackVoice: 'en-US-AriaNeural',
    deepgramVoice: 'aura-2-asteria-en' // Deepgram: Warm, professional, conversational
  }
];

// ============================================
// Utility Functions
// ========================================

/**
 * Get voice agent by company and persona type
 */
export function getVoiceAgentForB2BPersona(
  company: CompanyType,
  personaType: B2BPersonaType
): VoiceAgent {
  const agent = VOICE_AGENTS.find(a => 
    a.targetCompany === company && a.targetPersonaTypes.includes(personaType)
  );
  return agent || VOICE_AGENTS[0]; // Default fallback
}

/**
 * Get voice agents by target company
 */
export function getVoiceAgentsByCompany(company: CompanyType): VoiceAgent[] {
  return VOICE_AGENTS.filter(a => a.targetCompany === company || a.targetCompany === 'both');
}

/**
 * Get all male voices for a company
 */
export function getMaleVoiceAgents(company?: CompanyType): VoiceAgent[] {
  const filtered = company 
    ? VOICE_AGENTS.filter(a => a.targetCompany === company || a.targetCompany === 'both')
    : VOICE_AGENTS;
  return filtered.filter(a => a.gender === 'male');
}

/**
 * Get all female voices for a company
 */
export function getFemaleVoiceAgents(company?: CompanyType): VoiceAgent[] {
  const filtered = company 
    ? VOICE_AGENTS.filter(a => a.targetCompany === company || a.targetCompany === 'both')
    : VOICE_AGENTS;
  return filtered.filter(a => a.gender === 'female');
}

/**
 * Multi-speaker config for B2B role-play (Sales Rep vs. Prospect)
 */
export function createB2BRolePlayConfig(
  company: CompanyType,
  personaType: B2BPersonaType,
  salesRepVoice: string = 'Charon'
): { speaker1: { voice: string; text: string }; speaker2: { voice: string; text: string } } {
  
  const agent = getVoiceAgentForB2BPersona(company, personaType);
  
  return {
    speaker1: {
      voice: salesRepVoice, // You (sales rep)
      text: '' // To be filled by caller
    },
    speaker2: {
      voice: agent.voice, // Prospect (B2B buyer)
      text: '' // To be filled by caller
    }
  };
}

export default VOICE_AGENTS;
