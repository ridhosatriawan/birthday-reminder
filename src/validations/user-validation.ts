import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { z } from 'zod';

export class UserValidation {
  private static readonly objectIdSchema = z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid ObjectId',
    });

  private static readonly nameSchema = z
    .string()
    .min(3, 'Name must be at least 3 character long');

  private static readonly emailSchema = z
    .string()
    .email('Invalid email format');

  private static readonly birthdaySchema = z
    .string()
    .refine((val) => moment(val, 'YYYY-MM-DD', true).isValid(), {
      message: 'Date must be in valid ISO 8601 format YYYY-MM-DD',
    })
    .refine(
      (val) => {
        const date = moment(val, 'YYYY-MM-DD');
        return date.isSameOrBefore(moment(), 'day');
      },
      {
        message: 'Please enter a valid birth date',
      },
    )
    .transform((val) => val);

  private static readonly timeZoneSchema = z
    .string()
    .refine((tz) => moment.tz.zone(tz) !== null, {
      message: 'Invalid IANA timezone format',
    });

  static readonly CREATE = z.object({
    name: this.nameSchema,
    email: this.emailSchema,
    birthday: this.birthdaySchema,
    timezone: this.timeZoneSchema,
  });

  static readonly UPDATE = z
    .object({
      name: this.nameSchema.optional(),
      email: this.emailSchema.optional(),
      birthday: this.birthdaySchema.optional(),
      timezone: this.timeZoneSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    });

  static readonly PARAMS = z.object({
    _id: this.objectIdSchema,
  });
}
