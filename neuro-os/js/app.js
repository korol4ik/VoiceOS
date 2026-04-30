// ── КОНФИГУРАЦИЯ ──
const MODEL = 'openclaw/default';

const output = document.getElementById('output');
const queryInput = document.getElementById('query');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const body = document.body;

let waiting = false;
let mouseTimeout;

// ── УПРАВЛЕНИЕ КУРСОРОМ ──
body.addEventListener('mousemove', () => {
  body.classList.add('user-active');
  clearTimeout(mouseTimeout);
  mouseTimeout = setTimeout(() => body.classList.remove('user-active'), 3000);
});
document.addEventListener('click', () => queryInput.focus());

// ── ВЫВОД ──
function appendToOutput(text, className = '') {
  const span = document.createElement('span');
  if (className) span.className = className;
  span.textContent = text;
  output.appendChild(span);
  output.scrollTop = output.scrollHeight;
}
function appendLine(text = '', className = '') {
  appendToOutput(text + '\n', className);
}
function setStatus(state) {
  statusDot.className = '';
  switch(state) {
    case 'loading': statusDot.classList.add('loading'); statusText.textContent = 'думаю...'; break;
    case 'ready':   statusDot.classList.add('ready');   statusText.textContent = 'готов'; break;
    case 'error':   statusDot.classList.add('error');   statusText.textContent = 'ошибка'; break;
    default: statusText.textContent = state;
  }
}

// ── ПАРСИНГ КОМАНД В ЗАПРОСЕ (до модели) ──
function parseAppCommand(query) {
  // "покажи ПУТЬ через gallery" или "открой gallery ПУТЬ"
  let m = query.match(/покажи\s+(.+?)\s+через\s+(\w+)/i);
  if (m) return { app: m[2], data: { path: m[1].trim() } };
  m = query.match(/открой\s+(\w+)(?:\s+(.+))?/i);
  if (m) return { app: m[1], data: m[2] ? { path: m[2].trim() } : {} };
  return null;
}

// ── ПАРСИНГ JSON-КОМАНД В ОТВЕТЕ ──
function extractAppFromReply(reply) {
  let start = reply.indexOf('{"app"');
  if (start === -1) return null;
  let depth = 0, end = -1;
  for (let i = start; i < reply.length; i++) {
    if (reply[i] === '{') depth++;
    if (reply[i] === '}') { depth--; if (depth === 0) { end = i+1; break; } }
  }
  if (end === -1) return null;
  try {
    const cmd = JSON.parse(reply.slice(start, end));
    if (cmd && typeof cmd.app === 'string') return { cmd, start, end };
  } catch(e) {}
  return null;
}

// ── ОТПРАВКА В OPENCLAW API ──
async function sendQuery(query) {
  if (waiting || !query.trim()) return;
  waiting = true;
  setStatus('loading');

  // Открываем приложение по команде в запросе (до ответа модели)
  const appCmd = parseAppCommand(query);
  if (appCmd) showApp(appCmd.app, appCmd.data);

  appendLine('> ' + query, 'user-query');

  try {
    const res = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openclaw-session-key': 'agent:main:main'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: query }]
      })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error('HTTP ' + res.status + (errText ? ': ' + errText.slice(0,200) : ''));
    }
    const data = await res.json();
    let reply = data?.choices?.[0]?.message?.content || JSON.stringify(data);

    // Парсим JSON-команды в ответе модели (если есть)
    const extracted = extractAppFromReply(reply);
    if (extracted) {
      showApp(extracted.cmd.app, extracted.cmd.data || {});
      reply = (reply.slice(0, extracted.start) + reply.slice(extracted.end)).trim();
    }

    if (reply) appendLine(reply, 'system-response');
    appendLine('──', 'divider');
    setStatus('ready');
  } catch (err) {
    appendLine('⚠ ' + err.message, 'error');
    setStatus('error');
  } finally {
    waiting = false;
    queryInput.value = '';
    queryInput.focus();
  }
}

// ── КОНТЕЙНЕР ПРИЛОЖЕНИЙ ──
const appContainer = document.getElementById('app-container');
let currentApp = null;

async function showApp(name, data = {}) {
  const url = 'apps/' + name + '.html';
  appContainer.innerHTML = '';
  appContainer.classList.add('loading');

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
    let html = await res.text();

    // плейсхолдеры
    html = html.replace(/\{\{json:(\w+)\}\}/g, (_, key) => {
      try { return JSON.stringify(data[key]); } catch { return ''; }
    });
    html = html.replace(/\{\{encode:(\w+)\}\}/g, (_, key) => {
      return encodeURIComponent(data[key] ?? '');
    });
    html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return data[key] ?? '';
    });

    appContainer.innerHTML = html;
    appContainer.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });

    appContainer.classList.remove('loading');
    appContainer.classList.add('active');
    currentApp = { name, data };
    window.dispatchEvent(new CustomEvent('app:loaded', { detail: { name, data, el: appContainer } }));
    return appContainer;
  } catch (err) {
    appContainer.classList.remove('loading');
    appContainer.innerHTML = '<div class="app-error">⚠ ' + err.message + '</div>';
    appContainer.classList.add('active');
    currentApp = null;
    throw err;
  }
}

function hideApp() {
  appContainer.classList.remove('active', 'loading');
  appContainer.innerHTML = '';
  currentApp = null;
}

// ── ВВОД ──
queryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const q = queryInput.value.trim();
    if (q) sendQuery(q);
  }
});

queryInput.focus();
setStatus('ready');

// ── ЗАПУСК ПО HASH В URL ──
window.addEventListener('hashchange', onHash);
onHash();
function onHash() {
  appendLine("[debug] hash: " + location.hash, "error");
  const h = location.hash.slice(1);
  if (!h) return;
  const parts = h.split(':');
  if (parts.length >= 2 && parts[0] === 'gallery') {
    showApp('gallery', {path: parts.slice(1).join(':')});
  }
}

