import * as clasprcJson from "@utils/tasks/clasprc_json";
import * as fs from "fs";
import * as GoogleAuthLibrary from "google-auth-library";
import * as googleapis from "googleapis";
import * as request from "request-promise";

export const client = () => {
  try {
    const json = clasprcJson.read();

    const oauth2Client = new googleapis.google.auth.OAuth2(
      json.oauth2ClientSettings.clientId,
      json.oauth2ClientSettings.clientSecret,
      json.oauth2ClientSettings.redirectUri,
    );

    oauth2Client.setCredentials(json.token);
    return oauth2Client;
  } catch (error) {
    throw new Error(error);
  }
};

export const drive = (oauth2Client: GoogleAuthLibrary.OAuth2Client) =>
  googleapis.google.drive({
    version: "v3",
    auth: oauth2Client,
  });

export const script = (oauth2Client: GoogleAuthLibrary.OAuth2Client) =>
  googleapis.google.script({
    version: "v1",
    auth: oauth2Client,
  });

export const sheets = (oauth2Client: GoogleAuthLibrary.OAuth2Client) =>
  googleapis.google.sheets({
    version: "v4",
    auth: oauth2Client,
  });

export const downloadSpreadsheet = async (oauth2Client: GoogleAuthLibrary.OAuth2Client, fileId: string) => {
  const fetchUrl = `https://docs.google.com/feeds/download/spreadsheets/Export?key=${fileId}&amp;exportFormat=xlsx`;
  const accessToken = await oauth2Client.getAccessToken();

  return request({
    url: fetchUrl,
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
    method: "GET",
    encoding: null,
  }).then(xlsx => {
    fs.writeFileSync("./data/spreadsheet.xlsx", xlsx, "binary");
  });
};
