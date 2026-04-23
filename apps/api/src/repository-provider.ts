import { config } from './config.js';
import { postgresBusinessRepository } from './postgres-repository.js';
import { inMemoryBusinessRepository } from './repository.js';

export const businessRepository =
  config.storageProvider === 'postgres' ? postgresBusinessRepository : inMemoryBusinessRepository;
