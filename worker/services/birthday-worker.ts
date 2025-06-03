import moment from 'moment-timezone';
import { IUser, User } from '../../api/models/user-model';
import { logger } from '../../shared/logging';
import { BIRTHDAY_EMAIL_HOUR, BIRTHDAY_EMAIL_MINUTE } from '../lib/constant';
import { getNextBday } from '../lib/utils';
import { sendEmail } from './email-service';
import retry from 'async-retry';

const PROCESSING_BATCH_SIZE = 200;

export async function getUsersToNotify(now: Date): Promise<IUser[]> {
  return await User.aggregate([
    {
      $match: {
        // today birthday
        nextBirthday: {
          $gte: moment().startOf('day').toDate(),
          $lte: moment().endOf('day').toDate(),
        },
      },
    },
    {
      $addFields: {
        local9AM: {
          $dateFromParts: {
            year: { $year: '$nextBirthday' },
            month: { $month: '$nextBirthday' },
            day: { $dayOfMonth: '$nextBirthday' },
            hour: BIRTHDAY_EMAIL_HOUR,
            minute: BIRTHDAY_EMAIL_MINUTE,
            timezone: '$timezone',
          },
        },
      },
    },
    {
      $match: {
        local9AM: { $lte: now },
        $expr: {
          $eq: [{ $hour: '$local9AM' }, { $hour: now }],
        },
      },
    },
    { $limit: PROCESSING_BATCH_SIZE },
    {
      $project: {
        name: 1,
        email: 1,
        birthday: 1,
        timezone: 1,
        nextBirthday: 1,
      },
    },
  ]);
}

export async function sendEmailWithRetry(user: IUser, options?: {}) {
  return await retry(
    async (_, attempt) => {
      try {
        await sendEmail({
          to: user.email,
          subject: `🎉 Happy Birthday, ${user.name}!`,
          body: `Wishing you a wonderful day, ${user.name}! 🎂`,
        });
      } catch (error) {
        logger.warn(
          `[Retry ${attempt}] Failed to send to ${user.email}. Retrying...`,
        );
        throw error;
      }
    },
    {
      retries: 3,
      minTimeout: 1000,
      ...options,
    },
  );
}

export async function processBirthdayUsers(users: IUser[]) {
  const processingPromises = users.map(async (user) => {
    try {
      await sendEmailWithRetry(user);
      await updateNextBirthday(user);
    } catch (error) {
      logger.error(`[Processing Error] User ${user._id}:`, error);
    }
  });

  await Promise.all(processingPromises);
}

export async function updateNextBirthday(user: IUser) {
  let nextBday = getNextBday(user.birthday, user.timezone);
  nextBday.add(1, 'year');

  await User.findByIdAndUpdate(user._id, {
    nextBirthday: nextBday,
  });
}
