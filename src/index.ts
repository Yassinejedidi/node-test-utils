// Auto mocks
export {
  createAutoMock,
  createPartialMock,
  createMockProvider,
} from './mocks/auto-mock';

// Test data factories
export {
  TestFactory,
  createTestData,
  createFactory,
  TestDataHelpers,
} from './factories/test-factory';

// Module helpers
export {
  createTestModule,
  getTestProvider,
  createTestApp,
  type CreateTestModuleOptions,
  type ModuleOverride,
} from './utils/module-helper';

// E2E snapshot testing
export {
  snapshotApi,
  snapshotMultipleApis,
  createApiHelper,
  type SnapshotApiOptions,
} from './utils/e2e-snapshot';

// Re-export Express type for convenience
export type { Express } from 'express';
