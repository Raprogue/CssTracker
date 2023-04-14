const fs = require("fs");
const path = require("path");

// Define o nome do script que você quer adicionar
const SCRIPT_NAME = "track-css";

// Obtém o caminho absoluto para o package.json do projeto principal
const projectPackageJsonPath = path.join(process.cwd(), "../../package.json");

// Lê o conteúdo do package.json do projeto principal
const projectPackageJson = JSON.parse(
  fs.readFileSync(projectPackageJsonPath, "utf8")
);

// Define o comando que será executado pelo script track-css
const trackCssCommand = "node ./node_modules/css-tracker/index.js --mode";

// Adiciona o script track-css ao package.json do projeto principal
projectPackageJson.scripts[SCRIPT_NAME] = trackCssCommand;
if (!projectPackageJson.cssTracker) {
  projectPackageJson.cssTracker = {};
}
if (!projectPackageJson.cssTracker.blacklist) {
  projectPackageJson.cssTracker.blacklist = {};
}
if (!projectPackageJson.cssTracker.blacklist.cssPaths) {
  projectPackageJson.cssTracker.blacklistcssPaths = [];
}
if (!projectPackageJson.cssTracker.blacklist.notUsedCss) {
  projectPackageJson.cssTracker.blacklist.notUsedCss = [
    "./node_modules",
    ".public",
    "./.cache",
    "./build",
    "./dist",
  ];
}
if (!projectPackageJson.cssTracker.blacklist.moveCssPaths) {
  projectPackageJson.cssTracker.blacklistmoveCssPaths = [
    "./node_modules",
    ".public",
    "./.cache",
    "./build",
    "./dist",
  ];
}
if (!projectPackageJson.cssTracker.blacklist.frontPaths) {
  projectPackageJson.cssTracker.blacklist.frontPaths = [
    "./node_modules",
    ".public",
    "./.cache",
    "./build",
    "./dist",
  ];
}
if (!projectPackageJson.cssTracker.blacklist.cssClasses) {
  projectPackageJson.cssTracker.blacklist.cssClasses = [];
}
if (!projectPackageJson.cssTracker.frontFiles) {
  projectPackageJson.cssTracker.frontFiles = [".tsx", ".jsx", ".html"];
}
if (!projectPackageJson.cssTracker.cssFiles) {
  projectPackageJson.cssTracker.cssFiles = [".css", ".scss"];
}
if (!projectPackageJson.cssTracker.outputLog) {
  projectPackageJson.cssTracker.outputLog = "./logs.txt";
}

// Escreve o conteúdo atualizado do package.json de volta no disco
fs.writeFileSync(
  projectPackageJsonPath,
  JSON.stringify(projectPackageJson, null, 2)
);
