import {
  loadSandpackClient,
  SandboxSetup,
  ClientOptions,
} from "@codesandbox/sandpack-client";
import "./app.css";

// (async function nodeboxDemo() {
//   // Iframe selector or element itself
//   const iframeSelector = document.querySelector("#sandpack-client");

//   // Files, environment and dependencies
//   const content: SandboxSetup = {
//     files: {
//       // We infer dependencies and the entry point from package.json
//       "/package.json": {
//         code: JSON.stringify({
//           main: "index.js",
//           dependencies: { uuid: "latest" },
//           scripts: {
//             start: "node index.js",
//           },
//         }),
//       },

//       // Main file
//       "/index.js": {
//         code: `console.log('hello sandpack client!!'); console.log(require('uuid'))`,
//       },
//     },
//     template: "node",
//   };

//   // Optional options
//   const options: ClientOptions = {
//     width: "300",
//     height: "300",
//     showErrorScreen: true,
//     showLoadingScreen: true,
//     showOpenInCodeSandbox: true,
//     bundlerURL: 'https://local2.dev.com',
//   };

//   // Properly load and mount the bundler
//   const client = await loadSandpackClient(
//     iframeSelector as HTMLIFrameElement,
//     content,
//     options
//   );

//   /**
//    * When you make a change, you can just run `updateSandbox`.
//    * We'll automatically discover which files have changed
//    * and hot reload them.
//    */
//   client.updateSandbox({
//     files: {
//       "/index.js": {
//         code: `console.log('New Text!')`,
//       },
//     },
//     template: "node",
//   });

//   client.listen((msg) => {
//     console.log("@@sandpack msg: ", msg);
//   });
// })();


(async function reactDemo() {
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
    width: "300",
    height: "300",
    showErrorScreen: true,
    showLoadingScreen: true,
    showOpenInCodeSandbox: true,
    bundlerURL: 'https://local2.dev.com',
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
})();

