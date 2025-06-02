import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { UserValidation } from '../../../src/validations/user-validation';

describe('UserValidation', () => {
  const validData = {
    name: 'Ridho',
    email: 'ridho@mail.com',
    birthday: '1990-01-01',
    timezone: 'Asia/Jakarta',
  };

  describe('CREATE schema', () => {
    it('should pass with valid data', () => {
      expect(() => UserValidation.CREATE.parse(validData)).not.toThrow();
    });

    it('should fail if name is too short', () => {
      expect(() =>
        UserValidation.CREATE.parse({ ...validData, name: 'Al' }),
      ).toThrow(ZodError);
    });

    it('should fail with invalid email', () => {
      expect(() =>
        UserValidation.CREATE.parse({ ...validData, email: 'wrong' }),
      ).toThrow(ZodError);
    });

    it('should fail with invalid birthday format', () => {
      expect(() =>
        UserValidation.CREATE.parse({ ...validData, birthday: '01-01-1990' }),
      ).toThrow(ZodError);
    });

    it('should fail with future birthday', () => {
      const futureDate = moment().add(1, 'day').format('YYYY-MM-DD');
      expect(() =>
        UserValidation.CREATE.parse({ ...validData, birthday: futureDate }),
      ).toThrow(ZodError);
    });

    it('should fail with invalid timezone', () => {
      expect(() =>
        UserValidation.CREATE.parse({ ...validData, timezone: 'Not/Real' }),
      ).toThrow(ZodError);
    });

    it('should transform birthday into Date object', () => {
      const result = UserValidation.CREATE.parse(validData);
      expect(result.birthday).toBe('1990-01-01');
    });
  });

  describe('UPDATE schema', () => {
    it('should pass with one valid field', () => {
      expect(() =>
        UserValidation.UPDATE.parse({ name: 'Updated Name' }),
      ).not.toThrow();
    });

    it('should fail with no fields', () => {
      expect(() => UserValidation.UPDATE.parse({})).toThrow(ZodError);
    });

    it('should fail with invalid email', () => {
      expect(() => UserValidation.UPDATE.parse({ email: 'invalid' })).toThrow(
        ZodError,
      );
    });
  });

  describe('PARAMS schema', () => {
    it('should pass with valid ObjectId', () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      expect(() => UserValidation.PARAMS.parse({ _id: validId })).not.toThrow();
    });

    it('should fail with invalid ObjectId', () => {
      expect(() => UserValidation.PARAMS.parse({ _id: '123' })).toThrow(
        ZodError,
      );
    });
  });
});
