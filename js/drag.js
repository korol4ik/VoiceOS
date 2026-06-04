// ── Window drag ──
function drag(el, h) {
  let d = false, ox, oy;
  function sd(cx,cy) { d=true; ox=cx-el.offsetLeft; oy=cy-el.offsetTop; }
  function dd(cx,cy) { if(d) { el.style.left=(cx-ox)+'px'; el.style.top=(cy-oy)+'px'; } }
  function ed() { d=false; if(typeof wm !== 'undefined' && wm.saveState) wm.saveState(); }
  h.addEventListener('mousedown', e => {
    sd(e.clientX, e.clientY);
    const mv = e2 => dd(e2.clientX, e2.clientY);
    const mu = () => { ed(); document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mv);
    document.addEventListener('mouseup', mu);
  });
  h.addEventListener('touchstart', e => { const t = e.touches[0]; sd(t.clientX, t.clientY); }, {passive:true});
  h.addEventListener('touchmove', e => { const t = e.touches[0]; dd(t.clientX, t.clientY); e.preventDefault(); }, {passive:false});
  h.addEventListener('touchend', ed);
}

// ── Window resize ──
function resize(el, h) {
  let r = false, rw, rh, rx, ry;
  h.addEventListener('mousedown', e => {
    e.stopPropagation(); r=true; rw=el.offsetWidth; rh=el.offsetHeight; rx=e.clientX; ry=e.clientY;
    const rm = e2 => { if(r) { el.style.width=Math.max(200,rw+e2.clientX-rx)+'px'; el.style.height=Math.max(100,rh+e2.clientY-ry)+'px'; } };
    const ru = () => { r=false; document.removeEventListener('mousemove', rm); document.removeEventListener('mouseup', ru); if(typeof wm !== 'undefined' && wm.saveState) wm.saveState(); };
    document.addEventListener('mousemove', rm);
    document.addEventListener('mouseup', ru);
  });
  h.addEventListener('touchstart', e => { e.stopPropagation(); const t=e.touches[0]; r=true; rw=el.offsetWidth; rh=el.offsetHeight; rx=t.clientX; ry=t.clientY; }, {passive:true});
  h.addEventListener('touchmove', e => { e.stopPropagation(); const t=e.touches[0]; if(r) el.style.width=Math.max(200,rw+t.clientX-rx)+'px'; el.style.height=Math.max(100,rh+t.clientY-ry)+'px'; e.preventDefault(); }, {passive:false});
  h.addEventListener('touchend', () => { r=false; if(typeof wm !== 'undefined' && wm.saveState) wm.saveState(); });
}
