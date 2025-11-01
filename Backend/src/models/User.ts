import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// User attributes interface
export interface UserAttributes {
  uuid: string;
  username: string;
  email: string;
  password: string;
  otp?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  role?: string;
  country_code?: string | null;
  phone_number?: string | null;
  reset_token_hash?: string | null;
  reset_token_expires_at?: Date | null;
  refresh_token_hash?: string | null;
  refresh_token_expires_at?: Date | null;
  login_attempts?: number;
  last_login?: Date | null;
  status?: string;
  google_id?: string | null;
  meta_id?: string | null;
  verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// User creation attributes (optional fields for creation)
export interface UserCreationAttributes extends Optional<UserAttributes, 'uuid' | 'otp' | 'firstname' | 'lastname' | 'role' | 'country_code' | 'phone_number' | 'reset_token_hash' | 'reset_token_expires_at' | 'refresh_token_hash' | 'refresh_token_expires_at' | 'login_attempts' | 'last_login' | 'status' | 'google_id' | 'meta_id' | 'verified' | 'created_at' | 'updated_at'> {}

// User model class
// Note: Using declare instead of public to avoid shadowing Sequelize's attribute getters & setters
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare uuid: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare otp?: string | null;
  declare firstname?: string | null;
  declare lastname?: string | null;
  declare role: string;
  declare country_code?: string | null;
  declare phone_number?: string | null;
  declare reset_token_hash?: string | null;
  declare reset_token_expires_at?: Date | null;
  declare refresh_token_hash?: string | null;
  declare refresh_token_expires_at?: Date | null;
  declare login_attempts: number;
  declare last_login?: Date | null;
  declare status: string;
  declare google_id?: string | null;
  declare meta_id?: string | null;
  declare verified: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

// Initialize User model
User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    firstname: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'user',
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    reset_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refresh_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refresh_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'active',
    },
    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    meta_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['username'],
      },
      {
        unique: true,
        fields: ['google_id'],
      },
      {
        unique: true,
        fields: ['meta_id'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default User;

