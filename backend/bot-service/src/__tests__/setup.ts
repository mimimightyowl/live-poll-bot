// Test setup file
// This file runs before all tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.API_SERVICE_GRPC_URL = 'localhost:50051';
