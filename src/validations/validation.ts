import { ZodTypeAny } from 'zod';

export class Validation {
  static validate<T extends ZodTypeAny>(
    schema: T,
    data: unknown,
  ): ReturnType<T['parse']> {
    return schema.parse(data);
  }
}
