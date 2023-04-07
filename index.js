const fs = require("fs");
const path = require("path");
const { findClassReferences } = require("./src/processor");
const { scanFolder } = require("./src/fileScan");
const {
  extractClassesFromTSX,
  extractClassesFromCss,
} = require("./src/classExtractor");

function start() {
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
  const logs = findClassReferences(cssJson, tsxJson);
  fs.writeFileSync("./logs/logs.txt", logs.join("\n"));
}

module.exports = {
  start,
};
