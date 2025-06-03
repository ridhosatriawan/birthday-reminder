import cron from 'node-cron';
import { birthdayJob } from './birthday-job';
import { logger } from '../../shared/logging';

export function startBirthdayWorker() {
  const now = new Date();

  cron.schedule('0 * * * * *', async () => {
    logger.info(`[Worker] Starting birthday schedule at ${now.toISOString()}`);

    try {
      await birthdayJob();
      logger.info(`[Worker] Completed at  ${now.toISOString()} `);
    } catch (error) {
      logger.error('[Worker Error]', error);
    }
  });
}
