import { Type } from '@nestjs/common';

// Type helper to avoid requiring Jest types at compile time
// At runtime, these will be Jest mocks when used in a Jest environment
type MockFunction = any & {
  mockReturnValue?: (value: any) => MockFunction;
  mockResolvedValue?: (value: any) => MockFunction;
  mockRejectedValue?: (value: any) => MockFunction;
  mockImplementation?: (fn: (...args: any[]) => any) => MockFunction;
  mockClear?: () => void;
  mockReset?: () => void;
};

type Mocked<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? MockFunction : T[P];
};

/**
 * Creates an automatically mocked version of a class with all methods mocked as Jest functions.
 * Works with services, controllers, and any class-based providers.
 *
 * @param target - The class constructor to mock
 * @returns A fully mocked instance with all methods as jest.fn()
 *
 * @example
 * ```typescript
 * class UserService {
 *   findOne(id: string) { return {}; }
 *   create(data: any) { return {}; }
 * }
 *
 * const mockUserService = createAutoMock(UserService);
 * mockUserService.findOne.mockReturnValue({ id: '1', name: 'Test' });
 * ```
 */
export function createAutoMock<T>(target: Type<T>): Mocked<T> {
  const mock: any = {};

  // Get all property names from the prototype chain
  let proto = target.prototype;
  const seen = new Set<string>();

  while (proto && proto !== Object.prototype) {
    Object.getOwnPropertyNames(proto).forEach((key) => {
      if (key !== 'constructor' && !seen.has(key)) {
        seen.add(key);
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        
        // Mock methods and getters
        if (descriptor && (typeof descriptor.value === 'function' || descriptor.get)) {
          // Try to get jest.fn from various possible locations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let jestFn: any;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jestFn = (global as any).jest?.fn;
            if (!jestFn && typeof require !== 'undefined') {
              // Try requiring jest if available
              const jestModule = require('jest-mock');
              jestFn = jestModule.fn;
            }
          } catch (e) {
            // jest not available
          }

          if (jestFn) {
            mock[key] = jestFn();
          } else {
            // Fallback for non-Jest environments (shouldn't happen in tests)
            const fn: any = function(...args: any[]) {
              if (fn.mockImplementationFn) {
                return fn.mockImplementationFn(...args);
              }
              if (fn.mockReturnValueValue !== undefined) {
                return fn.mockReturnValueValue;
              }
              if (fn.mockResolvedValueValue !== undefined) {
                return Promise.resolve(fn.mockResolvedValueValue);
              }
              return undefined;
            };
            fn.mockReturnValue = (value: any) => {
              fn.mockReturnValueValue = value;
              return fn;
            };
            fn.mockResolvedValue = (value: any) => {
              fn.mockResolvedValueValue = value;
              return fn;
            };
            fn.mockRejectedValue = (value: any) => {
              fn.mockRejectedValueValue = value;
              return fn;
            };
            fn.mockImplementation = (impl: any) => {
              fn.mockImplementationFn = impl;
              return fn;
            };
            // Add jest mock properties for compatibility
            fn._isMockFunction = true;
            mock[key] = fn;
          }
        }
      }
    });
    proto = Object.getPrototypeOf(proto);
  }

  return mock as Mocked<T>;
}

/**
 * Creates a partial mock where only specified methods are mocked.
 * Useful when you want to keep some real implementations.
 *
 * @param target - The class constructor
 * @param mockMethods - Array of method names to mock
 * @returns A partial mock with only specified methods mocked
 *
 * @example
 * ```typescript
 * const partialMock = createPartialMock(UserService, ['findOne']);
 * // Only findOne is mocked, other methods remain undefined
 * ```
 */
export function createPartialMock<T>(
  target: Type<T>,
  mockMethods: (keyof T)[]
): Partial<Mocked<T>> {
  const mock: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jestFn: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jestFn = (global as any).jest?.fn;
    if (!jestFn && typeof require !== 'undefined') {
      const jestModule = require('jest-mock');
      jestFn = jestModule.fn;
    }
  } catch (e) {
    // jest not available
  }

  mockMethods.forEach((method) => {
    if (jestFn) {
      mock[method] = jestFn();
    } else {
      // Fallback for non-Jest environments
      const fn: any = function(...args: any[]) {
        if (fn.mockImplementationFn) {
          return fn.mockImplementationFn(...args);
        }
        if (fn.mockReturnValueValue !== undefined) {
          return fn.mockReturnValueValue;
        }
        if (fn.mockResolvedValueValue !== undefined) {
          return Promise.resolve(fn.mockResolvedValueValue);
        }
        return undefined;
      };
      fn.mockReturnValue = (value: any) => {
        fn.mockReturnValueValue = value;
        return fn;
      };
      fn.mockResolvedValue = (value: any) => {
        fn.mockResolvedValueValue = value;
        return fn;
      };
      fn._isMockFunction = true;
      mock[method] = fn;
    }
  });
  return mock as Partial<Mocked<T>>;
}

/**
 * Creates a mock provider configuration for NestJS testing module.
 * Combines auto-mocking with provider configuration.
 *
 * @param target - The class constructor
 * @param customMocks - Optional custom mock implementations for specific methods
 * @returns A provider configuration object ready for use in TestingModule
 *
 * @example
 * ```typescript
 * const mockProvider = createMockProvider(UserService, {
 *   findOne: jest.fn().mockResolvedValue({ id: '1' })
 * });
 *
 * const module = await Test.createTestingModule({
 *   providers: [mockProvider]
 * }).compile();
 * ```
 */
export function createMockProvider<T>(
  target: Type<T>,
  customMocks?: Partial<Mocked<T>>
): { provide: Type<T>; useValue: Mocked<T> } {
  const baseMock = createAutoMock(target);
  const mock = { ...baseMock, ...customMocks } as Mocked<T>;

  return {
    provide: target,
    useValue: mock,
  };
}
