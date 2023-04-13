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
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function preProccessing(cssOccurrences, frontEndOccurrences, blacklist) {
  cssOccurrences.forEach((cssOccurrence) => {
    if (!cssOccurrence.tsxPaths) cssOccurrence.tsxPaths = [];
    if (
      checkBlacklistedPath(blacklist, cssOccurrence.path, "cssPaths") ||
      blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
    )
      return;
    frontEndOccurrences.forEach((frontOccurrence) => {
      if (!frontOccurrence.cssPaths) frontOccurrence.cssPaths = [];
      if (cssOccurrence.class === frontOccurrence.class) {
        if (
          checkBlacklistedPath(blacklist, frontOccurrence.path, "frontPaths") ||
          blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
        )
          return;
        cssOccurrence.tsxPaths.push(frontOccurrence.path);
        frontOccurrence.cssPaths.push(cssOccurrence.path);
      }
    });
  });
  return { cssOccurrences, frontEndOccurrences };
}

/**
 * Checks if classes defined are being used
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @param {Array<string>} logs - An array of logs to add rows
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkDeclarations(cssOccurrences, blacklist, logs) {
  logs.push(
    "***For not found classes check expression list, maybe they are being calculated***"
  );
  cssOccurrences.forEach((cssOccurrence) => {
    if (
      checkBlacklistedPath(blacklist, cssOccurrence.path, "cssPaths") ||
      blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
    )
      return;
    if (cssOccurrence.tsxPaths.length === 0) {
      let text = `Not used class: '${cssOccurrence.class}' from ${cssOccurrence.path} line ${cssOccurrence.line}`;
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });
  return logs;
}

/**
 * Check if classes are defined on correct places
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @param {Array<string>} logs - An array of logs to add rows
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkDefinitionPaths(cssOccurrences, blacklist, logs) {
  cssOccurrences.forEach((cssOccurrence) => {
    if (
      checkBlacklistedPath(blacklist, cssOccurrence.path, "cssPaths") ||
      checkBlacklistedPath(blacklist, cssOccurrence.path, "moveCssPaths") ||
      blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
    )
      return;
    if (cssOccurrence.tsxPaths.length === 0) {
      return;
    }
    const commonPath = getCommonPath(cssOccurrence.tsxPaths);
    if (commonPath && commonPath !== path.dirname(cssOccurrence.path)) {
      let text = `Move class '${cssOccurrence.class}' from '${path.dirname(
        cssOccurrence.path
      )}' to '${commonPath}'`;
      text += `\nFound ocurrences of use:\n`;
      let files = [];
      cssOccurrence.tsxPaths.forEach((tsxPath) => {
        if (files.indexOf(tsxPath + ",") === -1) files.push(tsxPath + ",");
      });
      text += files.join("\n");
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });
  return logs;
}

/**
 * Checks if used classes have definitions
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @param {Array<string>} logs - An array of logs to add rows
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkDefinitions(frontEndOccurrences, blacklist, logs) {
  frontEndOccurrences.forEach((frontOccurrence) => {
    if (
      checkBlacklistedPath(blacklist, frontOccurrence.path, "frontPaths") ||
      blacklist.cssClasses.indexOf(frontOccurrence.class) > 0
    )
      return;
    if (frontOccurrence.cssPaths.length === 0 && frontOccurrence.class) {
      let text = `Definition not found for class: '${frontOccurrence.class}' from ${frontOccurrence.path} line ${frontOccurrence.line}`;
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });
  return logs;
}

/**
 * List expressions calculating classes on front files
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @param {Array<string>} logs - An array of logs to add rows
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function listExpressions(frontEndOccurrences, blacklist, logs) {
  logs.push("****EXPRESSION LIST:****\n");
  frontEndOccurrences.forEach((frontOccurrence) => {
    if (frontOccurrence.expression) {
      if (checkBlacklistedPath(blacklist, frontOccurrence.path, "frontPaths"))
        return;
      let text = `Expression: {'${frontOccurrence.expression}'} on ${frontOccurrence.path} line ${frontOccurrence.line}`;
      text += "\n";
      if (logs.indexOf(text) === -1) logs.push(text);
    }
  });
  return logs;
}

/**
 * Finds duplicate definitions for classes
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @param {Array<string>} logs - An array of logs to add rows
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function duplicateDefinitions(cssOccurrences, blacklist, logs) {
  const redundanceClasses = [];
  for (let i = 0; i < cssOccurrences.length; i++) {
    if (
      checkBlacklistedPath(blacklist, cssOccurrences[i].path, "cssPaths") ||
      blacklist.cssClasses.indexOf(cssOccurrences[i].class) > 0
    )
      continue;
    let redundance = "";
    if (redundanceClasses.indexOf(cssOccurrences[i].class) != -1) continue;

    for (let j = i + 1; j < cssOccurrences.length; j++) {
      if (checkBlacklistedPath(blacklist, cssOccurrences[j].path, "cssPaths"))
        continue;
      if (
        cssOccurrences[i].class === cssOccurrences[j].class &&
        cssOccurrences[i].path !== cssOccurrences[j].path
      ) {
        if (!redundance)
          redundance = `Duplicated definition of class: '${cssOccurrences[i].class}' found on\n'${cssOccurrences[i].path}' line ${cssOccurrences[i].line}`;
        redundance += `\'${cssOccurrences[j].path}' line ${cssOccurrences[j].line}`;
      }
    }
    redundance += "\n";
    redundanceClasses.push(cssOccurrences[i].class);
    if (logs.indexOf(redundance) === -1) logs.push(redundance);
  }

  return logs;
}

/**
 * Finds references to CSS classes in front-end files and provides refactoring suggestions.
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} config - An object with many plugin configurations
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function findClassReferences(cssOccurrences, frontEndOccurrences, config) {
  let logs = [];
  console.log("Pre proccessing...");
  const dataProcessed = preProccessing(
    cssOccurrences,
    frontEndOccurrences,
    config.blacklist
  );
  cssOccurrences = dataProcessed.cssOccurrences;
  frontEndOccurrences = dataProcessed.frontEndOccurrences;

  if (config.checkDeclarations !== false) {
    console.log("Checking Declarations...");
    logs = checkDeclarations(cssOccurrences, config.blacklist, logs);
  }
  if (config.checkDefinitionPaths !== false) {
    console.log("Checking Paths...");
    logs = checkDefinitionPaths(cssOccurrences, config.blacklist, logs);
  }
  if (config.checkDefinitions !== false) {
    console.log("Checking Definitions...");
    logs = checkDefinitions(frontEndOccurrences, config.blacklist, logs);
  }
  if (config.listExpressions !== false) {
    console.log("Listing Expressions...");
    logs = listExpressions(frontEndOccurrences, config.blacklist, logs);
  }
  if (config.duplicateDefinitions !== false) {
    console.log("Checking Duplicates...");
    logs = duplicateDefinitions(cssOccurrences, config.blacklist, logs);
  }
  return logs;
}

/**
 * Checks if a path is in blacklist
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @param {string} pathToCheck - Path to check if is in blacklist
 * @param {string} type - Where in blacklist do I need to check
 * @returns {boolean} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkBlacklistedPath(blacklist, pathToCheck, type) {
  if (!blacklist[type]) return false;

  return blacklist[type].some((blackItem) => {
    return path
      .relative(process.cwd(), pathToCheck)
      .startsWith(path.relative(process.cwd(), blackItem));
  });
}

module.exports = {
  findClassReferences,
};
