import { Request, Response, NextFunction } from 'express';
import { NetworkValueService } from 'src/backend/services/NetworkValueService';
import { UserService } from 'src/backend/services/UserService';
import { NetworkValueError } from 'src/backend/errors/NetworkValueError';

export class NetworkValueController {
  private networkValueService: NetworkValueService;
  private userService: UserService;

  constructor(networkValueService: NetworkValueService, userService: UserService) {
    this.networkValueService = networkValueService;
    this.userService = userService;
  }

  public async getNetworkValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const networkValue = await this.networkValueService.getNetworkValue(userId);
      res.status(200).json({ success: true, data: networkValue });
    } catch (error) {
      next(new NetworkValueError('Failed to retrieve network value', error));
    }
  }

  public async calculateNetworkValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const calculatedValue = await this.networkValueService.calculateNetworkValue(userId);
      const updatedNetworkValue = await this.networkValueService.updateNetworkValue(userId, calculatedValue);
      res.status(200).json({ success: true, data: updatedNetworkValue });
    } catch (error) {
      next(new NetworkValueError('Failed to calculate and update network value', error));
    }
  }

  public async getTopNetworkValues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topNetworkValues = await this.networkValueService.getTopNetworkValues(limit);
      res.status(200).json({ success: true, data: topNetworkValues });
    } catch (error) {
      next(new NetworkValueError('Failed to retrieve top network values', error));
    }
  }

  public async recalculateAllNetworkValues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implement proper authorization check for admin users
      if (!req.user.isAdmin) {
        throw new NetworkValueError('Unauthorized access', null, 403);
      }

      await this.networkValueService.recalculateAllNetworkValues();
      res.status(200).json({ success: true, message: 'All network values recalculated successfully' });
    } catch (error) {
      next(new NetworkValueError('Failed to recalculate all network values', error));
    }
  }
}