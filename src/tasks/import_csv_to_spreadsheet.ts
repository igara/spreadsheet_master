import * as claspJson from "@root/.clasp.json";
import * as google from "@utils/tasks/google";
import * as csvParse from "csv-parse/lib/sync";
import * as fs from "fs";
import * as glob from "glob";
import * as googleapis from "googleapis";
import * as path from "path";

export const importCSVToSpreadsheet = async (
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
  // eslint-disable-next-line @typescript-eslint/camelcase
  const deleteSheetRequests: googleapis.sheets_v4.Schema$Request[] = [];
  csvFilePaths.forEach(csvFilePath => {
    const sheetName = path.basename(csvFilePath).replace(/\.csv/, "");
    const copySheetName = `copy_${sheetName}`;
    addSheetRequests.push({
      addSheet: {
        properties: {
          title: copySheetName,
        },
      },
    });
    deleteSheetRequests.push({
      deleteSheet: {
        sheetId: sheetIdBySheetNameOnSpreadSheet[sheetName],
      },
    });
  });

  return await sheets.spreadsheets
    .batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [...addSheetRequests, ...deleteSheetRequests],
      },
    })
    .then(response => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const updateSheetPropertiesRequests: googleapis.sheets_v4.Schema$Request[] = [];
      return Promise.all(
        response.data.replies
          .filter(replie => replie.addSheet)
          .map(replie => {
            const addSheet = replie.addSheet;
            const sheetName = addSheet.properties.title.replace(/copy_/, "");

            updateSheetPropertiesRequests.push({
              updateSheetProperties: {
                properties: {
                  sheetId: addSheet.properties.sheetId,
                  title: sheetName,
                },
                fields: "title",
              },
            });
            return sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${addSheet.properties.title}!A1`,
              valueInputOption: "USER_ENTERED",
              requestBody: {
                values: csvParse(fs.readFileSync(`./data/formula/${sheetName}.csv`)),
              },
            });
          }),
      ).then(async () => {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: updateSheetPropertiesRequests,
          },
        });
      });
    });
};

export const exec = async () => {
  try {
    const client = google.client();
    const sheets = google.sheets(client);
    const spreadsheetId = claspJson.spreadsheetId;
    const csvFilePaths = glob.sync("./data/formula/*.csv");
    await importCSVToSpreadsheet(spreadsheetId, csvFilePaths, sheets);

    return 0;
  } catch (error) {
    console.error(error);
  }
};

// const nameKeyValue = process.argv.join().match(/name=\S*/);
// if (nameKeyValue && nameKeyValue.length === 1) {
//   const name = nameKeyValue[0].replace("name=", "");
//   console.info(` create name:${name} spreadsheet & script project...`);
exec();
// } else {
//   console.error(' \u001b[31m please "npm run new name=hoge"');
// }
