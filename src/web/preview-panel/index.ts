/*
 * a sandpack previewer
 * @Author: lilonglong
 * @Date: 2024-03-15 24:04:10
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-03-15 16:02:47
 */

import * as vscode from "vscode";

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

    this._panel.webview.html = this._getHtmlForWebview(panel.webview);

    // 设置 webview 的 html 文件
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // 监听 webview 内的消息
    this._panel.webview.onDidReceiveMessage((message) => {
      vscode.window.showInformationMessage(JSON.stringify(message));
    });

    // 监听 webview 的关闭事件
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
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
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "resources/media",
      "main.js"
    );

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(
      this._extensionUri,
      "resources/media",
      "reset.css"
    );
    const stylesPathMainPath = vscode.Uri.joinPath(
      this._extensionUri,
      "resources/media",
      "vscode.css"
    );

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link href="${stylesResetUri}" rel="stylesheet">
            <link href="${stylesMainUri}" rel="stylesheet">

            <title>Cat Coding</title>
        </head>
        <body>
            <h1 id="count">0</h1>
            <button id="add-button">add count</button>

            <script src="${scriptUri}"></script>
        </body>
        </html>`;
  }
}
