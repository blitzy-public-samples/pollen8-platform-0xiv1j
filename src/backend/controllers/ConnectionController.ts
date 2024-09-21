import { Request, Response, NextFunction } from 'express';
import { ConnectionService } from 'src/backend/services/ConnectionService';
import { UserService } from 'src/backend/services/UserService';
import { NetworkValueService } from 'src/backend/services/NetworkValueService';
import { ConnectionError } from 'src/backend/errors/ConnectionError';

export class ConnectionController {
  private connectionService: ConnectionService;
  private userService: UserService;
  private networkValueService: NetworkValueService;

  constructor(
    connectionService: ConnectionService,
    userService: UserService,
    networkValueService: NetworkValueService
  ) {
    this.connectionService = connectionService;
    this.userService = userService;
    this.networkValueService = networkValueService;
  }

  async createConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId1 = req.user.id; // Assuming authenticated user's ID is available in req.user
      const { userId2 } = req.body;

      // Validate that both users exist
      const [user1, user2] = await Promise.all([
        this.userService.getUserById(userId1),
        this.userService.getUserById(userId2)
      ]);

      if (!user1 || !user2) {
        throw new ConnectionError('One or both users do not exist');
      }

      const connection = await this.connectionService.createConnection(userId1, userId2);

      // Update network values for both users
      await Promise.all([
        this.networkValueService.updateNetworkValue(userId1),
        this.networkValueService.updateNetworkValue(userId2)
      ]);

      res.status(201).json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }

  async getConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { connectionId } = req.params;
      const connection = await this.connectionService.getConnection(connectionId);

      if (!connection) {
        throw new ConnectionError('Connection not found');
      }

      res.status(200).json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }

  async getUserConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const connections = await this.connectionService.getUserConnections(userId);
      res.status(200).json({ success: true, data: connections });
    } catch (error) {
      next(error);
    }
  }

  async updateConnectionStrength(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { connectionId } = req.params;
      const { strength } = req.body;

      const updatedConnection = await this.connectionService.updateConnectionStrength(connectionId, strength);

      // Update network values for both users involved in the connection
      await Promise.all([
        this.networkValueService.updateNetworkValue(updatedConnection.userId1),
        this.networkValueService.updateNetworkValue(updatedConnection.userId2)
      ]);

      res.status(200).json({ success: true, data: updatedConnection });
    } catch (error) {
      next(error);
    }
  }

  async removeConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { connectionId } = req.params;
      const removedConnection = await this.connectionService.removeConnection(connectionId);

      // Update network values for both users involved in the removed connection
      await Promise.all([
        this.networkValueService.updateNetworkValue(removedConnection.userId1),
        this.networkValueService.updateNetworkValue(removedConnection.userId2)
      ]);

      res.status(200).json({ success: true, message: 'Connection removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getConnectionStrength(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { connectionId } = req.params;
      const strength = await this.connectionService.getConnectionStrength(connectionId);
      res.status(200).json({ success: true, data: { strength } });
    } catch (error) {
      next(error);
    }
  }
}