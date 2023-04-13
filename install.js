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
  projectPackageJson.cssTracker = {
    blacklist: {
      cssPaths: [],
      moveCssPaths: ["./node_modules", ".public", "./.cache", "./build"],
      frontPaths: ["./node_modules", ".public", "./.cache", "./build"],
      cssClasses: [],
    },
    frontFiles: [".tsx", ".jsx", ".html"],
    cssFiles: [".css", ".scss"],
    outputLog: "./logs.txt",
  };
}
// Escreve o conteúdo atualizado do package.json de volta no disco
fs.writeFileSync(
  projectPackageJsonPath,
  JSON.stringify(projectPackageJson, null, 2)
);
