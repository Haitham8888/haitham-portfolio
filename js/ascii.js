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
    var src = new Float32Array(E.c * E.r);
    for (var s = 0; s < src.length; s++) src[s] = ALPHA.indexOf(E.d[s]) / 63;
    var lum, cols, rows, cw, ch, w, h, mouse = null, born = 0, visible = true, timer = 0;

    // box-average the high-res grid down to the size that fits this screen
    var padL = 0, padT = 0;
    function build() {
      var cs = getComputedStyle(fig);
      padL = parseFloat(cs.paddingLeft) || 0; padT = parseFloat(cs.paddingTop) || 0;
      w = fig.clientWidth - padL - (parseFloat(cs.paddingRight) || 0);
      cols = Math.max(56, Math.min(E.c, Math.round(w / 5.8)));
      cw = w / cols; var fs = cw / GW; ch = fs * LH;
      rows = Math.max(1, Math.round(cols * (E.r / E.c)));
      h = rows * ch;
      fig.style.height = (h + padT + (parseFloat(cs.paddingBottom) || 0)) + 'px';
      lum = new Float32Array(cols * rows);
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var x0 = Math.floor(x * E.c / cols), x1 = Math.max(x0 + 1, Math.floor((x + 1) * E.c / cols));
          var y0 = Math.floor(y * E.r / rows), y1 = Math.max(y0 + 1, Math.floor((y + 1) * E.r / rows));
          var sum = 0, n = 0;
          for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) { sum += src[yy * E.c + xx]; n++; }
          lum[y * cols + x] = sum / n;
        }
      }
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = '500 ' + fs.toFixed(2) + 'px ' + MONO;
      ctx.textBaseline = 'top';
      draw(performance.now());
    }

    function draw(now) {
      var dk = true, n = RAMP.length - 1, t = (now - born) / 1000, tick = (now / 90) | 0;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#e9e9e9';
      var R = 7, mx = mouse ? mouse.x / cw : -99, my = mouse ? mouse.y / ch : -99;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var L = lum[y * cols + x];
          var v = dk ? Math.pow(L, 1.5) : Math.pow(1 - L, 1.1);
          var idx = Math.round(v * n);
          var g = RAMP[idx], a = 0.16 + 0.84 * v;
          // decode-in from the left on first paint
          var reveal = (x / cols) * 1.1 + (y / rows) * 0.15;
          if (!reduce && t < reveal) { if (t < reveal - 0.25) continue; g = (x + y + tick) & 1 ? '1' : '0'; a = 0.5; }
          // binary lens under the pointer
          if (mouse) {
            var dx = x - mx, dy = (y - my) * 1.8, d = Math.sqrt(dx * dx + dy * dy);
            if (d < R) { g = ((x * 7 + y * 3 + tick) % 3) ? '1' : '0'; a = Math.max(a, 0.35 + 0.65 * (1 - d / R)); }
          }
          if (idx < 1 && g === RAMP[idx]) continue;
          ctx.globalAlpha = a;
          ctx.fillText(g, x * cw, y * ch);
        }
      }
      ctx.globalAlpha = 1;
    }

    var tc = document.getElementById('vf-tc'), bits = document.getElementById('vf-bits'), focus = document.getElementById('vf-focus');
    function hud(now) {
      var s = (now - born) / 1000, f = Math.floor((s % 1) * 24), sec = Math.floor(s);
      function p2(v) { return (v < 10 ? '0' : '') + v; }
      if (tc) tc.textContent = p2(Math.floor(sec / 3600)) + ':' + p2(Math.floor(sec / 60) % 60) + ':' + p2(sec % 60) + ':' + p2(f);
      if (bits) { var b = (sec & 255).toString(2); bits.textContent = '00000000'.slice(b.length) + b + ' ' + ((f * 10) & 255).toString(2).padStart(8, '0'); }
    }
    function moveFocus() {
      if (!focus) return;
      var fx = mouse ? mouse.x : w * 0.5, fy = mouse ? mouse.y : h * 0.5;
      focus.style.transform = 'translate(' + (fx + padL - 22).toFixed(0) + 'px,' + (fy + padT - 16).toFixed(0) + 'px)';
      focus.classList.toggle('lock', !!mouse);
    }
    function loop() {
      hud(performance.now()); moveFocus();
      if (!visible || reduce) { timer = 0; return; }
      var t = (performance.now() - born) / 1000;
      draw(performance.now());
      // fast while decoding or hovering, otherwise a calm idle shimmer
      timer = setTimeout(loop, t < 1.6 || mouse ? 45 : 120);
    }
    function kick() { clearTimeout(timer); timer = 0; loop(); }

    fig.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; kick(); });
    fig.addEventListener('pointerleave', function () { mouse = null; kick(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(fig);

    born = performance.now();
    build(); kick();
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
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'], ' ': ['..', '..', '..', '..', '..']
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
