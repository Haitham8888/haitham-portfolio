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
    var lum, cols, rows, cw, ch, w, h, fs, mouse = null, glow = 0, born = 0, seen = false, visible = false, timer = 0;

    // box-average the high-res grid down to the size that fits this screen
    function build() {
      var cs = getComputedStyle(fig);
      w = fig.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      cols = Math.max(90, Math.min(300, Math.round(w / 3.7)));
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
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    // the characters are the stack itself: Python, Rust, Kubernetes, ALLaM ... read left to right
    var WORDS = (function () {
      var st = (window.SITE && window.SITE.stack) || {}, out = [];
      Object.keys(st).forEach(function (k) { if (k !== 'spoken') st[k].forEach(function (w) { out.push(String(w).replace(/\s+/g, '')); }); });
      return (out.length ? out : ['Python', 'Rust', 'Kubernetes', 'ALLaM', 'Qwen', 'DeepSeek', 'Milvus']).join('');
    })();
    function draw(now) {
      var dk = dark(), t = seen ? (now - born) / 1000 : -1, wl = WORDS.length;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '700 ' + fs.toFixed(2) + 'px ' + MONO;
      ctx.textBaseline = 'top';
      var base = dk ? [236, 236, 236] : [10, 10, 10], beamC = dk ? [74, 222, 128] : [21, 128, 61];
      // a soft reading beam sweeps across every few seconds
      var period = 6.5, bp = reduce ? -1 : ((now / 1000) % period) / 2.2, beamX = bp <= 1 ? (bp * 1.3 - 0.15) * cols : -999, BW = cols * 0.06;
      var R = 10, mx = mouse ? mouse.x / cw : -99, my = mouse ? mouse.y / ch : -99;
      var k = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++, k++) {
          var L = lum[y * cols + x];
          var v = dk ? Math.pow(L, 1.5) : Math.pow(Math.max(0, Math.min(1, (0.72 - L) / 0.72)), 1.1);
          var nx = (x / cols - 0.5) / 0.075, ny = y / rows;
          if (nx > -1 && nx < 1 && ny > 0.62) v *= 1 - (1 - nx * nx) * Math.min(1, (ny - 0.62) / 0.3) * 0.55;
          if (v < 0.035 && !(dk && L > 0.08 && L < 0.4)) continue;
          var a = dk ? 0.05 + 0.95 * Math.pow(v, 1.15) : 0.05 + 0.95 * v, col = base, mixB = 0;
          // brows and lashes: their own dim grey texture on black (pupils stay dark so the eyes keep depth)
          var hair = dk && L > 0.08 && L < 0.4;
          if (hair) { var th = (0.4 - L) / 0.32; a = Math.max(a, 0.1 + 0.16 * Math.min(1, th)); col = [150, 156, 166]; }
          var db = Math.abs(x - beamX);
          if (db < BW) mixB = (1 - db / BW) * 0.85;
          if (glow > 0.01) {
            var dx = x - mx, dy = (y - my) * 1.9, d = Math.sqrt(dx * dx + dy * dy);
            if (d < R) a = Math.min(1, a + (1 - d / R) * glow * 0.5);
          }
          var reveal = (x / cols) * 1.0 + (y / rows) * 0.12;
          if (!reduce && t < reveal) { if (t < reveal - 0.25) continue; a *= Math.max(0, 1 - (reveal - t) / 0.25); }
          if (mixB > 0) { a = Math.min(1, a + mixB * 0.35); col = [Math.round(col[0] + (beamC[0] - col[0]) * mixB), Math.round(col[1] + (beamC[1] - col[1]) * mixB), Math.round(col[2] + (beamC[2] - col[2]) * mixB)]; }
          ctx.globalAlpha = a;
          ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
          ctx.fillText(WORDS[k % wl], x * cw, y * ch);
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      timer = 0;
      var now = performance.now(), t = (now - born) / 1000;
      glow += ((mouse ? 1 : 0) - glow) * 0.25;
      draw(now);
      if (!reduce && visible) timer = setTimeout(loop, (t < 1.5 || mouse || glow > 0.02) ? 40 : 60);
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

  window.ASCII = { eyes: eyes, scramble: scramble, banner: banner };
})();
