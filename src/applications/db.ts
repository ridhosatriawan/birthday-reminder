import mongoose from 'mongoose';
import { logger } from './logging';
import 'dotenv/config';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(uri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
