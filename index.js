const fs = require("fs");
const path = require("path");
const { findClassReferences } = require("./src/processor");
const { scanFolder, loadBlackList } = require("./src/fileScan");
const {
  extractClassesFromTSX,
  extractClassesFromCss,
} = require("./src/classExtractor");

async function start() {
  let cssJson = scanFolder(
    path.dirname(__filename),
    [".css", ".scss"],
    extractClassesFromCss
  );
  let tsxJson = scanFolder(
    path.dirname(__filename),
    [".tsx"],
    extractClassesFromTSX
  );
  const blacklist = await loadBlackList();
  const logs = findClassReferences(cssJson, tsxJson, blacklist);
  fs.writeFileSync("./logs/logs.txt", logs.join("\n"));
}
start();
