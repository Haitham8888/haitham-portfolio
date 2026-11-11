/* The flag of Saudi Arabia, written in binary and woven glyph by glyph.
   Every digit is its own thread: it rides the wave on its own, and the folds shade it, so the
   cloth moves like cloth instead of sliding strips. Calm deep greens, easy on the eyes.

   Born like the Yurei rose (first time in view, on return, or on click):
     1. the pole rises
     2. the cloth unfurls from the pole, a soft green edge leading it
     3. the Shahada is written right to left, the way Arabic is written
     4. the sword is drawn from hilt to tip
   Then it lives: a slow wave, light moving across the folds, and wind from your hand: move the
   cursor over the cloth and a gust runs through it. Click plays the national anthem (and a stronger gust).
   The flag is never mirrored and never upside down. */
(function () {
  'use strict';
  var fig = document.getElementById('flag');
  if (!fig) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
  var src = new Image(); src.src = 'img/logos/saudi-flag.svg';
  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

  var W = 0, H = 0, dpr = 1, poleW = 0, ox = 0, top = 0, fw = 0, fh = 0;
  var cols = 0, rows = 0, cw = 0, ch = 0, fs = 10, FX = 3;
  var cloth = [], emblem = [], swordRow = 0, emX0 = 0, emX1 = 1, swX0 = 0, swX1 = 1;
  var dyC, litC, born = -1, visible = false, gusts = [], dust = [], notes = [], mouse = null;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = fig.clientWidth;
    poleW = Math.max(8, Math.round(W * 0.022));
    ox = poleW + 6;
    fw = W - ox - Math.round(W * 0.05);
    cols = Math.max(64, Math.min(150, Math.round(fw / 5.4)));
    cw = fw / cols; fs = cw / 0.6; ch = fs * 0.98;
    fh = fw * 2 / 3; rows = Math.round(fh / ch); fh = rows * ch;
    top = Math.round(fh * 0.075) + 8; H = Math.round(fh + top * 2 + 6);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dyC = new Float32Array(cols * FX + 2); litC = new Float32Array(cols * FX + 2);

    // the emblem is sampled twice as fine as the cloth, so the calligraphy stays crisp
    var c2 = cols * FX, r2 = rows * FX, m = document.createElement('canvas'); m.width = c2; m.height = r2;
    var mx = m.getContext('2d', { willReadFrequently: true }); mx.imageSmoothingQuality = 'high'; mx.drawImage(src, 0, 0, c2, r2);
    var d = mx.getImageData(0, 0, c2, r2).data;
    function white(x, y) { var p = (y * c2 + x) * 4; return (d[p] + d[p + 1] + d[p + 2]) / 765 > 0.5; }
    function hash(x, y, s) { return ((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0; }
    swordRow = Math.round(r2 * 0.6);
    emblem = []; emX0 = c2; emX1 = 0; swX0 = c2; swX1 = 0;
    for (var y = 0; y < r2; y++) for (var x = 0; x < c2; x++) {
      if (!white(x, y)) continue;
      var sw = y >= swordRow, h = hash(x, y, 2);
      emblem.push({ x: x, y: y, g: (h >> 5) % 100 < 70 ? '0' : '1', s: sw });
      if (sw) { if (x < swX0) swX0 = x; if (x > swX1) swX1 = x; } else { if (x < emX0) emX0 = x; if (x > emX1) emX1 = x; }
    }
    emblem.sort(function (a, b) { return a.x - b.x; });
    // cloth cells: skipped where the emblem fully covers them
    cloth = [];
    for (var cy = 0; cy < rows; cy++) for (var cx = 0; cx < cols; cx++) {
      var cover = 0; for (var j = 0; j < FX; j++) for (var i = 0; i < FX; i++) if (white(cx * FX + i, cy * FX + j)) cover++;
      var hh = hash(cx, cy, 1);
      cloth.push({ x: cx, y: cy, g: (hh >> 7) & 1 ? '1' : '0', v: ((hh >> 3) & 7) / 7, under: cover >= FX * FX - 1 });
    }
    cloth.sort(function (a, b) { return a.x - b.x; });
    frame(performance.now(), 0);
  }

  function ease(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }

  function frame(now, dt) {
    if (!cloth.length) return;
    var dk = dark(), t = reduce ? 0.6 : now / 1000;
    var it = born < 0 ? (reduce ? 99 : -1) : (now - born) / 1000;
    var pPole = reduce ? 1 : ease(it / 0.7), pCloth = reduce ? 1 : ease((it - 0.45) / 1.5), pShah = reduce ? 1 : ease((it - 1.7) / 1.6), pSword = reduce ? 1 : ease((it - 3.1) / 0.7);
    ctx.clearRect(0, 0, W, H);

    // pole
    var pTop = H - (H - 2) * pPole, pcol = dk ? 'rgba(210,214,220,0.75)' : 'rgba(60,64,70,0.85)';
    ctx.fillStyle = pcol; ctx.fillRect(Math.round(poleW * 0.45), pTop, Math.max(2, poleW * 0.22), H - pTop);
    if (pPole > 0.97) { ctx.beginPath(); ctx.arc(poleW * 0.45 + Math.max(2, poleW * 0.22) / 2, 4, Math.max(2.5, poleW * 0.3), 0, Math.PI * 2); ctx.fill(); }
    if (pCloth <= 0) return;

    // wave + light per fine column (cloth uses every FX-th one)
    var n = cols * FX, ampK = 0.3 + 0.7 * pCloth, la = t * 0.3, lightX = Math.cos(la) * 0.85;
    for (var g = gusts.length - 1; g >= 0; g--) { gusts[g].age += dt; if (gusts[g].age > 2.6) gusts.splice(g, 1); }
    for (var c = 0; c <= n; c++) {
      var u = c / n, cc = c / FX, amp = fh * 0.05 * Math.pow(u, 0.85) * ampK;
      var p1 = cc * 0.075 - t * 1.55, p2 = cc * 0.031 - t * 0.74 + 1.3;
      var dy = Math.sin(p1) * amp + Math.sin(p2) * amp * 0.45;
      var sl = Math.cos(p1) * amp * 0.075 + Math.cos(p2) * amp * 0.45 * 0.031;
      for (var q = 0; q < gusts.length; q++) {
        var G = gusts[q], dist = cc - G.c - G.age * 26, env = Math.exp(-dist * dist / 90) * Math.exp(-G.age * 1.1) * G.amp * (0.25 + 0.75 * u);
        dy += Math.sin(dist * 0.45) * env * fh * 0.05; sl += Math.cos(dist * 0.45) * env * fh * 0.05 * 0.45;
      }
      dyC[c] = dy;
      var nx = -sl / (cw * 1.1), nn = Math.sqrt(nx * nx + 1);
      var band = 0.5 + 0.5 * Math.sin(u * 4.4 - t * 0.5);
      litC[c] = Math.max(0, Math.min(1, 0.36 + 0.5 * ((nx * lightX + 0.62) / nn - 0.28) * 1.7 + 0.2 * band));
    }

    var reach = pCloth * cols, edgeW = 3.5;
    // body of the cloth: a quiet backing so the weave reads as fabric (and the Shahada stays legible in light mode)
    for (var bc = 0; bc < reach; bc++) {
      var L0 = litC[bc * FX], bx = ox + bc * cw, by = top + dyC[bc * FX];
      ctx.fillStyle = dk ? 'rgba(' + Math.round(4 + 8 * L0) + ',' + Math.round(34 + 30 * L0) + ',' + Math.round(20 + 18 * L0) + ',0.92)' : 'rgb(' + Math.round(6 + 10 * L0) + ',' + Math.round(74 + 40 * L0) + ',' + Math.round(40 + 24 * L0) + ')';
      ctx.fillRect(bx, by, cw + 0.6, fh);
    }
    // the weave: one digit per thread
    ctx.font = '700 ' + fs.toFixed(2) + 'px ' + MONO; ctx.textBaseline = 'top';
    var lastC = -1, R0 = 0, G0 = 0, B0 = 0, yy = 0, xx = 0, front = false;
    for (var i = 0; i < cloth.length; i++) {
      var k = cloth[i]; if (k.x >= reach) break;
      if (k.x !== lastC) {
        lastC = k.x; var Lc = litC[k.x * FX]; yy = top + dyC[k.x * FX]; xx = ox + k.x * cw;
        front = pCloth < 1 && reach - k.x < edgeW;
        if (dk) { R0 = 16 + 44 * Lc; G0 = 104 + 104 * Lc; B0 = 62 + 62 * Lc; } else { R0 = 34 + 52 * Lc; G0 = 132 + 62 * Lc; B0 = 78 + 46 * Lc; }
      }
      if (k.under && pShah >= 1) continue;
      var a = (front ? 1 : 0.58 + 0.42 * k.v);
      ctx.globalAlpha = a;
      ctx.fillStyle = front ? (dk ? '#86efac' : '#f0fdf4') : 'rgb(' + (R0 | 0) + ',' + (G0 | 0) + ',' + (B0 | 0) + ')';
      ctx.fillText(front ? ((now / 70 + k.y) | 0) & 1 ? '1' : '0' : k.g, xx, yy + k.y * ch);
    }
    ctx.globalAlpha = 1;

    // the Shahada, written right to left; then the sword, hilt to tip
    if (pShah > 0) {
      var fsF = fs / FX, cwF = cw / FX, chF = ch / FX;
      ctx.font = '800 ' + fsF.toFixed(2) + 'px ' + MONO;
      var penS = emX1 - (emX1 - emX0 + 6) * pShah, penW = swX1 - (swX1 - swX0 + 6) * pSword;
      for (var e = 0; e < emblem.length; e++) {
        var m = emblem[e], pen = m.s ? penW : penS, pr = m.s ? pSword : pShah;
        if (pr <= 0 || m.x < pen) continue;
        if (m.x / FX >= reach) continue;
        var Le = litC[m.x], wet = pr < 1 && m.x - pen < 5;
        var wv = Math.round(226 + 29 * Le);
        ctx.fillStyle = wet ? (dk ? '#bbf7d0' : '#dcfce7') : 'rgb(' + wv + ',' + wv + ',' + wv + ')';
        var ex = ox + m.x * cwF, ey = top + dyC[m.x] + m.y * chF;
        ctx.fillText(m.g, ex, ey); ctx.fillText(m.g, ex + 0.3, ey);      // a second pass thickens the stroke
      }
    }

    if (reduce) return;
    // glitter: a few soft sparks on the lit folds
    if (it > 3.8 && Math.random() < dt * 5) dust.push({ c: Math.random() * cols, r: Math.random() * rows, life: 0, max: 0.5 + Math.random() * 0.6 });
    ctx.font = '700 ' + (fs * 1.1).toFixed(1) + 'px ' + MONO; ctx.fillStyle = '#ffffff';
    for (var s = dust.length - 1; s >= 0; s--) {
      var p = dust[s]; p.life += dt; if (p.life > p.max) { dust.splice(s, 1); continue; }
      var al = Math.sin(Math.PI * p.life / p.max);
      ctx.globalAlpha = al * 0.75; ctx.fillText(al > 0.7 ? '*' : al > 0.35 ? '+' : '.', ox + p.c * cw, top + dyC[Math.round(p.c) * FX] + p.r * ch);
    }
    // music notes while the anthem plays
    if (playing && Math.random() < dt * 3) notes.push({ x: ox + Math.random() * fw, y: top + fh * (0.15 + Math.random() * 0.6), vx: (Math.random() - 0.5) * 10, vy: -18 - Math.random() * 16, life: 0, max: 2.2 + Math.random(), ch: Math.random() < 0.5 ? '♪' : '♫' });
    ctx.font = '700 ' + Math.max(13, fs * 1.8).toFixed(1) + 'px ' + MONO;
    for (var ni = notes.length - 1; ni >= 0; ni--) {
      var no = notes[ni]; no.life += dt; no.x += no.vx * dt; no.y += no.vy * dt;
      if (no.life > no.max) { notes.splice(ni, 1); continue; }
      ctx.globalAlpha = Math.sin(Math.PI * no.life / no.max) * 0.9; ctx.fillStyle = '#ffffff'; ctx.fillText(no.ch, no.x, no.y);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- wind from the cursor ----------
  function colAt(e) { var r = canvas.getBoundingClientRect(); return (e.clientX - r.left - ox) / cw; }
  canvas.addEventListener('pointermove', function (e) {
    var c = colAt(e), now = performance.now();
    if (c < 0 || c > cols) { mouse = null; return; }
    if (mouse) {
      var sp = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y) / Math.max(8, now - mouse.t);      // px per ms
      if (sp > 0.25 && now - (mouse.last || 0) > 140 && gusts.length < 5) { gusts.push({ c: c, age: 0, amp: Math.min(1.5, 0.5 + sp * 0.7) }); mouse.last = now; }
    }
    mouse = { x: e.clientX, y: e.clientY, t: now, last: mouse ? mouse.last : 0 };
  });
  canvas.addEventListener('pointerleave', function () { mouse = null; });

  // ---------- the anthem ----------
  var anthem = null, playing = false;
  function toggleAnthem(e) {
    if (!anthem) {
      anthem = new Audio('audio/saudi-anthem.mp3'); anthem.preload = 'auto';
      anthem.addEventListener('ended', function () { playing = false; fig.classList.remove('playing'); });
    }
    gusts.push({ c: e && e.clientX ? Math.max(0, colAt(e)) : 0, age: 0, amp: 1.6 });
    if (anthem.paused) {
      anthem.currentTime = 0;
      var pr = anthem.play(); if (pr && pr.catch) pr.catch(function () { playing = false; fig.classList.remove('playing'); });
      playing = true; fig.classList.add('playing'); replay();
    } else { anthem.pause(); playing = false; fig.classList.remove('playing'); }
  }
  fig.addEventListener('click', toggleAnthem);
  fig.setAttribute('title', 'Click to play the national anthem');

  // ---------- loop ----------
  var last = 0, running = false, hiddenAt = 0;
  function loop(now) {
    if (!visible) { running = false; return; }
    if (now - last > 30) { var dt = Math.min(0.08, (now - (last || now)) / 1000); last = now; frame(now, dt); }
    if (!reduce) requestAnimationFrame(loop); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function replay() { born = performance.now(); dust = []; kick(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var was = visible; visible = es[0].isIntersecting;
    if (visible && (born < 0 || (!was && performance.now() - hiddenAt > 1500))) replay();
    if (!visible && was) hiddenAt = performance.now();
    if (visible) kick();
  }, { threshold: 0.35 }).observe(fig);
  else { visible = true; born = performance.now(); }
  new MutationObserver(function () { frame(performance.now(), 0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  function start() { build(); kick(); }
  if (src.complete && src.naturalWidth) start(); else src.onload = start;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (src.naturalWidth) build(); });
  window.FLAG = { redraw: function () { frame(performance.now(), 0); }, replay: replay, gust: function (c, a) { gusts.push({ c: c || 0, age: 0, amp: a || 1 }); } };
})();
