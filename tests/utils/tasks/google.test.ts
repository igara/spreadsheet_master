describe("google.client", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("return value", () => {
    jest.mock("googleapis", () => ({
      google: {
        auth: {
          OAuth2: jest.fn(() => ({
            setCredentials: jest.fn(),
          })),
        },
      },
    }));

    import("@src/utils/tasks/google").then(google => {
      const client = google.client();
      expect(client.setCredentials).toBeCalled();
    });
  });

  test("googleapi error", () => {
    jest.mock("googleapis", () => ({
      google: {
        auth: {
          OAuth2: jest.fn(() => {
            throw new Error("googleapi error");
          }),
        },
      },
    }));

    import("@src/utils/tasks/google").then(google => {
      expect(() => {
        google.client();
      }).toThrow();
    });
  });
});
