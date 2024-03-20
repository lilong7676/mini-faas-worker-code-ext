import {
  loadSandpackClient,
  SandboxSetup,
  ClientOptions,
} from "@codesandbox/sandpack-client";
export async function reactDemo() {
  const titleEle = document.createElement("h1");
  titleEle.innerText = "React Demo";
  document.body.appendChild(titleEle);

  // Iframe selector or element itself
  const iframe = document.createElement("iframe");
  iframe.id = "sandpack-client";
  iframe.style.border = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.overflow = "hidden";

  document.body.appendChild(iframe);

  const files = {
    "/index.js": {
      code: `import { StrictMode } from "react";
        import { createRoot } from "react-dom/client";
        
        import App from "./App";
        
        const rootElement = document.getElementById("root");
        const root = createRoot(rootElement);
        
        root.render(
          <StrictMode>
            <App />
          </StrictMode>
        );
        `,
    },
    "/App.js": {
      code: `import "./styles.css";

        export default function App() {
        return (
            <div className="App">
            <h1>Hello CodeSandbox</h1>
            <h2>Start editing to see some magic happen!</h2>
            </div>
        );
        }
    `,
    },
    "/styles.css": {
      code: `.App {
            font-family: sans-serif;
            text-align: center;
          }
    `,
    },
    "/package.json": {
      code: JSON.stringify({
        name: "react",
        version: "1.0.0",
        description: "",
        keywords: [],
        main: "src/index.tsx",
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          "react-scripts": "^5.0.0",
        },
        devDependencies: {
          "@types/react": "18.2.38",
          "@types/react-dom": "18.2.15",
          "loader-utils": "3.2.1",
          typescript: "4.4.4",
        },
        scripts: {
          start: "react-scripts start",
          build: "react-scripts build",
          test: "react-scripts test --env=jsdom",
          eject: "react-scripts eject",
        },
        browserslist: [">0.2%", "not dead", "not ie <= 11", "not op_mini all"],
      }),
    },
  };

  // Files, environment and dependencies
  const content: SandboxSetup = {
    files,
    template: "create-react-app",
  };

  // Optional options
  const options: ClientOptions = {
    showErrorScreen: true,
    showLoadingScreen: true,
    showOpenInCodeSandbox: false,
    // bundlerURL: "https://local2.dev.com",
    bundlerURL: "http://localhost:9001",
  };

  // Properly load and mount the bundler
  const client = await loadSandpackClient(iframe, content, options);

  /**
   * When you make a change, you can just run `updateSandbox`.
   * We'll automatically discover which files have changed
   * and hot reload them.
   */
  // client.updateSandbox({
  //   files: {
  //     "/index.js": {
  //       code: `console.log('New Text!')`,
  //     },
  //   },
  //   template: "node",
  // });

  client.listen((msg) => {
    console.log("@@sandpack msg: ", msg);
  });
}

// reactDemo();
