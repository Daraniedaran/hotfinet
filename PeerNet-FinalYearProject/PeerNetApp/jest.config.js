module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@react-native-firebase/(.*)$': '<rootDir>/__mocks__/firebaseMock.js',
    '^@firebase/(.*)$': '<rootDir>/__mocks__/firebaseMock.js',
    '^firebase/(.*)$': '<rootDir>/__mocks__/firebaseMock.js',
    '^@react-native-community/geolocation$': '<rootDir>/__mocks__/firebaseMock.js',
    '^react-native-camera-kit$': '<rootDir>/__mocks__/firebaseMock.js',
  },
};
