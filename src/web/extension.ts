// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import memFs, { scheme } from "./memfs";
import { PreviewPannel } from "./preview-panel";
import sampleFilesMap from "../raw-source/.gitkeep?transform-to-memfs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    '@@@ Congratulations, your extension "mini-faas-worker-code-ext" is now active in the web extension host!'
  );

  let initialized = false;

  // 注册内存文件系统
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(scheme, memFs, {
      isCaseSensitive: true,
    })
  );

  // 初始化工作空间
  const initWorkspace = () => {
    if (initialized) {
      return;
    }
    initialized = true;

    // 创建虚拟文件系统的根目录
    vscode.workspace.updateWorkspaceFolders(0, 0, {
      uri: vscode.Uri.from({ scheme, path: "/" }),
      name: "工作空间",
    });

    // 初始化 sample
    makeSampleFolder(sampleFilesMap);

    setTimeout(() => {
      // 默认打开此文件
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.from({ scheme, path: "/src/App.tsx" })
      );
      // 同时打开预览界面
      vscode.commands.executeCommand("mini-faas-worker-code-ext.preview");
    }, 100);
  };

  initWorkspace();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mini-faas-worker-code-ext.initWorkespace",
      () => {
        initWorkspace();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mini-faas-worker-code-ext.initFiles",
      () => {
        if (!initialized) {
          return;
        }
        makeSampleFolder(sampleFilesMap);
        vscode.commands.executeCommand("mini-faas-worker-code-ext.preview");
      }
    )
  );

  // dump 文件
  context.subscriptions.push(
    vscode.commands.registerCommand("mini-faas-worker-code-ext.dump", () => {
      // 获取文件系统内文件内容
    })
  );

  // 构建并预览命令
  context.subscriptions.push(
    vscode.commands.registerCommand("mini-faas-worker-code-ext.preview", () => {
      PreviewPannel.createOrShow(context.extensionUri);
    })
  );

  // if (vscode.window.registerWebviewPanelSerializer) {
  //   // Make sure we register a serializer in activation event
  //   vscode.window.registerWebviewPanelSerializer(PreviewPannel.viewType, {
  //     async deserializeWebviewPanel(
  //       webviewPanel: vscode.WebviewPanel,
  //       state: any
  //     ) {
  //       console.log(`@@@ webview 恢复状态: ${state}`);
  //       PreviewPannel.revive(webviewPanel, context.extensionUri);
  //     },
  //   });
  // }
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("@@@ deavtivate");
}

function makeSampleFolder(fileMap: Record<string, string>) {
  const textEncoder = new TextEncoder();

  const rootUri = vscode.Uri.from({ scheme, path: "/" });

  Object.entries(fileMap).forEach(([filePath, content]) => {
    const fullFilePath = vscode.Uri.joinPath(rootUri, filePath);
    memFs.writeFile(fullFilePath, textEncoder.encode(content), {
      create: true,
      overwrite: true,
      autoCreateDir: true,
    });
  });
}
