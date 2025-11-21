# Node Test Utils

<div align="center">

[![npm version](https://img.shields.io/npm/v/node-test-utils.svg?style=flat-square)](https://www.npmjs.com/package/node-test-utils)
[![npm downloads](https://img.shields.io/npm/dm/node-test-utils.svg?style=flat-square)](https://www.npmjs.com/package/node-test-utils)
[![GitHub stars](https://img.shields.io/github/stars/Yassinejedidi/node-test-utils.svg?style=flat-square)](https://github.com/Yassinejedidi/node-test-utils)
[![GitHub issues](https://img.shields.io/github/issues/Yassinejedidi/node-test-utils.svg?style=flat-square)](https://github.com/Yassinejedidi/node-test-utils/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

**A powerful, reusable testing toolkit for Node.js applications. Works seamlessly with NestJS, Express, and any Node.js framework.**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## ✨ Features

| Feature | Description | NestJS | Express |
|---------|-------------|--------|---------|
| 🔹 **Auto Mocks** | Automatically create mocks for services and controllers | ✅ | ✅ |
| 🔹 **Test Data Factories** | Generate fake test data with a fluent builder pattern | ✅ | ✅ |
| 🔹 **Module Helpers** | Bootstrap NestJS modules in tests with overrides | ✅ | ❌ |
| 🔹 **E2E Snapshot Testing** | Run E2E snapshot tests for APIs | ✅ | ✅ |

### Why Use This Package?

- ⚡ **50%+ faster** test development with auto-mocks and factories
- 📏 **Standardized** testing patterns across your entire team
- 🔧 **Easy maintenance** as your application grows
- 🚀 **70%+ less** boilerplate code
- 🎨 **Universal** - works with both NestJS and Express
- 📦 **Zero configuration** - works out of the box
- 🔒 **Type-safe** - full TypeScript support with IntelliSense

---

## 📦 Installation

```bash
# npm
npm install --save-dev node-test-utils

# yarn
yarn add -D node-test-utils

# pnpm
pnpm add -D node-test-utils
```

### Peer Dependencies

This package requires minimal dependencies. Install only what you need:

**For NestJS projects:**
```bash
npm install --save-dev @nestjs/testing @nestjs/common @nestjs/core
```

**For Express projects:**
```bash
npm install --save-dev express
```

**Required for all projects:**
```bash
npm install --save-dev jest
```

> **Note:** All peer dependencies are optional. Install only the ones you need for your framework.

---

## 🚀 Quick Start

### 1️⃣ Auto Mocks

Automatically mock all methods of a class - no manual setup required!

```typescript
import { createAutoMock } from 'node-test-utils';

class UserService {
  async findOne(id: string) { return {}; }
  async create(data: any) { return {}; }
}

// ✨ All methods automatically mocked!
const mockService = createAutoMock(UserService);

// Set return values
mockService.findOne.mockResolvedValue({ id: '1', name: 'John' });
mockService.create.mockResolvedValue({ id: '2', name: 'Jane' });

// Use in tests
expect(mockService.findOne).toHaveBeenCalledWith('1');
```

**Before (without node-test-utils):**
```typescript
const mockService = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  // ... manually mock every method
};
```

**After (with node-test-utils):**
```typescript
const mockService = createAutoMock(UserService);
// ✅ All methods automatically mocked!
```

---

### 2️⃣ Test Data Factories

Create realistic test data with a fluent, chainable API.

```typescript
import { TestFactory, TestDataHelpers } from 'node-test-utils';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// Create a factory
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

// Use the factory
const user = new UserFactory().create();
// ✅ Creates: { id: 'abc-123', name: 'John Smith', email: 'john@example.com', ... }

// Override specific fields
const customUser = new UserFactory()
  .with({ name: 'Jane Doe', age: 25 })
  .create();
// ✅ Creates: { id: 'xyz-789', name: 'Jane Doe', age: 25, ... }

// Create multiple users
const users = new UserFactory().createMany(5);
// ✅ Creates array of 5 unique users
```

**Available Helpers:**
```typescript
TestDataHelpers.uuid()           // Random UUID
TestDataHelpers.email()           // Random email
TestDataHelpers.fullName()        // Random full name
TestDataHelpers.pastDate()        // Random past date
TestDataHelpers.futureDate()      // Random future date
TestDataHelpers.int(1, 100)       // Random integer
TestDataHelpers.float(0, 100)     // Random float
TestDataHelpers.string(10)        // Random string
TestDataHelpers.boolean()         // Random boolean
TestDataHelpers.pickOne([1,2,3]) // Pick random element
TestDataHelpers.pickMany([1,2,3], 2) // Pick random elements
```

---

### 3️⃣ Module Helpers (NestJS Only)

Easily create test modules with provider overrides.

```typescript
import { createTestModule, createMockProvider, createAutoMock } from 'node-test-utils';

class UserService {
  async findOne(id: string) { return {}; }
}

// Create mock
const mockService = createAutoMock(UserService);
mockService.findOne.mockResolvedValue({ id: '1', name: 'Test' });

// Create test module with overrides
const module = await createTestModule({
  module: AppModule,
  overrides: [
    createMockProvider(UserService, mockService),
    { provide: ConfigService, useValue: { get: () => 'test' } },
  ],
});

// Get the application
const app = module.createNestApplication();
await app.init();

// Or get a specific provider
const userService = module.get(UserService);
```

**Before (without node-test-utils):**
```typescript
const module = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(UserService)
  .useValue(mockService)
  .overrideProvider(ConfigService)
  .useValue({ get: () => 'test' })
  .compile();
```

**After (with node-test-utils):**
```typescript
const module = await createTestModule({
  module: AppModule,
  overrides: [
    createMockProvider(UserService, mockService),
    { provide: ConfigService, useValue: { get: () => 'test' } },
  ],
});
// ✅ Cleaner, more readable, easier to maintain
```

---

### 4️⃣ E2E Snapshot Testing

Take snapshots of API responses for regression testing. **Works with both NestJS and Express!**

#### NestJS Example

```typescript
import { snapshotApi, createTestApp } from 'node-test-utils';

describe('User API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await createTestModule({
      module: AppModule,
      overrides: [createMockProvider(UserService, mockService)],
    });
    app = module.createNestApplication();
    await app.init();
  });

  it('should get user by id', async () => {
    await snapshotApi(app, '/api/users/1', {
      snapshotName: 'get-user-by-id',
    });
  });
});
```

#### Express Example

```typescript
import express from 'express';
import { snapshotApi } from 'node-test-utils';

const app = express();
app.get('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'John Doe' });
});

describe('User API', () => {
  it('should get user by id', async () => {
    await snapshotApi(app, '/api/users/1', {
      snapshotName: 'get-user-by-id',
    });
  });
});
```

**Advanced Options:**
```typescript
// POST request with body
await snapshotApi(app, '/api/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' },
  expectedStatus: 201,
  snapshotName: 'create-user',
});

// With query parameters and headers
await snapshotApi(app, '/api/users', {
  query: { page: 1, limit: 10 },
  headers: { 'Authorization': 'Bearer token123' },
});

// Snapshot full response (status, headers, body)
await snapshotApi(app, '/api/users', {
  snapshotFullResponse: true,
});

// Snapshot multiple endpoints
await snapshotMultipleApis(app, [
  { url: '/api/users', method: 'GET' },
  { url: '/api/users/1', method: 'GET' },
  { url: '/api/users', method: 'POST', body: { name: 'John' } },
]);
```

---

## 📚 Complete Examples

### Example 1: NestJS Full Integration Test

```typescript
import { INestApplication } from '@nestjs/common';
import {
  createAutoMock,
  createMockProvider,
  TestFactory,
  TestDataHelpers,
  createTestModule,
  snapshotApi,
} from 'node-test-utils';

// 1. Define entity
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// 2. Create factory
class UserFactory extends TestFactory<User> {
  protected default(): Partial<User> {
    return {
      id: TestDataHelpers.uuid(),
      name: TestDataHelpers.fullName(),
      email: TestDataHelpers.email(),
      createdAt: TestDataHelpers.pastDate(),
    };
  }
}

// 3. Service
class UserService {
  async findOne(id: string): Promise<User> { return {} as User; }
  async create(data: Partial<User>): Promise<User> { return {} as User; }
}

// 4. Controller
@Controller('users')
class UserController {
  constructor(private userService: UserService) {}
  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  
  @Post()
  async create(@Body() data: Partial<User>) {
    return this.userService.create(data);
  }
}

// 5. Test
describe('UserController', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = createAutoMock(UserService);
    mockUserService.findOne.mockResolvedValue(
      new UserFactory().with({ id: '1' }).create()
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
    await app.close();
  });

  it('should get user by id', async () => {
    const user = new UserFactory().with({ id: '1', name: 'John' }).create();
    userService.findOne.mockResolvedValue(user);

    await snapshotApi(app, '/users/1', {
      snapshotName: 'get-user-by-id',
    });
  });

  it('should create user', async () => {
    const userData = new UserFactory().create();
    userService.create.mockResolvedValue(userData);
    
    await snapshotApi(app, '/users', {
      method: 'POST',
      body: { name: userData.name, email: userData.email },
      expectedStatus: 201,
    });
  });
});
```

### Example 2: Express Full Integration Test

```typescript
import express from 'express';
import {
  createAutoMock,
  TestFactory,
  TestDataHelpers,
  snapshotApi,
  createApiHelper,
} from 'node-test-utils';

// 1. Service
class UserService {
  async findOne(id: string) { return {}; }
  async create(data: any) { return {}; }
}

// 2. Factory
class UserFactory extends TestFactory<User> {
  protected default(): Partial<User> {
    return {
      id: TestDataHelpers.uuid(),
      name: TestDataHelpers.fullName(),
      email: TestDataHelpers.email(),
    };
  }
}

// 3. Express app
const app = express();
app.use(express.json());

app.get('/api/users/:id', async (req, res) => {
  const user = await userService.findOne(req.params.id);
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

// 4. Test
describe('User API (Express)', () => {
  it('should get user by id', async () => {
    const user = new UserFactory().with({ id: '1' }).create();
    mockUserService.findOne.mockResolvedValue(user);

    await snapshotApi(app, '/api/users/1', {
      snapshotName: 'express-get-user',
    });
  });

  it('should use API helper', async () => {
    const api = createApiHelper(app);
    const response = await api.get('/api/users/1').expect(200);
    expect(response.body).toHaveProperty('id');
  });
});
```

---

## 📖 API Reference

### Auto Mocks

#### `createAutoMock<T>(target: Type<T>): Mocked<T>`

Creates an automatically mocked version of a class with all methods mocked.

**Parameters:**
- `target` - The class constructor to mock

**Returns:** A fully mocked instance with all methods as Jest mocks

**Example:**
```typescript
const mock = createAutoMock(UserService);
mock.findOne.mockResolvedValue({ id: '1' });
```

#### `createPartialMock<T>(target: Type<T>, mockMethods: (keyof T)[]): Partial<Mocked<T>>`

Creates a partial mock where only specified methods are mocked.

**Example:**
```typescript
const mock = createPartialMock(UserService, ['findOne']);
```

#### `createMockProvider<T>(target: Type<T>, customMocks?: Partial<Mocked<T>>)`

Creates a NestJS provider configuration with mocks.

**Example:**
```typescript
const provider = createMockProvider(UserService, {
  findOne: jest.fn().mockResolvedValue({ id: '1' })
});
```

---

### Test Data Factories

#### `TestFactory<T>`

Abstract base class for creating test data factories.

**Methods:**
- `with(overrides: Partial<T>): this` - Set custom values (chainable)
- `create(): T` - Create a single instance
- `createMany(count: number): T[]` - Create multiple instances
- `reset(): this` - Reset to default state

#### `createTestData<T>(defaults: Partial<T>, overrides?: Partial<T>): T`

Quick factory function for simple cases.

#### `createFactory<T>(defaults: () => Partial<T>): (overrides?: Partial<T>) => T`

Creates a factory function.

#### `TestDataHelpers`

Collection of helper functions for generating test data (see Quick Start section).

---

### Module Helpers (NestJS Only)

#### `createTestModule(options: CreateTestModuleOptions): Promise<TestingModule>`

Creates a NestJS testing module with optional overrides.

**Options:**
```typescript
{
  module: Type<any>;              // The module class to test
  imports?: Type<any>[];         // Additional imports
  providers?: Provider[];       // Additional providers
  controllers?: Type<any>[];      // Additional controllers
  overrides?: ModuleOverride[];   // Provider overrides
}
```

#### `getTestProvider<T>(options: CreateTestModuleOptions, provider: Type<T>): Promise<T>`

Gets a specific provider from a test module.

#### `createTestApp(options: CreateTestModuleOptions): Promise<INestApplication>`

Creates a full NestJS application for E2E tests.

---

### E2E Snapshot Testing

#### `snapshotApi(app: INestApplication | Express, url: string, options?: SnapshotApiOptions): Promise<Response>`

Takes a snapshot of an API endpoint response. **Works with both NestJS and Express!**

**Options:**
```typescript
{
  expectedStatus?: number;           // Expected HTTP status (default: 200)
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';  // HTTP method (default: 'GET')
  body?: any;                         // Request body
  query?: Record<string, any>;       // Query parameters
  headers?: Record<string, string>;   // Request headers
  snapshotName?: string;             // Custom snapshot name
  snapshotFullResponse?: boolean;     // Snapshot full response or just body
}
```

#### `snapshotMultipleApis(app: INestApplication | Express, endpoints: Array<{ url: string } & SnapshotApiOptions>): Promise<Response[]>`

Takes snapshots of multiple API endpoints in sequence.

#### `createApiHelper(app: INestApplication | Express): ReturnType<typeof request>`

Creates a supertest helper for making API requests.

---

## 🎓 Best Practices

1. **Use factories for all test data** - Makes tests more maintainable and consistent
2. **Use auto-mocks for services** - Saves time and reduces boilerplate significantly
3. **Use snapshots for API contracts** - Catches breaking changes early in development
4. **Create factory classes** - More reusable than inline factories
5. **Use TestDataHelpers** - Ensures consistent test data across your application
6. **Group related overrides** - Keep module overrides organized and readable
7. **Name snapshots meaningfully** - Use descriptive `snapshotName` values

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'jest'"

**Solution:** Make sure Jest is installed:
```bash
npm install --save-dev jest @types/jest
```

### Issue: "Cannot find module '@nestjs/testing'"

**Solution:** Install NestJS dependencies (only needed for NestJS projects):
```bash
npm install --save-dev @nestjs/testing @nestjs/common @nestjs/core
```

### Issue: Snapshots failing with random data

**Solution:** Use fixed data for snapshots or update snapshots:
```bash
npm test -- -u  # Update snapshots
```

### Issue: Auto-mock not working

**Solution:** Make sure you're using Jest and the class has methods:
```typescript
// ✅ Works
class Service {
  method() {}
}

// ❌ Doesn't work (no methods to mock)
class Service {}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for the NestJS and Express communities
- Inspired by the need for better testing utilities in Node.js applications
- Thanks to all contributors and users

---

## 📊 Compatibility

| Package | Version | Status |
|---------|---------|--------|
| NestJS | ^10.0.0 \| ^11.0.0 | ✅ Supported |
| Express | ^4.0.0 | ✅ Supported |
| Jest | ^27.0.0 \| ^28.0.0 \| ^29.0.0 \| ^30.0.0 | ✅ Supported |
| TypeScript | ^4.0.0 \| ^5.0.0 | ✅ Supported |

---

<div align="center">

**Made with ❤️ by developers, for developers**

[⭐ Star on GitHub](https://github.com/Yassinejedidi/node-test-utils) • [📦 View on npm](https://www.npmjs.com/package/node-test-utils) • [🐛 Report Bug](https://github.com/Yassinejedidi/node-test-utils/issues) • [💡 Request Feature](https://github.com/Yassinejedidi/node-test-utils/issues)

</div>
