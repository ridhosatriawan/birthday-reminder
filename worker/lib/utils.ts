import moment from 'moment-timezone';
import { BIRTHDAY_EMAIL_HOUR, BIRTHDAY_EMAIL_MINUTE } from './constant';

export function getNextBday(birthday: Date, timezone: string) {
  const birthDate = moment(birthday).tz(timezone);

  let nextBday = moment()
    .tz(timezone)
    .month(birthDate.month())
    .date(birthDate.date())
    .hour(BIRTHDAY_EMAIL_HOUR)
    .minute(BIRTHDAY_EMAIL_MINUTE)
    .second(0);

  return nextBday;
}
