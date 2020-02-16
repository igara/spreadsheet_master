import * as fs from "fs";
const claspJsonFileName = ".clasp.json";

export type ClaspJson = {
  spreadsheetId: string;
  scriptId: string;
  rootDir: "dist";
  projectId: string;
};

export const read = () => {
  try {
    const claspJsonBuffer = fs.readFileSync(claspJsonFileName);
    const claspJsonString = claspJsonBuffer.toString();
    const claspJson: ClaspJson = JSON.parse(claspJsonString);
    return claspJson;
  } catch (error) {
    throw new Error(error);
  }
};

export const write = (param: { spreadsheetId: string; scriptId: string }) => {
  try {
    const claspJson: ClaspJson = {
      ...param,
      rootDir: "dist",
      projectId: "",
    };
    const claspJsonString = JSON.stringify(claspJson);
    fs.writeFileSync(claspJsonFileName, claspJsonString);
    console.info(`\u001b[32m success created ${claspJsonFileName}`);
    return "OK";
  } catch (error) {
    throw new Error(error);
  }
};
