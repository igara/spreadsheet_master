export const onEdit = (_: GoogleAppsScript.Events.SheetsOnEdit) => {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const temp = Utilities.getUuid();
  spreadSheet
    .createTextFinder("=")
    .matchFormulaText(true)
    .replaceAllWith(temp);
  spreadSheet
    .createTextFinder(temp)
    .matchFormulaText(true)
    .replaceAllWith("=");
};
global.onEdit = onEdit;
