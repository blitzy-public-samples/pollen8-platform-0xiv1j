import { NetworkValue } from 'src/backend/models/NetworkValue';
import { User } from 'src/backend/models/User';
import { Connection } from 'src/backend/models/Connection';
import { NetworkValueError } from 'src/backend/errors/NetworkValueError';
import { sequelize } from 'src/backend/config/database';
import { Op } from 'sequelize';

export class NetworkValueService {
  constructor() {}

  async calculateNetworkValue(userId: string): Promise<number> {
    try {
      const user = await User.findByPk(userId, {
        include: [
          { model: Connection, as: 'connections' },
          { model: User, as: 'industries' }
        ]
      });

      if (!user) {
        throw new NetworkValueError('User not found');
      }

      // Calculate base value based on profile completeness
      let baseValue = this.calculateProfileCompleteness(user);

      // Calculate connection value
      const connectionValue = this.calculateConnectionValue(user.connections);

      // Calculate industry value
      const industryValue = this.calculateIndustryValue(user.industries, user.connections);

      // Combine factors to determine final network value
      const networkValue = baseValue + connectionValue + industryValue;

      return Math.round(networkValue * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating network value:', error);
      throw new NetworkValueError('Failed to calculate network value');
    }
  }

  async updateNetworkValue(userId: string): Promise<NetworkValue> {
    const transaction = await sequelize.transaction();

    try {
      const newValue = await this.calculateNetworkValue(userId);

      const [networkValue, created] = await NetworkValue.findOrCreate({
        where: { userId },
        defaults: { value: newValue, calculatedAt: new Date() },
        transaction
      });

      if (!created) {
        networkValue.value = newValue;
        networkValue.calculatedAt = new Date();
        await networkValue.save({ transaction });
      }

      await transaction.commit();
      return networkValue;
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating network value:', error);
      throw new NetworkValueError('Failed to update network value');
    }
  }

  async getNetworkValue(userId: string): Promise<NetworkValue> {
    const networkValue = await NetworkValue.findOne({ where: { userId } });
    if (!networkValue) {
      throw new NetworkValueError('Network value not found for user');
    }
    return networkValue;
  }

  async getTopNetworkValues(limit: number): Promise<NetworkValue[]> {
    return NetworkValue.findAll({
      order: [['value', 'DESC']],
      limit,
      include: [{ model: User, attributes: ['id', 'username'] }]
    });
  }

  async recalculateAllNetworkValues(): Promise<void> {
    try {
      const users = await User.findAll();
      for (const user of users) {
        await this.updateNetworkValue(user.id);
      }
      console.log('Recalculation of all network values completed');
    } catch (error) {
      console.error('Error recalculating network values:', error);
      throw new NetworkValueError('Failed to recalculate network values');
    }
  }

  private calculateProfileCompleteness(user: User): number {
    // Implement logic to calculate profile completeness
    // This is a placeholder implementation
    let completeness = 0;
    if (user.username) completeness += 0.2;
    if (user.location) completeness += 0.2;
    if (user.industries.length > 0) completeness += 0.3;
    if (user.interests.length > 0) completeness += 0.3;
    return completeness * 10; // Scale to a 0-10 value
  }

  private calculateConnectionValue(connections: Connection[]): number {
    // Implement logic to calculate value based on connections
    // This is a placeholder implementation
    return connections.reduce((total, connection) => total + connection.strength, 0);
  }

  private calculateIndustryValue(userIndustries: any[], connections: Connection[]): number {
    // Implement logic to calculate value based on industries
    // This is a placeholder implementation
    const industryOverlap = connections.filter(connection => 
      connection.user.industries.some(industry => 
        userIndustries.includes(industry)
      )
    ).length;
    return industryOverlap * 0.5;
  }
}