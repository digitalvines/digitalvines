import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../storage/memory.js';
import { Role } from '../models/types.js';

const router = Router();
const JWT_SECRET = 'replace-me-secret';

router.post('/register', (req, res) => {
  const { name, email, organisationId, password, role } = req.body as {
    name: string;
    email: string;
    organisationId: string;
    password: string;
    role?: Role;
  };
  if (!name || !email || !organisationId || !password) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }
  const existing = findUserByEmail(email);
  if (existing) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }
  const user = createUser({
    name,
    email,
    organisationId,
    role: role ?? 'carer',
    authHash: password,
  });
  const token = jwt.sign({ userId: user.id, organisationId: user.organisationId, role: user.role }, JWT_SECRET, {
    expiresIn: '2h',
  });
  res.json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = findUserByEmail(email);
  if (!user || user.authHash !== password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign({ userId: user.id, organisationId: user.organisationId, role: user.role }, JWT_SECRET, {
    expiresIn: '2h',
  });
  res.json({ token, user });
});

export default router;
