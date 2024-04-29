import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { vscode } from "./utils/vscode";
import {
  VSCodePanels,
  VSCodePanelTab,
  VSCodePanelView,
} from "@vscode/webview-ui-toolkit/react";
import FaasDebugger from "./components/faas-debugger";
import ReactSandpack from "./components/react-sandpack";
import "./app.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
const App = () => {
  return (
    <>
      <VSCodePanels className="main-panels" aria-label="Default">
        <VSCodePanelTab id="faas">FaaS Debugger</VSCodePanelTab>
        <VSCodePanelTab id="react">React Sandpack</VSCodePanelTab>
        <VSCodePanelView
          id="view-faas"
          className="main-panels__view view__faas-debugger"
        >
          <FaasDebugger />
        </VSCodePanelView>
        <VSCodePanelView
          id="view-react"
          className="main-panels__view view__react-sandpack"
        >
          <ReactSandpack />
        </VSCodePanelView>
      </VSCodePanels>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<App />);

// vscode 内实现简单热更新
if (process.env.NODE_ENV === "development") {
  try {
    window.addEventListener("beforeunload", (event) => {
      console.log("beforeunload");
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = "";
      vscode.postMessage({
        command: "reload",
      });
    });
  } catch (error) {}
}
