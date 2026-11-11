/* Saudi Arabia in ASCII: the 13 regions, their borders and names, alive and interactive.
   - every cell is a binary digit; region borders and the coast are contour glyphs ( | - + )
   - it is born like the Yurei rose: it grows outward from Jazan (where Al-Haitham is from), cell by cell,
     then the names appear, then the road to Riyadh (where he builds) draws itself
   - hover / tap a region: it lights up, its capital appears, the panel tells its name in three languages
   - click: pins the region and sends a ripple of digits across the map; chips below do the same by keyboard / touch
   - names follow the page language (ar / en / zh) and the theme
   Boundaries (c) OpenStreetMap contributors via geoBoundaries (ODbL). */
(function () {
  'use strict';
  var fig = document.getElementById('ksa');
  if (!fig || !window.KSA) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  function lang() { var l = document.documentElement.lang; return ['ar', 'en', 'zh'].indexOf(l) < 0 ? 'en' : l; }
  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

  var INFO = {
    'SA-01': { n: { en: 'Riyadh', ar: 'الرياض', zh: '利雅得' }, cap: { en: 'Riyadh', ar: 'الرياض', zh: '利雅得' }, cc: [46.72, 24.69], note: { en: 'Where I build — AI engineering at MDS.', ar: 'هنا أبني — هندسة الذكاء الاصطناعي في MDS.', zh: '我工作的地方——在 MDS 从事人工智能工程。' } },
    'SA-02': { n: { en: 'Makkah', ar: 'مكة المكرمة', zh: '麦加' }, cap: { en: 'Makkah', ar: 'مكة المكرمة', zh: '麦加' }, cc: [39.83, 21.42] },
    'SA-03': { n: { en: 'Madinah', ar: 'المدينة المنورة', zh: '麦地那' }, cap: { en: 'Madinah', ar: 'المدينة المنورة', zh: '麦地那' }, cc: [39.61, 24.47] },
    'SA-04': { n: { en: 'Eastern Province', ar: 'المنطقة الشرقية', zh: '东部省' }, cap: { en: 'Dammam', ar: 'الدمام', zh: '达曼' }, cc: [50.10, 26.43] },
    'SA-05': { n: { en: 'Qassim', ar: 'القصيم', zh: '盖西姆' }, cap: { en: 'Buraydah', ar: 'بريدة', zh: '布赖代' }, cc: [43.97, 26.33] },
    'SA-06': { n: { en: 'Hail', ar: 'حائل', zh: '哈伊勒' }, cap: { en: 'Hail', ar: 'حائل', zh: '哈伊勒' }, cc: [41.69, 27.52] },
    'SA-07': { n: { en: 'Tabuk', ar: 'تبوك', zh: '塔布克' }, cap: { en: 'Tabuk', ar: 'تبوك', zh: '塔布克' }, cc: [36.57, 28.38] },
    'SA-08': { n: { en: 'Northern Borders', ar: 'الحدود الشمالية', zh: '北部边疆' }, cap: { en: 'Arar', ar: 'عرعر', zh: '阿尔阿尔' }, cc: [41.02, 30.98] },
    'SA-09': { n: { en: 'Jazan', ar: 'جازان', zh: '吉赞' }, cap: { en: 'Jazan', ar: 'جازان', zh: '吉赞' }, cc: [42.57, 16.89], note: { en: 'Where I come from — Khawlani coffee and Al-Ful jasmine.', ar: 'منها أنا — أرض البن الخولاني وزهرة الفل.', zh: '我的家乡——Khawlani 咖啡与茉莉花之乡。' } },
    'SA-10': { n: { en: 'Najran', ar: 'نجران', zh: '奈季兰' }, cap: { en: 'Najran', ar: 'نجران', zh: '奈季兰' }, cc: [44.13, 17.49] },
    'SA-11': { n: { en: 'Al-Bahah', ar: 'الباحة', zh: '巴哈' }, cap: { en: 'Al-Bahah', ar: 'الباحة', zh: '巴哈' }, cc: [41.47, 20.01] },
    'SA-12': { n: { en: 'Al-Jawf', ar: 'الجوف', zh: '焦夫' }, cap: { en: 'Sakaka', ar: 'سكاكا', zh: '塞卡凯' }, cc: [40.20, 29.97] },
    'SA-14': { n: { en: 'Asir', ar: 'عسير', zh: '阿西尔' }, cap: { en: 'Abha', ar: 'أبها', zh: '艾卜哈' }, cc: [42.50, 18.22] }
  };
  var UI = {
    en: { cap: 'capital', hint: 'Hover or tap a region · click to pin · click the sea to grow it again', all: 'Kingdom of Saudi Arabia — 13 regions', route: 'Jazan → Riyadh' },
    ar: { cap: 'العاصمة الإدارية', hint: 'مرّر أو اضغط على منطقة · اضغط للتثبيت · اضغط على البحر لتنمو الخريطة من جديد', all: 'المملكة العربية السعودية — 13 منطقة', route: 'جازان ← الرياض' },
    zh: { cap: '首府', hint: '悬停或点击某个地区 · 点击可固定 · 点击海面让地图重新生长', all: '沙特阿拉伯王国 — 13 个地区', route: '吉赞 → 利雅得' }
  };
  // label nudges (degrees) for small or coastal regions, so every name stays readable
  var NUDGE = { 'SA-09': [-1.9, -0.55], 'SA-11': [-1.75, -0.35], 'SA-10': [0.5, -0.1], 'SA-14': [0.55, 0.25], 'SA-05': [0.15, 0.1], 'SA-02': [-0.55, 0.45], 'SA-04': [0.2, 0.9], 'SA-08': [0.6, 0.15] };
  var R = window.KSA.regions, HOME = -1, WORK = -1;
  R.forEach(function (r, i) { r.info = INFO[r.id]; if (r.id === 'SA-09') HOME = i; if (r.id === 'SA-01') WORK = i; });

  fig.innerHTML = '<canvas role="img" aria-label="ASCII map of Saudi Arabia with its 13 regions"></canvas>' +
    '<div class="ksa-panel" aria-live="polite"><b class="ksa-name"></b><span class="ksa-alt"></span><span class="ksa-cap"></span><span class="ksa-note"></span></div>' +
    '<ul class="ksa-chips" role="list"></ul>' +
    '<figcaption><span class="ksa-hint"></span><span class="ksa-src" dir="ltr">boundaries © OpenStreetMap contributors</span></figcaption>';
  var canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
  var panel = fig.querySelector('.ksa-panel'), chips = fig.querySelector('.ksa-chips');
  var base = document.createElement('canvas'), bctx = base.getContext('2d');

  var LON0 = 34.2, LON1 = 56.0, LAT0 = 16.0, LAT1 = 32.5, KX = Math.cos(24.3 * Math.PI / 180);
  var W = 0, H = 0, cols = 0, rows = 0, cw = 0, ch = 0, fs = 10, dpr = 1;
  var reg, edge, delay, hsh, maxDelay = 1;
  var hover = -1, pin = -1, born = -1, visible = false, baseKey = '', ripples = [], twinkle = [];

  function lonX(lon) { return (lon - LON0) / (LON1 - LON0) * W; }
  function latY(lat) { return (LAT1 - lat) / (LAT1 - LAT0) * H; }
  function inRing(x, y, ring) {
    var c = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = fig.clientWidth;
    cols = Math.max(58, Math.min(150, Math.round(W / 6.4)));
    cw = W / cols; fs = cw / 0.6; ch = fs * 1.02;
    H = W * ((LAT1 - LAT0) / ((LON1 - LON0) * KX));
    rows = Math.round(H / ch); H = rows * ch;
    [canvas, base].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    reg = new Int8Array(cols * rows); edge = new Uint8Array(cols * rows); delay = new Float32Array(cols * rows); hsh = new Uint16Array(cols * rows);
    var bb = R.map(function (r) { var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; r.p.forEach(function (rg) { rg.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); }); return [x0, x1, y0, y1]; });
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var lon = LON0 + (x + 0.5) / cols * (LON1 - LON0), lat = LAT1 - (y + 0.5) / rows * (LAT1 - LAT0), k = y * cols + x, hit = -1;
      for (var i = 0; i < R.length && hit < 0; i++) {
        var b = bb[i]; if (lon < b[0] || lon > b[1] || lat < b[2] || lat > b[3]) continue;
        for (var q = 0; q < R[i].p.length; q++) if (inRing(lon, lat, R[i].p[q])) { hit = i; break; }
      }
      reg[k] = hit; hsh[k] = ((x * 73856093) ^ (y * 19349663)) & 0xffff;
    }
    // borders: 1 = vertical stroke, 2 = horizontal stroke, 3 = corner; +4 when it is the coast / outer border
    var hc = R[HOME].info.cc, hx = (hc[0] - LON0) / (LON1 - LON0) * cols, hy = (LAT1 - hc[1]) / (LAT1 - LAT0) * rows; maxDelay = 1;
    for (var y2 = 0; y2 < rows; y2++) for (var x2 = 0; x2 < cols; x2++) {
      var k2 = y2 * cols + x2, me = reg[k2]; if (me < 0) continue;
      var l = x2 > 0 ? reg[k2 - 1] : -1, r = x2 < cols - 1 ? reg[k2 + 1] : -1, u = y2 > 0 ? reg[k2 - cols] : -1, d = y2 < rows - 1 ? reg[k2 + cols] : -1;
      var dh = (r !== me) || (l !== me && l < 0), dv = (d !== me) || (u !== me && u < 0);
      var e = dh && dv ? 3 : dh ? 1 : dv ? 2 : 0;
      if (e && (l < 0 || r < 0 || u < 0 || d < 0)) e += 4;
      edge[k2] = e;
      var dd = Math.hypot(x2 - hx, (y2 - hy) * 1.7); delay[k2] = dd; if (dd > maxDelay) maxDelay = dd;
    }
    baseKey = ''; frame(performance.now());
  }

  var EG = ['', '|', '-', '+'];
  function paintBase(dk, hi, pn) {
    bctx.clearRect(0, 0, W, H);
    bctx.font = '700 ' + fs.toFixed(2) + 'px ' + MONO; bctx.textBaseline = 'top';
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var k = y * cols + x, me = reg[k]; if (me < 0) continue;
      var e = edge[k], lit = me === hi || me === pn, mine = me === HOME || me === WORK;
      var g, col;
      if (e) {
        g = EG[e & 3];
        col = lit ? (dk ? '#ffffff' : '#052e16') : (e & 4) ? (dk ? 'rgba(235,235,235,0.9)' : 'rgba(20,20,20,0.9)') : (dk ? 'rgba(200,205,210,0.55)' : 'rgba(40,40,40,0.55)');
      } else {
        g = (hsh[k] & 1) ? '1' : '0';
        var v = ((hsh[k] >> 3) & 3) / 3;
        if (lit) col = dk ? 'rgba(74,222,128,' + (0.7 + 0.3 * v).toFixed(2) + ')' : 'rgba(21,128,61,' + (0.75 + 0.25 * v).toFixed(2) + ')';
        else if (mine) col = dk ? 'rgba(74,222,128,' + (0.3 + 0.2 * v).toFixed(2) + ')' : 'rgba(21,128,61,' + (0.4 + 0.2 * v).toFixed(2) + ')';
        else col = dk ? 'rgba(170,176,184,' + (0.16 + 0.14 * v).toFixed(2) + ')' : 'rgba(40,44,50,' + (0.2 + 0.16 * v).toFixed(2) + ')';
      }
      bctx.fillStyle = col; bctx.fillText(g, x * cw, y * ch);
    }
  }

  function label(i, a, dk, strong) {
    var r = R[i], nd = NUDGE[r.id] || [0, 0], lx = lonX(r.c[0] + nd[0]), ly = latY(r.c[1] + nd[1]);
    var L = lang(), txt = r.info.n[L], size = Math.max(9.5, Math.min(13.5, W / 62)) * (strong ? 1.12 : 1);
    ctx.font = (strong ? '700 ' : '500 ') + size.toFixed(1) + 'px ' + (L === 'ar' ? '"Cairo", "Segoe UI", sans-serif' : L === 'zh' ? '"PingFang SC", "Microsoft YaHei", sans-serif' : '"Inter", "Geist", "Segoe UI", sans-serif');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = L === 'ar' ? 'rtl' : 'ltr';
    var tw = ctx.measureText(txt).width, px = 5, bh = size + 6;
    lx = Math.max(tw / 2 + px + 2, Math.min(W - tw / 2 - px - 2, lx));
    if (nd[0] || nd[1]) {           // a thin leader back to the region
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = dk ? '#9ca3af' : '#4b5563'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lonX(r.c[0]), latY(r.c[1])); ctx.stroke();
    }
    ctx.globalAlpha = a * (strong ? 0.96 : 0.82); ctx.fillStyle = dk ? '#050505' : '#ffffff';
    ctx.fillRect(lx - tw / 2 - px, ly - bh / 2, tw + px * 2, bh);
    if (strong) { ctx.strokeStyle = dk ? '#4ade80' : '#15803d'; ctx.lineWidth = 1; ctx.globalAlpha = a; ctx.strokeRect(lx - tw / 2 - px + 0.5, ly - bh / 2 + 0.5, tw + px * 2 - 1, bh - 1); }
    ctx.globalAlpha = a; ctx.fillStyle = strong ? (dk ? '#4ade80' : '#15803d') : (dk ? '#ededed' : '#111111');
    ctx.fillText(txt, lx, ly + 0.5);
    ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
  }

  function frame(now) {
    if (!reg) return;
    var dk = dark(), t = born < 0 ? (reduce ? 99 : -1) : (now - born) / 1000, tt = now / 1000;
    var GROW = 2.4, grow = reduce ? 1e9 : (t / GROW) * maxDelay * 1.05, grown = t > GROW;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '700 ' + fs.toFixed(2) + 'px ' + MONO; ctx.textBaseline = 'top';
    if (grown) {
      var key = (dk ? 'd' : 'l') + hover + '|' + pin + '|' + W;
      if (key !== baseKey) { paintBase(dk, hover, pin); baseKey = key; }
      ctx.drawImage(base, 0, 0, W, H);
    } else if (t >= 0) {
      // growing outward from Jazan: the front flickers in bright live binary
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var k = y * cols + x, me = reg[k]; if (me < 0) continue;
        var dl = delay[k]; if (dl > grow) continue;
        var front = grow - dl < 2.2, e = edge[k];
        if (front) { ctx.fillStyle = dk ? '#4ade80' : '#15803d'; ctx.globalAlpha = 0.95; ctx.fillText(Math.random() < 0.5 ? '0' : '1', x * cw, y * ch); continue; }
        ctx.globalAlpha = 1;
        if (e) { ctx.fillStyle = (e & 4) ? (dk ? 'rgba(235,235,235,0.9)' : 'rgba(20,20,20,0.9)') : (dk ? 'rgba(200,205,210,0.55)' : 'rgba(40,40,40,0.55)'); ctx.fillText(EG[e & 3], x * cw, y * ch); }
        else { var mine = me === HOME || me === WORK; ctx.fillStyle = mine ? (dk ? 'rgba(74,222,128,0.42)' : 'rgba(21,128,61,0.5)') : (dk ? 'rgba(170,176,184,0.24)' : 'rgba(40,44,50,0.28)'); ctx.fillText((hsh[k] & 1) ? '1' : '0', x * cw, y * ch); }
      }
      ctx.globalAlpha = 1;
    }
    if (t < 0) return;
    // ripples of digits from a click
    for (var i = ripples.length - 1; i >= 0; i--) {
      var rp = ripples[i], age = tt - rp.t, rad = age * 46; if (age > 1.6) { ripples.splice(i, 1); continue; }
      ctx.fillStyle = dk ? '#4ade80' : '#15803d';
      var steps = Math.max(12, Math.round(rad * 3.2));
      for (var s = 0; s < steps; s++) {
        var an = s / steps * Math.PI * 2, gx = Math.round(rp.x + Math.cos(an) * rad), gy = Math.round(rp.y + Math.sin(an) * rad / 1.7);
        if (gx < 0 || gy < 0 || gx >= cols || gy >= rows || reg[gy * cols + gx] < 0) continue;
        ctx.globalAlpha = (1 - age / 1.6) * 0.9; ctx.fillText((s + (tt * 20 | 0)) & 1 ? '1' : '0', gx * cw, gy * ch);
      }
      ctx.globalAlpha = 1;
    }
    if (!reduce && grown) {
      if (Math.random() < 0.3) { var tk = (Math.random() * cols * rows) | 0; if (reg[tk] >= 0 && !edge[tk]) twinkle.push({ k: tk, t: tt }); }
      ctx.fillStyle = dk ? '#ffffff' : '#111111';
      for (var j = twinkle.length - 1; j >= 0; j--) { var tw = twinkle[j], ag = tt - tw.t; if (ag > 0.7) { twinkle.splice(j, 1); continue; } ctx.globalAlpha = Math.sin(Math.PI * ag / 0.7) * 0.8; ctx.fillText((hsh[tw.k] & 1) ? '1' : '0', (tw.k % cols) * cw, ((tw.k / cols) | 0) * ch); }
      ctx.globalAlpha = 1;
    }
    // names
    var la = reduce ? 1 : Math.max(0, Math.min(1, (t - GROW - 0.1) / 0.6));
    if (la > 0) {
      for (var n = 0; n < R.length; n++) if (n !== hover && n !== pin) label(n, la, dk, false);
      if (pin >= 0) label(pin, la, dk, true);
      if (hover >= 0 && hover !== pin) label(hover, la, dk, true);
    }
    // the road: Jazan -> Riyadh, an arc of digits with a head that keeps travelling
    var ra = reduce ? 1 : Math.max(0, Math.min(1, (t - GROW - 0.6) / 1.4));
    if (ra > 0) {
      var a = R[HOME].info.cc, b = R[WORK].info.cc, ax = lonX(a[0]), ay = latY(a[1]), bx = lonX(b[0]), by = latY(b[1]);
      var mx = (ax + bx) / 2 - (by - ay) * 0.22, my = (ay + by) / 2 + (bx - ax) * 0.22 - H * 0.02, N = 34;
      ctx.font = '800 ' + (fs * 1.15).toFixed(1) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var head = reduce ? 1 : ((tt * 0.22) % 1);
      for (var q = 0; q <= N * ra; q++) {
        var u = q / N, px2 = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, py2 = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by;
        var near = Math.abs(u - head) < 0.05 && ra >= 1;
        ctx.globalAlpha = near ? 1 : 0.75; ctx.fillStyle = near ? (dk ? '#ffffff' : '#052e16') : (dk ? '#4ade80' : '#15803d');
        ctx.fillText(near ? '*' : (q & 1 ? '1' : '0'), px2, py2);
      }
      // the two cities pulse
      [[ax, ay], [bx, by]].forEach(function (c, ci) {
        var pulse = reduce ? 0.5 : (tt * 0.9 + ci * 0.5) % 1;
        ctx.globalAlpha = (1 - pulse) * 0.8; ctx.strokeStyle = dk ? '#4ade80' : '#15803d'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(c[0], c[1], 3 + pulse * 11, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = dk ? '#ffffff' : '#052e16'; ctx.fillText('@', c[0], c[1]);
      });
      ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    }
    // capital of the region in focus
    var fz = hover >= 0 ? hover : pin;
    if (fz >= 0 && la > 0 && fz !== HOME && fz !== WORK) {
      var cc = R[fz].info.cc, cx2 = lonX(cc[0]), cy2 = latY(cc[1]);
      ctx.font = '800 ' + (fs * 1.2).toFixed(1) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = dk ? '#ffffff' : '#052e16'; ctx.fillText('o', cx2, cy2);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    }
  }

  // ---------- panel + chips ----------
  function fill() {
    var L = lang(), u = UI[L], i = hover >= 0 ? hover : pin;
    fig.querySelector('.ksa-hint').textContent = u.hint;
    if (i < 0) {
      panel.querySelector('.ksa-name').textContent = u.all;
      panel.querySelector('.ksa-alt').textContent = '';
      panel.querySelector('.ksa-cap').textContent = u.route;
      panel.querySelector('.ksa-note').textContent = '';
    } else {
      var inf = R[i].info, others = ['ar', 'en', 'zh'].filter(function (x) { return x !== L; }).map(function (x) { return inf.n[x]; }).join(' · ');
      panel.querySelector('.ksa-name').textContent = inf.n[L];
      panel.querySelector('.ksa-alt').textContent = others;
      panel.querySelector('.ksa-cap').textContent = u.cap + ': ' + inf.cap[L];
      panel.querySelector('.ksa-note').textContent = inf.note ? inf.note[L] : '';
    }
    [].forEach.call(chips.children, function (li, k) { li.firstChild.classList.toggle('on', k === pin || k === hover); li.firstChild.textContent = R[k].info.n[L]; li.firstChild.setAttribute('aria-pressed', k === pin ? 'true' : 'false'); });
  }
  R.forEach(function (r, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.className = 'ksa-chip'; li.appendChild(b); chips.appendChild(li);
    b.addEventListener('mouseenter', function () { hover = i; fill(); kick(); });
    b.addEventListener('mouseleave', function () { hover = -1; fill(); kick(); });
    b.addEventListener('focus', function () { hover = i; fill(); kick(); });
    b.addEventListener('blur', function () { hover = -1; fill(); kick(); });
    b.addEventListener('click', function () { pin = pin === i ? -1 : i; ripple(lonX(r.c[0]) / cw, latY(r.c[1]) / ch); fill(); kick(); });
  });

  function cellAt(e) { var r = canvas.getBoundingClientRect(); return { x: Math.floor((e.clientX - r.left) / cw), y: Math.floor((e.clientY - r.top) / ch) }; }
  function regAt(c) { return c.x < 0 || c.y < 0 || c.x >= cols || c.y >= rows ? -1 : reg[c.y * cols + c.x]; }
  function ripple(x, y) { if (!reduce) ripples.push({ x: x, y: y, t: performance.now() / 1000 }); }
  canvas.addEventListener('pointermove', function (e) { var h = regAt(cellAt(e)); if (h !== hover) { hover = h; canvas.style.cursor = h >= 0 ? 'pointer' : 'default'; fill(); kick(); } });
  canvas.addEventListener('pointerleave', function () { if (hover !== -1) { hover = -1; fill(); kick(); } });
  canvas.addEventListener('click', function (e) {
    var c = cellAt(e), h = regAt(c);
    if (h < 0) { pin = -1; born = performance.now(); ripples = []; }     // the sea: grow it again
    else { pin = pin === h ? -1 : h; ripple(c.x, c.y); }
    fill(); kick();
  });

  // ---------- loop ----------
  var running = false, last = 0;
  function loop(now) {
    if (!visible) { running = false; return; }
    if (now - last > 40) { last = now; frame(now); }
    if (!reduce) requestAnimationFrame(loop); else running = false;
  }
  function kick() { if (reduce) { frame(performance.now()); return; } if (!running) { running = true; requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible && born < 0) born = performance.now();
    if (visible) kick();
  }, { threshold: 0.25 }).observe(fig);
  else { visible = true; born = performance.now(); }
  new MutationObserver(function () { baseKey = ''; fill(); kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  build(); fill();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { build(); });
  window.KSAMAP = { replay: function () { born = performance.now(); kick(); }, state: function () { return { hover: hover, pin: pin, cols: cols, rows: rows }; } };
})();
