import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Industry from './Industry';
import Interest from './Interest';

class User extends Model {
  public id!: string;
  public phoneNumber!: string;
  public username!: string;
  public location!: string;
  public createdAt!: Date;
  public lastLogin!: Date;

  public static associate(models: any): void {
    // Define many-to-many association with Industry model
    User.belongsToMany(models.Industry, { through: 'UserIndustries' });

    // Define many-to-many association with Interest model
    User.belongsToMany(models.Interest, { through: 'UserInterests' });

    // Define one-to-many association with Connection model
    User.hasMany(models.Connection, { as: 'Connections' });

    // Define one-to-many association with Invite model
    User.hasMany(models.Invite, { as: 'Invites' });

    // Define one-to-one association with NetworkValue model
    User.hasOne(models.NetworkValue);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^\+[1-9]\d{1,14}$/, // E.164 format validation
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    indexes: [
      { fields: ['phoneNumber'] },
      { fields: ['username'] },
      { fields: ['location'] },
    ],
  }
);

export default User;