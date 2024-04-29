/*
 * 在 webpack 构建完成后，移动产物到上层 vscode 插件的资源目录中
 * @Author: lilonglong
 * @Date: 2024-03-20 24:37:50
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-03-20 16:05:23
 */

//@ts-check
"use strict";

const fs = require("fs");
const path = require("path");

//@ts-check
/** @typedef {import('webpack').Compiler} Compiler **/

/**
 * @typedef {Object} CopyPluginOptions
 * @property {string} dest
 */

module.exports = class CopyWebpackPlugin {
  /**
   * @constructor
   * @param {CopyPluginOptions} options
   */
  constructor(options) {
    this.options = options || {};
  }
  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.afterDone.tap("CopyWebpackPlugin", (stats) => {
      const outputPath = stats.compilation.compiler.outputPath;
      const dest = this.options.dest;
      if (!dest) {
        console.error("@@ CopyWebpackPlugin: please set dest path to copy");
        return;
      }
      // 清空 dest 文件夹
      deleteFolder(dest);

      // 复制 outputPath 内的所有文件到 dest
      copyFiles(outputPath, dest);
    });
  }
};

function copyFiles(sourceDir, targetDir) {
  // 创建目标文件夹（如果不存在）
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  // 读取源文件夹中的所有文件
  fs.readdirSync(sourceDir).forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    // 判断文件的类型
    if (fs.statSync(sourcePath).isFile()) {
      // 如果是文件，则进行复制
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`@@ CopyWebpackPlugin: Copied ${sourcePath} to ${targetPath}`);
    } else {
      // 如果是文件夹，则递归调用复制函数
      copyFiles(sourcePath, targetPath);
    }
  });
}

function deleteFolder(folderPath) {
  // 简单判断 dest path 是不是一个安全的可删除的路径
  if (!folderPath.includes(path.join("resources", "web"))) {
    console.error("@@ CopyWebpackPlugin: dest path is not safe");
    return;
  }

  // 首先判断文件夹是否存在
  if (!fs.existsSync(folderPath)) {
    return;
  }
  if (!fs.statSync(folderPath).isDirectory) {
    return;
  }

  fs.rmdirSync(folderPath, { recursive: true });

  console.log(`@@ CopyWebpackPlugin: 已成功删除文件夹 ${folderPath}`);
}
