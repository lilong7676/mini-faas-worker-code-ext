/*
 * FaaS 在线调试器
 * 主要功能：
 * 1. 显示调试界面
 * 2. 调试时支持在浏览器内构建 FaaS 代码
 * @Author: lilonglong
 * @Date: 2024-04-15 24:18:44
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-04-29 17:06:52
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import * as esbuild from "esbuild-wasm";
import {
  VSCodeButton,
  VSCodeTextArea,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";
import { vscode } from "../../utils/vscode";

import "./index.css";

interface Files {
  [x: string]: string;
}

export default function FaasDebugger() {
  const [esbuildInitialized, setEsbuildInitialized] = useState(false);
  const [files, setFiles] = useState<Files | null>(null);
  const [output, setOutput] = useState("");

  const faasOnResolvePlugin: esbuild.Plugin = useMemo(() => {
    return {
      name: "faas",
      setup(build) {
        // Redirect all paths starting with "/" to "faas" namespace
        build.onResolve({ filter: /.js$/ }, (args) => {
          return {
            path: args.path,
            namespace: "faas",
          };
        });

        build.onLoad({ filter: /.js$/, namespace: "faas" }, (args) => {
          const path = args.path;
          return {
            // load file content by path
            contents: files ? files[path] : "",
            loader: "js",
          };
        });
      },
    };
  }, [files]);

  const startBuild = useCallback(async () => {
    if (esbuildInitialized && files) {
      console.log("startBuild", files);
      try {
        const bundled = await esbuild.build({
          bundle: true,
          format: "esm",
          write: false,
          outfile: "out.js",
          entryPoints: ["/faas/index.js"],
          plugins: [faasOnResolvePlugin],
        });

        const output = bundled.outputFiles.reduce((pre, curr) => {
          return pre + "\n" + curr.text;
        }, "");

        setOutput(output);
      } catch (error) {
        setOutput(`error: ${(error as Error).message}`);
      }
    }
  }, [esbuildInitialized, files, faasOnResolvePlugin, setOutput]);

  useEffect(() => {
    const initEsbuild = async () => {
      await esbuild.initialize({
        wasmURL:
          "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.20.2/esbuild.wasm",
      });
      setEsbuildInitialized(true);
    };
    initEsbuild();
    return () => {
      esbuild.stop();
    };
  }, []);

  useEffect(() => {
    // listen message from webview
    const onMessage = (event: MessageEvent<any>) => {
      const message = event.data; // The json data that the extension sent
      const { command, data } = message;
      if (command === "onDidChangeFile") {
        console.log("receive message from extension", message);
        setFiles(data);
      }
    };
    window.addEventListener("message", onMessage);

    // try getFiles first
    vscode.postMessage({command: 'getFiles'});

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [setFiles]);

  useEffect(() => {
    if (files) {
      // start build
      startBuild();
    }
  }, [files, startBuild]);

  return (
    <div className="faas-debugger">
      <div>
        <VSCodeButton disabled={!esbuildInitialized} onClick={startBuild}>
          build FaaS code!
        </VSCodeButton>
      </div>
      <VSCodeDivider />
      <VSCodeTextArea
        className="faas-debugger__build-result"
        placeholder="please hit the build button hard"
        resize="vertical"
        rows={40}
        value={output}
        readOnly
      ></VSCodeTextArea>
    </div>
  );
}
