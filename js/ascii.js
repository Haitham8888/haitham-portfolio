/* ASCII details — kept small on purpose.
   eyes(fig)   : the eye strip, drawn only from a brightness grid (window.EYES) — no photo ever ships
   scramble(el): decode-style text reveal
   banner(el)  : text drawn with 0/1 */
(function () {
  'use strict';
  var RAMP = " .'`,:;-~=+i!1lrctvxz7jf?3unoe2s5a4ZSkhdbpq9X6AGU&%O0#QD8$B@MW";
  var ALPHA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var GW = 0.6, LH = 1.08;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

  function eyes(fig) {
    var E = window.EYES, canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
    // only the eyes and brows: crop away the nose and cheeks below, and the empty background at the sides
    var CX0 = 40, CX1 = 122, CY0 = 3, CY1 = 21, SC = CX1 - CX0, SR = CY1 - CY0;
    var src = new Float32Array(SC * SR);
    for (var yy0 = 0; yy0 < SR; yy0++) for (var xx0 = 0; xx0 < SC; xx0++) src[yy0 * SC + xx0] = ALPHA.indexOf(E.d[(yy0 + CY0) * E.c + xx0 + CX0]) / 63;
    // stretch contrast inside the crop so brows, eyes and the glasses frames read clearly
    // balance the two eyes: each half of the face gets its own levels, so uneven light never hides one eye
    function lv(c0, c1) {
      var v = [];
      for (var yy1 = 0; yy1 < SR; yy1++) for (var xx1 = c0; xx1 < c1; xx1++) v.push(src[yy1 * SC + xx1]);
      v.sort(function (p, q) { return p - q; });
      return [v[Math.floor(v.length * 0.03)], v[Math.floor(v.length * 0.985)]];
    }
    var mid0 = Math.floor(SC / 2), LA = lv(0, mid0), LB = lv(mid0, SC);
    for (var yy2 = 0; yy2 < SR; yy2++) for (var xx2 = 0; xx2 < SC; xx2++) {
      var k2 = Math.max(0, Math.min(1, (xx2 - mid0 + 8) / 16)), lo2 = LA[0] * (1 - k2) + LB[0] * k2, hi2 = LA[1] * (1 - k2) + LB[1] * k2, i2 = yy2 * SC + xx2;
      src[i2] = Math.max(0, Math.min(1, (src[i2] - lo2) / (hi2 - lo2 || 1)));
    }
    var gxA, gyA, edA, hsA, edgeT = 0.1, glints = [], dust = [], lastT = 0;
    var lum, cols, rows, cw, ch, w, h, fs, mouse = null, glow = 0, born = 0, seen = false, visible = false, timer = 0;

    // box-average the high-res grid down to the size that fits this screen
    function build() {
      var cs = getComputedStyle(fig);
      w = fig.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      cols = Math.max(90, Math.min(240, Math.round(w / 4.4)));
      cw = w / cols; fs = cw / GW; ch = fs * LH;
      rows = Math.max(1, Math.round(cols * (SR / SC) * 1.0));
      h = rows * ch;
      lum = new Float32Array(cols * rows);
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var x0 = Math.floor(x * SC / cols), x1 = Math.max(x0 + 1, Math.floor((x + 1) * SC / cols));
          var y0 = Math.floor(y * SR / rows), y1 = Math.max(y0 + 1, Math.floor((y + 1) * SR / rows));
          if (cols <= SC) {
            var sum = 0, n = 0;
            for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) { sum += src[yy * SC + xx]; n++; }
            lum[y * cols + x] = sum / n;
          } else {
            // finer than the source: smooth bilinear sampling
            var fx = Math.max(0, Math.min(SC - 1.001, (x + 0.5) * SC / cols - 0.5)), fy = Math.max(0, Math.min(SR - 1.001, (y + 0.5) * SR / rows - 0.5));
            var ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
            var p00 = src[iy * SC + ix], p10 = src[iy * SC + ix + 1], p01 = src[(iy + 1) * SC + ix], p11 = src[(iy + 1) * SC + ix + 1];
            lum[y * cols + x] = (p00 * (1 - tx) + p10 * tx) * (1 - ty) + (p01 * (1 - tx) + p11 * tx) * ty;
          }
        }
      }
      // relief from the image itself: gradients act as surface normals, edges become contour glyphs
      gxA = new Float32Array(cols * rows); gyA = new Float32Array(cols * rows); edA = new Float32Array(cols * rows); hsA = new Uint16Array(cols * rows);
      for (var y2 = 0; y2 < rows; y2++) for (var x2 = 0; x2 < cols; x2++) {
        var i3 = y2 * cols + x2;
        var xl = Math.max(0, x2 - 1), xr = Math.min(cols - 1, x2 + 1), yu = Math.max(0, y2 - 1), yd = Math.min(rows - 1, y2 + 1);
        var gx = (lum[y2 * cols + xr] - lum[y2 * cols + xl]) * 0.5, gy = (lum[yd * cols + x2] - lum[yu * cols + x2]) * 0.5;
        gxA[i3] = gx; gyA[i3] = gy; edA[i3] = Math.sqrt(gx * gx + gy * gy);
        hsA[i3] = ((x2 * 73856093) ^ (y2 * 19349663)) & 0xffff;
      }
      var es = Array.prototype.slice.call(edA).sort(function (p, q) { return p - q; });
      edgeT = es[Math.floor(es.length * 0.9)] || 0.1;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    // the rose's ink: letters and numbers in bands from sparse to dense
    var GROUPS = [".'`", ",:;", "-~^", "=+<>", "ilr!1", "cvxz7", "tjfJ?", "nuoe23", "sa5S4Z", "kbdpq9X", "AGh6&%", "UOQ0#D", "$8B@MW"], NG = GROUPS.length;
    var RAMP_D = [[0, 26, 28, 34], [0.3, 74, 80, 92], [0.6, 150, 158, 170], [0.85, 222, 227, 233], [1, 255, 255, 255]];
    var RAMP_L = [[0, 236, 236, 236], [0.3, 170, 172, 176], [0.6, 96, 98, 104], [0.85, 40, 42, 46], [1, 8, 8, 10]];
    var LEVELS = 24, styleCache = {};
    function ramp(t, R) {
      for (var i = 1; i < R.length; i++) if (t <= R[i][0]) { var a = R[i - 1], b = R[i], u = (t - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u]; }
      var l = R[R.length - 1]; return [l[1], l[2], l[3]];
    }
    function style(q, dk, accent) {
      var key = q + (dk ? 'd' : 'l') + (accent ? 'a' : '');
      if (styleCache[key]) return styleCache[key];
      var c = ramp(q / (LEVELS - 1), dk ? RAMP_D : RAMP_L);
      if (accent) c = dk ? [74 + (c[0] - 74) * 0.25, 222 + (c[1] - 222) * 0.25, 128 + (c[2] - 128) * 0.25] : [21, 128, 61];
      return (styleCache[key] = 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')');
    }
    var buckets = [];
    function draw(now) {
      var dk = dark(), t = seen ? (now - born) / 1000 : -1, tt = now / 1000, dt = Math.min(0.1, Math.max(0, tt - (lastT || tt))); lastT = tt;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '700 ' + fs.toFixed(2) + 'px ' + MONO;
      ctx.textBaseline = 'top';
      // the light circles slowly, as on the rose; the rim breathes
      var la = reduce ? 0.9 : tt * 0.35, Lx = Math.cos(la) * 0.75, Ly = Math.sin(la) * 0.55, Lz = 0.62, Ln = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz); Lx /= Ln; Ly /= Ln; Lz /= Ln;
      var breathe = reduce ? 0.6 : 0.55 + 0.25 * Math.sin(tt * 0.8);
      var R = 10, mx = mouse ? mouse.x / cw : -99, my = mouse ? mouse.y / ch : -99;
      for (var q = 0; q < LEVELS * 2; q++) buckets[q] = [];
      var k = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++, k++) {
          var L = lum[k];
          // shading from the relief under the moving light
          var nx = -gxA[k] * 9, ny = -gyA[k] * 9, nz = 1, nn = Math.sqrt(nx * nx + ny * ny + 1);
          var dif = Math.max(0, (nx * Lx + ny * Ly + nz * Lz) / nn), spec = Math.pow(dif, 24);
          var b = L * (0.62 + 0.5 * dif) + 0.22 * spec + 0.06 * breathe * L;
          var nX = (x / cols - 0.5) / 0.075, nY = y / rows;
          if (nX > -1 && nX < 1 && nY > 0.62) b *= 1 - (1 - nX * nX) * Math.min(1, (nY - 0.62) / 0.3) * 0.5;
          var tone = dk ? Math.max(0.15, Math.min(1, Math.pow(b, 1.15))) : Math.min(1, Math.pow(Math.max(0, 1 - b), 1.25) * 1.15);
          if (!dk && tone < 0.06) continue;
          if (glow > 0.01) { var dx = x - mx, dy = (y - my) * 1.9, d = Math.sqrt(dx * dx + dy * dy); if (d < R) tone = Math.min(1, tone + (1 - d / R) * glow * 0.4); }
          var reveal = (x / cols) * 1.0 + (y / rows) * 0.12, fade = 1;
          if (!reduce && t < reveal) { if (t < reveal - 0.25) continue; fade = Math.max(0, 1 - (reveal - t) / 0.25); }
          var g, isEdge = edA[k] > edgeT;
          if (isEdge) {
            // contours: the direction of the edge picks the glyph, like the rose's outlines
            var ang = (Math.atan2(gxA[k], -gyA[k]) * 180 / Math.PI + 180) % 180;
            g = (ang < 22.5 || ang >= 157.5) ? (gyA[k] > 0 ? '_' : '-') : ang < 67.5 ? '/' : ang < 112.5 ? '|' : '\\';
            tone = Math.min(1, tone + 0.12);
          } else {
            var grp = GROUPS[Math.min(NG - 1, Math.floor(tone * NG))];
            g = grp[hsA[k] % grp.length];
          }
          var lvl = Math.max(0, Math.min(LEVELS - 1, Math.round(tone * fade * (LEVELS - 1))));
          buckets[lvl].push(g, x * cw, y * ch);
        }
      }
      for (var q2 = 0; q2 < LEVELS; q2++) {
        var bk = buckets[q2]; if (!bk.length) continue;
        ctx.fillStyle = style(q2, dk, false);
        for (var j = 0; j < bk.length; j += 3) ctx.fillText(bk[j], bk[j + 1], bk[j + 2]);
      }
      if (reduce || t < 0) return;
      // glitter twinkles on the bright skin; cross-shaped glints now and then
      if (Math.random() < dt * 9) { var gi = (Math.random() * cols * rows) | 0; if (lum[gi] > 0.55) dust.push({ x: gi % cols, y: (gi / cols) | 0, life: 0, max: 0.35 + Math.random() * 0.5 }); }
      if (Math.random() < dt * 0.9) glints.push({ x: Math.random() * cols, y: Math.random() * rows, life: 0, max: 0.9 + Math.random() * 0.7, arm: 2 + ((Math.random() * 3) | 0) });
      ctx.fillStyle = style(LEVELS - 1, dk, true);
      for (var i4 = dust.length - 1; i4 >= 0; i4--) {
        var p4 = dust[i4]; p4.life += dt; if (p4.life > p4.max) { dust.splice(i4, 1); continue; }
        var a4 = Math.sin(Math.PI * p4.life / p4.max); ctx.globalAlpha = a4;
        ctx.fillText(a4 > 0.7 ? '*' : a4 > 0.35 ? '+' : '.', p4.x * cw, p4.y * ch);
      }
      for (var i5 = glints.length - 1; i5 >= 0; i5--) {
        var gl = glints[i5]; gl.life += dt; if (gl.life > gl.max) { glints.splice(i5, 1); continue; }
        var a5 = Math.sin(Math.PI * gl.life / gl.max), n5 = Math.max(1, Math.round(gl.arm * a5)), cx5 = gl.x * cw, cy5 = gl.y * ch;
        ctx.globalAlpha = a5; ctx.fillText('+', cx5, cy5);
        ctx.globalAlpha = a5 * 0.55;
        for (var s5 = 1; s5 <= n5; s5++) { ctx.fillText('-', cx5 - s5 * cw, cy5); ctx.fillText('-', cx5 + s5 * cw, cy5); ctx.fillText('|', cx5, cy5 - s5 * ch); ctx.fillText('|', cx5, cy5 + s5 * ch); }
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      timer = 0;
      var now = performance.now(), t = (now - born) / 1000;
      glow += ((mouse ? 1 : 0) - glow) * 0.25;
      draw(now);
      if (!reduce && visible) timer = setTimeout(loop, 42);
    }
    function kick() { if (!timer) loop(); }

    fig.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; kick(); });
    fig.addEventListener('pointerleave', function () { mouse = null; kick(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !seen) { seen = true; born = performance.now(); }
      if (visible) kick();
    }, { threshold: 0.25 }).observe(fig);
    else { seen = true; visible = true; born = performance.now(); }

    build();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    return { redraw: function () { draw(performance.now()); } };
  }

  var SC = '!<>-_\\/[]{}=+*^?#01';
  function scramble(el, text, dur) {
    text = text || el.textContent; dur = dur || 900;
    if (reduce) { el.textContent = text; return; }
    var start = performance.now(), n = text.length, at = [];
    for (var i = 0; i < n; i++) at.push((i / n) * dur * 0.6 + Math.random() * dur * 0.4);
    (function step(now) {
      var t = now - start, out = '', done = true;
      for (var i = 0; i < n; i++) {
        if (text[i] === ' ' || t >= at[i]) out += text[i];
        else { done = false; out += '<span class="g">' + SC[(Math.random() * SC.length) | 0].replace('<', '&lt;').replace('>', '&gt;') + '</span>'; }
      }
      el.innerHTML = out;
      if (!done) requestAnimationFrame(step); else el.textContent = text;
    })(start);
  }

  var FONT = {
    H: ['#...#', '#...#', '#####', '#...#', '#...#'], A: ['.###.', '#...#', '#####', '#...#', '#...#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], T: ['#####', '..#..', '..#..', '..#..', '..#..'],
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'], ' ': ['..', '..', '..', '..', '..'], L: ['#....', '#....', '#....', '#....', '#####'], '-': ['...', '...', '###', '...', '...']
  };
  function banner(el, text) {
    var rows = ['', '', '', '', ''];
    for (var i = 0; i < text.length; i++) {
      var g = FONT[text[i]] || FONT[' '];
      for (var r = 0; r < 5; r++) {
        for (var k = 0; k < g[r].length; k++) rows[r] += g[r][k] === '#' ? (Math.random() < 0.5 ? '00' : '11') : '  ';
        rows[r] += '  ';
      }
    }
    el.textContent = rows.join('\n');
  }

  /* photos and video thumbnails in the site's own language: each one is drawn as ASCII (the rose's glyph bands,
     a whisper of the photo's own colour); hover or focus lifts the veil and shows the real picture. */
  var PH_GROUPS = [".'`", ",:;", "-~^", "=+<>", "ilr!1", "cvxz7", "tjfJ?", "nuoe23", "sa5S4Z", "kbdpq9X", "AGh6&%", "UOQ0#D", "$8B@MW"], PH = [];
  function paintPhoto(p) {
    var img = p.img, cv = p.cv, w = img.clientWidth, h = img.clientHeight;
    if (!w || !h || !img.naturalWidth) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), cols = Math.max(28, Math.round(w / 4.6)), cw = w / cols, fs = cw / GW, ch = fs * 1.0, rows = Math.max(1, Math.round(h / ch));
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    // sample the picture exactly as it is shown (object-fit: cover)
    var t = document.createElement('canvas'); t.width = cols; t.height = rows;
    var tx = t.getContext('2d', { willReadFrequently: true }), ir = img.naturalWidth / img.naturalHeight, br = w / h, sw, sh, sx, sy;
    if (ir > br) { sh = img.naturalHeight; sw = sh * br; sx = (img.naturalWidth - sw) / 2; sy = 0; } else { sw = img.naturalWidth; sh = sw / br; sx = 0; sy = (img.naturalHeight - sh) / 2; }
    try { tx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows); var d = tx.getImageData(0, 0, cols, rows).data; } catch (e) { cv.style.display = 'none'; return; }
    var dk = dark();
    x.fillStyle = dk ? '#050505' : '#fafafa'; x.fillRect(0, 0, w, h);
    x.font = '700 ' + fs.toFixed(2) + 'px ' + MONO; x.textBaseline = 'top';
    var NG = PH_GROUPS.length;
    for (var y = 0; y < rows; y++) for (var c = 0; c < cols; c++) {
      var q = (y * cols + c) * 4, r = d[q], g = d[q + 1], b = d[q + 2], L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      var tone = dk ? Math.pow(L, 1.35) : Math.pow(1 - L, 1.2);
      if (tone < 0.05) continue;
      var grp = PH_GROUPS[Math.min(NG - 1, Math.floor(tone * NG))], hh = ((c * 73856093) ^ (y * 19349663)) >>> 0;
      // mostly the site's ink, with a quarter of the photo's own colour
      var base = dk ? 215 : 30, k = 0.3, rr = base + (r - base) * k, gg = base + (g - base) * k, bb = base + (b - base) * k;
      x.globalAlpha = 0.16 + 0.62 * tone;
      x.fillStyle = 'rgb(' + (rr | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ')';
      x.fillText(grp[hh % grp.length], c * cw, y * ch);
    }
    x.globalAlpha = 1;
  }
  function photos(root) {
    [].forEach.call((root || document).querySelectorAll('.vid-th img, .moments button img'), function (img) {
      if (img._ascii) return; img._ascii = true;
      var cv = document.createElement('canvas'); cv.className = 'ph-ascii'; cv.setAttribute('aria-hidden', 'true');
      img.parentElement.classList.add('ph'); img.parentElement.appendChild(cv);
      var p = { img: img, cv: cv }; PH.push(p);
      if (img.complete && img.naturalWidth) paintPhoto(p); else img.addEventListener('load', function () { paintPhoto(p); });
    });
    PH = PH.filter(function (p) { return p.img.isConnected; });
  }
  function repaintPhotos() { PH.forEach(paintPhoto); }
  var phT; window.addEventListener('resize', function () { clearTimeout(phT); phT = setTimeout(repaintPhotos, 200); });
  new MutationObserver(repaintPhotos).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.ASCII = { eyes: eyes, scramble: scramble, banner: banner, photos: photos };
})();
