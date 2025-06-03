export type User = {
  name: string;
  email: string;
  birthday: string;
  timezone: string;
};

export type CreateUserReqBody = User;
export type UpdateUserReqBody = {
  name?: string;
  email?: string;
  birthday?: string;
  timezone?: string;
};

export type UserReqParams = {
  _id: string;
};
