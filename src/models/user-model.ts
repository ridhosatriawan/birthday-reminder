import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  birthday: Date;
  timezone: string;
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
    },
    birthday: {
      type: Date,
      required: [true, 'Birthday is required'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
    },
  },
  { timestamps: true },
).set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const User = model<IUser>('User', UserSchema);
