import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError, ZodIssue } from 'zod';
import { ResponseError } from '../../../src/error/response-error';
import { errorMiddleware } from '../../../src/middlewares/error-middleware';

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
}

describe('errorMiddleware', () => {
  let req: Partial<Request>;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('handles ZodError → status 400, type "validation"', () => {
    let zodErr: ZodError;
    try {
      (ZodError as any).parse ?? ZodError;
      throw new ZodError([
        {
          code: 'custom',
          path: ['field'],
          message: 'invalid type',
        } as ZodIssue,
      ]);
    } catch (err) {
      zodErr = err as ZodError;
    }

    errorMiddleware(zodErr!, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: zodErr.errors[0].message,
      type: 'validation',
    });
  });

  it('handles mongoose.ValidationError → status 400, type "mongoose_validation"', () => {
    const valError = new mongoose.Error.ValidationError();

    valError.errors = {
      name: new mongoose.Error.ValidatorError({
        message: 'Name is required',
        path: 'name',
        value: '',
      }),
    };

    errorMiddleware(valError, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: ['Name is required'],
      type: 'mongoose_validation',
    });
  });

  it('handles mongoose.CastError → status 400, type "cast_error"', () => {
    const castErr = new mongoose.Error.CastError(
      'ObjectId',
      'notAnObjectId',
      'userId',
    );

    errorMiddleware(castErr, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid value for field 'userId': notAnObjectId",
      type: 'cast_error',
    });
  });

  it('handles mongoose.DocumentNotFoundError → status 404, type "not_found"', () => {
    const docNotFound = new mongoose.Error.DocumentNotFoundError('');

    errorMiddleware(docNotFound, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Document not found',
      type: 'not_found',
    });
  });

  it('handles mongoose.mongo.MongoServerError (duplicate key) → status 409, type "duplicate"', () => {
    const serverErr = new mongoose.mongo.MongoServerError({
      ok: 0,
      code: 11000,
      codeName: 'DuplicateKey',
      keyValue: { email: 'alice@example.com' },
      errmsg:
        'E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "alice@example.com" }',
    });

    errorMiddleware(serverErr as any, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'email already exists',
      type: 'duplicate',
    });
  });

  it('handles custom ResponseError → uses its status and message', () => {
    const respErr = new ResponseError(418, 'Custom error message');
    errorMiddleware(respErr, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Custom error message',
    });
  });

  it('handles generic Error → status 500, type "internal"', () => {
    const genErr = new Error('Something went wrong');
    errorMiddleware(genErr, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Something went wrong',
      type: 'internal',
    });
  });
});
