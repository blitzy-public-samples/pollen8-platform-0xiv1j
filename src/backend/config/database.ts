import { Sequelize, SequelizeOptions } from 'sequelize';

const DB_CONFIG: SequelizeOptions = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  dialect: 'postgres',
  // Add connection pool configuration
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Add logging configuration for development environment
  logging: process.env.NODE_ENV === 'development' ? console.log : false
};

export const sequelize = new Sequelize(DB_CONFIG);

export const connectToDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Implement retry mechanism
    if (error.name !== 'SequelizeConnectionRefusedError') {
      throw error;
    }
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectToDatabase, 5000);
  }
};

// Implement graceful shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
});

// TODO: Implement SSL configuration for production
// if (process.env.NODE_ENV === 'production') {
//   DB_CONFIG.dialectOptions = {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false // Use this if you're using a self-signed certificate
//     }
//   };
// }