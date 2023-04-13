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
    const filePath = path.relative(process.cwd(), path.join(folder, file));
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

  const commonPath = commonSegments.length > 0 ? commonSegments.join("/") : "/";
  const stats = fs.statSync(commonPath);

  if (stats.isFile()) {
    return commonPath.split("/").slice(0, -1).join("/");
  } else {
    return commonPath;
  }
}

/**
 * Load the blacklist of files and classes to exclude on proccessing
 * @returns {{paths:Array<string>,cssClasses:Array<string>}} An object with an array of paths and css classes to exclude
 */
async function loadConfig() {
  try {
    const packageJson = await fs.promises.readFile(
      path.join(process.cwd(), "./package.json")
    );
    return JSON.parse(packageJson).cssTracker;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  scanFolder,
  getCommonPath,
  loadConfig,
};
