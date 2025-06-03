import { sendEmail } from '../../../worker/services/email-service'; // pastikan path benar
import { logger } from '../../../shared/logging';

jest.mock('../../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log email details', async () => {
    const payload = {
      to: 'test@example.com',
      subject: 'Hello',
      body: 'This is a test email.',
    };

    await sendEmail(payload);

    expect(logger.info).toHaveBeenCalledWith(
      '📧 Simulated email sent to test@example.com',
    );
    expect(logger.info).toHaveBeenCalledWith('Subject: Hello');
    expect(logger.info).toHaveBeenCalledWith('Body:\nThis is a test email.');
    expect(logger.info).toHaveBeenCalledTimes(3);
  });
});
