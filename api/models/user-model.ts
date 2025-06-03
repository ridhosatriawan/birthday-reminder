import moment from 'moment-timezone';
import { Document, Schema, model } from 'mongoose';
import { getNextBday } from '../../worker/lib/utils';

export interface IUser extends Document {
  name: string;
  email: string;
  birthday: Date;
  timezone: string;
  nextBirthday?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    birthday: {
      type: Date,
      required: [true, 'Birthday is required'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
    },
    nextBirthday: { type: Date, index: true },
  },
  { timestamps: true },
).set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

UserSchema.pre<IUser>('save', function (next) {
  this.nextBirthday = calculateNextBirthday(this.birthday, this.timezone);
  next();
});

export function calculateNextBirthday(birthday: Date, timezone: string): Date {
  let nextBday = getNextBday(birthday, timezone);
  const today = moment().tz(timezone);

  if (nextBday.isBefore(today)) {
    nextBday = nextBday.add(1, 'year');
  }

  return nextBday.toDate();
}

export const User = model<IUser>('User', UserSchema);
