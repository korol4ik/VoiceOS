// ── Window Manager ──
// Full window control on #desktop

const wm = (function() {
  let windows = [];
  let zIndex = 10;
  let wmCounter = 0;

  // ── Create window ──
  function open(appId, params = {}) {
    const id = params.id || (appId + '-' + (++wmCounter));
    const x = params.x || 50 + (windows.length * 30);
    const y = params.y || 50 + (windows.length * 30);
    const w = params.w || 480;
    const h = params.h || 360;

    // Shell
    const el = document.createElement('div');
    el.className = 'window';
    el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${++zIndex}`;

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
    }
  }

  // ── Resize ──
  function resize(id, w, h) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.el.style.width = Math.max(200, w) + 'px';
      win.el.style.height = Math.max(100, h) + 'px';
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
      move(id, 0, 0);
      win.el.style.width = '100vw';
      win.el.style.height = 'calc(100vh - 40px)';
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
  function saveState() {
    const state = windows.map(win => {
      const rect = win.el.getBoundingClientRect();
      const body = win.el.querySelector('.window-body');
      return {
        id: win.id, appId: win.appId, title: win.title,
        x: rect.left, y: rect.top, w: rect.width, h: rect.height,
        fullscreen: win.fullscreen,
        html: body ? body.innerHTML : ''
      };
    });
    localStorage.setItem('neuro_windows', JSON.stringify(state));
  }

  // ── Restore state from localStorage ──
  function restoreState() {
    const raw = localStorage.getItem('neuro_windows');
    if (!raw) return;
    try {
      const wins = JSON.parse(raw);
      for (const s of wins) {
        if (!s.html) continue;
        open(s.appId, {
          id: s.id, title: s.title,
          x: s.x, y: s.y, w: s.w, h: s.h,
          html: s.html
        });
      }
    } catch(e) {}
  }

  // ── Initialize ──
  function init() {
    restoreState();
  }

  return {
    open, close, focus, move, resize,
    toggleFullscreen,
    setContent, setTitle,
    getState, getContent, get,
    init
  };
})();
