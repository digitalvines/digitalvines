import { Router } from 'express';
import { findQuestionsForOrganisation } from '../storage/memory.js';

const router = Router();

router.get('/:organisationId', (req, res) => {
  const { organisationId } = req.params;
  const questions = findQuestionsForOrganisation(organisationId);
  res.json(questions);
});

export default router;
