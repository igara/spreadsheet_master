describe("create_clasp_json.exec", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("return value", () => {
    const ids = {
      spreadsheetId: "spreadsheetId",
      scriptId: "scriptId",
    };
    jest.mock("@src/utils/tasks/google", () => ({
      client: jest.fn(),
      drive: () => ({
        files: {
          create: () => ({
            data: {
              id: ids.spreadsheetId,
            },
          }),
        },
      }),
      script: () => ({
        projects: {
          create: () => ({
            data: {
              scriptId: ids.scriptId,
            },
          }),
        },
      }),
    }));

    jest.mock("@src/utils/tasks/clasp_json", () => ({
      write: jest.fn(),
    }));

    import("@src/tasks/create_clasp_json").then(async createClaspJson => {
      const result = await createClaspJson.exec("test");
      expect(result).toStrictEqual(ids);
    });
  });
});
