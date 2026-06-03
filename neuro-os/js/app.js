// ── App Init ──

// Input handler
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const t = input.value.trim();
    if (t) { input.value = ''; send(t); }
  }
});

// Toggle chat log
let chatVisible = true;
document.getElementById('toggle-chat').onclick = () => {
  chatVisible = !chatVisible;
  const log = document.getElementById('chat-log');
  if (chatVisible) {
    log.style.display = 'flex';
  } else {
    log.style.display = 'none';
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
