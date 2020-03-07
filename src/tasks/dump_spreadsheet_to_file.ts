import * as google from "@utils/tasks/google";
import * as csvStringify from "csv-stringify/lib/sync";
import * as fs from "fs";
import * as googleapis from "googleapis";
import * as yaml from "yaml";

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

export const writeFileSheetValue = (
  spreadsheetId: string,
  sheetRanges: string[],
  // eslint-disable-next-line @typescript-eslint/camelcase
  sheets: googleapis.sheets_v4.Sheets,
) => {
  return sheetRanges.map(async (range, index) => {
    // limit Read requests per user per 100 seconds
    const quotient = Math.floor(index / 90);
    await sleep(quotient * 100000);

    return sheets.spreadsheets.values
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

        const values = response.data.values.map(value => {
          if (value.length < maxColumnsLenght) {
            while (value.length < maxColumnsLenght) value.push("");
          }
          return value;
        });

        fs.writeFileSync(`./data/values/${sheetName}.csv`, csvStringify(values));
        fs.writeFileSync(`./data/values/${sheetName}.yml`, yaml.stringify(values));
      });
  });
};

export const writeFileFormulaValue = (
  spreadsheetId: string,
  sheetRanges: string[],
  // eslint-disable-next-line @typescript-eslint/camelcase
  sheets: googleapis.sheets_v4.Sheets,
) => {
  return sheetRanges.map(async (range, index) => {
    // limit Read requests per user per 100 seconds
    const quotient = Math.floor(index / 90);
    await sleep(quotient * 100000);

    return sheets.spreadsheets.values
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

        const values = response.data.values.map(value => {
          if (value.length < maxColumnsLenght) {
            while (value.length < maxColumnsLenght) value.push("");
          }
          return value;
        });

        fs.writeFileSync(`./data/formula/${sheetName}.csv`, csvStringify(values));
        fs.writeFileSync(`./data/formula/${sheetName}.yml`, yaml.stringify(values));
      });
  });
};

export const exec = async (spreadsheetId: strong) => {
  try {
    const client = google.client();

    const sheets = google.sheets(client);
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetRanges = spreadsheetResponse.data.sheets.map(
      sheet => `${sheet.properties.title}!1:${sheet.properties.gridProperties.rowCount}`,
    );

    await google.downloadSpreadsheet(client, spreadsheetId);
    await Promise.all(writeFileSheetValue(spreadsheetId, sheetRanges, sheets));
    await sleep(100000);
    await Promise.all(writeFileFormulaValue(spreadsheetId, sheetRanges, sheets));
  } catch (error) {
    console.error(error);
  }
};

const spreadsheetIdKeyValue = process.argv.join().match(/spread_sheet=\S*/);
if (spreadsheetIdKeyValue && spreadsheetIdKeyValue.length === 1) {
  const spreadsheetId = spreadsheetIdKeyValue[0].replace("spread_sheet=", "");
  console.info(` dump:${spreadsheetId} csv & xlsx ...`);
  exec(spreadsheetId);
} else {
  console.error(' \u001b[31m please "npm run dump spreadsheet_id=xxxxxxxxxx"');
}
