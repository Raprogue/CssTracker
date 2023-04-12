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
    process.cwd(),
    [".css", ".scss"],
    extractClassesFromCss
  );
  let tsxJson = scanFolder(process.cwd(), [".tsx"], extractClassesFromTSX);
  const blacklist = await loadBlackList();
  const logs = findClassReferences(cssJson, tsxJson, blacklist);
  fs.writeFileSync("./logs.txt", logs.join("\n"));
}

start();
