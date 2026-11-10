/* Binary rain — faint, mostly in the margins, brightens and flips near the cursor.
   Pauses when the tab is hidden; static and very faint for reduced motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.createElement('canvas');
  canvas.className = 'rain';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  var ctx = canvas.getContext('2d');
  var FS = 13, GAP = 18, TRAIL = 16;
  var W, H, cols, drops = [], mouse = null, last = 0, boost = 1, running = true;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';

  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '400 ' + FS + 'px ' + MONO;
    ctx.textBaseline = 'top';
    cols = Math.ceil(W / GAP);
    drops = [];
    for (var i = 0; i < cols; i++) drops.push(newDrop(i, true));
  }

  function newDrop(i, scatter) {
    return {
      x: i * GAP + 3,
      y: scatter ? Math.random() * (H / FS) * 1.4 - 20 : -Math.random() * 30,
      v: 0.12 + Math.random() * 0.3,
      on: Math.random() < 0.34,
      bits: Array.from({ length: TRAIL }, function () { return Math.random() < 0.5 ? '0' : '1'; })
    };
  }

  // keep the reading column calm: digits fade out behind the text
  function columnFade(x) {
    var col = Math.min(668, W) / 2, c = W / 2, d = Math.abs(x - c);
    if (d > col + 40) return 1;
    if (d < col - 20) return 0.28;
    return 0.28 + 0.72 * ((d - (col - 20)) / 60);
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - last < 50) return;
    last = now;
    var dk = dark();
    ctx.clearRect(0, 0, W, H);
    var base = (dk ? 0.085 : 0.07) * boost, ink = dk ? '237,237,237' : '17,17,17', hot = dk ? '74,222,128' : '22,163,74';
    for (var i = 0; i < cols; i++) {
      var d = drops[i];
      if (!d.on) { if (Math.random() < 0.002) d.on = true; continue; }
      if (!reduce) d.y += d.v;
      var fade = columnFade(d.x);
      for (var k = 0; k < TRAIL; k++) {
        var yy = (d.y - k) * FS;
        if (yy < -FS || yy > H) continue;
        var a = base * fade * (1 - k / TRAIL) * (k === 0 ? 2.2 : 1);
        var col = ink;
        if (mouse) {
          var dx = d.x - mouse.x, dy = yy - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) { var f = 1 - dist / 130; a = Math.max(a, (dk ? 0.45 : 0.35) * f); col = hot; }
        }
        if (a < 0.008) continue;
        if (Math.random() < 0.03) d.bits[k] = d.bits[k] === '0' ? '1' : '0';
        ctx.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
        ctx.fillText(d.bits[k], d.x, yy);
      }
      if ((d.y - TRAIL) * FS > H) drops[i] = newDrop(i, false);
    }
  }

  size();
  window.addEventListener('resize', size);
  window.addEventListener('pointermove', function (e) { mouse = { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse = null; });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);

  window.FX = {
    matrix: function () { boost = boost === 1 ? 3.2 : 1; return boost > 1; }
  };
})();
