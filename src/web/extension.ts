// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { MemFS } from "./fileSystemProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "mini-faas-worker-code-ext" is now active in the web extension host!'
  );

  // 初始化虚拟文件系统
  const memFs = new MemFS();
  memFs.seed();
  // 注册虚拟文件系统
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("memfs", memFs, {
      isCaseSensitive: true,
    })
  );

  // 创建虚拟文件系统的根目录
  vscode.workspace.updateWorkspaceFolders(0, 0, {
    uri: vscode.Uri.parse("memfs:/"),
    name: "云函数工作空间",
  });

  // dump 文件
  context.subscriptions.push(
    vscode.commands.registerCommand("mini-faas-worker-code-ext.dump", () => {
      // 获取文件系统内文件内容
      const dumpedStr = JSON.stringify(memFs.root, null, 2);
	  // 使用文件内容初始化新的文件系统
      const newMemfs = MemFS.initWith(dumpedStr);
      console.log('dumpedStr', dumpedStr);
      console.log('newMemfs', newMemfs);
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
