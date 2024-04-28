import {
  loadSandpackClient,
  SandboxSetup,
  ClientOptions,
  SandpackClient,
} from "@codesandbox/sandpack-client";

interface Files {
  [x: string]: { code: string };
}

const disposableElements: HTMLElement[] = [];

export function reactDemo() {
  let sandpackClientInited = false;

  console.log("sandpackClientInited", sandpackClientInited);
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
    disposableElements.push(iframe);

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
    // 特殊处理文件路径，仅供演示用
    const processedCodeFiles: Record<string, any> = {};
    Object.entries(codeFiles).forEach(([filePath, fileContent]) => {
      if (filePath.startsWith("/react/")) {
        processedCodeFiles[filePath.replace("/react/", "")] = {
          code: fileContent,
        };
      }
    });

    console.log("updateSandbox processedCodeFiles", processedCodeFiles);

    if (!sandpackClientInited) {
      sandpackClientInited = true;
      createSandpackClient(processedCodeFiles);
    } else {
      /**
       * When you make a change, you can just run `updateSandbox`.
       * We'll automatically discover which files have changed
       * and hot reload them.
       */
      client?.updateSandbox({
        files: processedCodeFiles,
      });
    }
  };

  const onMessage = (event: MessageEvent<any>) => {
    const message = event.data; // The json data that the extension sent
    const { command, data } = message;
    if (command === "onDidChangeFile") {
      console.log("receive message from extension", message);
      updateSandbox(data);
    }
  };

  window.addEventListener("message", onMessage);

  if (window.files) {
    updateSandbox(window.files);
  }

  return () => {
    client?.destroy();

    disposableElements.forEach((ele) => {
      document.body.removeChild(ele);
    });
    disposableElements.length = 0;

    window.removeEventListener("message", onMessage);
  };
}
