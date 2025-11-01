import dotenv from 'dotenv';
import { sequelize, testConnection } from '../config/database';
// Import models to register them with Sequelize before sync
import '../models/User';

dotenv.config();

async function migrate(): Promise<void> {
  try {
    console.log('Starting database migration...');

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sync all models (creates tables if they don't exist)
    // Use { alter: true } to add missing columns to existing tables
    // Use { force: true } to drop and recreate tables (destructive!)
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ Tables synchronized');

    console.log('✓ Migration completed successfully!');

    // Verify table structure
    const tableInfo = await sequelize.getQueryInterface().describeTable('users');
    console.log('\nUsers table structure:');
    Object.keys(tableInfo).forEach((columnName, index) => {
      const column = tableInfo[columnName];
      const unique = (column as any).unique || false;
      console.log(
        `${index + 1}. ${columnName} (${column.type}${column.allowNull ? '' : ' NOT NULL'}${column.primaryKey ? ' PRIMARY KEY' : ''}${unique ? ' UNIQUE' : ''})`
      );
    });

    // Close connection
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

migrate();

