import { createAutoMock, createPartialMock, createMockProvider } from '../src/mocks/auto-mock';

describe('Auto Mock', () => {
  // Test service class
  class TestService {
    method1(): string {
      return 'original';
    }

    method2(param: string): Promise<string> {
      return Promise.resolve(param);
    }

    method3(): number {
      return 42;
    }

    get property(): string {
      return 'property';
    }
  }

  describe('createAutoMock', () => {
    it('should create a mock with all methods mocked', () => {
      const mock = createAutoMock(TestService);

      expect(mock.method1).toBeDefined();
      expect(mock.method2).toBeDefined();
      expect(mock.method3).toBeDefined();
      expect(typeof mock.method1).toBe('function');
    });

    it('should allow setting return values', () => {
      const mock = createAutoMock(TestService);

      mock.method1.mockReturnValue('mocked');
      expect(mock.method1()).toBe('mocked');
    });

    it('should allow setting resolved values for async methods', () => {
      const mock = createAutoMock(TestService);

      mock.method2.mockResolvedValue('resolved');
      return expect(mock.method2('test')).resolves.toBe('resolved');
    });

    it('should allow setting implementation', () => {
      const mock = createAutoMock(TestService);

      mock.method1.mockImplementation(() => 'custom');
      expect(mock.method1()).toBe('custom');
    });

    it('should track method calls', () => {
      const mock = createAutoMock(TestService);

      mock.method1('arg1', 'arg2');
      expect(mock.method1).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mock.method1).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPartialMock', () => {
    it('should create a partial mock with only specified methods', () => {
      const mock = createPartialMock(TestService, ['method1']);

      expect(mock.method1).toBeDefined();
      expect(typeof mock.method1).toBe('function');
    });

    it('should allow setting return values on partial mocks', () => {
      const mock = createPartialMock(TestService, ['method1']);

      mock.method1.mockReturnValue('partial');
      expect(mock.method1()).toBe('partial');
    });
  });

  describe('createMockProvider', () => {
    it('should create a provider configuration', () => {
      const provider = createMockProvider(TestService);

      expect(provider.provide).toBe(TestService);
      expect(provider.useValue).toBeDefined();
      expect(provider.useValue.method1).toBeDefined();
    });

    it('should merge custom mocks with auto-mocked methods', () => {
      const customMock = {
        method1: jest.fn().mockReturnValue('custom'),
      };

      const provider = createMockProvider(TestService, customMock);

      expect(provider.useValue.method1()).toBe('custom');
      expect(provider.useValue.method2).toBeDefined();
    });

    it('should allow overriding specific methods', () => {
      const provider = createMockProvider(TestService, {
        method1: jest.fn().mockReturnValue('overridden'),
      });

      expect(provider.useValue.method1()).toBe('overridden');
    });
  });

  describe('Inheritance support', () => {
    class BaseService {
      baseMethod(): string {
        return 'base';
      }
    }

    class DerivedService extends BaseService {
      derivedMethod(): string {
        return 'derived';
      }
    }

    it('should mock methods from base class', () => {
      const mock = createAutoMock(DerivedService);

      expect(mock.baseMethod).toBeDefined();
      expect(mock.derivedMethod).toBeDefined();
    });
  });
});

