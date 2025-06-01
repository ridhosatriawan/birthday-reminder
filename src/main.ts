import { connectDB } from './applications/db';
import { logger } from './applications/logging';
import { web } from './applications/web';
import { startBirthdayReminderJob } from './jobs/birthday-reminder-job';

async function main() {
  try {
    await connectDB();
    logger.info('Database connected');

    startBirthdayReminderJob();
    logger.info('Birthday reminder job started');

    web.listen(3000, () => {
      logger.info('listening port 3000');
    });
  } catch (error: any) {
    logger.error(`Failed to start app: ${error.message}`);
    process.exit(1);
  }
}

main();
