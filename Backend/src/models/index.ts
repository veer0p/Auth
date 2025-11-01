import { sequelize } from '../config/database';
import User from './User';

// Initialize all models
const models = {
  User,
};

// Sync all models (optional - use migrations in production)
export const syncModels = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('✓ All models synchronized successfully');
  } catch (error) {
    console.error('✗ Error synchronizing models:', error);
    throw error;
  }
};

export default models;

