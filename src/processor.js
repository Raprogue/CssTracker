/**
  A module for process css data about a project
  @module processor
*/
const path = require("path");
const { getCommonPath } = require("./fileScan");

/**
 * Finds references to CSS classes in front-end files and provides refactoring suggestions.
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function findClassReferences(cssOccurrences, frontEndOccurrences, blacklist) {
  const logs = [];

  cssOccurrences.forEach((cssOccurrence) => {
    if (!cssOccurrence.tsxPaths) cssOccurrence.tsxPaths = [];
    frontEndOccurrences.forEach((frontOccurrence) => {
      if (!frontOccurrence.cssPaths) frontOccurrence.cssPaths = [];
      if (cssOccurrence.class === frontOccurrence.class) {
        if (
          blacklist.paths.indexOf(cssOccurrence.path) > 0 ||
          blacklist.paths.indexOf(frontOccurrence.path) > 0 ||
          blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
        )
          return;
        cssOccurrence.tsxPaths.push(frontOccurrence.path);
        frontOccurrence.cssPaths.push(cssOccurrence.path);
      }
    });
  });

  cssOccurrences.forEach((cssOccurrence) => {
    if (
      blacklist.paths.indexOf(cssOccurrence.path) > 0 ||
      blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
    )
      return;
    if (cssOccurrence.tsxPaths.length === 0) {
      let text = `Nao foi encontrada nenhuma referencia para a classe '${cssOccurrence.class}', confira a lista de expressoes, caso possa haver alguma referencia`;
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
    const commonPath = getCommonPath(cssOccurrence.tsxPaths);
    if (
      commonPath &&
      path.dirname(commonPath) !== path.dirname(cssOccurrence.path)
    ) {
      let text = `Sugestão: mover a classe '${cssOccurrence.class}' da pasta '${cssOccurrence.path}' para a pasta '${commonPath}'`;
      text += `\nporque foram encontradas ocorrências em:`;
      cssOccurrence.tsxPaths.forEach((tsxPath) => {
        text += "\n" + tsxPath + ", ";
      });
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });

  frontEndOccurrences.forEach((frontOccurrence) => {
    if (
      blacklist.paths.indexOf(frontOccurrence.path) > 0 ||
      blacklist.cssClasses.indexOf(frontOccurrence.class) > 0
    )
      return;
    if (frontOccurrence.cssPaths.length === 0 && frontOccurrence.class) {
      let text = `Nao foi encontrada nenhuma definicao para a classe '${frontOccurrence.class}'`;
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });
  logs.push("LISTA DE EXPRESSOES EM REFERENCIAS DE CLASSES:\n");
  frontEndOccurrences.forEach((frontOccurrence) => {
    if (frontOccurrence.expression) {
      if (blacklist.paths.indexOf(frontOccurrence.path) > 0) return;
      let text = `Expressao: {'${frontOccurrence.expression}'} no arquivo ${frontOccurrence.path} na linha ${frontOccurrence.line}`;
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });

  const redundanceClasses = [];
  for (let i = 0; i < cssOccurrences.length; i++) {
    if (
      blacklist.paths.indexOf(cssOccurrences[i].path) > 0 ||
      blacklist.cssClasses.indexOf(cssOccurrences[i].class) > 0
    )
      continue;
    let redundance = "";
    if (redundanceClasses.indexOf(cssOccurrences[i].class) != -1) continue;

    for (let j = i + 1; j < cssOccurrences.length; j++) {
      if (blacklist.paths.indexOf(cssOccurrences[j].path) > 0) continue;
      if (
        cssOccurrences[i].class === cssOccurrences[j].class &&
        cssOccurrences[i].path !== cssOccurrences[j].path
      ) {
        if (!redundance)
          redundance = `Duplicidade encontrada: classe '${cssOccurrences[i].class}' presente em '${cssOccurrences[i].path}' linha ${cssOccurrences[i].line} `;
        redundance += `\ne '${cssOccurrences[j].path}' linha ${cssOccurrences[j].line}`;
      }
    }
    redundance += "\n";
    redundanceClasses.push(cssOccurrences[i].class);
    if (logs.indexOf(redundance) === -1) logs.push(redundance);
  }

  return logs;
}

module.exports = {
  findClassReferences,
};
