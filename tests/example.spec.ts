/**
 * Example test file demonstrating all features of node-test-utils
 * 
 * This file shows how to use:
 * - Auto mocks (createAutoMock, createMockProvider)
 * - Test data factories (TestFactory, createFactory, TestDataHelpers)
 * - Module helpers (createTestModule, getTestProvider, createTestApp)
 * - E2E snapshot testing (snapshotApi, snapshotMultipleApis)
 */

import { INestApplication } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  createAutoMock,
  createMockProvider,
  TestFactory,
  TestDataHelpers,
  createTestData,
  createFactory,
  createTestModule,
  getTestProvider,
  createTestApp,
  snapshotApi,
  snapshotMultipleApis,
  createApiHelper,
} from '../src';

// ============================================================================
// Example Entities
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  publishedAt: Date;
}

// ============================================================================
// Example Services
// ============================================================================

class UserService {
  async findOne(id: string): Promise<User> {
    return {} as User;
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async create(data: Partial<User>): Promise<User> {
    return {} as User;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return {} as User;
  }

  async delete(id: string): Promise<void> {
    // Implementation
  }
}

class PostService {
  async findByAuthor(authorId: string): Promise<Post[]> {
    return [];
  }
}

// ============================================================================
// Example Controllers
// ============================================================================

@Controller('users')
class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<User>) {
    return this.userService.create(data);
  }
}

// ============================================================================
// Example Module
// ============================================================================

@Module({
  controllers: [UserController],
  providers: [UserService, PostService],
})
class AppModule {}

// ============================================================================
// Test Data Factories
// ============================================================================

class UserFactory extends TestFactory<User> {
  protected default(): Partial<User> {
    return {
      id: TestDataHelpers.uuid(),
      name: TestDataHelpers.fullName(),
      email: TestDataHelpers.email(),
      age: TestDataHelpers.int(18, 80),
      createdAt: TestDataHelpers.pastDate(),
    };
  }
}

class PostFactory extends TestFactory<Post> {
  protected default(): Partial<Post> {
    return {
      id: TestDataHelpers.uuid(),
      title: TestDataHelpers.string(20),
      content: TestDataHelpers.string(100),
      authorId: TestDataHelpers.uuid(),
      publishedAt: TestDataHelpers.pastDate(),
    };
  }
}

// Alternative: Using createFactory function
const createUserSimple = createFactory(() => ({
  id: TestDataHelpers.uuid(),
  name: TestDataHelpers.fullName(),
  email: TestDataHelpers.email(),
  age: TestDataHelpers.int(18, 80),
  createdAt: new Date(),
}));

// ============================================================================
// Tests
// ============================================================================

describe('node-test-utils Examples', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  // ========================================================================
  // Example 1: Auto Mocks
  // ========================================================================

  describe('Auto Mocks', () => {
    it('should create auto mock for service', () => {
      const mockService = createAutoMock(UserService);

      // All methods are automatically mocked
      expect(mockService.findOne).toBeDefined();
      expect(mockService.create).toBeDefined();
      expect(mockService.update).toBeDefined();

      // You can set return values
      mockService.findOne.mockResolvedValue({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
      });

      expect(typeof mockService.findOne).toBe('function');
      expect(mockService.findOne).toBeDefined();
    });

    it('should create mock provider', () => {
      const mockProvider = createMockProvider(UserService, {
        findOne: jest.fn().mockResolvedValue({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          age: 25,
          createdAt: new Date(),
        }),
      });

      expect(mockProvider.provide).toBe(UserService);
      expect(mockProvider.useValue).toBeDefined();
    });
  });

  // ========================================================================
  // Example 2: Test Data Factories
  // ========================================================================

  describe('Test Data Factories', () => {
    it('should create user with factory class', () => {
      const user = new UserFactory().create();

      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.age).toBeGreaterThanOrEqual(18);
      expect(user.age).toBeLessThanOrEqual(80);
    });

    it('should create user with custom values', () => {
      const user = new UserFactory()
        .with({ name: 'John Doe', email: 'john@example.com' })
        .create();

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should create multiple users', () => {
      const users = new UserFactory().createMany(5);

      expect(users).toHaveLength(5);
      users.forEach((user) => {
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
      });
    });

    it('should use simple factory function', () => {
      const user1 = createUserSimple();
      const user2 = createUserSimple({ name: 'Custom Name' });

      expect(user1.name).toBeDefined();
      expect(user2.name).toBe('Custom Name');
    });

    it('should use createTestData helper', () => {
      const user = createTestData<User>(
        {
          id: '1',
          name: 'Default Name',
          email: 'default@example.com',
          age: 25,
          createdAt: new Date(),
        },
        { name: 'Override Name' }
      );

      expect(user.id).toBe('1');
      expect(user.name).toBe('Override Name');
    });

    it('should use TestDataHelpers', () => {
      const uuid = TestDataHelpers.uuid();
      const email = TestDataHelpers.email();
      const name = TestDataHelpers.fullName();
      const age = TestDataHelpers.int(1, 100);
      const isActive = TestDataHelpers.boolean();

      expect(uuid).toBeDefined();
      expect(email).toContain('@');
      expect(name).toBeDefined();
      expect(age).toBeGreaterThanOrEqual(1);
      expect(age).toBeLessThanOrEqual(100);
      expect(typeof isActive).toBe('boolean');
    });
  });

  // ========================================================================
  // Example 3: Module Helpers
  // ========================================================================

  describe('Module Helpers', () => {
    beforeEach(async () => {
      const mockUserService = createAutoMock(UserService);
      mockUserService.findOne.mockResolvedValue(
        new UserFactory().with({ id: '1' }).create()
      );
      mockUserService.findAll.mockResolvedValue(
        new UserFactory().createMany(3)
      );

      const module = await createTestModule({
        module: AppModule,
        overrides: [createMockProvider(UserService, mockUserService)],
      });

      app = module.createNestApplication();
      await app.init();

      userService = module.get(UserService);
    });

    afterEach(async () => {
      if (app) {
        await app.close();
      }
    });

    it('should create test module with overrides', async () => {
      expect(userService).toBeDefined();
      expect(userService.findOne).toBeDefined();
    });

    it('should get provider from module', async () => {
      const service = await getTestProvider(
        {
          module: AppModule,
          overrides: [createMockProvider(UserService, createAutoMock(UserService))],
        },
        UserService
      );

      expect(service).toBeDefined();
    });

    it('should create test app', async () => {
      const testApp = await createTestApp({
        module: AppModule,
        overrides: [createMockProvider(UserService, createAutoMock(UserService))],
      });

      await testApp.init();
      expect(testApp).toBeDefined();
      await testApp.close();
    });
  });

  // ========================================================================
  // Example 4: E2E Snapshot Testing
  // ========================================================================

  describe('E2E Snapshot Testing', () => {
    beforeEach(async () => {
      const mockUserService = createAutoMock(UserService);
      mockUserService.findOne.mockResolvedValue(
        new UserFactory().with({ id: '1', name: 'John Doe' }).create()
      );
      mockUserService.findAll.mockResolvedValue(
        new UserFactory().createMany(2)
      );
      mockUserService.create.mockImplementation((data: any) =>
        Promise.resolve(new UserFactory().with(data).create())
      );

      const module = await createTestModule({
        module: AppModule,
        overrides: [createMockProvider(UserService, mockUserService)],
      });

      app = module.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      if (app) {
        await app.close();
      }
    });

    it('should snapshot GET endpoint', async () => {
      await snapshotApi(app, '/users/1', {
        snapshotName: 'get-user-by-id',
      });
    });

    it('should snapshot GET all endpoint', async () => {
      await snapshotApi(app, '/users');
    });

    it('should snapshot POST endpoint', async () => {
      const userData = new UserFactory().create();

      await snapshotApi(app, '/users', {
        method: 'POST',
        body: { name: userData.name, email: userData.email, age: userData.age },
        expectedStatus: 201,
        snapshotName: 'create-user',
      });
    });

    it('should snapshot multiple endpoints', async () => {
      await snapshotMultipleApis(app, [
        { url: '/users', method: 'GET', snapshotName: 'get-all-users' },
        { url: '/users/1', method: 'GET', snapshotName: 'get-user-1' },
      ]);
    });

    it('should use API helper', async () => {
      const api = createApiHelper(app);
      const response = await api.get('/users').expect(200);

      expect(response.body).toBeDefined();
    });
  });

  // ========================================================================
  // Example 5: Complete Integration Test
  // ========================================================================

  describe('Complete Integration Example', () => {
    let testApp: INestApplication;
    let mockUserService: jest.Mocked<UserService>;

    beforeEach(async () => {
      // 1. Create mocks
      mockUserService = createAutoMock(UserService);

      // 2. Setup mock return values using factories
      const testUser = new UserFactory()
        .with({ id: '1', name: 'Integration Test User' })
        .create();
      mockUserService.findOne.mockResolvedValue(testUser);
      mockUserService.findAll.mockResolvedValue([testUser]);

      // 3. Create test module
      const module = await createTestModule({
        module: AppModule,
        overrides: [createMockProvider(UserService, mockUserService)],
      });

      // 4. Create app
      testApp = module.createNestApplication();
      await testApp.init();
    });

    afterEach(async () => {
      if (testApp) {
        await testApp.close();
      }
    });

    it('should handle complete user flow', async () => {
      // Create user data
      const newUser = new UserFactory().create();

      // Mock create to return the new user
      mockUserService.create.mockResolvedValue(newUser);

      // Test POST
      await snapshotApi(testApp, '/users', {
        method: 'POST',
        body: { name: newUser.name, email: newUser.email, age: newUser.age },
        expectedStatus: 201,
        snapshotName: 'create-user-integration',
      });

      // Verify mock was called
      expect(mockUserService.create).toHaveBeenCalled();
    });
  });
});

