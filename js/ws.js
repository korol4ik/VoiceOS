// ── WebSocket ──
// Connects to OpenClaw Gateway.
// During bootstrap the agent replaces the password with the actual one.
let ws, msgId = 0;

function connectWS() {
  ws = new WebSocket(WS_URL);
  ws.onopen = () => {
    dot(true);
  };
  ws.onmessage = e => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'event' && msg.event === 'connect.challenge') {
        ws.send(JSON.stringify({
          type: 'req', id: 'c-' + (++msgId), method: 'connect',
          params: {
            minProtocol: 4, maxProtocol: 4,
            client: { id: 'web', version: '1.0', platform: 'web', mode: 'cli' },
            role: 'operator', scopes: ['operator.read', 'operator.write'],
            auth: { password: 'changeme' }
          }
        }));
        return;
      }
      if (msg.type === 'res' && msg.payload?.type === 'hello-ok') {
        // Channel ready
        return;
      }
    } catch(e) {}
  };
  ws.onclose = () => {
    dot(false);
    setTimeout(connectWS, 3000);
  };
  ws.onerror = () => ws.close();
}
