// ── Command Channel ──
// Bidirectional link: agent → frontend (commands), frontend → agent (events)

const channel = (function() {
  let ws = null;
  let msgId = 0;
  let pendingReqs = {};
  let ready = false;

  // ── Agent commands ──
  const handlers = {
    // Window management
    'window.open': (data) => {
      wm.open(data.app, data);
      return { ok: true, id: data.id };
    },
    'window.close': (data) => {
      wm.close(data.id);
      return { ok: true };
    },
    'window.move': (data) => {
      wm.move(data.id, data.x, data.y);
      return { ok: true };
    },
    'window.resize': (data) => {
      wm.resize(data.id, data.w, data.h);
      return { ok: true };
    },
    'window.focus': (data) => {
      wm.focus(data.id);
      return { ok: true };
    },
    'window.fullscreen': (data) => {
      wm.toggleFullscreen(data.id);
      return { ok: true };
    },
    'window.title': (data) => {
      wm.setTitle(data.id, data.title);
      return { ok: true };
    },

    // Window content
    'app.setContent': (data) => {
      wm.setContent(data.id, data.html);
      return { ok: true };
    },
    'app.update': (data) => {
      const win = wm.get(data.id);
      if (!win) return { ok: false, error: 'window not found' };
      const body = win.el.querySelector('.window-body');

      if (data.html !== undefined) body.innerHTML = data.html;
      if (data.css !== undefined) {
        let style = body.querySelector('style._app');
        if (!style) { style = document.createElement('style'); style.className = '_app'; body.prepend(style); }
        style.textContent = data.css;
      }
      if (data.script !== undefined) {
        const script = document.createElement('script');
        script.textContent = 'try{' + data.script + '}catch(e){console.error(e)}';
        body.appendChild(script);
      }

      return { ok: true };
    },

    // Element interaction
    'app.input': (data) => {
      const win = wm.get(data.id);
      if (!win) return { ok: false, error: 'window not found' };
      const el = win.el.querySelector(data.selector);
      if (!el) return { ok: false, error: 'element not found' };
      el.value = data.value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return { ok: true };
    },
    'app.click': (data) => {
      const win = wm.get(data.id);
      if (!win) return { ok: false, error: 'window not found' };
      const el = win.el.querySelector(data.selector);
      if (!el) return { ok: false, error: 'element not found' };
      el.click();
      return { ok: true };
    },
    'app.call': (data) => {
      // Execute arbitrary JS in window context
      return { ok: true, result: 'not implemented' };
    },

    // State queries
    'query.state': () => {
      return { windows: wm.getState() };
    },
    'query.window': (data) => {
      const state = wm.get(data.id);
      const content = wm.getContent(data.id);
      return state ? { state: wm.getState().find(w => w.id === data.id), content } : { error: 'not found' };
    }
  };

  // ── Send event to agent ──
  function send(payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'event',
      event: 'app.command',
      payload
    }));
  }

  // ── Handle command from agent ──
  function handleCommand(cmd) {
    const handler = handlers[cmd.cmd];
    if (handler) {
      return handler(cmd.data || cmd);
    }
    console.warn('⚠ unknown command:', cmd.cmd);
    return { ok: false, error: 'unknown command: ' + cmd.cmd };
  }

  // ── Attach to WebSocket ──
  function attach(wsInstance) {
    ws = wsInstance;

    // Layer command handler on top of existing onmessage
    const origOnMessage = ws.onmessage;
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        // Pass connect.challenge to ws.js handler
        if (msg.type === 'event' && msg.event === 'connect.challenge') {
          if (origOnMessage) origOnMessage(e);
          return;
        }
        if (msg.type === 'res' && msg.payload?.type === 'hello-ok') {
          if (origOnMessage) origOnMessage(e);
          return;
        }

        // RPC responses
        if (msg.type === 'res') {
          const cb = pendingReqs[msg.id];
          if (cb) { cb(null, msg.payload || msg.result); delete pendingReqs[msg.id]; }
          return;
        }
        if (msg.type === 'err') {
          const cb = pendingReqs[msg.id];
          if (cb) { cb(msg.error || msg); delete pendingReqs[msg.id]; }
          return;
        }

        // Events from gateway
        if (msg.type === 'event') {
          // app.command — agent command
          if (msg.event === 'app.command' && msg.payload) {
            const result = handleCommand(msg.payload);
            // Send response if reqId provided
            if (msg.payload.reqId && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'res', id: msg.payload.reqId,
                payload: result
              }));
            }
            return;
          }

          // Forward to original handler
          if (origOnMessage) origOnMessage(e);
          return;
        }
      } catch(e) {
        console.error('channel error:', e);
      }
    };
    ready = true;
  }

  return { send, handleCommand, attach, ready: () => ready };
})();
