// ── App Init ──

// Input handler
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const t = input.value.trim();
    if (t) { input.value = ''; send(t); }
  }
});

// Clear chat
document.getElementById('clear-chat').onclick = () => { chat.innerHTML = ''; };

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
