/**
 * Adds fail-fast defaults to a PostgreSQL connection string.
 *
 * Why: on free tiers the database can be paused or unreachable. Without explicit
 * timeouts Prisma may keep requests hanging, which makes the whole API look dead.
 * Parameters already present in the URL always win, so they can still be tuned
 * from the environment without touching the code.
 */
export const CONNECTION_DEFAULTS = {
  connect_timeout: '8', // seconds to open a connection
  pool_timeout: '8', // seconds to wait for a free connection in the pool
  connection_limit: '5', // small pool: free Supabase/Render tiers have tight limits
} as const;

export function withConnectionDefaults(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);

    for (const [key, value] of Object.entries(CONNECTION_DEFAULTS)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }

    // Supabase transaction pooler (port 6543) needs pgbouncer mode in Prisma.
    if (url.port === '6543' && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }

    return url.toString();
  } catch {
    // Not a parseable URL: let Prisma report the problem instead of hiding it here.
    return databaseUrl;
  }
}
