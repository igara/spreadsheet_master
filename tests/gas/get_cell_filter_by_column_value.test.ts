describe("cell_function_extensions/get_cell_filter_by_column_value", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test(`GetCellFilterByColumnValue("列名の範囲!検索列名,検索列値,表示したい列")`, () => {
    const getRangeMock = jest.fn();

    global.SpreadsheetApp["getActiveSheet"] = jest.fn().mockReturnValue({
      getDataRange: () => {
        return {
          getValues: () => [
            ["id", "rank", "event_id", "event_name", "user_id", "user_name"],
            [1, 1, 1, "christmas", 1, "taro"],
            [1, 1, 1, "christmas", 2, "jiro"],
            [1, 1, 1, "christmas", 3, "saburo"],
          ],
        };
      },
      getRange: getRangeMock.mockReturnValue({
        getValues: () => [["id", "rank", "event_id", "event_name", "user_id", "user_name"]],
      }),
    });

    import("@src/gas/cell_function_extensions/get_cell_filter_by_column_value").then(getCellByColumnName => {
      const columnNamesRangeString = "1:1";
      const searchColumnName = "user_id";
      const searchColumnValue = 2;
      const result = getCellByColumnName.GetCellFilterByColumnValue(
        `${columnNamesRangeString}!${searchColumnName},${searchColumnValue},user_name`,
      );

      const columnNamesRangeStringMock = getRangeMock.mock.calls[0][0];
      expect(columnNamesRangeStringMock).toBe(columnNamesRangeString);

      expect(result).toBe("jiro");
    });
  });

  test(`GetCellFilterByColumnValue("列名の範囲!検索列名,検索列値,表示したい列")`, () => {
    const getSheetByNameMock = jest.fn();
    const getRangeMock = jest.fn();

    global.SpreadsheetApp["getActiveSpreadsheet"] = jest.fn().mockReturnValue({
      getSheetByName: getSheetByNameMock.mockReturnValue({
        getDataRange: () => {
          return {
            getValues: () => [
              ["id", "rank", "event_id", "event_name", "user_id", "user_name"],
              [1, 1, 1, "christmas", 1, "taro"],
              [1, 1, 1, "christmas", 2, "jiro"],
              [1, 1, 1, "christmas", 3, "saburo"],
            ],
          };
        },
        getRange: getRangeMock.mockReturnValue({
          getValues: () => [["id", "rank", "event_id", "event_name", "user_id", "user_name"]],
        }),
      }),
    });

    import("@src/gas/cell_function_extensions/get_cell_filter_by_column_value").then(getCellByColumnName => {
      const sheetName = "シート名1";
      const columnNamesRangeString = "1:1";
      const searchColumnName = "user_id";
      const searchColumnValue = 3;
      const result = getCellByColumnName.GetCellFilterByColumnValue(
        `${sheetName}!${columnNamesRangeString}!${searchColumnName},${searchColumnValue},user_name`,
      );

      const columnNamesRangeStringMock = getRangeMock.mock.calls[0][0];
      expect(columnNamesRangeStringMock).toBe(columnNamesRangeString);

      expect(result).toBe("saburo");
    });
  });

  test(`GetCellFilterByColumnValue("")`, () => {
    import("@src/gas/cell_function_extensions/get_cell_filter_by_column_value").then(getCellByColumnName => {
      const result = getCellByColumnName.GetCellFilterByColumnValue("");
      expect(result).toBe("ERROR");
    });
  });
});
