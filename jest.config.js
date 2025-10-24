// This file exists to prevent Jest from running
// We use Vitest for testing instead
module.exports = {
  testMatch: [], // No test files should match
  testPathIgnorePatterns: [".*"], // Ignore all paths
  collectCoverage: false,
  silent: true,
};
