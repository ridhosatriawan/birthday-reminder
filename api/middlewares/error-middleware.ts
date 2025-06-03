import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ResponseError } from '../error/response-error';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: error.errors[0].message,
      type: 'validation',
    });
  } else if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      error: 'Validation failed',
      details: Object.values(error.errors).map((e) => e.message),
      type: 'mongoose_validation',
    });
  } else if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: `Invalid value for field '${error.path}': ${error.value}`,
      type: 'cast_error',
    });
  } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
    res.status(404).json({
      error: 'Document not found',
      type: 'not_found',
    });
  } else if (error instanceof mongoose.mongo.MongoServerError) {
    const duplicatedField = Object.keys(
      (error as mongoose.mongo.MongoServerError).keyValue || {},
    )[0];
    res.status(409).json({
      error: `${duplicatedField} already exists`,
      type: 'duplicate',
    });
  } else if (error instanceof ResponseError) {
    res.status(error.status).json({
      error: error.message,
    });
  } else {
    res.status(500).json({
      error: error.message || 'Internal Server Error',
      type: 'internal',
    });
  }
};
