import { listAnswersForSession } from '../storage/memory.js';
import { Report, ReportStatus } from '../models/types.js';

export interface RenderedReport {
  pdfUrl: string;
  payload: string;
}

export const renderReport = (sessionId: string): RenderedReport => {
  const answers = listAnswersForSession(sessionId);
  const payload = JSON.stringify(answers, null, 2);
  const pdfUrl = `/reports/${sessionId}.pdf`;
  return { pdfUrl, payload };
};

export const prepareReportRecord = (sessionId: string, emailedTo: string[], status: ReportStatus = 'pending'): Omit<Report, 'id' | 'createdAt'> => {
  const { pdfUrl } = renderReport(sessionId);
  return {
    sessionId,
    pdfUrl,
    emailedTo,
    status,
  };
};
