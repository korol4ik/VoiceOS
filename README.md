# Neuro-OS

**An operating system where the interface is conversation.**

The user says what they need — the agent executes. Windows, buttons, files — everything is created on demand and disappears when not needed.

## Quick Start

1. Install [OpenClaw](https://openclaw.ai) or any other AI agent.
2. Clone the repo: `git clone https://github.com/korol4ik/VoiceOS`
3. Point your agent to `VoiceOS/bootstrap.md`.
4. Go through the setup dialog with the agent — your desktop is ready.

Alternatively, point the agent directly to this repo — it will read `bootstrap.md` and start the dialog.

## Structure

```
VoiceOS/
├── bootstrap.md                ← first-run instructions (agent reads)
├── README.md
└── neuro-os/
    ├── core/                   ← agent personality (copied to workspace)
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← desktop (entry point)
    ├── css/index.css           ← styles
    ├── js/
    │   ├── config.js           ← constants
    │   ├── drag.js             ← drag & resize
    │   ├── wm.js               ← window manager
    │   ├── channel.js          ← command channel (WS)
    │   ├── ui.js               ← chat + REST API
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← initialization
    ├── apps/                   ← user's web applications
    │   ├── css/
    │   └── js/
    └── user/                   ← user's home folder
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## Principles

- **Pure HTML+CSS+JS** — no frameworks, no A2UI.
- **Agent-neutral** — bootstrap is written in natural language, works with any AI agent.
- **Privacy** — everything runs locally, data never leaves the server.
- **Minimalism** — result immediately, no extra steps.

## Dependencies

- AI agent (OpenClaw, Hermes, or any other)
- Web server (nginx, OpenClaw embedded, Caddy — user's choice)
- ChromaDB (optional, for vector memory)

## License
MIT
