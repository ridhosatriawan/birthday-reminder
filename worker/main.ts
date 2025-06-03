import dotenv from 'dotenv';
import { connectDB, shutdown } from '../shared/db';
import { logger } from '../shared/logging';
import { startBirthdayWorker } from './services/birthday-service';

dotenv.config();

process.on('unhandledRejection', async (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  await shutdown(0);
});

process.on('uncaughtException', async (err) => {
  logger.error('Uncaught Exception:', err);
  await shutdown(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT (Ctrl+C)');
  await shutdown(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM (stop from system)');
  await shutdown(0);
});

async function main() {
  try {
    await connectDB();

    startBirthdayWorker();
  } catch (err) {
    logger.error('Fatal error at main.ts:', err);
    await shutdown(1);
  }
}

main();
