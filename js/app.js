// ── App Init ──

// Detect if we're running WITHOUT a model (chat unavailable)

// Input handler — works if model is available
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const t = input.value.trim();
    if (t) { input.value = ''; send(t); }
  }
});

// Toggle chat log
let chatVisible = true;
const toggleBtn = document.getElementById('toggle-chat') || document.getElementById('clear-chat');
if (toggleBtn) {
  toggleBtn.textContent = '💬';
  toggleBtn.id = 'toggle-chat';
  toggleBtn.onclick = () => {
    chatVisible = !chatVisible;
    const log = document.getElementById('chat-log');
    log.style.display = chatVisible ? 'flex' : 'none';
  };
}

// Restore saved windows immediately (before any neuro-cmd can arrive)
wm.init();

// Try WebSocket connection (may fail if no model/gateway)
function tryConnectWS() {
  try {
    connectWS();
    // After WS connects — attach channel
    const wsCheck = setInterval(() => {
      if (typeof ws !== 'undefined' && ws && ws.readyState === WebSocket.OPEN) {
        channel.attach(ws);
        clearInterval(wsCheck);
        console.log('Neuro-OS: channel ready (model connected)');
      }
    }, 500);
    // Timeout — if WS doesn't connect, we're in offline/no-model mode
    setTimeout(() => {
      const dot = document.getElementById('ws-dot');
      if (dot && dot.style.background !== 'rgb(102, 255, 102)' && dot.style.background !== '#6f6') {
        console.log('Neuro-OS: no model detected — running in offline mode');
      }
    }, 8000);
  } catch(e) {
    console.log('Neuro-OS: offline mode — no model');
  }
}

// Load an app: set HTML structure via innerHTML (no <script> tags — browsers block those),
// then load JS via document.createElement('script') which executes reliably.
function loadAppInline(winId, appConfig) {
  const win = wm.get(winId);
  if (!win) return;

  // Set HTML skeleton (no script tags — safe for innerHTML)
  wm.setContent(winId, appConfig.html || '');

  // Load JS files sequentially
  const scripts = appConfig.scripts || [];
  const body = win.el.querySelector('.window-body');
  
  function loadNext(i) {
    if (i >= scripts.length) {
      // All scripts loaded — call init if provided
      if (typeof appConfig.init === 'function') appConfig.init(winId);
      return;
    }
    const src = scripts[i];
    const el = document.createElement('script');
    el.onload = () => loadNext(i + 1);
    el.onerror = () => { console.error('Failed to load:', src); loadNext(i + 1); };
    el.src = src;
    body.appendChild(el);
  }
  loadNext(0);
}

tryConnectWS();
