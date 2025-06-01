import moment from 'moment-timezone';
import { logger } from '../applications/logging';
import { User } from '../models/user-model';
import { getTimezonesAtNineAM } from '../utils/timezone';

export class BirthdayService {
  public static async processBirthdayWishes() {
    const timezonesAt9AM = getTimezonesAtNineAM();

    if (timezonesAt9AM.length === 0) {
      logger.info(
        'No timezones are currently at 9 AM. Skipping birthday processing.',
      );
      return;
    }

    const users = await User.find(
      {
        timezone: { $in: timezonesAt9AM },
      },
      { name: 1, birthday: 1, timezone: 1 },
    );

    if (users.length === 0) {
      logger.info('No users found in the eligible 9 AM timezones.');
      return;
    }

    for (const user of users) {
      const nowInUserTZ = moment().tz(user.timezone);
      const todayMMDD = nowInUserTZ.format('MM-DD');
      const birthdayMMDD = moment(user.birthday).format('MM-DD');

      if (todayMMDD === birthdayMMDD) {
        logger.info(`🎉 Happy Birthday, ${user.name}!`);
      }
    }
  }
}
