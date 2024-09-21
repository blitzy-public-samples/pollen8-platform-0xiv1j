import { Request, Response, NextFunction } from 'express';
import { UserService } from 'src/backend/services/UserService';
import { ConnectionService } from 'src/backend/services/ConnectionService';
import { NetworkValueService } from 'src/backend/services/NetworkValueService';
import { UserError } from 'src/backend/errors/UserError';

export class UserController {
  private userService: UserService;
  private connectionService: ConnectionService;
  private networkValueService: NetworkValueService;

  constructor(
    userService: UserService,
    connectionService: ConnectionService,
    networkValueService: NetworkValueService
  ) {
    this.userService = userService;
    this.connectionService = connectionService;
    this.networkValueService = networkValueService;
  }

  public getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const user = await this.userService.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(new UserError('Failed to retrieve user profile', 500, error));
    }
  }

  public updateUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id; // Assuming the user ID is attached to the request by authentication middleware
      const updateData = req.body;
      const updatedUser = await this.userService.updateUserProfile(userId, updateData);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(new UserError('Failed to update user profile', 500, error));
    }
  }

  public getUserConnections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const connections = await this.connectionService.getUserConnections(userId);
      res.status(200).json({ success: true, data: connections });
    } catch (error) {
      next(new UserError('Failed to retrieve user connections', 500, error));
    }
  }

  public createConnection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id; // Assuming the user ID is attached to the request by authentication middleware
      const targetUserId = req.body.targetUserId;
      const connection = await this.connectionService.createConnection(userId, targetUserId);
      res.status(201).json({ success: true, data: connection });
    } catch (error) {
      next(new UserError('Failed to create connection', 500, error));
    }
  }

  public getUserNetworkValue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const networkValue = await this.networkValueService.getNetworkValue(userId);
      res.status(200).json({ success: true, data: networkValue });
    } catch (error) {
      next(new UserError('Failed to retrieve user network value', 500, error));
    }
  }

  public searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searchParams = req.query;
      const users = await this.userService.searchUsers(searchParams);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(new UserError('Failed to search users', 500, error));
    }
  }
}