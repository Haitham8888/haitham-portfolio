/* Orbit map — a calm, technical chart (not decoration):
   an ASCII astronaut holding the Saudi flag at the centre, and the things I build with
   moving along real elliptical orbits, passing in front of and behind him.
   Products are monochrome until hovered. Pauses off-screen; static for reduced motion. */
(function () {
  'use strict';
  var root = document.getElementById('space');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IC = window.ICONS || {};
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var RAMP = " .:-=+*o#%@";

  // orbit: 0 inner (stack) · 1 middle (products) · 2 outer (practice)
  var ITEMS = [
    { o: 1, a: 0.2, kind: 'img', src: 'img/logos/maysour.webp', label: 'maysour', href: 'https://maysour.com.sa/' },
    { o: 1, a: 1.25, kind: 'img', src: 'img/logos/hayyiz.svg', label: 'hayyiz', href: 'https://hayyizapp.com/' },
    { o: 1, a: 2.3, kind: 'img', src: 'img/logos/gcare.svg', label: 'g-care', href: 'https://gcare.sa/' },
    { o: 1, a: 3.35, kind: 'img', src: 'img/MNBET.png', label: 'mnbet', href: 'https://github.com/Haitham8888/MNBET' },
    { o: 1, a: 4.4, kind: 'img', src: 'img/Sanka.png', label: 'sanka', href: 'https://github.com/Haitham8888/SANKA_Ai' },
    { o: 1, a: 5.45, kind: 'img', src: 'img/Waselani.png', label: 'waselani', href: 'https://github.com/Haitham8888/Waselani' },
    { o: 0, a: 0.0, kind: 'ico', key: 'nvidia' },
    { o: 0, a: 0.8, kind: 'ico', key: 'redhat', label: 'rhel' },
    { o: 0, a: 1.6, kind: 'ico', key: 'linux' },
    { o: 0, a: 2.4, kind: 'ico', key: 'pytorch' },
    { o: 0, a: 3.2, kind: 'ico', key: 'huggingface', label: 'hf' },
    { o: 0, a: 4.0, kind: 'ico', key: 'kubernetes', label: 'k8s' },
    { o: 0, a: 4.8, kind: 'ico', key: 'python' },
    { o: 0, a: 5.6, kind: 'ico', key: 'docker' },
    { o: 2, a: 0.5, kind: 'txt', text: 'LLM' },
    { o: 2, a: 1.55, kind: 'txt', text: 'RAG' },
    { o: 2, a: 2.6, kind: 'txt', text: 'H200' },
    { o: 2, a: 3.65, kind: 'txt', text: 'MLOps' },
    { o: 2, a: 4.7, kind: 'txt', text: 'MCP' },
    { o: 2, a: 5.75, kind: 'txt', text: 'GenAI' }
  ];
  var ORB = [ { r: 0.25, w: 0.055 }, { r: 0.36, w: 0.034 }, { r: 0.46, w: 0.022 } ]; // radius (of width), angular speed rad/s
  var TILT = 0.42;

  root.innerHTML =
    '<canvas class="om-chart" aria-hidden="true"></canvas>' +
    '<div class="om-astro" aria-hidden="true"><canvas></canvas><img class="om-flag" src="img/logos/saudi-flag.svg" alt="" /></div>' +
    '<div class="om-items"></div>' +
    '<div class="om-head" aria-hidden="true"><span>ORBIT MAP · HH-01</span><span id="om-t">T+00:00:00</span></div>' +
    '<div class="om-legend" aria-hidden="true"><span><i class="l0"></i>stack</span><span><i class="l1"></i>shipped</span><span><i class="l2"></i>practice</span></div>' +
    '<div class="om-ground"><img src="img/logos/jazan-university.png" alt="Jazan University" width="26" height="33" />' +
    '<span><b data-i="space.grad">Jazan University · B.Sc. IT (ML) · 2025</b><em>origin · jazan 16.89°N 42.55°E · khawlani coffee · al-ful</em></span></div>';

  var chart = root.querySelector('.om-chart'), cctx = chart.getContext('2d');
  var astroBox = root.querySelector('.om-astro'), acan = astroBox.querySelector('canvas'), actx = acan.getContext('2d');
  var wrap = root.querySelector('.om-items'), tEl = root.querySelector('#om-t');
  var W = 0, H = 0, dpr = 1, paused = null, visible = true, t0 = performance.now(), stars = [];

  var nodes = ITEMS.map(function (it) {
    var el = document.createElement(it.href ? 'a' : 'span');
    el.className = 'om-item om-' + it.kind + ' o' + it.o;
    if (it.href) { el.href = it.href; el.target = '_blank'; el.rel = 'noopener'; }
    var label = it.label || (it.key && IC[it.key] && IC[it.key].n.toLowerCase()) || it.text;
    el.setAttribute('aria-label', label);
    if (it.kind === 'img') el.innerHTML = '<span class="om-dot"><img src="' + it.src + '" alt="" loading="lazy" /></span>';
    else if (it.kind === 'ico') { var ic = IC[it.key]; el.style.setProperty('--brand', ic ? ic.hex : '#fff'); el.innerHTML = '<span class="om-dot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ic ? ic.d : '') + '"/></svg></span>'; }
    else el.innerHTML = '<span class="om-dot om-tick"></span>';
    el.insertAdjacentHTML('beforeend', '<span class="om-lab">' + label + '</span>');
    el.addEventListener('mouseenter', function () { paused = it; el.classList.add('hot'); });
    el.addEventListener('mouseleave', function () { paused = null; el.classList.remove('hot'); });
    wrap.appendChild(el);
    return { it: it, el: el, a: it.a };
  });

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth; H = root.clientHeight;
    chart.width = W * dpr; chart.height = H * dpr; chart.style.width = W + 'px'; chart.style.height = H + 'px';
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.round(W * H / 5200), seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < n; i++) stars.push([rnd() * W, rnd() * H, rnd()]);
    drawAstro();
  }

  // the chart: faint grid, scale ticks and the three orbit ellipses
  function drawChart() {
    var cx = W / 2, cy = H * 0.5;
    cctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) { var s = stars[i]; cctx.fillStyle = 'rgba(255,255,255,' + (0.12 + s[2] * 0.35).toFixed(2) + ')'; cctx.fillRect(s[0], s[1], s[2] > 0.85 ? 1.4 : 0.8, s[2] > 0.85 ? 1.4 : 0.8); }
    cctx.strokeStyle = 'rgba(255,255,255,0.045)'; cctx.lineWidth = 1;
    cctx.beginPath(); cctx.moveTo(cx, 34); cctx.lineTo(cx, H - 60); cctx.moveTo(18, cy); cctx.lineTo(W - 18, cy); cctx.stroke();
    ORB.forEach(function (o, k) {
      var rx = o.r * W, ry = rx * TILT;
      cctx.setLineDash(k === 2 ? [2, 5] : []);
      cctx.strokeStyle = 'rgba(255,255,255,' + (k === 1 ? 0.16 : 0.1) + ')';
      cctx.beginPath(); cctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); cctx.stroke();
      // tick marks every 30°
      cctx.setLineDash([]);
      for (var d = 0; d < 12; d++) {
        var a = d / 12 * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
        cctx.fillStyle = 'rgba(255,255,255,0.18)'; cctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5);
      }
    });
    cctx.font = '400 9px ' + MONO; cctx.fillStyle = 'rgba(255,255,255,0.28)';
    cctx.fillText('0°', cx + ORB[2].r * W - 16, cy - 6);
    cctx.fillText('180°', cx - ORB[2].r * W + 4, cy - 6);
  }

  // astronaut: an original drawing rasterised to glyphs, same language as the eye strip
  function drawAstro() {
    var bw = Math.min(W * 0.4, 230), bh = bw * 260 / 220;
    astroBox.style.width = bw + 'px'; astroBox.style.height = bh + 'px';
    var img = new Image();
    img.onload = function () {
      var cols = Math.round(bw / 3.5), fs = bw / cols / 0.6, chh = fs * 1.02, rows = Math.round(bh / chh);
      var off = document.createElement('canvas'); off.width = cols; off.height = rows;
      var o = off.getContext('2d', { willReadFrequently: true }); o.drawImage(img, 0, 0, cols, rows);
      var d = o.getImageData(0, 0, cols, rows).data;
      acan.width = bw * dpr; acan.height = bh * dpr; acan.style.width = bw + 'px'; acan.style.height = bh + 'px';
      actx.setTransform(dpr, 0, 0, dpr, 0, 0); actx.font = '600 ' + fs.toFixed(1) + 'px ' + MONO; actx.textBaseline = 'top';
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var p = (y * cols + x) * 4, al = d[p + 3] / 255; if (al < 0.25) continue;
        var L = (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) / 255;
        var idx = Math.round(L * (RAMP.length - 1)); if (idx < 1) continue;
        var green = d[p + 1] > 170 && d[p] < 140; // chest lights stay as accents
        actx.fillStyle = green ? 'rgba(74,222,128,0.95)' : 'rgba(235,235,235,' + (0.35 + 0.65 * L).toFixed(2) + ')';
        actx.fillText(RAMP[idx], x * (bw / cols), y * chh);
      }
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(astroSVG());
  }

  function place(n, ang) {
    var o = ORB[n.it.o], rx = o.r * W, ry = rx * TILT, cx = W / 2, cy = H * 0.5;
    var x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry, front = Math.sin(ang) > -0.05;
    var depth = 0.5 + 0.5 * Math.sin(ang); // 0 = far, 1 = near
    var sc = 0.82 + 0.22 * depth;
    n.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
    n.el.style.zIndex = front ? 20 + Math.round(depth * 10) : 2;
    n.el.style.opacity = (front ? 0.78 + 0.22 * depth : 0.32 + 0.3 * depth).toFixed(2);
    n.el.classList.toggle('far', !front);
  }

  function frame(now) {
    if (!visible) return;
    var dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    if (!paused && !reduce) nodes.forEach(function (n) { n.a += ORB[n.it.o].w * dt; });
    drawChart();
    nodes.forEach(function (n) { place(n, n.a); });
    var s = Math.floor((now - t0) / 1000);
    tEl.textContent = 'T+' + [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (v) { return (v < 10 ? '0' : '') + v; }).join(':');
    if (!reduce) requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var was = visible; visible = es[0].isIntersecting; if (visible && !was) { frame.last = 0; requestAnimationFrame(frame); }
  }).observe(root);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); frame(performance.now()); }, 150); });
  size();
  requestAnimationFrame(frame);

  function astroSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260">' +
      '<line x1="162" y1="6" x2="162" y2="150" stroke="#d6d6d6" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="62" y="96" width="96" height="92" rx="16" fill="#9a9a9a"/>' +
      '<rect x="78" y="176" width="28" height="56" rx="12" fill="#e9e9e9"/><rect x="114" y="176" width="28" height="56" rx="12" fill="#e9e9e9"/>' +
      '<rect x="74" y="222" width="36" height="18" rx="8" fill="#8a8a8a"/><rect x="110" y="222" width="36" height="18" rx="8" fill="#8a8a8a"/>' +
      '<rect x="70" y="104" width="80" height="84" rx="22" fill="#f2f2f2"/>' +
      '<rect x="88" y="128" width="44" height="28" rx="6" fill="#6a6a6a"/>' +
      '<rect x="94" y="134" width="8" height="8" fill="#22e07a"/><rect x="106" y="134" width="8" height="8" fill="#22e07a"/>' +
      '<path d="M74 118 Q50 132 52 160" fill="none" stroke="#e2e2e2" stroke-width="18" stroke-linecap="round"/>' +
      '<circle cx="52" cy="164" r="10" fill="#8a8a8a"/>' +
      '<path d="M146 118 Q164 110 160 84" fill="none" stroke="#e2e2e2" stroke-width="18" stroke-linecap="round"/>' +
      '<circle cx="161" cy="80" r="10" fill="#8a8a8a"/>' +
      '<circle cx="110" cy="66" r="46" fill="#f4f4f4"/>' +
      '<rect x="76" y="42" width="68" height="46" rx="21" fill="#0a0a0a"/>' +
      '<path d="M86 54 Q96 46 110 47" fill="none" stroke="#bdbdbd" stroke-width="5" stroke-linecap="round"/>' +
      '</svg>';
  }
})();
