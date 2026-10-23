export type Language = 'en' | 'hi';

export type TextSize = 'standard' | 'large' | 'extra-large';

export type RequestStatus = 'Pending' | 'Acknowledged' | 'Resolved';

export type RequestPriority = 'normal' | 'urgent';

export interface AssistanceRequest {
  id: string;
  roomNumber: string;
  category: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  timestamp: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  staffNotes?: string;
  patientName?: string;
}

export interface HospitalInfoItem {
  id: string;
  title: string;
  titleHi: string;
  category: 'visiting' | 'cafeteria' | 'reception' | 'navigation' | 'services' | 'emergency';
  summary: string;
  summaryHi: string;
  details: string[];
  detailsHi: string[];
  location?: string;
  hours?: string;
  contact?: string;
  iconName: string;
  importantNote?: string;
  importantNoteHi?: string;
}

export interface PatientPreferences {
  language: Language;
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  speechRate: number; // 0.75, 1.0, 1.25
  speechVolume: number; // 0.0 to 1.0
  autoSpeak: boolean;
  soundEffects: boolean;
  roomNumber: string;
  patientName: string;
}

export interface AskQuestionPayload {
  question: string;
  language: Language;
  roomNumber?: string;
}

export interface AskResponse {
  answer: string;
  spokenAnswer: string;
  category?: string;
  source: 'ai' | 'local-knowledge-base';
  modelUsed?: string;
  escalation?: boolean;
  emergencyWarning?: string;
  suggestedFollowUps?: string[];
  suggestedFollowUpsHi?: string[];
}

export type ScreenView = 
  | 'home' 
  | 'assistant' 
  | 'hospital-info' 
  | 'request-assistance' 
  | 'staff-dashboard' 
  | 'settings';
