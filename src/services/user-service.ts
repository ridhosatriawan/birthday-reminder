import { ResponseError } from '../error/response-error';
import { User } from '../models/user-model';
import {
  CreateUserReqBody,
  UpdateUserReqBody,
  UserReqParams,
} from '../types/user.type';
import { UserValidation } from '../validations/user-validation';
import { Validation } from '../validations/validation';

export class UserService {
  public static async getUserById(params: UserReqParams) {
    const dataParams = Validation.validate(UserValidation.PARAMS, params);
    const user = await User.findById(dataParams._id);

    if (!user) {
      throw new ResponseError(404, 'User not found');
    }

    return user;
  }

  public static async createUser(body: CreateUserReqBody) {
    const data = Validation.validate(UserValidation.CREATE, body);
    const created = await User.create({
      name: data.name,
      email: data.email,
      birthday: data.birthday,
      timezone: data.timezone,
    });

    return created;
  }

  public static async updateUser(
    params: UserReqParams,
    body: UpdateUserReqBody,
  ) {
    const dataParams = Validation.validate(UserValidation.PARAMS, params);
    const dataBody = Validation.validate(UserValidation.UPDATE, body);

    const updated = await User.findByIdAndUpdate(
      dataParams._id,
      { ...dataBody },
      {
        new: true,
      },
    );

    return updated;
  }

  public static async deleteUser(params: UserReqParams) {
    const dataParams = Validation.validate(UserValidation.PARAMS, params);
    const deleted = await User.findByIdAndDelete(dataParams._id);

    if (!deleted) {
      throw new ResponseError(404, 'User not found');
    }

    return;
  }
}
