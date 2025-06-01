import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { UserReqParams } from '../types/user.type';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const response = await UserService.createUser(body);

      res.status(201).json({
        success: true,
        message: 'success',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const params = req.params as UserReqParams;
      const response = await UserService.updateUser(params, body);

      res.status(200).json({
        success: true,
        message: 'success',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as UserReqParams;
      await UserService.deleteUser(params);

      res.status(204).json({
        success: true,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as UserReqParams;
      const response = await UserService.getUserById(params);

      res.status(200).json({
        success: true,
        message: 'success',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
