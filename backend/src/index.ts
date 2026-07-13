import 'reflect-metadata';
import { AppDataSource } from './config/database';
import app from './app';
import { config } from './config/env';
import logger from './utils/logger';

async function main() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API documentation available at http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

main();
