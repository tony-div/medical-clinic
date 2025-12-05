module.exports = {
    testEnvironment: "node",
    transform: {},
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    roots: ["<rootDir>/src/__tests__"],
    transformIgnorePatterns: ["/node_modules/"],
    moduleFileExtensions: ["js", "json"],
};
