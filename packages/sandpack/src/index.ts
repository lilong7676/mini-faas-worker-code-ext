import {
  loadSandpackClient,
  SandboxSetup,
  ClientOptions,
} from "@codesandbox/sandpack-client";
import "./app.css";

async function main() {
  // Iframe selector or element itself
  const iframeSelector = document.querySelector("#sandpack-client");

  // Files, environment and dependencies
  const content: SandboxSetup = {
    files: {
      // We infer dependencies and the entry point from package.json
      "/package.json": {
        code: JSON.stringify({
          main: "index.js",
          dependencies: { uuid: "latest" },
          scripts: {
            start: "node index.js",
          },
        }),
      },

      // Main file
      "/index.js": {
        code: `console.log('hello sandpack client!!'); console.log(require('uuid'))`,
      },
    },
    template: "node",
  };

  // Optional options
  const options: ClientOptions = {
    width: "100%",
    height: "100%",
  };

  // Properly load and mount the bundler
  const client = await loadSandpackClient(
    iframeSelector as HTMLIFrameElement,
    content,
    options
  );

  /**
   * When you make a change, you can just run `updateSandbox`.
   * We'll automatically discover which files have changed
   * and hot reload them.
   */
  client.updateSandbox({
    files: {
      "/index.js": {
        code: `console.log('New Text!')`,
      },
    },
    template: "node",
  });

  client.listen((msg) => {
    console.log("@@sandpack msg: ", msg);
  });
}

main();
