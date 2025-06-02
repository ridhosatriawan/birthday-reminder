import cron from 'node-cron';
import { logger } from '../applications/logging';
import { BirthdayService } from '../services/birthday-service';
import moment from 'moment-timezone';

export const startBirthdayReminderJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    logger.info(
      `[CRON] Running birthday check...${moment().format('YYYY-MM-DD HH:mm:ss Z')}`,
    );
    await BirthdayService.processBirthdayWishes();
  });
};
