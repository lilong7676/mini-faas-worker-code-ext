#!/bin/bash
# 本地调试时的启动脚本
# 建议直接通过 vscode 的 debug 调试（快捷键 F5）

# 第一个 npm 命令
npm run watch-web &

# 记录第一个命令的进程ID
pid1=$!

# 第二个 npm 命令
npm run start:sandpack-client-demo &

# 记录第二个命令的进程ID
pid2=$!

# 等待两个命令的完成
wait $pid1
wait $pid2

