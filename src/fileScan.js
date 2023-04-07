/**
  A module for file system operations.
  @module fileScan
  @requires fs
  @requires path
*/
const fs = require("fs");
const path = require("path");

/**
 * Scans a folder recursively and returns an array of extracted classes.
 * @param {string} folder - The folder path to scan.
 * @param {string[]} extensions - An array of file extensions to extract classes from.
 * @param {function} extractClassesFunc - A function to extract classes from a file path.
 * @returns {Array} An array of extracted classes.
 */
function scanFolder(folder, extensions, extractClassesFunc) {
  const result = [];
  const files = fs.readdirSync(folder);

  files.forEach((file) => {
    const filePath = path.join(folder, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      result.push(...scanFolder(filePath, extensions, extractClassesFunc));
    } else {
      const extname = path.extname(file);
      if (extensions.includes(extname)) {
        result.push(...extractClassesFunc(filePath));
      }
    }
  });

  return result;
}

/**
 * Returns the common path between an array of paths.
 * @param {string[]} paths - An array of paths to find the common path.
 * @returns {string|null} The common path between the input paths or null if there is no common path.
 */
function getCommonPath(paths) {
  if (!paths || paths.length === 0) return null;

  const pathSegments = paths.map((path) => path.split("/"));
  const minLength = Math.min(
    ...pathSegments.map((segments) => segments.length)
  );

  let commonSegments = [];
  for (let i = 0; i < minLength; i++) {
    const segment = pathSegments[0][i];
    if (pathSegments.every((segments) => segments[i] === segment)) {
      commonSegments.push(segment);
    } else {
      break;
    }
  }

  return commonSegments.length > 0 ? commonSegments.join("/") : null;
}

/**
 * Returns the relative path from the project root to a file path.
 * @param {string} filePath - The file path to get the relative path from.
 * @returns {string} The relative path from the project root to the file path.
 */
function getPath(filePath) {
  const projectPath = path.resolve(__dirname);
  const parsedFilePath = path.parse(filePath);
  const relativePath = path.relative(projectPath, parsedFilePath.dir);

  return relativePath + "/" + parsedFilePath.name; // src/file
}

module.exports = {
  scanFolder,
  getCommonPath,
  getPath,
};
