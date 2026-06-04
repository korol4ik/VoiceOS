// ── Window Manager ──
// Full window control on #desktop

const wm = (function() {
  let windows = [];
  let zIndex = 10;
  let wmCounter = 0;

  // ── Create window ──
  function open(appId, params = {}) {
    const id = params.id || (appId + '-' + (++wmCounter));
    
    // Prevent duplicate windows with the same id
    if (windows.some(function(w) { return w.id === id; })) {
      focus(id);
      return;
    }
    
    // Clamp window size to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.floor(vw * 0.92);
    const maxH = Math.floor(vh * 0.85);
    
    // Default position: below the lowest existing window
    let defaultY = 80; // start below status bar + padding
    if (windows.length > 0) {
      const bottomMost = Math.max(...windows.map(w => {
        const r = w.el.getBoundingClientRect();
        return r.top + 30; // 30px below each window
      }));
      defaultY = Math.max(30, bottomMost);
    }
    const x = params.x !== undefined ? params.x : 10 + (windows.length * 30);
    const y = params.y !== undefined ? params.y : Math.min(defaultY, Math.max(30, maxH - 100));
    const w = Math.min(params.w || Math.floor(vw * 0.7), maxW);
    const h = Math.min(params.h || Math.floor(vh * 0.6), maxH);

    // Shell
    const el = document.createElement('div');
    el.className = 'window';
    // Clamp so title bar is always visible (y >= 0)
    const clampedY = Math.max(0, y);
    el.id = id;
    el.style.cssText = `left:${x}px;top:${clampedY}px;width:${w}px;height:${h}px;z-index:${++zIndex}`;

    // Header
    el.innerHTML = `
      <div class="window-header">
        <span class="window-title">${params.title || appId}</span>
        <div class="window-actions">
          <span class="wa-btn wa-full" title="Fullscreen">⛶</span>
          <span class="wa-btn wa-close" title="Close">✕</span>
        </div>
      </div>
      <div class="window-body"></div>
    `;

    // Events
    el.querySelector('.wa-close').onclick = () => close(id);
    el.querySelector('.wa-full').onclick = () => toggleFullscreen(id);
    el.addEventListener('mousedown', () => focus(id));

    // Drag
    const header = el.querySelector('.window-header');
    drag(el, header);

    // Resize (native CSS resize on .window)

    // Append
    desktop.appendChild(el);

    const win = {
      id,
      el,
      appId,
      title: params.title || appId,
      fullscreen: false,
      data: params.data || {}
    };

    windows.push(win);
    focus(id);

    // If HTML skeleton provided — load it
    if (params.html) {
      setContent(id, params.html);
    }

    channel.send({ event: 'window.opened', id, appId, x, y, w, h });
    saveState();
    return win;
  }

  // ── Close ──
  function close(id) {
    const i = windows.findIndex(w => w.id === id);
    if (i === -1) return;
    const win = windows[i];
    const rect = win.el.getBoundingClientRect();
    win.el.remove();
    windows.splice(i, 1);
    channel.send({ event: 'window.closed', id, appId: win.appId });
    saveState();
  }

  // ── Focus ──
  function focus(id) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.el.style.zIndex = ++zIndex;
    }
  }

  // ── Move ──
  function move(id, x, y) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.el.style.left = x + 'px';
      win.el.style.top = y + 'px';
      saveState();
    }
  }

  // ── Resize ──
  function resize(id, w, h) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.el.style.width = Math.max(200, w) + 'px';
      win.el.style.height = Math.max(100, h) + 'px';
      saveState();
    }
  }

  // ── Toggle fullscreen ──
  function toggleFullscreen(id) {
    const win = windows.find(w => w.id === id);
    if (!win) return;
    if (win.fullscreen) {
      move(id, win._fsX, win._fsY);
      resize(id, win._fsW, win._fsH);
      win.fullscreen = false;
    } else {
      win._fsX = parseInt(win.el.style.left) || 0;
      win._fsY = parseInt(win.el.style.top) || 0;
      win._fsW = win.el.offsetWidth;
      win._fsH = win.el.offsetHeight;
      move(id, 0, 80);
      win.el.style.width = '100vw';
      win.el.style.height = 'calc(100vh - 120px)';
      win.fullscreen = true;
    }
    saveState();
  }

  // ── Set content ──
  function setContent(id, html) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.el.querySelector('.window-body').innerHTML = html;
    }
  }

  // ── Set title ──
  function setTitle(id, title) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.title = title;
      win.el.querySelector('.window-title').textContent = title;
    }
  }

  // ── Get all window states ──
  function getState() {
    return windows.map(win => {
      const rect = win.el.getBoundingClientRect();
      return {
        id: win.id,
        appId: win.appId,
        title: win.title,
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        fullscreen: win.fullscreen
      };
    });
  }

  // ── Get window body content as text ──
  function getContent(id) {
    const win = windows.find(w => w.id === id);
    if (!win) return null;
    const body = win.el.querySelector('.window-body');
    return {
      html: body.innerHTML,
      text: body.textContent,
      buttons: Array.from(body.querySelectorAll('button, [role=button]')).map(b => ({
        text: b.textContent,
        id: b.id || b.className
      })),
      inputs: Array.from(body.querySelectorAll('input, textarea, select')).map(inp => ({
        id: inp.id || inp.className,
        value: inp.value,
        placeholder: inp.placeholder
      }))
    };
  }

  // ── Get single window ──
  function get(id) {
    return windows.find(w => w.id === id);
  }

  // ── Save state to localStorage ──
  // ── Save window state to localStorage ──
  function saveState() {
    var arr = [];
    for (var i = 0; i < windows.length; i++) {
      var win = windows[i];
      var body = win.el.querySelector('.window-body');
      var o = {
        id: win.id, appId: win.appId, title: win.title,
        x: win.el.offsetLeft, y: win.el.offsetTop,
        w: win.el.offsetWidth, h: win.el.offsetHeight
      };
      // Save FM current path
      if (win.appId === 'fm' && win.data && win.data.path) {
        o.path = win.data.path;
      }
      arr.push(o);
    }
    try { localStorage.setItem('neuro_windows', JSON.stringify(arr)); } catch(e) {}
  }

  // ── Load FM content into restored window ──
  function loadFmContent(winId, savedPath) {
    var body = document.querySelector('#' + winId + ' .window-body');
    if (!body) return;
    var path = savedPath || '/var/www/html/neuro-os/user';
    body.innerHTML = '<link rel="stylesheet" href="apps/css/fm.css"><div id="fm-path-bar"><span id="fm-path-display">' + path + '</span><button id="fm-refresh" title="Refresh">↻</button></div><div id="fm-list"><div style="padding:10px;color:#888;">Loading...</div></div>';
    var sc = document.createElement('script');
    sc.src = 'apps/js/fm.js';
    sc.onload = function() { if (typeof window.init === 'function') window.init(winId, { path: path }); };
    body.appendChild(sc);
  }

  // ── Restore saved windows ──
  function restoreState() {
    if (windows.length > 0) return;
    var raw;
    try { raw = localStorage.getItem('neuro_windows'); } catch(e) { return; }
    if (!raw) return;
    try { localStorage.removeItem('neuro_windows'); } catch(e) {}
    var wins;
    try { wins = JSON.parse(raw); } catch(e) { return; }
    if (!wins || !wins.length) return;
    for (var i = 0; i < wins.length; i++) {
      var s = wins[i];
      open(s.appId, { id: s.id, title: s.title, x: s.x, y: s.y, w: s.w, h: s.h });
    }
    saveState();
    // Restore FM scripts (scripts don't run via innerHTML)
    for (var j = 0; j < wins.length; j++) {
      if (wins[j].appId === 'fm') {
        (function(id, p) { setTimeout(function() { loadFmContent(id, p); }, 500); })(wins[j].id, wins[j].path);
      }
    }
  }

  // ── Initialize (called once on page load) ──
  function init() {
    restoreState();
  }

  return {
    open, close, focus, move, resize,
    toggleFullscreen,
    setContent, setTitle,
    getState, getContent, get, saveState,
    init
  };
})();
