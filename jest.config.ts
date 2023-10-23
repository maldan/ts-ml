import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: ['./node_modules/'],
};

export default config;
