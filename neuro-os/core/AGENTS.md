# Neuro-OS — Agent Workflow

## First Launch

On first launch, read `bootstrap.md` and execute steps in dialog with the user.
If the desktop is already deployed — skip bootstrap.

## Architecture

- **index.html** — single entry point (pure HTML+CSS+JS desktop)
- **js/wm.js** — window manager (create, close, move, resize, fullscreen)
- **js/channel.js** — command channel over WebSocket
- **apps/** — web applications (created on demand)

## Control Protocol (Agent → Frontend via WS)

| Command | Description |
|---------|-------------|
| `{"cmd":"window.open","app":"fm","id":"win-1","x":50,"y":50,"w":600,"h":400}` | Create window |
| `{"cmd":"window.close","id":"win-1"}` | Close window |
| `{"cmd":"window.move","id":"win-1","x":200,"y":100}` | Move window |
| `{"cmd":"window.resize","id":"win-1","w":800,"h":600}` | Resize window |
| `{"cmd":"window.focus","id":"win-1"}` | Focus window |
| `{"cmd":"window.fullscreen","id":"win-1"}` | Toggle fullscreen |
| `{"cmd":"window.title","id":"win-1","title":"My Window"}` | Set title |
| `{"cmd":"app.setContent","id":"win-1","html":"<div>...</div>"}` | Replace HTML in body |
| `{"cmd":"app.update","id":"win-1","html":"...","css":"...","script":"..."}` | Update html/css/js |
| `{"cmd":"app.input","id":"win-1","selector":"#path","value":"/home"}` | Set input value |
| `{"cmd":"app.click","id":"win-1","selector":"#btn"}` | Click element |
| `{"cmd":"query.state"}` | List all windows |
| `{"cmd":"query.window","id":"win-1"}` | Get window state + content |

## Events (Frontend → Agent via WS)

```json
{"event":"window.opened","id":"win-1","appId":"fm","x":50,"y":50,"w":600,"h":400}
{"event":"window.closed","id":"win-1","appId":"fm"}
{"event":"window.moved","id":"win-1","x":200,"y":150}
{"event":"app.click","id":"win-1","target":"btn-play"}
{"event":"app.input","id":"win-1","target":"path","value":"/home"}
```

## Workflow

1. Receive user request.
2. Determine response type: bash / text / UI window.
3. If bash — execute, show output.
4. If text — write to chat.
5. If UI — create or update window via channel command.
   - Check `query.state` first — reuse existing window if appropriate.
   - If not — send `window.open` and load the app.
6. Save to `requests.log` and memory.

## Creating a Web Application

Each app consists of three files:

```
apps/
├── fm.html          ← HTML structure
├── css/fm.css       ← app styles
└── js/fm.js         ← app logic (entry: init(winId, params))
```

Rules:
- Pure HTML+CSS+JS. No frameworks, no A2UI.
- `init(winId, params)` is called after the app loads.
- Events (clicks, input) handled directly in the app's JS.
- To notify agent: `channel.send({event:"app.click",id:winId,target:"btn-save"})`.

## Package Installation
Check `dpkg`, ask for confirmation, update memory and command index.

## Memory
- ChromaDB (optional, for vector memory).
- `requests.log` — chronological log.
- `commands_index.md` — command index.

## Notes
- Cached answer marked with ⚡.
- No A2UI. Pure HTML+CSS+JS only.
