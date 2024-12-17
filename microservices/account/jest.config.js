// microservices/account/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/src/test/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
      '^.+\\.(ts|tsx)$': [
          'ts-jest',
          { 
              tsconfig: 'tsconfig.json'
          }
      ],
      // This line allows Babel to transform ESM in node_modules
      '^.+\\.(js|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
      // Override default to allow graphql-request to be transformed
      'node_modules/(?!graphql-request)'
  ],
};