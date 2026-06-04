// ── File Manager ──
// Fully self-sufficient: works without a model.
// Uses direct fetch() to File API (/file-api/api/)
//
// 🚀 Запуск через нейро-команду:
// ```neuro-cmd
// {"cmd":"window.open","app":"fm","id":"fm-main","title":"📁 Files","x":10,"y":80,"w":620,"h":440}
// ```
// ```neuro-cmd
// {"cmd":"app.update","id":"fm-main","script":"var b=document.querySelector('#fm-main .window-body');b.innerHTML='<link rel=\\"stylesheet\\" href=\\"apps/css/fm.css\\"><div id=\\"fm-path-bar\\"><span id=\\"fm-path-display\\">/var/www/html/neuro-os/user</span><button id=\\"fm-refresh\\" title=\\"Refresh\\">↻</button></div><div id=\\"fm-list\\"><div style=\\"padding:10px;color:#888;\\">Loading...</div></div>';var s=document.createElement('script');s.src='apps/js/fm.js';s.onload=function(){init('fm-main',{});};b.appendChild(s);"}
// ```

let fmState = { winId: null, path: '/var/www/html/neuro-os/user' };

const FILE_API = '/file-api/api';
const WEB_ROOT = '/var/www/html/neuro-os';

// Convert absolute local path to web-accessible URL
function pathToUrl(absPath) {
  if (absPath.startsWith(WEB_ROOT)) {
    return absPath.slice(WEB_ROOT.length) || '/';
  }
  return absPath; // fallback
}

function init(winId, params) {
  fmState.winId = winId;
  fmState.path = params.path || '/var/www/html/neuro-os/user';

  document.getElementById('fm-refresh').onclick = () => {
    loadDir(fmState.path);
  };

  // Load initial directory
  loadDir(fmState.path);
}

// ── Load directory listing ──
function loadDir(dir) {
  const display = document.getElementById('fm-path-display');
  const list = document.getElementById('fm-list');
  display.textContent = dir;
  fmState.path = dir;
  // Save path to window data for localStorage persistence
  var _w = wm.get(fmState.winId);
  if (_w) { _w.data = _w.data || {}; _w.data.path = dir; if (wm.saveState) wm.saveState(); }
  list.innerHTML = '<div style="padding:10px;color:#666;">Loading...</div>';

  fetch(FILE_API + '/ls?path=' + encodeURIComponent(dir))
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(entries => renderList(dir, entries))
    .catch(err => {
      list.innerHTML = '<div style="padding:10px;color:#f66;">Error: ' + escapeHtml(err.message) + '</div>';
    });
}

// ── Render directory listing ──
function renderList(dir, entries) {
  const pathDisplay = document.getElementById('fm-path-display');
  const list = document.getElementById('fm-list');
  pathDisplay.textContent = dir;
  list.innerHTML = '';

  // Up button
  if (dir !== '/') {
    const up = document.createElement('div');
    up.className = 'fm-item fm-up';
    up.innerHTML = '<span class="icon">📁</span><span class="name">../</span>';
    up.onclick = () => {
      const parent = dir.replace(/\/?[^\/]+\/?$/, '') || '/';
      loadDir(parent);
    };
    list.appendChild(up);
  }

  // Sort: directories first, then files, alphabetically
  const sorted = [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of sorted) {
    const isDir = entry.type === 'dir';
    const icon = isDir ? '📁' : '📄';
    const item = document.createElement('div');
    item.className = 'fm-item ' + (isDir ? 'fm-dir' : 'fm-file');
    const sizeFormatted = isDir ? '' : formatSize(entry.size || 0);
    item.innerHTML = `<span class="icon">${icon}</span><span class="name">${escapeHtml(entry.name)}</span>${sizeFormatted ? `<span class="size">${sizeFormatted}</span>` : ''}`;

    item.onclick = () => {
      const fullPath = (dir.replace(/\/$/, '') + '/' + entry.name).replace(/\/\//g, '/');
      if (isDir) {
        loadDir(fullPath);
      } else {
        openFile(fullPath, entry.name);
      }
    };

    list.appendChild(item);
  }
}

// ── Open a file ──
function openFile(filePath, fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const textExts = ['txt','md','js','html','css','json','xml','yml','yaml','sh','py','rb','php','c','cpp','h','hpp','java','go','rs','toml','ini','cfg','conf','env','gitignore','editorconfig'];
  const imgExts = ['jpg','jpeg','png','gif','webp','bmp','ico','svg'];
  const audioExts = ['mp3','wav','ogg','flac','m4a','aac','wma'];
  const videoExts = ['mp4','webm','avi','mkv','mov','flv'];

  if (audioExts.includes(ext) || videoExts.includes(ext)) {
    // Build web URL for media
    const url = pathToUrl(filePath);
    showMediaViewer(fileName, url, ext);
    return;
  }

  if (imgExts.includes(ext)) {
    const url = pathToUrl(filePath);
    showImageViewer(fileName, url);
    return;
  }

  if (textExts.includes(ext)) {
    // Read and open in editor
    fetch(FILE_API + '/read?path=' + encodeURIComponent(filePath))
      .then(r => {
        if (!r.ok) throw new Error('Cannot read file');
        return r.text();
      })
      .then(content => {
        showTextViewer(fileName, content, filePath);
      })
      .catch(err => {
        alert('Error: ' + err.message);
      });
    return;
  }

  // Unknown type — try web URL
  window.open(pathToUrl(filePath), '_blank');
}

// ── Text file viewer (with edit capability) ──
function showTextViewer(name, content, filePath) {
  const list = document.getElementById('fm-list');
  list.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#252542;border-bottom:1px solid #333;flex-shrink:0;">
      <span style="color:#fa7;flex:1;font-size:13px;">📄 ${escapeHtml(name)}</span>
      <button id="tv-edit" style="background:#2a6a3a;border:none;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">✏️ Edit</button>
      <button id="tv-back" style="background:#3a3a5c;border:none;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">← Back</button>
    </div>
    <pre id="tv-content" style="flex:1;margin:0;padding:10px;overflow:auto;font-size:12px;color:#8f8;background:#0d0d1a;white-space:pre-wrap;word-break:break-all;">${escapeHtml(content)}</pre>
  `;
  document.getElementById('tv-back').onclick = () => loadDir(fmState.path);
  document.getElementById('tv-edit').onclick = () => editFile(name, content, filePath);
}

// ── Simple inline editor ──
function editFile(name, content, filePath) {
  const list = document.getElementById('fm-list');
  list.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#252542;border-bottom:1px solid #333;flex-shrink:0;">
      <span style="color:#fa7;flex:1;font-size:13px;">✏️ ${escapeHtml(name)}</span>
      <button id="ed-save" style="background:#2a6a3a;border:none;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">💾 Save</button>
      <button id="ed-back" style="background:#3a3a5c;border:none;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">← Back</button>
    </div>
    <textarea id="ed-area" style="flex:1;background:#0d0d1a;color:#8f8;border:none;outline:none;padding:10px;font-size:13px;font-family:monospace;resize:none;tab-size:2;line-height:1.5;">${escapeHtml(content)}</textarea>
  `;
  document.getElementById('ed-back').onclick = () => loadDir(fmState.path);
  document.getElementById('ed-save').onclick = function() {
    const btn = this;
    const text = document.getElementById('ed-area').value;
    btn.textContent = '⏳...';
    fetch(FILE_API + '/write?path=' + encodeURIComponent(filePath), {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: text
    })
    .then(r => r.json())
    .then(d => {
      if (d.ok) {
        btn.textContent = '✅ Saved';
        setTimeout(() => btn.textContent = '💾 Save', 2000);
      } else {
        btn.textContent = '❌ Error';
        setTimeout(() => btn.textContent = '💾 Save', 3000);
      }
    })
    .catch(() => {
      btn.textContent = '❌ Error';
      setTimeout(() => btn.textContent = '💾 Save', 3000);
    });
  };
}

// ── Image viewer ──
function showImageViewer(name, url) {
  const list = document.getElementById('fm-list');
  list.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#252542;border-bottom:1px solid #333;flex-shrink:0;">
      <span style="color:#fa7;flex:1;font-size:13px;">🖼️ ${escapeHtml(name)}</span>
      <button id="iv-back" style="background:#3a3a5c;border:none;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">← Back</button>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;overflow:auto;background:#0d0d1a;">
      <img src="${escapeHtml(url)}" style="max-width:100%;max-height:100%;border-radius:4px;object-fit:contain;">
    </div>
  `;
  document.getElementById('iv-back').onclick = () => loadDir(fmState.path);
}

// ── Media viewer (audio/video) ──
function showMediaViewer(name, url, ext) {
  const isAudio = ['mp3','wav','ogg','flac','m4a','aac','wma'].includes(ext);
  const list = document.getElementById('fm-list');
  list.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#252542;border-bottom:1px solid #333;flex-shrink:0;">
      <span style="color:#fa7;flex:1;font-size:13px;">${isAudio ? '🎵' : '🎬'} ${escapeHtml(name)}</span>
      <button id="mv-back" style="background:#3a3a5c;border:none;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">← Back</button>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;background:#0d0d1a;">
      ${isAudio
        ? '<audio controls style="width:80%;" src="' + escapeHtml(url) + '"></audio>'
        : '<video controls style="max-width:100%;max-height:100%;" src="' + escapeHtml(url) + '"></video>'
      }
    </div>
  `;
  document.getElementById('mv-back').onclick = () => loadDir(fmState.path);
}

// ── Helpers ──
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
