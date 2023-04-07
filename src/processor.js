/**
  A module for process css data about a project
  @module processor
*/

/**
 * Finds references to CSS classes in front-end files and provides refactoring suggestions.
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function findClassReferences(cssOccurrences, frontEndOccurrences) {
  const logs = [];

  cssOccurrences.forEach((cssOccurrence) => {
    if (!cssOccurrence.tsxPaths) cssOccurrence.tsxPaths = [];
    frontEndOccurrences.forEach((frontOccurrence) => {
      if (cssOccurrence.class === frontOccurrence.class) {
        cssOccurrence.tsxPaths.push(frontOccurrence.path);
      }
    });
  });

  cssOccurrences.forEach((cssOccurrence) => {
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

  for (let i = 0; i < cssOccurrences.length; i++) {
    for (let j = i + 1; j < cssOccurrences.length; j++) {
      if (
        cssOccurrences[i].class === cssOccurrences[j].class &&
        cssOccurrences[i].path !== cssOccurrences[j].path
      ) {
        const text = `Duplicidade encontrada: classe '${cssOccurrences[i].class}' presente em '${cssOccurrences[i].path}' e '${cssOccurrences[j].path}'`;
        if (logs.indexOf(text) === -1) logs.push(text);
      }
    }
  }

  return logs;
}

module.exports = {
  findClassReferences,
};
