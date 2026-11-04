import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHealthRouter } from '../health.routes.js';

let server: Server | undefined;

async function start(ping: () => Promise<unknown>, timeoutMs?: number) {
  const app = express();
  app.use('/health', createHealthRouter({ ping, timeoutMs }));

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });

  const { port } = server!.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterEach(async () => {
  if (server) {
    await new Promise((resolve) => server!.close(resolve));
    server = undefined;
  }
});

describe('health routes', () => {
  it('GET /health answers 200 without touching the database', async () => {
    const ping = vi.fn().mockRejectedValue(new Error('database is down'));
    const baseUrl = await start(ping);

    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as Record<string, any>;

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(typeof body.uptimeSeconds).toBe('number');
    expect(ping).not.toHaveBeenCalled();
  });

  it('GET /health/db answers 200 when the database responds', async () => {
    const baseUrl = await start(() => Promise.resolve([{ '?column?': 1 }]));

    const response = await fetch(`${baseUrl}/health/db`);
    const body = (await response.json()) as Record<string, any>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: 'ok', database: 'up' });
    expect(typeof body.latencyMs).toBe('number');
  });

  it('GET /health/db answers 503 when the database is unreachable, without leaking the error', async () => {
    const baseUrl = await start(() =>
      Promise.reject(new Error('Can\'t reach database server at secret-host.example:5432')),
    );

    const response = await fetch(`${baseUrl}/health/db`);
    const text = await response.text();
    const body = JSON.parse(text);

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ status: 'error', database: 'down', reason: 'unreachable' });
    expect(text).not.toContain('secret-host');
  });

  it('GET /health/db answers 503 with reason "timeout" when the database never answers', async () => {
    const baseUrl = await start(() => new Promise(() => {}), 50);

    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}/health/db`);
    const body = (await response.json()) as Record<string, any>;

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ status: 'error', database: 'down', reason: 'timeout' });
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });
});
