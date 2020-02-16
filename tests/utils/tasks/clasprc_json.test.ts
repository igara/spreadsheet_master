describe("clasprcJson.read", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("return value", () => {
    const test = {
      token: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: "string",
        scope: "string",
        // eslint-disable-next-line @typescript-eslint/camelcase
        token_type: "string",
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token: "string",
        // eslint-disable-next-line @typescript-eslint/camelcase
        expiry_date: 1,
        // eslint-disable-next-line @typescript-eslint/camelcase
        refresh_token: "string",
      },
      oauth2ClientSettings: {
        clientId: "string",
        clientSecret: "string",
        redirectUri: "string",
      },
      isLocalCreds: false,
    };

    jest.mock("fs", () => ({
      readFileSync: jest.fn(() => Buffer.from(JSON.stringify(test))),
    }));

    import("@src/utils/tasks/clasprc_json").then(clasprcJson => {
      const json = clasprcJson.read();
      expect(json).toStrictEqual(test);
    });
  });

  test("not found clasprc.json", () => {
    jest.mock("fs", () => ({
      readFileSync: jest.fn(() => {
        throw new Error("not found clasprc.json");
      }),
    }));

    import("@src/utils/tasks/clasprc_json").then(clasprcJson => {
      expect(() => {
        clasprcJson.read();
      }).toThrow();
    });
  });
});
