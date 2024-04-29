#!/bin/bash
# 构建脚本

# 首先构建 webview-client
npm run build:webview-client

# 然后构建 extension for web
npm run package-web

echo "插件构建完成"
