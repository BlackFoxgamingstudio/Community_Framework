require('dotenv').config();

// Mock database connection for tests
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

// Global beforeAll and afterAll hooks
beforeAll(() => {
  // Any global setup
});

afterAll(() => {
  // Any global cleanup
}); 