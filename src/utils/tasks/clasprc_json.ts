import * as paths from "@utils/tasks/paths";
import * as fs from "fs";

type ClasprcJson = {
  token: {
    access_token: string;
    scope: string;
    token_type: string;
    id_token: string;
    expiry_date: number;
    refresh_token: string;
  };
  oauth2ClientSettings: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  isLocalCreds: boolean;
};

export const read = () => {
  try {
    const clasprcJsonBuffer = fs.readFileSync(`${paths.homeDirectoryPath}/.clasprc.json`);
    const clasprcJsonString = clasprcJsonBuffer.toString();
    const clasprcJson: ClasprcJson = JSON.parse(clasprcJsonString);
    return clasprcJson;
  } catch (error) {
    throw new Error(error);
  }
};
