describe("cell_function_extensions/get_cell_by_column_name", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test(`GetCellByColumnName("列名の範囲!行番号,列名")`, () => {
    const getRangeMock = jest.fn();

    global.SpreadsheetApp["getActiveSheet"] = jest.fn().mockReturnValue({
      getRange: getRangeMock.mockReturnValue({
        getValues: () => [
          ["id", "rank", "event_id", "event_name", "user_id", "user_name"],
          [1, 1, 1, "christmas", 1, "taro"],
          [1, 1, 1, "christmas", 2, "jiro"],
          [1, 1, 1, "christmas", 3, "saburo"],
        ],
        getValue: () => jest.fn(),
      }),
    });

    import("@src/gas/cell_function_extensions/get_cell_by_column_name").then(getCellByColumnName => {
      const columnNamesRangeString = "1:1";
      const rowNumber = 2;
      getCellByColumnName.GetCellByColumnName(`${columnNamesRangeString}!${rowNumber},event_id`);

      const columnNamesRangeStringMock = getRangeMock.mock.calls[0][0];
      expect(columnNamesRangeStringMock).toEqual(columnNamesRangeString);

      const returnGetRangeMock = getRangeMock.mock.calls[1];
      expect(returnGetRangeMock).toEqual([rowNumber, 3]);
    });
  });

  test(`GetCellByColumnName("シート名!列名の範囲!行番号,列名")`, () => {
    const getSheetByNameMock = jest.fn();
    const getRangeMock = jest.fn();

    global.SpreadsheetApp["getActiveSpreadsheet"] = jest.fn().mockReturnValue({
      getSheetByName: getSheetByNameMock.mockReturnValue({
        getRange: getRangeMock.mockReturnValue({
          getValues: () => [
            ["id", "rank", "event_id", "event_name", "user_id", "user_name"],
            [1, 1, 1, "christmas", 1, "taro"],
            [1, 1, 1, "christmas", 2, "jiro"],
            [1, 1, 1, "christmas", 3, "saburo"],
          ],
          getValue: () => jest.fn(),
        }),
      }),
    });

    import("@src/gas/cell_function_extensions/get_cell_by_column_name").then(getCellByColumnName => {
      const sheetName = "シート名1";
      const columnNamesRangeString = "1:1";
      const rowNumber = 3;
      getCellByColumnName.GetCellByColumnName(`${sheetName}!${columnNamesRangeString}!${rowNumber},user_id`);

      const sheetNameMock = getSheetByNameMock.mock.calls[0][0];
      expect(sheetNameMock).toEqual(sheetName);

      const columnNamesRangeStringMock = getRangeMock.mock.calls[0][0];
      expect(columnNamesRangeStringMock).toEqual(columnNamesRangeString);

      const returnGetRangeMock = getRangeMock.mock.calls[1];
      expect(returnGetRangeMock).toEqual([rowNumber, 5]);
    });
  });

  test(`GetCellByColumnName("")`, () => {
    import("@src/gas/cell_function_extensions/get_cell_by_column_name").then(getCellByColumnName => {
      const result = getCellByColumnName.GetCellByColumnName("");
      expect(result).toEqual("#ERROR");
    });
  });
});
