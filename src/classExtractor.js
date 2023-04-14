/**
 * This module exports a function that extracts class names from css or front end file.
 * @module extractClassesFromTSX
 */
const fs = require("fs");

/**
 * Extracts class names from a front-end file
 * @param {string} path - The path to the .tsx file.
 * @returns {Array<{class: string, line: number, path: string}>} - An array of objects containing the class name, line number and file path.
 */
const extractClassesFromFront = (path) => {
  if (path.endsWith(".tsx") || path.endsWith(".jsx")) {
    return extractClassesFromTSX(path);
  }
  return extractClassesFromJS(path);
};

/**
 * Extracts class names from a .tsx file.
 * @param {string} path - The path to the .tsx file.
 * @returns {Array<{class: string, line: number, path: string}>} - An array of objects containing the class name, line number and file path.
 */
const extractClassesFromTSX = (path) => {
  let fileContent = fs.readFileSync(path, "utf8");
  const classNames = [];
  const stringRegexp = /className=["']([^"']*)["']/g;
  const expressionRegexp = /className={`([^`\\]*(?:\\.[^`\\]*)*)`}/g;
  const newExpressionRegexp =
    /className={((?:[^"'}]|(?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))+)}/g;
  let match;

  while ((match = stringRegexp.exec(fileContent))) {
    const className = match[1].trim();
    if (className) {
      const classList = className.split(/\s+/);
      classList.forEach((cl) => {
        const trimmed = cl.trim();
        if (trimmed) {
          classNames.push({
            class: trimmed.replace(/^\./, ""),
            line: getLineNumber(fileContent, match.index),
            path: path,
          });
        }
      });
    }
  }
  fileContent = fileContent.replace(stringRegexp, "-");

  while ((match = expressionRegexp.exec(fileContent))) {
    let expression = match[1].trim();

    if (expression) {
      const expressionMatches = expression.match(/\${[\s\S]*?}/g) || [];
      const expressionless = expression.replace(/\${[\s\S]*?}/g, "");

      expressionMatches.forEach((exp) => {
        const expressionValue = exp.slice(2, -1).trim();
        const line =
          getLineNumber(fileContent, match.index) + getLineCount(expression);
        classNames.push(...interpretExpression(expressionValue, line, path));
      });

      const classList = expressionless.split(/\s+/);
      classList.forEach((cl) => {
        const trimmed = cl.trim();
        if (trimmed) {
          classNames.push({
            class: cl,
            line:
              getLineNumber(fileContent, match.index) +
              getLineCount(expression),
            path: path,
          });
        }
      });
    }
  }
  fileContent = fileContent.replace(expressionRegexp, "-");

  while ((match = newExpressionRegexp.exec(fileContent))) {
    const expression = match[1].trim();
    const line = getLineNumber(fileContent, match.index);
    classNames.push(...interpretExpression(expression, line, path));
  }
  fileContent = fileContent.replace(newExpressionRegexp, "-");

  return classNames;
};

/**
 * Extracts class names from a front end file.
 * @param {string} path - The path to the .tsx file.
 * @returns {Array<{class: string, line: number, path: string}>} - An array of objects containing the class name, line number and file path.
 */
const extractClassesFromJS = (path) => {
  let fileContent = fs.readFileSync(path, "utf8");
  const classNames = [];
  const stringRegexp = /class=["']([^"']*)["']/g;
  const expressionRegexp = /class={`([^`\\]*(?:\\.[^`\\]*)*)`}/g;
  const newExpressionRegexp =
    /class={((?:[^"'}]|(?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))+)}/g;
  let match;

  while ((match = stringRegexp.exec(fileContent))) {
    const className = match[1].trim();
    if (className) {
      const classList = className.split(/\s+/);
      classList.forEach((cl) => {
        const trimmed = cl.trim();
        if (trimmed) {
          classNames.push({
            class: trimmed.replace(/^\./, ""),
            line: getLineNumber(fileContent, match.index),
            path: path,
          });
        }
      });
    }
  }
  fileContent = fileContent.replace(stringRegexp, "");

  while ((match = expressionRegexp.exec(fileContent))) {
    let expression = match[1].trim();

    if (expression) {
      const expressionMatches = expression.match(/\${[\s\S]*?}/g) || [];
      const expressionless = expression.replace(/\${[\s\S]*?}/g, "");

      expressionMatches.forEach((exp) => {
        const expressionValue = exp.slice(2, -1).trim();
        const line =
          getLineNumber(fileContent, match.index) + getLineCount(expression);
        classNames.push(...interpretExpression(expressionValue, line, path));
      });

      const classList = expressionless.split(/\s+/);
      classList.forEach((cl) => {
        const trimmed = cl.trim();
        if (trimmed) {
          classNames.push({
            class: cl,
            line:
              getLineNumber(fileContent, match.index) +
              getLineCount(expression),
            path: path,
          });
        }
      });
    }
  }
  fileContent = fileContent.replace(expressionRegexp, "");

  while ((match = newExpressionRegexp.exec(fileContent))) {
    const expression = match[1].trim();
    const line = getLineNumber(fileContent, match.index);
    classNames.push(...interpretExpression(expression, line, path));
  }
  fileContent = fileContent.replace(newExpressionRegexp, "-");

  return classNames;
};

/**
 * Interprets the given expression and returns an array of class objects or expression objects,
 * depending on the input.
 * @param {string} expression - The expression to be interpreted.
 * @param {number} line - The line number of the expression in the file.
 * @param {string} path - The path of the file being parsed.
 * @returns {Array<{class: string, line: number, path: string} | {expression: string, line: number, path: string}>} An array of class or expression objects or expression objects, depending on the input.
 */
const interpretExpression = (expression, line, path) => {
  let result = [];
  let i = 0;
  while (i < expression.length) {
    let currentChar = expression[i];
    if (currentChar === '"' || currentChar === "'" || currentChar === "`") {
      let closingQuoteIndex = expression.indexOf(currentChar, i + 1);
      if (closingQuoteIndex === -1) {
        throw new Error(`Unclosed quote at line ${line}`);
      }
      let stringLiteral = expression.slice(i, closingQuoteIndex + 1);
      let words = stringLiteral.slice(1, -1).split(" ");
      for (let word of words) {
        if (word.length > 0) {
          result.push({ class: word, line: line, path: path });
        }
      }
      i = closingQuoteIndex + 1;
    } else {
      let j = i + 1;
      while (j < expression.length && !`"'`.includes(expression[j])) {
        j++;
      }
      let nonStringLiteral = expression.slice(i, j);
      result.push({
        expression: nonStringLiteral.replace(/\s+/g, " "),
        line: line,
        path: path,
      });
      i = j;
    }
  }
  return result;
};

/**
 * Returns the line number of a character index in a string
 * @param {string} fileContent - The content of the file as a string
 * @param {number} index - The character index to get the line number for
 * @returns {number} The line number
 */
function getLineNumber(fileContent, index) {
  return fileContent.substring(0, index).split("\n").length;
}

/**
 * Returns the number of lines in a string
 * @param {string} str - The string to get the number of lines for
 * @returns {number} The number of lines
 */
function getLineCount(str) {
  return str.split("\n").length - 1;
}

/**
 * Extracts classes from a CSS file
 * @param {string} path - The path of the CSS file
 * @returns {Array<{class: string, line: number, path: string}>} An array of objects representing the classes with their line number and file path
 */
function extractClassesFromCss(path) {
  const fileContent = fs.readFileSync(path, "utf8");
  const lines = fileContent.split("\n");
  const matches =
    [...new Set(fileContent.match(/(?<!@import.+)\.[a-zA-Z][\w-]*/g))] || [];
  const classes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < matches.length; j++) {
      const match = matches[j];
      if (line.includes(match)) {
        classes.push({
          class: match.substring(1),
          line: i + 1,
          path: path,
        });
      }
    }
  }

  return classes;
}

module.exports = {
  extractClassesFromFront,
  extractClassesFromCss,
};
