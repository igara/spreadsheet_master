export const homeDirectoryPath = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
