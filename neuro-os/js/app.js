// ── App Init ──

// Input handler
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const t = input.value.trim();
    if (t) { input.value = ''; send(t); }
  }
});

// Toggle chat
let chatVisible = true;
document.getElementById('toggle-chat').onclick = () => {
  chatVisible = !chatVisible;
  const log = document.getElementById('chat-log');
  const panel = document.getElementById('input-panel');
  const btn = document.getElementById('toggle-chat');
  if (chatVisible) {
    log.style.display = 'flex';
    panel.style.display = 'flex';
    btn.textContent = '💬';
  } else {
    log.style.display = 'none';
    panel.style.display = 'none';
    btn.textContent = '💬';
  }
};

// Init window manager
wm.init();

// Start WebSocket
connectWS();

// After WS connects — attach channel
const wsCheck = setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    channel.attach(ws);
    clearInterval(wsCheck);
    console.log('Neuro-OS: channel ready');
  }
}, 500);
