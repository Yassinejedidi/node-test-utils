import { Module, Injectable, Controller, Get } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import {
  createTestModule,
  getTestProvider,
  createTestApp,
  createMockProvider,
  createAutoMock,
} from '../src';

// Test services
@Injectable()
class UserService {
  findOne(id: string): string {
    return `user-${id}`;
  }
}

@Injectable()
class ConfigService {
  get(key: string): string {
    return `config-${key}`;
  }
}

// Test controller
@Controller('test')
class TestController {
  constructor(private userService: UserService) {}

  @Get()
  getTest(): string {
    return this.userService.findOne('1');
  }
}

// Test module
@Module({
  controllers: [TestController],
  providers: [UserService, ConfigService],
})
class TestModule {}

describe('Module Helper', () => {
  describe('createTestModule', () => {
    it('should create a test module', async () => {
      const module = await createTestModule({
        module: TestModule,
      });

      expect(module).toBeDefined();
      const userService = module.get(UserService);
      expect(userService).toBeDefined();
      expect(userService.findOne('1')).toBe('user-1');
    });

    it('should allow overriding providers', async () => {
      const mockUserService = createAutoMock(UserService);
      mockUserService.findOne.mockReturnValue('mocked-user');

      const module = await createTestModule({
        module: TestModule,
        overrides: [createMockProvider(UserService, mockUserService)],
      });

      const userService = module.get(UserService);
      expect(userService.findOne('1')).toBe('mocked-user');
    });

    it('should allow multiple overrides', async () => {
      const mockUserService = createAutoMock(UserService);
      mockUserService.findOne.mockReturnValue('mocked-user');

      const mockConfigService = { get: jest.fn().mockReturnValue('mocked-config') };

      const module = await createTestModule({
        module: TestModule,
        overrides: [
          createMockProvider(UserService, mockUserService),
          { provide: ConfigService, useValue: mockConfigService },
        ],
      });

      const userService = module.get(UserService);
      const configService = module.get(ConfigService);

      expect(userService.findOne('1')).toBe('mocked-user');
      expect(configService.get('key')).toBe('mocked-config');
    });

    it('should allow adding additional providers', async () => {
      @Injectable()
      class ExtraService {
        getValue(): string {
          return 'extra';
        }
      }

      const module = await createTestModule({
        module: TestModule,
        providers: [ExtraService],
      });

      const extraService = module.get(ExtraService);
      expect(extraService.getValue()).toBe('extra');
    });

    it('should allow adding additional imports', async () => {
      @Module({
        providers: [],
      })
      class ImportedModule {}

      const module = await createTestModule({
        module: TestModule,
        imports: [ImportedModule],
      });

      expect(module).toBeDefined();
    });
  });

  describe('getTestProvider', () => {
    it('should get a specific provider from module', async () => {
      const userService = await getTestProvider(
        {
          module: TestModule,
        },
        UserService
      );

      expect(userService).toBeDefined();
      expect(userService.findOne('1')).toBe('user-1');
    });

    it('should work with overrides', async () => {
      const mockUserService = createAutoMock(UserService);
      mockUserService.findOne.mockReturnValue('mocked');

      const userService = await getTestProvider(
        {
          module: TestModule,
          overrides: [createMockProvider(UserService, mockUserService)],
        },
        UserService
      );

      expect(userService.findOne('1')).toBe('mocked');
    });
  });

  describe('createTestApp', () => {
    it('should create a NestJS application', async () => {
      const app = await createTestApp({
        module: TestModule,
      });

      expect(app).toBeDefined();
      expect(app.getHttpServer).toBeDefined();
      await app.close();
    });

    it('should create app with overrides', async () => {
      const mockUserService = createAutoMock(UserService);
      mockUserService.findOne.mockReturnValue('mocked');

      const app = await createTestApp({
        module: TestModule,
        overrides: [createMockProvider(UserService, mockUserService)],
      });

      expect(app).toBeDefined();
      await app.init();
      await app.close();
    });

    it('should allow making HTTP requests', async () => {
      const app = await createTestApp({
        module: TestModule,
      });

      await app.init();
      const server = app.getHttpServer();
      expect(server).toBeDefined();
      await app.close();
    });
  });
});

