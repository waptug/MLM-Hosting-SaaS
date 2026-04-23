import type { TenantContext } from '../../../../packages/auth/src/model.js';

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

export {};
