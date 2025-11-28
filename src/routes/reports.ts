import { Router } from 'express';
import { listReportsForSession, saveReport } from '../storage/memory.js';
import { prepareReportRecord } from '../services/reportService.js';
import { sendEmail } from '../services/emailService.js';

const router = Router();

router.post('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { recipients } = req.body as { recipients: string[] };
  const record = prepareReportRecord(sessionId, recipients ?? []);
  const saved = saveReport(record);
  if (recipients && recipients.length > 0) {
    await sendEmail({
      to: recipients,
      subject: 'Handover report',
      body: 'Attached handover report',
      attachmentUrl: saved.pdfUrl,
    });
  }
  res.status(201).json(saved);
});

router.get('/:sessionId', (req, res) => {
  const reports = listReportsForSession(req.params.sessionId);
  res.json(reports);
});

export default router;
