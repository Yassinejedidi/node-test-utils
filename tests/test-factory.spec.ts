import {
  TestFactory,
  TestDataHelpers,
  createTestData,
  createFactory,
} from '../src/factories/test-factory';

describe('Test Factory', () => {
  interface User {
    id: string;
    name: string;
    email: string;
    age: number;
    active: boolean;
    createdAt: Date;
  }

  class UserFactory extends TestFactory<User> {
    protected default(): Partial<User> {
      return {
        id: TestDataHelpers.uuid(),
        name: TestDataHelpers.fullName(),
        email: TestDataHelpers.email(),
        age: TestDataHelpers.int(18, 80),
        active: TestDataHelpers.boolean(),
        createdAt: TestDataHelpers.pastDate(),
      };
    }
  }

  describe('TestFactory', () => {
    it('should create an instance with default values', () => {
      const user = new UserFactory().create();

      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.age).toBeGreaterThanOrEqual(18);
      expect(user.age).toBeLessThanOrEqual(80);
      expect(typeof user.active).toBe('boolean');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should allow overriding values with with()', () => {
      const user = new UserFactory().with({ name: 'John Doe', age: 25 }).create();

      expect(user.name).toBe('John Doe');
      expect(user.age).toBe(25);
      expect(user.id).toBeDefined(); // Other fields should still be generated
      expect(user.email).toBeDefined();
    });

    it('should allow chaining with() calls', () => {
      const user = new UserFactory()
        .with({ name: 'John' })
        .with({ age: 30 })
        .create();

      expect(user.name).toBe('John');
      expect(user.age).toBe(30);
    });

    it('should create multiple instances', () => {
      const users = new UserFactory().createMany(5);

      expect(users).toHaveLength(5);
      users.forEach((user) => {
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
      });
    });

    it('should create unique instances', () => {
      const user1 = new UserFactory().create();
      const user2 = new UserFactory().create();

      // IDs should be different (very high probability)
      expect(user1.id).not.toBe(user2.id);
    });

    it('should reset factory state', () => {
      const factory = new UserFactory().with({ name: 'Test' });
      factory.reset();
      const user = factory.create();

      expect(user.name).not.toBe('Test');
    });
  });

  describe('createTestData', () => {
    it('should create data with defaults', () => {
      const user = createTestData<User>({
        id: '1',
        name: 'John',
        email: 'john@example.com',
        age: 25,
        active: true,
        createdAt: new Date(),
      });

      expect(user.id).toBe('1');
      expect(user.name).toBe('John');
    });

    it('should allow overriding defaults', () => {
      const user = createTestData<User>(
        {
          id: '1',
          name: 'John',
          email: 'john@example.com',
          age: 25,
          active: true,
          createdAt: new Date(),
        },
        { name: 'Jane', age: 30 }
      );

      expect(user.id).toBe('1');
      expect(user.name).toBe('Jane');
      expect(user.age).toBe(30);
    });
  });

  describe('createFactory', () => {
    it('should create a factory function', () => {
      const createUser = createFactory(() => ({
        id: TestDataHelpers.uuid(),
        name: TestDataHelpers.fullName(),
        email: TestDataHelpers.email(),
        age: TestDataHelpers.int(18, 80),
        active: true,
        createdAt: new Date(),
      }));

      const user = createUser();
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
    });

    it('should allow overriding values', () => {
      const createUser = createFactory(() => ({
        id: '1',
        name: 'Default',
        email: 'default@example.com',
        age: 25,
        active: true,
        createdAt: new Date(),
      }));

      const user = createUser({ name: 'Custom' });
      expect(user.id).toBe('1');
      expect(user.name).toBe('Custom');
    });
  });

  describe('TestDataHelpers', () => {
    it('should generate UUID', () => {
      const uuid = TestDataHelpers.uuid();
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBeGreaterThan(0);
    });

    it('should generate email', () => {
      const email = TestDataHelpers.email();
      expect(email).toBeDefined();
      expect(email).toContain('@');
      expect(email).toContain('.');
    });

    it('should generate full name', () => {
      const name = TestDataHelpers.fullName();
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should generate past date', () => {
      const date = TestDataHelpers.pastDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeLessThan(Date.now());
    });

    it('should generate future date', () => {
      const date = TestDataHelpers.futureDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeGreaterThan(Date.now());
    });

    it('should generate integer in range', () => {
      const num = TestDataHelpers.int(10, 20);
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(20);
      expect(Number.isInteger(num)).toBe(true);
    });

    it('should generate float in range', () => {
      const num = TestDataHelpers.float(10, 20);
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(20);
    });

    it('should generate string of specified length', () => {
      const str = TestDataHelpers.string(15);
      expect(str).toBeDefined();
      expect(typeof str).toBe('string');
      expect(str.length).toBe(15);
    });

    it('should generate boolean', () => {
      const bool = TestDataHelpers.boolean();
      expect(typeof bool).toBe('boolean');
    });

    it('should pick one element from array', () => {
      const array = [1, 2, 3, 4, 5];
      const picked = TestDataHelpers.pickOne(array);
      expect(array).toContain(picked);
    });

    it('should pick many elements from array', () => {
      const array = [1, 2, 3, 4, 5];
      const picked = TestDataHelpers.pickMany(array, 3);
      expect(picked).toHaveLength(3);
      picked.forEach((item) => {
        expect(array).toContain(item);
      });
    });
  });
});

