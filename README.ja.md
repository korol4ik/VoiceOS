# Neuro-OS

**インターフェースが対話であるオペレーティングシステム。**

ユーザーが要件を伝えると、エージェントが実行します。ウィンドウ、ボタン、ファイル — すべてが必要に応じて作成され、不要になると消えます。

## クイックスタート

1. [OpenClaw](https://openclaw.ai) または他のAIエージェントをインストールします。
2. リポジトリをクローン: `git clone https://github.com/korol4ik/VoiceOS`
3. エージェントに `VoiceOS/bootstrap.md` を指定します。
4. エージェントとのセットアップダイアログを進めると、デスクトップが準備完了です。

または、エージェントをこのリポジトリに直接指定すると、`bootstrap.md` を読み込んでダイアログを開始します。

## ディレクトリ構造

```
VoiceOS/
├── bootstrap.md                ← 初回起動手順（エージェントが読む）
├── README.md
└── neuro-os/
    ├── core/                   ← エージェントの人格（ワークスペースにコピー）
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← デスクトップ（エントリポイント）
    ├── css/index.css           ← スタイル
    ├── js/
    │   ├── config.js           ← 定数
    │   ├── drag.js             ← ドラッグ＆リサイズ
    │   ├── wm.js               ← ウィンドウマネージャ
    │   ├── channel.js          ← コマンドチャネル (WS)
    │   ├── ui.js               ← チャット + REST API
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← 初期化
    ├── apps/                   ← ユーザーのウェブアプリケーション
    │   ├── css/
    │   └── js/
    └── user/                   ← ユーザーのホームフォルダ
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## 原則

- **純粋な HTML+CSS+JS** — フレームワークなし、A2UIなし。
- **エージェント中立** — bootstrapは自然言語で書かれ、どんなAIエージェントでも動作します。
- **プライバシー** — すべてローカルで実行され、データがサーバー外に出ることはありません。
- **ミニマリズム** — 即座に結果、余計な手順なし。

## 依存関係

- AIエージェント（OpenClaw、Hermes など）
- ウェブサーバー（nginx、OpenClaw組み込み、Caddy — ユーザー選択）
- ChromaDB（オプション、ベクトルメモリ用）

## ライセンス
MIT
