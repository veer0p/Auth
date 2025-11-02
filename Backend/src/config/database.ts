import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Check for database URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    'Missing required environment variable: DATABASE_URL\n' +
    'Please ensure this is set in your .env file.'
  );
}

// Create Sequelize instance using connection URI
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Supabase
    }
  },
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    return false;
  }
};

export default sequelize;

