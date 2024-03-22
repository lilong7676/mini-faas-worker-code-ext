/*
 * A webpack loader to transfer files/directories to memfs
 * @Author: lilonglong
 * @Date: 2024-03-21 24:10:46
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-03-22 10:03:36
 */

const fs = require("fs");
const path = require("path");

/**
 * @typedef {Object} Options
 * @property {(string | RegExp)[]} Options.blackList
 */

//@ts-check
/** @typedef {import('webpack').LoaderContext<Options>} LoaderContext **/

const logger = (...args) => {
  console.log("@@transferToMemfsLoader: ", ...args);
};

/**
 * @this LoaderContext
 */
function transformToMemfsLoader(source) {
  const { blackList } = this.getOptions() || { blackList: [] };

  // The directory of the module. Can be used as a context for resolving other stuff.
  const rootDir = this.context;

  function transfer(sourceDir, fileMap) {
    const files = fs.readdirSync(sourceDir);

    for (filePath of files) {
      const fullPath = path.join(sourceDir, filePath);
      const isInBlackList = blackList.some((blackPath) => {
        if (blackPath instanceof RegExp) {
          return blackPath.test(filePath);
        }
        return fullPath.includes(blackPath);
      });
      if (isInBlackList) {
        continue;
      }
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        // read file content as string
        const content = fs.readFileSync(fullPath, "utf-8");
        const relativePath = path.relative(rootDir, fullPath);
        fileMap[relativePath] = content;
      } else if (stat.isDirectory()) {
        transfer(fullPath, fileMap);
      }
    }
  }

  const fileMap = {};
  transfer(rootDir, fileMap);

  return "module.exports = " + JSON.stringify(fileMap);
}

module.exports = transformToMemfsLoader;
module.exports.raw = true;
