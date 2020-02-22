import * as claspJson from "@root/.clasp.json";
import * as google from "@utils/tasks/google";
import * as csvParse from "csv-parse/lib/sync";
import * as fs from "fs";
import * as glob from "glob";
import * as googleapis from "googleapis";
import * as path from "path";

export const recreateCSVToSpreadsheet = async (
  spreadsheetId: string,
  csvFilePaths: string[],
  // eslint-disable-next-line @typescript-eslint/camelcase
  sheets: googleapis.sheets_v4.Sheets,
) => {
  const spreadsheetResponse = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  const sheetIdBySheetNameOnSpreadSheet = spreadsheetResponse.data.sheets.reduce((accumulator, sheet) => {
    accumulator[sheet.properties.title] = sheet.properties.sheetId;
    return accumulator;
  }, {});

  // eslint-disable-next-line @typescript-eslint/camelcase
  const addSheetRequests: googleapis.sheets_v4.Schema$Request[] = [];
  csvFilePaths.forEach(csvFilePath => {
    const sheetName = path.basename(csvFilePath).replace(/\.csv/, "");

    if (!sheetIdBySheetNameOnSpreadSheet[sheetName]) {
      addSheetRequests.push({
        addSheet: {
          properties: {
            title: sheetName,
          },
        },
      });
    }
  });

  if (addSheetRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: addSheetRequests,
      },
    });
  }

  return Promise.all(
    csvFilePaths.map(csvFilePath => {
      const sheetName = path.basename(csvFilePath).replace(/\.csv/, "");
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: csvParse(fs.readFileSync(`./data/formula/${sheetName}.csv`)),
        },
      });
    }),
  );
};

export const exec = async () => {
  try {
    const client = google.client();
    const sheets = google.sheets(client);
    const spreadsheetId = claspJson.spreadsheetId;

    const csvFilePaths = glob.sync("./data/formula/*.csv");
    await recreateCSVToSpreadsheet(spreadsheetId, csvFilePaths, sheets);

    return 0;
  } catch (error) {
    console.error(error);
  }
};

exec();
