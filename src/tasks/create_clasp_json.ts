import * as claspJson from "@utils/tasks/clasp_json";
import * as google from "@utils/tasks/google";

export const exec = async (name: string) => {
  try {
    const client = google.client();

    const drive = google.drive(client);
    const createSpreadsheetResponse = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.spreadsheet",
      },
      fields: "id",
    });
    const spreadsheetId = createSpreadsheetResponse.data.id;

    const script = google.script(client);
    const createScriptResponse = await script.projects.create({
      requestBody: {
        title: name,
        parentId: spreadsheetId,
      },
    });
    const scriptId = createScriptResponse.data.scriptId;

    const ids = { spreadsheetId, scriptId };
    claspJson.write(ids);
    return ids;
  } catch (error) {
    console.error(error);
  }
};

const nameKeyValue = process.argv.join().match(/name=\S*/);
if (nameKeyValue && nameKeyValue.length === 1) {
  const name = nameKeyValue[0].replace("name=", "");
  console.info(` create name:${name} spreadsheet & script project...`);
  exec(name);
} else {
  console.error(' \u001b[31m please "npm run new name=hoge"');
}
