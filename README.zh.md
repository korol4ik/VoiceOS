# Neuro-OS

**一个以对话为界面的操作系统。**

用户说出需求——代理执行。窗口、按钮、文件——一切按需创建，不需要时自动消失。

## 快速开始

1. 安装 [OpenClaw](https://openclaw.ai) 或任何其他AI代理。
2. 克隆仓库：`git clone https://github.com/korol4ik/VoiceOS`
3. 将代理指向 `VoiceOS/bootstrap.md`。
4. 与代理完成设置对话——桌面就绪。

或者直接将代理指向本仓库——它会自动读取 `bootstrap.md` 并开始对话。

## 目录结构

```
VoiceOS/
├── bootstrap.md                ← 首次启动说明（代理读取）
├── README.md
└── neuro-os/
    ├── core/                   ← 代理人格（复制到工作区）
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← 桌面（入口点）
    ├── css/index.css           ← 样式
    ├── js/
    │   ├── config.js           ← 常量
    │   ├── drag.js             ← 拖拽与缩放
    │   ├── wm.js               ← 窗口管理器
    │   ├── channel.js          ← 命令通道 (WS)
    │   ├── ui.js               ← 聊天 + REST API
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← 初始化
    ├── apps/                   ← 用户的网页应用
    │   ├── css/
    │   └── js/
    └── user/                   ← 用户主目录
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## 原则

- **纯 HTML+CSS+JS**——无框架，无 A2UI。
- **代理中立**——bootstrap 使用自然语言编写，适用于任何AI代理。
- **隐私**——一切本地运行，数据不会离开服务器。
- **极简**——立即得到结果，没有多余步骤。

## 依赖

- AI代理（OpenClaw、Hermes 或其他）
- Web 服务器（nginx、OpenClaw 内置、Caddy——用户自选）
- ChromaDB（可选，用于向量记忆）

## 许可
MIT
