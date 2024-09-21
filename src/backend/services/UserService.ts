import { User } from '../models/User';
import { Industry } from '../models/Industry';
import { Interest } from '../models/Interest';
import { Connection } from '../models/Connection';
import { NetworkValue } from '../models/NetworkValue';
import { UserError } from '../errors/UserError';
import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';

export class UserService {
  constructor() {}

  async getUserById(userId: string): Promise<User> {
    try {
      const user = await User.findByPk(userId, {
        include: [
          { model: Industry, as: 'industries' },
          { model: Interest, as: 'interests' }
        ]
      });

      if (!user) {
        throw new UserError('User not found');
      }

      return user;
    } catch (error) {
      throw new UserError(`Error retrieving user: ${error.message}`);
    }
  }

  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new UserError('User not found');
      }

      // Update user properties
      Object.assign(user, updateData);

      // Handle industry and interest associations
      if (updateData.industries) {
        await user.setIndustries(updateData.industries, { transaction });
      }
      if (updateData.interests) {
        await user.setInterests(updateData.interests, { transaction });
      }

      await user.save({ transaction });
      await transaction.commit();

      return user.reload({
        include: [
          { model: Industry, as: 'industries' },
          { model: Interest, as: 'interests' }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw new UserError(`Error updating user profile: ${error.message}`);
    }
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    try {
      const connections = await Connection.findAll({
        where: {
          [sequelize.Op.or]: [{ userId1: userId }, { userId2: userId }]
        },
        include: [
          { model: User, as: 'user1', attributes: ['id', 'username'] },
          { model: User, as: 'user2', attributes: ['id', 'username'] }
        ]
      });

      return connections;
    } catch (error) {
      throw new UserError(`Error retrieving user connections: ${error.message}`);
    }
  }

  async getUserNetworkValue(userId: string): Promise<NetworkValue> {
    try {
      let networkValue = await NetworkValue.findOne({ where: { userId } });

      if (!networkValue) {
        // If not found, calculate and create a new network value
        // This is a placeholder calculation and should be replaced with actual logic
        const calculatedValue = Math.random() * 100; // Replace with actual calculation
        networkValue = await NetworkValue.create({
          userId,
          value: calculatedValue,
          calculatedAt: new Date()
        });
      }

      return networkValue;
    } catch (error) {
      throw new UserError(`Error retrieving user network value: ${error.message}`);
    }
  }

  async searchUsers(searchParams: any): Promise<User[]> {
    try {
      const query: any = {};

      if (searchParams.username) {
        query.username = { [sequelize.Op.iLike]: `%${searchParams.username}%` };
      }

      if (searchParams.location) {
        query.location = { [sequelize.Op.iLike]: `%${searchParams.location}%` };
      }

      const include: any[] = [];

      if (searchParams.industries) {
        include.push({
          model: Industry,
          as: 'industries',
          where: { id: searchParams.industries }
        });
      }

      if (searchParams.interests) {
        include.push({
          model: Interest,
          as: 'interests',
          where: { id: searchParams.interests }
        });
      }

      const users = await User.findAll({
        where: query,
        include: include
      });

      return users;
    } catch (error) {
      throw new UserError(`Error searching users: ${error.message}`);
    }
  }
}