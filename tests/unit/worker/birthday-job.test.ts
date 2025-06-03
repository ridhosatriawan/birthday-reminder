import { birthdayJob } from '../../../worker/services/birthday-job';
import * as worker from '../../../worker/services/birthday-worker';
import { logger } from '../../../shared/logging';

jest.mock('../../../worker/services/birthday-worker');
jest.mock('../../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('birthdayJob', () => {
  const mockUsers = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ];

  const mockGetUsersToNotify = worker.getUsersToNotify as jest.Mock;
  const mockProcessBirthdayUsers = worker.processBirthdayUsers as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process users if found', async () => {
    mockGetUsersToNotify.mockResolvedValue(mockUsers);
    mockProcessBirthdayUsers.mockResolvedValue(undefined);

    await birthdayJob();

    expect(mockGetUsersToNotify).toHaveBeenCalled();
    expect(mockProcessBirthdayUsers).toHaveBeenCalledWith(mockUsers);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(`[Job] Found 2 users to notify`),
    );
  });

  it('should log if no users found', async () => {
    mockGetUsersToNotify.mockResolvedValue([]);

    await birthdayJob();

    expect(mockGetUsersToNotify).toHaveBeenCalled();
    expect(mockProcessBirthdayUsers).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(`[Job] No users to notify`),
    );
  });
});
