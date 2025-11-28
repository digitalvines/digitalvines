import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRouter from './routes/auth.js';
import questionsRouter from './routes/questions.js';
import sessionsRouter from './routes/sessions.js';
import reportsRouter from './routes/reports.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/questions', questionsRouter);
app.use('/sessions', sessionsRouter);
app.use('/reports', reportsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Handover assistant API listening on port ${PORT}`);
});
