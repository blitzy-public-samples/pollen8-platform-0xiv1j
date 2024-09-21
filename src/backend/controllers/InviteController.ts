import { Request, Response, NextFunction } from 'express';
import { InviteService } from 'src/backend/services/InviteService';
import { UserService } from 'src/backend/services/UserService';
import { InviteError } from 'src/backend/errors/InviteError';

export class InviteController {
  private inviteService: InviteService;
  private userService: UserService;

  constructor(inviteService: InviteService, userService: UserService) {
    this.inviteService = inviteService;
    this.userService = userService;
  }

  public createInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id; // Assuming user ID is attached to req.user by auth middleware
      const invite = await this.inviteService.createInvite(userId);
      res.status(201).json({ success: true, data: invite });
    } catch (error) {
      next(error);
    }
  }

  public getInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inviteCode } = req.params;
      const invite = await this.inviteService.getInvite(inviteCode);
      res.status(200).json({ success: true, data: invite });
    } catch (error) {
      next(error);
    }
  }

  public getUserInvites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const invites = await this.inviteService.getUserInvites(userId);
      res.status(200).json({ success: true, data: invites });
    } catch (error) {
      next(error);
    }
  }

  public incrementInviteClicks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inviteCode } = req.params;
      const updatedInvite = await this.inviteService.incrementInviteClicks(inviteCode);
      res.status(200).json({ success: true, data: updatedInvite });
    } catch (error) {
      next(error);
    }
  }

  public deactivateInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inviteCode } = req.params;
      const userId = req.user.id;

      // Verify ownership
      const invite = await this.inviteService.getInvite(inviteCode);
      if (invite.creatorId !== userId) {
        throw new InviteError('Unauthorized to deactivate this invite', 403);
      }

      const updatedInvite = await this.inviteService.deactivateInvite(inviteCode);
      res.status(200).json({ success: true, data: updatedInvite });
    } catch (error) {
      next(error);
    }
  }

  public getInviteStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const stats = await this.inviteService.getInviteStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}