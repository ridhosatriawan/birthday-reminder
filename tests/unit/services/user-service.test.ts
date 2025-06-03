import { ResponseError } from '../../../api/error/response-error';
import { User } from '../../../api/models/user-model';
import { UserService } from '../../../api/services/user-service';
import { Validation } from '../../../api/validations/validation';

jest.mock('../../../api/models/user-model');
jest.mock('../../../api/validations/validation', () => ({
  Validation: {
    validate: jest.fn(),
  },
}));

const mockedUser = {
  _id: '1a2b3c4d5e',
  name: 'Ridho Satriawan',
  email: 'ridho@mail.com',
  birthday: '1990-01-01',
  timezone: 'Asia/Jakarta',
};

describe('UserService - Success Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      (Validation.validate as jest.Mock).mockReturnValue({ _id: '1a2b3c4d5e' });
      (User.findById as jest.Mock).mockResolvedValue(mockedUser);

      const result = await UserService.getUserById({ _id: '1a2b3c4d5e' });

      expect(Validation.validate).toHaveBeenCalledWith(expect.anything(), {
        _id: '1a2b3c4d5e',
      });
      expect(User.findById).toHaveBeenCalledWith('1a2b3c4d5e');
      expect(result).toEqual(mockedUser);
    });
  });

  describe('createUser', () => {
    it('should create a user and return the created user', async () => {
      const body = {
        name: 'Ridho Satriawan',
        email: 'ridho@mail.com',
        birthday: '1990-01-01',
        timezone: 'Asia/Jakarta',
      };

      (Validation.validate as jest.Mock).mockReturnValue(body);
      (User.create as jest.Mock).mockResolvedValue({
        _id: '1a2b3c4d5e',
        ...body,
      });

      const result = await UserService.createUser(body);

      expect(Validation.validate).toHaveBeenCalledWith(expect.anything(), body);
      expect(User.create).toHaveBeenCalledWith(body);
      expect(result).toEqual({ _id: '1a2b3c4d5e', ...body });
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the updated user', async () => {
      const params = { _id: '1a2b3c4d5e' };
      const body = { name: 'Mike Wazowski' };
      const updatedUser = {
        ...mockedUser,
        name: 'Mike Wazowski',
        save: jest.fn().mockResolvedValue(true),
      };

      (Validation.validate as jest.Mock)
        .mockImplementationOnce(() => params)
        .mockImplementationOnce(() => body);

      (User.findById as jest.Mock).mockResolvedValue(updatedUser);

      const result = await UserService.updateUser(params, body);

      expect(Validation.validate).toHaveBeenCalledTimes(2);
      expect(User.findById).toHaveBeenCalledWith('1a2b3c4d5e');
      expect(updatedUser.name).toBe('Mike Wazowski');
      expect(updatedUser.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const params = { _id: '1a2b3c4d5e' };

      (Validation.validate as jest.Mock).mockReturnValue(params);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue({
        _id: '1a2b3c4d5e',
      });

      await expect(UserService.deleteUser(params)).resolves.toBeUndefined();
    });
  });
});

describe('UserService - Failure Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should throw if validation fails', async () => {
      (Validation.validate as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      await expect(UserService.getUserById({ _id: '9e9e9e' })).rejects.toThrow(
        'Invalid ID',
      );
    });

    it('should return null if user not found', async () => {
      (Validation.validate as jest.Mock).mockReturnValue({ _id: '1a2b3c4d5e' });
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.getUserById({ _id: '1a2b3c4d5e' }),
      ).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('should throw if validation fails', async () => {
      (Validation.validate as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid user data');
      });

      const body = {
        name: '',
        email: 'ridho@mail',
        birthday: '',
        timezone: '',
      };

      await expect(UserService.createUser(body as any)).rejects.toThrow(
        'Invalid user data',
      );
    });

    it('should throw if database create fails', async () => {
      const validData = {
        name: 'Mike Wazowski',
        email: 'james@example.com',
        birthday: '1995-01-01',
        timezone: 'Asia/Jakarta',
      };

      (Validation.validate as jest.Mock).mockReturnValue(validData);
      (User.create as jest.Mock).mockImplementation(() => {
        throw new Error('DB create failed');
      });

      await expect(UserService.createUser(validData)).rejects.toThrow(
        'DB create failed',
      );
    });
  });

  describe('updateUser', () => {
    it('should throw if validation of params fails', async () => {
      (Validation.validate as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid ID');
      });

      await expect(
        UserService.updateUser({ _id: 'x' }, { name: 'X' }),
      ).rejects.toThrow('Invalid ID');
    });

    it('should throw if validation of body fails', async () => {
      (Validation.validate as jest.Mock)
        .mockImplementationOnce(() => ({ _id: '1a2b3c4d5e' }))
        .mockImplementationOnce(() => {
          throw new Error('Bad data');
        });

      await expect(
        UserService.updateUser({ _id: '1a2b3c4d5e' }, { name: '' }),
      ).rejects.toThrow('Bad data');
    });

    it('should throw not found for update', async () => {
      (Validation.validate as jest.Mock)
        .mockImplementationOnce(() => ({ _id: '1a2b3c4d5e' }))
        .mockImplementationOnce(() => ({ name: 'Updated Name' }));

      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.updateUser({ _id: '1a2b3c4d5e' }, { name: 'Updated Name' }),
      ).rejects.toThrow(ResponseError);
    });
  });

  describe('deleteUser', () => {
    it('should throw if validation fails', async () => {
      (Validation.validate as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      await expect(UserService.deleteUser({ _id: 'bad-id' })).rejects.toThrow(
        'Invalid ID',
      );
    });

    it('should throw if delete fails', async () => {
      (Validation.validate as jest.Mock).mockReturnValue({ _id: '1a2b3c4d5e' });
      (User.findByIdAndDelete as jest.Mock).mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await expect(
        UserService.deleteUser({ _id: '1a2b3c4d5e' }),
      ).rejects.toThrow('Delete failed');
    });
  });
});
