# Testing Guide - MiBolsillo Server

This guide provides comprehensive information about testing the MiBolsillo server application.

## Table of Contents

1. [Unit Tests (Jest)](#unit-tests-jest)
2. [API Integration Tests](#api-integration-tests)
3. [Manual Test Scripts](#manual-test-scripts)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Troubleshooting](#troubleshooting)

## Unit Tests (Jest)

Jest is configured for unit testing with mocking support.

### Test Structure

Tests are located in the `__tests__` directory:

```
__tests__/
  ├── authController.test.js      # Authentication controller tests
  ├── chatController.test.js       # Chat functionality tests
  ├── geminiService.test.js        # Gemini API service tests
  ├── supabaseConfig.test.js       # Database configuration tests
  ├── transactionController.test.js # Transaction handling tests
  └── integration.test.js          # Integration tests
```

### Test Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| Auth Controller | 5 | User registration, error handling |
| Chat Controller | 6 | Message processing, validation |
| Gemini Service | 5 | API responses, error handling |
| Transaction Controller | 6 | CRUD operations |
| Supabase Config | 4 | Database connectivity |
| Integration | 5 | Multi-component interaction |

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test authController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should register"
```

### Example Test Output

```
PASS  __tests__/geminiService.test.js
  Gemini Service
    ✓ should return mock response when no API key is configured (25ms)
    ✓ should handle successful Gemini API response (15ms)
    ✓ should handle SAFETY blocked responses (12ms)
    ✓ should handle API errors gracefully (10ms)
    ✓ should handle empty response candidates (8ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

## API Integration Tests

### Chat Endpoint Tests

**File:** `__tests__/chatController.test.js`

Tests for:
- ✓ Missing message validation
- ✓ Successful message processing
- ✓ Error handling
- ✓ Special character support
- ✓ Long message handling

### Auth Endpoint Tests

**File:** `__tests__/authController.test.js`

Tests for:
- ✓ User registration
- ✓ Duplicate user detection
- ✓ Password hashing
- ✓ Database error handling
- ✓ Token generation

### Transaction Endpoint Tests

**File:** `__tests__/transactionController.test.js`

Tests for:
- ✓ Fetching transactions
- ✓ Creating transactions
- ✓ Field validation
- ✓ Error handling

## Manual Test Scripts

Three manual test scripts are provided for broader testing:

### 1. test_models.js - Gemini Model Testing

**Purpose:** Test which Gemini models are available and working

```bash
node test_models.js
```

**What it tests:**
- gemini-pro
- gemini-1.5-flash
- gemini-1.5-pro
- gemini-1.5-flash-latest
- gemini-1.5-pro-latest

**Example Output:**
```
🔄 Testing Gemini Models...

✓ API Key configured (ends with xyzK)

Testing gemini-pro...
✓ SUCCESS with gemini-pro
  Response: Hello! I'm ready to help you with...

...

Results: 3 passed, 2 failed
```

### 2. test_api.js - API Endpoint Testing

**Purpose:** Test actual running API endpoints

```bash
# Make sure server is running first
npm run dev

# In another terminal:
node test_api.js
```

**What it tests:**
- User registration endpoint
- Chat message endpoint
- Transaction endpoints
- Error responses

**Expected Output:**
```
🚀 Starting API Tests...
Base URL: http://localhost:3000/api

📝 Testing: Register User
   POST http://localhost:3000/api/auth/register
✓ PASSED (Status: 201)

📝 Testing: Send Chat Message
   POST http://localhost:3000/api/chat
✓ PASSED (Status: 200)

============================================================
TEST SUMMARY
============================================================
✓ Register User: PASSED
✓ Send Chat Message: PASSED
✓ Send Chat with empty message: PASSED
✓ Get Transactions: PASSED
============================================================
Total: 4 passed, 0 failed
```

### 3. Environment Setup for Manual Tests

Create a `.env` file for testing:

```env
GEMINI_API_KEY=your_actual_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3000
API_URL=http://localhost:3000/api
```

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Development Testing Workflow

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Run tests in watch mode
npm run test:watch

# Terminal 3: Run API tests
node test_api.js
```

### CI/CD Integration

For continuous integration pipelines:

```bash
# Run tests with exit code
npm test -- --passWithNoTests

# Generate coverage report
npm run test:coverage -- --coverage
```

## Test Coverage

### Viewing Coverage Reports

After running `npm run test:coverage`, view the HTML report:

```bash
# Open coverage report (Windows)
start coverage/lcov-report/index.html

# Open coverage report (Mac)
open coverage/lcov-report/index.html

# Open coverage report (Linux)
xdg-open coverage/lcov-report/index.html
```

### Coverage Targets

Current coverage includes:
- **Statements:** Core service and controller functions
- **Branches:** Error handling and conditional logic
- **Functions:** All main exported functions
- **Lines:** High coverage for critical paths

## Troubleshooting

### Issue: Tests timeout

**Solution:** Increase timeout in jest.config.js:
```javascript
testTimeout: 15000  // Increase to 15 seconds
```

### Issue: "Cannot find module" errors

**Solution:** Ensure dependencies are installed:
```bash
npm install
```

### Issue: Supabase/Gemini API errors in tests

**Solution:** These are mocked. Check environment variables:
```bash
# Verify .env is set up correctly
echo $GEMINI_API_KEY
echo $SUPABASE_URL
```

### Issue: test_api.js fails to connect

**Solution:** Start the server first:
```bash
npm run dev  # In one terminal
node test_api.js  # In another terminal
```

### Issue: Port already in use

**Solution:** Change the port in .env:
```env
PORT=3001
```

## Test Best Practices

1. **Keep tests isolated:** Each test should be independent
2. **Use descriptive names:** Test names should explain what is being tested
3. **Mock external services:** Don't rely on actual APIs in unit tests
4. **Test error cases:** Include tests for failure scenarios
5. **Update tests with code:** Keep tests synchronized with implementation

## Adding New Tests

To add a new test file:

1. Create file in `__tests__` directory: `__tests__/newFeature.test.js`
2. Use existing test as template
3. Run tests: `npm test`
4. Update this README

### Test Template

```javascript
describe('Feature Name', () => {
    beforeEach(() => {
        // Setup
    });

    afterEach(() => {
        // Cleanup
    });

    test('should do something', async () => {
        // Arrange
        const input = 'test';
        
        // Act
        const result = await someFunction(input);
        
        // Assert
        expect(result).toBe('expected');
    });
});
```

## References

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://jestjs.io/docs/en/tutorial-react)

---

**Last Updated:** 2025-12-12
**Jest Version:** 29.7.0
**Node Version:** 14.0.0+
