module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.js'],
    moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
    transform: {
        "^.+\\.js$": "babel-jest"
    },
};