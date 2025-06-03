import { logger } from '../../shared/logging';
import { getUsersToNotify, processBirthdayUsers } from './birthday-worker';

export async function birthdayJob() {
  const now = new Date();

  const users = await getUsersToNotify(now);

  if (users.length > 0) {
    logger.info(
      `[Job] Found ${users.length} users to notify (time: ${now.toISOString()})`,
    );

    await processBirthdayUsers(users);
  } else {
    logger.info(`[Job] No users to notify at ${now.toISOString()}`);
  }
}
