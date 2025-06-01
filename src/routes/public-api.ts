import express from 'express';
import { UserController } from '../controllers/user-controller';

export const publicRouter = express.Router();

publicRouter.get('/api/users/:_id', UserController.getUserById);
publicRouter.post('/api/users', UserController.createUser);
publicRouter.patch('/api/users/:_id', UserController.updateUser);
publicRouter.delete('/api/users/:_id', UserController.deleteUser);
