import cron from 'node-cron';
import { startBirthdayReminderJob } from '../../../src/jobs/birthday-reminder-job';
import { BirthdayService } from '../../../src/services/birthday-service';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('../../../src/services/birthday-service', () => ({
  BirthdayService: {
    processBirthdayWishes: jest.fn(),
  },
}));

describe('startBirthdayReminderJob', () => {
  it('should schedule the cron job and call processBirthdayWishes', async () => {
    let scheduledCallback: any = null;

    (cron.schedule as jest.Mock).mockImplementation((_, cb) => {
      scheduledCallback = cb;
    });

    startBirthdayReminderJob();

    expect(cron.schedule).toHaveBeenCalled();

    await scheduledCallback();

    expect(BirthdayService.processBirthdayWishes).toHaveBeenCalled();
  });
});
