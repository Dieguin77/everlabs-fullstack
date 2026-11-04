import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createHealthRouter } from '@/infra/http/routes/health.routes.js';
import { swaggerSpec } from '@/swagger.js';

// The spec is a hand-written object, so it is treated as plain data here.
const spec = swaggerSpec as unknown as {
  servers: { url: string }[];
  tags: { name: string }[];
  paths: Record<string, Record<string, any>>;
};

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

describe('Swagger spec', () => {
  it('uses a relative server URL, so "Try it out" works on any host and never calls localhost', () => {
    expect(spec.servers[0].url).toBe('/api');
    expect(JSON.stringify(spec.servers)).not.toMatch(/localhost/);
  });

  it('only uses declared tags and documents at least one response per operation', () => {
    const declared = new Set(spec.tags.map((tag) => tag.name));

    for (const [path, item] of Object.entries(spec.paths)) {
      for (const method of METHODS.filter((m) => item[m])) {
        const operation = item[method];
        const where = `${method.toUpperCase()} ${path}`;

        expect(operation.tags?.length, `${where} has no tag`).toBeGreaterThan(0);
        for (const tag of operation.tags) expect(declared.has(tag), `${where}: undeclared tag ${tag}`).toBe(true);
        expect(Object.keys(operation.responses ?? {}).length, `${where} has no response`).toBeGreaterThan(0);
      }
    }
  });

  it('documents the health endpoints at the server root, outside the /api prefix', () => {
    for (const path of ['/health', '/health/db']) {
      expect(spec.paths[path]?.get, `${path} is not documented`).toBeDefined();
      expect(spec.paths[path].servers).toEqual([expect.objectContaining({ url: '/' })]);
    }
  });
});

describe('Swagger health docs match what the endpoints really return', () => {
  let server: Server | undefined;

  async function start(ping: () => Promise<unknown>) {
    const app = express();
    app.use('/health', createHealthRouter({ ping, timeoutMs: 100 }));
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    return `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
  }

  afterEach(async () => {
    if (server) await new Promise((resolve) => server!.close(resolve));
    server = undefined;
  });

  const documented = (path: string, status: string) =>
    spec.paths[path].get.responses[status].content['application/json'].schema.properties as Record<string, { enum?: string[] }>;

  const keys = (value: object) => Object.keys(value).sort();

  it('GET /health', async () => {
    const baseUrl = await start(() => Promise.resolve());
    const body = (await (await fetch(`${baseUrl}/health`)).json()) as Record<string, any>;

    expect(keys(body)).toEqual(keys(documented('/health', '200')));
  });

  it('GET /health/db when the database answers (200)', async () => {
    const baseUrl = await start(() => Promise.resolve());
    const response = await fetch(`${baseUrl}/health/db`);
    const body = (await response.json()) as Record<string, any>;

    expect(response.status).toBe(200);
    expect(keys(body)).toEqual(keys(documented('/health/db', '200')));
  });

  it.each([
    ['unreachable', () => Promise.reject(new Error('down'))],
    ['timeout', () => new Promise(() => {})],
  ])('GET /health/db when the database is down: reason "%s" (503)', async (reason, ping) => {
    const baseUrl = await start(ping as () => Promise<unknown>);
    const response = await fetch(`${baseUrl}/health/db`);
    const body = (await response.json()) as Record<string, any>;
    const properties = documented('/health/db', '503');

    expect(response.status).toBe(503);
    expect(keys(body)).toEqual(keys(properties));
    expect(properties.reason.enum).toContain(body.reason);
    expect(body.reason).toBe(reason);
  });
});
