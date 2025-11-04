import sharedConfig from '../eslint.config.shared.js';

// Admin app extends shared frontend ESLint configuration
export default [
  ...sharedConfig,
  {
    // App-specific overrides can be added here
    rules: {},
  },
];
