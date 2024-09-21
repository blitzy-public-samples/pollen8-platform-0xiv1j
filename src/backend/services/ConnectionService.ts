import { Connection } from 'src/backend/models/Connection';
import { User } from 'src/backend/models/User';
import { NetworkValue } from 'src/backend/models/NetworkValue';
import { ConnectionError } from 'src/backend/errors/ConnectionError';
import { sequelize } from 'src/backend/config/database';
import { Op } from 'sequelize';

export class ConnectionService {
  constructor() {}

  async createConnection(userId1: string, userId2: string): Promise<Connection> {
    const transaction = await sequelize.transaction();

    try {
      // Check if both users exist
      const [user1, user2] = await Promise.all([
        User.findByPk(userId1),
        User.findByPk(userId2)
      ]);

      if (!user1 || !user2) {
        throw new ConnectionError('One or both users do not exist');
      }

      // Check if a connection already exists
      const existingConnection = await Connection.findOne({
        where: {
          [Op.or]: [
            { userId1, userId2 },
            { userId1: userId2, userId2: userId1 }
          ]
        }
      });

      if (existingConnection) {
        throw new ConnectionError('Connection already exists between these users');
      }

      // Create a new connection
      const newConnection = await Connection.create({
        userId1,
        userId2,
        strength: 0.1, // Initial strength value
        connectedAt: new Date()
      }, { transaction });

      // Update network values for both users
      await Promise.all([
        this.updateNetworkValue(userId1, transaction),
        this.updateNetworkValue(userId2, transaction)
      ]);

      await transaction.commit();
      return newConnection;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getConnection(connectionId: string): Promise<Connection> {
    const connection = await Connection.findByPk(connectionId);
    if (!connection) {
      throw new ConnectionError('Connection not found');
    }
    return connection;
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    return Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'username'] },
        { model: User, as: 'user2', attributes: ['id', 'username'] }
      ]
    });
  }

  async updateConnectionStrength(connectionId: string, newStrength: number): Promise<Connection> {
    const transaction = await sequelize.transaction();

    try {
      const connection = await Connection.findByPk(connectionId, { transaction });
      if (!connection) {
        throw new ConnectionError('Connection not found');
      }

      connection.strength = newStrength;
      await connection.save({ transaction });

      // Recalculate network values for both users
      await Promise.all([
        this.updateNetworkValue(connection.userId1, transaction),
        this.updateNetworkValue(connection.userId2, transaction)
      ]);

      await transaction.commit();
      return connection;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removeConnection(connectionId: string): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const connection = await Connection.findByPk(connectionId, { transaction });
      if (!connection) {
        throw new ConnectionError('Connection not found');
      }

      const { userId1, userId2 } = connection;
      await connection.destroy({ transaction });

      // Recalculate network values for both users
      await Promise.all([
        this.updateNetworkValue(userId1, transaction),
        this.updateNetworkValue(userId2, transaction)
      ]);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getConnectionStrength(connectionId: string): Promise<number> {
    const connection = await Connection.findByPk(connectionId, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'industries', 'interests'] },
        { model: User, as: 'user2', attributes: ['id', 'industries', 'interests'] }
      ]
    });

    if (!connection) {
      throw new ConnectionError('Connection not found');
    }

    // Calculate strength based on shared industries, interests, and other factors
    const sharedIndustries = connection.user1.industries.filter(industry => 
      connection.user2.industries.includes(industry)
    ).length;
    const sharedInterests = connection.user1.interests.filter(interest => 
      connection.user2.interests.includes(interest)
    ).length;

    // This is a simple calculation and should be adjusted based on specific requirements
    const calculatedStrength = (sharedIndustries * 0.3 + sharedInterests * 0.2 + connection.strength * 0.5);

    return Math.min(calculatedStrength, 1); // Ensure strength is not greater than 1
  }

  private async updateNetworkValue(userId: string, transaction: any): Promise<void> {
    // This method should be implemented to recalculate and update the user's network value
    // It would typically involve fetching the user's connections, calculating a new value,
    // and updating the NetworkValue model
    // For brevity, the implementation is omitted here
  }
}