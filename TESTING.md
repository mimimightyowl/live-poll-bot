# Testing Documentation

This document provides information about the testing setup and how to run tests for the Live Poll Bot project.

## Overview

The project uses different testing frameworks for different parts:

- **Backend API Service**: Jest with TypeScript support
- **Bot Service**: Jest with TypeScript support
- **Frontend**: Vitest with Vue Test Utils

## Test Coverage Goals

- `polls.service.ts`: 70% coverage
- `votes.service.ts`: 70% coverage
- API endpoints: 60% coverage
- Bot handlers: 60% coverage

## Running Tests

### Run All Tests

From the root directory:

```bash
npm test
```

This will run tests for all services (API, bot, and frontend).

### Run Tests for Specific Services

**API Service:**

```bash
cd backend/api-service
npm test
```

**Bot Service:**

```bash
cd backend/bot-service
npm test
```

**Frontend:**

```bash
cd frontend/poll-app
npm test
```

### Watch Mode

Run tests in watch mode for automatic re-running on file changes:

**API Service:**

```bash
cd backend/api-service
npm run test:watch
```

**Bot Service:**

```bash
cd backend/bot-service
npm run test:watch
```

**Frontend:**

```bash
cd frontend/poll-app
npm run test:watch
```

### Coverage Reports

Generate coverage reports:

**API Service:**

```bash
cd backend/api-service
npm run test:coverage
```

**Bot Service:**

```bash
cd backend/bot-service
npm run test:coverage
```

**Frontend:**

```bash
cd frontend/poll-app
npm run test:coverage
```

**All Services:**

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage` directory for each service.

## Test Structure

### Backend API Service

Tests are located in `backend/api-service/src/`:

- **Unit Tests**: `**/__tests__/*.service.test.ts`
- **Integration Tests**: `**/__tests__/*.routes.test.ts`

**Example:**

- `src/modules/polls/__tests__/polls.service.test.ts` - Unit tests for polls service
- `src/modules/polls/__tests__/polls.routes.test.ts` - Integration tests for polls routes

### Bot Service

Tests are located in `backend/bot-service/src/`:

- **Handler Tests**: `**/__tests__/*.handler.test.ts`

**Example:**

- `src/modules/polls/__tests__/polls.handler.test.ts` - Tests for poll handlers
- `src/modules/users/__tests__/users.handler.test.ts` - Tests for user handlers

### Frontend

Tests are located in `frontend/poll-app/src/`:

- **Component Tests**: `**/__tests__/*.test.ts` or `**/*.spec.ts`

## Test Configuration

### Jest Configuration (Backend)

Jest is configured via `jest.config.js` in each service directory:

- **API Service**: `backend/api-service/jest.config.js`
- **Bot Service**: `backend/bot-service/jest.config.js`

Key settings:

- TypeScript support via `ts-jest`
- Coverage collection from source files
- Test timeout: 10 seconds
- Setup file: `src/__tests__/setup.ts`

### Vitest Configuration (Frontend)

Vitest is configured in `frontend/poll-app/vite.config.ts`:

- Environment: `happy-dom`
- Coverage provider: `v8`
- Setup file: `src/__tests__/setup.ts`

## Writing Tests

### Unit Test Example (Service)

```typescript
import pollService from '../polls.service';
import pollRepository from '../polls.repository';

jest.mock('../polls.repository');

describe('PollService', () => {
  describe('createPoll', () => {
    it('should create a poll with valid data', async () => {
      const pollData = {
        question: 'Test question?',
        created_by: 1,
      };

      const mockPoll = {
        id: 1,
        question: 'Test question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollRepository.create as jest.Mock).mockResolvedValue(mockPoll);

      const poll = await pollService.createPoll(pollData);

      expect(poll.question).toBe('Test question?');
      expect(poll.id).toBeDefined();
    });
  });
});
```

### Integration Test Example (Routes)

```typescript
import request from 'supertest';
import createApp from '../../../app';
import pollService from '../polls.service';

jest.mock('../polls.service');

const app = createApp();

describe('POST /api/polls', () => {
  it('should create poll and return 201', async () => {
    const mockPoll = {
      id: 1,
      question: 'Test?',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (pollService.createPoll as jest.Mock).mockResolvedValue(mockPoll);

    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Test?', created_by: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });
});
```

### Bot Handler Test Example

```typescript
import { Context } from 'telegraf';
import pollsHandler from '../polls.handler';
import pollsService from '../polls.service';

jest.mock('../polls.service');

describe('PollsHandler', () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    mockCtx = {
      reply: jest.fn().mockResolvedValue(undefined),
      from: {
        id: 123456789,
        username: 'testuser',
      },
      message: {
        text: '',
      },
    };
  });

  it('should create a poll with valid command', async () => {
    (mockCtx.message as any).text =
      '/createpoll "What is your favorite language?"';
    (pollsService.createPoll as jest.Mock).mockResolvedValue(1);

    await pollsHandler.handleCreatePoll(mockCtx as Context, 1);

    expect(pollsService.createPoll).toHaveBeenCalled();
    expect(mockCtx.reply).toHaveBeenCalled();
  });
});
```

## CI/CD Integration

Tests can be run in CI/CD pipelines. The test scripts are designed to work in both local and CI environments.

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. **Mock External Dependencies**: Always mock database calls, external APIs, and services
2. **Test Edge Cases**: Include tests for error conditions, boundary values, and invalid inputs
3. **Keep Tests Focused**: Each test should verify one specific behavior
4. **Use Descriptive Names**: Test names should clearly describe what is being tested
5. **Clean Up**: Use `beforeEach` and `afterEach` to set up and tear down test state
6. **Avoid Test Interdependence**: Tests should be able to run in any order

## Troubleshooting

### Tests Failing with Database Errors

If tests fail with database connection errors, ensure:

- Test environment variables are set correctly
- Database mocks are properly configured
- No actual database connections are attempted in tests

### Coverage Not Meeting Goals

If coverage is below targets:

- Check which files are missing coverage
- Add tests for uncovered code paths
- Review coverage reports in `coverage/` directory

### TypeScript Errors in Tests

If you encounter TypeScript errors:

- Ensure `ts-jest` is properly configured
- Check that type definitions are imported correctly
- Verify `jest.config.js` includes proper TypeScript settings

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
