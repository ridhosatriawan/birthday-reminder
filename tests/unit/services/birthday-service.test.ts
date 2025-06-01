import moment from 'moment-timezone';
import { logger } from '../../../src/applications/logging';
import { User } from '../../../src/models/user-model';
import { BirthdayService } from '../../../src/services/birthday-service';
import * as timezoneUtils from '../../../src/utils/timezone';

jest.mock('../../../src/models/user-model');
const mockUserFind = User.find as jest.Mock;

jest
  .spyOn(timezoneUtils, 'getTimezonesAtNineAM')
  .mockImplementation(() => ['Asia/Jakarta', 'Asia/Bangkok']);

describe('BirthdayService.processBirthdayWishes', () => {
  let infoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => logger);
  });

  afterEach(() => {
    infoSpy.mockRestore();
  });

  it('should log birthday wishes for users with birthdays today in 9AM timezones', async () => {
    const today = moment().tz('Asia/Jakarta').format('MM-DD');

    mockUserFind.mockResolvedValueOnce([
      {
        name: 'Ridho',
        birthday: moment(`1990-${today}`, 'YYYY-MM-DD').toDate(),
        timezone: 'Asia/Jakarta',
      },
      {
        name: 'Lisa',
        birthday: moment(`1991-${today}`, 'YYYY-MM-DD').toDate(),
        timezone: 'Asia/Bangkok',
      },
      {
        name: 'Other',
        birthday: moment(`1992-12-25`, 'YYYY-MM-DD').toDate(),
        timezone: 'Asia/Bangkok',
      },
    ]);

    await BirthdayService.processBirthdayWishes();

    expect(infoSpy).toHaveBeenCalledWith('🎉 Happy Birthday, Ridho!');
    expect(infoSpy).toHaveBeenCalledWith('🎉 Happy Birthday, Lisa!');
    expect(infoSpy).not.toHaveBeenCalledWith('🎉 Happy Birthday, Other!');
  });

  it('should skip when no timezone at 9AM', async () => {
    jest.spyOn(timezoneUtils, 'getTimezonesAtNineAM').mockReturnValueOnce([]);

    await BirthdayService.processBirthdayWishes();

    expect(infoSpy).toHaveBeenCalledWith(
      'No timezones are currently at 9 AM. Skipping birthday processing.',
    );
  });
});
