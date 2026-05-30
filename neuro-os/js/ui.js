// ── UI helpers ──
let lastReply = '';

const MAX_CHAT = 20;

function saveChat() {
  const items = [];
  for (const row of chat.querySelectorAll('.chat-row')) {
    const role = row.className.replace('chat-row chat-','');
    const txt = row.querySelector('.chat-content')?.textContent || '';
    if (role !== 'thinking') items.push({ role, txt });
  }
  const last20 = items.slice(-MAX_CHAT);
  localStorage.setItem('chat_log', JSON.stringify(last20));
}

function restoreChat() {
  const raw = localStorage.getItem('chat_log');
  if (!raw) return;
  try {
    const msgs = JSON.parse(raw);
    for (const m of msgs) {
      const r = document.createElement('div');
      r.className = 'chat-row chat-' + m.role;
      const lb = document.createElement('span');
      lb.className = 'chat-label';
      lb.textContent = m.role === 'user' ? '>' : m.role === 'error' ? '\u26a0' : '\u27f5';
      r.appendChild(lb);
      const c = document.createElement('span');
      c.className = 'chat-content';
      c.textContent = m.txt;
      r.appendChild(c);
      chat.appendChild(r);
    }
    chat.scrollTop = chat.scrollHeight;
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', restoreChat);

function dot(on) {
  const el = document.getElementById('ws-dot');
  if (el) el.style.background = on ? '#6f6' : '#f66';
}

function log(role, txt) {
  const last = chat.lastElementChild;
  if (last && last.classList.contains('chat-thinking')) last.remove();
  const r = document.createElement('div');
  r.className = 'chat-row chat-' + role;
  const lb = document.createElement('span');
  lb.className = 'chat-label';
  lb.textContent = role === 'user' ? '>' : role === 'error' ? '\u26a0' : role === 'thinking' ? '\u22ef' : '\u27f5';
  r.appendChild(lb);
  const c = document.createElement('span');
  c.className = 'chat-content';
  c.textContent = txt;
  r.appendChild(c);
  chat.appendChild(r);
  chat.scrollTop = chat.scrollHeight;
  if (role !== 'thinking') saveChat();
}

function think() { log('thinking', 'thinking...'); }

// ── Send message to API ──
function send(text) {
  log('user', text);
  think();
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-openclaw-session-key': SESSION_KEY },
    body: JSON.stringify({ model: 'openclaw', max_tokens: 10000, messages: [{ role: 'user', content: text }] })
  })
  .then(r => {
    if (!r.ok) return r.text().then(t => { throw new Error('HTTP ' + r.status + ': ' + t.slice(0,200)); });
    return r.json();
  })
  .then(d => {
    const reply = d?.choices?.[0]?.message?.content || '';
    if (reply && reply !== lastReply) {
      lastReply = reply;
      log('agent', reply);
    }
  })
  .catch(e => {
    const last = chat.lastElementChild;
    if (last && last.classList.contains('chat-thinking')) last.remove();
    log('error', e.message);
  });
}
