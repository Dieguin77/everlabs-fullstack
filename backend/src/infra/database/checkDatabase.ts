export type DatabaseCheck =
  | { ok: true; latencyMs: number }
  | { ok: false; latencyMs: number; reason: 'timeout' | 'unreachable' };

/**
 * Runs `ping` (for example `SELECT 1`) and gives up after `timeoutMs`.
 * It never throws and never exposes the underlying error message, because
 * database errors can contain host names or credentials.
 */
export async function checkDatabase(
  ping: () => Promise<unknown>,
  timeoutMs = 3000,
): Promise<DatabaseCheck> {
  const startedAt = Date.now();
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs);
  });

  // If the ping loses the race and fails later, swallow it to avoid an unhandled rejection.
  const attempt = ping().then(
    () => 'ok' as const,
    () => 'unreachable' as const,
  );

  try {
    const outcome = await Promise.race([attempt, timeout]);
    const latencyMs = Date.now() - startedAt;

    return outcome === 'ok' ? { ok: true, latencyMs } : { ok: false, latencyMs, reason: outcome };
  } finally {
    clearTimeout(timer);
  }
}
