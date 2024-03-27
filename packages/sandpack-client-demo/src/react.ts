import {
  loadSandpackClient,
  SandboxSetup,
  ClientOptions,
  SandpackClient,
} from "@codesandbox/sandpack-client";

interface Files {
  [x: string]: { code: string };
}

let sandpackClientInited = false;
export async function reactDemo() {
  let client: SandpackClient | undefined = undefined;

  const createSandpackClient = async (codeFiles: Files) => {
    // Iframe selector or element itself
    const iframe = document.createElement("iframe");
    iframe.id = "sandpack-client";
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.overflow = "hidden";

    document.body.appendChild(iframe);

    // Files, environment and dependencies
    const content: SandboxSetup = {
      files: codeFiles || {},
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
    client = await loadSandpackClient(iframe, content, options);

    // client.listen((msg) => {
    //   console.info("@@sandpack msg: ", msg);
    // });
  };

  const updateSandbox = async (codeFiles: Files) => {
    if (!sandpackClientInited) {
      sandpackClientInited = true;
      createSandpackClient(codeFiles);
    } else {
      /**
       * When you make a change, you can just run `updateSandbox`.
       * We'll automatically discover which files have changed
       * and hot reload them.
       */
      client?.updateSandbox({
        files: codeFiles,
      });
    }
  };

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    const { command, data } = message;
    if (command === "onDidChangeFile") {
      console.log("receive message from extension", message);
      const files: Files = {};
      Object.keys(data).forEach((key) => {
        files[key] = {
          code: data[key],
        };
      });
      updateSandbox(files);
    }
  });
}
