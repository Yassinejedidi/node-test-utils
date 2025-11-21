import request, { Response, Test } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Express } from 'express';

/**
 * Options for snapshot API testing.
 */
export interface SnapshotApiOptions {
  /**
   * Expected HTTP status code. Defaults to 200.
   */
  expectedStatus?: number;
  /**
   * HTTP method. Defaults to 'GET'.
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /**
   * Request body (for POST, PUT, PATCH).
   */
  body?: any;
  /**
   * Query parameters.
   */
  query?: Record<string, any>;
  /**
   * Request headers.
   */
  headers?: Record<string, string>;
  /**
   * Custom snapshot name. If not provided, uses the URL.
   */
  snapshotName?: string;
  /**
   * Whether to snapshot only the body (default) or the full response.
   */
  snapshotFullResponse?: boolean;
}

/**
 * Union type for supported application types (NestJS or Express)
 */
type SupportedApp = INestApplication | Express;

/**
 * Gets the HTTP server from either NestJS or Express app
 */
function getHttpServer(app: SupportedApp): any {
  if ('getHttpServer' in app && typeof app.getHttpServer === 'function') {
    // NestJS application
    return app.getHttpServer();
  }
  // Express application
  return app;
}

/**
 * Takes a snapshot of an API endpoint response.
 * Useful for regression testing and ensuring API contracts don't break.
 * Works with both NestJS and Express applications.
 *
 * @param app - NestJS application instance or Express app
 * @param url - API endpoint URL
 * @param options - Optional configuration
 * @returns The HTTP response
 *
 * @example
 * ```typescript
 * // NestJS app
 * await snapshotApi(nestApp, '/api/users');
 *
 * // Express app
 * await snapshotApi(expressApp, '/api/users');
 *
 * // POST request with body
 * await snapshotApi(app, '/api/users', {
 *   method: 'POST',
 *   body: { name: 'John' },
 *   expectedStatus: 201,
 * });
 *
 * // Custom snapshot name
 * await snapshotApi(app, '/api/users/1', {
 *   snapshotName: 'get-user-by-id',
 * });
 * ```
 */
export async function snapshotApi(
  app: SupportedApp,
  url: string,
  options: SnapshotApiOptions = {}
): Promise<Response> {
  const {
    expectedStatus = 200,
    method = 'GET',
    body,
    query,
    headers = {},
    snapshotName,
    snapshotFullResponse = false,
  } = options;

  const server = getHttpServer(app);
  let req: Test;

  // Build the request based on method
  switch (method) {
    case 'GET':
      req = request(server).get(url);
      break;
    case 'POST':
      req = request(server).post(url);
      break;
    case 'PUT':
      req = request(server).put(url);
      break;
    case 'PATCH':
      req = request(server).patch(url);
      break;
    case 'DELETE':
      req = request(server).delete(url);
      break;
    default:
      req = request(server).get(url);
  }

  // Apply query parameters
  if (query) {
    req = req.query(query);
  }

  // Apply headers
  Object.entries(headers).forEach(([key, value]) => {
    req = req.set(key, value);
  });

  // Apply body for POST, PUT, PATCH
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    req = req.send(body);
  }

  const res = await req;

  // Assert status code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectFn: any = (global as any).expect;
  expectFn(res.status).toBe(expectedStatus);

  // Create snapshot
  const snapshotData = snapshotFullResponse
    ? {
        status: res.status,
        headers: res.headers,
        body: res.body,
      }
    : res.body;

  if (snapshotName) {
    expectFn(snapshotData).toMatchSnapshot(snapshotName);
  } else {
    // Generate a meaningful snapshot name from URL and method
    const name = `${method}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
    expectFn(snapshotData).toMatchSnapshot(name);
  }

  return res;
}

/**
 * Takes snapshots of multiple API endpoints in sequence.
 * Useful for testing multiple related endpoints.
 * Works with both NestJS and Express applications.
 *
 * @param app - NestJS application instance or Express app
 * @param endpoints - Array of endpoint configurations
 *
 * @example
 * ```typescript
 * await snapshotMultipleApis(app, [
 *   { url: '/api/users', method: 'GET' },
 *   { url: '/api/users/1', method: 'GET', snapshotName: 'get-user-1' },
 *   { url: '/api/users', method: 'POST', body: { name: 'John' }, expectedStatus: 201 },
 * ]);
 * ```
 */
export async function snapshotMultipleApis(
  app: SupportedApp,
  endpoints: Array<{ url: string } & SnapshotApiOptions>
): Promise<Response[]> {
  const results: Response[] = [];
  for (const endpoint of endpoints) {
    const { url, ...options } = endpoint;
    const result = await snapshotApi(app, url, options);
    results.push(result);
  }
  return results;
}

/**
 * Creates a helper for making API requests in tests.
 * Returns a supertest instance bound to the application.
 * Works with both NestJS and Express applications.
 *
 * @param app - NestJS application instance or Express app
 * @returns A supertest instance
 *
 * @example
 * ```typescript
 * const api = createApiHelper(app);
 * const res = await api.get('/api/users').expect(200);
 * ```
 */
export function createApiHelper(app: SupportedApp): ReturnType<typeof request> {
  return request(getHttpServer(app));
}
