import { Invite } from 'src/backend/models/Invite';
import { User } from 'src/backend/models/User';
import { InviteError } from 'src/backend/errors/InviteError';
import { sequelize } from 'src/backend/config/database';
import { Op } from 'sequelize';
import { generateInviteCode } from 'src/backend/utils/codeGenerator';
import { INVITE_CODE_LENGTH } from 'src/shared/constants/index';

export class InviteService {
  constructor() {}

  async createInvite(userId: string): Promise<Invite> {
    try {
      // Check if the user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new InviteError('User not found');
      }

      // Generate a unique invite code
      let inviteCode = generateInviteCode(INVITE_CODE_LENGTH);
      let existingInvite = await Invite.findOne({ where: { inviteCode } });
      while (existingInvite) {
        inviteCode = generateInviteCode(INVITE_CODE_LENGTH);
        existingInvite = await Invite.findOne({ where: { inviteCode } });
      }

      // Create a new invite in the database
      const invite = await Invite.create({
        creatorId: userId,
        inviteCode,
        clicks: 0,
        isActive: true,
      });

      return invite;
    } catch (error) {
      throw new InviteError('Failed to create invite');
    }
  }

  async getInvite(inviteCode: string): Promise<Invite> {
    try {
      const invite = await Invite.findOne({ where: { inviteCode } });
      if (!invite) {
        throw new InviteError('Invite not found');
      }
      return invite;
    } catch (error) {
      throw new InviteError('Failed to retrieve invite');
    }
  }

  async getUserInvites(userId: string): Promise<Invite[]> {
    try {
      const invites = await Invite.findAll({ where: { creatorId: userId } });
      return invites;
    } catch (error) {
      throw new InviteError('Failed to retrieve user invites');
    }
  }

  async incrementInviteClicks(inviteCode: string): Promise<Invite> {
    try {
      const invite = await Invite.findOne({ where: { inviteCode } });
      if (!invite) {
        throw new InviteError('Invite not found');
      }

      invite.clicks += 1;
      await invite.save();

      return invite;
    } catch (error) {
      throw new InviteError('Failed to increment invite clicks');
    }
  }

  async deactivateInvite(inviteCode: string): Promise<Invite> {
    try {
      const invite = await Invite.findOne({ where: { inviteCode } });
      if (!invite) {
        throw new InviteError('Invite not found');
      }

      invite.isActive = false;
      await invite.save();

      return invite;
    } catch (error) {
      throw new InviteError('Failed to deactivate invite');
    }
  }

  async getInviteStats(userId: string): Promise<object> {
    try {
      const totalInvites = await Invite.count({ where: { creatorId: userId } });
      const totalClicks = await Invite.sum('clicks', { where: { creatorId: userId } });
      
      // Assuming we have a way to track successful signups from invites
      const successfulSignups = await Invite.count({
        where: {
          creatorId: userId,
          // Add condition for successful signup, e.g., hasSignup: true
        }
      });

      const conversionRate = totalClicks > 0 ? successfulSignups / totalClicks : 0;

      return {
        totalInvites,
        totalClicks,
        successfulSignups,
        conversionRate
      };
    } catch (error) {
      throw new InviteError('Failed to retrieve invite statistics');
    }
  }
}