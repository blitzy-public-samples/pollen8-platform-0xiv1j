import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class NetworkValue extends Model {
  public id!: string;
  public userId!: string;
  public value!: number;
  public calculatedAt!: Date;

  public static associate(models: any) {
    NetworkValue.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }

  public static async calculateNetworkValue(user: User): Promise<number> {
    // TODO: Implement the network value calculation algorithm
    // This is a placeholder implementation and should be replaced with the actual algorithm
    
    const connections = await user.getConnections();
    let networkValue = 0;

    for (const connection of connections) {
      const connectionNetworkValue = await NetworkValue.findOne({ where: { userId: connection.id } });
      if (connectionNetworkValue) {
        networkValue += connectionNetworkValue.value * connection.strength;
      }
    }

    // Apply additional factors (e.g., industry overlap, user activity)
    // ...

    // Update the network value
    await NetworkValue.upsert({
      userId: user.id,
      value: networkValue,
      calculatedAt: new Date()
    });

    return networkValue;
  }
}

NetworkValue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'NetworkValue',
    indexes: [
      {
        unique: true,
        fields: ['userId']
      }
    ]
  }
);

export default NetworkValue;