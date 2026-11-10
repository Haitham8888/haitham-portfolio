/* The flag of Saudi Arabia, fully ASCII, waving, lit like the Yurei rose.
   Every cell is a character in the flag's own colours. The green field uses the rose's glyph bands
   (sparse to dense letters and numbers); the Shahada and the sword stay in bold dense white glyphs,
   with contour glyphs ( / \ | _ - ) along their edges so they read clearly.
   A light circles slowly over the cloth: every fold of the wave catches it, and the glyph density and
   green shade follow (pre-rendered shade levels, blended per column, so it stays fast).
   Glitter twinkles and cross-shaped glints come and go. Never mirrored, never upside down. */
(function () {
  'use strict';
  var fig = document.getElementById('flag');
  if (!fig) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
  var src = new Image(); src.src = 'img/logos/saudi-flag.svg';
  var GROUPS = [".'`", ",:;", "-~^", "=+<>", "ilr!1", "cvxz7", "tjfJ?", "nuoe23", "sa5S4Z", "kbdpq9X", "AGh6&%", "UOQ0#D", "$8B@MW"];
  var NG = GROUPS.length, WHITE = '$8B@MW#%&', NT = 4;
  // green ramp per shade level: deep shadow -> lit cloth
  var GREENS = [[0, 52, 28], [6, 92, 50], [22, 140, 78], [56, 196, 118]];
  var tex = [], cols = 0, rows = 0, cw = 0, ch = 0, fw = 0, fh = 0, W = 0, H = 0, poleW = 0, top = 0, dpr = 1, visible = true;
  var glints = [], dust = [], bits = [];

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = fig.clientWidth;
    poleW = Math.max(10, Math.round(W * 0.03));
    fw = W - poleW - 6 - Math.round(W * 0.06);
    cols = Math.max(170, Math.min(340, Math.round(fw / 2.1)));
    cw = fw / cols; var fs = cw / 0.6; ch = fs * 0.98;
    fh = fw * 2 / 3; rows = Math.round(fh / ch); fh = rows * ch;
    top = Math.round(fh * 0.06) + 6; H = Math.round(fh + top * 2 + 18);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // flag mask at grid resolution
    var m = document.createElement('canvas'); m.width = cols; m.height = rows;
    var mx = m.getContext('2d', { willReadFrequently: true }); mx.drawImage(src, 0, 0, cols, rows);
    var d = mx.getImageData(0, 0, cols, rows).data, white = new Uint8Array(cols * rows), lumA = new Float32Array(cols * rows);
    for (var i = 0; i < cols * rows; i++) { var L = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 765; lumA[i] = L; white[i] = L > 0.5 ? 1 : 0; }
    // contours of the emblem: where white meets green, glyph follows the edge direction
    var edge = new Int8Array(cols * rows);   // -1 none, 0 '-', 1 '/', 2 '|', 3 '\', 4 '_'
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var k = y * cols + x; edge[k] = -1;
      if (!white[k]) continue;
      var l = x > 0 ? lumA[k - 1] : 0, r = x < cols - 1 ? lumA[k + 1] : 0, u = y > 0 ? lumA[k - cols] : 0, dn = y < rows - 1 ? lumA[k + cols] : 0;
      if (l > 0.5 && r > 0.5 && u > 0.5 && dn > 0.5) continue;
      var gx = r - l, gy = dn - u;
      var ang = (Math.atan2(gx, -gy) * 180 / Math.PI + 180) % 180;
      edge[k] = (ang < 22.5 || ang >= 157.5) ? (gy > 0 ? 4 : 0) : ang < 67.5 ? 1 : ang < 112.5 ? 2 : 3;
    }
    var EG = ['-', '/', '|', '\\', '_'];
    // pre-render the cloth at NT shade levels; each frame blends them column by column
    tex = [];
    for (var lv = 0; lv < NT; lv++) {
      var c = document.createElement('canvas'); c.width = Math.ceil(fw * dpr); c.height = Math.ceil(fh * dpr);
      var x2 = c.getContext('2d'); x2.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = GREENS[lv];
      x2.fillStyle = 'rgb(' + Math.round(g[0] * 0.55) + ',' + Math.round(g[1] * 0.55) + ',' + Math.round(g[2] * 0.55) + ')'; x2.fillRect(0, 0, fw, fh);
      x2.font = '800 ' + fs.toFixed(2) + 'px ' + MONO; x2.textBaseline = 'top';
      var shade = lv / (NT - 1);
      for (var yy = 0; yy < rows; yy++) for (var xx = 0; xx < cols; xx++) {
        var kk = yy * cols + xx, h = ((xx * 73856093) ^ (yy * 19349663)) >>> 0;
        if (white[kk]) {
          var wv = Math.round(214 + 41 * shade);
          x2.fillStyle = x2.strokeStyle = 'rgb(' + wv + ',' + wv + ',' + wv + ')';
          x2.lineWidth = cw * 0.3;
          var gch = edge[kk] >= 0 ? EG[edge[kk]] : WHITE[h % WHITE.length];
          x2.strokeText(gch, xx * cw, yy * ch); x2.fillText(gch, xx * cw, yy * ch);
        } else {
          // green field: the rose's bands, denser where the cloth faces the light
          var t = Math.min(0.999, 0.18 + 0.62 * shade + ((h >> 7) & 7) * 0.012);
          var grp = GROUPS[Math.floor(t * NG)], v = 0.75 + 0.25 * ((h >> 3) & 1);
          x2.fillStyle = 'rgb(' + Math.round(g[0] * v) + ',' + Math.round(g[1] * v) + ',' + Math.round(g[2] * v) + ')';
          x2.fillText(grp[h % grp.length], xx * cw, yy * ch);
        }
      }
      tex.push(c);
    }
    draw(performance.now());
  }

  function wave(c, t) {
    var u = c / cols, ph = c * 0.085 - t * 2.2, amp = fh * 0.045 * Math.pow(u, 0.8);
    return { dy: Math.sin(ph) * amp + Math.sin(c * 0.03 - t * 1.05) * amp * 0.4, slope: Math.cos(ph) * amp * 0.085 + Math.cos(c * 0.03 - t * 1.05) * amp * 0.012 };
  }

  function draw(now) {
    if (!tex.length) return;
    var t = reduce ? 0.6 : now / 1000, dk = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.clearRect(0, 0, W, H);
    // pole + finial, in ASCII
    var pfs = Math.max(9, poleW * 0.9);
    ctx.font = '700 ' + pfs.toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    ctx.fillStyle = dk ? 'rgba(225,225,225,0.85)' : 'rgba(55,55,55,0.9)';
    ctx.fillText('o', poleW * 0.25, 0);
    for (var py = pfs; py < H; py += pfs) ctx.fillText('|', poleW * 0.3, py);
    // the light circles slowly over the cloth, like the rose's
    var la = reduce ? 0.8 : t * 0.35, Lx = Math.cos(la) * 0.8, Lz = 0.6 + 0.15 * Math.sin(la * 0.7);
    var ox = poleW + 4, sw = cw * dpr, step = 2;
    for (var c = 0; c < cols; c += step) {
      var wv = wave(c, t), nx = -wv.slope / 6, nz = 1, nn = Math.sqrt(nx * nx + 1);
      var lit = Math.max(0, Math.min(1, 0.5 + 0.5 * ((nx * Lx + nz * Lz) / nn - 0.35) * 1.6));
      var spec = Math.pow(lit, 14) * 0.35;
      var f = lit * (NT - 1), i0 = Math.floor(f), i1 = Math.min(NT - 1, i0 + 1), a1 = f - i0;
      var x0 = ox + c * cw, w0 = cw * step + 0.5, y0 = top + wv.dy;
      ctx.globalAlpha = 1; ctx.drawImage(tex[i0], c * sw, 0, sw * step, tex[i0].height, x0, y0, w0, fh);
      if (a1 > 0.02) { ctx.globalAlpha = a1; ctx.drawImage(tex[i1], c * sw, 0, sw * step, tex[i1].height, x0, y0, w0, fh); }
      if (spec > 0.01) { ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,' + spec.toFixed(3) + ')'; ctx.fillRect(x0, y0, w0, fh); }
    }
    ctx.globalAlpha = 1;
  }

  // glitter on the cloth, cross-shaped glints, and a few bits carried off the fly end
  function effects(now, dt) {
    if (reduce) return;
    var t = now / 1000, dk = document.documentElement.getAttribute('data-theme') !== 'light', ox = poleW + 4;
    if (Math.random() < dt * 10) { var c = Math.random() * cols, r = Math.random() * rows; dust.push({ c: c, r: r, life: 0, max: 0.35 + Math.random() * 0.5 }); }
    if (Math.random() < dt * 0.8) glints.push({ c: Math.random() * cols, r: Math.random() * rows, life: 0, max: 0.9 + Math.random() * 0.7, arm: 2 + ((Math.random() * 3) | 0) });
    if (bits.length < 24 && Math.random() < 0.22) {
      var cc = cols - 1, wv = wave(cc, t);
      bits.push({ x: ox + fw - 4, y: top + wv.dy + Math.random() * fh, vx: 18 + Math.random() * 30, vy: -6 + Math.random() * 12, life: 0, max: 1.6 + Math.random() * 1.4, ch: Math.random() < 0.5 ? '0' : '1' });
    }
    ctx.font = '700 ' + Math.max(8, cw * 1.8).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';
    for (var i = dust.length - 1; i >= 0; i--) {
      var p = dust[i]; p.life += dt; if (p.life > p.max) { dust.splice(i, 1); continue; }
      var a = Math.sin(Math.PI * p.life / p.max), wv2 = wave(p.c, t);
      ctx.globalAlpha = a * 0.9;
      ctx.fillText(a > 0.7 ? '*' : a > 0.35 ? '+' : '.', ox + p.c * cw, top + wv2.dy + p.r * ch);
    }
    for (var j = glints.length - 1; j >= 0; j--) {
      var gl = glints[j]; gl.life += dt; if (gl.life > gl.max) { glints.splice(j, 1); continue; }
      var a2 = Math.sin(Math.PI * gl.life / gl.max), n = Math.max(1, Math.round(gl.arm * a2)), wv3 = wave(gl.c, t);
      var gx = ox + gl.c * cw, gy = top + wv3.dy + gl.r * ch, sx = cw * 1.8, sy = ch * 1.8;
      ctx.globalAlpha = a2; ctx.fillText('+', gx, gy);
      ctx.globalAlpha = a2 * 0.55;
      for (var s = 1; s <= n; s++) { ctx.fillText('-', gx - s * sx, gy); ctx.fillText('-', gx + s * sx, gy); ctx.fillText('|', gx, gy - s * sy); ctx.fillText('|', gx, gy + s * sy); }
    }
    ctx.font = '700 10px ' + MONO;
    for (var b = bits.length - 1; b >= 0; b--) {
      var q = bits[b]; q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.life > q.max || q.x > W) { bits.splice(b, 1); continue; }
      var a3 = Math.sin(Math.PI * q.life / q.max) * 0.8;
      ctx.globalAlpha = a3; ctx.fillStyle = q.ch === '1' ? '#2bb56d' : (dk ? '#ffffff' : '#1e1e1e');
      ctx.fillText(q.ch, q.x, q.y);
    }
    ctx.globalAlpha = 1;
  }

  var last = 0;
  function loop(now) {
    if (!visible) return;
    if (now - last > 40) { var dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; draw(now); effects(now, dt); }
    if (!reduce) requestAnimationFrame(loop);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var was = visible; visible = es[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop);
  }).observe(fig);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  function start() { build(); requestAnimationFrame(loop); }
  if (src.complete && src.naturalWidth) start(); else src.onload = start;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (src.naturalWidth) build(); });
  window.FLAG = { redraw: function () { draw(performance.now()); } };
})();
