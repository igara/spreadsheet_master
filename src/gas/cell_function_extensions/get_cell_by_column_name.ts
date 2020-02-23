/**
 * 列名から値を取得する
 *
 * @example =GetCellByColumnName("列名の範囲!行番号,列名")
 *          =GetCellByColumnName("2:2!2,name") 作業中のシートの2行目で列名とマッチした値を取得
 * @example =GetCellByColumnName("シート名!列名の範囲!行番号,列名")
 *          =GetCellByColumnName("users!2:2!"& ROW(4:4) & ",name") 該当するシートの4行目で列名とマッチした値を取得
 * @param string argsString
 * @return string | number
 * @customfunction
 */
export const GetCellByColumnName = (argsString: string) => {
  try {
    const args = argsString.split(/(!|,)/);
    if (args.length === 5) {
      const columnNamesRangeString = args[0];
      const rowNumber = Number(args[2]);
      const columnName = args[4];
      const sheet = SpreadsheetApp.getActiveSheet();
      const columnNames = sheet.getRange(columnNamesRangeString).getValues()[0];

      return sheet.getRange(rowNumber, columnNames.indexOf(columnName) + 1).getValue();
    }

    if (args.length === 7) {
      const sheetName = args[0];
      const columnNamesRangeString = args[2];
      const rowNumber = Number(args[4]);
      const columnName = args[6];

      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      const columnNames = sheet.getRange(columnNamesRangeString).getValues()[0];

      return sheet.getRange(rowNumber, columnNames.indexOf(columnName) + 1).getValue();
    }
  } catch (error) {
    return "#ERROR";
  }
};
global.GetCellByColumnName = GetCellByColumnName;
