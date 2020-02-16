export const onOpen = (_: GoogleAppsScript.Events.SheetsOnOpen) => {
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
global.onOpen = onOpen;
