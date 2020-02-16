const tsconfig = require("./tsconfig.json");
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig);

module.exports = {
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper,
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
    SpreadsheetApp: {},
  },
  moduleDirectories: ["node_modules"],
  moduleFileExtensions: ["js", "json", "ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
