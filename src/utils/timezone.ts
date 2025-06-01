import moment from 'moment-timezone';

export function getTimezonesAtNineAM(): string[] {
  const timezones = moment.tz.names();
  const result: string[] = [];

  timezones.forEach((tz) => {
    const now = moment().tz(tz);
    if (now.hour() === 9 && now.minute() === 0) {
      result.push(tz);
    }
  });

  return result;
}

export function getTodayString(format = 'MM-DD'): string {
  return moment().format(format);
}

export function formatDate(date: string, format = 'MM-DD'): string {
  return moment(date).format(format);
}
