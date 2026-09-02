module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native|react-native|@expo|expo)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
