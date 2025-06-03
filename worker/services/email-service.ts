import { logger } from '../../shared/logging';

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export const sendEmail = async ({
  to,
  body,
  subject,
}: EmailPayload): Promise<void> => {
  logger.info(`📧 Simulated email sent to ${to}`);
  logger.info(`Subject: ${subject}`);
  logger.info(`Body:\n${body}`);
};
