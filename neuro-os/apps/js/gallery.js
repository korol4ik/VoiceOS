(async function(){
  const grid = document.getElementById('gallery-grid');
  const st = document.getElementById('g-status');
  const pathEl = document.querySelector('.gallery-path');
  const path = pathEl ? pathEl.textContent : '/';
  let files = [];

  // data-files с контейнера
  const app = document.getElementById('app-container');
  if (app && app.dataset.files) {
    try { const p = JSON.parse(app.dataset.files); if (Array.isArray(p)) files = p; } catch(e) {}
  }

  if (!files.length) {
    try {
      const res = await fetch('/api/ls/?path=' + encodeURIComponent(path));
      if (res.ok) { const d = await res.json(); if (Array.isArray(d)) files = d; }
      else { st.textContent = 'HTTP ' + res.status; }
    } catch(e) { st.textContent = 'err: ' + e.message; }
  }

  st.textContent = files.length + ' эл.';
  grid.innerHTML = '';
  if (!files.length) { grid.innerHTML = '<span style="color:#555;padding:30px;text-align:center">пусто</span>'; return; }

  files.forEach(f => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#111;border:1px solid #222;border-radius:4px;overflow:hidden;margin:4px;';
    const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
    const isAud = /\.(mp3|wav|ogg|flac|m4a)$/i.test(f.name);
    const isVid = /\.(mp4|webm|mov|avi)$/i.test(f.name);
    const url = f.url || (path.replace(/\/?$/,'/') + f.name);
    if (isImg) {
      card.innerHTML = '<img src="'+url+'" style="width:100%;height:100px;object-fit:cover;display:block"><div style="padding:6px;font-size:12px;color:#aaa">'+f.name+'</div>';
    } else if (isAud) {
      card.innerHTML = '<div style="font-size:32px;text-align:center;padding:20px">🎵</div><audio controls src="'+url+'" style="width:100%"></audio><div style="padding:6px;font-size:12px;color:#aaa">'+f.name+'</div>';
    } else if (isVid) {
      card.innerHTML = '<video controls src="'+url+'" style="width:100%;height:120px"></video><div style="padding:6px;font-size:12px;color:#aaa">'+f.name+'</div>';
    } else if (f.type === 'dir') {
      card.innerHTML = '<div style="font-size:32px;text-align:center;padding:20px;color:#555">📁</div><div style="padding:6px;font-size:12px;color:#aaa">'+f.name+'</div>';
      card.onclick = () => showApp('gallery', {path: path.replace(/\/?$/,'/')+f.name});
    } else {
      const s = f.size > 1048576 ? (f.size/1048576).toFixed(1)+'MB' : f.size > 1024 ? (f.size/1024).toFixed(1)+'KB' : f.size+'B';
      card.innerHTML = '<div style="font-size:32px;text-align:center;padding:20px;color:#555">📄</div><div style="padding:6px;font-size:12px;color:#aaa">'+f.name+' <span style="color:#555;margin-left:4px">'+s+'</span></div>';
    }
    grid.appendChild(card);
  });
})();
