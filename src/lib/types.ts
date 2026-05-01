// src/lib/types.ts
// TypeScript types for Scholarix CRM System

// =====================================================
// USER TYPES
// =====================================================

export type UserRole = 'admin' | 'agent';

export interface User {
  id: number;
  clerk_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface CreateUserInput {
  clerk_id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateUserInput {
  full_name?: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
}

// =====================================================
// LEAD TYPES
// =====================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadSource = 'website' | 'referral' | 'cold-call' | 'email' | 'social-media' | 'event' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: number;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  position?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: Priority;
  estimated_value: number;
  assigned_to?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  next_follow_up?: string;
  last_contact?: string;
  notes?: string;
  tags?: string; // JSON array
}

export interface LeadDetailed extends Lead {
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by_name: string;
  total_calls: number;
  total_conversations: number;
  last_call_date?: string;
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone: string;
  company?: string;
  position?: string;
  source?: LeadSource;
  priority?: Priority;
  estimated_value?: number;
  assigned_to?: number;
  notes?: string;
}

export interface UpdateLeadInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: Priority;
  estimated_value?: number;
  assigned_to?: number;
  next_follow_up?: string;
  notes?: string;
}

// =====================================================
// CALL TYPES
// =====================================================

export type CallOutcome = 'answered' | 'no-answer' | 'voicemail' | 'busy' | 'callback' | 'meeting-scheduled' | 'not-interested' | 'demo-booked' | 'follow-up-scheduled' | 'in-progress';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Call {
  id: number;
  lead_id: number;
  user_id: number;
  call_date: string;
  duration: number;
  outcome: CallOutcome;
  notes?: string;
  recording_url?: string;
  script_used?: string;
  sentiment?: Sentiment;
  next_action?: string;
  created_at: string;
}

export interface CallWithDetails extends Call {
  lead_name: string;
  lead_company?: string;
  user_name: string;
}

export interface CreateCallInput {
  lead_id: number;
  call_date?: string;
  duration?: number;
  outcome: CallOutcome;
  notes?: string;
  recording_url?: string;
  script_used?: string;
  sentiment?: Sentiment;
  next_action?: string;
}

export interface UpdateCallInput {
  duration?: number;
  outcome?: CallOutcome;
  notes?: string;
  sentiment?: Sentiment;
  next_action?: string;
}

// =====================================================
// CONVERSATION TYPES
// =====================================================

export type MessageType = 'note' | 'email' | 'sms' | 'call-summary' | 'meeting-notes';

export interface Conversation {
  id: number;
  lead_id: number;
  user_id: number;
  message: string;
  message_type: MessageType;
  is_internal: boolean;
  created_at: string;
}

export interface ConversationWithDetails extends Conversation {
  user_name: string;
  user_avatar?: string;
}

export interface CreateConversationInput {
  lead_id: number;
  message: string;
  message_type?: MessageType;
  is_internal?: boolean;
}

// =====================================================
// ACTIVITY LOG TYPES
// =====================================================

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActivityLogWithUser extends ActivityLog {
  user_name: string;
  user_email: string;
}

export interface CreateActivityLogInput {
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

// =====================================================
// CALL SCRIPT TYPES
// =====================================================

export interface CallScript {
  id: number;
  title: string;
  content: string;
  category?: string;
  description?: string;
  is_active: boolean;
  usage_count: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCallScriptInput {
  title: string;
  content: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCallScriptInput {
  title?: string;
  content?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

// =====================================================
// TASK TYPES
// =====================================================

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: number;
  lead_id?: number;
  user_id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  status: TaskStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  lead_name?: string;
  user_name: string;
}

export interface CreateTaskInput {
  lead_id?: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  status?: TaskStatus;
}

// =====================================================
// TAG TYPES
// =====================================================

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

// =====================================================
// STATISTICS & ANALYTICS TYPES
// =====================================================

export interface UserCallStats {
  id: number;
  full_name: string;
  total_calls: number;
  total_duration: number;
  avg_duration: number;
  answered_calls: number;
  missed_calls: number;
}

export interface PipelineSummary {
  status: LeadStatus;
  count: number;
  total_value: number;
  avg_value: number;
}

export interface DashboardStats {
  total_leads: number;
  active_leads: number;
  won_leads: number;
  lost_leads: number;
  total_calls: number;
  total_call_duration: number;
  avg_call_duration: number;
  conversion_rate: number;
  pipeline_value: number;
}

export interface AgentPerformance {
  user_id: number;
  user_name: string;
  total_leads: number;
  calls_made: number;
  meetings_scheduled: number;
  deals_won: number;
  total_revenue: number;
  conversion_rate: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// =====================================================
// FILTER & QUERY TYPES
// =====================================================

export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: Priority[];
  assigned_to?: number[];
  created_by?: number[];
  search?: string;
  date_from?: string;
  date_to?: string;
  tags?: number[];
}

export interface CallFilters {
  lead_id?: number;
  user_id?: number;
  outcome?: CallOutcome[];
  sentiment?: Sentiment[];
  date_from?: string;
  date_to?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// =====================================================
// FORM TYPES
// =====================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// =====================================================
// CLOUDFLARE WORKER TYPES
// =====================================================

export interface Env {
  DB: D1Database;
  RECORDINGS: R2Bucket;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  APP_URL?: string;
  ENVIRONMENT?: string;
}

export interface AuthContext {
  userId: number;
  clerkId: string;
  email: string;
  role: UserRole;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// =====================================================
// LEGACY SALES APP TYPES (For backward compatibility)
// =====================================================

export type Industry = 'real-estate' | 'retail' | 'trading' | 'logistics' | 'consulting';
export type CallObjective = 'cold-call' | 'follow-up' | 'demo-confirmation';
export type ResponseType = 'positive' | 'negative' | 'neutral' | 'objection';
export type CallPhase = 'opening' | 'discovery' | 'teaching' | 'demo-offer' | 'objection' | 'close';

export interface ProspectInfo {
  name: string;
  title: string;
  company: string;
  industry: Industry;
  phone: string;
  email?: string;
  whatsapp?: string;
}

export interface ScriptNode {
  id: string;
  phase: CallPhase;
  text: string;
  type: 'question' | 'statement' | 'objection-handler' | 'close';
  responses?: ScriptResponse[];
  qualificationUpdate?: Partial<QualificationStatus>;
  nextNodeId?: string;
  tips?: string;
}

export interface ScriptResponse {
  label: string;
  type: ResponseType;
  nextNodeId: string;
  qualificationUpdate?: Partial<QualificationStatus>;
}

export interface QualificationStatus {
  usesManualProcess: boolean | null;
  painPointIdentified: boolean | null;
  painQuantified: boolean | null;
  valueAcknowledged: boolean | null;
  timeCommitted: boolean | null;
  demoBooked: boolean | null;
}

export interface CallRecord {
  id: string;
  prospectInfo: ProspectInfo;
  objective: CallObjective;
  startTime: number;
  endTime?: number;
  duration?: number;
  outcome: CallOutcome;
  qualification: QualificationStatus;
  notes: string;
  scriptPath: string[];
  recordingUrl?: string;
  recordingDuration?: number;
  // Transcription fields
  transcription?: string;
  transcriptionStatus?: 'processing' | 'completed' | 'failed';
  transcriptionSummary?: string;
  sentimentScore?: number;
  keyTopics?: string[];
  actionItems?: string[];
  nextSteps?: string[];
  callQualityScore?: number;
}

export interface CallMetrics {
  totalCalls: number;
  demosBooked: number;
  conversionRate: number;
  avgCallDuration: number;
  qualificationBreakdown: {
    usesManualProcess: number;
    painPointIdentified: number;
    painQuantified: number;
    valueAcknowledged: number;
  };
}

// =====================================================
// TRANSCRIPTION TYPES
// =====================================================

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  text: string;
  confidence: number;
}

export interface TranscriptionAnalytics {
  talkTimeRatio: number;
  interruptions: number;
  speakingPace: number;
  sentimentTrend: Array<{ time: number; sentiment: number }>;
  engagementScore: number;
}

export interface TranscriptionData {
  status: 'processing' | 'completed' | 'failed';
  transcript?: string;
  summary?: string;
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  keyTopics?: string[];
  actionItems?: string[];
  nextSteps?: string[];
  qualityScore?: number;
  segments?: TranscriptionSegment[];
  analytics?: TranscriptionAnalytics;
}

// =====================================================
// LIVE AI COACHING TYPES
// =====================================================

export interface LiveCoachingInsight {
  responseType: 'positive' | 'negative' | 'neutral' | 'objection' | 'buying_signal' | 'concern';
  sentiment: 'enthusiastic' | 'interested' | 'skeptical' | 'resistant' | 'confused';
  coachingTip: string;
  nextBestAction: string;
  detectedSignals: string[];
  suggestedFollowUp: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface AdaptiveScriptSuggestion {
  suggestedScript: string;
  reasoning: string;
  alternativeApproach: string;
  keyPoints: string[];
  transitionPhase: string;
  timeToSpend: string;
  successMetrics: string;
}

export interface PerformanceCoaching {
  overallScore: number;
  primaryFeedback: string;
  specificImprovements: string[];
  strengths: string[];
  nextFocusArea: string;
  adjustmentNeeded: 'immediate' | 'minor' | 'none';
  suggestedTechnique: string;
  warningFlag: string;
}

export interface LiveCallMetrics {
  talkTimeRatio: number;
  questionsAsked: number;
  objectionCount: number;
  callDuration: number;
  currentPhase: string;
  prospectEngagement: 'low' | 'medium' | 'high';
}

// =====================================================
// CLOUDFLARE TYPES (Conditional import for different environments)
// =====================================================

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

declare global {
  interface D1Database {
    prepare(sql: string): D1PreparedStatement;
    exec(sql: string): Promise<D1Result>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  }
  
  interface R2Object {
    key: string;
    version: string;
    size: number;
    etag: string;
    httpEtag: string;
    uploaded: Date;
    httpMetadata?: Record<string, string>;
    customMetadata?: Record<string, string>;
    body: ReadableStream;
    bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T = unknown>(): Promise<T>;
    blob(): Promise<Blob>;
  }
  
  interface R2Bucket {
    put(
      key: string,
      value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
      options?: {
        httpMetadata?: Record<string, string>;
        customMetadata?: Record<string, string>;
      }
    ): Promise<R2Object | null>;
    get(key: string): Promise<R2Object | null>;
    delete(keys: string | string[]): Promise<void>;
    list(options?: {
      prefix?: string;
      limit?: number;
      cursor?: string;
    }): Promise<{
      objects: R2Object[];
      truncated: boolean;
      cursor?: string;
    }>;
  }
}
