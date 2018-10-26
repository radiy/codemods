module.exports = {
  projects: [
    {
      displayName: 'test',
      testMatch: ['**/__tests__/**/*.test.js'],
    },
    {
      runner: 'jest-runner-eslint',
      displayName: 'lint',
      testMatch: ['<rootDir>/src/**/*.js'],
    },
  ],
}
