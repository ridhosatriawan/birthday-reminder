import retry from 'async-retry';
import { IUser, User } from '../../../api/models/user-model';
import {
  getUsersToNotify,
  processBirthdayUsers,
  sendEmailWithRetry,
} from '../../../worker/services/birthday-worker';
import { sendEmail } from '../../../worker/services/email-service';

jest.mock('../../../api/models/user-model');
jest.mock('../../../worker/services/email-service');
jest.mock('async-retry');
describe('Birthday Notification Service', () => {
  const mockUser: IUser = {
    _id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    birthday: new Date('1990-01-01'),
    timezone: 'America/New_York',
    nextBirthday: new Date('2023-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser;

  beforeEach(() => {
    jest.clearAllMocks();

    (User.aggregate as jest.Mock).mockReset();
    (sendEmail as jest.Mock).mockReset();
    (retry as jest.Mock).mockImplementation((fn) => fn());
    (User.findByIdAndUpdate as jest.Mock).mockReset();
  });

  describe('getUsersToNotify', () => {
    it('should return users whose birthday is today and local time is 9AM', async () => {
      const mockNow = new Date('2023-01-01T14:00:00Z');
      (User.aggregate as jest.Mock).mockResolvedValue([mockUser]);

      const result = await getUsersToNotify(mockNow);

      expect(User.aggregate).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array if no users match criteria', async () => {
      (User.aggregate as jest.Mock).mockResolvedValue([]);
      const result = await getUsersToNotify(new Date());
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('sendEmailWithRetry', () => {
    it('should successfully send email with correct content', async () => {
      (sendEmail as jest.Mock).mockResolvedValue(true);

      await sendEmailWithRetry(mockUser);

      expect(sendEmail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: `🎉 Happy Birthday, ${mockUser.name}!`,
        body: `Wishing you a wonderful day, ${mockUser.name}! 🎂`,
      });
    });

    it('should retry 3 times on failure', async () => {
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Failed'));
      (retry as jest.Mock).mockImplementation(async (fn, opts) => {
        try {
          await fn();
        } catch (error) {
          if (opts.onRetry) {
            opts.onRetry(error, 3);
          }
          throw error;
        }
      });

      await expect(sendEmailWithRetry(mockUser)).rejects.toThrow('Failed');
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(retry).toHaveBeenCalledWith(expect.any(Function), {
        retries: 3,
        minTimeout: 1000,
      });
    });
  });

  describe('processBirthdayUsers', () => {
    const mockUsers: IUser[] = [
      mockUser,
      {
        ...mockUser,
        _id: '456',
        email: 'jane@example.com',
        name: 'Jane Doe',
      } as IUser,
    ];

    it('should process all users successfully', async () => {
      (sendEmail as jest.Mock).mockResolvedValue(true);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      await processBirthdayUsers(mockUsers);

      expect(sendEmail).toHaveBeenCalledTimes(mockUsers.length);
      expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(mockUsers.length);
    });

    it('should continue processing if one user fails', async () => {
      (sendEmail as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('Failed'));
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      await processBirthdayUsers(mockUsers);

      expect(sendEmail).toHaveBeenCalledTimes(mockUsers.length);
      expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
