import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Connection extends Model {
  public id!: string;
  public userId1!: string;
  public userId2!: string;
  public connectedAt!: Date;
  public strength!: number;

  public static associate(models: any): void {
    Connection.belongsTo(models.User, { as: 'user1', foreignKey: 'userId1' });
    Connection.belongsTo(models.User, { as: 'user2', foreignKey: 'userId2' });
  }

  public async calculateStrength(): Promise<number> {
    // TODO: Implement the strength calculation algorithm
    // This is a placeholder implementation
    const interactionFrequency = await this.getInteractionFrequency();
    const sharedInterests = await this.getSharedInterests();
    const mutualConnections = await this.getMutualConnections();

    const strength = (
      interactionFrequency * 0.4 +
      sharedInterests * 0.3 +
      mutualConnections * 0.3
    );

    return Math.min(Math.max(strength, 0), 1); // Ensure strength is between 0 and 1
  }

  private async getInteractionFrequency(): Promise<number> {
    // TODO: Implement logic to calculate interaction frequency
    return 0.5; // Placeholder value
  }

  private async getSharedInterests(): Promise<number> {
    // TODO: Implement logic to calculate shared interests
    return 0.5; // Placeholder value
  }

  private async getMutualConnections(): Promise<number> {
    // TODO: Implement logic to calculate mutual connections
    return 0.5; // Placeholder value
  }
}

Connection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId1: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    userId2: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    connectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    strength: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1,
      },
    },
  },
  {
    sequelize,
    modelName: 'Connection',
    indexes: [
      { fields: ['userId1'] },
      { fields: ['userId2'] },
      { fields: ['userId1', 'userId2'], unique: true },
    ],
  }
);

// Ensure bidirectional relationships
Connection.addHook('beforeCreate', (connection: Connection) => {
  if (connection.userId1 > connection.userId2) {
    [connection.userId1, connection.userId2] = [connection.userId2, connection.userId1];
  }
});

export default Connection;