/* The flag of Saudi Arabia — fully ASCII / binary, waving.
   Like a fine LED matrix: every cell is a character, coloured exactly as the flag.
   Rendered once at high resolution so the Shahada and sword read clearly, then each frame
   only shifts the columns along the wave (fast). Never mirrored, never upside down. */
(function () {
  'use strict';
  var fig = document.getElementById('flag');
  if (!fig) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
  var src = new Image(); src.src = 'img/logos/saudi-flag.svg';
  var tex = [], cols = 0, rows = 0, cw = 0, ch = 0, fw = 0, fh = 0, W = 0, H = 0, poleW = 0, top = 0, dpr = 1, visible = true, variant = 0;
  var WHITE = '#@8&%$';

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = fig.clientWidth;
    poleW = Math.max(10, Math.round(W * 0.03));
    fw = W - poleW - 6;
    cols = Math.max(150, Math.min(260, Math.round(fw / 2.5)));
    cw = fw / cols; var fs = cw / 0.6; ch = fs * 0.98;
    fh = fw * 2 / 3; rows = Math.round(fh / ch); fh = rows * ch;
    top = Math.round(fh * 0.06) + 6; H = Math.round(fh + top * 2 + 18);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // flag mask at grid resolution
    var m = document.createElement('canvas'); m.width = cols; m.height = rows;
    var mx = m.getContext('2d', { willReadFrequently: true }); mx.drawImage(src, 0, 0, cols, rows);
    var d = mx.getImageData(0, 0, cols, rows).data;
    // two pre-rendered binary textures (alternating keeps the field alive)
    tex = [0, 1].map(function (v) {
      var c = document.createElement('canvas'); c.width = Math.ceil(fw * dpr); c.height = Math.ceil(fh * dpr);
      var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.fillStyle = '#00502c'; x.fillRect(0, 0, fw, fh);
      x.font = '800 ' + fs.toFixed(2) + 'px ' + MONO; x.textBaseline = 'top';
      for (var yy = 0; yy < rows; yy++) for (var xx = 0; xx < cols; xx++) {
        var p = (yy * cols + xx) * 4, white = (d[p] + d[p + 1] + d[p + 2]) / 3 > 140;
        var h = (xx * 73856093 ^ yy * 19349663 ^ v * 83492791) >>> 0;
        if (white) { x.fillStyle = '#ffffff'; x.fillText(WHITE[h % WHITE.length], xx * cw, yy * ch); }
        else { x.fillStyle = (h & 3) ? '#1f9a5b' : '#2bb56d'; x.fillText((h >> 5) & 1 ? '1' : '0', xx * cw, yy * ch); }
      }
      return c;
    });
    draw(performance.now());
  }

  function draw(now) {
    if (!tex.length) return;
    var t = reduce ? 0.6 : now / 1000, dk = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.clearRect(0, 0, W, H);
    // pole + finial, in ASCII
    ctx.font = '700 ' + Math.max(9, poleW * 0.9).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    ctx.fillStyle = dk ? 'rgba(225,225,225,0.85)' : 'rgba(55,55,55,0.9)';
    var pch = Math.max(9, poleW * 0.9) * 1.0;
    ctx.fillText('o', poleW * 0.25, 0);
    for (var py = pch; py < H; py += pch) ctx.fillText('|', poleW * 0.3, py);
    var T = tex[variant], ox = poleW + 4, sw = cw * dpr, step = 2; // 2 grid columns per strip
    for (var c = 0; c < cols; c += step) {
      var u = c / cols, ph = c * 0.085 - t * 2.2;
      var amp = fh * 0.045 * Math.pow(u, 0.8);
      var dy = Math.sin(ph) * amp + Math.sin(c * 0.03 - t * 1.05) * amp * 0.4;
      var shade = 0.5 + 0.5 * Math.cos(ph);
      var x0 = ox + c * cw, w0 = cw * step + 0.5;
      ctx.drawImage(T, c * sw, 0, sw * step, T.height, x0, top + dy, w0, fh);
      // folds: soft light and shadow across the cloth
      ctx.fillStyle = shade > 0.5 ? 'rgba(255,255,255,' + ((shade - 0.5) * 0.12).toFixed(3) + ')' : 'rgba(0,0,0,' + ((0.5 - shade) * 0.34).toFixed(3) + ')';
      ctx.fillRect(x0, top + dy, w0, fh);
    }
  }

  var last = 0, lastSwap = 0;
  function loop(now) {
    if (!visible) return;
    if (now - lastSwap > 900) { variant ^= 1; lastSwap = now; }
    if (now - last > 40) { last = now; draw(now); }
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
