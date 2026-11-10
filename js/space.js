/* Orbit map — interactive.
   · every logo is rendered as ASCII / binary glyphs; hover runs a timing-code scramble and reveals its colour
   · grab anything (logos, tokens, the astronaut), fling it — it flies, bounces off the frame, then returns to orbit
   · the astronaut tumbles in zero-g when thrown and drifts home; his glyphs flip to binary under the cursor
   · the Saudi flag: green field in ASCII/binary glyphs, Shahada and sword drawn from the official flag, untouched,
     always upright and never thrown */
(function () {
  'use strict';
  var root = document.getElementById('space');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IC = window.ICONS || {};
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var RAMP = " .:-=+*o#%@", BIN = '01';

  var ITEMS = [
    { o: 1, a: 0.2, kind: 'img', src: 'img/logos/maysour.webp', label: 'maysour', href: 'https://maysour.com.sa/', color: '#7fb04a' },
    { o: 1, a: 1.25, kind: 'img', src: 'img/logos/hayyiz.svg', label: 'hayyiz', href: 'https://hayyizapp.com/', color: '#5b7bd6', skipWhite: true },
    { o: 1, a: 2.3, kind: 'img', src: 'img/logos/gcare.svg', label: 'g-care', href: 'https://gcare.sa/', color: '#85c1af' },
    { o: 1, a: 3.35, kind: 'img', src: 'img/MNBET.png', label: 'mnbet', href: 'https://github.com/Haitham8888/MNBET' },
    { o: 1, a: 4.4, kind: 'img', src: 'img/Sanka.png', label: 'sanka', href: 'https://github.com/Haitham8888/SANKA_Ai' },
    { o: 1, a: 5.45, kind: 'img', src: 'img/Waselani.png', label: 'waselani', href: 'https://github.com/Haitham8888/Waselani' },
    { o: 0, a: 0.0, kind: 'ico', key: 'nvidia' },
    { o: 0, a: 0.8, kind: 'ico', key: 'redhat', label: 'rhel' },
    { o: 0, a: 1.6, kind: 'ico', key: 'linux' },
    { o: 0, a: 2.4, kind: 'ico', key: 'pytorch' },
    { o: 0, a: 3.2, kind: 'ico', key: 'huggingface', label: 'hf' },
    { o: 0, a: 4.0, kind: 'ico', key: 'kubernetes', label: 'k8s' },
    { o: 0, a: 4.8, kind: 'ico', key: 'python' },
    { o: 0, a: 5.6, kind: 'ico', key: 'docker' },
    { o: 2, a: 0.5, kind: 'txt', text: 'LLM' },
    { o: 2, a: 1.55, kind: 'txt', text: 'RAG' },
    { o: 2, a: 2.6, kind: 'txt', text: 'H200' },
    { o: 2, a: 3.65, kind: 'txt', text: 'MLOps' },
    { o: 2, a: 4.7, kind: 'txt', text: 'MCP' },
    { o: 2, a: 5.75, kind: 'txt', text: 'GenAI' }
  ];
  var ORB = [{ r: 0.25, w: 0.055 }, { r: 0.36, w: 0.034 }, { r: 0.46, w: 0.022 }];
  var TILT = 0.42;

  root.innerHTML =
    '<canvas class="om-chart" aria-hidden="true"></canvas>' +
    '<div class="om-flag" aria-label="Flag of Saudi Arabia"><i class="om-pole"></i><canvas></canvas><span>KSA</span></div>' +
    '<div class="om-astro" title="drag me"><canvas aria-hidden="true"></canvas></div>' +
    '<div class="om-items"></div>' +
    '<div class="om-head" aria-hidden="true"><span>ORBIT MAP · HH-01</span><span id="om-t">T+00:00:00</span></div>' +
    '<div class="om-legend" aria-hidden="true"><span><i class="l0"></i>stack</span><span><i class="l1"></i>shipped</span><span><i class="l2"></i>practice</span><span class="om-hint">drag · throw</span></div>' +
    '<div class="om-ground"><img src="img/logos/jazan-university.png" alt="Jazan University" width="26" height="33" />' +
    '<span><b data-i="space.grad">Jazan University · B.Sc. IT (ML) · 2025</b><em>origin · jazan 16.89°N 42.55°E · khawlani coffee · al-ful</em></span></div>';

  var chart = root.querySelector('.om-chart'), cctx = chart.getContext('2d');
  var astro = root.querySelector('.om-astro'), acan = astro.querySelector('canvas'), actx = acan.getContext('2d');
  var flagBox = root.querySelector('.om-flag'), fcan = flagBox.querySelector('canvas'), fctx = fcan.getContext('2d');
  var wrap = root.querySelector('.om-items'), tEl = root.querySelector('#om-t');
  var W = 0, H = 0, dpr = 1, visible = true, t0 = performance.now(), stars = [], hoverPause = false;

  /* ---------------- glyph sprites ---------------- */
  // sample any drawable into a small grid of {char, colour, weight}
  function sampleGlyphs(draw, cols, rows, opts) {
    var c = document.createElement('canvas'); c.width = cols; c.height = rows;
    var x = c.getContext('2d', { willReadFrequently: true });
    draw(x, cols, rows);
    var d = x.getImageData(0, 0, cols, rows).data, cells = [];
    for (var i = 0, p = 0; i < cols * rows; i++, p += 4) {
      var a = d[p + 3] / 255, r = d[p], g = d[p + 1], b = d[p + 2];
      var L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (a < 0.3 || (opts && opts.skipWhite && L > 0.9)) { cells.push(null); continue; }
      var w = opts && opts.ink ? a : Math.max(0.35, a * (1 - L * 0.55));
      var col = opts && opts.tint ? opts.tint : lift(r, g, b);
      cells.push({ ch: RAMP[Math.max(3, Math.round(w * (RAMP.length - 1)))], col: col, w: w });
    }
    return { cols: cols, rows: rows, cells: cells };
  }
  // keep colours readable on black
  function lift(r, g, b) {
    var L = (0.299 * r + 0.587 * g + 0.114 * b) / 255, k = L < 0.45 ? 0.45 - L : 0;
    r = Math.round(r + (255 - r) * k * 1.4); g = Math.round(g + (255 - g) * k * 1.4); b = Math.round(b + (255 - b) * k * 1.4);
    return 'rgb(' + Math.min(255, r) + ',' + Math.min(255, g) + ',' + Math.min(255, b) + ')';
  }

  function paintSprite(n, now) {
    var s = n.sprite; if (!s) return;
    var ctx = n.ctx, S = n.size, cw = S / s.cols, ch = S / s.rows, hot = n.hot || n.mode !== 'orbit';
    var scr = now < n.scrambleUntil, speed = Math.hypot(n.vx || 0, n.vy || 0);
    ctx.clearRect(0, 0, S, S);
    ctx.font = '700 ' + (ch * 1.05).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    for (var y = 0; y < s.rows; y++) for (var x = 0; x < s.cols; x++) {
      var c = s.cells[y * s.cols + x]; if (!c) continue;
      var g = c.ch;
      if (scr && Math.random() < (n.scrambleUntil - now) / 420) g = BIN[(Math.random() * 2) | 0];
      else if (speed > 260) g = ((x + y + (now / 60 | 0)) & 1) ? '1' : '0';
      ctx.globalAlpha = hot ? 0.55 + 0.45 * c.w : 0.35 + 0.5 * c.w;
      ctx.fillStyle = hot ? c.col : '#d9d9d9';
      ctx.fillText(g, x * cw + cw * 0.1, y * ch);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------- items ---------------- */
  var nodes = ITEMS.map(function (it) {
    var el = document.createElement('span');
    el.className = 'om-item om-' + it.kind + ' o' + it.o;
    var label = it.label || (it.key && IC[it.key] && IC[it.key].n.toLowerCase()) || it.text;
    el.setAttribute('aria-label', label + (it.href ? ' — open' : ''));
    if (it.href) { el.tabIndex = 0; el.setAttribute('role', 'link'); }
    var n = { it: it, el: el, a: it.a, mode: 'orbit', x: 0, y: 0, vx: 0, vy: 0, hot: false, scrambleUntil: 0, size: 0, ctx: null, sprite: null, freeT: 0 };
    if (it.kind === 'txt') el.innerHTML = '<span class="om-tick"></span>';
    else {
      n.size = it.kind === 'img' ? 52 : 40;
      var cv = document.createElement('canvas'); cv.className = 'om-glyph';
      cv.width = n.size * 2; cv.height = n.size * 2; cv.style.width = cv.style.height = n.size + 'px';
      n.ctx = cv.getContext('2d'); n.ctx.setTransform(2, 0, 0, 2, 0, 0);
      el.appendChild(cv);
      var cols = it.kind === 'img' ? 15 : 12;
      if (it.kind === 'ico' && IC[it.key]) {
        var path = new Path2D(IC[it.key].d);
        n.sprite = sampleGlyphs(function (x, w, h) { x.scale(w / 24, h / 24); x.fillStyle = '#fff'; x.fill(path); }, cols, cols, { ink: true, tint: lift.apply(null, hex(IC[it.key].hex)) });
      } else {
        var img = new Image();
        img.onload = function () {
          n.sprite = sampleGlyphs(function (x, w, h) {
            var r = Math.min(w / img.naturalWidth, h / img.naturalHeight), iw = img.naturalWidth * r, ih = img.naturalHeight * r;
            x.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
          }, cols, cols, { skipWhite: true });
          paintSprite(n, performance.now());
        };
        img.src = it.src;
      }
    }
    el.insertAdjacentHTML('beforeend', '<span class="om-lab">' + label + '</span>');
    el.addEventListener('mouseenter', function () { n.hot = true; n.scrambleUntil = performance.now() + 420; el.classList.add('hot'); hoverPause = true; });
    el.addEventListener('mouseleave', function () { n.hot = false; el.classList.remove('hot'); hoverPause = false; });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && it.href) window.open(it.href, '_blank', 'noopener'); });
    draggable(el, n);
    wrap.appendChild(el);
    return n;
  });
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }

  /* ---------------- drag + throw ---------------- */
  function draggable(el, n) {
    var hist = [], start = null;
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      var r = root.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, ox: n.x - (e.clientX - r.left), oy: n.y - (e.clientY - r.top), moved: false };
      n.mode = 'drag'; n.vx = n.vy = 0; hist = [];
      el.classList.add('grab');
    });
    el.addEventListener('pointermove', function (e) {
      if (!start) return;
      var r = root.getBoundingClientRect();
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) start.moved = true;
      n.x = e.clientX - r.left + start.ox; n.y = e.clientY - r.top + start.oy;
      hist.push({ x: n.x, y: n.y, t: performance.now() }); if (hist.length > 6) hist.shift();
    });
    function end() {
      if (!start) return;
      el.classList.remove('grab');
      if (!start.moved) { n.mode = n.home ? 'home' : 'return'; if (n.it && n.it.href) window.open(n.it.href, '_blank', 'noopener'); start = null; return; }
      if (hist.length > 1) {
        var a = hist[0], b = hist[hist.length - 1], dt = Math.max(16, b.t - a.t) / 1000;
        n.vx = (b.x - a.x) / dt; n.vy = (b.y - a.y) / dt;
        var sp = Math.hypot(n.vx, n.vy); if (sp > 2600) { n.vx *= 2600 / sp; n.vy *= 2600 / sp; }
      }
      if (n.spin !== undefined) n.spin = (n.vx / 900) * 4;
      n.mode = 'free'; n.freeT = 0; start = null;
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  function physics(n, dt, tx, ty, R) {
    if (n.mode === 'free') {
      n.x += n.vx * dt; n.y += n.vy * dt;
      var damp = Math.pow(0.35, dt); n.vx *= damp; n.vy *= damp;
      if (n.x < R) { n.x = R; n.vx = Math.abs(n.vx) * 0.7; } if (n.x > W - R) { n.x = W - R; n.vx = -Math.abs(n.vx) * 0.7; }
      if (n.y < R) { n.y = R; n.vy = Math.abs(n.vy) * 0.7; } if (n.y > H - R) { n.y = H - R; n.vy = -Math.abs(n.vy) * 0.7; }
      n.freeT += dt;
      if (n.freeT > 2.4 || (n.freeT > 0.6 && Math.hypot(n.vx, n.vy) < 30)) n.mode = n.home ? 'home' : 'return';
    } else if (n.mode === 'return' || n.mode === 'home') {
      var k = 1 - Math.pow(0.02, dt);
      n.x += (tx - n.x) * k; n.y += (ty - n.y) * k; n.vx *= 0.8; n.vy *= 0.8;
      if (Math.hypot(tx - n.x, ty - n.y) < 1.5) n.mode = n.home ? 'rest' : 'orbit';
    }
  }

  /* ---------------- astronaut ---------------- */
  var A = { el: astro, home: true, mode: 'rest', x: 0, y: 0, vx: 0, vy: 0, rot: 0, spin: 0, glyphs: null, bw: 0, bh: 0, lens: null };
  draggable(astro, A);
  astro.addEventListener('pointermove', function (e) { var r = acan.getBoundingClientRect(); A.lens = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  astro.addEventListener('pointerleave', function () { A.lens = null; });

  function buildAstro() {
    A.bw = Math.min(W * 0.36, 210); A.bh = A.bw * 230 / 200;
    var img = new Image();
    img.onload = function () {
      var cols = Math.round(A.bw / 3.5), rows = Math.round(cols * (A.bh / A.bw) * 0.6 / 1.02);
      A.glyphs = sampleGlyphs(function (x, w, h) { x.drawImage(img, 0, 0, w, h); }, cols, rows, {});
      A.glyphs.cells.forEach(function (c, i) {
        if (!c) return;
        var m = /rgb\((\d+),(\d+),(\d+)\)/.exec(c.col), L = (+m[1] + +m[2] + +m[3]) / 765;
        c.green = +m[2] > 170 && +m[1] < 150;
        c.ch = RAMP[Math.max(1, Math.round(L * (RAMP.length - 1)))]; c.L = L;
      });
      acan.width = A.bw * dpr; acan.height = A.bh * dpr; acan.style.width = A.bw + 'px'; acan.style.height = A.bh + 'px';
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(astroSVG());
  }
  function paintAstro(now) {
    var g = A.glyphs; if (!g) return;
    var cw = A.bw / g.cols, ch = A.bh / g.rows, tick = now / 80 | 0, fast = Math.hypot(A.vx, A.vy) > 300;
    actx.clearRect(0, 0, A.bw, A.bh);
    actx.font = '700 ' + (ch * 1.0).toFixed(1) + 'px ' + MONO; actx.textBaseline = 'top';
    for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) {
      var c = g.cells[y * g.cols + x]; if (!c || c.L < 0.08) continue;
      var ch2 = c.ch, col = c.green ? '#4ade80' : 'rgba(235,235,235,' + (0.35 + 0.65 * c.L).toFixed(2) + ')';
      if (A.lens) { var dx = x * cw - A.lens.x, dy = y * ch - A.lens.y; if (dx * dx + dy * dy < 900) { ch2 = ((x + y + tick) & 1) ? '1' : '0'; col = '#4ade80'; } }
      if (fast) ch2 = ((x * 3 + y + tick) % 2) ? '1' : '0';
      actx.fillStyle = col; actx.fillText(ch2, x * cw, y * ch);
    }
  }

  /* ---------------- Saudi flag (fixed, upright) ---------------- */
  var flagWhite = new Image(); flagWhite.src = 'img/logos/saudi-flag-white.svg';
  var FG = ['#005430', '#006c35', '#0a7a40', '#004a2a'];
  function flagSize() {
    var fw = Math.round(Math.min(W * 0.26, 150)), fh = Math.round(fw * 2 / 3);
    fcan.width = fw * dpr; fcan.height = fh * dpr; fcan.style.width = fw + 'px'; fcan.style.height = fh + 'px';
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0); flagBox.style.setProperty('--fh', fh + 'px');
  }
  function paintFlag(now) {
    var fw = parseFloat(fcan.style.width), fh = parseFloat(fcan.style.height); if (!fw) return;
    var fs = 7, cw = fs * 0.6, ch = fs * 1.05, cols = Math.ceil(fw / cw), rows = Math.ceil(fh / ch), tick = now / 140 | 0;
    fctx.fillStyle = '#004d2c'; fctx.fillRect(0, 0, fw, fh);
    fctx.font = '700 ' + fs + 'px ' + MONO; fctx.textBaseline = 'top';
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var h = (x * 73856093 ^ y * 19349663 ^ (tick + x * 7) * 83492791) >>> 0;
      fctx.fillStyle = FG[h % 4]; fctx.globalAlpha = 0.9;
      fctx.fillText((h >> 3) & 1 ? '1' : '0', x * cw, y * ch);
    }
    fctx.globalAlpha = 1;
    if (flagWhite.complete && flagWhite.naturalWidth) fctx.drawImage(flagWhite, 0, 0, fw, fh); // Shahada + sword, exactly as the flag
  }

  /* ---------------- chart ---------------- */
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth; H = root.clientHeight;
    chart.width = W * dpr; chart.height = H * dpr; chart.style.width = W + 'px'; chart.style.height = H + 'px';
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = []; var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0, n = Math.round(W * H / 5200); i < n; i++) stars.push([rnd() * W, rnd() * H, rnd()]);
    buildAstro(); flagSize();
    A.x = W / 2; A.y = H * 0.47;
  }
  function drawChart() {
    var cx = W / 2, cy = H * 0.5;
    cctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) { var s = stars[i]; cctx.fillStyle = 'rgba(255,255,255,' + (0.12 + s[2] * 0.35).toFixed(2) + ')'; cctx.fillRect(s[0], s[1], s[2] > 0.85 ? 1.4 : 0.8, s[2] > 0.85 ? 1.4 : 0.8); }
    cctx.strokeStyle = 'rgba(255,255,255,0.045)'; cctx.lineWidth = 1;
    cctx.beginPath(); cctx.moveTo(cx, 34); cctx.lineTo(cx, H - 60); cctx.moveTo(18, cy); cctx.lineTo(W - 18, cy); cctx.stroke();
    ORB.forEach(function (o, k) {
      var rx = o.r * W, ry = rx * TILT;
      cctx.setLineDash(k === 2 ? [2, 5] : []);
      cctx.strokeStyle = 'rgba(255,255,255,' + (k === 1 ? 0.16 : 0.1) + ')';
      cctx.beginPath(); cctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); cctx.stroke();
      cctx.setLineDash([]);
      for (var d = 0; d < 12; d++) { var a = d / 12 * Math.PI * 2; cctx.fillStyle = 'rgba(255,255,255,0.18)'; cctx.fillRect(cx + Math.cos(a) * rx - 0.5, cy + Math.sin(a) * ry - 0.5, 1.5, 1.5); }
    });
    // tether lines to anything that has been thrown
    nodes.forEach(function (n) {
      if (n.mode === 'orbit') return;
      var p = orbitPos(n, n.a);
      cctx.setLineDash([2, 4]); cctx.strokeStyle = 'rgba(74,222,128,0.35)';
      cctx.beginPath(); cctx.moveTo(p.x, p.y); cctx.lineTo(n.x, n.y); cctx.stroke(); cctx.setLineDash([]);
    });
    cctx.font = '400 9px ' + MONO; cctx.fillStyle = 'rgba(255,255,255,0.28)';
    cctx.fillText('0°', cx + ORB[2].r * W - 16, cy - 6);
    cctx.fillText('180°', cx - ORB[2].r * W + 4, cy - 6);
  }
  function orbitPos(n, ang) {
    var o = ORB[n.it.o], rx = o.r * W, ry = rx * TILT;
    return { x: W / 2 + Math.cos(ang) * rx, y: H * 0.5 + Math.sin(ang) * ry, s: Math.sin(ang) };
  }

  function frame(now) {
    if (!visible) return;
    var dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    if (!hoverPause && !reduce) nodes.forEach(function (n) { n.a += ORB[n.it.o].w * dt; });
    drawChart();
    nodes.forEach(function (n) {
      var p = orbitPos(n, n.a);
      if (n.mode === 'orbit') { n.x = p.x; n.y = p.y; }
      else physics(n, dt, p.x, p.y, (n.size || 16) / 2);
      var free = n.mode !== 'orbit', depth = 0.5 + 0.5 * p.s, front = free || p.s > -0.05;
      var sc = free ? 1.08 : 0.82 + 0.22 * depth;
      n.el.style.transform = 'translate(' + n.x.toFixed(1) + 'px,' + n.y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
      n.el.style.zIndex = free ? 60 : front ? 20 + Math.round(depth * 10) : 2;
      n.el.style.opacity = (front ? 0.8 + 0.2 * depth : 0.3 + 0.3 * depth).toFixed(2);
      n.el.classList.toggle('far', !front);
      if (n.sprite) paintSprite(n, now);
    });
    // astronaut
    var hx = W / 2, hy = H * 0.47 + Math.sin(now / 1100) * 5;
    if (A.mode === 'rest') { A.x = hx; A.y = hy; A.rot *= 0.9; }
    else physics(A, dt, hx, hy, A.bw * 0.35);
    if (A.mode === 'free') A.rot += A.spin * dt * 60; else A.rot += (0 - A.rot) * Math.min(1, dt * 3);
    A.spin *= Math.pow(0.5, dt);
    astro.style.transform = 'translate(' + A.x.toFixed(1) + 'px,' + A.y.toFixed(1) + 'px) translate(-50%,-50%) rotate(' + A.rot.toFixed(1) + 'deg)';
    astro.style.zIndex = A.mode === 'rest' ? 10 : 55;
    paintAstro(now);
    if ((now / 140 | 0) !== frame.ft) { frame.ft = now / 140 | 0; paintFlag(now); }
    var s = Math.floor((now - t0) / 1000);
    tEl.textContent = 'T+' + [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (v) { return (v < 10 ? '0' : '') + v; }).join(':');
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var was = visible; visible = es[0].isIntersecting; if (visible && !was) { frame.last = 0; requestAnimationFrame(frame); }
  }).observe(root);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  flagWhite.onload = function () { paintFlag(performance.now()); };
  size();
  requestAnimationFrame(frame);

  // original astronaut drawing (no flag — the flag stands on its own pole)
  function astroSVG() {
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
