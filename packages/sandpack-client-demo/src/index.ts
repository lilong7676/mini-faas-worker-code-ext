import "./app.css";

import { nodeboxDemo } from "./nodebox";
import { reactDemo } from "./react";

// nodeboxDemo();

reactDemo();

if (process.env.NODE_ENV === "development") {
  if (acquireVsCodeApi !== undefined) {
    window.addEventListener("beforeunload", (event) => {
      console.log("beforeunload");
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = "";
      const vscode = acquireVsCodeApi();
      vscode.postMessage({
        command: "reload",
      });
    });
  }
}
