/* Hero astronaut — ASCII, free-floating (no card). Grab and throw him: he tumbles in zero-g,
   bounces off the edges of his zone and drifts back. Glyphs flip to binary under the cursor. */
(function () {
  'use strict';
  var zone = document.getElementById('astro');
  if (!zone) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var RAMP = " .:-=+*o#%@";
  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

  zone.innerHTML = '<canvas class="az-bg" aria-hidden="true"></canvas><div class="az-body" title="drag me"><canvas aria-hidden="true"></canvas></div><span class="az-tag" aria-hidden="true">HH-01 · drag · throw</span>';
  var bg = zone.querySelector('.az-bg'), bctx = bg.getContext('2d');
  var body = zone.querySelector('.az-body'), can = body.querySelector('canvas'), ctx = can.getContext('2d');
  var W = 0, H = 0, dpr = 1, glyphs = null, bw = 0, bh = 0, lens = null, visible = true;
  var S = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, spin: 0, mode: 'rest', t: 0 };

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = zone.clientWidth; H = zone.clientHeight;
    bg.width = W * dpr; bg.height = H * dpr; bg.style.width = W + 'px'; bg.style.height = H + 'px';
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bw = Math.min(W * 0.5, 250); bh = bw * 230 / 200;
    var img = new Image();
    img.onload = function () {
      var cols = Math.round(bw / 3.6), rows = Math.round(cols * (bh / bw) * 0.6 / 1.02);
      var c = document.createElement('canvas'); c.width = cols; c.height = rows;
      var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, cols, rows);
      var d = x.getImageData(0, 0, cols, rows).data; glyphs = { cols: cols, rows: rows, cells: [] };
      for (var i = 0, p = 0; i < cols * rows; i++, p += 4) {
        if (d[p + 3] < 80) { glyphs.cells.push(null); continue; }
        var L = (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) / 255;
        glyphs.cells.push({ L: L, green: d[p + 1] > 170 && d[p] < 150, ch: RAMP[Math.max(1, Math.round(L * (RAMP.length - 1)))] });
      }
      can.width = bw * dpr; can.height = bh * dpr; can.style.width = bw + 'px'; can.style.height = bh + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg());
    S.x = W / 2; S.y = H / 2;
  }

  function drawBg(now) {
    var dk = dark(), cx = W / 2, cy = H / 2, ink = dk ? '255,255,255' : '0,0,0';
    bctx.clearRect(0, 0, W, H);
    bctx.strokeStyle = 'rgba(' + ink + ',0.09)'; bctx.lineWidth = 1;
    bctx.setLineDash([2, 6]);
    bctx.beginPath(); bctx.ellipse(cx, cy + bh * 0.05, W * 0.46, W * 0.16, -0.12, 0, Math.PI * 2); bctx.stroke();
    bctx.setLineDash([]);
    // two satellites riding the orbit: a bit and a dot
    var a = now / 4200;
    [[a, '1'], [a + Math.PI, '0']].forEach(function (s) {
      var ex = Math.cos(s[0]) * W * 0.46, ey = Math.sin(s[0]) * W * 0.16, r = -0.12;
      var x = cx + ex * Math.cos(r) - ey * Math.sin(r), y = cy + bh * 0.05 + ex * Math.sin(r) + ey * Math.cos(r);
      bctx.font = '600 11px ' + MONO; bctx.fillStyle = 'rgba(74,222,128,' + (Math.sin(s[0]) > 0 ? 0.9 : 0.35) + ')';
      bctx.fillText(s[1], x - 3, y + 4);
    });
  }

  function drawBody(now) {
    if (!glyphs) return;
    var g = glyphs, cw = bw / g.cols, ch = bh / g.rows, tick = now / 80 | 0, dk = dark(), fast = Math.hypot(S.vx, S.vy) > 300;
    ctx.clearRect(0, 0, bw, bh);
    ctx.font = '700 ' + ch.toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) {
      var c = g.cells[y * g.cols + x]; if (!c || c.L < 0.08) continue;
      var t = c.ch, col = c.green ? (dk ? '#4ade80' : '#15803d') : (dk ? 'rgba(235,235,235,' + (0.35 + 0.65 * c.L).toFixed(2) + ')' : 'rgba(25,25,25,' + (0.3 + 0.7 * c.L).toFixed(2) + ')');
      if (lens) { var dx = x * cw - lens.x, dy = y * ch - lens.y; if (dx * dx + dy * dy < 1000) { t = ((x + y + tick) & 1) ? '1' : '0'; col = dk ? '#4ade80' : '#15803d'; } }
      if (fast) t = ((x * 3 + y + tick) % 2) ? '1' : '0';
      ctx.fillStyle = col; ctx.fillText(t, x * cw, y * ch);
    }
  }

  // drag + throw
  var start = null, hist = [];
  body.addEventListener('pointerdown', function (e) {
    e.preventDefault(); body.setPointerCapture(e.pointerId);
    var r = zone.getBoundingClientRect();
    start = { ox: S.x - (e.clientX - r.left), oy: S.y - (e.clientY - r.top) }; S.mode = 'drag'; hist = []; body.classList.add('grab');
  });
  body.addEventListener('pointermove', function (e) {
    var cr = can.getBoundingClientRect(); lens = { x: e.clientX - cr.left, y: e.clientY - cr.top };
    if (!start) return;
    var r = zone.getBoundingClientRect();
    S.x = e.clientX - r.left + start.ox; S.y = e.clientY - r.top + start.oy;
    hist.push({ x: S.x, y: S.y, t: performance.now() }); if (hist.length > 6) hist.shift();
  });
  body.addEventListener('pointerleave', function () { lens = null; });
  function end() {
    if (!start) return; body.classList.remove('grab'); start = null;
    if (hist.length > 1) {
      var a = hist[0], b = hist[hist.length - 1], dt = Math.max(16, b.t - a.t) / 1000;
      S.vx = (b.x - a.x) / dt; S.vy = (b.y - a.y) / dt;
      var sp = Math.hypot(S.vx, S.vy); if (sp > 2400) { S.vx *= 2400 / sp; S.vy *= 2400 / sp; }
      S.spin = S.vx / 260;
    }
    S.mode = 'free'; S.t = 0;
  }
  body.addEventListener('pointerup', end); body.addEventListener('pointercancel', end);

  function frame(now) {
    if (!visible) return;
    var dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    var hx = W / 2, hy = H / 2 + Math.sin(now / 1200) * 6, R = bw * 0.32;
    if (S.mode === 'rest') { S.x = hx; S.y = hy; }
    else if (S.mode === 'free') {
      S.x += S.vx * dt; S.y += S.vy * dt; var d = Math.pow(0.4, dt); S.vx *= d; S.vy *= d;
      if (S.x < R) { S.x = R; S.vx = Math.abs(S.vx) * 0.7; S.spin *= -0.8; } if (S.x > W - R) { S.x = W - R; S.vx = -Math.abs(S.vx) * 0.7; S.spin *= -0.8; }
      if (S.y < R) { S.y = R; S.vy = Math.abs(S.vy) * 0.7; } if (S.y > H - R) { S.y = H - R; S.vy = -Math.abs(S.vy) * 0.7; }
      S.rot += S.spin * dt * 60; S.spin *= Math.pow(0.55, dt); S.t += dt;
      if (S.t > 2.6 || (S.t > 0.8 && Math.hypot(S.vx, S.vy) < 30)) S.mode = 'back';
    } else if (S.mode === 'back') {
      var k = 1 - Math.pow(0.03, dt); S.x += (hx - S.x) * k; S.y += (hy - S.y) * k; S.vx *= 0.8; S.vy *= 0.8;
      if (Math.hypot(hx - S.x, hy - S.y) < 1.5) S.mode = 'rest';
    }
    if (S.mode !== 'free') { S.rot = S.rot % 360; S.rot += (0 - S.rot) * Math.min(1, dt * 3); }
    body.style.transform = 'translate(' + S.x.toFixed(1) + 'px,' + S.y.toFixed(1) + 'px) translate(-50%,-50%) rotate(' + S.rot.toFixed(1) + 'deg)';
    drawBg(now); drawBody(now);
    if (!reduce || S.mode !== 'rest') requestAnimationFrame(frame); else frame.idle = true;
  }

  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var was = visible; visible = es[0].isIntersecting; if (visible && !was) { frame.last = 0; requestAnimationFrame(frame); }
  }).observe(zone);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  size(); requestAnimationFrame(frame);

  function svg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230">' +
      '<rect x="52" y="86" width="96" height="92" rx="16" fill="#9a9a9a"/>' +
      '<rect x="68" y="166" width="28" height="52" rx="12" fill="#e9e9e9"/><rect x="104" y="166" width="28" height="52" rx="12" fill="#e9e9e9"/>' +
      '<rect x="64" y="208" width="36" height="18" rx="8" fill="#8a8a8a"/><rect x="100" y="208" width="36" height="18" rx="8" fill="#8a8a8a"/>' +
      '<rect x="60" y="94" width="80" height="84" rx="22" fill="#f2f2f2"/>' +
      '<rect x="78" y="118" width="44" height="28" rx="6" fill="#6a6a6a"/>' +
      '<rect x="84" y="124" width="8" height="8" fill="#22e07a"/><rect x="96" y="124" width="8" height="8" fill="#22e07a"/><rect x="108" y="124" width="8" height="8" fill="#22e07a"/>' +
      '<path d="M64 108 Q40 122 42 150" fill="none" stroke="#e2e2e2" stroke-width="18" stroke-linecap="round"/><circle cx="42" cy="154" r="10" fill="#8a8a8a"/>' +
      '<path d="M136 108 Q160 100 166 74" fill="none" stroke="#e2e2e2" stroke-width="18" stroke-linecap="round"/><circle cx="167" cy="70" r="10" fill="#8a8a8a"/>' +
      '<circle cx="100" cy="56" r="46" fill="#f4f4f4"/>' +
      '<rect x="66" y="32" width="68" height="46" rx="21" fill="#0a0a0a"/>' +
      '<path d="M76 44 Q86 36 100 37" fill="none" stroke="#bdbdbd" stroke-width="5" stroke-linecap="round"/>' +
      '</svg>';
  }
})();
