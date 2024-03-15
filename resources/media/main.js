//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { count: 0 };

  let count = 0;

  document.querySelector("#add-button")?.addEventListener("click", () => {
    addCount();
  });

  document.querySelector("#count")?.addEventListener("click", () => {
    onCountClicked();
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    console.log("message.type", message.type);
  });

  function onCountClicked() {
    vscode.postMessage({ type: "countClicked", value: count });
  }

  function addCount() {
    count++;
    const countDom = document.querySelector("#count");
    if (countDom) {
      countDom.innerHTML = `${count}`;
    }
  }
})();
