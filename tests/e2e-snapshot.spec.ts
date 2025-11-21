import express, { Express, Request, Response } from 'express';
import { INestApplication, Module, Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  snapshotApi,
  snapshotMultipleApis,
  createApiHelper,
  createTestApp,
  createMockProvider,
  createAutoMock,
} from '../src';

// ============================================================================
// Express App Setup
// ============================================================================

function createExpressApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/api/users/:id', (req: Request, res: Response) => {
    res.json({
      id: req.params.id,
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  app.get('/api/users', (req: Request, res: Response) => {
    res.json([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' },
    ]);
  });

  app.post('/api/users', (req: Request, res: Response) => {
    res.status(201).json({
      id: '3',
      ...req.body,
    });
  });

  app.get('/api/error', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

// ============================================================================
// NestJS App Setup
// ============================================================================

@Controller('api/users')
class UserController {
  @Get(':id')
  getOne(@Param('id') id: string) {
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
    };
  }

  @Get()
  getAll() {
    return [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' },
    ];
  }

  @Post()
  create(@Body() body: any) {
    return {
      id: '3',
      ...body,
    };
  }
}

@Module({
  controllers: [UserController],
  providers: [],
})
class TestModule {}

describe('E2E Snapshot', () => {
  describe('Express App', () => {
    let expressApp: Express;

    beforeEach(() => {
      expressApp = createExpressApp();
    });

    it('should snapshot GET endpoint', async () => {
      await snapshotApi(expressApp, '/api/users/1', {
        snapshotName: 'express-get-user',
      });
    });

    it('should snapshot GET all endpoint', async () => {
      await snapshotApi(expressApp, '/api/users', {
        snapshotName: 'express-get-all-users',
      });
    });

    it('should snapshot POST endpoint', async () => {
      await snapshotApi(expressApp, '/api/users', {
        method: 'POST',
        body: { name: 'Jane', email: 'jane@example.com' },
        expectedStatus: 201,
        snapshotName: 'express-create-user',
      });
    });

    it('should handle error status codes', async () => {
      await snapshotApi(expressApp, '/api/error', {
        expectedStatus: 404,
        snapshotName: 'express-error',
      });
    });

    it('should snapshot multiple endpoints', async () => {
      await snapshotMultipleApis(expressApp, [
        { url: '/api/users', method: 'GET', snapshotName: 'express-multi-1' },
        { url: '/api/users/1', method: 'GET', snapshotName: 'express-multi-2' },
      ]);
    });

    it('should create API helper', async () => {
      const api = createApiHelper(expressApp);
      const response = await api.get('/api/users/1').expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
  });

  describe('NestJS App', () => {
    let nestApp: INestApplication;

    beforeEach(async () => {
      const module = await createTestApp({
        module: TestModule,
      });
      await module.init();
      nestApp = module;
    });

    afterEach(async () => {
      if (nestApp) {
        await nestApp.close();
      }
    });

    it('should snapshot GET endpoint', async () => {
      await snapshotApi(nestApp, '/api/users/1', {
        snapshotName: 'nestjs-get-user',
      });
    });

    it('should snapshot GET all endpoint', async () => {
      await snapshotApi(nestApp, '/api/users', {
        snapshotName: 'nestjs-get-all-users',
      });
    });

    it('should snapshot POST endpoint', async () => {
      await snapshotApi(nestApp, '/api/users', {
        method: 'POST',
        body: { name: 'Jane', email: 'jane@example.com' },
        expectedStatus: 201,
        snapshotName: 'nestjs-create-user',
      });
    });

    it('should snapshot multiple endpoints', async () => {
      await snapshotMultipleApis(nestApp, [
        { url: '/api/users', method: 'GET', snapshotName: 'nestjs-multi-1' },
        { url: '/api/users/1', method: 'GET', snapshotName: 'nestjs-multi-2' },
      ]);
    });

    it('should create API helper', async () => {
      const api = createApiHelper(nestApp);
      const response = await api.get('/api/users/1').expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });

    it('should snapshot full response', async () => {
      await snapshotApi(nestApp, '/api/users/1', {
        snapshotFullResponse: true,
        snapshotName: 'nestjs-full-response',
      });
    });

    it('should handle query parameters', async () => {
      // Add a route that uses query params
      @Controller('api/search')
      class SearchController {
        @Get()
        search(@Query('q') q: string) {
          return { query: q, results: [] };
        }
      }

      @Module({
        controllers: [SearchController],
      })
      class SearchModule {}

      const searchApp = await createTestApp({ module: SearchModule });
      await searchApp.init();

      await snapshotApi(searchApp, '/api/search', {
        query: { q: 'test' },
        snapshotName: 'nestjs-query-params',
      });

      await searchApp.close();
    });
  });

  describe('Both frameworks compatibility', () => {
    it('should work with both Express and NestJS using same function', async () => {
      const expressApp = createExpressApp();
      const nestApp = await createTestApp({ module: TestModule });
      await nestApp.init();

      // Both should work
      await snapshotApi(expressApp, '/api/users/1', {
        snapshotName: 'compat-express',
      });

      await snapshotApi(nestApp, '/api/users/1', {
        snapshotName: 'compat-nestjs',
      });

      await nestApp.close();
    });
  });
});

