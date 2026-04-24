import type { Pool } from 'pg';

export const pool: Pool;
export function closePool(): Promise<void>;
