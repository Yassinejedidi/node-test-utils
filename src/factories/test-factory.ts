import { faker } from '@faker-js/faker';

/**
 * Base factory class for creating test data with a fluent builder pattern.
 * Extend this class to create factories for your entities.
 *
 * @example
 * ```typescript
 * class UserFactory extends TestFactory<User> {
 *   protected default(): Partial<User> {
 *     return {
 *       id: faker.string.uuid(),
 *       name: faker.person.fullName(),
 *       email: faker.internet.email(),
 *     };
 *   }
 * }
 *
 * const user = new UserFactory().create();
 * const customUser = new UserFactory().with({ name: 'John' }).create();
 * ```
 */
export abstract class TestFactory<T> {
  protected data: Partial<T> = {};

  /**
   * Define the default values for the entity.
   * Override this method in your factory class.
   */
  protected abstract default(): Partial<T>;

  /**
   * Set custom values for the entity.
   * Can be chained multiple times.
   */
  with(overrides: Partial<T>): this {
    this.data = { ...this.data, ...overrides };
    return this;
  }

  /**
   * Create a single entity instance.
   */
  create(): T {
    return { ...this.default(), ...this.data } as T;
  }

  /**
   * Create multiple entity instances.
   * @param count - Number of instances to create
   */
  createMany(count: number): T[] {
    return Array.from({ length: count }, () => {
      const instance = this.create();
      this.data = {}; // Reset for next iteration
      return instance;
    });
  }

  /**
   * Reset the factory to its default state.
   */
  reset(): this {
    this.data = {};
    return this;
  }
}

/**
 * Generic factory function for quick entity creation.
 * Useful for simple cases where you don't need a full factory class.
 *
 * @param defaults - Default values for the entity
 * @param overrides - Optional overrides
 * @returns A new entity instance
 *
 * @example
 * ```typescript
 * const user = createTestData({
 *   id: faker.string.uuid(),
 *   name: faker.person.fullName(),
 * }, { name: 'Custom Name' });
 * ```
 */
export function createTestData<T>(
  defaults: Partial<T>,
  overrides: Partial<T> = {}
): T {
  return { ...defaults, ...overrides } as T;
}

/**
 * Creates a factory function for a specific entity type.
 * Returns a function that can be called with optional overrides.
 *
 * @param defaults - Default values factory function
 * @returns A factory function
 *
 * @example
 * ```typescript
 * const createUser = createFactory(() => ({
 *   id: faker.string.uuid(),
 *   name: faker.person.fullName(),
 *   email: faker.internet.email(),
 * }));
 *
 * const user1 = createUser();
 * const user2 = createUser({ name: 'John' });
 * ```
 */
export function createFactory<T>(
  defaults: () => Partial<T>
): (overrides?: Partial<T>) => T {
  return (overrides: Partial<T> = {}): T => {
    return { ...defaults(), ...overrides } as T;
  };
}

/**
 * Common factory helpers for frequently used data types.
 */
export const TestDataHelpers = {
  /**
   * Creates a random UUID string.
   */
  uuid: () => faker.string.uuid(),

  /**
   * Creates a random email address.
   */
  email: () => faker.internet.email(),

  /**
   * Creates a random full name.
   */
  fullName: () => faker.person.fullName(),

  /**
   * Creates a random date in the past.
   */
  pastDate: () => faker.date.past(),

  /**
   * Creates a random date in the future.
   */
  futureDate: () => faker.date.future(),

  /**
   * Creates a random integer between min and max (inclusive).
   */
  int: (min: number = 0, max: number = 100) => faker.number.int({ min, max }),

  /**
   * Creates a random float between min and max.
   */
  float: (min: number = 0, max: number = 100) =>
    faker.number.float({ min, max }),

  /**
   * Creates a random string of specified length.
   */
  string: (length: number = 10) => faker.string.alphanumeric(length),

  /**
   * Creates a random boolean.
   */
  boolean: () => faker.datatype.boolean(),

  /**
   * Picks a random element from an array.
   */
  pickOne: <T>(array: T[]): T => faker.helpers.arrayElement(array),

  /**
   * Picks multiple random elements from an array.
   */
  pickMany: <T>(array: T[], count?: number): T[] =>
    faker.helpers.arrayElements(array, count),
};
