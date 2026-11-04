import { Router } from 'express';
import { checkDatabase } from '../../database/checkDatabase.js';

interface HealthRouterOptions {
  /** Cheap query used to probe the database, e.g. `SELECT 1`. */
  ping: () => Promise<unknown>;
  /** How long `/health/db` waits for the database before answering 503. */
  timeoutMs?: number;
}

/**
 * - GET /health     -> process is up. Never touches the database, so it answers
 *                      instantly even when the database is down (used to wake the
 *                      free-tier instance and as the platform health check).
 * - GET /health/db  -> 200 when the database answers in time, 503 otherwise.
 */
export function createHealthRouter({ ping, timeoutMs = 3000 }: HealthRouterOptions) {
  const router = Router();

  router.get('/', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  router.get('/db', async (_request, response) => {
    const result = await checkDatabase(ping, timeoutMs);

    if (result.ok) {
      return response.status(200).json({
        status: 'ok',
        database: 'up',
        latencyMs: result.latencyMs,
      });
    }

    return response.status(503).json({
      status: 'error',
      database: 'down',
      reason: result.reason,
      latencyMs: result.latencyMs,
    });
  });

  return router;
}
