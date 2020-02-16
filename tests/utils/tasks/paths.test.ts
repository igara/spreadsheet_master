describe("paths.homeDirectoryPath", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("windows", () => {
    const test = "C:\\USER\\hoge";

    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    Object.defineProperty(process, "env", {
      value: {
        USERPROFILE: test,
      },
    });

    import("@src/utils/tasks/paths").then(paths => {
      const path = paths.homeDirectoryPath;
      expect(path).toBe(test);
    });
  });

  test("another", () => {
    const test = "/Users/hoge";

    Object.defineProperty(process, "platform", {
      value: "darwin",
    });
    Object.defineProperty(process, "env", {
      value: {
        HOME: test,
      },
    });

    import("@src/utils/tasks/paths").then(paths => {
      const path = paths.homeDirectoryPath;
      expect(path).toBe(test);
    });
  });
});
