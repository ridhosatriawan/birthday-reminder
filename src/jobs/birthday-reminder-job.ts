import cron from 'node-cron';
import { logger } from '../applications/logging';
import { BirthdayService } from '../services/birthday-service';

export const startBirthdayReminderJob = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('[CRON] Running birthday check...');
    await BirthdayService.processBirthdayWishes();
  });
};
