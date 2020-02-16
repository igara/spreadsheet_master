/**
 * 列に対する値から対象の行の値を取得
 *
 * @example =GetCellFilterByColumnValue("列名の範囲!検索列名,検索列値,表示したい列")
 *          =GetCellFilterByColumnValue("2:2!順位,1,プライズ名")
 * @example =GetCellFilterByColumnValue("シート名!1:1[列名の範囲]!検索列名,検索列値,表示したい列")
 *          =GetCellFilterByColumnValue("[PDF]プライズ（ライバー）!2:2!順位,1,プライズ名")
 * @param string argsString
 * @return string | number
 * @customfunction
 */
const GetCellFilterByColumnValue = (argsString: string) => {
  const args = argsString.split(/(!|,)/);

  try {
    if (args.length === 7) {
      const columnNamesRangeString = args[0];
      const searchColumnName = args[2];
      const searchColumnValue = args[4];
      const targetColumnName = args[6];

      const sheet = SpreadsheetApp.getActiveSheet();
      const sheetCellValues = sheet.getDataRange().getValues();
      const columnNames = sheet.getRange(columnNamesRangeString).getValues()[0];

      const searchColumnNumber = columnNames.indexOf(searchColumnName);
      const targetColumnNumber = columnNames.indexOf(targetColumnName);

      for (let rowNumber = 0; rowNumber < sheetCellValues.length; rowNumber++) {
        const cell = sheetCellValues[rowNumber][searchColumnNumber];
        if (cell == searchColumnValue) {
          return sheetCellValues[rowNumber][targetColumnNumber];
        }
      }
    }

    if (args.length === 9) {
      const sheetName = args[0];
      const columnNamesRangeString = args[2];
      const searchColumnName = args[4];
      const searchColumnValue = args[6];
      const targetColumnName = args[8];

      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      const sheetCellValues = sheet.getDataRange().getValues();
      const columnNames = sheet.getRange(columnNamesRangeString).getValues()[0];

      const searchColumnNumber = columnNames.indexOf(searchColumnName);
      const targetColumnNumber = columnNames.indexOf(targetColumnName);

      for (let rowNumber = 0; rowNumber < sheetCellValues.length; rowNumber++) {
        const cell = sheetCellValues[rowNumber][searchColumnNumber];
        if (cell == searchColumnValue) {
          return sheetCellValues[rowNumber][targetColumnNumber];
        }
      }
    }
  } catch (error) {
    return "#ERROR";
  }
};

global.GetCellFilterByColumnValue = GetCellFilterByColumnValue;
