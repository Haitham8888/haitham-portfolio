/* The flag of Saudi Arabia: all ASCII, all binary, top to bottom, and it is born like the Yurei rose.
   Intro (first time it scrolls into view, or on click):
     1. the pole grows up from the ground, binary sparks flying from its tip
     2. the cloth unfurls from the pole to the fly end, its leading edge flickering in live binary
     3. the Shahada decodes: scrambled glyphs settle into the calligraphy
     4. the sword draws itself left to right with a gleam running along the blade
   Then it lives: the wave, a light circling over the folds (pre-rendered shade levels blended per column),
   glitter and cross-shaped glints, and bits carried off the fly end. Never mirrored, never upside down. */
(function () {
  'use strict';
  var fig = document.getElementById('flag');
  if (!fig) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
  var src = new Image(); src.src = 'img/logos/saudi-flag.svg';
  var NT = 4, GREENS = [[10, 96, 52], [18, 128, 70], [34, 168, 96], [74, 214, 136]];
  var green = [], shahada = null, noise = [], sword = null, swordX0 = 0, swordX1 = 1;
  var cols = 0, rows = 0, cw = 0, ch = 0, fw = 0, fh = 0, fs = 10, W = 0, H = 0, poleW = 0, top = 0, dpr = 1, visible = false;
  var born = -1, glints = [], dust = [], bits = [], sparks = [], notes = [];

  function layer() {
    var c = document.createElement('canvas'); c.width = Math.ceil(fw * dpr); c.height = Math.ceil(fh * dpr);
    var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.font = '800 ' + fs.toFixed(2) + 'px ' + MONO; x.textBaseline = 'top';
    return [c, x];
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = fig.clientWidth;
    poleW = Math.max(10, Math.round(W * 0.03));
    fw = W - poleW - 6 - Math.round(W * 0.06);
    cols = Math.max(110, Math.min(220, Math.round(fw / 2.9)));
    cw = fw / cols; fs = cw / 0.6; ch = fs * 0.98;
    fh = fw * 2 / 3; rows = Math.round(fh / ch); fh = rows * ch;
    top = Math.round(fh * 0.06) + 6; H = Math.round(fh + top * 2 + 18);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var m = document.createElement('canvas'); m.width = cols; m.height = rows;
    var mx = m.getContext('2d', { willReadFrequently: true }); mx.drawImage(src, 0, 0, cols, rows);
    var d = mx.getImageData(0, 0, cols, rows).data, white = new Uint8Array(cols * rows);
    for (var i = 0; i < cols * rows; i++) white[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 765 > 0.5 ? 1 : 0;
    // split the white into the Shahada (upper) and the sword (lower band)
    var swordRow = Math.round(rows * 0.6);
    swordX0 = cols; swordX1 = 0;
    for (var yy = swordRow; yy < rows; yy++) for (var xx = 0; xx < cols; xx++) if (white[yy * cols + xx]) { swordX0 = Math.min(swordX0, xx); swordX1 = Math.max(swordX1, xx); }
    function hash(x, y, s) { return ((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0; }
    // green field at NT shade levels: binary only, brighter and denser in '0' where the cloth faces the light
    green = [];
    for (var lv = 0; lv < NT; lv++) {
      var L = layer(), x2 = L[1], g = GREENS[lv], shade = lv / (NT - 1);
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var h = hash(x, y, 1), v = white[y * cols + x] ? 0.7 : 0.72 + 0.28 * ((h >> 3) & 1);   // dim green under the emblem, so the cloth is whole before it appears
        x2.fillStyle = 'rgb(' + Math.round(g[0] * v) + ',' + Math.round(g[1] * v) + ',' + Math.round(g[2] * v) + ')';
        x2.fillText(((h >> 7) % 100) < 52 ? '0' : '1', x * cw, y * ch);
      }
      green.push(L[0]);
    }
    // the Shahada (final) and two scrambled versions for the decode
    function whites(rowFrom, rowTo, seed, scramble) {
      var L = layer(), x3 = L[1];
      x3.fillStyle = x3.strokeStyle = '#ffffff'; x3.lineWidth = cw * 0.14;
      for (var y3 = rowFrom; y3 < rowTo; y3++) for (var x3i = 0; x3i < cols; x3i++) {
        var k = y3 * cols + x3i, h3 = hash(x3i, y3, seed);
        if (!white[k]) { if (!scramble || (h3 % 100) > 7) continue; }
        var gch = scramble ? '01#%@$&?!<>/\\'[h3 % 14] : ((h3 >> 5) % 100 < 78 ? '0' : '1');
        x3.strokeText(gch, x3i * cw, y3 * ch); x3.fillText(gch, x3i * cw, y3 * ch);
      }
      return L[0];
    }
    shahada = whites(0, swordRow, 2, false);
    noise = [whites(0, swordRow, 3, true), whites(0, swordRow, 4, true)];
    sword = whites(swordRow, rows, 5, false);
    draw(performance.now());
  }

  function wave(c, t, ampK) {
    var u = c / cols, ph = c * 0.085 - t * 2.2, amp = fh * 0.045 * Math.pow(u, 0.8) * ampK;
    return { dy: Math.sin(ph) * amp + Math.sin(c * 0.03 - t * 1.05) * amp * 0.4, slope: (Math.cos(ph) * amp * 0.085 + Math.cos(c * 0.03 - t * 1.05) * amp * 0.012) };
  }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  function draw(now) {
    if (!green.length) return;
    var t = reduce ? 0.6 : now / 1000, dk = document.documentElement.getAttribute('data-theme') !== 'light';
    var it = born < 0 ? (reduce ? 99 : -1) : (now - born) / 1000;
    var pPole = reduce ? 1 : ease(it / 0.9), pCloth = reduce ? 1 : ease((it - 0.6) / 1.6), pShah = reduce ? 1 : ease((it - 1.7) / 1.3), pSword = reduce ? 1 : ease((it - 2.7) / 0.9);
    var ampK = 0.25 + 0.75 * pCloth;
    ctx.clearRect(0, 0, W, H);
    // the pole: a column of binary, growing from the ground
    var pfs = Math.max(9, poleW * 0.9), poleTop = H - H * pPole;
    ctx.font = '700 ' + pfs.toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    ctx.fillStyle = dk ? 'rgba(225,225,225,0.85)' : 'rgba(55,55,55,0.9)';
    for (var py = H - pfs, n = 0; py >= poleTop - pfs * 0.2; py -= pfs, n++) ctx.fillText(((n * 7 + 3) % 5) < 2 ? '0' : '1', poleW * 0.3, py);
    if (pPole > 0.98) ctx.fillText('o', poleW * 0.25, 0);
    if (it >= 0 && pPole < 1 && Math.random() < 0.8) sparks.push({ x: poleW * 0.45, y: poleTop, vx: (Math.random() - 0.3) * 60, vy: -20 - Math.random() * 50, life: 0, max: 0.5 + Math.random() * 0.5, ch: Math.random() < 0.5 ? '0' : '1' });
    if (pCloth <= 0) return;
    // the cloth, unfurled up to `reach` columns
    var la = reduce ? 0.8 : t * 0.35, Lx = Math.cos(la) * 0.8, Lz = 0.6 + 0.15 * Math.sin(la * 0.7);
    var ox = poleW + 4, sw = cw * dpr, step = 2, reach = pCloth * cols;
    var swordReach = swordX0 + (swordX1 - swordX0 + 2) * pSword, nz = (now / 70 | 0) & 1;
    for (var c = 0; c < reach; c += step) {
      var wv = wave(c, t, ampK), nx = -wv.slope / 6, nn = Math.sqrt(nx * nx + 1);
      var band = Math.sin(c / cols * 4.2 - t * 0.55) * 0.5 + 0.5, breathe = 0.5 + 0.5 * Math.sin(t * 0.8);
      var lit = Math.max(0, Math.min(1, 0.32 + 0.42 * ((nx * Lx + Lz) / nn - 0.35) * 1.8 + 0.3 * band + 0.08 * breathe)), spec = Math.pow(lit, 10) * 0.18;
      var f = lit * (NT - 1), i0 = Math.floor(f), i1 = Math.min(NT - 1, i0 + 1), a1 = f - i0;
      var x0 = ox + c * cw, w0 = cw * step + 0.5, y0 = top + wv.dy, sx0 = c * sw, sww = sw * step;
      ctx.globalAlpha = 1; ctx.drawImage(green[i0], sx0, 0, sww, green[i0].height, x0, y0, w0, fh);
      if (a1 > 0.02) { ctx.globalAlpha = a1; ctx.drawImage(green[i1], sx0, 0, sww, green[i1].height, x0, y0, w0, fh); }
      // Shahada: scrambled glyphs first, settling into the calligraphy
      if (pShah > 0) {
        if (pShah < 1) { ctx.globalAlpha = (1 - pShah) * 0.9; ctx.drawImage(noise[nz], sx0, 0, sww, noise[nz].height, x0, y0, w0, fh); }
        ctx.globalAlpha = pShah; ctx.drawImage(shahada, sx0, 0, sww, shahada.height, x0, y0, w0, fh);
      }
      // sword: drawn left to right
      if (pSword > 0 && c <= swordReach) { ctx.globalAlpha = 1; ctx.drawImage(sword, sx0, 0, sww, sword.height, x0, y0, w0, fh); }
      if (spec > 0.01) { ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,' + spec.toFixed(3) + ')'; ctx.fillRect(x0, y0, w0, fh); }
    }
    ctx.globalAlpha = 1;
    // live binary flickering at the unfurling edge
    if (pCloth < 1) {
      ctx.font = '800 ' + fs.toFixed(2) + 'px ' + MONO;
      for (var e = 0; e < 3; e++) {
        var ce = Math.floor(reach) - e; if (ce < 0) continue;
        var we = wave(ce, t, ampK);
        for (var r = 0; r < rows; r++) { ctx.globalAlpha = (1 - e / 3) * 0.9; ctx.fillStyle = Math.random() < 0.3 ? '#ffffff' : '#4ade80'; ctx.fillText(Math.random() < 0.5 ? '0' : '1', ox + ce * cw, top + we.dy + r * ch); }
      }
      ctx.globalAlpha = 1;
    }
    // the gleam running along the blade
    if (pSword > 0 && pSword < 1) {
      var gc = Math.floor(swordReach), wg = wave(gc, t, ampK);
      ctx.font = '800 ' + (fs * 1.6).toFixed(1) + 'px ' + MONO; ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.95; ctx.fillText('*', ox + gc * cw - fs * 0.3, top + wg.dy + rows * 0.66 * ch);
      ctx.globalAlpha = 1;
    }
  }

  // sparks from the growing pole, glitter, glints, bits off the fly end
  function effects(now, dt) {
    if (reduce) return;
    var t = now / 1000, dk = document.documentElement.getAttribute('data-theme') !== 'light', ox = poleW + 4;
    var it = born < 0 ? -1 : (now - born) / 1000, live = it > 3.4;
    ctx.textBaseline = 'top';
    ctx.font = '700 10px ' + MONO;
    for (var s = sparks.length - 1; s >= 0; s--) {
      var sp = sparks[s]; sp.life += dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 60 * dt;
      if (sp.life > sp.max) { sparks.splice(s, 1); continue; }
      ctx.globalAlpha = Math.sin(Math.PI * sp.life / sp.max); ctx.fillStyle = sp.ch === '1' ? '#4ade80' : (dk ? '#ffffff' : '#1e1e1e');
      ctx.fillText(sp.ch, sp.x, sp.y);
    }
    if (live) {
      if (Math.random() < dt * 10) dust.push({ c: Math.random() * cols, r: Math.random() * rows, life: 0, max: 0.35 + Math.random() * 0.5 });
      if (Math.random() < dt * 0.8) glints.push({ c: Math.random() * cols, r: Math.random() * rows, life: 0, max: 0.9 + Math.random() * 0.7, arm: 2 + ((Math.random() * 3) | 0) });
      if (bits.length < 24 && Math.random() < 0.22) { var wvb = wave(cols - 1, t, 1); bits.push({ x: ox + fw - 4, y: top + wvb.dy + Math.random() * fh, vx: 18 + Math.random() * 30, vy: -6 + Math.random() * 12, life: 0, max: 1.6 + Math.random() * 1.4, ch: Math.random() < 0.5 ? '0' : '1' }); }
    }
    ctx.font = '700 ' + Math.max(8, cw * 1.8).toFixed(1) + 'px ' + MONO; ctx.fillStyle = '#ffffff';
    for (var i = dust.length - 1; i >= 0; i--) {
      var p = dust[i]; p.life += dt; if (p.life > p.max) { dust.splice(i, 1); continue; }
      var a = Math.sin(Math.PI * p.life / p.max), wv2 = wave(p.c, t, 1);
      ctx.globalAlpha = a * 0.9; ctx.fillText(a > 0.7 ? '*' : a > 0.35 ? '+' : '.', ox + p.c * cw, top + wv2.dy + p.r * ch);
    }
    for (var j = glints.length - 1; j >= 0; j--) {
      var gl = glints[j]; gl.life += dt; if (gl.life > gl.max) { glints.splice(j, 1); continue; }
      var a2 = Math.sin(Math.PI * gl.life / gl.max), nn = Math.max(1, Math.round(gl.arm * a2)), wv3 = wave(gl.c, t, 1);
      var gx = ox + gl.c * cw, gy = top + wv3.dy + gl.r * ch, sx = cw * 1.8, sy = ch * 1.8;
      ctx.globalAlpha = a2; ctx.fillText('+', gx, gy); ctx.globalAlpha = a2 * 0.55;
      for (var k = 1; k <= nn; k++) { ctx.fillText('-', gx - k * sx, gy); ctx.fillText('-', gx + k * sx, gy); ctx.fillText('|', gx, gy - k * sy); ctx.fillText('|', gx, gy + k * sy); }
    }
    if (playing && Math.random() < dt * 3) notes.push({ x: ox + Math.random() * fw, y: top + fh * (0.2 + Math.random() * 0.6), vx: (Math.random() - 0.5) * 10, vy: -18 - Math.random() * 16, life: 0, max: 2.2 + Math.random(), ch: Math.random() < 0.5 ? '♪' : '♫' });
    ctx.font = '700 ' + Math.max(12, fs * 2.2).toFixed(1) + 'px ' + MONO;
    for (var nI = notes.length - 1; nI >= 0; nI--) {
      var no = notes[nI]; no.life += dt; no.x += no.vx * dt; no.y += no.vy * dt;
      if (no.life > no.max) { notes.splice(nI, 1); continue; }
      ctx.globalAlpha = Math.sin(Math.PI * no.life / no.max) * 0.9; ctx.fillStyle = dk ? '#ffffff' : '#14532d';
      ctx.fillText(no.ch, no.x, no.y);
    }
    ctx.font = '700 10px ' + MONO;
    for (var b = bits.length - 1; b >= 0; b--) {
      var q = bits[b]; q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.life > q.max || q.x > W) { bits.splice(b, 1); continue; }
      ctx.globalAlpha = Math.sin(Math.PI * q.life / q.max) * 0.8; ctx.fillStyle = q.ch === '1' ? '#2bb56d' : (dk ? '#ffffff' : '#1e1e1e');
      ctx.fillText(q.ch, q.x, q.y);
    }
    ctx.globalAlpha = 1;
  }

  var last = 0, running = false, hiddenAt = 0;
  function loop(now) {
    if (!visible) { running = false; return; }
    if (now - last > 33) { var dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; draw(now); effects(now, dt); }
    if (!reduce) requestAnimationFrame(loop); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function replay() { born = performance.now(); sparks = []; dust = []; glints = []; kick(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var was = visible; visible = es[0].isIntersecting;
    if (visible && (born < 0 || (!was && performance.now() - hiddenAt > 1500))) replay();
    if (!visible && was) hiddenAt = performance.now();
    if (visible) kick();
  }, { threshold: 0.35 }).observe(fig);
  else { visible = true; born = performance.now(); }
  // click: the national anthem (US Navy Band recording, public domain) plays while the flag is born again; click again to stop
  var anthem = null, playing = false;
  function toggleAnthem() {
    if (!anthem) {
      anthem = new Audio('audio/saudi-anthem.mp3'); anthem.preload = 'auto';
      anthem.addEventListener('ended', function () { playing = false; fig.classList.remove('playing'); });
    }
    if (anthem.paused) {
      anthem.currentTime = 0;
      var pr = anthem.play(); if (pr && pr.catch) pr.catch(function () { playing = false; fig.classList.remove('playing'); });
      playing = true; fig.classList.add('playing'); replay();
    } else { anthem.pause(); playing = false; fig.classList.remove('playing'); }
  }
  fig.addEventListener('click', toggleAnthem);
  fig.setAttribute('title', 'Click to play the national anthem');
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  function start() { build(); kick(); }
  if (src.complete && src.naturalWidth) start(); else src.onload = start;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (src.naturalWidth) build(); });
  window.FLAG = { redraw: function () { draw(performance.now()); }, replay: replay };
})();
