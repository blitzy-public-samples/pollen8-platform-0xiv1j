import { Model, DataTypes } from 'sequelize';
import sequelize from 'src/backend/config/database';

class Industry extends Model {
  public id!: string;
  public name!: string;

  // Define associations with other models
  static associate(models: any) {
    // Define many-to-many association with User model
    Industry.belongsToMany(models.User, { 
      through: 'UserIndustries',
      as: 'users',
      foreignKey: 'industryId'
    });
  }
}

Industry.init(
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
      },
    },
  },
  {
    sequelize,
    modelName: 'Industry',
    tableName: 'industries',
    timestamps: true,
  }
);

export default Industry;