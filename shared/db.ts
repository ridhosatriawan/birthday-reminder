import mongoose from 'mongoose';
import { logger } from './logging';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  logger.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error while closing MongoDB connection:', error);
  }
};

export async function shutdown(exitCode = 0) {
  try {
    logger.info('shutting down...');
    await disconnectDB();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error during shutdown:', err);
  } finally {
    process.exit(exitCode);
  }
}
