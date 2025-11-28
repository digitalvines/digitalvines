import { nanoid } from 'nanoid';
import { Answer, HandoverSession, Organisation, QuestionTemplate, Report, User } from '../models/types.js';

export interface Db {
  organisations: Organisation[];
  users: User[];
  questionTemplates: QuestionTemplate[];
  sessions: HandoverSession[];
  answers: Answer[];
  reports: Report[];
}

export const db: Db = {
  organisations: [
    {
      id: 'org_default',
      name: 'Default Org',
      domain: 'default.example',
      settings: {},
    },
  ],
  users: [],
  questionTemplates: [
    {
      id: nanoid(),
      organisationId: 'org_default',
      text: 'Patient status and observations',
      order: 1,
      required: true,
    },
    {
      id: nanoid(),
      organisationId: 'org_default',
      text: 'Medication updates or concerns',
      order: 2,
      required: true,
    },
    {
      id: nanoid(),
      organisationId: 'org_default',
      text: 'Family communication or preferences',
      order: 3,
      required: false,
    },
  ],
  sessions: [],
  answers: [],
  reports: [],
};

export const findOrganisationById = (id: string): Organisation | undefined =>
  db.organisations.find((org) => org.id === id);

export const createUser = (user: Omit<User, 'id'>): User => {
  const entity: User = { ...user, id: nanoid() };
  db.users.push(entity);
  return entity;
};

export const findUserByEmail = (email: string): User | undefined =>
  db.users.find((u) => u.email === email);

export const findQuestionsForOrganisation = (organisationId: string): QuestionTemplate[] =>
  db.questionTemplates
    .filter((q) => q.organisationId === organisationId)
    .sort((a, b) => a.order - b.order);

export const createSession = (session: Omit<HandoverSession, 'id' | 'startedAt'>): HandoverSession => {
  const entity: HandoverSession = {
    ...session,
    id: nanoid(),
    startedAt: new Date(),
  };
  db.sessions.push(entity);
  return entity;
};

export const findSessionById = (id: string): HandoverSession | undefined => db.sessions.find((s) => s.id === id);

export const upsertAnswer = (answer: Omit<Answer, 'id' | 'version' | 'updatedAt'>): Answer => {
  const existing = db.answers.find((a) => a.sessionId === answer.sessionId && a.questionId === answer.questionId);
  if (existing) {
    existing.version += 1;
    existing.text = answer.text;
    existing.updatedAt = new Date();
    return existing;
  }
  const entity: Answer = { ...answer, id: nanoid(), version: 1, updatedAt: new Date() };
  db.answers.push(entity);
  return entity;
};

export const listAnswersForSession = (sessionId: string): Answer[] =>
  db.answers
    .filter((a) => a.sessionId === sessionId)
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

export const saveReport = (report: Omit<Report, 'id' | 'createdAt'>): Report => {
  const entity: Report = { ...report, id: nanoid(), createdAt: new Date() };
  db.reports.push(entity);
  return entity;
};

export const listReportsForSession = (sessionId: string): Report[] => db.reports.filter((r) => r.sessionId === sessionId);
