import * as claspJson from "@root/.clasp.json";
import * as google from "@utils/tasks/google";
import * as csvStringify from "csv-stringify/lib/sync";
import * as fs from "fs";
import * as googleapis from "googleapis";
import * as yaml from "yaml";

export const writeFileSheetValue = (
  spreadsheetId: string,
  sheetRanges: string[],
  // eslint-disable-next-line @typescript-eslint/camelcase
  sheets: googleapis.sheets_v4.Sheets,
) => {
  return sheetRanges.map(range =>
    sheets.spreadsheets.values
      .get({
        spreadsheetId,
        range,
      })
      .then(async response => {
        if (response.data.values === undefined) return;
        const sheetName = response.data.range
          .replace(/!\S*/, "")
          .replace(/^'/, "")
          .replace(/'$/, "");
        const maxColumnsLenght = response.data.values.reduce((accumulator, columns) => {
          return accumulator < columns.length ? columns.length : accumulator;
        }, 0);

        const values = response.data.values
          .filter(value => value.length > 0)
          .map(value => {
            if (value.length < maxColumnsLenght) {
              while (value.length < maxColumnsLenght) value.push("");
            }
            return value;
          });

        fs.writeFileSync(`./data/values/${sheetName}.csv`, csvStringify(values));
        fs.writeFileSync(`./data/values/${sheetName}.yml`, yaml.stringify(values));
      }),
  );
};

export const writeFileFormulaValue = (
  spreadsheetId: string,
  sheetRanges: string[],
  // eslint-disable-next-line @typescript-eslint/camelcase
  sheets: googleapis.sheets_v4.Sheets,
) => {
  return sheetRanges.map(range =>
    sheets.spreadsheets.values
      .get({
        spreadsheetId,
        range,
        valueRenderOption: "FORMULA",
      })
      .then(response => {
        if (response.data.values === undefined) return;
        const sheetName = response.data.range
          .replace(/!\S*/, "")
          .replace(/^'/, "")
          .replace(/'$/, "");
        const maxColumnsLenght = response.data.values.reduce((accumulator, columns) => {
          return accumulator < columns.length ? columns.length : accumulator;
        }, 0);

        const values = response.data.values
          .filter(value => value.length > 0)
          .map(value => {
            if (value.length < maxColumnsLenght) {
              while (value.length < maxColumnsLenght) value.push("");
            }
            return value;
          });

        fs.writeFileSync(`./data/formula/${sheetName}.csv`, csvStringify(values));
        fs.writeFileSync(`./data/formula/${sheetName}.yml`, yaml.stringify(values));
      }),
  );
};

export const exec = async () => {
  try {
    const client = google.client();
    const spreadsheetId = claspJson.spreadsheetId;

    const sheets = google.sheets(client);
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetRanges = spreadsheetResponse.data.sheets.map(
      sheet => `${sheet.properties.title}!1:${sheet.properties.gridProperties.rowCount}`,
    );

    Promise.all([
      google.downloadSpreadsheet(spreadsheetId),
      ...writeFileSheetValue(spreadsheetId, sheetRanges, sheets),
      ...writeFileFormulaValue(spreadsheetId, sheetRanges, sheets),
    ]);
  } catch (error) {
    console.error(error);
  }
};

exec();
