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
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkDeclarations(cssOccurrences, blacklist) {
  let logs = [];
  cssOccurrences.forEach((cssOccurrence) => {
    if (
      checkBlacklistedPath(blacklist, cssOccurrence.path, "cssPaths") ||
      checkBlacklistedPath(blacklist, cssOccurrence.path, "notUsedCss") ||
      blacklist.cssClasses.indexOf(cssOccurrence.class) > 0
    )
      return;
    if (cssOccurrence.tsxPaths.length === 0) {
      let foundLogIndex = logs.findIndex(
        (log) => log.class === cssOccurrence.class
      );

      if (foundLogIndex === -1) {
        logs.push({
          class: cssOccurrence.class,
          paths: [{ path: cssOccurrence.path, lines: [cssOccurrence.line] }],
        });
      } else {
        let log = logs[foundLogIndex];
        let foundPathIndex = log.paths.findIndex(
          (path) => path.path === cssOccurrence.path
        );

        if (foundPathIndex === -1) {
          log.paths.push({
            path: cssOccurrence.path,
            lines: [cssOccurrence.line],
          });
        } else {
          let path = log.paths[foundPathIndex];
          if (path.lines.indexOf(cssOccurrence.line) === -1) {
            path.lines.push(cssOccurrence.line);
          }
        }
      }
    }
  });
  return logs;
}

/**
 * Check if classes are defined on correct places
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkDefinitionPaths(cssOccurrences, blacklist) {
  let logs = [];
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
      logs.push({
        class: cssOccurrence.class,
        moveFrom: path.dirname(cssOccurrence.path),
        moveTo: commonPath,
        occurrences: cssOccurrence.tsxPaths,
      });
    }
  });
  return logs;
}

/**
 * Checks if used classes have definitions
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function checkDefinitions(frontEndOccurrences, blacklist) {
  let logs = [];
  frontEndOccurrences.forEach((frontOccurrence) => {
    if (
      checkBlacklistedPath(blacklist, frontOccurrence.path, "frontPaths") ||
      blacklist.cssClasses.indexOf(frontOccurrence.class) > 0
    )
      return;
    if (frontOccurrence.cssPaths.length === 0 && frontOccurrence.class) {
      let foundLogIndex = logs.findIndex(
        (log) => log.class === frontOccurrence.class
      );

      if (foundLogIndex === -1) {
        logs.push({
          class: frontOccurrence.class,
          paths: [
            { path: frontOccurrence.path, lines: [frontOccurrence.line] },
          ],
        });
      } else {
        let log = logs[foundLogIndex];
        let foundPathIndex = log.paths.findIndex(
          (path) => path.path === frontOccurrence.path
        );

        if (foundPathIndex === -1) {
          log.paths.push({
            path: frontOccurrence.path,
            lines: [frontOccurrence.line],
          });
        } else {
          let path = log.paths[foundPathIndex];
          if (path.lines.indexOf(frontOccurrence.line) === -1) {
            path.lines.push(frontOccurrence.line);
          }
        }
      }
    }
  });
  return logs;
}

/**
 * List expressions calculating classes on front files
 * @param {Array<{class: string, line: number, path: string}>} frontEndOccurrences - An array of objects representing the occurrences of CSS classes in front-end files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function listExpressions(frontEndOccurrences, blacklist) {
  let logs = [];
  frontEndOccurrences.forEach((frontOccurrence) => {
    if (frontOccurrence.expression) {
      if (checkBlacklistedPath(blacklist, frontOccurrence.path, "frontPaths"))
        return;
      let foundLogIndex = logs.findIndex(
        (log) => log.expression === frontOccurrence.expression
      );

      if (foundLogIndex === -1) {
        logs.push({
          expression: frontOccurrence.expression,
          paths: [
            { path: frontOccurrence.path, lines: [frontOccurrence.line] },
          ],
        });
      } else {
        let log = logs[foundLogIndex];
        let foundPathIndex = log.paths.findIndex(
          (path) => path.path === frontOccurrence.path
        );

        if (foundPathIndex === -1) {
          log.paths.push({
            path: frontOccurrence.path,
            lines: [frontOccurrence.line],
          });
        } else {
          let path = log.paths[foundPathIndex];
          if (path.lines.indexOf(frontOccurrence.line) === -1) {
            path.lines.push(frontOccurrence.line);
          }
        }
      }
    }
  });
  return logs;
}

/**
 * Finds duplicate definitions for classes
 * @param {Array<{class: string, line: number, path: string}>} cssOccurrences - An array of objects representing the occurrences of CSS classes in CSS/SCSS files. Each object should have a 'class' property representing the class name, a 'line' property representing the line number, and a 'path' property representing the file path.
 * @param {Object} blacklist - An object with blacklist of paths and classes
 * @returns {Array<string>} - An array of log messages with refactoring suggestions. The messages include suggestions to move the CSS classes to a common directory if they are used in multiple files, and warnings for duplicate class definitions.
 */
function duplicateDefinitions(cssOccurrences, blacklist) {
  let logs = [];
  const redundanceClasses = [];
  for (let i = 0; i < cssOccurrences.length; i++) {
    if (
      checkBlacklistedPath(blacklist, cssOccurrences[i].path, "cssPaths") ||
      checkBlacklistedPath(blacklist, cssOccurrences[i].path, "duplicateCss") ||
      blacklist.cssClasses.indexOf(cssOccurrences[i].class) > 0
    )
      continue;
    let redundance = "";
    if (redundanceClasses.indexOf(cssOccurrences[i].class) != -1) continue;

    for (let j = i + 1; j < cssOccurrences.length; j++) {
      if (
        checkBlacklistedPath(blacklist, cssOccurrences[j].path, "cssPaths") ||
        checkBlacklistedPath(blacklist, cssOccurrences[i].path, "duplicateCss")
      )
        continue;
      if (cssOccurrences[i].class === cssOccurrences[j].class) {
        if (!redundance) {
          let foundLogIndex = logs.findIndex(
            (log) => log.class === cssOccurrences[i].class
          );

          if (foundLogIndex === -1) {
            if (cssOccurrences[i].path === cssOccurrences[j].path)
              logs.push({
                class: cssOccurrences[i].class,
                paths: [
                  {
                    path: cssOccurrences[i].path,
                    lines: [cssOccurrences[i].line, cssOccurrences[j].line],
                  },
                ],
              });
            else
              logs.push({
                class: cssOccurrences[i].class,
                paths: [
                  {
                    path: cssOccurrences[i].path,
                    lines: [cssOccurrences[i].line],
                  },
                  {
                    path: cssOccurrences[j].path,
                    lines: [cssOccurrences[j].line],
                  },
                ],
              });
          } else {
            let log = logs[foundLogIndex];
            let foundPathIndex = log.paths.findIndex(
              (path) => path.path === cssOccurrences[i].path
            );

            if (foundPathIndex === -1) {
              log.paths.push({
                path: cssOccurrences[i].path,
                lines: [cssOccurrences[i].line],
              });
            } else {
              let path = log.paths[foundPathIndex];
              if (path.lines.indexOf(cssOccurrences[i].line) === -1) {
                path.lines.push(cssOccurrences[i].line);
              }
            }

            foundPathIndex = log.paths.findIndex(
              (path) => path.path === cssOccurrences[j].path
            );

            if (foundPathIndex === -1) {
              log.paths.push({
                path: cssOccurrences[j].path,
                lines: [cssOccurrences[j].line],
              });
            } else {
              let path = log.paths[foundPathIndex];
              if (path.lines.indexOf(cssOccurrences[j].line) === -1) {
                path.lines.push(cssOccurrences[j].line);
              }
            }
          }
        }
      }
    }
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
  let logs = {};
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
    logs.notUsedClasses = checkDeclarations(cssOccurrences, config.blacklist);
  }
  if (config.checkDefinitionPaths !== false) {
    console.log("Checking Paths...");
    logs.moveClass = checkDefinitionPaths(cssOccurrences, config.blacklist);
  }
  if (config.checkDefinitions !== false) {
    console.log("Checking Definitions...");
    logs.noDefinitions = checkDefinitions(
      frontEndOccurrences,
      config.blacklist
    );
  }
  if (config.listExpressions !== false) {
    console.log("Listing Expressions...");
    logs.expressions = listExpressions(frontEndOccurrences, config.blacklist);
  }
  if (config.duplicateDefinitions !== false) {
    console.log("Checking Duplicates...");
    logs.duplicateDefs = duplicateDefinitions(cssOccurrences, config.blacklist);
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
