import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Interest extends Model {
  public id!: string;
  public name!: string;

  // Define associations with other models
  static associate(models: any) {
    // Define many-to-many association with User model
    Interest.belongsToMany(models.User, { 
      through: 'UserInterests',
      as: 'users',
      foreignKey: 'interestId'
    });
  }
}

Interest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100], // Ensure name is between 2 and 100 characters
      },
    },
  },
  {
    sequelize,
    modelName: 'Interest',
    tableName: 'interests',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
    ],
  }
);

export default Interest;