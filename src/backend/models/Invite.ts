import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Invite extends Model {
  public id!: string;
  public creatorId!: string;
  public inviteCode!: string;
  public createdAt!: Date;
  public clicks!: number;
  public isActive!: boolean;

  public static associate(models: any): void {
    Invite.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
  }

  public static generateInviteCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let code: string;

    do {
      code = Array.from({ length: codeLength }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
    } while (Invite.findOne({ where: { inviteCode: code } }));

    return code;
  }

  public async incrementClicks(): Promise<void> {
    this.clicks += 1;
    await this.save();
  }
}

Invite.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    inviteCode: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[A-Za-z0-9]{8}$/,
      },
    },
    clicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Invite',
    indexes: [
      { fields: ['inviteCode'] },
      { fields: ['creatorId'] },
    ],
  }
);

export default Invite;