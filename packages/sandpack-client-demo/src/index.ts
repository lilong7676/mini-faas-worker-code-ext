import "./app.css";

import { nodeboxDemo } from "./nodebox";
import { reactDemo } from "./react";
import { faasDebbuger } from "./faas-debbugger";

let previousDisposeFn: CallableFunction | undefined;
let demoValue: "faas" | "react" = "faas";

function initUI() {
  const label = document.createElement("label");
  label.innerText = "Select Demo Scene:";
  label.setAttribute("for", "demo-selector");
  document.body.appendChild(label);

  const selectEle = document.createElement("select");
  document.body.appendChild(selectEle);

  [
    { value: "faas", text: "FaaS Demo" },
    { value: "react", text: "React Demo" },
  ].forEach(({ value, text }) => {
    var option = document.createElement("option");
    option.value = value;
    option.text = text;
    selectEle.appendChild(option);
  });
  selectEle.value = demoValue;

  selectEle.onchange = function () {
    showUIByDemo(selectEle.value);
  };
}

function showUIByDemo(demo: string) {
  if (previousDisposeFn) {
    previousDisposeFn();
  }
  if (demo === "faas") {
    previousDisposeFn = faasDebbuger();
  } else if (demo === "react") {
    previousDisposeFn = reactDemo();
  }
}

initUI();
showUIByDemo(demoValue);

const onMessage = (event: MessageEvent<any>) => {
  const message = event.data; // The json data that the extension sent
  const { command, data } = message;
  if (command === "onDidChangeFile") {
    console.log("receive message from extension", message);
    window.files = data;
  }
};

window.addEventListener("message", onMessage);

if (process.env.NODE_ENV === "development") {
  try {
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
  } catch (error) {}
}
