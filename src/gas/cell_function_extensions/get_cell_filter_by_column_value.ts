/**
 * 列に対する値から対象の行の値を取得
 *
 * @example =GetCellFilterByColumnValue("列名の範囲!検索列名,検索列値,表示したい列")
 *          =GetCellFilterByColumnValue("2:2!id,1,name")
 * @example =GetCellFilterByColumnValue("シート名!1:1[列名の範囲]!検索列名,検索列値,表示したい列")
 *          =GetCellFilterByColumnValue("users!2:2!id,1,name")
 * @param string argsString
 * @return string | number
 * @customfunction
 */
export const GetCellFilterByColumnValue = (argsString: string) => {
  try {
    const args = argsString.split(/(!|,)/);
    if (args.length === 7) {
      const columnNamesRangeString = args[0];
      const searchColumnName = args[2];
      const searchColumnValue = args[4];
      const targetColumnName = args[6];

      const sheet = SpreadsheetApp.getActiveSheet();
      const sheetDataRangeValues = sheet.getDataRange().getValues();
      const columnNames = sheet.getRange(columnNamesRangeString).getValues()[0];

      const searchColumnNumber = columnNames.indexOf(searchColumnName);
      const targetColumnNumber = columnNames.indexOf(targetColumnName);

      for (let rowNumber = 0; rowNumber < sheetDataRangeValues.length; rowNumber++) {
        const cell = sheetDataRangeValues[rowNumber][searchColumnNumber];
        if (cell == searchColumnValue) {
          return sheetDataRangeValues[rowNumber][targetColumnNumber];
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
      const sheetDataRangeValues = sheet.getDataRange().getValues();
      const columnNames = sheet.getRange(columnNamesRangeString).getValues()[0];

      const searchColumnNumber = columnNames.indexOf(searchColumnName);
      const targetColumnNumber = columnNames.indexOf(targetColumnName);

      for (let rowNumber = 0; rowNumber < sheetDataRangeValues.length; rowNumber++) {
        const cell = sheetDataRangeValues[rowNumber][searchColumnNumber];
        if (cell == searchColumnValue) {
          return sheetDataRangeValues[rowNumber][targetColumnNumber];
        }
      }
    }
  } catch (error) {
    return "#ERROR";
  }

  return "#ERROR";
};

global.GetCellFilterByColumnValue = GetCellFilterByColumnValue;
