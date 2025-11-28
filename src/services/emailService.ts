export interface EmailRequest {
  to: string[];
  subject: string;
  body: string;
  attachmentUrl?: string;
}

export interface EmailResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export const sendEmail = async (request: EmailRequest): Promise<EmailResult> => {
  console.log('Email send requested', request);
  return { success: true, providerMessageId: 'mocked-id' };
};
