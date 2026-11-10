/* haitham.sys — ASCII engine
   AsciiCanvas : image -> live glyph canvas (decode-in, glint sweep, binary hover lens)
   field       : reactive ASCII noise field behind the hero
   banner      : text drawn with 0/1 digits
   scramble    : decode-style text reveal
   Everything is theme-aware and pauses when off-screen. */
(function () {
  'use strict';

  var RAMP = " .`':,;-~=+i!1lrctvxz7jf?3unoe2s5a4ZSkhdbpq9X6AGU&%O0#QD8$B@MW";
  var DIGITS = '0123456789';
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var GW = 0.6, LH = 1.08, ASPECT = GW / LH;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var all = [];

  function cssVar(n, f) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f; }
  function isDark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
  function loadImg(src) {
    return new Promise(function (res, rej) { var i = new Image(); i.decoding = 'async'; i.onload = function () { res(i); }; i.onerror = rej; i.src = src; });
  }
  function onVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: 0.02 }).observe(el);
  }

  /* ---------- image -> glyph grid ---------- */
  function sample(img, cols, o) {
    var crop = o.crop || [0, 0, 1, 1];
    var sw = img.naturalWidth * crop[2], sh = img.naturalHeight * crop[3];
    var rows = o.rows || Math.max(1, Math.round(cols * (sh / sw) * ASPECT));
    var c = document.createElement('canvas'); c.width = cols; c.height = rows;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, img.naturalWidth * crop[0], img.naturalHeight * crop[1], sw, sh, 0, 0, cols, rows);
    var d = x.getImageData(0, 0, cols, rows).data;
    var lo = 0, hi = 1;
    if (o.levels) {
      var ls = [];
      for (var q = 0; q < d.length; q += 4) ls.push((0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2]) / 255);
      ls.sort(function (a, b) { return a - b; });
      lo = ls[(ls.length * 0.05) | 0]; hi = ls[(ls.length * 0.97) | 0];
      if (hi - lo < 0.1) { lo = 0; hi = 1; }
    }
    var invert = o.invert, gamma = o.gamma || 1, cells = new Array(cols * rows);
    for (var i = 0, p = 0; i < cells.length; i++, p += 4) {
      var r = d[p], g = d[p + 1], b = d[p + 2];
      var lum0 = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      var sat = Math.max(r, g, b) - Math.min(r, g, b);
      var lum = o.levels ? Math.min(1, Math.max(0, (lum0 - lo) / (hi - lo))) : lum0;
      var bg = !!o.cutWhite && lum0 > 0.9 && sat < 38;
      var idx, col;
      if (invert) {
        idx = Math.round(Math.pow(lum, gamma) * (RAMP.length - 1));
        var k = 1.12;
        col = 'rgb(' + Math.min(255, (r * k + 22) | 0) + ',' + Math.min(255, (g * k + 22) | 0) + ',' + Math.min(255, (b * k + 22) | 0) + ')';
      } else {
        idx = Math.round(Math.pow(1 - lum, gamma) * (RAMP.length - 1));
        col = 'rgb(' + ((r * 0.82) | 0) + ',' + ((g * 0.82) | 0) + ',' + ((b * 0.82) | 0) + ')';
      }
      if (!bg && idx < 1) idx = 1;
      var cx = i % cols, cy = (i / cols) | 0;
      cells[i] = { ch: RAMP[idx], col: col, empty: bg || (invert && lum < 0.05), t: (cy / rows) * 1.1 + Math.random() * 0.55 + (cx / cols) * 0.15 };
    }
    return { cols: cols, rows: rows, cells: cells };
  }

  /* ---------- live glyph canvas ---------- */
  function AsciiCanvas(canvas, img, o) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.img = img; this.o = o;
    this.mouse = null; this.visible = true; this.running = false; this.last = 0;
    this.start = performance.now();
    this.build(); this.bind(); all.push(this);
  }
  AsciiCanvas.prototype.mode = function () {
    var o = this.o, dark = isDark();
    var m = Object.assign({}, o);
    if (o.themed) { m.invert = dark; m.gamma = dark ? (o.gammaDark || 1.15) : (o.gammaLight || 0.85); }
    this.accent = o.accent || cssVar('--accent', '#7fcf9f');
    this.accent2 = o.accent2 || (dark ? cssVar('--ink', '#dfe5df') : cssVar('--accent-2', '#1f5c42'));
    return m;
  };
  AsciiCanvas.prototype.build = function () {
    var host = this.canvas.parentElement;
    var maxW = parseFloat(getComputedStyle(this.canvas).maxWidth);
    var w = (host.clientWidth || 400) - (this.o.inset || 0);
    if (!isNaN(maxW)) w = Math.min(w, maxW);
    var cols = typeof this.o.cols === 'function' ? this.o.cols(w) : this.o.cols;
    var m = this.mode();
    if (this.o.cover) {
      var boxH = host.clientHeight || w * 0.62;
      var cw0 = w / cols, chh = (cw0 / GW) * LH, rows = Math.max(1, Math.floor(boxH / chh));
      var want = (cols * cw0) / (rows * chh), iw = this.img.naturalWidth, ih = this.img.naturalHeight;
      var cwp = iw, chp = iw / want;
      if (chp > ih) { chp = ih; cwp = ih * want; }
      var f = this.o.focus || [0.5, 0.5];
      var x0 = Math.min(Math.max(f[0] * iw - cwp / 2, 0), iw - cwp), y0 = Math.min(Math.max(f[1] * ih - chp / 2, 0), ih - chp);
      m.rows = rows; m.crop = [x0 / iw, y0 / ih, cwp / iw, chp / ih];
    }
    this.grid = sample(this.img, cols, m);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cw = w / this.grid.cols; this.fs = this.cw / GW; this.ch = this.fs * LH;
    var h = this.grid.rows * this.ch;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.font = '500 ' + this.fs.toFixed(2) + 'px ' + MONO;
    this.ctx.textBaseline = 'top';
    this.w = w;
    if (reduce) this.start = -1e6;
    this.draw(performance.now());
  };
  AsciiCanvas.prototype.bind = function () {
    var self = this, host = this.o.host || this.canvas;
    host.addEventListener('pointermove', function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.mouse = { x: (e.clientX - r.left) / self.cw, y: (e.clientY - r.top) / self.ch };
      self.kick();
    });
    host.addEventListener('pointerleave', function () { self.mouse = null; self.kick(); });
    onVisible(this.canvas, function (v) { self.visible = v; if (v) self.kick(); });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (Math.abs(self.canvas.parentElement.clientWidth - (self.o.inset || 0) - self.w) > 2) self.build(); }, 160);
    });
    this.kick();
  };
  AsciiCanvas.prototype.kick = function () {
    if (this.running || reduce) return;
    this.running = true;
    var self = this;
    requestAnimationFrame(function loop(now) {
      if (!self.visible) { self.running = false; return; }
      if (now - self.last > 42) { self.last = now; self.draw(now); }
      requestAnimationFrame(loop);
    });
  };
  AsciiCanvas.prototype.draw = function (now) {
    var ctx = this.ctx, g = this.grid, cw = this.cw, ch = this.ch, t = (now - this.start) / 1000;
    ctx.clearRect(0, 0, this.w, g.rows * ch);
    var period = this.o.glintEvery || 7, sweep = 1.5, gp = (t - 2.4) % period;
    var gpos = (t > 2.4 && gp < sweep) ? (gp / sweep) * (g.cols + g.rows * 1.2) - 6 : -999;
    var m = this.mouse, R = this.o.lens || 6.5, tick = (t * 12) | 0, last = '';
    for (var y = 0; y < g.rows; y++) {
      for (var x = 0; x < g.cols; x++) {
        var c = g.cells[y * g.cols + x];
        if (c.empty) continue;
        var gl = c.ch, st = c.col, a = 1;
        if (t < c.t) { gl = DIGITS[(x * 7 + y * 13 + tick) % 10]; st = this.accent; a = 0.3 + 0.45 * (t / c.t); }
        else if (t < c.t + 0.16) { st = this.accent2; }
        else {
          var gd = Math.abs(x + y * 1.2 - gpos);
          if (gd < 2.2) { gl = ((x + y + tick) & 1) ? '1' : '0'; st = this.accent; a = 1 - gd / 2.6; }
          if (m) {
            var dx = x - m.x, dy = (y - m.y) * 1.7, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < R) { gl = ((x * 3 + y + tick) % 3) ? '1' : '0'; st = dist < R * 0.55 ? this.accent2 : this.accent; a = 0.55 + 0.45 * (1 - dist / R); }
          }
        }
        if (st !== last) { ctx.fillStyle = st; last = st; }
        ctx.globalAlpha = a;
        ctx.fillText(gl, x * cw, y * ch);
      }
    }
    ctx.globalAlpha = 1;
  };

  /* ---------- hero field ---------- */
  function field(canvas) {
    var ctx = canvas.getContext('2d'), FS = 13, CW = FS * 0.6, CH = FS * 1.3, CH_SET = ' .·:-=+*';
    var cols = 0, rows = 0, w = 0, h = 0, mouse = null, visible = true, start = performance.now(), last = 0, accent = '#7fcf9f';
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = '400 ' + FS + 'px ' + MONO; ctx.textBaseline = 'top';
      cols = Math.ceil(w / CW); rows = Math.ceil(h / CH);
      accent = cssVar('--accent', '#7fcf9f');
    }
    function draw(now) {
      var t = (now - start) / 1000, rtl = document.documentElement.dir === 'rtl', dark = isDark();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = accent;
      var base = dark ? 0.05 : 0.07, amp = dark ? 0.2 : 0.22;
      var mx = mouse ? mouse.x / CW : -99, my = mouse ? mouse.y / CH : -99;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var v = (Math.sin(x * 0.085 + t * 0.55) + Math.sin(y * 0.16 - t * 0.42) + Math.sin((x + y) * 0.045 + t * 0.3) + Math.sin(Math.sqrt((x - cols * 0.7) * (x - cols * 0.7) + (y - rows * 0.4) * (y - rows * 0.4) * 4) * 0.13 - t * 0.9)) * 0.25;
          var dx = x - mx, dy = (y - my) * 1.9, dm = Math.sqrt(dx * dx + dy * dy);
          if (dm < 16) v += (1 - dm / 16) * 1.1;
          if (v < 0.32) continue;
          var side = rtl ? 1 - x / cols : x / cols;
          var a = (base + amp * Math.min(1, (v - 0.32) / 0.68)) * (0.35 + 0.65 * side) * (1 - y / rows * 0.6);
          if (a < 0.02) continue;
          ctx.globalAlpha = a;
          ctx.fillText(CH_SET[Math.min(CH_SET.length - 1, ((v - 0.32) / 0.68 * CH_SET.length) | 0)], x * CW, y * CH);
        }
      }
      ctx.globalAlpha = 1;
    }
    size();
    window.addEventListener('resize', size);
    var hero = canvas.parentElement;
    hero.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    hero.addEventListener('pointerleave', function () { mouse = null; });
    onVisible(canvas, function (v) { visible = v; if (v) loop(performance.now()); });
    var raf = 0;
    function loop(now) {
      cancelAnimationFrame(raf);
      if (!visible) return;
      if (now - last > 55) { last = now; draw(now); }
      if (!reduce) raf = requestAnimationFrame(loop);
    }
    loop(performance.now());
    return { refresh: function () { size(); draw(performance.now()); } };
  }

  /* ---------- 0/1 banners ---------- */
  var FONT = {
    H: ['#...#', '#...#', '#####', '#...#', '#...#'], A: ['.###.', '#...#', '#####', '#...#', '#...#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], T: ['#####', '..#..', '..#..', '..#..', '..#..'],
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
    '2': ['.###.', '#...#', '..##.', '.#...', '#####'], x: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    ' ': ['..', '..', '..', '..', '..']
  };
  function banner(el) {
    var text = el.getAttribute('data-text') || '', px = parseInt(el.getAttribute('data-px') || '2', 10);
    var rows = ['', '', '', '', ''];
    for (var i = 0; i < text.length; i++) {
      var g = FONT[text[i]] || FONT[' '];
      for (var r = 0; r < 5; r++) {
        var line = '';
        for (var k = 0; k < g[r].length; k++) for (var p = 0; p < px; p++) line += g[r][k] === '#' ? '#' : ' ';
        rows[r] += line + (i < text.length - 1 ? ' '.repeat(px) : '');
      }
    }
    var bits = rows.map(function (row) { return row.split('').map(function (c) { return c === '#' ? (Math.random() < 0.5 ? '0' : '1') : ' '; }); });
    function render() { el.textContent = bits.map(function (r) { return r.join(''); }).join('\n'); }
    render();
    if (reduce) return;
    var vis = false;
    onVisible(el, function (v) { vis = v; });
    setInterval(function () {
      if (!vis) return;
      for (var n = 0; n < 6; n++) {
        var r = (Math.random() * bits.length) | 0, c = (Math.random() * bits[r].length) | 0;
        if (bits[r][c] !== ' ') bits[r][c] = bits[r][c] === '0' ? '1' : '0';
      }
      render();
    }, 140);
  }

  /* ---------- scramble text ---------- */
  var SC = '!<>-_\\/[]{}=+*^?#01ABCDEFX';
  function scramble(el, text, dur) {
    text = text == null ? el.textContent : text;
    dur = dur || 900;
    if (reduce || !/^[\x20-\x7E·—]+$/.test(text)) { el.textContent = text; return; }
    if (el._sc) cancelAnimationFrame(el._sc);
    var start = performance.now(), n = text.length;
    var at = []; for (var i = 0; i < n; i++) at.push((i / n) * dur * 0.65 + Math.random() * dur * 0.35);
    (function step(now) {
      var t = now - start, out = '', done = true;
      for (var i = 0; i < n; i++) {
        var ch = text[i];
        if (ch === ' ' || t >= at[i]) out += ch.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        else { done = false; out += '<span class="sc">' + SC[(Math.random() * SC.length) | 0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>'; }
      }
      el.innerHTML = out;
      if (!done) el._sc = requestAnimationFrame(step); else el.textContent = text;
    })(start);
  }

  window.ASCII = {
    portrait: function (canvas) {
      return loadImg(canvas.getAttribute('data-src')).then(function (img) {
        var a = new AsciiCanvas(canvas, img, {
          cols: function (w) { return w < 360 ? 58 : 76; },
          crop: [0.04, 0.06, 0.92, 0.94], cutWhite: true, themed: true, inset: 32,
          gammaDark: 1.25, gammaLight: 0.85, host: canvas.closest('.portrait') || canvas.parentElement
        });
        canvas.parentElement.classList.add('ready');
        return a;
      });
    },
    photo: function (box) {
      var canvas = box.querySelector('canvas');
      box.addEventListener('click', function () { box.classList.toggle('show'); });
      box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.classList.toggle('show'); } });
      return loadImg(box.getAttribute('data-src')).then(function (img) {
        return new AsciiCanvas(canvas, img, {
          cols: function (w) { return Math.max(54, Math.min(104, Math.round(w / 6.6))); },
          cover: true, focus: (box.getAttribute('data-focus') || '0.5,0.5').split(',').map(Number),
          invert: true, levels: true, gamma: 1.9, accent: '#7fcf9f', accent2: '#e6f6ec', host: box, lens: 7, glintEvery: 6
        });
      }).catch(function () { box.classList.add('noascii'); });
    },
    field: field,
    banner: banner,
    scramble: scramble,
    retheme: function () { all.forEach(function (a) { a.build(); a.kick(); }); }
  };
})();
