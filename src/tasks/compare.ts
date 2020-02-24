import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import pixelmatch = require("pixelmatch");
import * as Canvas from "canvas";
import * as png from "pngjs";
import * as puppeteer from "puppeteer";

const exec = async (commitHash: string) => {
  await Promise.all([
    new Promise(resolve => {
      childProcess.execSync(`git show ${commitHash}:data/spreadsheet.xlsx > compares/prev_spreadsheet.xlsx`);
      childProcess.execSync(
        `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to "html:HTML (StarCalc):UTF8" --outdir compares/html compares/prev_spreadsheet.xlsx`,
      );
      resolve();
    }),
    new Promise(resolve => {
      childProcess.execSync("cp data/spreadsheet.xlsx compares/current_spreadsheet.xlsx");
      childProcess.execSync(
        `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to "html:HTML (StarCalc):UTF8" --outdir compares/html compares/current_spreadsheet.xlsx`,
      );
      resolve();
    }),
  ]);

  const browser = await puppeteer.launch({ headless: true });

  let currentSheetNames: string[];
  let prevSheetNames: string[];
  await Promise.all([
    browser.newPage().then(async page => {
      await page.goto(`file:${path.join(__dirname, "../../compares/html/current_spreadsheet.html")}`);
      await page.waitFor(5000);

      currentSheetNames = await page.evaluate(() => {
        const list = Array.from(document.querySelectorAll("h1 > em"));
        return list.map(l => l.textContent);
      }, "body");
      const tables = await page.$$("table");

      if (currentSheetNames.length === tables.length) {
        for (let i = 0; i < currentSheetNames.length; i++) {
          await tables[i].screenshot({
            path: `./compares/png/current_${currentSheetNames[i]}.png`,
          });
        }
        await page.addStyleTag({
          content: `comment {
            background: #ffd;
            position: absolute;
            display: block;
            border: 1px solid black;
            padding:0.5em;
          }`,
        });
        for (let i = 0; i < currentSheetNames.length; i++) {
          await tables[i].screenshot({
            path: `./compares/png/current_comment_${currentSheetNames[i]}.png`,
          });
        }
      }
    }),
    browser.newPage().then(async page => {
      await page.goto(`file:${path.join(__dirname, "../../compares/html/prev_spreadsheet.html")}`);
      await page.waitFor(5000);

      prevSheetNames = await page.evaluate(() => {
        const list = Array.from(document.querySelectorAll("h1 > em"));
        return list.map(l => l.textContent);
      }, "body");
      const tables = await page.$$("table");

      if (prevSheetNames.length === tables.length) {
        for (let i = 0; i < prevSheetNames.length; i++) {
          await tables[i].screenshot({
            path: `./compares/png/prev_${prevSheetNames[i]}.png`,
          });
        }
        await page.addStyleTag({
          content: `comment {
            background: #ffd;
            position: absolute;
            display: block;
            border: 1px solid black;
            padding:0.5em;
          }`,
        });
        for (let i = 0; i < prevSheetNames.length; i++) {
          await tables[i].screenshot({
            path: `./compares/png/prev_comment_${prevSheetNames[i]}.png`,
          });
        }
      }
    }),
  ]);

  await browser.close();

  const modifySheetNames = [...currentSheetNames, ...prevSheetNames].filter((x, i, self) => {
    return self.indexOf(x) === i && i !== self.lastIndexOf(x);
  });
  const prevOnlySheetNames = [...modifySheetNames, ...prevSheetNames].filter((val, _, arr) => {
    return arr.indexOf(val) === arr.lastIndexOf(val);
  });
  const currentOnlySheetNames = [...modifySheetNames, ...currentSheetNames].filter((val, _, arr) => {
    return arr.indexOf(val) === arr.lastIndexOf(val);
  });

  await Promise.all(
    modifySheetNames.map(modifySheetName => {
      return new Promise(resolve => {
        const currentFile = fs.readFileSync(`compares/png/current_${modifySheetName}.png`);
        const prevFile = fs.readFileSync(`compares/png/prev_${modifySheetName}.png`);
        const currentCommentFile = fs.readFileSync(`compares/png/current_comment_${modifySheetName}.png`);
        const prevCommentFile = fs.readFileSync(`compares/png/prev_comment_${modifySheetName}.png`);
        const currentPng = png.PNG.sync.read(currentFile);
        const prevPng = png.PNG.sync.read(prevFile);

        const { width: currentWidth, height: currentHeight } = currentPng;
        const { width: prevWidth, height: prevHeight } = prevPng;
        const width = currentWidth > prevWidth ? currentWidth : prevWidth;
        const height = currentHeight > prevHeight ? currentHeight : prevHeight;

        const Image = Canvas.Image;
        const currentImage = new Image();
        currentImage.src = currentFile;
        const currentCanvas = new Canvas.Canvas(width, height);
        const currentCanvasContext = currentCanvas.getContext("2d");
        currentCanvasContext.drawImage(currentImage, 0, 0, currentImage.width, currentImage.height);
        const currentBuffer = Buffer.from(currentCanvas.toDataURL().split(",")[1], "base64");

        const prevImage = new Image();
        prevImage.src = prevFile;
        const prevCanvas = new Canvas.Canvas(width, height);
        const prevCanvasContext = prevCanvas.getContext("2d");
        prevCanvasContext.drawImage(prevImage, 0, 0, prevImage.width, prevImage.height);
        const prevBuffer = Buffer.from(prevCanvas.toDataURL().split(",")[1], "base64");

        const currentCommentImage = new Image();
        currentCommentImage.src = currentCommentFile;
        const currentCommentCanvas = new Canvas.Canvas(width, height);
        const currentCommentCanvasContext = currentCommentCanvas.getContext("2d");
        currentCommentCanvasContext.drawImage(
          currentCommentImage,
          0,
          0,
          currentCommentImage.width,
          currentCommentImage.height,
        );
        const currentCommentBuffer = Buffer.from(currentCommentCanvas.toDataURL().split(",")[1], "base64");

        const prevCommentImage = new Image();
        prevCommentImage.src = prevCommentFile;
        const prevCommentCanvas = new Canvas.Canvas(width, height);
        const prevCommentCanvasContext = prevCommentCanvas.getContext("2d");
        prevCommentCanvasContext.drawImage(prevCommentImage, 0, 0, prevCommentImage.width, prevCommentImage.height);
        const prevCommentBuffer = Buffer.from(prevCommentCanvas.toDataURL().split(",")[1], "base64");

        const diff = new png.PNG({
          width,
          height,
        });

        pixelmatch(
          png.PNG.sync.read(currentBuffer).data,
          png.PNG.sync.read(prevBuffer).data,
          diff.data,
          width,
          height,
          { threshold: 0.1 },
        );

        fs.writeFileSync(`compares/png/current_${modifySheetName}.png`, currentBuffer);
        fs.writeFileSync(`compares/png/prev_${modifySheetName}.png`, prevBuffer);
        fs.writeFileSync(`compares/png/modify_${modifySheetName}.png`, png.PNG.sync.write(diff));

        const commentDiff = new png.PNG({
          width,
          height,
        });

        pixelmatch(
          png.PNG.sync.read(currentCommentBuffer).data,
          png.PNG.sync.read(prevCommentBuffer).data,
          commentDiff.data,
          width,
          height,
          { threshold: 0.1 },
        );

        fs.writeFileSync(`compares/png/current_comment_${modifySheetName}.png`, currentCommentBuffer);
        fs.writeFileSync(`compares/png/prev_comment_${modifySheetName}.png`, prevCommentBuffer);
        fs.writeFileSync(`compares/png/modify_comment_${modifySheetName}.png`, png.PNG.sync.write(commentDiff));
        resolve();
      });
    }),
  );

  const html = `<html>
  <head>
  </head>
  <body>
    メモなし差分
    <table>
      <thead>
        <tr>
          <th>prev</th>
          <th>current</th>
          <th>diff</th>
        </tr>
      </thead>
      <tbody>
        ${prevOnlySheetNames.reduce((accumulator, prevOnlySheetName) => {
          accumulator += `<tr>
            <td>${prevOnlySheetName}</td>
          </tr>
          <tr>
            <td><img src="./compares/png/prev_${prevOnlySheetName}.png"></td>
            <td></td>
            <td></td>
          </tr>`;
          return accumulator;
        }, "")}
        ${currentOnlySheetNames.reduce((accumulator, currentOnlySheetName) => {
          accumulator += `<tr>
            <td>${currentOnlySheetName}</td>
          </tr>
          <tr>
            <td></td>
            <td><img src="./compares/png/current_${currentOnlySheetName}.png"></td>
            <td></td>
          </tr>`;
          return accumulator;
        }, "")}
        ${modifySheetNames.reduce((accumulator, modifySheetName) => {
          accumulator += `<tr>
            <td>${modifySheetName}</td>
          </tr>
          <tr>
            <td><img src="./compares/png/prev_${modifySheetName}.png"></td>
            <td><img src="./compares/png/current_${modifySheetName}.png"></td>
            <td><img src="./compares/png/modify_${modifySheetName}.png"></td>
          </tr>`;
          return accumulator;
        }, "")}
      </tbody>
    </table>
    メモあり差分
    <table>
      <thead>
        <tr>
          <th>prev</th>
          <th>current</th>
          <th>diff</th>
        </tr>
      </thead>
      <tbody>
        ${prevOnlySheetNames.reduce((accumulator, prevOnlySheetName) => {
          accumulator += `<tr>
            <td>${prevOnlySheetName}</td>
          </tr>
          <tr>
            <td><img src="./compares/png/prev_comment_${prevOnlySheetName}.png"></td>
            <td></td>
            <td></td>
          </tr>`;
          return accumulator;
        }, "")}
        ${currentOnlySheetNames.reduce((accumulator, currentOnlySheetName) => {
          accumulator += `<tr>
            <td>${currentOnlySheetName}</td>
          </tr>
          <tr>
            <td></td>
            <td><img src="./compares/png/current_comment_${currentOnlySheetName}.png"></td>
            <td></td>
          </tr>`;
          return accumulator;
        }, "")}
        ${modifySheetNames.reduce((accumulator, modifySheetName) => {
          accumulator += `<tr>
            <td>${modifySheetName}</td>
          </tr>
          <tr>
            <td><img src="./compares/png/prev_comment_${modifySheetName}.png"></td>
            <td><img src="./compares/png/current_comment_${modifySheetName}.png"></td>
            <td><img src="./compares/png/modify_comment_${modifySheetName}.png"></td>
          </tr>`;
          return accumulator;
        }, "")}
      </tbody>
    </table>
  </body>
</html>`;

  fs.writeFileSync("diff.html", html);
  childProcess.execSync("open diff.html");
};

const commitHashKeyValue = process.argv.join().match(/commit_hash=\S*/);
if (commitHashKeyValue && commitHashKeyValue.length === 1) {
  const commitHash = commitHashKeyValue[0].replace("commit_hash=", "");
  console.info(` diff commitHash:${commitHash} spreadsheet ...`);
  exec(commitHash);
} else {
  console.error(' \u001b[31m please "npm run compare commitHash=hoge"');
}
