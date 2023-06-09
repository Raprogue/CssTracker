const fs = require("fs");
const path = require("path");
const { findClassReferences } = require("./src/processor");
const { scanFolder, loadConfig } = require("./src/fileScan");
const {
  extractClassesFromFront,
  extractClassesFromCss,
} = require("./src/classExtractor");

async function start() {
  const config = await loadConfig();
  const mode = process.argv[process.argv.indexOf("--mode") + 1];
  if (mode !== undefined) {
    config.checkDeclarations = mode.indexOf("d") >= 0 || mode.indexOf("D") >= 0;
    config.checkDefinitionPaths =
      mode.indexOf("p") >= 0 || mode.indexOf("P") >= 0;
    config.checkDefinitions = mode.indexOf("f") >= 0 || mode.indexOf("F") >= 0;
    config.listExpressions = mode.indexOf("e") >= 0 || mode.indexOf("E") >= 0;
    config.duplicateDefinitions =
      mode.indexOf("l") >= 0 || mode.indexOf("L") >= 0;
  }
  console.log("Configuration:");
  console.log(config);

  console.log("Loading Css Files...");
  let cssJson = scanFolder(
    process.cwd(),
    config.cssFiles,
    extractClassesFromCss
  );

  console.log("Loading Front Files...");
  let frontJson = scanFolder(
    process.cwd(),
    config.frontFiles,
    extractClassesFromFront
  );
  const logs = findClassReferences(cssJson, frontJson, config);
  fs.writeFileSync(config.outputLog, JSON.stringify(logs, null, 2));
}

start();
