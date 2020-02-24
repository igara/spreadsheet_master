import * as fs from "fs";
const masterignoreFilePath = ".masterignore";

export const read = () => {
  try {
    const masterignoreBuffer = fs.readFileSync(masterignoreFilePath);
    const masterignoreString = masterignoreBuffer.toString();
    const masterignore = masterignoreString.split("\n");
    return masterignore;
  } catch (error) {
    throw new Error(error);
  }
};
