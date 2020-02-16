describe("claspJson.read", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("return value", () => {
    const test = {
      spreadsheetId: "string",
      scriptId: "string",
      rootDir: "dist",
    };

    jest.mock("fs", () => ({
      readFileSync: jest.fn(() => Buffer.from(JSON.stringify(test))),
    }));

    import("@src/utils/tasks/clasp_json").then(claspJson => {
      const json = claspJson.read();
      expect(json).toStrictEqual(test);
    });
  });

  test("not found clasp.json", () => {
    jest.mock("fs", () => ({
      readFileSync: jest.fn(() => {
        throw new Error("not found clasp.json");
      }),
    }));

    import("@src/utils/tasks/clasp_json").then(claspJson => {
      expect(() => {
        claspJson.read();
      }).toThrow();
    });
  });
});

describe("claspJson.write", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("success wrote", () => {
    const test = {
      spreadsheetId: "string",
      scriptId: "string",
    };

    jest.mock("fs", () => ({
      writeFileSync: jest.fn(() => test),
    }));

    import("@src/utils/tasks/clasp_json").then(claspJson => {
      const status = claspJson.write(test);
      expect(status).toStrictEqual("OK");
    });
  });

  test("faild wrote", () => {
    const test = {
      spreadsheetId: "string",
      scriptId: "string",
    };

    jest.mock("fs", () => ({
      writeFileSync: jest.fn(() => {
        throw new Error("not found clasp.json");
      }),
    }));

    import("@src/utils/tasks/clasp_json").then(claspJson => {
      expect(() => {
        claspJson.write(test);
      }).toThrow();
    });
  });
});
