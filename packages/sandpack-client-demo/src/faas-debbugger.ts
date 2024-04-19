/*
 * FaaS 在线调试器
 * 主要功能：
 * 1. 显示调试界面
 * 2. 调试时支持在浏览器内构建 FaaS 代码
 * @Author: lilonglong
 * @Date: 2024-04-15 24:18:44
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-04-19 17:03:53
 */

import * as esbuild from "esbuild-wasm";

interface Files {
  [x: string]: string;
}

const disposableElements: HTMLElement[] = [];

let esbuildHasInitialized = false;

const startBundle = async (files: Files) => {
  console.log("---startBundle", files);

  if (!esbuildHasInitialized) {
    await esbuild.initialize({
      wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.20.2/esbuild.wasm",
    });
    esbuildHasInitialized = true;
  }

  const faasOnResolvePlugin: esbuild.Plugin = {
    name: "faas",
    setup(build) {
      // Redirect all paths starting with "/" to "faas" namespace
      build.onResolve({ filter: /.js$/ }, (args) => {
        return { path: args.path, namespace: "faas" };
      });

      build.onLoad({ filter: /.js$/, namespace: "faas" }, (args) => {
        const path = args.path;
        return {
          // load file content by path
          contents: files[path],
          loader: "js",
        };
      });
    },
  };

  const bundled = await esbuild.build({
    bundle: true,
    format: "esm",
    write: false,
    outfile: "out.js",
    entryPoints: ["/index.js"],
    plugins: [faasOnResolvePlugin],
  });

  const output = bundled.outputFiles.reduce((pre, curr) => {
    return pre + "\n" + curr.text;
  }, "");

  console.log("bundled", bundled);

  const outputEle: HTMLTextAreaElement | null =
    document.querySelector(".output-textarea");
  if (outputEle) {
    outputEle.value = output;
  }
};

export function faasDebbuger() {
  let files: Files | undefined = window.files;
  // buildButton
  const buildButton = document.createElement("button");
  buildButton.innerText = "build faas code";
  buildButton.classList.add("build-button");
  buildButton.addEventListener("click", function () {
    if (files) {
      startBundle(files);
    }
  });
  document.body.appendChild(buildButton);
  disposableElements.push(buildButton);

  // output
  const outputEle = document.createElement("textarea");
  outputEle.placeholder = "will show output after build";
  outputEle.classList.add("output-textarea");
  document.body.appendChild(outputEle);
  disposableElements.push(outputEle);

  const onMessage = (event: MessageEvent<any>) => {
    const message = event.data; // The json data that the extension sent
    const { command, data } = message;
    if (command === "onDidChangeFile") {
      console.log("receive message from extension", message);
      files = data;
    }
  };

  window.addEventListener("message", onMessage);

  return () => {
    disposableElements.forEach((ele) => {
      document.body.removeChild(ele);
    });
    disposableElements.length = 0;
    window.removeEventListener("message", onMessage);
  };
}
