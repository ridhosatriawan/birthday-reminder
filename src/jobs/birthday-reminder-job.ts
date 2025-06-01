import cron from 'node-cron';
import { logger } from '../applications/logging';
import { BirthdayService } from '../services/birthday-service';

export const startBirthdayReminderJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[CRON] Running birthday check...');
    await BirthdayService.processBirthdayWishes();
  });
};
