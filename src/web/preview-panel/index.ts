/*
 * a sandpack previewer
 * @Author: lilonglong
 * @Date: 2024-03-15 24:04:10
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-03-22 14:07:33
 */

import * as vscode from "vscode";
import memFs from "../memfs";

export class PreviewPannel {
  // 全局只允许存在一个 pannel 实例
  public static currentPanel: PreviewPannel | undefined;

  public static readonly viewType = "PreviewPannel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.ViewColumn.Beside;

    if (PreviewPannel.currentPanel) {
      PreviewPannel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      PreviewPannel.viewType,
      "previewer",
      column,
      {
        enableScripts: true,
        // 设置页面隐藏时也保留 webview 的状态
        retainContextWhenHidden: true,
      }
    );

    PreviewPannel.currentPanel = new PreviewPannel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    PreviewPannel.currentPanel = new PreviewPannel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // 设置 webview 的 html 文件
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // 监听 webview 内的消息
    this._panel.webview.onDidReceiveMessage((message) => {
      vscode.window.showInformationMessage(JSON.stringify(message));
      const { command } = message;
      if (command === "reload") {
        // 刷新页面，仅本地调试用 （https://github.com/microsoft/vscode/issues/96242）
        vscode.commands.executeCommand(
          "workbench.action.webview.reloadWebviewAction"
        );
      }
    });

    // 监听 webview 的关闭事件
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // 监听 memFs 的文件变化
    memFs.onDidChangeFile((fileChangeEvents) => {
      console.log("@@ onDidChangeFile", fileChangeEvents);
      // 向 webview 发消息，通知最新的文件内容
      this.onDidChangeFile();
    });

    // 根据当前 memFs 内容首次初始化
    this.onDidChangeFile();
  }

  public dispose() {
    PreviewPannel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main scrit run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "resources/web",
      "app.js"
    );

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sandpack Previewer</title>
        </head>
        <body>           
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
  }

  private onDidChangeFile() {
    this._panel.webview.postMessage({
      command: "onDidChangeFile",
      data: memFs._dump(),
    });
  }
}
