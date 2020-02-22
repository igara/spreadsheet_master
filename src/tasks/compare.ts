import * as childProcess from "child_process";

const exec = (commitHash: string) => {
  const gitShowCoomand = `git show ${commitHash}:data/spreadsheet.xlsx > prev_spreadsheet.xlsx`;
  childProcess.execSync(gitShowCoomand);

  const currentPDFConvertCommand =
    "/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf:writer_pdf_Export data/spreadsheet.xlsx";
  const prevPDFConvertCommand =
    "/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf:writer_pdf_Export prev_spreadsheet.xlsx";
  childProcess.execSync(currentPDFConvertCommand);
  childProcess.execSync(prevPDFConvertCommand);

  const diffPDFCommand = "diff-pdf --output-diff=diff.pdf spreadsheet.pdf prev_spreadsheet.pdf";
  childProcess.exec(diffPDFCommand, () => {
    const openDiffPDFCommand = "open diff.pdf";
    childProcess.execSync(openDiffPDFCommand);
  });
};

const commitHashKeyValue = process.argv.join().match(/commit_hash=\S*/);
if (commitHashKeyValue && commitHashKeyValue.length === 1) {
  const commitHash = commitHashKeyValue[0].replace("commit_hash=", "");
  console.info(` diff commitHash:${commitHash} spreadsheet ...`);
  exec(commitHash);
} else {
  console.error(' \u001b[31m please "npm run compare commitHash=hoge"');
}
