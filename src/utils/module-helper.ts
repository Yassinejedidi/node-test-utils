import { Test, TestingModule } from '@nestjs/testing';
import { Type, Provider } from '@nestjs/common';

export interface ModuleOverride {
  provide: any;
  useValue?: any;
  useClass?: Type<any>;
  useFactory?: (...args: any[]) => any;
  inject?: any[];
}

/**
 * Options for creating a test module.
 */
export interface CreateTestModuleOptions {
  /**
   * The module class to test.
   */
  module: Type<any>;
  /**
   * Additional imports to include.
   */
  imports?: Type<any>[];
  /**
   * Additional providers to include.
   */
  providers?: Provider[];
  /**
   * Additional controllers to include.
   */
  controllers?: Type<any>[];
  /**
   * Provider overrides (mocks).
   */
  overrides?: ModuleOverride[];
}

/**
 * Creates a NestJS testing module with optional overrides.
 * Simplifies the common pattern of creating test modules with mocked providers.
 *
 * @param options - Configuration options for the test module
 * @returns A compiled TestingModule
 *
 * @example
 * ```typescript
 * const module = await createTestModule({
 *   module: AppModule,
 *   overrides: [
 *     { provide: UserService, useValue: mockUserService },
 *     { provide: ConfigService, useClass: MockConfigService },
 *   ],
 * });
 *
 * const app = module.createNestApplication();
 * ```
 */
export async function createTestModule(
  options: CreateTestModuleOptions
): Promise<TestingModule> {
  const { module, imports = [], providers = [], controllers = [], overrides = [] } = options;

  const moduleBuilder = Test.createTestingModule({
    imports: [module, ...imports],
    providers: [...providers],
    controllers: [...controllers],
  });

  // Apply all overrides
  overrides.forEach((override) => {
    if (override.useValue !== undefined) {
      moduleBuilder.overrideProvider(override.provide).useValue(override.useValue);
    } else if (override.useClass) {
      moduleBuilder.overrideProvider(override.provide).useClass(override.useClass);
    } else if (override.useFactory) {
      moduleBuilder
        .overrideProvider(override.provide)
        .useFactory({
          factory: override.useFactory,
          inject: override.inject || [],
        });
    }
  });

  return moduleBuilder.compile();
}

/**
 * Creates a test module and returns a specific provider from it.
 * Convenience method for when you only need one provider.
 *
 * @param options - Configuration options
 * @param provider - The provider token to retrieve
 * @returns The requested provider instance
 *
 * @example
 * ```typescript
 * const userService = await getTestProvider({
 *   module: AppModule,
 *   overrides: [{ provide: DatabaseService, useValue: mockDb }],
 * }, UserService);
 * ```
 */
export async function getTestProvider<T>(
  options: CreateTestModuleOptions,
  provider: Type<T> | string | symbol
): Promise<T> {
  const module = await createTestModule(options);
  return module.get(provider);
}

/**
 * Creates a test module and returns the application instance.
 * Useful for E2E tests where you need the full NestJS application.
 *
 * @param options - Configuration options
 * @returns A NestJS application instance
 *
 * @example
 * ```typescript
 * const app = await createTestApp({
 *   module: AppModule,
 *   overrides: [{ provide: UserService, useValue: mockUserService }],
 * });
 *
 * await app.init();
 * const server = app.getHttpServer();
 * ```
 */
export async function createTestApp(
  options: CreateTestModuleOptions
): Promise<any> {
  const module = await createTestModule(options);
  return module.createNestApplication();
}
