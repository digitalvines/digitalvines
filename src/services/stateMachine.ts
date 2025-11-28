import { HandoverSession, SessionStatus } from '../models/types.js';

export type StateEvent = 'start' | 'answer' | 'confirm' | 'pause' | 'resume' | 'back' | 'complete';

const transitions: Record<SessionStatus, Partial<Record<StateEvent, SessionStatus>>> = {
  idle: { start: 'asking' },
  asking: { answer: 'waiting_for_answer', pause: 'paused' },
  waiting_for_answer: { confirm: 'confirming', pause: 'paused', back: 'asking' },
  confirming: { confirm: 'asking', complete: 'review', back: 'asking' },
  paused: { resume: 'asking' },
  review: { complete: 'completed', back: 'asking' },
  completed: {},
};

export const advanceState = (session: HandoverSession, event: StateEvent): HandoverSession => {
  const nextState = transitions[session.status][event];
  if (!nextState) {
    return session;
  }
  const updated: HandoverSession = { ...session, status: nextState };
  if (nextState === 'completed') {
    updated.completedAt = new Date();
  }
  return updated;
};
