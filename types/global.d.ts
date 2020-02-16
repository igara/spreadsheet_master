declare module NodeJS {
  interface Global {
    onOpen(e: GoogleAppsScript.Events.SheetsOnOpen);
    onEdit(e: GoogleAppsScript.Events.SheetsOnEdit);
    [x: string]: any;
  }
}

