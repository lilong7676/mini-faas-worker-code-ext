/*
 * react sandpack demo
 * @Author: lilonglong
 * @Date: 2024-04-29 24:10:56
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-04-29 17:33:18
 */

import React, { useEffect, useState, useRef } from "react";
import {
  loadSandpackClient,
  SandboxSetup,
  ClientOptions,
  SandpackClient,
} from "@codesandbox/sandpack-client";
import { vscode } from "../../utils/vscode";

import "./index.css";

interface Files {
  [x: string]: { code: string };
}

export default function ReactSandpack() {
  const [files, setFiles] = useState<Files | null>(null);
  const [sandpackClient, setSandpackClient] = useState<SandpackClient | null>(
    null
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const initSandpackClient = async (iframe: HTMLIFrameElement) => {
      // Files, environment and dependencies
      const content: SandboxSetup = {
        files: files ?? {},
        template: "create-react-app",
      };

      // Optional options
      const options: ClientOptions = {
        showErrorScreen: true,
        showLoadingScreen: true,
        showOpenInCodeSandbox: false,
        // self hosted bundler url.
        // see: https://sandpack.codesandbox.io/docs/guides/hosting-the-bundler
        bundlerURL: process.env.SANDPACK_BUNDLER_URL,
      };

      // Properly load and mount the bundler
      const client = await loadSandpackClient(
        iframe,
        content,
        options
      );
      setSandpackClient(client);
    };

    if (!sandpackClient && iframeRef.current) {
      initSandpackClient(iframeRef.current);
    } else if (sandpackClient && files) {
      /**
       * When you make a change, you can just run `updateSandbox`.
       * We'll automatically discover which files have changed
       * and hot reload them.
       */
      sandpackClient.updateSandbox({
        files,
      });
    }

    // client.listen((msg) => {
    //   console.info("@@sandpack msg: ", msg);
    // });
  }, [files, sandpackClient]);

  useEffect(() => {
    // listen message from webview
    const onMessage = (event: MessageEvent<any>) => {
      const message = event.data; // The json data that the extension sent
      const { command, data } = message;
      if (command === "onDidChangeFile") {
        console.log("receive message from extension", message);
        // 特殊处理文件路径，仅供演示用
        const processedCodeFiles: Files = {};
        Object.entries(data as Record<string, string>).forEach(
          ([filePath, fileContent]) => {
            if (filePath.startsWith("/react/")) {
              processedCodeFiles[filePath.replace("/react/", "")] = {
                code: fileContent,
              };
            }
          }
        );
        setFiles(processedCodeFiles);
      }
    };
    window.addEventListener("message", onMessage);

    // try getFiles first
    vscode.postMessage({ command: "getFiles" });

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [setFiles]);

  return (
    <div className="react-sandpack-demo">
      <iframe id="sandpack-client" ref={iframeRef} />
    </div>
  );
}
