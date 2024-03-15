// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { MemFs } from "./memfs";
import { PreviewPannel } from "./preview-panel";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    '@@@ Congratulations, your extension "mini-faas-worker-code-ext" is now active in the web extension host!'
  );

  let initialized = false;

  // 初始化内存文件系统
  const memFs = new MemFs();

  // 注册内存文件系统
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("memfs", memFs, {
      isCaseSensitive: true,
    })
  );

  // 随机写入文件
  memFs.seed();

  context.subscriptions.push(
    vscode.commands.registerCommand("mini-faas-worker-code-ext.init", () => {
      if (initialized) {
        return;
      }
      initialized = true;
      // 创建虚拟文件系统的根目录
      vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.parse("memfs:/"),
        name: "云函数工作空间",
      });
    })
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
