import { config } from './config.js';
import { postgresBusinessRepository } from './postgres-repository.js';
import { inMemoryBusinessRepository } from './repository.js';

export const businessRepositoryMode =
  config.storageProvider === 'postgres' ? 'postgres' : 'memory';

export const businessRepository =
  businessRepositoryMode === 'postgres' ? postgresBusinessRepository : inMemoryBusinessRepository;
