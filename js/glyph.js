/* Glyph tiles — any logo / icon / letter rendered as ASCII-binary characters.
   idle: soft monochrome · hover: timing-code scramble, then its real colour
   throwable tiles: drag, fling, bounce inside their section, spring back to their slot. */
(function () {
  'use strict';
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var RAMP = " .:-=+*o#%@", BIN = '01';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var live = [];

  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
  function rgb(r, g, b) { return 'rgb(' + r + ',' + g + ',' + b + ')'; }
  function lift(r, g, b, toLight) {
    var L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (toLight && L < 0.58) { var k = Math.min(0.62, (0.58 - L) * 1.35); r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    if (!toLight && L > 0.86 && Math.max(r, g, b) - Math.min(r, g, b) < 40) return 'rgb(34,34,34)'; // white parts of a logo -> ink on paper
    if (!toLight && L > 0.42) { var q = Math.min(0.55, (L - 0.42) * 1.25); r *= 1 - q; g *= 1 - q; b *= 1 - q; }
    return rgb(Math.round(Math.min(255, r)), Math.round(Math.min(255, g)), Math.round(Math.min(255, b)));
  }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }

  function sample(draw, n, opts) {
    var c = document.createElement('canvas'); c.width = n; c.height = n;
    var x = c.getContext('2d', { willReadFrequently: true });
    draw(x, n);
    var d = x.getImageData(0, 0, n, n).data, cells = [];
    for (var i = 0, p = 0; i < n * n; i++, p += 4) {
      var a = d[p + 3] / 255, r = d[p], g = d[p + 1], b = d[p + 2], L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (a < 0.3 || (opts.skipWhite && L > 0.9)) { cells.push(null); continue; }
      var w = opts.ink ? a : Math.max(0.4, a * (1 - L * 0.5));
      cells.push({ ch: RAMP[Math.max(3, Math.round(w * (RAMP.length - 1)))], c: opts.tint || [r, g, b], w: w });
    }
    return cells;
  }

  // bounding box of the visible part of a logo (ignores transparent / white padding)
  function inkBox(img, skipWhite) {
    var W = img.naturalWidth || 200, H = img.naturalHeight || 200, k = 320 / Math.max(W, H);
    var w = Math.max(1, Math.round(W * k)), h = Math.max(1, Math.round(H * k));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
      var p = (yy * w + xx) * 4; if (d[p + 3] < 60) continue;
      if (skipWhite && d[p] > 235 && d[p + 1] > 235 && d[p + 2] > 235) continue;
      if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
    }
    if (x1 < 0) return { c: c, x: 0, y: 0, w: w, h: h };
    return { c: c, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }; // drawn from the raster (SVG source-rect crops are unreliable)
  }
  function Tile(el, opts) {
    var self = this;
    this.el = el; this.o = opts; this.size = opts.size || 44; this.n = Math.max(opts.cols || 14, Math.round(this.size / (opts.src ? 2 : 2.3)));
    if (opts.href) el.setAttribute('data-href', opts.href);
    this.hot = false; this.scr = 0; this.dx = 0; this.dy = 0; this.vx = 0; this.vy = 0; this.mode = 'rest';
    var cv = document.createElement('canvas'); cv.className = 'glyph-cv';
    cv.width = this.size * 2; cv.height = this.size * 2; cv.style.width = cv.style.height = this.size + 'px';
    el.insertBefore(cv, el.firstChild);
    this.ctx = cv.getContext('2d'); this.ctx.setTransform(2, 0, 0, 2, 0, 0);
    var host = opts.hover || el;
    host.addEventListener('mouseenter', function () { self.hot = true; self.scr = performance.now() + 420; self.kick(); });
    host.addEventListener('mouseleave', function () { self.hot = false; self.kick(); });
    if (opts.icon) {
      var path = new Path2D(opts.icon.d);
      this.cells = sample(function (x, n) { x.scale(n / 24, n / 24); x.fillStyle = '#fff'; x.fill(path); }, this.n, { ink: true, tint: hex(opts.icon.hex) });
      this.paint(performance.now());
    } else if (opts.text) {
      this.cells = sample(function (x, n) { x.fillStyle = '#fff'; var tfs = n * 0.92; x.font = '800 ' + tfs + 'px ' + MONO; var tw0 = x.measureText(opts.text).width; if (tw0 > n * 0.94) { tfs *= n * 0.94 / tw0; x.font = '800 ' + tfs + 'px ' + MONO; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(opts.text, n / 2, n * 0.54); }, this.n, { ink: true, tint: hex(opts.color || '#4ade80') });
      this.paint(performance.now());
    } else if (opts.draw) {
      this.cells = sample(opts.draw, this.n, {});
      this.paint(performance.now());
    } else if (opts.src) {
      var img = new Image();
      img.onload = function () {
        var bb = inkBox(img, !self.o.keepWhite);
        self.cells = sample(function (x, n) {
          var m = n * 0.04, box = n - m * 2, r = Math.min(box / bb.w, box / bb.h), iw = bb.w * r, ih = bb.h * r;
          x.imageSmoothingQuality = 'high';
          x.drawImage(bb.c, bb.x, bb.y, bb.w, bb.h, (n - iw) / 2, (n - ih) / 2, iw, ih);
        }, self.n, { skipWhite: !self.o.keepWhite });
        self.paint(performance.now());
      };
      img.src = opts.src;
    }
    if (opts.throwable) this.makeThrowable();
    live.push(this);
  }

  Tile.prototype.paint = function (now) {
    var s = this.cells; if (!s) return;
    var ctx = this.ctx, S = this.size, n = this.n, cw = S / n, dk = dark();
    var hot = this.hot || this.mode !== 'rest', scr = now < this.scr, fast = Math.hypot(this.vx, this.vy) > 240;
    ctx.clearRect(0, 0, S, S);
    ctx.font = '800 ' + (cw * 1.08).toFixed(2) + 'px ' + MONO; ctx.textBaseline = 'top';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var c = s[y * n + x]; if (!c) continue;
      var g = c.ch;
      if (scr && Math.random() < (this.scr - now) / 420) g = BIN[(Math.random() * 2) | 0];
      else if (fast) g = ((x + y + (now / 60 | 0)) & 1) ? '1' : '0';
      // always in its own colour — softened at rest, full on hover
      ctx.globalAlpha = hot ? 1 : 0.86 + 0.14 * c.w;
      ctx.fillStyle = c.col || (c.col = lift(c.c[0], c.c[1], c.c[2], dk));
      ctx.fillText(g, x * cw + cw * 0.1, y * cw);
      if (!dk) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = cw * 0.16; ctx.strokeText(g, x * cw + cw * 0.1, y * cw); } // fuller ink on white
    }
    ctx.globalAlpha = 1;
  };

  Tile.prototype.kick = function () { if (!loopOn) { loopOn = true; requestAnimationFrame(loop); } };

  Tile.prototype.makeThrowable = function () {
    var self = this, el = this.el, start = null, hist = [];
    el.classList.add('throwable');
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      start = { x: e.clientX - self.dx, y: e.clientY - self.dy, sx: e.clientX, sy: e.clientY, moved: false };
      self.mode = 'drag'; self.vx = self.vy = 0; hist = []; el.classList.add('grab'); self.kick();
    });
    el.addEventListener('pointermove', function (e) {
      if (!start) return;
      if (Math.hypot(e.clientX - start.sx, e.clientY - start.sy) > 5) start.moved = true;
      self.dx = e.clientX - start.x; self.dy = e.clientY - start.y;
      hist.push({ x: self.dx, y: self.dy, t: performance.now() }); if (hist.length > 6) hist.shift();
    });
    function end() {
      if (!start) return;
      el.classList.remove('grab');
      if (!start.moved) { self.mode = 'back'; start = null; return; } // opening is press-and-hold (hold.js)
      if (hist.length > 1) {
        var a = hist[0], b = hist[hist.length - 1], dt = Math.max(16, b.t - a.t) / 1000;
        self.vx = (b.x - a.x) / dt; self.vy = (b.y - a.y) / dt;
        var sp = Math.hypot(self.vx, self.vy); if (sp > 2400) { self.vx *= 2400 / sp; self.vy *= 2400 / sp; }
      }
      self.mode = 'free'; self.t = 0; start = null;
    }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  };

  Tile.prototype.step = function (dt) {
    if (this.mode === 'free') {
      this.dx += this.vx * dt; this.dy += this.vy * dt;
      var d = Math.pow(0.3, dt); this.vx *= d; this.vy *= d;
      var box = this.el.closest(this.o.bounds || 'section'), r = box && box.getBoundingClientRect(), me = this.el.getBoundingClientRect();
      if (r) {
        if (me.left < r.left) { this.dx += r.left - me.left; this.vx = Math.abs(this.vx) * 0.7; }
        if (me.right > r.right) { this.dx -= me.right - r.right; this.vx = -Math.abs(this.vx) * 0.7; }
        if (me.top < r.top) { this.dy += r.top - me.top; this.vy = Math.abs(this.vy) * 0.7; }
        if (me.bottom > r.bottom) { this.dy -= me.bottom - r.bottom; this.vy = -Math.abs(this.vy) * 0.7; }
      }
      this.t += dt;
      if (this.t > 1.8 || (this.t > 0.5 && Math.hypot(this.vx, this.vy) < 25)) this.mode = 'back';
    } else if (this.mode === 'back') {
      var k = 1 - Math.pow(0.015, dt);
      this.dx += (0 - this.dx) * k; this.dy += (0 - this.dy) * k; this.vx *= 0.8; this.vy *= 0.8;
      if (Math.abs(this.dx) + Math.abs(this.dy) < 0.6) { this.dx = this.dy = 0; this.mode = 'rest'; }
    }
    var moving = this.mode !== 'rest';
    this.el.style.transform = moving || this.dx || this.dy ? 'translate(' + this.dx.toFixed(1) + 'px,' + this.dy.toFixed(1) + 'px) rotate(' + (this.vx * 0.006).toFixed(2) + 'deg)' : '';
    this.el.classList.toggle('flying', moving);
  };

  var loopOn = false, last = 0;
  function loop(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    var busy = false;
    live = live.filter(function (t) { return t.el.isConnected; });
    for (var i = 0; i < live.length; i++) {
      var t = live[i];
      if (t.o.throwable) t.step(dt);
      if (t.hot || t.mode !== 'rest' || now < t.scr + 50) { t.paint(now); busy = true; }
    }
    if (busy && !reduce) requestAnimationFrame(loop); else { loopOn = false; last = 0; live.forEach(function (t) { t.paint(now); }); }
  }

  window.GLYPH = {
    tile: function (el, opts) { return new Tile(el, opts); },
    repaint: function () { var n = performance.now(); live = live.filter(function (t) { return t.el.isConnected; }); live.forEach(function (t) { if (t.cells) t.cells.forEach(function (c) { if (c) c.col = null; }); t.paint(n); }); }
  };
})();
