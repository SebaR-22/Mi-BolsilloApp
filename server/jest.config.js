module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!src/config/**',
    ],
    coveragePathIgnorePatterns: ['/node_modules/'],
    testTimeout: 10000,
    forceExit: true,
    clearMocks: true,
};
