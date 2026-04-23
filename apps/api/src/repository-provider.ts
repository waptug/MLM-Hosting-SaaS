import { config } from './config.js';
import { postgresBusinessRepository } from './postgres-repository.js';

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required for the API business repository.');
}

export const businessRepositoryMode = 'postgres';

export const businessRepository = postgresBusinessRepository;
