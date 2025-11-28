export type Role = 'admin' | 'carer';

export interface Organisation {
  id: string;
  name: string;
  domain?: string;
  settings?: Record<string, unknown>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisationId: string;
  authHash: string;
}

export interface QuestionTemplate {
  id: string;
  organisationId: string;
  text: string;
  order: number;
  required: boolean;
}

export type SessionStatus = 'idle' | 'asking' | 'waiting_for_answer' | 'confirming' | 'paused' | 'review' | 'completed';

export interface HandoverSession {
  id: string;
  organisationId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  status: SessionStatus;
  currentQuestionIndex: number;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  text: string;
  version: number;
  updatedAt: Date;
}

export type ReportStatus = 'pending' | 'sent' | 'failed';

export interface Report {
  id: string;
  sessionId: string;
  pdfUrl: string;
  emailedTo: string[];
  status: ReportStatus;
  createdAt: Date;
}
