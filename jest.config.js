module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.ts"],
  testPathIgnorePatterns: [
    ".*/dist/.*",
    ".*dist.*",
    "/node_modules/(?!got)(.*)",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};
