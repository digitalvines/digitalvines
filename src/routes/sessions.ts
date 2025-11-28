import { Router } from 'express';
import { advanceState } from '../services/stateMachine.js';
import { createSession, findQuestionsForOrganisation, findSessionById, upsertAnswer } from '../storage/memory.js';

const router = Router();

router.post('/', (req, res) => {
  const { organisationId, userId } = req.body as { organisationId: string; userId: string };
  if (!organisationId || !userId) {
    res.status(400).json({ message: 'Missing organisationId or userId' });
    return;
  }
  const session = createSession({ organisationId, userId, status: 'idle', currentQuestionIndex: 0 });
  res.status(201).json(session);
});

router.post('/:sessionId/start', (req, res) => {
  const { sessionId } = req.params;
  const session = findSessionById(sessionId);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  const updated = advanceState(session, 'start');
  session.status = updated.status;
  res.json(session);
});

router.post('/:sessionId/answer', (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body as { text: string };
  const session = findSessionById(sessionId);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  const questions = findQuestionsForOrganisation(session.organisationId);
  const question = questions[session.currentQuestionIndex];
  if (!question) {
    res.status(400).json({ message: 'No question available' });
    return;
  }
  const stored = upsertAnswer({ sessionId, questionId: question.id, text });
  const updated = advanceState(session, 'answer');
  session.status = updated.status;
  session.currentQuestionIndex = Math.min(session.currentQuestionIndex + 1, questions.length - 1);
  res.json({ session, answer: stored });
});

router.post('/:sessionId/pause', (req, res) => {
  const session = findSessionById(req.params.sessionId);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  const updated = advanceState(session, 'pause');
  session.status = updated.status;
  res.json(session);
});

router.post('/:sessionId/resume', (req, res) => {
  const session = findSessionById(req.params.sessionId);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  const updated = advanceState(session, 'resume');
  session.status = updated.status;
  res.json(session);
});

router.post('/:sessionId/back', (req, res) => {
  const session = findSessionById(req.params.sessionId);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  const updated = advanceState(session, 'back');
  session.status = updated.status;
  session.currentQuestionIndex = Math.max(session.currentQuestionIndex - 1, 0);
  res.json(session);
});

router.post('/:sessionId/complete', (req, res) => {
  const session = findSessionById(req.params.sessionId);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  const updated = advanceState(session, 'complete');
  session.status = updated.status;
  session.completedAt = updated.completedAt;
  res.json(session);
});

export default router;
